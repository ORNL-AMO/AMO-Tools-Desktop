import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { ReportDocument } from '../../shared/report-builder/models/report-document.model';
import { KeyValueSection, SummaryTableSection } from '../../shared/report-builder/models/report-section.model';
import { PHAST } from '../models/phast';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { EnergySummaryResultsService, EnergySummaryUI } from './energy-summary/energy-summary-results.service';
import { ExecutiveSummaryResultsService, ExecutiveSummaryUI } from './executive-summary/executive-summary-results.service';
import { InputSummaryResultsService, InputSummaryUI } from './input-summary/input-summary-results.service';
import { PROCESS_HEATING_SECTION_GROUPS, ProcessHeatingReportAdapter } from './process-heating-report.adapter';

const MODIFICATION_NAMES = [{ id: 'mod1', name: 'Scenario 1' }];

function buildExecutiveSummary(overrides: Partial<ExecutiveSummaryUI> = {}): ExecutiveSummaryUI {
  return {
    modificationNames: MODIFICATION_NAMES,
    summaryRows: [
      { label: 'Percent Savings', units: '%', display: 'percent-graph', baseline: { value: null }, modifications: [{ value: 20, decimalPipe: '1.0-0' }] },
      { label: 'Energy Used', units: 'MMBtu/yr', className: 'default', baseline: { value: 10000, decimalPipe: '1.0-0' }, modifications: [{ value: 8000, decimalPipe: '1.0-0' }] },
      { label: 'Cost Savings', units: '$', className: 'emphasis', baseline: { value: null }, modifications: [{ value: 10000, decimalPipe: '1.0-0' }] },
      { label: 'Selected Energy Projects', display: 'list', baseline: { value: null }, modifications: [{ value: 'Flue Gas\nO<sub>2</sub> Trim' }] },
      { label: 'Modifications', display: 'list', baseline: { value: null }, modifications: [{ value: 'Wall' }] },
    ],
    eafEnergyRows: [],
    co2Rows: [],
    costRows: [],
    notes: [],
    ...overrides,
  };
}

const ENERGY_SUMMARY: EnergySummaryUI = {
  sources: [{ name: 'Natural Gas', energyUsed: 12.5, energyUsedUnit: 'MMBtu/hr', costPerUnit: 5, costUnit: '/MMBtu' }],
  comparison: [{ label: 'Energy Used', unit: 'MMBtu/hr', calculated: 12.5 }],
  equipmentNotes: 'Batch furnace',
  energyPerTimeUnit: 'MMBtu/kWh',
};

const INPUT_SUMMARY: InputSummaryUI = {
  modificationNames: MODIFICATION_NAMES,
  sections: [{
    label: 'Wall Loss 1',
    rows: [{ label: 'Ambient Temperature', units: '℉', baseline: { value: 80 }, modifications: [{ value: 90 }] }],
  }],
};

