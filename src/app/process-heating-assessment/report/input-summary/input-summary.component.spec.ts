import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportTableCellPipe } from '../../../shared/pipes/report-table-cell.pipe';
import { InputSummaryComponent } from './input-summary.component';
import { InputSummaryResultsService, InputSummaryUI } from './input-summary-results.service';

function buildUI(): InputSummaryUI {
  return {
    modificationNames: [{ id: 'mod1', name: 'Scenario 1' }],
    sections: [{
      label: 'Wall Loss 1: North wall',
      rows: [
        { label: 'Ambient Temperature', units: '℉', baseline: { value: 80 }, modifications: [{ value: 80 }] },
        { label: 'Average Surface Temperature', units: '℉', baseline: { value: 300 }, modifications: [{ value: 250 }] },
      ],
    }],
  };
}

describe('InputSummaryComponent', () => {
  let fixture: ComponentFixture<InputSummaryComponent>;
  let ui: WritableSignal<InputSummaryUI | undefined>;

  const text = (): string => fixture.nativeElement.textContent.replace(/\s+/g, ' ');
  const cell = (rowIndex: number, columnIndex: number): HTMLElement =>
    fixture.nativeElement.querySelectorAll('tbody tr')[rowIndex + 1].querySelectorAll('td')[columnIndex];

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

  it('highlights only modification cells that differ from baseline', () => {
    expect(cell(0, 2).classList).not.toContain('indicate-report-field-different');
    expect(cell(1, 2).classList).toContain('indicate-report-field-different');
  });

  it('renders nothing when the summary is unavailable', () => {
    ui.set(undefined);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });
});
