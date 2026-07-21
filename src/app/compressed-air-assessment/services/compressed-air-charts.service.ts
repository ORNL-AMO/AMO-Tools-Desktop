import { inject, Injectable } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import {
  CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, DayTypeAirflowTotals,
  EndUseDayTypeSetup, Modification, ProfileSummary, SystemInformation,
} from '../../shared/models/compressed-air-assessment';
import { BaselineResults, DayTypeModificationResult } from '../calculations/caCalculationModels';
import { CompressedAirAssessmentModificationResults } from '../calculations/modifications/CompressedAirAssessmentModificationResults';
import { CompressedAirProfileSummary } from '../calculations/CompressedAirProfileSummary';
import { Settings } from '../../shared/models/settings';
import { COMPRESSED_AIR_EEMS, eemSavings } from './compressed-air-eems';
import { CompressedAirCalculationService, CompressorCalcResult } from '../compressed-air-calculation.service';
import { CompressorInventoryValidationService } from '../compressed-air-assessment-validation/compressor-inventory-validation.service';
import { CompressedAirSankeyResults, PowerSankeyService } from '../compressed-air-sankey/power-sankey/power-sankey.service';
import { AirFlowSankeyResults, AirflowSankeyService } from '../compressed-air-sankey/airflow-sankey/airflow-sankey.service';
import { AirPropertiesCsvService } from '../../shared/helper-services/air-properties-csv.service';
import { formatNumber, svgToJpeg } from '../../shared/report-builder/adapters/report-adapter.utils';

export interface CompressedAirChartConfig {
  traces: Array<Record<string, unknown>>;
  layout: object;
}

type CombinedDayTypeResult = { modification: Modification; combinedResults: DayTypeModificationResult };

interface ProfileChartData {
  compressorName: string;
  data: CompressorCalcResult[];
  controlType: number;
  unloadingData?: UnloadingData;
  color: string;
}

interface UnloadingData {
  unload: { power: number; airflow: number };
  noLoad: { power: number; airflow: number };
}

const UNLOADING_CONTROL_TYPES = [2, 3, 4, 5, 8, 10];
const PLOTLY_MARKER_SHAPES = ['star', 'star-diamond', 'hexagram', 'star-square', 'square', 'diamond', 'cross', 'x', 'diamond-wide', 'diamond-tall'];

/**
 * Not providedIn: 'root' — buildPerformanceProfileChart/buildCentrifugalGraphChart depend on
 * CompressedAirCalculationService/CompressorInventoryValidationService, which are only provided
 * within the compressed-air feature module tree, not at the app root. This service is provided
 * in CompressedAirReportModule alongside CompressedAirReportAdapter so both resolve in the same
 * injector scope.
 */
@Injectable()
export class CompressedAirChartsService {
  private readonly compressedAirCalculationService = inject(CompressedAirCalculationService);
  private readonly compressorInventoryValidationService = inject(CompressorInventoryValidationService);
  private readonly plotlyService = inject(PlotlyService);
  private readonly powerSankeyService = inject(PowerSankeyService);
  private readonly airflowSankeyService = inject(AirflowSankeyService);
  private readonly airPropertiesCsvService = inject(AirPropertiesCsvService);

  private static readonly GRADIENT_START_PURPLE = 'rgba(112, 48, 160, .85)';
  private static readonly GRADIENT_END_PURPLE = 'rgb(187, 142, 221)';

  /** Fixed 8-node topology fits comfortably at the shared chart-image default. */
  static readonly POWER_SANKEY_SIZE = { width: 1400, height: 500 };
  /** Wider/taller than Power Sankey — node/label count scales with end-use count (up to 10 + leak + unaccounted), so it needs more canvas room to avoid overlapping labels. */
  static readonly AIRFLOW_SANKEY_SIZE = { width: 2000, height: 900 };

  private getTrace(x: number[], y: string[], name: string, hoverSuffix: string, text?: string[]): Record<string, unknown> {
    return {
      x, y,
      type: 'bar',
      orientation: 'h',
      name,
      hovertemplate: `${name}: %{x:,.0f}${hoverSuffix}<extra></extra>`,
      text,
      textposition: 'auto',
      marker: { line: { width: 3 } },
    };
  }

  /** Combined-all-day-types cost chart — ported from CompressedAirCostSavingsGraphComponent.drawCombinedDayTypeModificationGraph. */
  buildCostSavingsChart(assessmentResults: CompressedAirAssessmentModificationResults[], combinedDayTypeResults: CombinedDayTypeResult[]): CompressedAirChartConfig {
    const y = ['Baseline', ...combinedDayTypeResults.map(r => r.modification.name)];

    const adjustedCost = [assessmentResults[0].totalBaselineCost, ...combinedDayTypeResults.map(r => r.combinedResults.allSavingsResults.adjustedResults.cost)];
    const text = adjustedCost.map(v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v));
    const traces: Record<string, unknown>[] = [this.getTrace(adjustedCost, y, 'Adjusted Annual Cost', '', text)];

    COMPRESSED_AIR_EEMS.forEach(eem => {
      if (eem.modificationKey === 'flowReallocation' || combinedDayTypeResults.some(r => (r.modification[eem.modificationKey] as { order: number }).order != 100)) {
        const x = [0, ...combinedDayTypeResults.map(r => eemSavings(r.combinedResults, eem.savingsKey).savings.cost)];
        traces.push(this.getTrace(x, y, eem.label, ''));
      }
    });

