import { TestBed } from '@angular/core/testing';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { EnergyInputEAF } from '../../../../shared/models/phast/losses/energyInputEAF';
import { Settings } from '../../../../shared/models/settings';
import { PhastResults } from '../../../models/phast';
import { EnergyInputFormService } from './energy-input-form.service';

const LOSS: EnergyInputEAF = {
  naturalGasHeatInput: 10, coalCarbonInjection: 100, coalHeatingValue: 12000,
  electrodeUse: 50, electrodeHeatingValue: 14000, otherFuels: 1, electricityInput: 5000, flowRateInput: 100,
};
const settingsFor = (unitsOfMeasure: string) => ({ unitsOfMeasure } as Settings);

describe('EnergyInputFormService', () => {
  let service: EnergyInputFormService;
  let convert: ConvertUnitsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [EnergyInputFormService, ConvertUnitsService] });
    service = TestBed.inject(EnergyInputFormService);
    convert = TestBed.inject(ConvertUnitsService);
  });

  it('is invalid on an empty loss and defaults heating values in Imperial', () => {
    const form = service.getEnergyInputForm({}, settingsFor('Imperial'));

    expect(form.valid).toBeFalse();
    expect(form.controls.coalHeatingValue.value).toBe(12000);
    expect(form.controls.electrodeHeatingValue.value).toBe(14000);
  });

  it('defaults heating values in kJ/kg for Metric', () => {
    const form = service.getEnergyInputForm({}, settingsFor('Metric'));

    expect(form.controls.coalHeatingValue.value).toBeCloseTo(convert.value(12000).from('btuLb').to('kJkg'), 6);
  });

  it('keeps saved heating values over defaults', () => {
    expect(service.getEnergyInputForm({ ...LOSS, coalHeatingValue: 9000 }, settingsFor('Imperial')).controls.coalHeatingValue.value).toBe(9000);
  });

  it('is valid for a complete loss', () => {
    expect(service.getEnergyInputForm(LOSS, settingsFor('Imperial')).valid).toBeTrue();
  });

  it('rejects negative inputs', () => {
    expect(service.getEnergyInputForm({ ...LOSS, electricityInput: -1 }, settingsFor('Imperial')).controls.electricityInput.errors?.['min']).toBeTruthy();
  });

  it('round-trips a loss through the form', () => {
    expect(service.buildEnergyInput(service.getEnergyInputForm(LOSS, settingsFor('Imperial')))).toEqual(LOSS);
  });

  it('derives natural gas heat input from flow rate', () => {
    expect(service.calculateHeatInputFromFlowRate(1_000_000, settingsFor('Imperial'))).toBe(1020);
  });

  describe('minimum electricity input', () => {
    const results = (overrides: Partial<PhastResults> = {}): PhastResults =>
      ({ totalInput: 1000, exothermicHeat: -100, energyInputTotalChemEnergy: 300, totalExhaustGasEAF: 0, energyInputHeatDelivered: 500, ...overrides } as PhastResults);

    it('is undefined when results are unavailable', () => {
      expect(service.getMinElectricityInput(undefined, { energyResultUnit: 'kWh' } as Settings)).toBeUndefined();
    });

    it('is total input plus exothermic heat less chemical energy, as kW when the unit is kWh', () => {
      expect(service.getMinElectricityInput(results(), { energyResultUnit: 'kWh' } as Settings)).toBe(600);
    });

    it('converts other energy result units to kW', () => {
      const kw = service.getMinElectricityInput(results(), { energyResultUnit: 'Btu' } as Settings);
      expect(kw).toBeCloseTo(convert.roundVal(convert.value(600).from('Btu').to('kWh'), 2), 2);
    });

    it('makes electricity input below the minimum invalid and at or above it valid', () => {
      const form = service.getEnergyInputForm(LOSS, settingsFor('Imperial'));
      service.setMinElectricityInput(form, 6000);
      expect(form.controls.electricityInput.invalid).toBeTrue();

      form.controls.electricityInput.setValue(6000);
      expect(form.controls.electricityInput.valid).toBeTrue();
    });

    it('falls back to non-negative when no minimum is available', () => {
      const form = service.getEnergyInputForm(LOSS, settingsFor('Imperial'));
      service.setMinElectricityInput(form, 6000);
      service.setMinElectricityInput(form, undefined);
      expect(form.controls.electricityInput.valid).toBeTrue();
    });

    it('does not emit value changes when the validators are replaced', () => {
      const form = service.getEnergyInputForm(LOSS, settingsFor('Imperial'));
      let emissions = 0;
      form.valueChanges.subscribe(() => emissions++);
      service.setMinElectricityInput(form, 6000);
      expect(emissions).toBe(0);
    });
  });

  describe('warnings', () => {
    it('warns when exhaust gas losses reach the chemical energy delivered', () => {
      const warnings = service.getWarnings({ totalExhaustGasEAF: 300, energyInputTotalChemEnergy: 300, energyInputHeatDelivered: 5 } as PhastResults);
      expect(warnings.electricityInput).toContain('Exhaust Gas Losses must be less');
      expect(warnings.heatDelivered).toBeNull();
    });

    it('warns when heat delivered is negative', () => {
      const warnings = service.getWarnings({ totalExhaustGasEAF: 1, energyInputTotalChemEnergy: 300, energyInputHeatDelivered: -1 } as PhastResults);
      expect(warnings.heatDelivered).toContain('More heat than necessary');
      expect(warnings.electricityInput).toBeNull();
    });

    it('has no warnings without results', () => {
      expect(service.getWarnings(undefined)).toEqual({ electricityInput: null, heatDelivered: null });
    });
  });
});
