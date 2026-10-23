import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvalidModification, ProcessHeatingValidityService } from '../../services/process-heating-validity.service';
import { ReportTableCellPipe } from '../../../shared/pipes/report-table-cell.pipe';
import { ResultsDataComponent } from './results-data.component';
import { ResultsDataResultsService, ResultsDataUI } from './results-data-results.service';

function buildUI(overrides: Partial<ResultsDataUI> = {}): ResultsDataUI {
  return {
    modificationNames: [{ id: 'mod1', name: 'Scenario 1' }],
    title: 'Hourly Energy Loss/Use (MMBtu/hr)',
    rows: [
      { label: 'Wall Losses', className: 'default', baseline: { value: 1.5, decimalPipe: '1.2-2' }, modifications: [{ value: 1.25, decimalPipe: '1.2-2' }] },
      { label: 'Available Heat', units: '%', className: 'default', baseline: { value: 55, decimalPipe: '1.0-0' }, modifications: [{ value: null }] },
      { label: 'Gross Heat Input', className: 'emphasis', baseline: { value: 10, decimalPipe: '1.2-2' }, modifications: [{ value: 8, decimalPipe: '1.2-2' }] },
    ],
    ...overrides,
  };
}

describe('ResultsDataComponent', () => {
  let fixture: ComponentFixture<ResultsDataComponent>;
  let invalidModifications: WritableSignal<InvalidModification[]>;
  let ui: WritableSignal<ResultsDataUI | undefined>;

  const text = (): string => fixture.nativeElement.textContent.replace(/\s+/g, ' ');

  beforeEach(() => {
    invalidModifications = signal<InvalidModification[]>([]);
    ui = signal<ResultsDataUI | undefined>(buildUI());
    TestBed.configureTestingModule({
      declarations: [ResultsDataComponent],
      imports: [ReportTableCellPipe],
      providers: [
        { provide: ResultsDataResultsService, useValue: { resultsDataUI: ui } },
        { provide: ProcessHeatingValidityService, useValue: { invalidModifications } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ResultsDataComponent);
    fixture.detectChanges();
  });

  it('renders the unit header with baseline and modification columns', () => {
    expect(text()).toContain('Hourly Energy Loss/Use (MMBtu/hr)');
    expect(text()).toContain('Baseline');
    expect(text()).toContain('Scenario 1');
  });

  it('renders formatted values and row units', () => {
    expect(text()).toContain('1.50');
    expect(text()).toContain('1.25');
    expect(text()).toContain('Available Heat(%)');
  });

  it('applies the emphasis class to the gross heat input row', () => {
    const emphasized = fixture.nativeElement.querySelectorAll('tr.emphasis');
    expect(emphasized.length).toBe(1);
    expect(emphasized[0].textContent).toContain('Gross Heat Input');
  });

  it('renders no table when results are unavailable', () => {
    ui.set(undefined);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('shows the invalid modification alert only when a modification is invalid', () => {
    const alert = (): Element | null => fixture.nativeElement.querySelector('app-invalid-modification-alert');
    expect(alert()).toBeNull();

    invalidModifications.set([{ id: 'mod1', name: 'Scenario 1', errors: ['Errors found in Wall'] }]);
    fixture.detectChanges();

    expect(alert()).not.toBeNull();
  });
});
