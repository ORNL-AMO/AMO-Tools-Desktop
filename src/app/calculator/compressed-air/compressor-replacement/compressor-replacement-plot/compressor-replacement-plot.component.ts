import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { CompressorReplacementData, CompressorReplacementService } from '../compressor-replacement.service';
import { CompressorAdapterService } from '../compressor-adapter.service';
import { CompressorInventoryItem } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirCalculationService, CompressorCalcResult } from '../../../../compressed-air-assessment/compressed-air-calculation.service';
import { Settings } from '../../../../shared/models/settings';
import { defaultPlotlyConfig } from '../../../../shared/helperFunctions';
import { PlotlyService } from 'angular-plotly.js';

interface PlotReference { power: number; capacity: number; }

interface PlotTrace {
  x: Array<number>; y: Array<number>; name: string; type: string; mode: string;
  line: { color: string, dash: string };
}

@Component({
  selector: 'app-compressor-replacement-plot',
  templateUrl: './compressor-replacement-plot.component.html',
  styleUrls: ['./compressor-replacement-plot.component.css'],
  standalone: false
})
export class CompressorReplacementPlotComponent {
  @Input() baselineData: Array<CompressorReplacementData>;
  @Input() modificationData: Array<CompressorReplacementData>;
  @Input() modificationExists: boolean;
  @Input() settings: Settings;
  @Input() baselineAtmosphericPressure: number;
  @Input() baselineTotalAirStorage: number;
  @Input() modificationAtmosphericPressure: number;
  @Input() modificationTotalAirStorage: number;
  @Input() refreshTrigger: number;

  @ViewChild('performanceProfileChart', { static: false }) performanceProfileChart: ElementRef;

  /** One sentence per compressor that could not be drawn, listing what is missing. */
  profileBlockerMessages: Array<string> = [];

  private readonly graphColors: Array<string> = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

  constructor(
    private compressedAirCalculationService: CompressedAirCalculationService,
    private compressorAdapterService: CompressorAdapterService,
    private compressorReplacementService: CompressorReplacementService,
    private plotlyService: PlotlyService) { }

