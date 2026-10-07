import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { PhastResults } from '../../models/phast';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';
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

const LABELS = {
  auxPower: 'Aux Power Losses',
  slag: 'Slag Losses',
  flueGasAvailableHeat: 'Available Heat (%)',
  flueGasSystemLosses: 'Flue Gas System Losses',
  exothermic: 'Exothermic Heat from Process',
  fuelInputAvailableHeat: 'Fuel Input Available Heat',
  exhaustGas: 'Exhaust Gas Losses',
  systemEfficiency: 'System Efficiency',
  totalSystemLosses: 'Total System Losses',
  co2: 'CO2 Emissions',
};

describe('AssessmentResultsComponent', () => {
  let fixture: ComponentFixture<AssessmentResultsComponent>;
  let categories: WritableSignal<ShowResultsCategories>;
  let results: WritableSignal<Partial<PhastResults>>;
  let settings: WritableSignal<Partial<Settings>>;
  let showOperationalImpacts: WritableSignal<boolean>;
  let resultsService: jasmine.SpyObj<ProcessHeatingResultsService>;

  function labels(): string[] {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.result-label')).map((el) =>
      el.textContent.replace(/\s+/g, ' ').trim()
    );
  }

  function rowValue(label: string): string {
    const row = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.result-row')).find((el) =>
      el.querySelector('.result-label').textContent.replace(/\s+/g, ' ').trim().startsWith(label)
    );
    return row?.querySelector('.result-value').textContent.replace(/\s+/g, ' ').trim();
  }

  function render(): void {
    fixture.detectChanges();
  }

  beforeEach(() => {
    categories = signal<ShowResultsCategories>({ ...NO_CATEGORIES });
    results = signal<Partial<PhastResults>>({
      totalInput: 10,
      grossHeatInput: 20,
      totalAuxPower: 1.5,
      totalSlag: 2.5,
      flueGasAvailableHeat: 55.5,
      flueGasSystemLosses: 3,
      exothermicHeat: 4,
      availableHeatPercent: 60,
      totalExhaustGas: 5,
      totalExhaustGasEAF: 6,
      heatingSystemEfficiency: 70,
      totalSystemLosses: 7,
    });
    settings = signal<Partial<Settings>>({ emissionsUnit: 'Imperial' });
    showOperationalImpacts = signal(false);

    resultsService = jasmine.createSpyObj<ProcessHeatingResultsService>('ProcessHeatingResultsService', [
      'getResults',
      'getResultCategories',
    ]);
    resultsService.getResults.and.callFake(() => results() as PhastResults);
    resultsService.getResultCategories.and.callFake(() => categories());

    const assessmentService = jasmine.createSpyObj('ProcessHeatingAssessmentService', ['scenarioPhastSignal'], {
      settingsSignal: settings,
    });
    assessmentService.scenarioPhastSignal.and.returnValue({ losses: {} });

    TestBed.configureTestingModule({
      declarations: [AssessmentResultsComponent],
      providers: [
        { provide: ProcessHeatingAssessmentService, useValue: assessmentService },
        { provide: ProcessHeatingResultsService, useValue: resultsService },
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

    it('renders nothing when results are unavailable', () => {
      resultsService.getResults.and.returnValue(undefined);
      render();
      expect(fixture.nativeElement.querySelector('.results-panel')).toBeNull();
    });

    it('does not log results to the console', () => {
      const log = spyOn(console, 'log');
      render();
      expect(log).not.toHaveBeenCalled();
    });
  });

  describe('base rows', () => {
    it('always shows Total Available Heat Required and Gross Heat Input', () => {
      render();
      expect(rowValue('Total Available Heat Required')).toBe('10.00');
      expect(rowValue('Gross Heat Input')).toBe('20.00');
    });

    it('shows Exothermic Heat for every configuration', () => {
      render();
      expect(labels()).toContain(LABELS.exothermic);
    });
  });

  describe('conditional rows', () => {
    it('hides every conditional row when no category applies', () => {
      render();
      [
        LABELS.auxPower,
        LABELS.slag,
        LABELS.flueGasAvailableHeat,
        LABELS.flueGasSystemLosses,
        LABELS.fuelInputAvailableHeat,
        LABELS.exhaustGas,
        LABELS.systemEfficiency,
        LABELS.totalSystemLosses,
      ].forEach((label) => expect(labels()).not.toContain(label));
    });

    it('shows Aux Power Losses when showAuxPower is set', () => {
      categories.set({ ...NO_CATEGORIES, showAuxPower: true });
      render();
      expect(rowValue(LABELS.auxPower)).toBe('1.50');
    });

    it('shows Slag Losses when showSlag is set', () => {
      categories.set({ ...NO_CATEGORIES, showSlag: true });
      render();
      expect(rowValue(LABELS.slag)).toBe('2.50');
    });

    it('shows fuel-fired rows when showFlueGas is set', () => {
      categories.set({ ...NO_CATEGORIES, showFlueGas: true });
      render();
      expect(rowValue(LABELS.flueGasAvailableHeat)).toBe('55.5%');
      expect(rowValue(LABELS.flueGasSystemLosses)).toBe('3.00');
    });

    it('shows standard electrotechnology rows when the configuration applies', () => {
      categories.set({ ...NO_CATEGORIES, showEnInput2: true });
      render();
      expect(rowValue(LABELS.fuelInputAvailableHeat)).toBe('60%');
      expect(rowValue(LABELS.exhaustGas)).toBe('5.00');
    });

    it('shows the EAF exhaust gas row when showExGas is set', () => {
      categories.set({ ...NO_CATEGORIES, showExGas: true });
      render();
      expect(rowValue(LABELS.exhaustGas)).toBe('6.00');
    });

    it('shows system efficiency rows when showSystemEff is set', () => {
      categories.set({ ...NO_CATEGORIES, showSystemEff: true });
      render();
      expect(rowValue(LABELS.systemEfficiency)).toBe('70%');
      expect(rowValue(LABELS.totalSystemLosses)).toBe('7.00');
    });
  });

  describe('CO2 emissions', () => {
    it('hides the row when operational impacts are disabled', () => {
      render();
      expect(labels().some((label) => label.startsWith('CO2 Emissions'))).toBeFalse();
    });

    it('shows the imperial unit and value when enabled', () => {
      showOperationalImpacts.set(true);
      results.update((r) => ({ ...r, co2EmissionsOutput: { hourlyTotalEmissionOutput: 12.345 } as PhastResults['co2EmissionsOutput'] }));
      render();
      expect(labels()).toContain(`${LABELS.co2} (ton CO2)`);
      expect(rowValue(LABELS.co2)).toBe('12.35');
    });

    it('shows the metric unit when emissionsUnit is Metric', () => {
      showOperationalImpacts.set(true);
      settings.set({ emissionsUnit: 'Metric' });
      render();
      expect(labels()).toContain(`${LABELS.co2} (tonne CO2)`);
    });

    it('shows zero when emissions are zero', () => {
      showOperationalImpacts.set(true);
      results.update((r) => ({ ...r, co2EmissionsOutput: { hourlyTotalEmissionOutput: 0 } as PhastResults['co2EmissionsOutput'] }));
      render();
      expect(rowValue(LABELS.co2)).toBe('0');
    });

    it('shows a placeholder when emissions are missing', () => {
      showOperationalImpacts.set(true);
      render();
      expect(rowValue(LABELS.co2)).toBe('— —');
    });
  });

  describe('reactivity', () => {
    it('updates rendered values when results change', () => {
      render();
      expect(rowValue('Gross Heat Input')).toBe('20.00');
      results.update((r) => ({ ...r, grossHeatInput: 99 }));
      render();
      expect(rowValue('Gross Heat Input')).toBe('99.00');
    });

    it('requests results for the scenario input', () => {
      fixture.componentRef.setInput('scenario', 'mod-1');
      render();
      const assessmentService = TestBed.inject(ProcessHeatingAssessmentService) as jasmine.SpyObj<ProcessHeatingAssessmentService>;
      expect(assessmentService.scenarioPhastSignal).toHaveBeenCalledWith('mod-1');
    });
  });
});
