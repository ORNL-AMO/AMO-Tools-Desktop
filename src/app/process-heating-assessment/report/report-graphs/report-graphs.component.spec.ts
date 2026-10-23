import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { InvalidModification, ProcessHeatingValidityService } from '../../services/process-heating-validity.service';
import { ReportGraphsComponent } from './report-graphs.component';
import { ReportGraphsResultsService, ReportGraphsUI } from './report-graphs-results.service';

function buildUI(overrides: Partial<ReportGraphsUI> = {}): ReportGraphsUI {
  return {
    scenarios: [
      { id: 'baseline', name: 'Baseline', lossValuesAndLabels: [{ label: 'Wall', value: 2 }], deliverValuesAndLabels: [] },
      { id: 'mod1', name: 'Scenario 1', lossValuesAndLabels: [{ label: 'Wall', value: 1 }], deliverValuesAndLabels: [{ label: 'Electrical Energy Input', value: 5 }] },
      { id: 'mod2', name: 'Scenario 2', lossValuesAndLabels: [{ label: 'Wall', value: 0.5 }], deliverValuesAndLabels: [] },
    ],
    lossUnit: 'MMBtu/hr',
    deliverUnit: 'kW',
    barChartYAxisLabel: 'Heat Loss (MMBtu/hr)',
    ...overrides,
  };
}

describe('ReportGraphsComponent', () => {
  let fixture: ComponentFixture<ReportGraphsComponent>;
  let component: ReportGraphsComponent;
  let ui: WritableSignal<ReportGraphsUI | undefined>;
  let invalidModifications: WritableSignal<InvalidModification[]>;

  const pies = (): number => fixture.nativeElement.querySelectorAll('app-plotly-pie-chart').length;

  beforeEach(() => {
    ui = signal<ReportGraphsUI | undefined>(buildUI());
    invalidModifications = signal<InvalidModification[]>([]);
    TestBed.configureTestingModule({
      declarations: [ReportGraphsComponent],
      imports: [FormsModule],
      providers: [
        { provide: ReportGraphsResultsService, useValue: { reportGraphsUI: ui } },
        { provide: ProcessHeatingValidityService, useValue: { invalidModifications } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ReportGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('defaults to baseline and the first modification', () => {
    expect(component.baselineScenario().id).toBe('baseline');
    expect(component.modificationScenario().id).toBe('mod1');
  });

  it('renders loss pies for both sides plus the delivered heat pie only where present', () => {
    expect(pies()).toBe(3);
  });

  it('renders the comparison bar chart for the selected scenarios', () => {
    expect(fixture.nativeElement.querySelector('app-plotly-bar-chart')).not.toBeNull();
    expect(component.barChartData().map(data => data.name)).toEqual(['Baseline', 'Scenario 1']);
  });

  it('updates the modification side when another scenario is picked', () => {
    component.modificationSelection.set('mod2');
    fixture.detectChanges();
    expect(component.modificationScenario().id).toBe('mod2');
    expect(component.barChartData().map(data => data.name)).toEqual(['Baseline', 'Scenario 2']);
    expect(pies()).toBe(2);
  });

  it('shows only the baseline side when there are no modifications', () => {
    ui.set(buildUI({ scenarios: buildUI().scenarios.slice(0, 1) }));
    fixture.detectChanges();
    expect(pies()).toBe(1);
    expect(fixture.nativeElement.querySelector('app-plotly-bar-chart')).toBeNull();
  });

  it('shows the invalid modification alert only when a modification is invalid', () => {
    const alert = (): Element | null => fixture.nativeElement.querySelector('app-invalid-modification-alert');
    expect(alert()).toBeNull();

    invalidModifications.set([{ id: 'mod1', name: 'Scenario 1', errors: ['Errors found in Wall'] }]);
    fixture.detectChanges();

    expect(alert()).not.toBeNull();
  });

  it('renders nothing when results are unavailable', () => {
    ui.set(undefined);
    fixture.detectChanges();
    expect(pies()).toBe(0);
  });
});
