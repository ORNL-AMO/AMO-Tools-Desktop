import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ExploreOpportunitiesResultsComponent } from './explore-opportunities-results.component';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { PSAT, PsatOutputs, PsatValid } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', powerMeasurement: 'kW', currency: 'USD', emissionsUnit: 'Imperial' } as Settings;

function makeOutputs(overrides: Partial<PsatOutputs> = {}): PsatOutputs {
  return {
    pump_efficiency: 80,
    motor_rated_power: 50,
    motor_shaft_power: 45,
    mover_shaft_power: 44,
    motor_efficiency: 90,
    motor_power_factor: 0.9,
    motor_current: 10,
    motor_power: 40,
    load_factor: 0.8,
    drive_efficiency: 100,
    annual_energy: 1000,
    annual_cost: 5000,
    annual_savings_potential: 0,
    optimization_rating: 1,
    percent_annual_savings: 0,
    co2EmissionsOutput: 500,
    ...overrides,
  };
}

const VALID: PsatValid = { isValid: true, pumpFluidValid: true, motorValid: true, fieldDataValid: true };

function makePsat(whatIfScenario: boolean, valid: PsatValid = VALID, optimizeCalculation: boolean = false): PSAT {
  return {
    modifications: [
      {
        id: 'mod-1',
        psat: {
          inputs: { operating_hours: 8760, fluidType: 'water', fluidTemperature: 60, whatIfScenario, optimize_calculation: optimizeCalculation } as any,
          valid,
        },
      },
    ],
  };
}

