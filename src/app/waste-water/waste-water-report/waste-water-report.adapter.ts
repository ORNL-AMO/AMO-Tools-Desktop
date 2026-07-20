import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ReportDataAdapter } from '../../shared/report-builder/adapters/report-data-adapter';
import { appendSubGroup, buildFacilityInfoSections, createSummaryRowBuilder, formatNumber } from '../../shared/report-builder/adapters/report-adapter.utils';
import { ReportDocument, ReportMeta, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { ChartSection, SummaryTableSection } from '../../shared/report-builder/models/report-section.model';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { WasteWater, WasteWaterData, WasteWaterResults } from '../../shared/models/waste-water';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { FeatureFlagService } from '../../shared/feature-flag.service';
import { AnalysisGraphItem, WasteWaterAnalysisService } from '../waste-water-analysis/waste-water-analysis.service';
import { DataTableVariable } from '../waste-water-analysis/dataTableVariables';
import { aeratorTypes } from '../waste-water-defaults';
import { graphColors } from '../../shared/graphColors';
import { TraceData } from '../../shared/models/plotting';
import { ReportChartRenderService } from '../../shared/report-builder/services/report-chart-render.service';
import { getWasteWaterPaybackPeriod } from './waste-water-report.utils';

export const WASTE_WATER_SECTION_GROUPS: ReportSectionGroup[] = [
  { key: 'facilityInfo', label: 'Facility Info', description: 'Facility and contact information' },
  { key: 'results', label: 'Result Data', description: 'Baseline and modification results comparison' },
  { key: 'graphs', label: 'Report Graphs', description: 'SRT analysis and energy comparison charts' },
  { key: 'inputData', label: 'Input Summary', description: 'Summary of user input data' },
];

const REPORT_GRAPH_VARIABLES = ['Se', 'MLVSS', 'MLSS', 'SludgeProd', 'SolidProd', 'O2Reqd', 'EstimatedEff'];

const SRT_X_AXIS_VARIABLE: DataTableVariable = {
  name: 'SRT',
  label: 'SRT Days',
  metricUnit: '',
  imperialUnit: '',
  selected: true,
};

interface ModificationGraphData {
  name: string;
  results: WasteWaterResults;
  color: string;
}

@Injectable()
export class WasteWaterReportAdapter implements ReportDataAdapter {
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly wasteWaterAnalysisService = inject(WasteWaterAnalysisService);
  private readonly featureFlagService = inject(FeatureFlagService);
  private readonly chartRenderService = inject(ReportChartRenderService);

  private static readonly ACCENT_COLOR: [number, number, number] = [0, 48, 135]; // #003087

  buildDocument(assessment: Assessment): Observable<ReportDocument> {
    const settings = this.settingsDbService.getByAssessmentId(assessment, true);
    const wasteWater = assessment.wasteWater;
    const modNames = wasteWater.modifications?.map(m => m.name ?? '') ?? [];

    const meta: ReportMeta = {
      title: assessment.name,
      date: new Date().toISOString(),
      moduleColor: WasteWaterReportAdapter.ACCENT_COLOR,
    };

    return of({
      meta,
      sections: [
        ...buildFacilityInfoSections(settings?.facilityInfo, 'facilityInfo'),
        ...this.buildResultsSections(wasteWater, settings, modNames),
        ...this.buildGraphSections(wasteWater, settings),
        ...this.buildInputSummarySections(wasteWater, settings, modNames),
      ],
    });
  }

  private units(settings: Settings) {
    const imperial = settings.unitsOfMeasure === 'Imperial';
    return {
      flow: imperial ? 'MGD' : 'm3/day',
      volume: imperial ? 'Mgal' : 'm3',
      mass: imperial ? 'lb/day' : 'kg/day',
      mixing: imperial ? 'hp/Mgal' : 'kW/m3',
      fieldOtr: imperial ? 'lb O2/hp-hr' : 'kg O2/kWh',
      volr: imperial ? 'lb BOD/kft3-day' : 'kg BOD/m3-day',
      sotr: imperial ? 'lb O2/(hp-hr)' : 'kg O2/(kWh)',
      power: imperial ? 'hp' : 'kW',
      distance: imperial ? 'ft' : 'm',
    };
  }

  private buildResultsSections(wasteWater: WasteWater, settings: Settings, modNames: string[]): SummaryTableSection[] {
    const headers = ['', 'Baseline', ...modNames];
    const baseline = wasteWater.baselineData.outputs;
    const mods = wasteWater.modifications ?? [];
    const u = this.units(settings);
    const showCO2 = this.featureFlagService.showOperationalImpacts();

    const fmt = (value: number | undefined, dec = 1) => value != null ? formatNumber(value, dec) : '—';
    const modCols = (key: keyof WasteWaterResults, dec = 1) => mods.map(m => fmt(m.outputs?.[key] as number | undefined, dec));

    const percentSavings = mods.map(m =>
      m.outputs?.percentCostSavings != null ? fmt(m.outputs.percentCostSavings, 0) + ' %' : '—'
    );

    const rows: string[][] = [];
    const subGroupHeaderIndices: number[] = [];

    rows.push(['Percent Savings (%)', '—', ...percentSavings]);

    const addGroup = (label: string, groupRows: string[][]) =>
      appendSubGroup(rows, subGroupHeaderIndices, headers.length, label, groupRows);

    addGroup('Influent', [
      [`Total Average Daily Flow Rate (${u.flow})`, fmt(baseline?.TotalAverageDailyFlowRate, 1), ...modCols('TotalAverageDailyFlowRate', 1)],
      [`Aeration Volume in Service (${u.volume})`, fmt(baseline?.VolumeInService, 1), ...modCols('VolumeInService', 1)],
      ['Influent CBOD5 Concentration (mg/L)', fmt(baseline?.InfluentBOD5Concentration, 1), ...modCols('InfluentBOD5Concentration', 1)],
      [`Influent CBOD5 Mass Loading (${u.mass})`, fmt(baseline?.InfluentBOD5MassLoading, 0), ...modCols('InfluentBOD5MassLoading', 0)],
      [`SEC WW Oxid N Load (${u.mass})`, fmt(baseline?.SecWWOxidNLoad, 1), ...modCols('SecWWOxidNLoad', 1)],
      [`SEC WW TSS Load (${u.mass})`, fmt(baseline?.SecWWTSSLoad, 1), ...modCols('SecWWTSSLoad', 1)],
    ]);

    addGroup('Activated Sludge Process', [
      ['F/M Ratio (1/day)', fmt(baseline?.FM_ratio, 3), ...modCols('FM_ratio', 3)],
      ['Solids Retention Time (day)', fmt(baseline?.SolidsRetentionTime, 1), ...modCols('SolidsRetentionTime', 1)],
      ['MLSS Concentration (mg/L)', fmt(baseline?.MLSS, 1), ...modCols('MLSS', 1)],
      ['MLVSS Concentration (mg/L)', fmt(baseline?.MLVSS, 1), ...modCols('MLVSS', 1)],
      [`TSS Sludge Production (${u.mass})`, fmt(baseline?.TSSSludgeProduction, 1), ...modCols('TSSSludgeProduction', 1)],
      [`TSS in Activated Sludge Effluent (${u.mass})`, fmt(baseline?.TSSInActivatedSludgeEffluent, 1), ...modCols('TSSInActivatedSludgeEffluent', 1)],
      [`Total O2 Requirements (${u.mass})`, fmt(baseline?.TotalOxygenRequirements, 1), ...modCols('TotalOxygenRequirements', 1)],
      [`Total O2 Required - Denitrification (${u.mass})`, fmt(baseline?.TotalOxygenReqWDenit, 1), ...modCols('TotalOxygenReqWDenit', 1)],
      [`Total O2 Supplied (${u.mass})`, fmt(baseline?.TotalOxygenSupplied, 1), ...modCols('TotalOxygenSupplied', 1)],
      [`Mixing Intensity in Reactor (${u.mixing})`, fmt(baseline?.MixingIntensityInReactor, 1), ...modCols('MixingIntensityInReactor', 1)],
      [`RAS Flow Rate (${u.flow})`, fmt(baseline?.RASFlowRate, 2), ...modCols('RASFlowRate', 2)],
      ['RAS Recycle Percentage (%)', fmt(baseline?.RASRecyclePercentage, 1), ...modCols('RASRecyclePercentage', 1)],
      [`WAS Flow Rate (${u.flow})`, fmt(baseline?.WASFlowRate, 3), ...modCols('WASFlowRate', 3)],
      [`RAS TSS Concentration (${u.flow})`, fmt(baseline?.RASTSSConcentration, 1), ...modCols('RASTSSConcentration', 1)],
      [`Total Sludge Production (${u.mass})`, fmt(baseline?.TotalSludgeProduction, 1), ...modCols('TotalSludgeProduction', 1)],
      ['Reactor Detention Time (hr)', fmt(baseline?.ReactorDetentionTime, 1), ...modCols('ReactorDetentionTime', 1)],
      [`VOLR (${u.volr})`, fmt(baseline?.VOLR, 1), ...modCols('VOLR', 1)],
    ]);

    addGroup('Effluent', [
      ['Total Effluent CBOD5 (mg/L)', fmt(baseline?.EffluentCBOD5, 1), ...modCols('EffluentCBOD5', 1)],
      ['Effluent TSS (mg/L)', fmt(baseline?.EffluentTSS, 1), ...modCols('EffluentTSS', 1)],
      ['Effluent Ammonia-N (mg/L)', fmt(baseline?.EffluentAmmonia_N, 2), ...modCols('EffluentAmmonia_N', 2)],
      ['Effluent NO3-N (mg/L)', fmt(baseline?.EffluentNO3_N, 1), ...modCols('EffluentNO3_N', 1)],
      ['Effluent NO3-N - Denitrification (mg/L)', fmt(baseline?.EffluentNO3_N_W_Denit, 1), ...modCols('EffluentNO3_N_W_Denit', 1)],
    ]);

    const aeratorRows: string[][] = [
      [`Field O2 Transfer Rate (${u.fieldOtr})`, fmt(baseline?.FieldOTR, 2), ...modCols('FieldOTR', 2)],
    ];

    if (showCO2) {
      const emissionsUnit = settings.emissionsUnit === 'Imperial' ? 'ton CO2' : 'tonne CO2';
      aeratorRows.push(
        [`Annual CO2 Emissions (${emissionsUnit})`, fmt(baseline?.co2EmissionsOutput, 0), ...modCols('co2EmissionsOutput', 0)],
        [`Annual CO2 Emissions Savings (${emissionsUnit})`, '—', ...mods.map(m => fmt(m.outputs?.co2EmissionsSavings, 0))],
      );
    }

    aeratorRows.push(
      ['Aeration Energy Use (MWh/yr)', fmt(baseline?.AeEnergyAnnual, 0), ...modCols('AeEnergyAnnual', 0)],
      ['Energy Savings (MWh/yr)', '—', ...mods.map(m => fmt(m.outputs?.energySavings, 0))],
      [`Aeration Cost (${settings.currency}/yr)`, fmt(baseline?.AeCost, 0), ...modCols('AeCost', 0)],
      [`Cost Savings (${settings.currency}/yr)`, '—', ...mods.map(m => fmt(m.outputs?.costSavings, 0))],
      ['Implementation Cost', '—', ...mods.map(m => fmt(m.operations?.implementationCosts, 0))],
      ['Payback Period (months)', '—', ...mods.map(m => this.calcPayback(baseline, m))],
    );

    addGroup('Aerator', aeratorRows);

    const emphasisRowsIndices = this.findRowIndices(rows, [
      'Aeration Energy Use (MWh/yr)',
      'Energy Savings (MWh/yr)',
      `Aeration Cost (${settings.currency}/yr)`,
      `Cost Savings (${settings.currency}/yr)`,
    ]);

    return [{
      type: 'summary-table',
      title: 'Result Data',
      group: 'results',
      headers,
      rows,
      subGroupHeaderIndices,
      emphasisRowsIndices,
      pageBreakBefore: true,
    }];
  }

  private findRowIndices(rows: string[][], labels: string[]): number[] {
    return labels.map(label => rows.findIndex(r => r[0] === label)).filter(i => i !== -1);
  }

  private calcPayback(baseline: WasteWaterResults, mod: WasteWaterData): string {
    return formatNumber(getWasteWaterPaybackPeriod(baseline, mod), 1);
  }

  private buildInputSummarySections(wasteWater: WasteWater, settings: Settings, modNames: string[]): SummaryTableSection[] {
    const headers = ['', 'Baseline', ...modNames];
    const baseline = wasteWater.baselineData;
    const mods = wasteWater.modifications ?? [];
    const u = this.units(settings);
    const showCO2 = this.featureFlagService.showOperationalImpacts();

    const row = createSummaryRowBuilder(mods);

    const operationsRows: string[][] = [
      row('Operating Months', baseline.operations?.operatingMonths, m => m.operations?.operatingMonths),
    ];
    if (showCO2) {
      operationsRows.push(
        row('Total Emission Output Rate (kg CO2/MWh)', baseline.co2SavingsData?.totalEmissionOutputRate, m => m.co2SavingsData?.totalEmissionOutputRate)
      );
    }

    const activatedSludgeRows: string[][] = [
      row('Temperature (C)', baseline.activatedSludgeData?.Temperature, m => m.activatedSludgeData?.Temperature),
      row('Influent CBOD5 (So) (mg/L)', baseline.activatedSludgeData?.So, m => m.activatedSludgeData?.So),
      row(`Volume (${u.volume})`, baseline.activatedSludgeData?.Volume, m => m.activatedSludgeData?.Volume),
      row(`Flow Rate (${u.flow})`, baseline.activatedSludgeData?.FlowRate, m => m.activatedSludgeData?.FlowRate),
      row('Inert VSS (mg/L)', baseline.activatedSludgeData?.InertVSS, m => m.activatedSludgeData?.InertVSS),
      row('Oxidizable N (mg/L)', baseline.activatedSludgeData?.OxidizableN, m => m.activatedSludgeData?.OxidizableN),
      row('VSS/TSS Ratio of Biomass', baseline.activatedSludgeData?.Biomass, m => m.activatedSludgeData?.Biomass),
      row('Influent TSS (mg/L)', baseline.activatedSludgeData?.InfluentTSS, m => m.activatedSludgeData?.InfluentTSS),
      row('Inert Inorganic TSS (mg/L)', baseline.activatedSludgeData?.InertInOrgTSS, m => m.activatedSludgeData?.InertInOrgTSS),
      row('Effluent TSS (mg/L)', baseline.activatedSludgeData?.EffluentTSS, m => m.activatedSludgeData?.EffluentTSS),
      row('RAS TSS (mg/L)', baseline.activatedSludgeData?.RASTSS, m => m.activatedSludgeData?.RASTSS),
      row('Plant Control Point', baseline.activatedSludgeData?.CalculateGivenSRT, m => m.activatedSludgeData?.CalculateGivenSRT,
        v => v ? 'SRT Days' : 'MLSS'),
      [
        'MLSS (mg/L)',
        baseline.activatedSludgeData?.CalculateGivenSRT ? '—' : (baseline.activatedSludgeData?.MLSSpar != null ? String(baseline.activatedSludgeData.MLSSpar) : '—'),
        ...mods.map(m => m.activatedSludgeData?.CalculateGivenSRT ? '—' : (m.activatedSludgeData?.MLSSpar != null ? String(m.activatedSludgeData.MLSSpar) : '—')),
      ],
      [
        'SRT Days',
        baseline.activatedSludgeData?.CalculateGivenSRT ? (baseline.activatedSludgeData?.DefinedSRT != null ? String(baseline.activatedSludgeData.DefinedSRT) : '—') : '—',
        ...mods.map(m => m.activatedSludgeData?.CalculateGivenSRT ? (m.activatedSludgeData?.DefinedSRT != null ? String(m.activatedSludgeData.DefinedSRT) : '—') : '—'),
      ],
      row('Cell Debris Biomass Fraction (fd) (mg VSS/mg)', baseline.activatedSludgeData?.FractionBiomass, m => m.activatedSludgeData?.FractionBiomass),
      row('Biomass Yield Constant (Y) (mg VSS/mg)', baseline.activatedSludgeData?.BiomassYeild, m => m.activatedSludgeData?.BiomassYeild),
      row('Half-saturation Constant (Ks) (mg/L BOD)', baseline.activatedSludgeData?.HalfSaturation, m => m.activatedSludgeData?.HalfSaturation),
      row('Endogenous Decay Coefficient (Kd) (1/day)', baseline.activatedSludgeData?.MicrobialDecay, m => m.activatedSludgeData?.MicrobialDecay),
      row('Max. Specific Substrate Utilization Rate (k) (1/day)', baseline.activatedSludgeData?.MaxUtilizationRate, m => m.activatedSludgeData?.MaxUtilizationRate),
    ];

    const aeratorRows: string[][] = [
      row('Operating Dissolved O2 (DO) (mg/L)', baseline.aeratorPerformanceData?.OperatingDO, m => m.aeratorPerformanceData?.OperatingDO),
      row('O2 Transfer Coefficient Ratio (alpha)', baseline.aeratorPerformanceData?.Alpha, m => m.aeratorPerformanceData?.Alpha),
      row('Saturation DO Concentration Ratio (beta)', baseline.aeratorPerformanceData?.Beta, m => m.aeratorPerformanceData?.Beta),
      row('Aerator/Blower', baseline.aeratorPerformanceData?.Aerator, m => m.aeratorPerformanceData?.Aerator),
      row(`Standard O2 Transfer Rate (SOTR) (${u.sotr})`, baseline.aeratorPerformanceData?.SOTR, m => m.aeratorPerformanceData?.SOTR),
      row(`Aeration Operating Power (${u.power})`, baseline.aeratorPerformanceData?.Aeration, m => m.aeratorPerformanceData?.Aeration),
      row(`Site Elevation (${u.distance})`, baseline.aeratorPerformanceData?.Elevation, m => m.aeratorPerformanceData?.Elevation),
      row('Aerator/Blower Operating Time (hr/day)', baseline.aeratorPerformanceData?.OperatingTime, m => m.aeratorPerformanceData?.OperatingTime),
      row('Type of Aerator/Blower', baseline.aeratorPerformanceData?.TypeAerators, m => m.aeratorPerformanceData?.TypeAerators,
        v => this.getAeratorTypeDisplay(v as number)),
      row('Aerator/Blower Speed (%)', baseline.aeratorPerformanceData?.Speed, m => m.aeratorPerformanceData?.Speed),
      row('Electricity Cost ($/kWh)', baseline.operations?.EnergyCostUnit, m => m.operations?.EnergyCostUnit,
        v => v != null ? formatNumber(v as number, 4) : '—'),
      row('Anoxic zone with returned mixed liquor?', baseline.aeratorPerformanceData?.AnoxicZoneCondition, m => m.aeratorPerformanceData?.AnoxicZoneCondition,
        v => v ? 'Yes' : 'No'),
    ];

    const allRows: string[][] = [];
    const subGroupHeaderIndices: number[] = [];
    const addGroup = (label: string, groupRows: string[][]) =>
      appendSubGroup(allRows, subGroupHeaderIndices, headers.length, label, groupRows);

    addGroup('Operations', operationsRows);
    addGroup('Activated Sludge Data', activatedSludgeRows);
    addGroup('Aerator Performance Data', aeratorRows);

    return [{
      type: 'summary-table',
      title: 'Input Summary',
      group: 'inputData',
      headers,
      rows: allRows,
      subGroupHeaderIndices,
      pageBreakBefore: true,
    }];
  }

  private getAeratorTypeDisplay(value: number): string {
    const found = aeratorTypes.find(t => t.value === value);
    return found?.display ?? '—';
  }

  private buildGraphSections(wasteWater: WasteWater, settings: Settings): ChartSection[] {
    const baseline = wasteWater.baselineData.outputs;
    if (!baseline) return [];
    const mods = wasteWater.modifications ?? [];

    const modificationsResultsArr: ModificationGraphData[] = mods
      .map((m, i) => ({ name: m.name, results: m.outputs, color: graphColors[i + 1] }))
      .filter((m): m is ModificationGraphData => !!m.results);

    const sections: ChartSection[] = [];

    const analysisGraphItems = this.wasteWaterAnalysisService
      .getAnalysisGraphItems(baseline, modificationsResultsArr, SRT_X_AXIS_VARIABLE)
      .filter(item => REPORT_GRAPH_VARIABLES.includes(item.variableY.name));

    analysisGraphItems.forEach((item, i) => {
      sections.push({
        type: 'chart',
        title: item.title,
        group: 'graphs',
        pageBreakBefore: i === 0,
        imageDataProvider: () => this.renderSrtGraph(item, settings),
      });
    });

    sections.push({
      type: 'chart',
      title: 'Energy Usage',
      group: 'graphs',
      pageBreakBefore: true,
      imageDataProvider: () => this.renderEnergyBarChart('energyUse', baseline, modificationsResultsArr, settings),
    });
    sections.push({
      type: 'chart',
      title: 'Energy Cost',
      group: 'graphs',
      imageDataProvider: () => this.renderEnergyBarChart('energyCost', baseline, modificationsResultsArr, settings),
    });

    return sections;
  }

  private async renderSrtGraph(item: AnalysisGraphItem, settings: Settings): Promise<string> {
    const unitSuffix = settings.unitsOfMeasure === 'Metric' ? item.variableY.metricUnit : item.variableY.imperialUnit;
    const xTitle = item.variableX.name === 'SRT'
      ? item.variableX.label
      : `${item.variableX.label} (${settings.unitsOfMeasure === 'Imperial' ? item.variableX.imperialUnit : item.variableX.metricUnit})`;

    const layout = {
      title: { text: item.title },
      showlegend: true,
      legend: { orientation: 'h' },
      font: { size: 12 },
      yaxis: { title: { text: unitSuffix } },
      xaxis: { title: { text: xTitle } },
      margin: { t: 60, b: 60, l: 60, r: 30 },
      paper_bgcolor: 'white',
    };

    return this.renderPlotlyChart({ traces: item.traces as unknown as TraceData[], layout });
  }

  private async renderEnergyBarChart(
    chartInfo: 'energyCost' | 'energyUse',
    baseline: WasteWaterResults,
    modificationsResultsArr: ModificationGraphData[],
    settings: Settings
  ): Promise<string> {
    const isCost = chartInfo === 'energyCost';
    const xVals = ['Baseline', ...modificationsResultsArr.map(m => m.name)];
    const markerColors = ['#1E7640', ...modificationsResultsArr.map(m => m.color)];
    const yVals = [
      isCost ? baseline.AeCost : baseline.AeEnergyAnnual,
      ...modificationsResultsArr.map(m => isCost ? m.results.AeCost : m.results.AeEnergyAnnual),
    ];

    const traces: TraceData[] = [{
      x: xVals,
      y: yVals,
      type: 'bar',
      text: yVals.map(v => formatNumber(v, 2)),
      textposition: 'auto',
      marker: { color: markerColors, line: { color: '#000000', width: 1 } },
    }];

    const layout = {
      title: { text: isCost ? 'Energy Cost' : 'Energy Usage' },
      yaxis: { title: { text: isCost ? `${settings.currency}/yr` : 'MWh/yr' } },
      margin: { t: 60, b: 60, l: 70, r: 30 },
      paper_bgcolor: 'white',
    };

    return this.renderPlotlyChart({ traces, layout });
  }

  private renderPlotlyChart(chart: { traces: TraceData[]; layout: object }): Promise<string> {
    return this.chartRenderService.renderChartToImage(chart.traces, chart.layout);
  }
}
