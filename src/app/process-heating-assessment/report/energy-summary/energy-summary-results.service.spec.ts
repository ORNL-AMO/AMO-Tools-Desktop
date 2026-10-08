import { OperatingCosts } from '../../../shared/models/operations';
import { OperatingHours } from '../../../shared/models/operations';
import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Settings } from '../../../shared/models/settings';
import { PHAST, PhastResults } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';
import { EnergySummaryResultsService, EnergySummaryUI } from './energy-summary-results.service';

describe('EnergySummaryResultsService', () => {
  let service: EnergySummaryResultsService;
  let settings: WritableSignal<Partial<Settings>>;
  let phast: PHAST;
  let results: Partial<PhastResults>;
  let resultsService: jasmine.SpyObj<ProcessHeatingResultsService>;

  function ui(): EnergySummaryUI {
    return service.energySummaryUI();
  }

  beforeEach(() => {
    settings = signal<Partial<Settings>>({
      energySourceType: 'Fuel',
      furnaceType: 'Rotary Furnace',
      energyResultUnit: 'MMBtu',
      unitsOfMeasure: 'Imperial',
    });
    phast = {
      losses: {},
      operatingHours: { hoursPerYear: 8000, operatingConditions: 'Two shifts' } as OperatingHours,
      operatingCosts: { fuelCost: 5, steamCost: 4, electricityCost: 0.1, coalCarbonCost: 1, electrodeCost: 2, otherFuelCost: 3 } as OperatingCosts,
      equipmentNotes: 'Batch furnace',
    };
    results = { grossHeatInput: 10 };
    resultsService = jasmine.createSpyObj<ProcessHeatingResultsService>('ProcessHeatingResultsService', [
      'scenarioResults', 'getEnergyUseReportData', 'getCalculatedByPhast', 'getMeteredEnergyResults', 'getDesignedEnergyResults',
    ]);
    resultsService.scenarioResults.and.callFake(() => results as PhastResults);
    resultsService.getEnergyUseReportData.and.returnValue({
      fuelName: 'Natural Gas', fuelEnergyUsed: 10, fuelHeatingValue: 1000, energyPerMassUnit: undefined, baseEnergyUnit: undefined, steamEnergyUsed: undefined,
    });
    resultsService.getCalculatedByPhast.and.returnValue({ fuelEnergyUsed: 10, energyIntensity: 100000, electricityUsed: 2 });
    resultsService.getMeteredEnergyResults.and.returnValue(undefined);
    resultsService.getDesignedEnergyResults.and.returnValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        EnergySummaryResultsService,
        { provide: ProcessHeatingAssessmentService, useValue: { settingsSignal: settings, scenarioPhastSignal: () => phast } },
        { provide: ProcessHeatingResultsService, useValue: resultsService },
      ],
    });
    service = TestBed.inject(EnergySummaryResultsService);
  });

  it('builds the fuel row with units and cost', () => {
    const fuel = ui().sources[0];
    expect(fuel).toEqual(jasmine.objectContaining({
      name: 'Natural Gas', energyUsed: 10, energyUsedUnit: 'MMBtu/hr', heatingValue: 1000, heatingValueUnit: 'Btu/lb', costPerUnit: 5, costUnit: '/MMBtu',
    }));
  });

  it('uses metric cost units', () => {
    settings.update(current => ({ ...current, unitsOfMeasure: 'Metric', energyResultUnit: 'GJ' }));
    expect(ui().sources[0].costUnit).toBe('/GJ');
    expect(ui().sources[0].heatingValueUnit).toBe('kJ/kg');
  });

  it('always includes a steam row and omits electricity for non-electric sources', () => {
    expect(ui().sources.map(source => source.name)).toEqual(['Natural Gas', 'Steam']);
  });

  it('adds an electricity row for electric sources', () => {
    settings.update(current => ({ ...current, energySourceType: 'Electricity', energyResultUnit: 'kWh' }));
    const electricity = ui().sources.find(source => source.name === 'Electricity');
    expect(electricity.energyUsedUnit).toBe('kW');
    expect(electricity.costPerUnit).toBe(0.1);
    expect(electricity.heatingValue).toBeGreaterThan(0);
  });

  it('adds EAF coal, electrode, and other fuel rows', () => {
    settings.update(current => ({ ...current, energySourceType: 'Electricity', furnaceType: 'Electric Arc Furnace (EAF)', energyResultUnit: 'kWh' }));
    results = { grossHeatInput: 10, hourlyEAFResults: { coalCarbonUsed: 1, electrodeEnergyUsed: 2, otherFuelUsed: 3 } } as Partial<PhastResults>;
    expect(ui().sources.map(source => source.name)).toEqual(['Natural Gas', 'Coal Carbon', 'Electrode', 'Other Fuels', 'Electricity', 'Steam']);
    expect(ui().sources[2].energyUsed).toBe(2);
  });

  it('compares calculated, metered, and designed energy', () => {
    resultsService.getMeteredEnergyResults.and.returnValue({ metered: { hourlyEnergy: 9, energyIntensity: 8, hourlyElectricity: 1 } } as never);
    resultsService.getDesignedEnergyResults.and.returnValue({ designed: { hourlyEnergy: 11, energyIntensity: 12, hourlyElectricity: 3 } } as never);
    const [energy, intensity, electricity] = ui().comparison;
    expect(energy).toEqual(jasmine.objectContaining({ calculated: 10, metered: 9, designed: 11 }));
    expect(intensity).toEqual(jasmine.objectContaining({ calculated: 100000, metered: 8, designed: 12 }));
    expect(electricity).toEqual(jasmine.objectContaining({ calculated: 2, metered: 1, designed: 3 }));
  });

  it('leaves metered and designed empty when not entered', () => {
    expect(ui().comparison[0].metered).toBeUndefined();
    expect(ui().comparison[0].designed).toBeUndefined();
  });

  it('includes equipment notes and operating conditions', () => {
    expect(ui().equipmentNotes).toBe('Batch furnace');
    expect(ui().operatingConditions).toBe('Two shifts');
  });

  it('returns undefined when results are unavailable', () => {
    results = undefined;
    expect(ui()).toBeUndefined();
  });
});
