import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ReportDataAdapter } from '../../shared/report-builder/adapters/report-data-adapter';
import { buildFacilityInfoSections, formatNumber, renderPlotlyChart } from '../../shared/report-builder/adapters/report-adapter.utils';
import { ReportDocument, ReportMeta, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { ChartSection, SummaryTableSection, TextSection } from '../../shared/report-builder/models/report-section.model';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { WaterAssessmentResultsService } from '../water-assessment-results.service';
import { UpdateDiagramFromAssessmentService } from '../../water-process-diagram/update-diagram-from-assessment.service';
import { ReportChartRenderService } from '../../shared/report-builder/services/report-chart-render.service';
import { getGraphColors } from '../../shared/helperFunctions';
import {
  ExecutiveSummaryResults, PlantSystemSummaryResults, SystemAnnualSummaryResults, SystemTrueCostData,
  NodeErrors, getIsDiagramValid, getSystemTrueCostData, sortTrueCostReport, WaterAssessment,
} from 'process-flow-lib';

export const WATER_SECTION_GROUPS: ReportSectionGroup[] = [
  { key: 'facilityInfo', label: 'Facility Info', description: 'Facility and contact information' },
  { key: 'executiveSummary', label: 'Executive Summary', description: 'Plant annual water use, cost, and true cost summary' },
  { key: 'systemSummary', label: 'System Annual Summary', description: 'Per-system water use and cost breakdown' },
  { key: 'systemTrueCost', label: 'True Cost of Systems', description: 'True cost of water attributed by system and cost component' },
];

@Injectable()
export class WaterReportAdapter implements ReportDataAdapter {
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly waterAssessmentResultsService = inject(WaterAssessmentResultsService);
  private readonly updateDiagramFromAssessmentService = inject(UpdateDiagramFromAssessmentService);
  private readonly chartRenderService = inject(ReportChartRenderService);

  private static readonly ACCENT_COLOR: [number, number, number] = [0, 180, 216]; // #00B4D8

  buildDocument(assessment: Assessment): Observable<ReportDocument> {
    const settings = this.settingsDbService.getByAssessmentId(assessment, true);
    const water = assessment.water;

    const meta: ReportMeta = {
      title: assessment?.name ?? 'Water Report',
      date: new Date().toISOString(),
      moduleColor: WaterReportAdapter.ACCENT_COLOR,
    };

    const diagram = this.updateDiagramFromAssessmentService.getDiagramFromAssessment(assessment);
    const nodeErrors: NodeErrors = diagram?.waterDiagram.flowDiagramData.nodeErrors;
    const isDiagramValid = !!diagram && getIsDiagramValid(nodeErrors);

    if (!isDiagramValid) {
      return of({
        meta,
        sections: [
          ...buildFacilityInfoSections(settings?.facilityInfo, 'facilityInfo'),
          {
            type: 'text',
            title: 'Executive Summary',
            group: 'executiveSummary',
            pageBreakBefore: true,
            content: 'Diagram flow data contains errors. Visit the diagram to fix issues and ensure entered flow values are valid.',
          } as TextSection,
        ],
      });
    }

    const executiveSummary = this.waterAssessmentResultsService.getExecutiveSummaryReport(assessment, settings);
    const plantResults = this.waterAssessmentResultsService.getPlantSummary(assessment, settings);
    const nodeNameMap = diagram.waterDiagram.flowDiagramData.nodes.reduce((map, node) => {
      map[node.id] = node.data.name as string;
      return map;
    }, {} as Record<string, string>);
    const trueCostReport = sortTrueCostReport(
      getSystemTrueCostData(plantResults.trueCostOfSystems, nodeNameMap, plantResults.systemAttributionMap), 'desc');

    return of({
      meta,
      sections: [
        ...buildFacilityInfoSections(settings?.facilityInfo, 'facilityInfo'),
        ...this.buildExecutiveSummarySections(executiveSummary, water, settings),
        ...this.buildSystemSummarySections(plantResults.plantSystemSummaryResults, settings),
        ...this.buildSystemTrueCostSections(trueCostReport, settings),
      ],
    });
  }

  private buildExecutiveSummarySections(results: ExecutiveSummaryResults, water: WaterAssessment, settings: Settings): SummaryTableSection[] {
    const fmt = (v: number | undefined, dec = 2) => v != null ? formatNumber(v, dec) : '—';
    const isImperial = settings.unitsOfMeasure === 'Imperial';
    const productionUnit = water.systemBasics?.productionUnit || 'production units';

    const useSummary: SummaryTableSection = {
      type: 'summary-table',
      title: 'Plant Annual Water Use and Cost Summary',
      group: 'executiveSummary',
      pageBreakBefore: true,
      headers: ['', 'Baseline'],
      rows: [
        [`Intake (${isImperial ? 'Mgal' : 'm3'})`, fmt(results.totalSourceWaterIntake)],
        [`Intake (${isImperial ? 'kGal' : 'm3'} per 1000 ${productionUnit})`, fmt(results.totalPerProductionUnit)],
        ['Direct Cost of Water ($)', fmt(results.directCost)],
      ],
      emphasisRowsIndices: [2],
    };

    const trueCostSummary: SummaryTableSection = {
      type: 'summary-table',
      title: 'True Cost of Water',
      group: 'executiveSummary',
      headers: ['', 'Baseline'],
      rows: [
        ['True Cost ($)', fmt(results.trueCost)],
        [`True Cost ($ per 1000 ${productionUnit})`, fmt(results.trueCostPerProductionUnit)],
        ['True Cost / Direct Cost', fmt(results.trueOverDirectResult)],
      ],
      emphasisRowsIndices: [2],
    };

    return [useSummary, trueCostSummary];
  }

  private buildSystemSummarySections(plantSummary: PlantSystemSummaryResults, settings: Settings): (SummaryTableSection | ChartSection)[] {
    if (!plantSummary || plantSummary.allSystemResults.length === 0) return [];

    const fmt = (v: number | undefined, dec = 2) => v != null ? formatNumber(v, dec) : '—';
    const isImperial = settings.unitsOfMeasure === 'Imperial';
    const flowUnit = isImperial ? 'Mgal/yr' : 'm3/yr';
    const perUnitCostUnit = isImperial ? '$/kGal' : '$/L';

    const systemRow = (s: SystemAnnualSummaryResults): string[] => [
      s.name || 'System',
      fmt(s.sourceWaterIntake), fmt(s.directCostPerYear), fmt(s.directCostPerUnit, 4),
      fmt(s.trueCostPerYear), fmt(s.trueCostPerUnit, 4), fmt(s.trueOverDirectResult),
    ];

    const rows = [
      ...plantSummary.allSystemResults.map(systemRow),
      ['Plant', fmt(plantSummary.sourceWaterIntake), fmt(plantSummary.directCostPerYear), fmt(plantSummary.directCostPerUnit, 4),
        fmt(plantSummary.trueCostPerYear), fmt(plantSummary.trueCostPerUnit, 4), fmt(plantSummary.trueOverDirectResult)],
    ];

    const table: SummaryTableSection = {
      type: 'summary-table',
      title: 'System Annual Water Use and Cost Summary',
      group: 'systemSummary',
      pageBreakBefore: true,
      headers: ['System', `Source Water Intake (${flowUnit})`, 'Direct Cost ($/yr)', `Direct Cost (${perUnitCostUnit})`,
        'True Cost ($/yr)', `True Cost (${perUnitCostUnit})`, 'True Cost/Direct Cost'],
      rows,
      emphasisRowsIndices: [rows.length - 1],
    };

    const intakeFlowChart: ChartSection = {
      type: 'chart',
      title: 'System Intake Volume',
      group: 'systemSummary',
      imageDataProvider: () => renderPlotlyChart(this.chartRenderService, this.buildIntakeFlowChart(plantSummary, settings)),
    };

    const intakeCostChart: ChartSection = {
      type: 'chart',
      title: 'System Direct Costs vs. True Costs',
      group: 'systemSummary',
      imageDataProvider: () => renderPlotlyChart(this.chartRenderService, this.buildIntakeCostChart(plantSummary)),
    };

    return [table, intakeFlowChart, intakeCostChart];
  }

  private buildIntakeFlowChart(plantSummary: PlantSystemSummaryResults, settings: Settings): { traces: unknown[]; layout: object } {
    const units = settings.unitsOfMeasure === 'Imperial' ? 'Mgal' : 'm3';
    const decimalPrecision = settings.flowDecimalPrecision ?? 2;
    const systemNames = plantSummary.allSystemResults.map(s => s.name || 'System');
    const intakeValues = plantSummary.allSystemResults.map(s => s.sourceWaterIntake || 0);
    const colors = getGraphColors();

    const traces = systemNames.map((name, idx) => ({
      type: 'bar',
      x: ['System Intake Volume'],
      y: [Number(intakeValues[idx].toFixed(decimalPrecision))],
      name,
      text: `${intakeValues[idx].toFixed(decimalPrecision)} ${units}`,
      textposition: 'auto',
      marker: { color: colors[idx % colors.length], line: { color: 'white', width: 1 } },
    }));

    const layout = {
      barmode: 'stack',
      title: { text: `System Intake Volume (${units})` },
      margin: { l: 60, r: 30, t: 60, b: 40 },
      showlegend: true,
      xaxis: { title: { text: '' } },
      yaxis: { title: { text: `Total Intake Volume (${units})` } },
      paper_bgcolor: 'white',
    };

    return { traces, layout };
  }

  private buildIntakeCostChart(plantSummary: PlantSystemSummaryResults): { traces: unknown[]; layout: object } {
    const systemLabels = plantSummary.allSystemResults.map(s => s.name || 'System');
    const directCostsRaw = plantSummary.allSystemResults.map(s => s.directCostPerYear || 0);
    const trueCostsRaw = plantSummary.allSystemResults.map(s => s.trueCostPerYear || 0);
    const colors = getGraphColors();
    const currency = (v: number) => `$${formatNumber(v, 0)}`;

    const traces = systemLabels.flatMap((label, idx) => [
      {
        type: 'bar', x: ['Direct Cost'], y: [directCostsRaw[idx]], name: label, text: currency(directCostsRaw[idx]), textposition: 'auto',
        marker: { color: colors[idx % colors.length], line: { color: 'white', width: 1 } }, offsetgroup: 0, legendgroup: label, showlegend: true,
      },
      {
        type: 'bar', x: ['True Cost'], y: [trueCostsRaw[idx]], name: label, text: currency(trueCostsRaw[idx]), textposition: 'auto',
        marker: { color: colors[idx % colors.length], line: { color: 'white', width: 1 } }, offsetgroup: 1, legendgroup: label, showlegend: false,
      },
    ]);

    const layout = {
      barmode: 'stack',
      title: { text: 'System: Direct Costs vs. True Costs (USD)' },
      margin: { l: 60, r: 110, t: 60, b: 40 },
      legend: { orientation: 'v', x: 1.02, y: 1, xanchor: 'left', yanchor: 'top' },
      xaxis: { title: { text: '' } },
      yaxis: { title: { text: 'Cost (USD)' }, tickprefix: '$' },
      paper_bgcolor: 'white',
    };

    return { traces, layout };
  }

  private buildSystemTrueCostSections(report: SystemTrueCostData[], settings: Settings): (SummaryTableSection | ChartSection | TextSection)[] {
    if (report.length === 0) return [];

    const fmt = (v: number | undefined, dec = 2) => v != null ? formatNumber(v, dec) : '—';
    const cell = (c: { cost: number; isAdjusted: boolean } | undefined) => c ? `${fmt(c.cost)}${c.isAdjusted ? ' *' : ''}` : '—';

    const table: SummaryTableSection = {
      type: 'summary-table',
      title: 'True Cost of Water by System',
      group: 'systemTrueCost',
      pageBreakBefore: true,
      headers: ['System', 'Municipal Water Intake ($)', 'Municipal Wastewater Discharge ($)', 'Third-party Disposal ($)',
        'Water Treatment ($)', 'Wastewater Treatment ($)', 'Pump and Motor Energy ($)', 'Heat Energy ($)', 'Total ($)'],
      rows: report.map(system => [system.label, ...system.connectionCostByType.map(cell)]),
      emphasisRowsIndices: [],
    };

    const sections: (SummaryTableSection | ChartSection | TextSection)[] = [table];

    const hasAdjusted = report.some(system => system.connectionCostByType.some(c => c.isAdjusted));
    if (hasAdjusted) {
      sections.push({
        type: 'text',
        group: 'systemTrueCost',
        content: '* Cost attribution manually adjusted for this system/cost component.',
      } as TextSection);
    }

    sections.push({
      type: 'chart',
      title: 'True Cost of Water Systems',
      group: 'systemTrueCost',
      imageDataProvider: () => renderPlotlyChart(this.chartRenderService, this.buildTrueCostBarChart(report, settings)),
    });

    return sections;
  }

  private buildTrueCostBarChart(report: SystemTrueCostData[], settings: Settings): { traces: unknown[]; layout: object } {
    const costTypes = [
      'Municipal Water Intake', 'Municipal Wastewater Disposal', 'Third-party Disposal', 'Water Treatment',
      'Wastewater Treatment', 'Pump and Motor Energy', 'Heat Energy in Wastewater',
    ];
    const colors = ['#75a1ff', '#7f7fff', '#009386', '#93e200', '#ff7f0e', '#ffbb78'];
    const ascReport = sortTrueCostReport(report, 'asc');

    const traces = costTypes
      .map((costType, index) => ({
        type: 'bar',
        orientation: 'h',
        x: ascReport.map(item => item.connectionCostByType[index]?.cost || 0),
        y: ascReport.map(item => item.label),
        name: costType,
        marker: { line: { width: 1, color: 'white' } },
      }))
      .filter(series => !series.x.every(v => v === 0));

    const layout = {
      title: { text: 'True Cost of Water Systems' },
      barmode: 'stack',
      margin: { l: 140, r: 150, t: 60, b: 50 },
      xaxis: { title: { text: 'Cost per Year' }, tickformat: '$,.0f' },
      yaxis: { title: { text: '' }, automargin: true },
      legend: { orientation: 'v', x: 1.02, y: 1, xanchor: 'left', yanchor: 'top' },
      colorway: colors,
      paper_bgcolor: 'white',
    };

    return { traces, layout };
  }
}