    return {
      traces,
      layout: {
        showlegend: true, barmode: 'stack',
        title: { text: 'Adjusted Annual Cost by Modification <br> All Day Types Combined' },
        yaxis: { autotick: false, automargin: true },
        xaxis: { tickprefix: '', tickformat: '$~s', hoverformat: '$~s' },
        margin: {}, legend: { orientation: 'h' }, hovermode: 'y unified',
      },
    };
  }

  /** Combined-all-day-types energy chart — ported from CompressedAirEnergySavingsGraphComponent.drawCombinedDayTypeModificationGraph. */
  buildEnergySavingsChart(assessmentResults: CompressedAirAssessmentModificationResults[], combinedDayTypeResults: CombinedDayTypeResult[]): CompressedAirChartConfig {
    const y = ['Baseline', ...combinedDayTypeResults.map(r => r.modification.name)];

    const adjustedPower = [assessmentResults[0].totalBaselinePower, ...combinedDayTypeResults.map(r => r.combinedResults.allSavingsResults.adjustedResults.power)];
    const text = adjustedPower.map(v => `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v)} kWh`);
    const traces: Record<string, unknown>[] = [this.getTrace(adjustedPower, y, 'Adjusted Annual Energy', ' kWh', text)];

    COMPRESSED_AIR_EEMS.forEach(eem => {
      if (eem.modificationKey === 'flowReallocation' || combinedDayTypeResults.some(r => (r.modification[eem.modificationKey] as { order: number }).order != 100)) {
        const x = [0, ...combinedDayTypeResults.map(r => eemSavings(r.combinedResults, eem.savingsKey).savings.power)];
        traces.push(this.getTrace(x, y, eem.label, ' kWh'));
      }
    });

    return {
      traces,
      layout: {
        showlegend: true, barmode: 'stack',
        title: { text: 'Adjust Annual Energy Usage by Modification <br> All Day Types Combined' },
        yaxis: { autotick: false, automargin: true },
        xaxis: { tickprefix: '', tickformat: '~s', hoverformat: '~s', ticksuffix: ' kWh' },
        margin: {}, legend: { orientation: 'h' }, hovermode: 'y unified',
      },
    };
  }

  /** Per-day-type airflow chart — ported from CompressedAirAirflowSavingsGraphComponent (this module has no "combined" mode). */
  buildAirflowSavingsChart(dayType: CompressedAirDayType, baselineResults: BaselineResults, assessmentResults: CompressedAirAssessmentModificationResults[], settings: Settings): CompressedAirChartConfig {
    const units = settings.unitsOfMeasure === 'Imperial' ? 'acfm' : 'm3/min';
    const y = ['Baseline', ...assessmentResults.map(r => r.modification.name)];

    const baselineDayTypeResult = baselineResults.dayTypeResults.find(r => r.dayTypeId === dayType.dayTypeId);
    const x = [baselineDayTypeResult.averageAirFlow, ...assessmentResults.map(r =>
      r.modifiedDayTypeProfileSummaries.find(s => s.dayType.dayTypeId === dayType.dayTypeId).averageAirFlow)];
    const text = x.map(v => `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v)} ${units}`);

    return {
      traces: [this.getTrace(x, y, 'Adjusted Average Airflow', ` ${units}`, text)],
      layout: {
        showlegend: true, barmode: 'stack',
        title: { text: `Adjusted Average Airflow by Modification <br> ${dayType.name}` },
        yaxis: { autotick: false, automargin: true },
        xaxis: { tickprefix: '', tickformat: '~s', hoverformat: '~s' },
        margin: {}, legend: { orientation: 'h' }, hovermode: 'y unified',
      },
    };
  }

  // ---------------------------------------------------------------------------------
  // Performance Profiles (Inventory Performance Profile + Centrifugal Compressor Curves)
  // ---------------------------------------------------------------------------------

  /**
   * Ported from InventoryPerformanceProfileComponent's 'report' context (showAllCompressors +
   * showAvgOpPoints always true): one solid/unloading-split curve per valid compressor, plus one
   * marker trace per day type for its average operating point.
   */
  buildPerformanceProfileChart(
    compressorInventoryItems: CompressorInventoryItem[],
    profileSummary: CompressedAirProfileSummary[],
    dayTypes: CompressedAirDayType[],
    systemInformation: SystemInformation,
    settings: Settings,
  ): CompressedAirChartConfig {
    const chartData = this.getPerformanceProfileChartData(compressorInventoryItems, systemInformation, settings);
    const avgOpPointData = this.getAvgOpPointsChartData(compressorInventoryItems, profileSummary, dayTypes, systemInformation, settings);

    const traces: Record<string, unknown>[] = [];
    chartData.forEach(dataItem => {
      if (UNLOADING_CONTROL_TYPES.includes(dataItem.controlType)) {
        traces.push(...this.getUnloadingTraces(dataItem));
      } else {
        traces.push(this.getSolidCurveTrace(dataItem));
      }
    });

    let shapeIndex = 0;
    avgOpPointData.forEach(dataItem => {
      const shape = PLOTLY_MARKER_SHAPES[shapeIndex];
      shapeIndex = shapeIndex === PLOTLY_MARKER_SHAPES.length - 1 ? 0 : shapeIndex + 1;
      traces.push({
        x: dataItem.data.map(d => d.percentageCapacity),
        y: dataItem.data.map(d => d.percentagePower),
        type: 'scatter', name: dataItem.compressorName,
        text: dataItem.data.map(() => dataItem.compressorName),
        hovertemplate: '%{text}: (Airflow: %{x:.2f}%, Power: %{y:.2f}%) <extra></extra>',
        mode: 'markers',
        marker: { size: 12, symbol: shape },
      });
    });

    return {
      traces,
      layout: {
        xaxis: { range: [0, 105], ticksuffix: '%', title: { text: 'Airflow (% Capacity)', font: { size: 16 } }, automargin: true },
        yaxis: { range: [0, 105], ticksuffix: '%', title: { text: 'Power (% Full Load)', font: { size: 16 } }, hoverformat: ',.2f' },
        margin: { t: 20, r: 20 },
        legend: { orientation: 'h', y: 1.5 },
      },
    };
  }

  private getSolidCurveTrace(dataItem: ProfileChartData): Record<string, unknown> {
    return {
      x: dataItem.data.map(d => d.percentageCapacity),
      y: dataItem.data.map(d => d.percentagePower),
      type: 'scatter', name: dataItem.compressorName,
      text: dataItem.data.map(() => dataItem.compressorName),
      hovertemplate: '%{text}: (Airflow: %{x:.2f}%, Power: %{y:.2f}%) <extra></extra>',
      line: { dash: 'solid', color: dataItem.color },
    };
  }

  private getPerformanceProfileChartData(compressorInventoryItems: CompressorInventoryItem[], systemInformation: SystemInformation, settings: Settings): ProfileChartData[] {
    const chartData: ProfileChartData[] = [];
    compressorInventoryItems.forEach(item => {
      if (!this.compressorInventoryValidationService.validateCompressorItem(item, systemInformation).isValid) return;
      chartData.push({
        compressorName: item.name,
        data: this.getCompressorCurveData(item, systemInformation, settings),
        controlType: item.compressorControls.controlType,
        unloadingData: this.getUnloadingData(item),
        color: item.color,
      });
    });
    return chartData;
  }

  private getCompressorCurveData(compressor: CompressorInventoryItem, systemInformation: SystemInformation, settings: Settings): CompressorCalcResult[] {
    const data: CompressorCalcResult[] = [];
    for (let airFlow = 0; airFlow <= 100;) {
      data.push(this.compressedAirCalculationService.compressorsCalc(
        compressor, settings, 1, airFlow, systemInformation.atmosphericPressure, systemInformation.totalAirStorage, 0, false,
      ));
      airFlow += airFlow < 95 ? 1 : 0.5;
    }
    return data;
  }

  private getAvgOpPointsChartData(
    compressorInventoryItems: CompressorInventoryItem[], profileSummary: CompressedAirProfileSummary[],
    dayTypes: CompressedAirDayType[], systemInformation: SystemInformation, settings: Settings,
  ): ProfileChartData[] {
    return dayTypes.map(dayType => {
      const data: CompressorCalcResult[] = [];
      profileSummary.forEach(summary => {
        if (summary.dayTypeId !== dayType.dayTypeId || !summary.avgPercentCapacity) return;
        const compressor = compressorInventoryItems.find(item => item.itemId === summary.compressorId);
        if (compressor) {
          data.push(this.compressedAirCalculationService.compressorsCalc(
            compressor, settings, 3, summary.avgAirflow, systemInformation.atmosphericPressure, systemInformation.totalAirStorage, 0, false,
          ));
        }
      });
      return { compressorName: `${dayType.name} Average Operating Points`, data, controlType: 0, color: undefined };
    });
  }

  private getUnloadingData(compressor: CompressorInventoryItem): UnloadingData | undefined {
    if (!UNLOADING_CONTROL_TYPES.includes(compressor.compressorControls.controlType)) return undefined;
    const unloadPower = this.getUnloadingPercentage(compressor.performancePoints.unloadPoint.power, compressor.performancePoints.fullLoad.power);
    const unloadAirflow = this.getUnloadingPercentage(compressor.performancePoints.unloadPoint.airflow, compressor.performancePoints.fullLoad.airflow);
    const noLoadPower = this.getUnloadingPercentage(compressor.performancePoints.noLoad.power, compressor.performancePoints.fullLoad.power);
    const noLoadAirflow = this.getUnloadingPercentage(compressor.performancePoints.noLoad.airflow, compressor.performancePoints.fullLoad.airflow);
    if (unloadPower == null || unloadAirflow == null || noLoadPower == null || noLoadAirflow == null) return undefined;
    return { unload: { power: unloadPower, airflow: unloadAirflow }, noLoad: { power: noLoadPower, airflow: noLoadAirflow } };
  }

  private getUnloadingPercentage(pointValue: number, fullLoadValue: number): number | undefined {
    if (pointValue === 0) return 0;
    if (pointValue === undefined) return undefined;
    return (pointValue / fullLoadValue) * 100;
  }

  /** Splits a compressor's curve at the unload/no-load intersection into a dotted lead-in and a solid tail (or fully dotted for modulation-without-unload control types). */
  private getUnloadingTraces(dataItem: ProfileChartData): Record<string, unknown>[] {
    if (dataItem.controlType === 4 || dataItem.controlType === 5) {
      return [{
        x: dataItem.data.map(d => d.percentageCapacity),
        y: dataItem.data.map(d => d.percentagePower),
        type: 'scatter', name: dataItem.compressorName,
        text: dataItem.data.map(() => dataItem.compressorName),
        hovertemplate: '%{text}: (Airflow: %{x:.2f}%, Power: %{y:.2f}%) <extra></extra>',
        mode: 'lines',
        line: { dash: 'dot', color: dataItem.color },
      }];
    }

    const lineData = this.getUnloadingLineData(dataItem.data, dataItem.unloadingData);
    return [
      {
        x: lineData.dotted.map(d => d.percentageCapacity), y: lineData.dotted.map(d => d.percentagePower),
        type: 'scatter', name: `${dataItem.compressorName}(Unloading)`,
        text: dataItem.data.map(() => dataItem.compressorName),
        hovertemplate: '%{text}: (Airflow: %{x:.2f}%, Power: %{y:.2f}%) <extra></extra>',
        mode: 'lines', line: { dash: 'dot', color: dataItem.color },
      },
      {
        x: lineData.solid.map(d => d.percentageCapacity), y: lineData.solid.map(d => d.percentagePower),
        type: 'scatter', name: dataItem.compressorName,
        text: dataItem.data.map(() => dataItem.compressorName),
        hovertemplate: '%{text}: (Airflow: %{x:.2f}%, Power: %{y:.2f}%) <extra></extra>',
        mode: 'lines', line: { dash: 'solid', color: dataItem.color },
      },
    ];
  }

  private getUnloadingLineData(chartData: CompressorCalcResult[], unloadingData: UnloadingData): { solid: CompressorCalcResult[]; dotted: CompressorCalcResult[] } {
    const unloadPoint = unloadingData.unload;
    let smallestDistance = Infinity;
    let intersectionIndex = 0;
    chartData.forEach((point, index) => {
      const distance = Math.pow(point.percentageCapacity - unloadPoint.airflow, 2) + Math.pow(point.percentagePower - unloadPoint.power, 2);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        intersectionIndex = index;
      }
    });
    return {
      solid: chartData.filter((_, index) => index >= intersectionIndex),
      dotted: chartData.filter((_, index) => index <= intersectionIndex),
    };
  }

  /** Ported from CentrifugalGraphComponent.drawChart — only meaningful when compressorType === 6 (centrifugal). */
  buildCentrifugalGraphChart(centrifugalCompressors: CompressorInventoryItem[], settings: Settings): CompressedAirChartConfig {
    const airflowUnit = settings.unitsOfMeasure === 'Imperial' ? 'acfm' : 'm3/min';
    const pressureUnit = settings.unitsOfMeasure === 'Imperial' ? 'psig' : 'barg';
    const traces: Record<string, unknown>[] = [];

    centrifugalCompressors.forEach(compressor => {
      traces.push(this.getCentrifugalTrace(
        [compressor.centrifugalSpecifics.surgeAirflow, compressor.centrifugalSpecifics.maxFullLoadCapacity],
        [compressor.centrifugalSpecifics.minFullLoadPressure, compressor.centrifugalSpecifics.maxFullLoadPressure],
        `${compressor.name} Surge Limit`, compressor.color, 'solid', 'star-diamond', airflowUnit, pressureUnit,
      ));
      traces.push(this.getCentrifugalTrace(
        [compressor.centrifugalSpecifics.maxFullLoadCapacity, compressor.nameplateData.fullLoadRatedCapacity, compressor.centrifugalSpecifics.minFullLoadCapacity],
        [compressor.centrifugalSpecifics.maxFullLoadPressure, compressor.nameplateData.fullLoadOperatingPressure, compressor.centrifugalSpecifics.minFullLoadPressure],
        `${compressor.name} Rated Operating Curve`, compressor.color, 'dot', 'star', airflowUnit, pressureUnit,
      ));
    });

    return {
      traces,
      layout: {
        xaxis: { title: { text: `Airflow (${airflowUnit})`, font: { size: 16 } }, automargin: true },
        yaxis: { title: { text: `Pressure (${pressureUnit})`, font: { size: 16 } }, hoverformat: ',.2f' },
        margin: { t: 20, r: 20 },
        showlegend: true,
        legend: { orientation: 'h', y: 1.5 },
      },
    };
  }

  private getCentrifugalTrace(x: number[], y: number[], name: string, color: string, dash: string, symbol: string, airflowUnit: string, pressureUnit: string): Record<string, unknown> {
    return {
      x, y, type: 'scatter', name,
      hovertemplate: `(Airflow: %{x:.2f} ${airflowUnit}, Pressure: %{y:.2f} ${pressureUnit}) <extra></extra>`,
      mode: 'lines+markers',
      line: { shape: 'spline', dash, color },
      marker: { size: 12, symbol },
      fillcolor: color,
    };
  }

  // ---------------------------------------------------------------------------------
  // Report Sankey (Power Sankey + Airflow Sankey)
  // Ported from PowerSankeyComponent/AirflowSankeyComponent's renderSankey()/buildNodes()/buildSvgArrows(),
  // rendered off-DOM via Plotly then patched/serialized/rasterized following PsatChartsService's
  // buildSankeyChartData -> applyGradientAndArrows -> renderSankeyAsImage pattern.
  // ---------------------------------------------------------------------------------

  /** Baseline-only, single day type (compressedAirAssessment.endUseData.endUseDayTypeSetup.selectedDayTypeId) — mirrors the on-screen tab, which never shows more than one day type at a time. */
  async renderPowerSankeyImage(compressedAirAssessment: CompressedAirAssessment, dayTypeLeakRate: number, profileSummary: ProfileSummary[]): Promise<string | null> {
    if (!this.airPropertiesCsvService.airPropertiesData || this.airPropertiesCsvService.airPropertiesData.length === 0) {
      await this.airPropertiesCsvService.initAirPropertiesData();
    }
    const sankeyResults = this.powerSankeyService.getSankeyResults(compressedAirAssessment, dayTypeLeakRate, profileSummary);
    if (sankeyResults.warnings.CFMWarning) return null;

    const { sankeyData, layout, connectingNodes } = this.buildPowerSankeyChartData(sankeyResults);
    return this.renderSankeyImage(sankeyData, layout, container =>
      this.applyPowerSankeyGradientAndArrows(container, connectingNodes, sankeyResults.kWInSystem),
      CompressedAirChartsService.POWER_SANKEY_SIZE.width, CompressedAirChartsService.POWER_SANKEY_SIZE.height);
  }

  private buildPowerSankeyChartData(sankeyResults: CompressedAirSankeyResults): { sankeyData: Record<string, unknown>; layout: Record<string, unknown>; connectingNodes: number[] } {
    const originConnectorValue = sankeyResults.kWInSystem - sankeyResults.kWMechSystem;
    const originConnectorPercentage = (originConnectorValue / sankeyResults.kWInSystem) * 100;
    const secondaryConnectorValue = originConnectorValue - sankeyResults.kWHeatOfcompressionSystem;
    const secondaryConnectorPercentage = (secondaryConnectorValue / sankeyResults.kWInSystem) * 100;
    const kWMechPercentage = (sankeyResults.kWMechSystem / sankeyResults.kWInSystem) * 100;
    const kwHocSysPercentage = (sankeyResults.kWHeatOfcompressionSystem / sankeyResults.kWInSystem) * 100;
    const kwLeakSysPercentage = (sankeyResults.kWLeakSystem / sankeyResults.kWInSystem) * 100;
    const kwAirSysPercentage = (sankeyResults.kWAirSystem / sankeyResults.kWInSystem) * 100;
    const label = (name: string, kw: number, pct: number) => this.getPowerSankeyLabel(name, kw, pct);

    const nodes = [
      { id: 'originalInputConnector', name: label('Energy Input', sankeyResults.kWInSystem, 100), value: 100, x: .1, y: .6, nodeColor: CompressedAirChartsService.GRADIENT_START_PURPLE },
      { id: 'inputConnector', name: '', value: 0, x: .4, y: .6, nodeColor: CompressedAirChartsService.GRADIENT_START_PURPLE },
      { id: 'originConnector', name: '', value: originConnectorPercentage, x: .475, y: .625, nodeColor: CompressedAirChartsService.GRADIENT_START_PURPLE },
      { id: 'kW_mech_sys', name: label('Motor and Drive Efficiency', sankeyResults.kWMechSystem, kWMechPercentage), value: kWMechPercentage, x: .5, y: .10, nodeColor: CompressedAirChartsService.GRADIENT_END_PURPLE },
      { id: 'kW_hoc_sys', name: label('Heat of Compression', sankeyResults.kWHeatOfcompressionSystem, kwHocSysPercentage), value: kwHocSysPercentage, x: .6, y: .5, nodeColor: CompressedAirChartsService.GRADIENT_END_PURPLE },
      { id: 'secondaryConnector', name: '', value: secondaryConnectorPercentage, x: .55, y: .9, nodeColor: CompressedAirChartsService.GRADIENT_START_PURPLE },
      { id: 'kW_leak_sys', name: label('System Leakage', sankeyResults.kWLeakSystem, kwLeakSysPercentage), value: kwLeakSysPercentage, x: .8, y: .7, nodeColor: CompressedAirChartsService.GRADIENT_END_PURPLE },
      { id: 'kW_air_sys', name: label('Productive Use', sankeyResults.kWAirSystem, kwAirSysPercentage), value: kwAirSysPercentage, x: .85, y: .9, nodeColor: CompressedAirChartsService.GRADIENT_END_PURPLE },
    ];

    const links = [
      { source: 0, target: 1 }, { source: 0, target: 2 }, { source: 1, target: 2 }, { source: 1, target: 3 },
      { source: 2, target: 4 }, { source: 2, target: 5 }, { source: 5, target: 6 }, { source: 5, target: 7 },
    ];

    return {
      sankeyData: this.buildSankeyTrace(nodes, links),
      layout: { autosize: true, margin: { l: 50, t: 60, r: 0 }, paper_bgcolor: 'white', plot_bgcolor: 'white' },
      connectingNodes: [0, 1, 2, 5],
    };
  }

  private getPowerSankeyLabel(name: string, kw: number, pct: number): string {
    return `${name} ${formatNumber(kw)} kW/hr (${formatNumber(pct)}%)`;
  }

  private applyPowerSankeyGradientAndArrows(container: Element, connectingNodes: number[], kWInSystem: number): void {
    this.injectSvgGradientDefs(container, [
      { id: 'compressedAirGradientPurple', stops: [['10%', CompressedAirChartsService.GRADIENT_START_PURPLE], ['100%', CompressedAirChartsService.GRADIENT_END_PURPLE]] },
    ]);

    const gradientLinkPaths = [3, 4, 6, 7];
    const links = container.querySelectorAll('.sankey-link');
    links.forEach((link, i) => {
      const fill = gradientLinkPaths.includes(i + 1) ? 'url(#compressedAirGradientPurple)' : CompressedAirChartsService.GRADIENT_START_PURPLE;
      (link as SVGElement).setAttribute('style', `fill: ${fill}; opacity: 1; fill-opacity: 1;`);
    });

    this.applySankeyArrowRects(container, connectingNodes, () => CompressedAirChartsService.GRADIENT_END_PURPLE, height => {
      let width = height;
      let sizingRatio = 1.75;
      let verticalAlignment = 2.75;
      if (height > kWInSystem / 2) {
        width = height * .8;
        sizingRatio *= .7;
        verticalAlignment /= .3;
      }
      return { width, sizingRatio, verticalAlignment };
    });
  }

  /** Single day type — mirrors AirflowSankeyComponent, which only ever renders the currently selected day type. */
  async renderAirflowSankeyImage(compressedAirAssessment: CompressedAirAssessment, endUseDayTypeSetup: EndUseDayTypeSetup, settings: Settings): Promise<string | null> {
    const airFlowSankeyResults = this.airflowSankeyService.getAirFlowSankeyResults(compressedAirAssessment, endUseDayTypeSetup, settings);
    if (airFlowSankeyResults.warnings.hasInvalidEndUses || !airFlowSankeyResults.endUseEnergyData?.length) return null;

    const units = settings.unitsOfMeasure === 'Imperial' ? 'acfm' : 'm3/min';
    const dayTypeLeakRate = endUseDayTypeSetup.dayTypeLeakRates?.find(r => r.dayTypeId === endUseDayTypeSetup.selectedDayTypeId)?.dayTypeLeakRate ?? 0;

    const { sankeyData, layout, connectingNodes, gradientLinkPaths } = this.buildAirflowSankeyChartData(
      airFlowSankeyResults, compressedAirAssessment.endUseData.dayTypeAirFlowTotals, units,
    );
    return this.renderSankeyImage(sankeyData, layout, container =>
      this.applyAirflowSankeyGradientAndArrows(container, gradientLinkPaths, connectingNodes, dayTypeLeakRate, !!airFlowSankeyResults.unaccountedEnergyData),
      CompressedAirChartsService.AIRFLOW_SANKEY_SIZE.width, CompressedAirChartsService.AIRFLOW_SANKEY_SIZE.height);
  }

  private buildAirflowSankeyChartData(
    airFlowSankeyResults: AirFlowSankeyResults, dayTypeAirFlowTotals: DayTypeAirflowTotals, units: string,
  ): { sankeyData: Record<string, unknown>; layout: Record<string, unknown>; connectingNodes: number[]; gradientLinkPaths: number[] } {
    interface AirflowSankeyNode {
      id: string; name: string; value: number; x: number; y: number; nodeColor: string;
      source: number; target: number[]; isConnector: boolean; flow: number;
    }

    const totalEndUseAirflow = dayTypeAirFlowTotals.totalDayTypeAverageAirflow;
    const label = (name: string, flow: number, pct: number) => this.getAirflowSankeyLabel(name, flow, pct, units);

    const nodes: AirflowSankeyNode[] = [
      { id: 'originalInputConnector', name: label('Total Day Type Average Airflow', totalEndUseAirflow, 100), value: 100, x: .05, y: .6, source: 0, target: [1, 2], isConnector: true, nodeColor: CompressedAirChartsService.GRADIENT_START_PURPLE, flow: totalEndUseAirflow },
      { id: 'inputConnector', name: '', value: 0, x: .125, y: .6, source: 1, target: [2, 3], isConnector: true, nodeColor: CompressedAirChartsService.GRADIENT_START_PURPLE, flow: totalEndUseAirflow },
    ];

    const flowNodeYPositions = [.9, .2, .8, .15, .9, .2, .8, .1, .9, .2, .8, .4, .9, .2, .8];
    let arrowNodeXPosition = .25;
    const { arrow: arrowIncrement, connector: connectorIncrement } = this.getAirflowNodeIncrement(airFlowSankeyResults.endUseEnergyData.length);
    let offsetYPlacementIndex = 0;
    let arrowNodeIndex = 2;
    const gradientLinkPaths: number[] = [];

    airFlowSankeyResults.endUseEnergyData.forEach((endUse, index) => {
      const endUseFlowValue = (endUse.dayTypeAverageAirFlow / totalEndUseAirflow) * 100;
      const previousNodes = nodes.slice(-2);
      const connector = previousNodes[1].flow - endUse.dayTypeAverageAirFlow;
      const connectorValue = (connector / totalEndUseAirflow) * 100;
      const isLast = index === airFlowSankeyResults.endUseEnergyData.length - 1;

      let arrowNodeColor = CompressedAirChartsService.GRADIENT_END_PURPLE;
      if (endUse.endUseId === 'dayTypeLeakRate' || endUse.endUseId === 'unaccounted') {
        arrowNodeColor = endUse.color;
      }

      if (endUseFlowValue > 0.2 || endUse.endUseId === 'dayTypeLeakRate' || endUse.endUseId === 'unaccounted') {
        nodes.push({
          id: endUse.endUseId, name: label(endUse.endUseName, endUse.dayTypeAverageAirFlow, endUseFlowValue),
          value: endUseFlowValue, x: arrowNodeXPosition, y: flowNodeYPositions[offsetYPlacementIndex],
          source: arrowNodeIndex, target: [], isConnector: false, nodeColor: arrowNodeColor, flow: endUse.dayTypeAverageAirFlow,
        });

        const connectorNodeIndex = arrowNodeIndex + 1;
        const yAdjustment = connectorNodeIndex % 2 !== 0 ? .65 : .6;
        const connectorTargets = isLast ? [] : [connectorNodeIndex + 1, connectorNodeIndex + 2];

        nodes.push({
          id: `connector_${endUse.endUseId}`, name: '', value: connectorValue,
          x: arrowNodeXPosition - connectorIncrement, y: yAdjustment,
          source: connectorNodeIndex, target: connectorTargets, isConnector: !isLast, nodeColor: CompressedAirChartsService.GRADIENT_START_PURPLE, flow: connector,
        });

        if (airFlowSankeyResults.otherEndUseData && isLast) {
          const other = airFlowSankeyResults.otherEndUseData;
          const otherFlowValue = (other.dayTypeAverageAirFlow / totalEndUseAirflow) * 100;
          const otherConnector = nodes[nodes.length - 1];
          otherConnector.value = connectorValue;
          otherConnector.x = arrowNodeXPosition - arrowIncrement;
          otherConnector.y = yAdjustment;
          otherConnector.source = connectorNodeIndex;
          otherConnector.flow = other.dayTypeAverageAirFlow;
          otherConnector.target = [connectorNodeIndex + 1];
          otherConnector.isConnector = true;
          otherConnector.nodeColor = CompressedAirChartsService.GRADIENT_START_PURPLE;
          otherConnector.id = `connector_${other.endUseId}`;

          arrowNodeXPosition += arrowIncrement;
          offsetYPlacementIndex++;
          const otherArrowNodeIndex = arrowNodeIndex + 2;
          gradientLinkPaths.push(otherArrowNodeIndex);

          nodes.push({
            id: other.endUseId, name: label(other.endUseName, other.dayTypeAverageAirFlow, otherFlowValue),
            value: connectorValue, x: arrowNodeXPosition, y: flowNodeYPositions[offsetYPlacementIndex + 1],
            source: otherArrowNodeIndex, target: [], isConnector: false, nodeColor: CompressedAirChartsService.GRADIENT_END_PURPLE, flow: other.dayTypeAverageAirFlow,
          });
        }

        gradientLinkPaths.push(arrowNodeIndex);
        arrowNodeXPosition += arrowIncrement;
        offsetYPlacementIndex++;
        arrowNodeIndex += 2;
      } else if (isLast && nodes[index - 1]?.isConnector) {
        // Ported as-is from AirflowSankeyComponent.buildNodes(): indexes `nodes` by the endUseEnergyData loop index, not nodes.length - 1.
        nodes.pop();
      }
    });

    const connectingNodes: number[] = [];
    nodes.forEach((node, i) => { if (node.isConnector) connectingNodes.push(i); });

    const links: Array<{ source: number; target: number }> = [];
    connectingNodes.forEach(nodeIndex => {
      nodes[nodeIndex].target.forEach(target => links.push({ source: nodes[nodeIndex].source, target }));
    });

    return {
      sankeyData: this.buildSankeyTrace(nodes, links),
      layout: { autosize: true, margin: { l: 50, t: 60, r: 0 }, paper_bgcolor: 'white', plot_bgcolor: 'white' },
      connectingNodes,
      gradientLinkPaths,
    };
  }

  private getAirflowNodeIncrement(endUseCount: number): { arrow: number; connector: number } {
    if (endUseCount <= 3) return { arrow: .25, connector: -.15 };
    if (endUseCount <= 6) return { arrow: .15, connector: -.05 };
    return { arrow: .075, connector: .05 };
  }

  private getAirflowSankeyLabel(name: string, flow: number, pct: number, units: string): string {
    return `${name} ${formatNumber(flow)} ${units} (${formatNumber(pct)}%)`;
  }

  private applyAirflowSankeyGradientAndArrows(
    container: Element, gradientLinkPaths: number[], connectingNodes: number[], dayTypeLeakRate: number, hasUnaccounted: boolean,
  ): void {
    this.injectSvgGradientDefs(container, [
      { id: 'compressedAirGradientPurple', stops: [['10%', CompressedAirChartsService.GRADIENT_START_PURPLE], ['100%', CompressedAirChartsService.GRADIENT_END_PURPLE]] },
      { id: 'compressedAirGradientRed', stops: [['10%', CompressedAirChartsService.GRADIENT_START_PURPLE], ['100%', 'rgb(255, 0, 0)']] },
      { id: 'compressedAirGradientGrey', stops: [['5%', CompressedAirChartsService.GRADIENT_START_PURPLE], ['50%', 'rgb(190, 190, 190)']] },
    ]);

    const links = container.querySelectorAll('.sankey-link');
    links.forEach((link, i) => {
      let fill = gradientLinkPaths.includes(i + 1) ? 'url(#compressedAirGradientPurple)' : CompressedAirChartsService.GRADIENT_START_PURPLE;
      if (i === 1 && dayTypeLeakRate > 0) fill = 'url(#compressedAirGradientRed)';
      if (i === 3 && hasUnaccounted) fill = 'url(#compressedAirGradientGrey)';
      (link as SVGElement).setAttribute('style', `fill: ${fill}; opacity: 1; fill-opacity: 1;`);
    });

    this.applySankeyArrowRects(
      container, connectingNodes,
      i => {
        if (dayTypeLeakRate > 0 && i === 2) return 'rgb(255, 0, 0)';
        if (hasUnaccounted && i === 4) return 'rgb(190, 190, 190)';
        return CompressedAirChartsService.GRADIENT_END_PURPLE;
      },
      height => ({ width: height, sizingRatio: 1.6, verticalAlignment: 2.75 }),
    );
  }

  /** Shared arrow-shaped node-rect patch (clip-path polygon) — ported from Power/AirflowSankeyComponent.buildSvgArrows(), parameterized over per-index color and height-based sizing since those two details differ between the two sankeys. */
  private applySankeyArrowRects(
    container: Element,
    connectingNodes: number[],
    colorForIndex: (i: number) => string,
    sizingForHeight: (height: number) => { width: number; sizingRatio: number; verticalAlignment: number },
  ): void {
    const rects = container.querySelectorAll('.node-rect');
    rects.forEach((rectEl, i) => {
      if (connectingNodes.includes(i)) return;
      const rect = rectEl as SVGRectElement;
      const height = Number(rect.getAttribute('height'));
      const y = Number(rect.getAttribute('y'));
      if (!height || isNaN(y)) return;

      const { width, sizingRatio, verticalAlignment } = sizingForHeight(height);
      rect.setAttribute('y', `${y - height / verticalAlignment}`);
      rect.setAttribute('style', `width: ${width}px; height: ${height * sizingRatio}px; clip-path: polygon(100% 50%, 0 0, 0 100%); stroke-width: 0.5; stroke: rgb(255,255,255); stroke-opacity: 0.5; fill: ${colorForIndex(i)}; fill-opacity: 0.9;`);
    });
  }

  private injectSvgGradientDefs(container: Element, gradients: Array<{ id: string; stops: Array<[string, string]> }>): void {
    const mainSVG = container.querySelector('.main-svg');
    const svgDefs = container.querySelector('defs');
    if (!mainSVG || !svgDefs) return;
    gradients.forEach(({ id, stops }) => {
      svgDefs.querySelector(`#${id}`)?.remove();
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.id = id;
      stops.forEach(([offset, color]) => {
        const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop.setAttribute('offset', offset);
        stop.setAttribute('stop-color', color);
        gradient.appendChild(stop);
      });
      svgDefs.appendChild(gradient);
    });
  }

  private buildSankeyTrace(nodes: Array<{ id: string; name: string; value: number; x: number; y: number; nodeColor: string }>, links: Array<{ source: number; target: number }>): Record<string, unknown> {
    return {
      type: 'sankey', orientation: 'h', valuesuffix: '%',
      ids: nodes.map(n => n.id),
      textfont: { color: 'rgba(0, 0, 0)', size: 14 },
      arrangement: 'freeform',
      node: {
        pad: 50, line: { color: CompressedAirChartsService.GRADIENT_START_PURPLE },
        label: nodes.map(n => n.name), x: nodes.map(n => n.x), y: nodes.map(n => n.y), color: nodes.map(n => n.nodeColor),
        hoverinfo: 'all', hovertemplate: '%{value}<extra></extra>',
        hoverlabel: { font: { size: 14, color: 'rgba(255,255,255)' }, align: 'auto' },
        showgrid: false,
      },
      link: {
        value: nodes.map(n => n.value), source: links.map(l => l.source), target: links.map(l => l.target),
        hoverinfo: 'none', line: { color: CompressedAirChartsService.GRADIENT_START_PURPLE, width: 0 },
      },
    };
  }

  private async renderSankeyImage(
    sankeyData: Record<string, unknown>, layout: Record<string, unknown>, applyPatches: (container: Element) => void, width = 1400, height = 500,
  ): Promise<string> {
    const container = document.createElement('div');
    container.style.cssText = `position:absolute;left:-9999px;top:-9999px;width:${width}px;height:${height}px`;
    document.body.appendChild(container);

    const plotly = await this.plotlyService.getPlotly();
    try {
      await plotly.newPlot(container, [sankeyData], layout, { displaylogo: false, displayModeBar: false, responsive: false });
      applyPatches(container);

      const svgEl = container.querySelector('.main-svg') as SVGSVGElement | null;
      if (!svgEl) throw new Error('Compressed air sankey: .main-svg not found after render');
      svgEl.setAttribute('width', String(width));
      svgEl.setAttribute('height', String(height));
      const svgString = new XMLSerializer().serializeToString(svgEl);
      return await svgToJpeg(svgString, width, height);
    } finally {
      plotly.purge(container);
      document.body.removeChild(container);
    }
  }
}
