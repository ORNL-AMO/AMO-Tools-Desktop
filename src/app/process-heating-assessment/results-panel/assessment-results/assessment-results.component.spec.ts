import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { PhastResults } from '../../models/phast';
import { ProcessHeatingModification } from '../../models/modification';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';
import { ModificationService } from '../../services/modification.service';
import { InvalidModification, ProcessHeatingValidityService } from '../../services/process-heating-validity.service';
import { AssessmentResultsComponent } from './assessment-results.component';

const NO_CATEGORIES: ShowResultsCategories = {
  showSlag: false,
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

function co2(hourlyTotalEmissionOutput: number): PhastResults['co2EmissionsOutput'] {
  return { hourlyTotalEmissionOutput } as PhastResults['co2EmissionsOutput'];
}

describe('AssessmentResultsComponent', () => {
  let fixture: ComponentFixture<AssessmentResultsComponent>;
  let categories: WritableSignal<ShowResultsCategories>;
  let baselineResults: WritableSignal<PhastResults | undefined>;
  let modificationResults: WritableSignal<PhastResults | undefined>;
  let settings: WritableSignal<Partial<Settings>>;
  let invalidModifications: WritableSignal<InvalidModification[]>;
  let showOperationalImpacts: WritableSignal<boolean>;
  let resultsService: jasmine.SpyObj<ProcessHeatingResultsService>;

  function text(el: Element | null): string {
    return el?.textContent.replace(/\s+/g, ' ').trim() ?? '';
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
    baselineResults = signal(makeResults());
    modificationResults = signal(makeResults({ totalWallLoss: 5 }));
    settings = signal<Partial<Settings>>({ energyResultUnit: 'MMBtu', emissionsUnit: 'Imperial' });
    invalidModifications = signal([]);
    showOperationalImpacts = signal(false);

    resultsService = jasmine.createSpyObj<ProcessHeatingResultsService>('ProcessHeatingResultsService', [
      'scenarioResults',
      'getResultCategories',
      'getCo2EmissionsSavings',
    ]);
    resultsService.scenarioResults.and.callFake(scenario => (scenario === 'baseline' ? baselineResults() : modificationResults()));
    resultsService.getResultCategories.and.callFake(() => categories());
    resultsService.getCo2EmissionsSavings.and.returnValue(2.5);

    TestBed.configureTestingModule({
      declarations: [AssessmentResultsComponent],
      providers: [
        { provide: ProcessHeatingAssessmentService, useValue: { settingsSignal: settings } },
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
      expect(rowCells('Wall Losses')).toEqual(['10.00', '— —']);
    });

    it('shows placeholders for zero values', () => {
      render();
      expect(rowCells('Charge Materials')).toEqual(['— —']);
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
      ['Aux Power Losses', 'Slag Losses', 'Available Heat (%)', 'Flue Gas Losses', 'Fuel Input Available Heat', 'System Efficiency', 'Electrical Heat Delivered']
        .forEach(label => expect(row(label)).withContext(label).toBeUndefined());
    });

    it('shows fuel-fired rows when showFlueGas is set', () => {
      categories.set({ ...NO_CATEGORIES, showFlueGas: true });
      baselineResults.set(makeResults({ flueGasAvailableHeat: 55.5, flueGasSystemLosses: 3 }));
      render();
      expect(rowCells('Available Heat (%)')).toEqual(['55.5%']);
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
      categories.set({ ...NO_CATEGORIES, showElectricalDelivered: true });
      settings.set({ energyResultUnit: 'kWh', furnaceType: 'Electric Arc Furnace (EAF)' });
      baselineResults.set(makeResults({ energyInputHeatDelivered: 8, electricalHeatDelivered: 9 }));
      render();
      expect(rowCells('Electrical Heat Delivered')).toEqual(['8.00']);
      expect(row('Electrical Heat Delivered').classList).not.toContain('tr-border');
    });

    it('reads non-EAF electrical heat from electrical heat delivered with a top border', () => {
      categories.set({ ...NO_CATEGORIES, showElectricalDelivered: true });
      baselineResults.set(makeResults({ energyInputHeatDelivered: 8, electricalHeatDelivered: 9 }));
      render();
      expect(rowCells('Electrical Heat Delivered')).toEqual(['9.00']);
      expect(row('Electrical Heat Delivered').classList).toContain('tr-border');
    });
  });

  describe('separators', () => {
    it('underlines Other Losses and borders Gross Heat Input', () => {
      render();
      expect(row('Other Losses').classList).toContain('tr-underline');
      expect(row('Gross Heat Input').classList).toContain('tr-border');
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
      expect(text(row('CO2 Emissions').cells[0])).toBe('CO2 Emissions (ton CO2)');
      expect(rowCells('CO2 Emissions')).toEqual(['12.35']);
    });

    it('shows the metric unit', () => {
      showOperationalImpacts.set(true);
      settings.set({ energyResultUnit: 'GJ', emissionsUnit: 'Metric' });
      render();
      expect(text(row('CO2 Emissions').cells[0])).toBe('CO2 Emissions (tonne CO2)');
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
      expect(rowCells('CO2 Emissions Savings')).toEqual(['— —', '2.5']);
      expect(row('CO2 Emissions Savings').classList).toContain('tr-underline');
    });

    it('shows placeholders when the modification emissions object has no hourly value', () => {
      showOperationalImpacts.set(true);
      baselineResults.set(makeResults({ co2EmissionsOutput: co2(10) }));
      modificationResults.set(makeResults({ co2EmissionsOutput: co2(undefined) }));
      resultsService.getCo2EmissionsSavings.and.returnValue(undefined);
      render('mod-1');
      expect(rowCells('CO2 Emissions')).toEqual(['10', '— —']);
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
      expect(rowCells('CO2 Emissions Savings')).toEqual(['— —', '— —']);
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
