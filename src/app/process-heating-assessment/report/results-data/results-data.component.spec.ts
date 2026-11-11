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
    auxiliaryEquipmentRows: [],
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

  describe('invalid modification', () => {
    const headerCell = (index: number): HTMLElement => fixture.nativeElement.querySelectorAll('thead th')[index];

    beforeEach(() => {
      ui.set(buildUI({ modificationNames: [{ id: 'mod1', name: 'Scenario 1' }, { id: 'mod2', name: 'Scenario 2' }] }));
    });

    it('shows no alert when every modification is valid', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.alert-danger')).toBeNull();
    });

    it('shows the errors above the invalid modification name only', () => {
      invalidModifications.set([{ id: 'mod2', name: 'Scenario 2', errors: ['Errors found in Wall'] }]);
      fixture.detectChanges();

      expect(headerCell(2).querySelector('.alert-danger')).toBeNull();
      const alert: HTMLElement = headerCell(3).querySelector('.alert-danger');
      expect(alert.innerText.split('\n').filter(Boolean)).toEqual(['Invalid Modification', 'Errors found in Wall']);
      expect(alert.nextElementSibling.textContent.trim()).toBe('Scenario 2');
    });
  });
});
