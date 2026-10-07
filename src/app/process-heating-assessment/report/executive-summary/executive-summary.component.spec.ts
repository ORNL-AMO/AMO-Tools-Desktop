import { NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportTableCellPipe } from '../../../shared/pipes/report-table-cell.pipe';
import { ExecutiveSummaryComponent } from './executive-summary.component';
import { ExecutiveSummaryResultsService, ExecutiveSummaryUI } from './executive-summary-results.service';

function buildUI(overrides: Partial<ExecutiveSummaryUI> = {}): ExecutiveSummaryUI {
  return {
    modificationNames: [{ id: 'mod1', name: 'Scenario 1' }],
    summaryRows: [
      { label: 'Percent Savings', units: '%', display: 'percent-graph', baseline: { value: null }, modifications: [{ value: 20, decimalPipe: '1.0-0' }] },
      { label: 'Cost', units: '$', className: 'default', baseline: { value: 50000, decimalPipe: '1.0-0' }, modifications: [{ value: 40000, decimalPipe: '1.0-0' }] },
      { label: 'Selected Energy Projects', display: 'list', baseline: { value: null }, modifications: [{ value: 'Flue Gas\nAir Temp' }] },
      { label: 'Modifications', display: 'list', baseline: { value: null }, modifications: [{ value: 'Wall' }] },
    ],
    eafEnergyRows: [],
    co2Rows: [],
    costRows: [],
    notes: [],
    ...overrides,
  };
}

describe('ExecutiveSummaryComponent', () => {
  let fixture: ComponentFixture<ExecutiveSummaryComponent>;
  let ui: WritableSignal<ExecutiveSummaryUI | undefined>;

  const text = (): string => fixture.nativeElement.textContent.replace(/\s+/g, ' ');
  const tableCount = (): number => fixture.nativeElement.querySelectorAll('table').length;

  beforeEach(() => {
    ui = signal<ExecutiveSummaryUI | undefined>(buildUI());
    TestBed.configureTestingModule({
      declarations: [ExecutiveSummaryComponent],
      imports: [ReportTableCellPipe],
      providers: [{ provide: ExecutiveSummaryResultsService, useValue: { executiveSummaryUI: ui } }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ExecutiveSummaryComponent);
    fixture.detectChanges();
  });

  it('renders baseline and modification columns with formatted values', () => {
    expect(text()).toContain('Baseline');
    expect(text()).toContain('Scenario 1');
    expect(text()).toContain('50,000');
    expect(text()).toContain('40,000');
  });

  it('renders the percent savings graph when a modification saves cost', () => {
    expect(fixture.nativeElement.querySelector('app-percent-graph')).not.toBeNull();
  });

  it('renders a placeholder instead of the graph when there is no percent savings', () => {
    const noSavings = buildUI();
    noSavings.summaryRows[0].modifications = [{ value: null }];
    ui.set(noSavings);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-percent-graph')).toBeNull();
  });

  it('renders list rows with one item per line', () => {
    const items = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('span.d-block')).map(item => item.textContent.trim());
    expect(items).toEqual(['Flue Gas', 'Air Temp', 'Wall']);
    expect(text()).toContain('Flue Gas');
    expect(text()).toContain('Wall');
  });

  it('renders only the main table when no optional tables apply', () => {
    expect(tableCount()).toBe(1);
  });

  it('renders the EAF, emissions, and cost tables when rows exist', () => {
    const row = buildUI().summaryRows[0];
    ui.set(buildUI({ eafEnergyRows: [row], co2Rows: [row], costRows: [row] }));
    fixture.detectChanges();
    expect(tableCount()).toBe(4);
  });

  it('renders modification notes only when present', () => {
    expect(text()).not.toContain('Modification Notes');
    ui.set(buildUI({ notes: [{ modificationName: 'Scenario 1', lossName: 'Wall Losses', note: 'Added insulation' }] }));
    fixture.detectChanges();
    expect(text()).toContain('Modification Notes');
    expect(text()).toContain('Scenario 1 — Wall Losses:');
    expect(text()).toContain('Added insulation');
  });

  it('renders nothing when results are unavailable', () => {
    ui.set(undefined);
    fixture.detectChanges();
    expect(tableCount()).toBe(0);
  });

  it('copies the table text for export', () => {
    fixture.componentInstance.updateCopyTableString();
    expect(fixture.componentInstance.copyTableString).toContain('Annual Result Totals');
  });
});
