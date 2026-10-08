import { EnergyInputEAF } from '../../../shared/models/phast/losses/energyInputEAF';
import { EnergyInputExhaustGasLoss } from '../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { OperatingCosts } from '../../../shared/models/operations';
import { OperatingHours } from '../../../shared/models/operations';
import { WallLoss } from '../../../shared/models/phast/losses/wallLoss';
import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { ReportTableRow } from '../../../shared/report-builder/models/report-ui-models';
import { Settings } from '../../../shared/models/settings';
import { ProcessHeatingModification } from '../../models/modification';
import { PHAST, PhastResults, Losses } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';
import { ExecutiveSummaryResultsService, ExecutiveSummaryUI } from './executive-summary-results.service';

function buildPhast(name: string, overrides: Partial<PHAST> = {}): PHAST {
  return {
    name,
    losses: {
      chargeMaterials: [{ chargeMaterialType: 'Solid', solidChargeMaterial: { chargeFeedRate: 100 } }],
      wallLosses: [],
    } as unknown as Losses,
    operatingHours: { hoursPerYear: 1000 } as OperatingHours,
    operatingCosts: { fuelCost: 5, steamCost: 4, electricityCost: 0.1, coalCarbonCost: 1, electrodeCost: 2, otherFuelCost: 3 } as OperatingCosts,
    implementationCost: 0,
    ...overrides,
  };
}

