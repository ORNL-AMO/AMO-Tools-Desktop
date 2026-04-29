import { inject, Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { ReportDataAdapter } from '../../shared/report-builder/adapters/report-data-adapter';
import { decodeHtmlEntities, divider, formatCell, formatNumber, labelWithUnits } from '../../shared/report-builder/adapters/report-adapter.utils';
import { ReportDocument, ReportMeta } from '../../shared/report-builder/models/report-document.model';
import { ChartSection, SummaryTableSection } from '../../shared/report-builder/models/report-section.model';
import { ExecutiveSummaryResultsService, ExecutiveSummaryUI } from '../services/executive-summary-results.service';
import { PumpSummaryResultsService, PumpSummaryUI } from '../services/pump-summary-results.service';
import { TowerBinRow, TowerSummaryService, TowerSummaryUI } from '../services/tower-summary.service';
import { SystemProfileService, SystemProfileUI } from '../services/system-profile.service';
import { ModificationNameCell, ReportTableRow } from '../../shared/report-builder/models/report-ui-models';
import { LOAD_LABELS } from '../constants/process-cooling-constants';
import { PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';

@Injectable()
export class ProcessCoolingReportAdapter implements ReportDataAdapter {
  private readonly execSummaryService = inject(ExecutiveSummaryResultsService);
  private readonly pumpSummaryService = inject(PumpSummaryResultsService);
  private readonly towerSummaryService = inject(TowerSummaryService);
  private readonly systemProfileService = inject(SystemProfileService);

  private static readonly ACCENT_COLOR: [number, number, number] = [0, 152, 133]; // #009885

  buildDocument(meta: ReportMeta): Observable<ReportDocument> {
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
          ...this.buildExecutiveSummarySections(execSummary),
          divider(),
          ...this.buildSystemProfileSections(systemProfile),
          divider(),
          ...this.buildPerformanceProfileSections(),
          divider(),
          ...this.buildPumpSummarySections(pumpSummary),
          divider(),
          ...this.buildTowerSummarySections(towerSummary),
        ],
      }))
    );
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
      const subGroupHeaderIndicies: number[] = [];
      const emptyLoadCells = Array(LOAD_LABELS.length + 1).fill('');

      for (const chiller of result.chillerOutputs) {
        subGroupHeaderIndicies.push(rows.length);
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
        subGroupHeaderIndicies,
        pageBreakBefore: true,
      };
      sections.push(section);
    }

    return [...sections];
  }

  private buildPerformanceProfileSections(): ChartSection[] {
    const section: ChartSection = {
      type: 'chart',
      title: 'Chiller Performance Profile',
      elementId: 'pc-chiller-profile-chart',
    };

    return [...[section]];
  }

  private buildPumpSummarySections(ui: PumpSummaryUI): SummaryTableSection[] {
    const headers = this.buildResultHeaders(ui.modificationNames);
    const sections: SummaryTableSection[] = [];

    if (ui.chillerPumpingEnergy?.length) {
      const chillerSection: SummaryTableSection = {
        type: 'summary-table',
        title: 'Chilled Water Pumping Energy',
        headers,
        rows: ui.chillerPumpingEnergy.map(row => this.resultRowToStrings(row)),
      };
      sections.push(chillerSection);
    }

    if (ui.condenserPumpingEnergy?.length) {
      const condenserSection: SummaryTableSection = {
        type: 'summary-table',
        title: 'Condenser Water Pumping Energy',
        headers,
        rows: ui.condenserPumpingEnergy.map(row => this.resultRowToStrings(row)),
      };
      sections.push(condenserSection);
    }

    if (ui.summaryRows?.length) {
      const emphasisRowsIndices = ui.summaryRows
        .map((row, idx) => (row.className === 'emphasis' ? idx : -1))
        .filter(idx => idx !== -1);
      const summarySection: SummaryTableSection = {
        type: 'summary-table',
        title: 'Pump Summary',
        headers,
        rows: ui.summaryRows.map(row => this.resultRowToStrings(row)),
        emphasisRowsIndices,
      };
      sections.push(summarySection);
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
      const totalsSection: SummaryTableSection = {
        type: 'summary-table',
        title: 'Tower Summary',
        headers: resultHeaders,
        rows: ui.totalRows.map(row => this.resultRowToStrings(row)),
        emphasisRowsIndices,
      };
      sections.push(totalsSection);
    }

    if (ui.baselineEnergyBins?.length && ui.binLabels?.length) {
      const baselineBinSection = this.buildBinTable(
        'Tower Energy by Temperature Bin (Baseline)',
        ui.baselineEnergyBins,
        ui.binLabels,
      );
      sections.push(baselineBinSection);
    }

    ui.modificationEnergyBins?.forEach((bins, i) => {
      if (bins?.length) {
        const modName = ui.modificationNames?.[i]?.name ?? `Modification ${i + 1}`;
        const modBinSection = this.buildBinTable(
          `Tower Energy by Temperature Bin (${modName})`,
          bins,
          ui.binLabels,
        );
        sections.push(modBinSection);
      }
    });

    return [...sections];
  }

  private buildBinTable(title: string, binRows: TowerBinRow[], binLabels: string[]): SummaryTableSection {
    const decodedLabels = binLabels.map(decodeHtmlEntities);
    const section: SummaryTableSection = {
      type: 'summary-table',
      title,
      headers: ['', ...decodedLabels],
      rows: binRows.map(row => [
        labelWithUnits(row.label, row.units),
        ...row.binValues.map(v => (v != null ? formatNumber(v, 0) : '—')),
      ]),
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
