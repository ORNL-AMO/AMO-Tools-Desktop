import { inject, Injectable } from '@angular/core';
import { defer, Observable, of } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { ReportDataAdapter } from '../../shared/report-builder/adapters/report-data-adapter';
import { appendSubGroup, buildFacilityInfoSections, decodeHtmlEntities, formatCell, formatNumber, labelWithUnits } from '../../shared/report-builder/adapters/report-adapter.utils';
import { ReportDocument, ReportMeta, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { KeyValueSection, SummaryTableSection } from '../../shared/report-builder/models/report-section.model';
import { ModificationNameCell, ReportColumnCell, ReportTableRow } from '../../shared/report-builder/models/report-ui-models';
import { ROUTE_TOKENS } from '../constants/process-heating-routes';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { EnergySummaryResultsService, EnergySummaryUI } from './energy-summary/energy-summary-results.service';
import { ExecutiveSummaryResultsService, ExecutiveSummaryUI } from './executive-summary/executive-summary-results.service';
import { InputSummaryResultsService, InputSummaryUI } from './input-summary/input-summary-results.service';

export const PROCESS_HEATING_SECTION_GROUPS: ReportSectionGroup[] = [
  { key: ROUTE_TOKENS.facilityInfo, label: 'Facility Info', description: 'Facility and contact information' },
  { key: ROUTE_TOKENS.executiveSummary, label: 'Executive Summary', description: 'Baseline and modification results comparison' },
  { key: ROUTE_TOKENS.energySummary, label: 'Energy Summary', description: 'Summary of energy sources used and PHA calculation comparisons' },
  { key: ROUTE_TOKENS.resultsData, label: 'Result Data', description: 'Hourly energy loss and use breakdown' },
  { key: ROUTE_TOKENS.reportGraphs, label: 'Report Graphs', description: 'Energy loss distribution pie and bar charts' },
  { key: ROUTE_TOKENS.reportSankey, label: 'Sankey', description: 'Furnace energy flow diagram' },
  { key: ROUTE_TOKENS.inputSummary, label: 'Input Summary', description: 'Summary of user input data' },
];

@Injectable()
export class ProcessHeatingReportAdapter implements ReportDataAdapter {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly executiveSummaryService = inject(ExecutiveSummaryResultsService);
  private readonly energySummaryService = inject(EnergySummaryResultsService);
  private readonly inputSummaryService = inject(InputSummaryResultsService);

  private static readonly ACCENT_COLOR: [number, number, number] = [192, 57, 43]; // #C0392B

  buildDocument(assessment: Assessment): Observable<ReportDocument> {
    return defer(() => {
      const meta: ReportMeta = {
        title: assessment?.name ?? 'Process Heating Report',
        date: new Date().toISOString(),
        moduleColor: ProcessHeatingReportAdapter.ACCENT_COLOR,
      };
      const executiveSummary = this.executiveSummaryService.executiveSummaryUI();
      const energySummary = this.energySummaryService.energySummaryUI();
      const inputSummary = this.inputSummaryService.inputSummaryUI();

      return of<ReportDocument>({
        meta,
        sections: [
          ...buildFacilityInfoSections(this.assessmentService.settingsSignal()?.facilityInfo, ROUTE_TOKENS.facilityInfo),
          ...(executiveSummary ? this.buildExecutiveSummarySections(executiveSummary) : []),
          ...(energySummary ? this.buildEnergySummarySections(energySummary) : []),
          ...(inputSummary ? this.buildInputSummarySections(inputSummary) : []),
        ],
      });
    });
  }

  private buildExecutiveSummarySections(ui: ExecutiveSummaryUI): Array<SummaryTableSection | KeyValueSection> {
    const headers = this.buildHeaders(ui.modificationNames);
    const toSection = (title: string, rows: ReportTableRow[], pageBreakBefore = false): SummaryTableSection => ({
      type: 'summary-table',
      title,
      headers,
      rows: rows.map(row => this.rowToStrings(row)),
      emphasisRowsIndices: rows.flatMap((row, index) => (row.className === 'emphasis' ? [index] : [])),
      group: ROUTE_TOKENS.executiveSummary,
      pageBreakBefore,
    });

    const sections: Array<SummaryTableSection | KeyValueSection> = [toSection('Executive Summary', ui.summaryRows)];
    const optionalTables: Array<[string, ReportTableRow[]]> = [
      ['Annual Electrical and Chemical Energy Used', ui.eafEnergyRows],
      ['Annual Emissions', ui.co2Rows],
      ['Annual Costs', ui.costRows],
    ];
    optionalTables.filter(([, rows]) => rows.length).forEach(([title, rows]) => sections.push(toSection(title, rows)));

    if (ui.notes.length) {
      sections.push({
        type: 'key-value-list',
        title: 'Modification Notes',
        rows: ui.notes.map(note => ({ label: `${note.modificationName} — ${note.lossName}`, value: note.note })),
        group: ROUTE_TOKENS.executiveSummary,
      });
    }
    return sections;
  }

  private buildEnergySummarySections(ui: EnergySummaryUI): Array<SummaryTableSection | KeyValueSection> {
    const withUnit = (value: number | undefined, unit: string | undefined, decimals = 2): string =>
      value ? `${formatNumber(value, decimals)} ${unit ?? ''}`.trim() : '—';

    const sourcesTable: SummaryTableSection = {
      type: 'summary-table',
      title: 'Summary of Energy Sources Used',
      headers: ['Energy Name', 'Energy Used', 'Heating Value (HHV)', 'Cost per Unit'],
      rows: ui.sources.map(source => [
        source.name,
        withUnit(source.energyUsed, source.energyUsedUnit),
        withUnit(source.heatingValue, source.heatingValueUnit),
        `${formatNumber(source.costPerUnit ?? 0, 2, 2)} ${source.costUnit ?? ''}`.trim(),
      ]),
      group: ROUTE_TOKENS.energySummary,
    };

    const comparisonTable: SummaryTableSection = {
      type: 'summary-table',
      title: 'Compare PHA Calculations',
      headers: ['', 'Calculated By PHA', 'Metered Comparison', 'Design Comparison'],
      rows: ui.comparison.map(row => [
        row.label,
        withUnit(row.calculated, row.unit),
        withUnit(row.metered, row.unit),
        withUnit(row.designed, row.unit),
      ]),
      group: ROUTE_TOKENS.energySummary,
    };

    const notes: KeyValueSection['rows'] = [];
    if (ui.equipmentNotes) {
      notes.push({ label: 'Equipment Notes', value: ui.equipmentNotes });
    }
    if (ui.operatingConditions) {
      notes.push({ label: 'Operating Conditions', value: ui.operatingConditions });
    }
    const notesSection: KeyValueSection[] = notes.length
      ? [{ type: 'key-value-list', rows: notes, group: ROUTE_TOKENS.energySummary }]
      : [];
    return [sourcesTable, ...notesSection, comparisonTable];
  }

  private buildInputSummarySections(ui: InputSummaryUI): SummaryTableSection[] {
    const headers = this.buildHeaders(ui.modificationNames);
    const rows: string[][] = [];
    const subGroupHeaderIndices: number[] = [];
    ui.sections.forEach(section => {
      appendSubGroup(rows, subGroupHeaderIndices, headers.length, decodeHtmlEntities(section.label), section.rows.map(row => this.rowToStrings(row)));
    });
    return [{
      type: 'summary-table',
      title: 'Input Summary',
      headers,
      rows,
      subGroupHeaderIndices,
      group: ROUTE_TOKENS.inputSummary,
      pageBreakBefore: true,
    }];
  }

  private buildHeaders(modificationNames: ModificationNameCell[]): string[] {
    return ['', 'Baseline', ...modificationNames.map(modification => decodeHtmlEntities(modification.name))];
  }

  private rowToStrings(row: ReportTableRow): string[] {
    const toText = (cell: ReportColumnCell): string =>
      row.display === 'list' && cell.value ? decodeHtmlEntities(String(cell.value)).split('\n').join(', ') : formatCell(cell);
    return [
      labelWithUnits(row.label, row.units ? `(${row.units})` : undefined),
      toText(row.baseline),
      ...row.modifications.map(toText),
    ];
  }
}