describe('ExecutiveSummaryResultsService', () => {
  let service: ExecutiveSummaryResultsService;
  let settings: WritableSignal<Partial<Settings>>;
  let scenarios: Record<string, PHAST>;
  let resultsByName: Record<string, Partial<PhastResults>>;
  let modifications: WritableSignal<ProcessHeatingModification[]>;
  let showOperationalImpacts: WritableSignal<boolean>;

  function ui(): ExecutiveSummaryUI {
    return service.executiveSummaryUI();
  }

  function rowOf(rows: ReportTableRow[], label: string) {
    return rows.find(row => row.label === label);
  }

  beforeEach(() => {
    settings = signal<Partial<Settings>>({
      energySourceType: 'Fuel',
      furnaceType: 'Rotary Furnace',
      energyResultUnit: 'MMBtu',
      unitsOfMeasure: 'Imperial',
      currency: '$',
      emissionsUnit: 'Imperial',
    });
    scenarios = {
      baseline: buildPhast('baseline'),
      mod1: buildPhast('mod1', { implementationCost: 5000 }),
    };
    resultsByName = {
      baseline: { grossHeatInput: 10 },
      mod1: { grossHeatInput: 8 },
    };
    modifications = signal<ProcessHeatingModification[]>([
      { id: 'mod1', scenarioOverrides: { name: 'Scenario 1' } },
    ]);
    showOperationalImpacts = signal(false);

    TestBed.configureTestingModule({
      providers: [
        ExecutiveSummaryResultsService,
        {
          provide: ProcessHeatingAssessmentService,
          useValue: {
            settingsSignal: settings,
            scenarioPhastSignal: (scenario: string) => scenarios[scenario],
          },
        },
        { provide: ModificationService, useValue: { modifications } },
        { provide: FeatureFlagService, useValue: { showOperationalImpacts } },
        {
          provide: ProcessHeatingResultsService,
          useValue: {
            scenarioResults: (scenario: string) => resultsByName[scenario],
            getCo2EmissionsSavings: (baseline: PhastResults, mod: PhastResults) =>
              baseline.co2EmissionsOutput.totalEmissionOutput - mod.co2EmissionsOutput.totalEmissionOutput,
          },
        },
      ],
    });
    service = TestBed.inject(ExecutiveSummaryResultsService);
  });

  describe('scenario savings', () => {
    it('keys annual energy and cost savings by scenario id with a zero baseline', () => {
      expect(service.scenarioSavings()).toEqual({
        baseline: { costSavings: 0, energySavings: 0 },
        mod1: { costSavings: 10000, energySavings: 2000 },
      });
    });

    it('is empty when the baseline has no results', () => {
      resultsByName.baseline = undefined;
      expect(service.scenarioSavings()).toEqual({});
    });
  });

  describe('fuel-fired', () => {
    it('computes annual energy, cost, and energy intensity for baseline and modification', () => {
      const energy = rowOf(ui().summaryRows, 'Energy Used');
      expect(energy.baseline.value).toBe(10000);
      expect(energy.modifications[0].value).toBe(8000);
      expect(rowOf(ui().summaryRows, 'Cost').baseline.value).toBe(50000);
      expect(rowOf(ui().summaryRows, 'Cost').modifications[0].value).toBe(40000);
      expect(rowOf(ui().summaryRows, 'Energy Intensity').baseline.value).toBe(100000);
    });

    it('computes savings, percent savings, and payback for a modification', () => {
      expect(rowOf(ui().summaryRows, 'Energy Savings').modifications[0].value).toBe(2000);
      expect(rowOf(ui().summaryRows, 'Cost Savings').modifications[0].value).toBe(10000);
      const percentSavings = rowOf(ui().summaryRows, 'Percent Savings');
      expect(percentSavings.display).toBe('percent-graph');
      expect(percentSavings.baseline.value).toBeNull();
      expect(percentSavings.modifications[0].value).toBe(20);
      expect(rowOf(ui().summaryRows, 'Simple Payback Period').modifications[0].value).toBe(6);
    });

    it('leaves baseline savings cells empty', () => {
      expect(rowOf(ui().summaryRows, 'Cost Savings').baseline.value).toBeNull();
    });

    it('stores units without parentheses', () => {
      expect(rowOf(ui().summaryRows, 'Energy Used').units).toBe('MMBtu/yr');
    });

    it('reports the modification name', () => {
      expect(ui().modificationNames).toEqual([{ id: 'mod1', name: 'Scenario 1' }]);
    });

    it('omits EAF, emissions, and per-source cost tables', () => {
      expect(ui().eafEnergyRows).toEqual([]);
      expect(ui().co2Rows).toEqual([]);
      expect(ui().costRows).toEqual([]);
    });

    it('reports zero payback when the modification does not save cost', () => {
      resultsByName['mod1'] = { grossHeatInput: 12 };
      expect(rowOf(ui().summaryRows, 'Simple Payback Period').modifications[0].value).toBeNull();
    });
  });

  describe('steam', () => {
    it('prices annual energy at the steam cost', () => {
      settings.update(current => ({ ...current, energySourceType: 'Steam' }));
      expect(rowOf(ui().summaryRows, 'Cost').baseline.value).toBe(40000);
    });
  });

  describe('electrotechnology', () => {
    beforeEach(() => {
      settings.update(current => ({ ...current, energySourceType: 'Electricity', energyResultUnit: 'kWh' }));
      resultsByName['baseline'] = { grossHeatInput: 10, electricalHeatDelivered: 20 };
      resultsByName['mod1'] = { grossHeatInput: 8, electricalHeatDelivered: 15 };
      scenarios['baseline'].losses.energyInputExhaustGasLoss = [{ totalHeatInput: 4 }] as EnergyInputExhaustGasLoss[];
      scenarios['mod1'].losses.energyInputExhaustGasLoss = [{ totalHeatInput: 4 }] as EnergyInputExhaustGasLoss[];
    });

    it('sums electricity and fuel cost', () => {
      // 20 kW * 1000 h * 0.1 + 4 * 1000 h * 5
      expect(rowOf(ui().summaryRows, 'Cost').baseline.value).toBe(22000);
    });

    it('builds electrical and fuel cost rows', () => {
      const labels = ui().costRows.map(row => row.label);
      expect(labels).toEqual(['Electrical', 'Fuel']);
      expect(ui().costRows[0].baseline.value).toBe(2000);
      expect(ui().costRows[1].baseline.value).toBe(20000);
    });

    it('omits the EAF energy table', () => {
      expect(ui().eafEnergyRows).toEqual([]);
    });
  });

  describe('electric arc furnace', () => {
    beforeEach(() => {
      settings.update(current => ({
        ...current,
        energySourceType: 'Electricity',
        furnaceType: 'Electric Arc Furnace (EAF)',
        energyResultUnit: 'kWh',
      }));
      const eafResults = { naturalGasUsed: 100, otherFuelUsed: 10, electricEnergyUsed: 1000, coalCarbonUsed: 5, electrodeEnergyUsed: 6 };
      resultsByName['baseline'] = { grossHeatInput: 10, annualEAFResults: eafResults } as Partial<PhastResults>;
      resultsByName['mod1'] = { grossHeatInput: 8, annualEAFResults: eafResults } as Partial<PhastResults>;
      const energyInput = [{ coalCarbonInjection: 2, electrodeUse: 3 }] as EnergyInputEAF[];
      scenarios['baseline'].losses.energyInputEAF = energyInput;
      scenarios['mod1'].losses.energyInputEAF = energyInput;
    });

    it('builds the EAF energy table', () => {
      expect(ui().eafEnergyRows.map(row => row.label)).toEqual(['Electrical', 'Natural Gas', 'Coal Carbon', 'Electrode', 'Other Fuel']);
      expect(ui().eafEnergyRows[0].baseline.value).toBe(1000);
    });

    it('breaks cost down by source', () => {
      expect(ui().costRows.map(row => row.label)).toEqual(['Electrical', 'Natural Gas', 'Coal Carbon', 'Electrode', 'Other Fuel']);
      expect(ui().costRows[1].baseline.value).toBe(500);
      expect(ui().costRows[2].baseline.value).toBe(2000);
      expect(ui().costRows[3].baseline.value).toBe(6000);
      expect(ui().costRows[4].baseline.value).toBe(30);
      expect(rowOf(ui().summaryRows, 'Cost').baseline.value).toBe(8530 + 100);
    });
  });

  describe('operational impacts flag', () => {
    beforeEach(() => {
      resultsByName['baseline'] = { grossHeatInput: 10, co2EmissionsOutput: { totalEmissionOutput: 100 } } as Partial<PhastResults>;
      resultsByName['mod1'] = { grossHeatInput: 8, co2EmissionsOutput: { totalEmissionOutput: 70 } } as Partial<PhastResults>;
    });

    it('hides CO2 rows when the flag is off', () => {
      expect(rowOf(ui().summaryRows, 'Total CO<sub>2</sub> Emissions')).toBeUndefined();
    });

    it('shows total emissions and savings when the flag is on', () => {
      showOperationalImpacts.set(true);
      expect(rowOf(ui().summaryRows, 'Total CO<sub>2</sub> Emissions').baseline.value).toBe(100);
      expect(rowOf(ui().summaryRows, 'CO<sub>2</sub> Emissions Savings').modifications[0].value).toBe(30);
    });
  });

  describe('modification details', () => {
    it('lists changed loss types and operations in modifications made', () => {
      scenarios['mod1'] = buildPhast('mod1', {
        losses: { ...scenarios['baseline'].losses, wallLosses: [{ name: 'changed' }] as unknown as WallLoss[] },
        operatingHours: { hoursPerYear: 2000 } as OperatingHours,
      });
      expect(rowOf(ui().summaryRows, 'Modifications').modifications[0].value).toBe('Wall\nOperations');
    });

    it('lists no changes for an unmodified scenario', () => {
      scenarios['mod1'] = { ...scenarios['baseline'], name: 'mod1' };
      expect(rowOf(ui().summaryRows, 'Modifications').modifications[0].value).toBeNull();
    });

    it('includes only selected opportunities', () => {
      modifications.set([{
        id: 'mod1',
        scenarioOverrides: { name: 'Scenario 1' },
        exploreOpportunityFlags: {
          flueGas: { hasOpportunity: true, display: 'Flue Gas' },
          airTemp: { hasOpportunity: false, display: 'Air Temp' },
        },
      }]);
      expect(rowOf(ui().summaryRows, 'Selected Energy Projects').modifications[0].value).toBe('Flue Gas');
    });

    it('builds notes with modification and loss names', () => {
      modifications.set([{
        id: 'mod1',
        scenarioOverrides: { name: 'Scenario 1' },
        notes: { wallNotes: 'Added insulation' },
      }]);
      expect(ui().notes).toEqual([{ modificationName: 'Scenario 1', lossName: 'Wall Losses', note: 'Added insulation' }]);
    });
  });

  it('returns undefined when baseline results are unavailable', () => {
    resultsByName['baseline'] = undefined;
    expect(ui()).toBeUndefined();
  });
});
