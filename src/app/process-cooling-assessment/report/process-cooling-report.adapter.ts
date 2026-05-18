import { inject, Injectable } from '@angular/core';
import { combineLatest, firstValueFrom, map, Observable } from 'rxjs';
import { PlotlyService } from 'angular-plotly.js';
import { ReportDataAdapter } from '../../shared/report-builder/adapters/report-data-adapter';
import { decodeHtmlEntities, formatCell, formatNumber, labelWithUnits } from '../../shared/report-builder/adapters/report-adapter.utils';
import { ReportDocument, ReportMeta, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { ChartSection, KeyValueSection, PairedKeyValueSection, SummaryTableSection } from '../../shared/report-builder/models/report-section.model';
import { FacilityInfo } from '../../shared/models/settings';
import { ExecutiveSummaryResultsService, ExecutiveSummaryUI } from '../services/executive-summary-results.service';
import { PumpSummaryResultsService, PumpSummaryUI } from '../services/pump-summary-results.service';
import { TowerBinRow, TowerSummaryService, TowerSummaryUI } from '../services/tower-summary.service';
import { SystemProfileService, SystemProfileUI } from '../services/system-profile.service';
import { ProcessCoolingResultsService } from '../services/process-cooling-results.service';
import { ProcessCoolingChartsService } from '../services/process-cooling-charts.service';
import { ModificationNameCell, ReportTableRow } from '../../shared/report-builder/models/report-ui-models';
import { LOAD_LABELS } from '../constants/process-cooling-constants';
import { PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';
import { Assessment } from '../../shared/models/assessment';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-assessment.service';
import { ROUTE_TOKENS } from '../constants/process-cooling-routes';

export const PROCESS_COOLING_SECTION_GROUPS: ReportSectionGroup[] = [
  { key: ROUTE_TOKENS.facilityInfo, label: 'Facility Info', description: 'Facility and contact information' },
  { key: ROUTE_TOKENS.executiveSummary, label: 'Executive Summary', description: 'High-level baseline to modification comparison' },
  { key: ROUTE_TOKENS.performanceProfile, label: 'Performance Profile', description: 'Chiller performance curves by load level' },
  { key: ROUTE_TOKENS.systemProfile, label: 'System Profile', description: 'Chiller energy and hours by load bin' },
  { key: ROUTE_TOKENS.pumpSummary, label: 'Pump Summary', description: 'Chilled and condenser water pumping energy' },
  { key: ROUTE_TOKENS.towerSummary, label: 'Tower Summary', description: 'Cooling tower energy by temperature bin' },
];

@Injectable()
export class ProcessCoolingReportAdapter implements ReportDataAdapter {
  private readonly execSummaryService = inject(ExecutiveSummaryResultsService);
  private readonly pumpSummaryService = inject(PumpSummaryResultsService);
  private readonly towerSummaryService = inject(TowerSummaryService);
  private readonly systemProfileService = inject(SystemProfileService);
  private readonly resultsService = inject(ProcessCoolingResultsService);
  private readonly chartsService = inject(ProcessCoolingChartsService);
  private readonly plotlyService = inject(PlotlyService);
  private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);

  private static readonly ACCENT_COLOR: [number, number, number] = [0, 152, 133]; // #009885

  buildDocument(assessment: Assessment): Observable<ReportDocument> {
     const meta: ReportMeta = {
      title: assessment?.name ?? 'Process Cooling Assessment',
      date: new Date().toISOString(),
    };

    const moduleMeta: ReportMeta = { ...meta, moduleColor: ProcessCoolingReportAdapter.ACCENT_COLOR };
    return combineLatest([
      this.execSummaryService.executiveSummaryUI$,
      this.pumpSummaryService.pumpSummaryUI$,
      this.towerSummaryService.towerSummaryUI$,
      this.systemProfileService.reportProfileUI$,
    ]).pipe(
      map(([execSummary, pumpSummary, towerSummary, systemProfile]): ReportDocument => ({
        meta: moduleMeta,
        sections: [
          ...this.buildFacilityInfoSections(),
          ...this.buildExecutiveSummarySections(execSummary),
          ...this.buildSystemProfileSections(systemProfile),
          ...this.buildPerformanceProfileSections(),
          ...this.buildPumpSummarySections(pumpSummary),
          ...this.buildTowerSummarySections(towerSummary),
        ],
      }))
    );
  }

  private buildFacilityInfoSections(): PairedKeyValueSection[] {
    const facilityInfo: FacilityInfo = this.processCoolingAssessmentService.settingsSignal()?.facilityInfo;
    if (!facilityInfo) {
      return [];
    }

    const generalAndLocation: PairedKeyValueSection = {
      type: 'paired-key-value',
      title: 'Facility Info',
      group: ROUTE_TOKENS.facilityInfo,
      left: {
        headerLabel: 'General',
        rows: [
          { label: 'Company Name', value: facilityInfo.companyName ?? '' },
          { label: 'Facility Name', value: facilityInfo.facilityName ?? '' },
          { label: 'Assessment Date', value: facilityInfo.date ?? '' },
        ],
      },
      right: {
        headerLabel: 'Location',
        rows: [
          { label: 'Street', value: facilityInfo.address?.street ?? '' },
          { label: 'City', value: facilityInfo.address?.city ?? '' },
          { label: 'State', value: facilityInfo.address?.state ?? '' },
          { label: 'Zip', value: facilityInfo.address?.zip ?? '' },
          { label: 'Country', value: facilityInfo.address?.country ?? '' },
        ],
      },
    };

    const contacts: PairedKeyValueSection = {
      type: 'paired-key-value',
      group: ROUTE_TOKENS.facilityInfo,
      left: {
        headerLabel: 'Facility Contact',
        rows: [
          { label: 'Name', value: facilityInfo.facilityContact?.contactName ?? '' },
          { label: 'Phone', value: String(facilityInfo.facilityContact?.phoneNumber ?? '') },
          { label: 'Email', value: facilityInfo.facilityContact?.email ?? '' },
        ],
      },
      right: {
        headerLabel: 'Assessment Contact',
        rows: [
          { label: 'Name', value: facilityInfo.assessmentContact?.contactName ?? '' },
          { label: 'Phone', value: String(facilityInfo.assessmentContact?.phoneNumber ?? '') },
          { label: 'Email', value: facilityInfo.assessmentContact?.email ?? '' },
        ],
      },
    };

    return [generalAndLocation, contacts];
  }

  private buildExecutiveSummarySections(ui: ExecutiveSummaryUI): SummaryTableSection[] {
    const headers = this.buildResultHeaders(ui.modificationNames);
    const emphasisRowsIndices = ui.resultRows
      .map((row, idx) => (row.className === 'emphasis' ? idx : -1))
      .filter(idx => idx !== -1);

    const section: SummaryTableSection = {
      type: 'summary-table',
      title: 'Executive Summary',
      headers,
      rows: ui.resultRows.map(row => this.resultRowToStrings(row)),
      emphasisRowsIndices,
      group: ROUTE_TOKENS.executiveSummary,
    };

    return [...[section]];
  }

  private buildSystemProfileSections(ui: SystemProfileUI): SummaryTableSection[] {
    const sections: SummaryTableSection[] = [];
    const isImperial = this.execSummaryService.settingsSignal().unitsOfMeasure === 'Imperial';

    const efficiencyLabel = decodeHtmlEntities(
      isImperial ? PROCESS_COOLING_UNITS.efficiency.labelHTML.imperial : PROCESS_COOLING_UNITS.efficiency.labelHTML.metric
    );
    const powerLabel = decodeHtmlEntities(
      isImperial ? PROCESS_COOLING_UNITS.chillerPower.labelHTML.imperial : PROCESS_COOLING_UNITS.chillerPower.labelHTML.metric
    );
    const energyLabel = decodeHtmlEntities(
      isImperial ? PROCESS_COOLING_UNITS.energy.labelHTML.imperial : PROCESS_COOLING_UNITS.energy.labelHTML.metric
    );

    for (const result of ui.systemProfileChillerOutput) {
      const rows: string[][] = [];
      const subGroupHeaderIndices: number[] = [];
      const emptyLoadCells = Array(LOAD_LABELS.length + 1).fill('');

      for (const chiller of result.chillerOutputs) {
        subGroupHeaderIndices.push(rows.length);
        rows.push([chiller.name, ...emptyLoadCells]);

        rows.push([
          `Performance (${efficiencyLabel})`,
          ...chiller.efficiency.map(v => formatNumber(v, 3)),
          '',
        ]);
        rows.push([
          'Hours',
          ...chiller.hours.map(v => formatNumber(v, 0)),
          formatNumber(chiller.totalHours, 0),
        ]);
        rows.push([
          `Power (${powerLabel})`,
          ...chiller.power.map(v => formatNumber(v, 1)),
          '',
        ]);
        rows.push([
          `Energy (${energyLabel})`,
          ...chiller.energy.map(v => formatNumber(v, 0)),
          formatNumber(chiller.totalEnergy, 0),
        ]);
      }

      const section: SummaryTableSection = {
        type: 'summary-table',
        title: `System Profile — ${decodeHtmlEntities(result.name)}`,
        headers: ['', ...LOAD_LABELS, 'Total'],
        rows,
        subGroupHeaderIndices,
        pageBreakBefore: true,
        group: ROUTE_TOKENS.systemProfile,
      };
      sections.push(section);
    }

    return [...sections];
  }

  private buildPerformanceProfileSections(): ChartSection[] {
    const section: ChartSection = {
      type: 'chart',
      title: 'Chiller Performance Profile',
      group: ROUTE_TOKENS.performanceProfile,
      pageBreakBefore: true,
      imageDataProvider: async () => {
        const results = await firstValueFrom(this.resultsService.baselineResults$);
        if (!results?.chiller?.length) throw new Error('No chiller results available');

        const { traces, layout } = this.chartsService.buildChillerProfileChart(results.chiller);

        const div = document.createElement('div');
        div.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1400px;height:700px';
        document.body.appendChild(div);

        const plotly = await this.plotlyService.getPlotly();
        try {
          await plotly.newPlot(div, traces, layout, { staticPlot: true, displaylogo: false });
          return await plotly.toImage(div, { format: 'png', width: 1400, height: 700 });
        } finally {
          plotly.purge(div);
          document.body.removeChild(div);
        }
      },
    };

    return [section];
  }

  private buildPumpSummarySections(ui: PumpSummaryUI): SummaryTableSection[] {
    const headers = this.buildResultHeaders(ui.modificationNames);
    const sections: SummaryTableSection[] = [];

    if (ui.chillerPumpingEnergy?.length) {
      sections.push({
        type: 'summary-table',
        title: 'Chilled Water Pumping Energy',
        headers,
        rows: ui.chillerPumpingEnergy.map(row => this.resultRowToStrings(row)),
        group: ROUTE_TOKENS.pumpSummary,
        pageBreakBefore: sections.length === 0,
      });
    }

    if (ui.condenserPumpingEnergy?.length) {
      sections.push({
        type: 'summary-table',
        title: 'Condenser Water Pumping Energy',
        headers,
        rows: ui.condenserPumpingEnergy.map(row => this.resultRowToStrings(row)),
        group: ROUTE_TOKENS.pumpSummary,
        pageBreakBefore: sections.length === 0,
      });
    }

    if (ui.summaryRows?.length) {
      const emphasisRowsIndices = ui.summaryRows
        .map((row, idx) => (row.className === 'emphasis' ? idx : -1))
        .filter(idx => idx !== -1);
      sections.push({
        type: 'summary-table',
        title: 'Pump Summary',
        headers,
        rows: ui.summaryRows.map(row => this.resultRowToStrings(row)),
        emphasisRowsIndices,
        group: ROUTE_TOKENS.pumpSummary,
        pageBreakBefore: sections.length === 0,
      });
    }

    return [...sections];
  }

  private buildTowerSummarySections(ui: TowerSummaryUI): (SummaryTableSection | ChartSection)[] {
    const sections: (SummaryTableSection | ChartSection)[] = [];
    const resultHeaders = this.buildResultHeaders(ui.modificationNames);

    if (ui.totalRows?.length) {
      const emphasisRowsIndices = ui.totalRows
        .map((row, idx) => (row.className === 'emphasis' ? idx : -1))
        .filter(idx => idx !== -1);
      sections.push({
        type: 'summary-table',
        title: 'Tower Summary',
        headers: resultHeaders,
        rows: ui.totalRows.map(row => this.resultRowToStrings(row)),
        emphasisRowsIndices,
        group: ROUTE_TOKENS.towerSummary,
        pageBreakBefore: sections.length === 0,
      });
    }

    if (ui.baselineEnergyBins?.length) {
      sections.push(this.buildBinTable(
        'Tower Energy by Temperature Bin (Baseline)',
        ui.baselineEnergyBins,
        sections.length === 0,
      ));
    }

    ui.modificationEnergyBins?.forEach((bins, i) => {
      if (bins?.length) {
        const modName = ui.modificationNames?.[i]?.name ?? `Modification ${i + 1}`;
        sections.push(this.buildBinTable(
          `Tower Energy by Temperature Bin (${modName})`,
          bins,
          sections.length === 0,
        ));
      }
    });

    return [...sections];
  }

  private buildBinTable(title: string, binRows: TowerBinRow[], pageBreakBefore = false): SummaryTableSection {
    const isImperial = this.processCoolingAssessmentService.settingsSignal().unitsOfMeasure === 'Imperial';
    const tempUnit = isImperial ? '°F' : '°C';

    const binTemps = this.towerSummaryService.getBinTemps();
    const binLabels: string[] = [];
    if (binTemps.length >= 2) {
      binLabels.push(`< ${Math.round(binTemps[0][0])} ${tempUnit}`);
      for (let i = 1; i < binTemps.length - 1; i++) {
        binLabels.push(`${Math.round(binTemps[i][0])} - ${Math.round(binTemps[i][1])} ${tempUnit}`);
      }
      binLabels.push(`> ${Math.round(binTemps[binTemps.length - 1][0])} ${tempUnit}`);
    }

    const section: SummaryTableSection = {
      type: 'summary-table',
      title,
      headers: ['', ...binLabels],
      rows: binRows.map(row => [
        labelWithUnits(row.label, row.units),
        ...row.binValues.map(v => (v != null ? formatNumber(v, 0) : '—')),
      ]),
      group: ROUTE_TOKENS.towerSummary,
      pageBreakBefore,
    };

    return section;
  }

  private buildResultHeaders(modificationNames: ModificationNameCell[]): string[] {
    return ['', 'Baseline', ...(modificationNames?.map(m => decodeHtmlEntities(m.name)) ?? [])];
  }

  private resultRowToStrings(row: ReportTableRow): string[] {
    return [
      labelWithUnits(row.label, row.units),
      formatCell(row.baseline),
      ...(row.modifications?.map(m => formatCell(m)) ?? []),
    ];
  }
}