describe('ProcessHeatingReportAdapter', () => {
  let adapter: ProcessHeatingReportAdapter;
  let executiveSummary: ExecutiveSummaryUI | undefined;
  let energySummary: EnergySummaryUI | undefined;
  let inputSummary: InputSummaryUI | undefined;
  let processHeating: PHAST;

  const assessment = { name: 'Furnace 1' } as Assessment;

  async function build(): Promise<ReportDocument> {
    return firstValueFrom(adapter.buildDocument(assessment));
  }

  function section<T>(document: ReportDocument, title: string): T {
    return document.sections.find(candidate => candidate.title === title) as T;
  }

  beforeEach(() => {
    executiveSummary = buildExecutiveSummary();
    energySummary = ENERGY_SUMMARY;
    inputSummary = INPUT_SUMMARY;
    processHeating = { equipmentNotes: 'Batch furnace', operatingHours: { operatingConditions: 'Two shifts' } } as PHAST;
    TestBed.configureTestingModule({
      providers: [
        ProcessHeatingReportAdapter,
        {
          provide: ProcessHeatingAssessmentService,
          useValue: {
            settingsSignal: signal({ facilityInfo: { companyName: 'Acme' } }),
            processHeatingSignal: () => processHeating,
          },
        },
        { provide: ExecutiveSummaryResultsService, useValue: { executiveSummaryUI: () => executiveSummary } },
        { provide: EnergySummaryResultsService, useValue: { energySummaryUI: () => energySummary } },
        { provide: InputSummaryResultsService, useValue: { inputSummaryUI: () => inputSummary } },
      ],
    });
    adapter = TestBed.inject(ProcessHeatingReportAdapter);
  });

  it('lists every legacy report section as an export option', () => {
    expect(PROCESS_HEATING_SECTION_GROUPS.map(group => group.label)).toEqual([
      'Facility Info', 'Executive Summary', 'Energy Summary', 'Result Data', 'Report Graphs', 'Sankey', 'Input Summary',
    ]);
  });

  it('titles the document with the assessment name', async () => {
    expect((await build()).meta.title).toBe('Furnace 1');
  });

  it('includes facility info, executive summary, energy summary, and input summary', async () => {
    const document = await build();
    const groups = new Set(document.sections.map(candidate => candidate.group));
    expect(groups).toEqual(new Set(['facility-info', 'executive-summary', 'energy-summary', 'input-summary']));
  });

  it('builds executive summary rows with percent savings, projects, and modifications', async () => {
    const table = section<SummaryTableSection>(await build(), 'Executive Summary');
    expect(table.headers).toEqual(['', 'Baseline', 'Scenario 1']);
    expect(table.rows.map(row => row[0])).toEqual(['Percent Savings (%)', 'Energy Used (MMBtu/yr)', 'Cost Savings ($)', 'Selected Energy Projects', 'Modifications']);
    expect(table.rows[0]).toEqual(['Percent Savings (%)', '—', '20']);
    expect(table.rows[3][2]).toBe('Flue Gas, O2 Trim');
    expect(table.rows[4][2]).toBe('Wall');
    expect(table.emphasisRowsIndices).toEqual([2]);
  });

  it('adds optional executive summary tables and notes only when present', async () => {
    const row = buildExecutiveSummary().summaryRows[0];
    executiveSummary = buildExecutiveSummary({
      costRows: [row],
      notes: [{ modificationName: 'Scenario 1', lossName: 'Wall Losses', note: 'Added insulation' }],
    });
    const document = await build();
    expect(section<SummaryTableSection>(document, 'Annual Costs')).toBeDefined();
    expect(section<SummaryTableSection>(document, 'Annual Emissions')).toBeUndefined();
    expect(section<KeyValueSection>(document, 'Modification Notes').rows[0]).toEqual({ label: 'Scenario 1 — Wall Losses', value: 'Added insulation' });
  });

  it('builds energy sources and comparison tables with placeholders for missing values', async () => {
    const document = await build();
    expect(section<SummaryTableSection>(document, 'Summary of Energy Sources Used').rows[0][1]).toBe('12.5 MMBtu/hr');
    const comparison = section<SummaryTableSection>(document, 'Compare PHA Calculations');
    expect(comparison.rows[0]).toEqual(['Energy Used', '12.5 MMBtu/hr', '—', '—']);
  });

  it('includes equipment notes in the energy summary group', async () => {
    const notes = (await build()).sections.find(candidate => candidate.type === 'key-value-list' && candidate.group === 'energy-summary') as KeyValueSection;
    expect(notes.rows).toEqual([{ label: 'Equipment Notes', value: 'Batch furnace' }]);
  });

  it('includes equipment notes and operating conditions in the facility info group', async () => {
    const equipment = section<KeyValueSection>(await build(), 'Equipment');
    expect(equipment.group).toBe('facility-info');
    expect(equipment.rows).toEqual([
      { label: 'Equipment Notes', value: 'Batch furnace' },
      { label: 'Operating Conditions', value: 'Two shifts' },
    ]);
  });

  it('omits the equipment section when neither field is set', async () => {
    processHeating = {} as PHAST;
    expect(section<KeyValueSection>(await build(), 'Equipment')).toBeUndefined();
  });

  it('builds input summary as one table with sub-group headers', async () => {
    const table = section<SummaryTableSection>(await build(), 'Input Summary');
    expect(table.subGroupHeaderIndices).toEqual([0]);
    expect(table.rows[0][0]).toBe('Wall Loss 1');
    expect(table.rows[1]).toEqual(['Ambient Temperature (℉)', '80', '90']);
  });

  it('skips sections whose summaries are unavailable', async () => {
    executiveSummary = undefined;
    energySummary = undefined;
    inputSummary = undefined;
    const groups = (await build()).sections.map(candidate => candidate.group);
    expect(groups.every(group => group === 'facility-info')).toBeTrue();
  });
});
