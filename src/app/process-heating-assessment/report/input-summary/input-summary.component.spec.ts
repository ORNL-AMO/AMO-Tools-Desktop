import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportTableCellPipe } from '../../../shared/pipes/report-table-cell.pipe';
import { InputSummaryComponent } from './input-summary.component';
import { InputSummaryResultsService, InputSummaryUI } from './input-summary-results.service';

function buildUI(): InputSummaryUI {
  return {
    modificationNames: [{ id: 'mod1', name: 'Scenario 1' }],
    categories: [{
      label: 'Wall Loss',
      count: 1,
      sections: [{
        label: 'Wall Loss 1: North wall',
        rows: [
          { label: 'Ambient Temperature', units: '℉', baseline: { value: 80 }, modifications: [{ value: 80 }] },
          { label: 'Average Surface Temperature', units: '℉', baseline: { value: 300 }, modifications: [{ value: 250 }] },
        ],
      }],
    }, {
      label: 'Operations',
      sections: [{
        label: 'Operations',
        rows: [{ label: 'Fuel Cost', baseline: { value: 5 }, modifications: [{ value: 5 }] }],
      }],
    }],
  };
}

describe('InputSummaryComponent', () => {
  let fixture: ComponentFixture<InputSummaryComponent>;
  let ui: WritableSignal<InputSummaryUI | undefined>;

  const text = (): string => fixture.nativeElement.textContent.replace(/\s+/g, ' ');
  const cell = (rowIndex: number, columnIndex: number): HTMLElement =>
    fixture.nativeElement.querySelector('table').querySelectorAll('tbody tr')[rowIndex + 1].querySelectorAll('td')[columnIndex];
  const header = (index: number): HTMLButtonElement => fixture.nativeElement.querySelectorAll('button.category-header')[index];
  const body = (index: number): HTMLElement => fixture.nativeElement.querySelectorAll('.category-body')[index];

  beforeEach(() => {
    ui = signal<InputSummaryUI | undefined>(buildUI());
    TestBed.configureTestingModule({
      declarations: [InputSummaryComponent],
      imports: [ReportTableCellPipe],
      providers: [{ provide: InputSummaryResultsService, useValue: { inputSummaryUI: ui } }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(InputSummaryComponent);
    fixture.detectChanges();
  });

  it('renders baseline and modification columns', () => {
    expect(text()).toContain('Baseline');
    expect(text()).toContain('Scenario 1');
  });

  it('renders section headers and rows with units', () => {
    expect(text()).toContain('Wall Loss 1: North wall');
    expect(text()).toContain('Ambient Temperature (℉)');
  });

  it('renders one card per category with its entry count', () => {
    expect(header(0).textContent).toContain('Wall Loss (1)');
    expect(header(1).textContent.replace(/\s+/g, '')).toBe('Operations');
  });

  it('starts every category collapsed and toggles on click', () => {
    expect(body(0).classList).toContain('collapsed');
    expect(header(0).getAttribute('aria-expanded')).toBe('false');
    header(0).click();
    fixture.detectChanges();
    expect(body(0).classList).not.toContain('collapsed');
    expect(body(1).classList).toContain('collapsed');
    expect(header(0).getAttribute('aria-expanded')).toBe('true');
    header(0).click();
    fixture.detectChanges();
    expect(body(0).classList).toContain('collapsed');
  });

  it('highlights the label, baseline and modification cells of rows that differ', () => {
    [0, 1, 2].forEach(column => {
      expect(cell(0, column).classList).not.toContain('indicate-report-field-different');
      expect(cell(1, column).classList).toContain('indicate-report-field-different');
    });
  });

  it('renders nothing when the summary is unavailable', () => {
    ui.set(undefined);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });
});