describe('ExploreOpportunitiesResultsComponent', () => {
  let component: ExploreOpportunitiesResultsComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesResultsComponent>;
  let showOperationalImpactsSignal: ReturnType<typeof signal<boolean>>;

  function setupComponent(target: ExploreOpportunitiesResultsComponent) {
    target.baselineResults = makeOutputs();
    target.modificationResults = makeOutputs();
    target.settings = MOCK_SETTINGS;
    target.psat = makePsat(true);
    target.exploreModIndex = 0;
    target.percentSavings = 20;
    target.annualSavings = 1000;
    target.modificationName = 'Modification 1';
    target.inSetup = false;
  }

  beforeEach(async () => {
    showOperationalImpactsSignal = signal(false);
    const featureFlagServiceSpy = jasmine.createSpyObj('FeatureFlagService', [], { showOperationalImpacts: showOperationalImpactsSignal });

    await TestBed.configureTestingModule({
      declarations: [ExploreOpportunitiesResultsComponent],
      providers: [
        { provide: FeatureFlagService, useValue: featureFlagServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreOpportunitiesResultsComponent);
    component = fixture.componentInstance;
    setupComponent(component);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('sets isWhatIfScenario from the current modification when not in setup and modifications exist', () => {
      expect(component.isWhatIfScenario).toBeTrue();
    });

    it('does not set isWhatIfScenario when inSetup is true', () => {
      const freshFixture = TestBed.createComponent(ExploreOpportunitiesResultsComponent);
      const freshComponent = freshFixture.componentInstance;
      setupComponent(freshComponent);
      freshComponent.inSetup = true;

      freshFixture.detectChanges();

      expect(freshComponent.isWhatIfScenario).toBeUndefined();
    });

    it('does not set isWhatIfScenario when there are no modifications', () => {
      // Exercises ngOnInit directly rather than via detectChanges: the template
      // itself assumes psat.modifications[exploreModIndex] exists whenever
      // inSetup is false (true in the real app, since the parent only renders
      // this component for an existing modification), so a full render with an
      // empty modifications array here would fail for reasons unrelated to the
      // ngOnInit guard under test.
      const freshFixture = TestBed.createComponent(ExploreOpportunitiesResultsComponent);
      const freshComponent = freshFixture.componentInstance;
      setupComponent(freshComponent);
      freshComponent.psat = { modifications: [] };

      freshComponent.ngOnInit();

      expect(freshComponent.isWhatIfScenario).toBeUndefined();
    });
  });

  describe('getDiff', () => {
    it('returns null when the difference is within +/-0.005', () => {
      expect(component.getDiff(10, 10.003)).toBeNull();
      expect(component.getDiff(10, 9.997)).toBeNull();
    });

    it('returns the numeric difference when it is outside +/-0.005', () => {
      expect(component.getDiff(10, 8)).toBe(2);
    });
  });

  describe('hideResults', () => {
    it('hides results immediately and shows them again after the timeout', fakeAsync(() => {
      component.hideResults();
      expect(component.showResults).toBeFalse();

      tick(100);

      expect(component.showResults).toBeTrue();
    }));

    it('clears a pending timeout when called again before it fires', fakeAsync(() => {
      component.hideResults();
      tick(50);
      component.hideResults();
      tick(50);

      expect(component.showResults).toBeFalse();

      tick(50);

      expect(component.showResults).toBeTrue();
    }));
  });

  describe('template visibility', () => {
    it('hides the results table when showResults is false', () => {
      component.showResults = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.my-table')).toBeNull();
    });

    it('shows the results table when showResults is true', () => {
      expect(fixture.nativeElement.querySelector('.my-table')).not.toBeNull();
    });

    it('hides the modification column when inSetup is true', () => {
      component.inSetup = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Modification 1');
    });

    it('shows the modification column when inSetup is false', () => {
      expect(fixture.nativeElement.textContent).toContain('Modification 1');
    });

    it('shows the percent savings value and percent graph when valid and non-negative', () => {
      expect(fixture.nativeElement.textContent).toContain('20%');
      expect(fixture.nativeElement.querySelector('app-percent-graph')).not.toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain('Invalid Baseline');
    });

    it('shows 0% when valid but percentSavings is negative', () => {
      component.percentSavings = -5;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('0%');
    });

    it('shows the invalid-baseline message and per-section errors when the modification psat is invalid', () => {
      component.psat = makePsat(true, { isValid: false, pumpFluidValid: false, motorValid: true, fieldDataValid: false });
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Invalid Baseline');
      expect(fixture.nativeElement.textContent).toContain('Errors found in Pump Fluid');
      expect(fixture.nativeElement.textContent).not.toContain('Errors found in Motor Data');
      expect(fixture.nativeElement.textContent).toContain('Errors found in Field');
      expect(fixture.nativeElement.querySelector('app-percent-graph')).toBeNull();
    });

    it('shows the modification motor efficiency value when present', () => {
      component.modificationResults = makeOutputs({ motor_efficiency: 95 });
      fixture.detectChanges();
      const rows = fixture.nativeElement.querySelectorAll('.my-table-item');
      const efficiencyRow = Array.from(rows).find((row: HTMLElement) => row.textContent.includes('Motor efficiency')) as HTMLElement;
      expect(efficiencyRow.textContent).toContain('95');
    });

    it('shows an em-dash for modification motor efficiency when it is falsy', () => {
      component.modificationResults = makeOutputs({ motor_efficiency: 0 });
      fixture.detectChanges();
      const rows = fixture.nativeElement.querySelectorAll('.my-table-item');
      const efficiencyRow = Array.from(rows).find((row: HTMLElement) => row.textContent.includes('Motor efficiency')) as HTMLElement;
      expect(efficiencyRow.textContent).toContain('—');
    });

    it('shows the modification percent loaded value when present', () => {
      component.modificationResults = makeOutputs({ load_factor: 0.5 });
      fixture.detectChanges();
      const rows = fixture.nativeElement.querySelectorAll('.my-table-item');
      const loadedRow = Array.from(rows).find((row: HTMLElement) => row.textContent.includes('Percent Loaded')) as HTMLElement;
      expect(loadedRow.textContent).toContain('50');
    });

    it('shows an em-dash for percent loaded when it is falsy', () => {
      component.modificationResults = makeOutputs({ load_factor: 0 });
      fixture.detectChanges();
      const rows = fixture.nativeElement.querySelectorAll('.my-table-item');
      const loadedRow = Array.from(rows).find((row: HTMLElement) => row.textContent.includes('Percent Loaded')) as HTMLElement;
      expect(loadedRow.textContent).toContain('—');
    });

    it('hides the operational impacts (CO2) rows when the feature flag is off', () => {
      expect(fixture.nativeElement.textContent).not.toContain('Annual CO2 Emissions');
    });

    it('shows the operational impacts (CO2) rows when the feature flag is on', () => {
      showOperationalImpactsSignal.set(true);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Annual CO2 Emissions');
    });

    it('shows the Imperial CO2 unit label when settings.emissionsUnit is Imperial', () => {
      showOperationalImpactsSignal.set(true);
      component.settings = { ...MOCK_SETTINGS, emissionsUnit: 'Imperial' } as Settings;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('ton CO');
      expect(fixture.nativeElement.textContent).not.toContain('tonne CO');
    });

    it('shows the Metric CO2 unit label when settings.emissionsUnit is Metric', () => {
      showOperationalImpactsSignal.set(true);
      component.settings = { ...MOCK_SETTINGS, emissionsUnit: 'Metric' } as Settings;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('tonne CO');
    });

    it('shows the CO2 savings diff when it is a what-if scenario and the diff is meaningful', () => {
      showOperationalImpactsSignal.set(true);
      component.psat = makePsat(true);
      component.baselineResults = makeOutputs({ co2EmissionsOutput: 500 });
      component.modificationResults = makeOutputs({ co2EmissionsOutput: 400 });
      fixture.detectChanges();
      const rows = fixture.nativeElement.querySelectorAll('.my-table-item');
      const savingsRow = Array.from(rows).find((row: HTMLElement) => row.textContent.includes('Annual CO2 Emissions Savings')) as HTMLElement;
      expect(savingsRow.textContent).toContain('100');
    });

    it('shows an em-dash for CO2 savings when it is not a what-if scenario', () => {
      showOperationalImpactsSignal.set(true);
      component.psat = makePsat(false);
      fixture.detectChanges();
      const rows = fixture.nativeElement.querySelectorAll('.my-table-item');
      const savingsRow = Array.from(rows).find((row: HTMLElement) => row.textContent.includes('Annual CO2 Emissions Savings')) as HTMLElement;
      expect(savingsRow.textContent).toContain('—');
    });

    it('shows the annual savings value when it is a what-if scenario', () => {
      component.psat = makePsat(true);
      component.annualSavings = 1234;
      fixture.detectChanges();
      const rows = fixture.nativeElement.querySelectorAll('.my-table-bg.my-table-item');
      const savingsRow = Array.from(rows).find((row: HTMLElement) => row.textContent.includes('Annual Savings')) as HTMLElement;
      expect(savingsRow.textContent).toContain('1,234');
    });

    it('shows an em-dash for annual savings when it is not a what-if scenario', () => {
      component.psat = makePsat(false);
      component.annualSavings = 1234;
      fixture.detectChanges();
      const rows = fixture.nativeElement.querySelectorAll('.my-table-bg.my-table-item');
      const savingsRow = Array.from(rows).find((row: HTMLElement) => row.textContent.includes('Annual Savings')) as HTMLElement;
      expect(savingsRow.textContent).toContain('—');
    });

    it('hides the optimized footer row when optimize_calculation is false', () => {
      expect(fixture.nativeElement.textContent).not.toContain('*Optimized');
    });

    it('shows the optimized footer row when optimize_calculation is true', () => {
      component.psat = makePsat(true, VALID, true);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('*Optimized');
    });

    it('hides the optimized footer row when inSetup is true even if optimize_calculation is true', () => {
      component.psat = makePsat(true, VALID, true);
      component.inSetup = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('*Optimized');
    });
  });
});
