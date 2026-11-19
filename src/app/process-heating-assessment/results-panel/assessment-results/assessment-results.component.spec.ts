import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { Settings } from '../../../shared/models/settings';
import { PhastResults } from '../../models/phast';
import { ProcessHeatingModification } from '../../models/modification';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';
import { ResultCategories } from '../../models/result-rows';
import { ModificationService } from '../../services/modification.service';
import { InvalidModification, ProcessHeatingValidityService } from '../../services/process-heating-validity.service';
import { AssessmentResultsComponent } from './assessment-results.component';
import { EM_DASH } from '../../constants/display-text';

const NO_CATEGORIES: ResultCategories = {
  showSlag: false,
  showEafElectricalDelivered: false,
  showStandardElectricalDelivered: false,
  showAuxPower: false,
  showSystemEff: false,
  showFlueGas: false,
  showEnInput1: false,
  showEnInput2: false,
  showExGas: false,
};

const MODIFICATION = { id: 'mod-1', scenarioOverrides: { name: 'Better Walls' } } as ProcessHeatingModification;

function makeResults(overrides: Partial<PhastResults> = {}): PhastResults {
  return { totalWallLoss: 10, totalInput: 30, grossHeatInput: 40, ...overrides } as PhastResults;
}

function co2(hourlyTotalEmissionOutput: number | undefined): PhastResults['co2EmissionsOutput'] {
  return { hourlyTotalEmissionOutput } as PhastResults['co2EmissionsOutput'];
}

