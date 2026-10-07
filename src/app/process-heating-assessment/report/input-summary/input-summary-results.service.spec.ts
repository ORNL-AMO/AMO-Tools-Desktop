import { OperatingCosts } from '../../../shared/models/operations';
import { OperatingHours } from '../../../shared/models/operations';
import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { ProcessHeatingModification } from '../../models/modification';
import { PHAST, Losses } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';
import { InputSummaryResultsService, InputSummaryUI } from './input-summary-results.service';

const NO_CATEGORIES: ShowResultsCategories = {
  showSlag: false,
  showAuxPower: false,
  showSystemEff: false,
  showFlueGas: false,
  showEnInput1: false,
  showEnInput2: false,
  showExGas: false,
};

function buildPhast(overrides: Partial<PHAST> = {}): PHAST {
  return {
    losses: {
      wallLosses: [{ name: 'North wall', surfaceTemperature: 300, ambientTemperature: 80, surfaceArea: 100 }],
    } as Losses,
    operatingHours: { hoursPerYear: 8000 } as OperatingHours,
    operatingCosts: { fuelCost: 5 } as OperatingCosts,
    ...overrides,
  };
}

describe('InputSummaryResultsService', () => {
  let service: InputSummaryResultsService;
  let settings: WritableSignal<Partial<Settings>>;
  let categories: WritableSignal<ShowResultsCategories>;
  let scenarios: Record<string, PHAST>;
  let modifications: WritableSignal<ProcessHeatingModification[]>;

  function ui(): InputSummaryUI {
    return service.inputSummaryUI();
  }

  function section(label: string) {
    return ui().sections.find(candidate => candidate.label === label);
  }

  function row(sectionLabel: string, rowLabel: string) {
    return section(sectionLabel)?.rows.find(candidate => candidate.label === rowLabel);
  }

  beforeEach(() => {
    settings = signal<Partial<Settings>>({ unitsOfMeasure: 'Imperial', energySourceType: 'Fuel', furnaceType: 'Rotary Furnace' });
    categories = signal<ShowResultsCategories>({ ...NO_CATEGORIES });
    scenarios = { baseline: buildPhast(), mod1: buildPhast() };
    modifications = signal<ProcessHeatingModification[]>([{ id: 'mod1', scenarioOverrides: { name: 'Scenario 1' } }]);

    TestBed.configureTestingModule({
      providers: [
        InputSummaryResultsService,
        {
          provide: ProcessHeatingAssessmentService,
          useValue: { settingsSignal: settings, scenarioPhastSignal: (scenario: string) => scenarios[scenario] },
        },
        { provide: ModificationService, useValue: { modifications } },
        { provide: ProcessHeatingResultsService, useValue: { getResultCategories: () => categories() } },
      ],
    });
    service = TestBed.inject(InputSummaryResultsService);
  });

  it('builds an operations section from operating hours and costs', () => {
    expect(row('Operations', 'Operating Hours').baseline.value).toBe(8000);
    expect(row('Operations', 'Fuel Cost').baseline.value).toBe(5);
    expect(row('Operations', 'Furnace Type').baseline.value).toBe('Rotary Furnace');
  });

  it('prefers the custom furnace name', () => {
    settings.update(current => ({ ...current, customFurnaceName: 'My Furnace' }));
    expect(row('Operations', 'Furnace Type').baseline.value).toBe('My Furnace');
  });

  it('builds one section per list item, labeled with the item name', () => {
    expect(section('Wall Loss 1: North wall')).toBeDefined();
    expect(row('Wall Loss 1: North wall', 'Total Outside Surface Area').baseline.value).toBe(100);
  });

  it('uses imperial or metric unit labels', () => {
    expect(row('Wall Loss 1: North wall', 'Ambient Temperature').units).toBe('℉');
    settings.update(current => ({ ...current, unitsOfMeasure: 'Metric' }));
    expect(row('Wall Loss 1: North wall', 'Ambient Temperature').units).toBe('℃');
  });

  it('omits rows with no value in any scenario', () => {
    expect(row('Wall Loss 1: North wall', 'Wind Velocity')).toBeUndefined();
  });

  it('shows modification values beside baseline', () => {
    scenarios['mod1'] = buildPhast({
      losses: { wallLosses: [{ name: 'North wall', surfaceTemperature: 250, ambientTemperature: 80, surfaceArea: 100 }] } as Losses,
    });
    const surfaceTemperature = row('Wall Loss 1: North wall', 'Average Surface Temperature');
    expect(surfaceTemperature.baseline.value).toBe(300);
    expect(surfaceTemperature.modifications[0].value).toBe(250);
  });

  it('leaves modification cells empty when the modification lacks the item', () => {
    scenarios['mod1'] = buildPhast({ losses: { wallLosses: [] } as Losses });
    expect(row('Wall Loss 1: North wall', 'Total Outside Surface Area').modifications[0].value).toBeNull();
  });

  it('adds sections for items only a modification has', () => {
    scenarios['mod1'] = buildPhast({
      losses: { wallLosses: [{ name: 'North wall', surfaceArea: 100 }, { name: 'South wall', surfaceArea: 50 }] } as Losses,
    });
    const added = row('Wall Loss 2: South wall', 'Total Outside Surface Area');
    expect(added.baseline.value).toBeNull();
    expect(added.modifications[0].value).toBe(50);
  });

  it('reports modification names', () => {
    expect(ui().modificationNames).toEqual([{ id: 'mod1', name: 'Scenario 1' }]);
  });

  describe('configuration-specific sections', () => {
    beforeEach(() => {
      const losses = {
        flueGasLosses: [{ flueGasType: 'By Volume', flueGasByVolume: { flueGasTemperature: 500 } }],
        auxiliaryPowerLosses: [{ supplyVoltage: 480 }],
      } as Losses;
      scenarios['baseline'] = buildPhast({ losses, systemEfficiency: 70 });
      scenarios['mod1'] = buildPhast({ losses, systemEfficiency: 75 });
    });

    it('hides flue gas, auxiliary power, and system efficiency when the configuration does not use them', () => {
      expect(section('Flue Gas Loss 1')).toBeUndefined();
      expect(section('Auxiliary Power Loss 1')).toBeUndefined();
      expect(section('Heat System Efficiency')).toBeUndefined();
    });

    it('shows flue gas for fuel-fired configurations', () => {
      categories.update(current => ({ ...current, showFlueGas: true }));
      expect(row('Flue Gas Loss 1', 'Flue Gas Temperature').baseline.value).toBe(500);
    });

    it('shows auxiliary power when applicable', () => {
      categories.update(current => ({ ...current, showAuxPower: true }));
      expect(row('Auxiliary Power Loss 1', 'Supply Voltage').baseline.value).toBe(480);
    });

    it('shows system efficiency with baseline and modification values', () => {
      categories.update(current => ({ ...current, showSystemEff: true }));
      const efficiency = row('Heat System Efficiency', 'Heat System Efficiency');
      expect(efficiency.baseline.value).toBe(70);
      expect(efficiency.modifications[0].value).toBe(75);
    });
  });

  describe('charge material', () => {
    it('reads fields from the active material type only', () => {
      const losses = {
        chargeMaterials: [{
          name: 'Steel',
          chargeMaterialType: 'Solid',
          solidChargeMaterial: { chargeFeedRate: 1000, meltingPoint: 2500 },
          gasChargeMaterial: { feedRate: 99 },
        }],
      } as unknown as Losses;
      scenarios['baseline'] = buildPhast({ losses });
      expect(row('Charge Material 1: Steel', 'Charge Feed Rate').baseline.value).toBe(1000);
      expect(row('Charge Material 1: Steel', 'Melting Point').baseline.value).toBe(2500);
      expect(row('Charge Material 1: Steel', 'Gas Feed Rate')).toBeUndefined();
    });
  });

  it('returns undefined without settings', () => {
    settings.set(undefined);
    expect(ui()).toBeUndefined();
  });
});