  ngAfterViewInit(): void { setTimeout(() => this.drawChart(), 50); }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.performanceProfileChart) { setTimeout(() => this.drawChart(), 50); }
  }

  drawChart(): void {
    if (!this.performanceProfileChart) { return; }
    const settings: Settings = this.settings || { unitsOfMeasure: 'Imperial' };
    const traces: Array<PlotTrace> = [];
    const messages: Array<string> = [];
    let colorIndex: number = 0;

    // Both axes are referenced to one baseline compressor so a smaller unit plots below and left of it.
    const reference: PlotReference = this.getReference();

    (this.baselineData || []).forEach(data => {
      const trace: PlotTrace = this.buildTrace(data, settings, this.baselineAtmosphericPressure, this.baselineTotalAirStorage, reference, 'Baseline: ', 'solid', this.color(colorIndex));
      if (trace) { traces.push(trace); colorIndex++; }
      else { this.addBlockerMessage(messages, data, this.baselineTotalAirStorage, 'Baseline'); }
    });
    if (this.modificationExists) {
      (this.modificationData || []).forEach(data => {
        const trace: PlotTrace = this.buildTrace(data, settings, this.modificationAtmosphericPressure, this.modificationTotalAirStorage, reference, 'Mod: ', 'dash', this.color(colorIndex));
        if (trace) { traces.push(trace); colorIndex++; }
        else { this.addBlockerMessage(messages, data, this.modificationTotalAirStorage, 'Modification'); }
      });
    }
    this.profileBlockerMessages = messages;

    // A larger modification can pass 100% capacity, and a pressure-corrected curve can pass 100% power.
    let maxX: number = 100;
    let maxY: number = 100;
    traces.forEach(trace => {
      trace.x.forEach(value => { if (isFinite(value) && value > maxX) { maxX = value; } });
      trace.y.forEach(value => { if (isFinite(value) && value > maxY) { maxY = value; } });
    });

    const layout = {
      xaxis: { range: [0, maxX * 1.05], ticksuffix: '%', title: { text: this.xAxisTitle, font: { size: 16 } }, automargin: true },
      yaxis: { range: [0, maxY * 1.05], ticksuffix: '%', title: { text: this.yAxisTitle, font: { size: 16 } }, hoverformat: ',.2f' },
      margin: { t: 20, r: 20 },
      legend: { orientation: 'h', y: 1.3 }
    };
    const config = { responsive: true, displaylogo: false };
    this.plotlyService.newPlot(this.performanceProfileChart.nativeElement, traces, layout, defaultPlotlyConfig(config));
  }

  get xAxisTitle(): string {
    return 'Airflow (% of baseline rated capacity)';
  }

  get yAxisTitle(): string {
    return 'Power (% of baseline rated full load)';
  }

  /**
   * Rated capacity and full-load power of the first plottable compressor, used to scale every curve.
   * Zeros mean no usable reference, and each trace falls back to its own ratings.
   */
  private getReference(): PlotReference {
    const candidates: Array<CompressorReplacementData> = (this.baselineData || [])
      .concat(this.modificationExists ? (this.modificationData || []) : []);
    for (let index = 0; index < candidates.length; index++) {
      const candidate: CompressorReplacementData = candidates[index];
      if (this.compressorAdapterService.isDeferred(candidate)) { continue; }
      const power: number = this.compressorAdapterService.ratedFullLoadPower(candidate);
      const capacity: number = this.compressorAdapterService.ratedCapacity(candidate);
      if (power > 0 && capacity > 0) { return { power: power, capacity: capacity }; }
    }
    return { power: 0, capacity: 0 };
  }

  /** "<name> (<scenario>) is not showing because: a, b, and c." */
  private addBlockerMessage(messages: Array<string>, data: CompressorReplacementData, totalAirStorage: number, scenario: string): void {
    const reasons: Array<string> = this.getBlockers(data, totalAirStorage);
    if (reasons.length === 0) { reasons.push('the calculation returned no usable points for these inputs'); }
    const label: string = (data.name || 'This compressor') + ' (' + scenario + ')';
    messages.push(label + ' is not showing because: ' + this.joinReasons(reasons) + '.');
  }

  /** "a", "a and b", "a, b, and c" */
  private joinReasons(reasons: Array<string>): string {
    if (reasons.length === 1) { return reasons[0]; }
    if (reasons.length === 2) { return reasons[0] + ' and ' + reasons[1]; }
    return reasons.slice(0, reasons.length - 1).join(', ') + ', and ' + reasons[reasons.length - 1];
  }

  /** Invalid inputs are listed first, followed by anything the performance profile itself needs. */
  private getBlockers(data: CompressorReplacementData, totalAirStorage: number): Array<string> {
    const blockers: Array<string> = [];
    if (!this.compressorReplacementService.isCompressorValid(data)) { blockers.push('one or more inputs are not valid'); }
    return blockers.concat(this.compressorAdapterService.getProfileBlockers(data, totalAirStorage));
  }

  private buildTrace(data: CompressorReplacementData, settings: Settings, atmosphericPressure: number, totalAirStorage: number,
                     reference: PlotReference, prefix: string, dash: string, color: string): PlotTrace {
    // Anything listed as a blocker is not drawn, so the graph and the message below it always agree.
    if (this.getBlockers(data, totalAirStorage).length > 0) { return undefined; }
    const pressureFactor: number = this.compressorReplacementService.pressureCorrectionFactor(data, atmosphericPressure, settings);
    const item: CompressorInventoryItem = this.compressorAdapterService.buildInventoryItem(data, pressureFactor, settings);
    const sitePressure: number = atmosphericPressure > 0 ? atmosphericPressure : this.compressorReplacementService.getDefaultAtmosphericPressure(settings);
    const points: Array<CompressorCalcResult> = this.getCurve(item, settings, sitePressure, totalAirStorage || 0);
    // Absolute kW and capacity are divided by the reference unit's rated (uncorrected) values.
    const powerDenominator: number = reference.power > 0 ? reference.power : this.compressorAdapterService.ratedFullLoadPower(data);
    const capacityDenominator: number = reference.capacity > 0 ? reference.capacity : this.compressorAdapterService.ratedCapacity(data);
    if (!(powerDenominator > 0) || !(capacityDenominator > 0)) { return undefined; }
    // An all-zero curve means the suite couldn't solve these inputs.
    if (!points.some(point => isFinite(point.powerCalculated) && point.powerCalculated > 0)) { return undefined; }
    return {
      x: points.map(point => (point.capacityCalculated / capacityDenominator) * 100),
      y: points.map(point => (point.powerCalculated / powerDenominator) * 100),
      name: prefix + (data.name || item.name),
      type: 'scatter', mode: 'lines',
      line: { color: color, dash: dash }
    };
  }

  private getCurve(item: CompressorInventoryItem, settings: Settings, atmosphericPressure: number, totalAirStorage: number): Array<CompressorCalcResult> {
    const curve: Array<CompressorCalcResult> = [];
    for (let airFlow = 0; airFlow <= 100;) {
      try {
        curve.push(this.compressedAirCalculationService.compressorsCalc(item, settings, 1, airFlow, atmosphericPressure, totalAirStorage, 0, false));
      } catch (e) {
        curve.push(this.compressedAirCalculationService.getEmptyCalcResults());
      }
      airFlow = airFlow < 95 ? airFlow + 1 : airFlow + 0.5;
    }
    return curve;
  }

  private color(index: number): string {
    return this.graphColors[index % this.graphColors.length];
  }
}