describe('AssessmentResultsComponent', () => {
  let fixture: ComponentFixture<AssessmentResultsComponent>;
  let categories: WritableSignal<ResultCategories>;
  let modificationCategories: WritableSignal<ResultCategories | undefined>;
  let baselineResults: WritableSignal<PhastResults | undefined>;
  let modificationResults: WritableSignal<PhastResults | undefined>;
  let settings: WritableSignal<Partial<Settings>>;
  let modificationEnergySource: WritableSignal<Partial<Settings>>;
  let invalidModifications: WritableSignal<InvalidModification[]>;
  let showOperationalImpacts: WritableSignal<boolean>;
  let resultsService: jasmine.SpyObj<ProcessHeatingResultsService>;

  function text(el: Element | null | undefined): string {
    return (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  function headerCells(): string[] {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('thead tr:first-child th')).map(text);
  }

  function row(label: string): HTMLTableRowElement | undefined {
    return Array.from<HTMLTableRowElement>(fixture.nativeElement.querySelectorAll('tbody tr')).find(tr =>
      text(tr.cells[0]).startsWith(label)
    );
  }

  function rowCells(label: string): string[] {
    const tr = row(label);
    return tr ? Array.from(tr.cells).slice(1).map(text) : [];
  }

  function render(scenario = 'baseline'): void {
    fixture.componentRef.setInput('scenario', scenario);
    fixture.detectChanges();
  }

  beforeEach(() => {
    categories = signal({ ...NO_CATEGORIES });
    modificationCategories = signal<ResultCategories | undefined>(undefined);
    baselineResults = signal(makeResults());
    modificationResults = signal(makeResults({ totalWallLoss: 5 }));
    settings = signal<Partial<Settings>>({ energyResultUnit: 'MMBtu', emissionsUnit: 'Imperial', energySourceType: 'Fuel' });
    modificationEnergySource = signal<Partial<Settings>>({});
    invalidModifications = signal([]);
    showOperationalImpacts = signal(false);

    resultsService = jasmine.createSpyObj<ProcessHeatingResultsService>('ProcessHeatingResultsService', [
      'scenarioResults',
      'scenarioResultCategories',
      'getCo2EmissionsSavings',
    ]);
    resultsService.scenarioResults.and.callFake(scenario => (scenario === 'baseline' ? baselineResults() : modificationResults()));
    resultsService.scenarioResultCategories.and.callFake(scenario =>
      scenario === 'baseline' ? categories() : modificationCategories() ?? categories()
    );
    resultsService.getCo2EmissionsSavings.and.returnValue(2.5);

    TestBed.configureTestingModule({
      declarations: [AssessmentResultsComponent],
      providers: [
        {
          provide: ProcessHeatingAssessmentService,
          useValue: {
            settingsSignal: settings,
            scenarioSettings: (scenario: string) => scenario === 'baseline' ? settings() : { ...settings(), ...modificationEnergySource() },
          },
        },
        { provide: ProcessHeatingResultsService, useValue: resultsService },
        { provide: ModificationService, useValue: { modifications: signal([MODIFICATION]) } },
        { provide: ProcessHeatingValidityService, useValue: { invalidModifications } },
        { provide: FeatureFlagService, useValue: { showOperationalImpacts } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(AssessmentResultsComponent);
  });

  describe('initialization', () => {
    it('defaults scenario to baseline', () => {
      expect(fixture.componentInstance.scenario()).toBe('baseline');
    });

    it('requests baseline results and the selected modification results', () => {
      render('mod-1');
      expect(resultsService.scenarioResults).toHaveBeenCalledWith('baseline');
      expect(resultsService.scenarioResults).toHaveBeenCalledWith('mod-1');
    });
  });

  describe('columns', () => {
    it('shows only the baseline column on Baseline steps', () => {
      render();
      expect(headerCells()).toEqual(['Hourly Energy Loss/Use', 'Baseline']);
      expect(rowCells('Wall Losses')).toEqual(['10.00']);
    });

    it('adds the selected modification column alongside baseline', () => {
      render('mod-1');
      expect(headerCells()).toEqual(['Hourly Energy Loss/Use', 'Baseline', 'Better Walls']);
      expect(rowCells('Wall Losses')).toEqual(['10.00', '5.00']);
    });

    it('shows the hourly loss unit under each value column', () => {
      render('mod-1');
      const units = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('thead tr:nth-child(2) th')).map(text);
      expect(units).toEqual(['', 'MMBtu/hr', 'MMBtu/hr']);
    });

    it('uses whole numbers for units other than MMBtu, GJ, and kWh', () => {
      settings.set({ energyResultUnit: 'Btu' });
      baselineResults.set(makeResults({ totalWallLoss: 1234.56 }));
      render();
      expect(rowCells('Wall Losses')).toEqual(['1,235']);
    });

    it('shows placeholders in the modification column when the modification has no losses', () => {
      modificationResults.set(undefined);
      render('mod-1');
      expect(rowCells('Wall Losses')).toEqual(['10.00', `${EM_DASH} ${EM_DASH}`]);
    });

    it('shows placeholders for zero values', () => {
      render();
      expect(rowCells('Charge Materials')).toEqual([`${EM_DASH} ${EM_DASH}`]);
    });
  });

  describe('invalid modification', () => {
    it('shows the error lines in the modification header', () => {
      invalidModifications.set([{ id: 'mod-1', name: 'Better Walls', errors: ['Errors found in Wall'] }]);
      render('mod-1');
      const alert: HTMLElement = fixture.nativeElement.querySelector('thead th .alert-danger');
      expect(alert.innerText.split('\n').filter(Boolean)).toEqual(['Invalid Modification', 'Errors found in Wall']);
    });

    it('hides the alert when the modification is valid', () => {
      invalidModifications.set([{ id: 'other', name: 'Other', errors: ['Errors found in Wall'] }]);
      render('mod-1');
      expect(fixture.nativeElement.querySelector('.alert-danger')).toBeNull();
    });
  });

  describe('conditional rows', () => {
    it('hides configuration-specific rows when no category applies', () => {
      render();
      ['Aux Power Losses', 'Slag Losses', 'Available Heat', 'Flue Gas Losses', 'Fuel Input Available Heat', 'System Efficiency', 'Electrical Heat Delivered']
        .forEach(label => expect(row(label)).withContext(label).toBeUndefined());
    });

    it('shows fuel-fired rows when showFlueGas is set', () => {
      categories.set({ ...NO_CATEGORIES, showFlueGas: true });
      baselineResults.set(makeResults({ flueGasAvailableHeat: 55.5, flueGasSystemLosses: 3 }));
      render();
      expect(rowCells('Available Heat')).toEqual(['55.5%']);
      expect(rowCells('Flue Gas Losses')).toEqual(['3.00']);
    });

    it('shows system efficiency as a whole percent for baseline and modification', () => {
      categories.set({ ...NO_CATEGORIES, showSystemEff: true });
      baselineResults.set(makeResults({ heatingSystemEfficiency: 70 }));
      modificationResults.set(makeResults({ heatingSystemEfficiency: 75 }));
      render('mod-1');
      expect(rowCells('System Efficiency')).toEqual(['70%', '75%']);
    });

    it('reads EAF electrical heat from energy input heat delivered', () => {
      categories.set({ ...NO_CATEGORIES, showElectricalDelivered: true, showEafElectricalDelivered: true });
      settings.set({ energyResultUnit: 'kWh' });
      baselineResults.set(makeResults({ energyInputHeatDelivered: 8, electricalHeatDelivered: 9 }));
      render();
      expect(rowCells('Electrical Heat Delivered')).toEqual(['8.00']);
      expect(row('Electrical Heat Delivered')?.classList).not.toContain('tr-border');
    });

    it('reads non-EAF electrical heat from electrical heat delivered with a top border', () => {
      categories.set({ ...NO_CATEGORIES, showElectricalDelivered: true, showStandardElectricalDelivered: true });
      baselineResults.set(makeResults({ energyInputHeatDelivered: 8, electricalHeatDelivered: 9 }));
      render();
      expect(rowCells('Electrical Heat Delivered')).toEqual(['9.00']);
      expect(row('Electrical Heat Delivered')?.classList).toContain('tr-border');
    });
  });

  describe('baseline and modification with different energy sources', () => {
    beforeEach(() => {
      categories.set({ ...NO_CATEGORIES, showFlueGas: true, showHeatDelivered: true });
      modificationCategories.set({ ...NO_CATEGORIES, showSystemEff: true });
      baselineResults.set(makeResults({ flueGasSystemLosses: 3, energyInputHeatDelivered: 6, heatingSystemEfficiency: 70 }));
      modificationResults.set(makeResults({ flueGasSystemLosses: 4, heatingSystemEfficiency: 75, totalSystemLosses: 2 }));
    });

    it("shows the rows of both columns' energy sources", () => {
      render('mod-1');
      ['Flue Gas Losses', 'Fuel Heat Delivered', 'System Efficiency', 'Total System Losses']
        .forEach(label => expect(row(label)).withContext(label).toBeDefined());
    });

    it("shows a placeholder in a column whose energy source doesn't use the row", () => {
      render('mod-1');
      expect(rowCells('Flue Gas Losses')).toEqual(['3.00', `${EM_DASH} ${EM_DASH}`]);
      expect(rowCells('System Efficiency')).toEqual([`${EM_DASH} ${EM_DASH}`, '75%']);
    });

    it("shows only the baseline's rows on Baseline steps", () => {
      render();
      expect(row('System Efficiency')).toBeUndefined();
      expect(rowCells('Flue Gas Losses')).toEqual(['3.00']);
    });

    it('marks each row only one column uses with that energy source icon and says which scenario uses it', () => {
      modificationEnergySource.set({ energySourceType: 'Steam' });
      render('mod-1');

      const flueGasMarker = row('Flue Gas Losses')?.querySelector('.energy-source-marker');
      const efficiencyMarker = row('System Efficiency')?.querySelector('.energy-source-marker');
      expect(flueGasMarker?.classList).toContain('fa-fire');
      expect(flueGasMarker?.getAttribute('title')).toBe('Only used by Baseline (Fuel-fired)');
      expect(efficiencyMarker?.classList).toContain('fa-cloud');
      expect(efficiencyMarker?.getAttribute('title')).toBe('Only used by Better Walls (Steam-based)');
    });

    it('explains each icon the table uses in a titled legend below it, as energy source then scenario', () => {
      modificationEnergySource.set({ energySourceType: 'Steam' });
      render('mod-1');

      const items = [...fixture.nativeElement.querySelectorAll('.energy-source-legend li')] as HTMLElement[];
      expect(text(fixture.nativeElement.querySelector('.energy-source-legend-title'))).toBe('Results specific to Energy Source Type');
      expect(items.map(item => text(item))).toEqual(['Fuel-fired - Baseline', 'Steam-based - Better Walls']);
      expect(items[0].querySelector('.energy-source-legend-icon')?.classList).toContain('fa-fire');
      expect(items[1].querySelector('.energy-source-legend-icon')?.classList).toContain('fa-cloud');
    });

    it('keeps a marked row the same height as an unmarked one', () => {
      modificationEnergySource.set({ energySourceType: 'Steam' });
      render('mod-1');

      expect(row('Flue Gas Losses')?.querySelector('.energy-source-marker')).not.toBeNull();
      expect(row('Flue Gas Losses')?.getBoundingClientRect().height).toBe(row('Wall Losses')?.getBoundingClientRect().height);
    });

    it('leaves the markers out of the copied table text', () => {
      render('mod-1');
      fixture.componentInstance.updateCopyTableString();

      expect(fixture.componentInstance.copyTableString).not.toContain('Only used by');
    });
  });

  describe('energy source markers', () => {
    it('marks no row and shows no legend while both columns use the same rows', () => {
      categories.set({ ...NO_CATEGORIES, showFlueGas: true });
      render('mod-1');

      expect(fixture.nativeElement.querySelector('.energy-source-marker')).toBeNull();
      expect(fixture.nativeElement.querySelector('.energy-source-legend')).toBeNull();
    });

    it('marks no row on Baseline steps', () => {
      categories.set({ ...NO_CATEGORIES, showFlueGas: true });
      modificationCategories.set({ ...NO_CATEGORIES, showSystemEff: true });
      render();

      expect(fixture.nativeElement.querySelector('.energy-source-marker')).toBeNull();
    });
  });

  describe('separators', () => {
    it('underlines Other Losses and borders Gross Heat Input', () => {
      render();
      expect(row('Other Losses')?.classList).toContain('tr-underline');
      expect(row('Gross Heat Input')?.classList).toContain('tr-border');
    });
  });

  describe('CO2 emissions', () => {
    it('hides the rows when operational impacts are disabled', () => {
      render('mod-1');
      expect(row('CO2 Emissions')).toBeUndefined();
    });

    it('shows the imperial unit and hourly emissions', () => {
      showOperationalImpacts.set(true);
      baselineResults.set(makeResults({ co2EmissionsOutput: co2(12.345) }));
      render();
      expect(text(row('CO2 Emissions')?.cells[0])).toBe('CO2 Emissions (ton CO2)');
      expect(rowCells('CO2 Emissions')).toEqual(['12.35']);
    });

    it('shows the metric unit', () => {
      showOperationalImpacts.set(true);
      settings.set({ energyResultUnit: 'GJ', emissionsUnit: 'Metric' });
      render();
      expect(text(row('CO2 Emissions')?.cells[0])).toBe('CO2 Emissions (tonne CO2)');
    });

    it('omits the savings row on Baseline steps', () => {
      showOperationalImpacts.set(true);
      render();
      expect(row('CO2 Emissions Savings')).toBeUndefined();
    });

    it('shows savings for the modification against baseline', () => {
      showOperationalImpacts.set(true);
      const baseline = makeResults({ co2EmissionsOutput: co2(10) });
      const modification = makeResults({ co2EmissionsOutput: co2(7.5) });
      baselineResults.set(baseline);
      modificationResults.set(modification);
      render('mod-1');
      expect(resultsService.getCo2EmissionsSavings).toHaveBeenCalledWith(baseline, modification, 'hourlyTotalEmissionOutput');
      expect(rowCells('CO2 Emissions Savings')).toEqual([`${EM_DASH} ${EM_DASH}`, '2.5']);
      expect(row('CO2 Emissions Savings')?.classList).toContain('tr-underline');
    });

    it('shows placeholders when the modification emissions object has no hourly value', () => {
      showOperationalImpacts.set(true);
      baselineResults.set(makeResults({ co2EmissionsOutput: co2(10) }));
      modificationResults.set(makeResults({ co2EmissionsOutput: co2(undefined) }));
      resultsService.getCo2EmissionsSavings.and.returnValue(undefined);
      render('mod-1');
      expect(rowCells('CO2 Emissions')).toEqual(['10', `${EM_DASH} ${EM_DASH}`]);
    });

    it('shows a zero modification value', () => {
      showOperationalImpacts.set(true);
      baselineResults.set(makeResults({ co2EmissionsOutput: co2(10) }));
      modificationResults.set(makeResults({ co2EmissionsOutput: co2(0) }));
      render('mod-1');
      expect(rowCells('CO2 Emissions')).toEqual(['10', '0']);
    });

    it('shows a placeholder in the savings cell when savings are undefined', () => {
      showOperationalImpacts.set(true);
      baselineResults.set(makeResults({ co2EmissionsOutput: co2(10) }));
      modificationResults.set(makeResults({ co2EmissionsOutput: co2(7.5) }));
      resultsService.getCo2EmissionsSavings.and.returnValue(undefined);
      render('mod-1');
      expect(rowCells('CO2 Emissions Savings')).toEqual([`${EM_DASH} ${EM_DASH}`, `${EM_DASH} ${EM_DASH}`]);
    });
  });

  describe('reactivity', () => {
    it('updates rendered values when results change', () => {
      render('mod-1');
      modificationResults.set(makeResults({ totalWallLoss: 99 }));
      fixture.detectChanges();
      expect(rowCells('Wall Losses')).toEqual(['10.00', '99.00']);
    });
  });
});
