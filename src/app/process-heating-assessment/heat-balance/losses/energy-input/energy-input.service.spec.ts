import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { PhastResults } from '../../../models/phast';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../../services/process-heating-results.service';
import { EnergyInputCalculationService } from './energy-input-calculation.service';
import { EnergyInputFormService } from './energy-input-form.service';
import { EnergyInputService } from './energy-input.service';

const SETTINGS = { unitsOfMeasure: 'Imperial', energyResultUnit: 'kWh' } as Settings;

describe('EnergyInputService', () => {
  let service: EnergyInputService;
  let assessmentServiceSpy: jasmine.SpyObj<ProcessHeatingAssessmentService>;
  let resultsServiceSpy: jasmine.SpyObj<ProcessHeatingResultsService>;
  let calculationServiceSpy: jasmine.SpyObj<EnergyInputCalculationService>;

  beforeEach(() => {
    assessmentServiceSpy = jasmine.createSpyObj(
      'ProcessHeatingAssessmentService',
      ['lossSignal', 'scenarioPhast', 'updateLossesProperty'],
      { settingsSignal: signal(SETTINGS) },
    );
    assessmentServiceSpy.lossSignal.and.returnValue([{ id: 'a', name: 'Energy Input', electricityInput: 100 }] as never);
    assessmentServiceSpy.scenarioPhast.and.returnValue({ losses: {} } as never);
    resultsServiceSpy = jasmine.createSpyObj('ProcessHeatingResultsService', ['getResults']);
    resultsServiceSpy.getResults.and.returnValue({
      totalInput: 1000, exothermicHeat: -100, energyInputTotalChemEnergy: 300, totalExhaustGasEAF: 0, energyInputHeatDelivered: 500,
    } as PhastResults);

    calculationServiceSpy = jasmine.createSpyObj('EnergyInputCalculationService', ['calculate']);

    TestBed.configureTestingModule({
      providers: [
        EnergyInputService,
        EnergyInputFormService,
        ConvertUnitsService,
        { provide: EnergyInputCalculationService, useValue: calculationServiceSpy },
        { provide: ProcessHeatingAssessmentService, useValue: assessmentServiceSpy },
        { provide: ProcessHeatingResultsService, useValue: resultsServiceSpy },
      ],
    });
    service = TestBed.inject(EnergyInputService);
  });

  it('applies the scenario minimum electricity input to loaded entries', () => {
    service.initialize('baseline');

    const control = service.losses()[0].form.controls.electricityInput;
    expect(control.hasError('min')).toBeTrue();
    control.setValue(600);
    expect(control.hasError('min')).toBeFalse();
  });

  it('recomputes the minimum after an entry is saved', () => {
    service.initialize('baseline');
    resultsServiceSpy.getResults.and.returnValue({
      totalInput: 100, exothermicHeat: 0, energyInputTotalChemEnergy: 0, totalExhaustGasEAF: 0, energyInputHeatDelivered: 500,
    } as PhastResults);

    service.setName('a', 'Renamed');

    expect(service.losses()[0].form.controls.electricityInput.hasError('min')).toBeFalse();
  });

  it('publishes warnings from the scenario results', () => {
    resultsServiceSpy.getResults.and.returnValue({
      totalInput: 1000, exothermicHeat: 0, energyInputTotalChemEnergy: 300, totalExhaustGasEAF: 300, energyInputHeatDelivered: -5,
    } as PhastResults);

    assessmentServiceSpy.lossSignal.and.returnValue([{
      id: 'a', name: 'Energy Input', naturalGasHeatInput: 1, coalCarbonInjection: 1, coalHeatingValue: 1,
      electrodeUse: 1, electrodeHeatingValue: 1, otherFuels: 1, electricityInput: 800,
    }] as never);

    service.initialize('baseline');

    expect(service.warnings().electricityInput).toContain('Exhaust Gas Losses');
    expect(service.warnings().heatDelivered).toContain('More heat than necessary');
  });

  it('shows no warnings when there is no valid entry', () => {
    assessmentServiceSpy.lossSignal.and.returnValue([] as never);
    resultsServiceSpy.getResults.and.returnValue({
      totalInput: 0, exothermicHeat: 0, energyInputTotalChemEnergy: 0, totalExhaustGasEAF: 0, energyInputHeatDelivered: 0,
    } as PhastResults);

    service.initialize('baseline');

    expect(service.warnings()).toEqual({ electricityInput: null, heatDelivered: null });
  });

  it('clears a stale result when the new minimum makes an entry invalid', () => {
    assessmentServiceSpy.lossSignal.and.returnValue([{
      id: 'a', name: 'Energy Input', naturalGasHeatInput: 1, coalCarbonInjection: 1, coalHeatingValue: 1,
      electrodeUse: 1, electrodeHeatingValue: 1, otherFuels: 1, electricityInput: 100, heatLoss: 42,
    }] as never);
    calculationServiceSpy.calculate.and.returnValue(42);

    service.initialize('baseline');

    expect(service.losses()[0].form.controls.electricityInput.invalid).toBeTrue();
    expect(service.losses()[0].heatLoss).toBeNull();
  });
});
