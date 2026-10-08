import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConvertPhastService } from '../../../phast/convert-phast.service';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { ReportTableRow } from '../../../shared/report-builder/models/report-ui-models';
import { ProcessHeatingModification } from '../../models/modification';
import { PhastResults } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';
import { ResultsDataResultsService, ResultsDataUI } from './results-data-results.service';

const NO_CATEGORIES: ShowResultsCategories = {
  showSlag: false, showAuxPower: false, showSystemEff: false, showFlueGas: false, showEnInput1: false, showEnInput2: false, showExGas: false,
};

describe('ResultsDataResultsService', () => {
  let service: ResultsDataResultsService;
  let settings: WritableSignal<Partial<Settings>>;
  let resultsByName: Record<string, Partial<PhastResults>>;
  let categories: ShowResultsCategories;
  let modifications: WritableSignal<ProcessHeatingModification[]>;
  let showOperationalImpacts: WritableSignal<boolean>;
  let convertEAF: jasmine.Spy;

  function ui(): ResultsDataUI {
    return service.resultsDataUI();
  }

  function rowOf(label: string): ReportTableRow {
    return ui().rows.find(row => row.label === label);
  }

  const labels = (): string[] => ui().rows.map(row => row.label);

  beforeEach(() => {
    settings = signal<Partial<Settings>>({
      energySourceType: 'Fuel',
      furnaceType: 'Rotary Furnace',
      energyResultUnit: 'MMBtu',
      unitsOfMeasure: 'Imperial',
      emissionsUnit: 'Imperial',
    });
    resultsByName = {
      baseline: { totalWallLoss: 1.5, flueGasAvailableHeat: 55.55, grossHeatInput: 10 },
      mod1: { totalWallLoss: 0, flueGasAvailableHeat: 60, grossHeatInput: 8 },
    };
    categories = { ...NO_CATEGORIES };
    modifications = signal<ProcessHeatingModification[]>([{ id: 'mod1', scenarioOverrides: { name: 'Scenario 1' } }]);
    showOperationalImpacts = signal(false);
    convertEAF = jasmine.createSpy('convertEAFEnergyUsed').and.callFake((results: PhastResults) => results);

    TestBed.configureTestingModule({
      providers: [
        ResultsDataResultsService,
        {
          provide: ProcessHeatingAssessmentService,
          useValue: { settingsSignal: settings },
        },
        { provide: ModificationService, useValue: { modifications } },
        { provide: FeatureFlagService, useValue: { showOperationalImpacts } },
        { provide: ConvertPhastService, useValue: { convertEAFEnergyUsed: convertEAF } },
        {
          provide: ProcessHeatingResultsService,
          useValue: {
            scenarioResults: (scenario: string) => resultsByName[scenario],
            getResultCategories: () => categories,
            getCo2EmissionsSavings: (baseline: PhastResults, mod: PhastResults) =>
              baseline.co2EmissionsOutput.hourlyTotalEmissionOutput - mod.co2EmissionsOutput.hourlyTotalEmissionOutput,
          },
        },
      ],
    });
    service = TestBed.inject(ResultsDataResultsService);
  });

  describe('fuel-fired', () => {
    beforeEach(() => {
      categories = { ...NO_CATEGORIES, showFlueGas: true, showHeatDelivered: true };
    });

    it('titles the table with the hourly energy unit', () => {
      expect(ui().title).toBe('Hourly Energy Loss/Use (MMBtu/hr)');
    });

    it('uses kWh/hr for kWh results', () => {
      settings.update(current => ({ ...current, energyResultUnit: 'kWh' }));
      expect(ui().title).toBe('Hourly Energy Loss/Use (kWh/hr)');
    });

    it('includes flue gas rows and omits system efficiency rows', () => {
      expect(labels()).toContain('Flue Gas Losses');
      expect(labels()).toContain('Fuel Heat Delivered');
      expect(labels()).not.toContain('System Efficiency');
      expect(labels()).not.toContain('Aux Power Losses');
    });

    it('formats loss values to two decimals and percent rows to one', () => {
      expect(rowOf('Wall Losses').baseline).toEqual({ value: 1.5, decimalPipe: '1.2-2' });
      expect(rowOf('Available Heat').baseline).toEqual({ value: 55.55, decimalPipe: '1.1-1' });
      expect(rowOf('Available Heat').units).toBe('%');
    });

    it('renders zero values as empty cells', () => {
      expect(rowOf('Wall Losses').modifications[0].value).toBeNull();
    });

    it('marks gross heat input as the emphasis row and puts it last when CO2 is hidden', () => {
      expect(rowOf('Gross Heat Input').className).toBe('emphasis');
      expect(labels()[labels().length - 1]).toBe('Gross Heat Input');
    });

    it('reports modification names and a column per modification', () => {
      expect(ui().modificationNames).toEqual([{ id: 'mod1', name: 'Scenario 1' }]);
      expect(rowOf('Gross Heat Input').modifications[0].value).toBe(8);
    });

    it('omits whole-number precision for non-energy units', () => {
      settings.update(current => ({ ...current, energyResultUnit: 'Btu' }));
      expect(rowOf('Wall Losses').baseline.decimalPipe).toBe('1.0-0');
    });
  });

  describe('electrotechnology', () => {
    it('adds electrical rows for non-EAF electric furnaces', () => {
      settings.update(current => ({ ...current, energySourceType: 'Electricity' }));
      categories = { ...NO_CATEGORIES, showHeatDelivered: true, showElectricalDelivered: true, showAuxPower: true, showEnInput2: true };
      expect(labels()).toContain('Aux Power Losses');
      expect(labels()).toContain('Electrical Heat Delivered');
      expect(labels()).toContain('Electrical Heater Losses');
      expect(labels()).toContain('Total Provided Electrical Heat');
      expect(convertEAF).not.toHaveBeenCalled();
    });

    it('converts EAF results and shows slag, exhaust gas, and chemical energy rows', () => {
      settings.update(current => ({ ...current, energySourceType: 'Electricity', furnaceType: 'Electric Arc Furnace (EAF)' }));
      categories = { ...NO_CATEGORIES, showSlag: true, showExGas: true, showEnInput1: true, showElectricalDelivered: true, showChemicalEnergyDelivered: true };
      expect(labels()).toContain('Slag Losses');
      expect(labels()).toContain('Exhaust Gas Losses');
      expect(labels()).toContain('Chemical Energy Delivered');
      expect(convertEAF).toHaveBeenCalled();
    });
  });

  describe('steam', () => {
    it('adds system efficiency rows', () => {
      settings.update(current => ({ ...current, energySourceType: 'Steam' }));
      categories = { ...NO_CATEGORIES, showSystemEff: true };
      expect(labels()).toContain('System Efficiency');
      expect(labels()).toContain('Total System Losses');
      expect(labels()).not.toContain('Flue Gas Losses');
    });
  });

  describe('CO2 emissions', () => {
    beforeEach(() => {
      resultsByName.baseline.co2EmissionsOutput = { hourlyTotalEmissionOutput: 5 } as PhastResults['co2EmissionsOutput'];
      resultsByName.mod1.co2EmissionsOutput = { hourlyTotalEmissionOutput: 3 } as PhastResults['co2EmissionsOutput'];
    });

    it('omits CO2 rows unless operational impacts are enabled', () => {
      expect(labels().some(label => label.includes('CO<sub>2</sub>'))).toBeFalse();
    });

    it('adds emissions and hourly savings rows with an empty baseline savings cell', () => {
      showOperationalImpacts.set(true);
      expect(rowOf('CO<sub>2</sub> Emissions').baseline.value).toBe(5);
      expect(rowOf('CO<sub>2</sub> Emissions Savings').baseline.value).toBeNull();
      expect(rowOf('CO<sub>2</sub> Emissions Savings').modifications[0].value).toBe(2);
      expect(rowOf('CO<sub>2</sub> Emissions').units).toBe('ton CO<sub>2</sub>/hr');
    });

    it('does not write savings into the shared scenario results', () => {
      showOperationalImpacts.set(true);
      ui();
      expect(resultsByName.mod1.co2EmissionsOutput.emissionsSavings).toBeUndefined();
    });
  });

  describe('no modifications', () => {
    it('renders baseline only and skips the savings row', () => {
      modifications.set([]);
      showOperationalImpacts.set(true);
      expect(ui().modificationNames).toEqual([]);
      expect(rowOf('Gross Heat Input').modifications).toEqual([]);
      expect(rowOf('CO<sub>2</sub> Emissions Savings')).toBeUndefined();
    });
  });

  it('is undefined when the baseline has no results', () => {
    resultsByName.baseline = undefined;
    expect(ui()).toBeUndefined();
  });
});
