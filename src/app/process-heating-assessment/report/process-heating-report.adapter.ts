import { inject, Injectable } from '@angular/core';
import { defer, Observable, of } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { PhastChartsService } from '../../phast/phast-report/phast-charts.service';
import { ReportChartRenderService } from '../../shared/report-builder/services/report-chart-render.service';
import { ReportDataAdapter } from '../../shared/report-builder/adapters/report-data-adapter';
import { appendSubGroup, buildFacilityInfoSections, decodeHtmlEntities, formatCell, formatNumber, labelWithUnits, renderPlotlyChart } from '../../shared/report-builder/adapters/report-adapter.utils';
import { ReportDocument, ReportMeta, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { ChartSection, KeyValueSection, SummaryTableSection } from '../../shared/report-builder/models/report-section.model';
import { ModificationNameCell, ReportColumnCell, ReportTableRow } from '../../shared/report-builder/models/report-ui-models';
import { ROUTE_TOKENS } from '../constants/process-heating-routes';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { EnergySummaryResultsService, EnergySummaryUI } from './energy-summary/energy-summary-results.service';
import { ExecutiveSummaryResultsService, ExecutiveSummaryUI } from './executive-summary/executive-summary-results.service';
import { ResultsDataResultsService, ResultsDataUI } from './results-data/results-data-results.service';
import { ReportGraphsResultsService, ReportGraphsUI } from './report-graphs/report-graphs-results.service';
import { ReportSankeyResultsService, ReportSankeyUI } from './report-sankey/report-sankey-results.service';
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
  private readonly resultsDataService = inject(ResultsDataResultsService);
  private readonly reportSankeyService = inject(ReportSankeyResultsService);
  private readonly reportGraphsService = inject(ReportGraphsResultsService);
  private readonly phastChartsService = inject(PhastChartsService);
  private readonly chartRenderService = inject(ReportChartRenderService);
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
      const resultsData = this.resultsDataService.resultsDataUI();
      const reportGraphs = this.reportGraphsService.reportGraphsUI();
      const reportSankey = this.reportSankeyService.reportSankeyUI();
      const inputSummary = this.inputSummaryService.inputSummaryUI();

      return of<ReportDocument>({
        meta,
        sections: [
          ...buildFacilityInfoSections(this.assessmentService.settingsSignal()?.facilityInfo, ROUTE_TOKENS.facilityInfo),
          ...this.buildEquipmentSections(),
          ...(executiveSummary ? this.buildExecutiveSummarySections(executiveSummary) : []),
          ...(energySummary ? this.buildEnergySummarySections(energySummary) : []),
          ...(resultsData ? this.buildResultsDataSections(resultsData) : []),
          ...(reportGraphs ? this.buildReportGraphsSections(reportGraphs) : []),
          ...(reportSankey ? this.buildSankeySections(reportSankey) : []),
          ...(inputSummary ? this.buildInputSummarySections(inputSummary) : []),
        ],
      });
    });
  }

  /** Equipment notes and operating conditions appear on the Facility Info tab, so the Facility Info export carries them too. */
  private buildEquipmentSections(): KeyValueSection[] {
    const phast = this.assessmentService.processHeatingSignal();
    const rows: KeyValueSection['rows'] = [];
    if (phast?.equipmentNotes) {
      rows.push({ label: 'Equipment Notes', value: phast.equipmentNotes });
    }
    if (phast?.operatingHours?.operatingConditions) {
      rows.push({ label: 'Operating Conditions', value: phast.operatingHours.operatingConditions });
    }
    return rows.length ? [{ type: 'key-value-list', title: 'Equipment', rows, group: ROUTE_TOKENS.facilityInfo }] : [];
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

  private buildResultsDataSections(ui: ResultsDataUI): SummaryTableSection[] {
    return [{
      type: 'summary-table',
      title: 'Result Data',
      headers: [ui.title, ...this.buildHeaders(ui.modificationNames).slice(1)],
      rows: ui.rows.map(row => this.rowToStrings(row)),
      emphasisRowsIndices: ui.rows.flatMap((row, index) => (row.className === 'emphasis' ? [index] : [])),
      group: ROUTE_TOKENS.resultsData,
      pageBreakBefore: true,
    }];
  }

  /** One chart set per modification so the pies and comparison bar paginate together; only the first chart forces a page break. */
  private buildReportGraphsSections(ui: ReportGraphsUI): ChartSection[] {
    const [baseline, ...modifications] = ui.scenarios;
    const group = ROUTE_TOKENS.reportGraphs;
    const render = (chart: { traces: unknown[]; layout: object }) => () => renderPlotlyChart(this.chartRenderService, chart);

    if (!modifications.length) {
      const cells = [{ valuesAndLabels: baseline.lossValuesAndLabels, unit: ui.lossUnit, label: 'Loss Distribution' }];
      if (baseline.deliverValuesAndLabels.length) {
        cells.push({ valuesAndLabels: baseline.deliverValuesAndLabels, unit: ui.deliverUnit, label: 'Heat Delivered' });
      }
      return [{
        type: 'chart', title: `${baseline.name} Energy Distribution`, group, pageBreakBefore: true,
        imageDataProvider: render(this.phastChartsService.buildPieChart(cells)),
      }];
    }

    return modifications.flatMap((modification, index) => {
      const sections: ChartSection[] = [{
        type: 'chart', title: `Loss Distribution — Baseline vs. ${modification.name}`, group, pageBreakBefore: index === 0,
        imageDataProvider: render(this.phastChartsService.buildPieChart([
          { valuesAndLabels: baseline.lossValuesAndLabels, unit: ui.lossUnit, label: 'Baseline' },
          { valuesAndLabels: modification.lossValuesAndLabels, unit: ui.lossUnit, label: modification.name },
        ])),
      }];
      if (baseline.deliverValuesAndLabels.length || modification.deliverValuesAndLabels.length) {
        sections.push({
          type: 'chart', title: `Heat Delivered — Baseline vs. ${modification.name}`, group,
          imageDataProvider: render(this.phastChartsService.buildPieChart([
            { valuesAndLabels: baseline.deliverValuesAndLabels, unit: ui.deliverUnit, label: 'Baseline' },
            { valuesAndLabels: modification.deliverValuesAndLabels, unit: ui.deliverUnit, label: modification.name },
          ])),
        });
      }
      sections.push({
        type: 'chart', title: `Baseline vs. ${modification.name} Loss Comparison`, group,
        imageDataProvider: render(this.phastChartsService.buildLossBarChart([baseline, modification].map(scenario => ({
          name: scenario.name,
          labels: scenario.lossValuesAndLabels.map(item => item.label),
          values: scenario.lossValuesAndLabels.map(item => item.value),
        })), ui.lossUnit)),
      });
      return sections;
    });
  }

  private buildSankeySections(ui: ReportSankeyUI): ChartSection[] {
    return ui.scenarios.map((scenario, index) => ({
      type: 'chart',
      title: `${scenario.name} Sankey`,
      group: ROUTE_TOKENS.reportSankey,
      pageBreakBefore: index === 0,
      aspectRatio: 1400 / 500,
      imageDataProvider: () => this.phastChartsService.renderSankeyAsImage(scenario.phast, ui.settings),
    }));
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
