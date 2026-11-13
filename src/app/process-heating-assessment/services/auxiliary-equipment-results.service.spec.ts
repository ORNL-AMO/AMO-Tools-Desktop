import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CalculatorSuiteApiService } from '../../tools-suite-api/calculator-suite-api.service';
import { AuxiliaryEquipmentItem } from '../../shared/models/phast/auxEquipment';
import { ElectricityReductionInput } from '../../shared/models/standalone';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../models/phast';
import { AuxiliaryEquipmentMeasurementMethod } from '../models/auxiliary-equipment';
import { ProcessHeatingAssessmentService } from './process-heating-assessment.service';
import { AuxiliaryEquipmentResultsService } from './auxiliary-equipment-results.service';
import { AuxiliaryEquipmentFormService } from '../auxiliary-equipment/auxiliary-equipment-form.service';

function item(id: string, power: number, overrides: Partial<AuxiliaryEquipmentItem> = {}): AuxiliaryEquipmentItem {
  return {
    id,
    name: `Equipment ${id}`,
    operatingHours: 1000,
    measurementMethod: AuxiliaryEquipmentMeasurementMethod.POWER_METER,
    multimeterData: { numberOfPhases: 3, supplyVoltage: 0, averageCurrent: 0, powerFactor: 0.85 },
    nameplateData: { ratedMotorPower: 0, variableSpeedMotor: false, operationalFrequency: 60, lineFrequency: 60, motorAndDriveEfficiency: 100, loadFactor: 100 },
    powerMeterData: { power },
    otherMethodData: { energy: 0 },
    units: 1,
    userSelectedHP: false,
    ...overrides,
  };
}

describe('AuxiliaryEquipmentResultsService', () => {
  let service: AuxiliaryEquipmentResultsService;
  let settings: WritableSignal<Partial<Settings>>;
  let scenarios: Record<string, WritableSignal<PHAST>>;
  let electricityReduction: jasmine.Spy;

  beforeEach(() => {
    settings = signal<Partial<Settings>>({ electricityCost: 0.1 });
    scenarios = {
      baseline: signal<PHAST>({ auxiliaryEquipment: [item('a', 10), item('b', 5)] }),
      mod1: signal<PHAST>({ auxiliaryEquipment: [item('a', 4)] }),
    };
    electricityReduction = jasmine.createSpy('electricityReduction').and.callFake((input: ElectricityReductionInput) => {
      const data = input.electricityReductionInputVec[0];
      const power = data.powerMeterData.power ?? data.nameplateData.ratedMotorPower;
      return { power, energyUse: power * data.operatingHours, energyCost: power * data.operatingHours * data.electricityCost };
    });

    TestBed.configureTestingModule({
      providers: [
        AuxiliaryEquipmentResultsService,
        AuxiliaryEquipmentFormService,
        {
          provide: ProcessHeatingAssessmentService,
          useValue: { settingsSignal: settings, scenarioPhastSignal: (scenario: string) => scenarios[scenario]() },
        },
        { provide: CalculatorSuiteApiService, useValue: { electricityReduction } },
      ],
    });
    service = TestBed.inject(AuxiliaryEquipmentResultsService);
  });

  it('returns each item and the totals, costed at the facility electricity cost', () => {
    const results = service.scenarioResults('baseline');

    expect(results.items.map(result => result.id)).toEqual(['a', 'b']);
    expect(results.items[0]).toEqual({ id: 'a', name: 'Equipment a', power: 10, energyUse: 10000, energyCost: 1000 });
    expect(results.totalPower).toBe(15);
    expect(results.totalEnergyUse).toBe(15000);
    expect(results.totalEnergyCost).toBeCloseTo(1500);
  });

  it('calculates each scenario once across repeated reads', () => {
    const first = service.scenarioResults('baseline');
    expect(service.scenarioResults('baseline')).toBe(first);
    service.scenarioResults('mod1');

    expect(electricityReduction).toHaveBeenCalledTimes(3);
  });

  it('recalculates only the scenario whose equipment changed, and every scenario when settings change', () => {
    service.scenarioResults('baseline');
    service.scenarioResults('mod1');
    scenarios.mod1.set({ auxiliaryEquipment: [item('a', 2)] });

    expect(service.scenarioResults('mod1').totalPower).toBe(2);
    service.scenarioResults('baseline');
    expect(electricityReduction).toHaveBeenCalledTimes(4);

    settings.set({ electricityCost: 0.2 });
    expect(service.scenarioResults('baseline').totalEnergyCost).toBeCloseTo(3000);
  });

  it('converts nameplate power entered in hp to kW and leaves the saved item untouched', () => {
    const hpItem = item('hp', undefined, { measurementMethod: AuxiliaryEquipmentMeasurementMethod.NAMEPLATE, userSelectedHP: true });
    hpItem.nameplateData.ratedMotorPower = 100;
    scenarios.mod1.set({ auxiliaryEquipment: [hpItem] });

    service.scenarioResults('mod1');

    const input: ElectricityReductionInput = electricityReduction.calls.mostRecent().args[0];
    expect(input.electricityReductionInputVec[0].nameplateData.ratedMotorPower).toBeCloseTo(74.57, 1);
    expect(hpItem.nameplateData.ratedMotorPower).toBe(100);
  });

  it('reports the power of every unit, as energy and cost already do', () => {
    electricityReduction.and.returnValue({ power: 5, energyUse: 87600, energyCost: 0 });
    scenarios.mod1.set({ auxiliaryEquipment: [item('a', 5, { units: 2 })] });

    expect(service.scenarioResults('mod1').items[0].power).toBe(10);
    expect(service.scenarioResults('mod1').totalPower).toBe(10);
  });

  it('leaves out items missing inputs for their measurement method', () => {
    scenarios.mod1.set({ auxiliaryEquipment: [item('a', 4), item('missing', null)] });

    expect(service.scenarioResults('mod1').items.map(result => result.id)).toEqual(['a']);
    expect(service.scenarioResults('mod1').totalPower).toBe(4);
    expect(service.scenarioResults('mod1').isComplete).toBeFalse();
  });

  it('is empty with zero totals when the scenario has no equipment', () => {
    scenarios.mod1.set({});
    expect(service.scenarioResults('mod1')).toEqual({ items: [], isComplete: true, totalPower: 0, totalEnergyUse: 0, totalEnergyCost: 0 });
  });
});
