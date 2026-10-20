import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { CompressorPlotData } from '../cagi-lookup.service';
import { PlotlyService } from 'angular-plotly.js';

interface PlotTrace {
  x: Array<number>; y: Array<number>; name: string; type: string; mode: string;
  line: { color: string }; marker: { color: string };
}

@Component({
  selector: 'app-cagi-lookup-plot',
  templateUrl: './cagi-lookup-plot.component.html',
  styleUrls: ['./cagi-lookup-plot.component.css'],
  standalone: false
})
export class CagiLookupPlotComponent {
  /** 'each' = normalize every compressor to its own 100%; 'largest' = scale all off the highest-capacity unit. */
  @Input() scaleMode: string = 'each';
  @Input() data: Array<CompressorPlotData> = [];

  @ViewChild('cagiChart', { static: false }) cagiChart: ElementRef;

  private readonly graphColors: Array<string> = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

  constructor(private plotlyService: PlotlyService) { }

  ngAfterViewInit(): void { setTimeout(() => this.drawChart(), 50); }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.cagiChart) { setTimeout(() => this.drawChart(), 50); }
  }

  drawChart(): void {
    if (!this.cagiChart) { return; }
    const plottable: Array<CompressorPlotData> = (this.data || []).filter(d => d.points && d.points.length >= 2);

    // In 'largest' mode the highest-capacity unit sets 100% on both axes.
    let refCapacity: number = 1;
    let refPower: number = 1;
    if (this.scaleMode === 'largest') {
      let topCapacity: number = 0;
      plottable.forEach(d => {
        if (d.maxCapacity > topCapacity) { topCapacity = d.maxCapacity; refPower = d.maxPower || 1; }
      });
      refCapacity = topCapacity || 1;
    }

    const traces: Array<PlotTrace> = plottable.map((d, index) => {
      const capScale: number = this.scaleMode === 'largest' ? refCapacity : (d.maxCapacity || 1);
      const powScale: number = this.scaleMode === 'largest' ? refPower : (d.maxPower || 1);
      const color: string = this.graphColors[index % this.graphColors.length];
      return {
        x: d.points.map(p => (p.capacity / capScale) * 100),
        y: d.points.map(p => (p.power / powScale) * 100),
        name: d.label,
        type: 'scatter', mode: 'lines+markers',
        line: { color: color }, marker: { color: color }
      };
    });

    // A small, inefficient unit can read above 100% power against the largest, so expand to fit.
    let maxX: number = 100;
    let maxY: number = 100;
    traces.forEach(trace => {
      trace.x.forEach(v => { if (isFinite(v) && v > maxX) { maxX = v; } });
      trace.y.forEach(v => { if (isFinite(v) && v > maxY) { maxY = v; } });
    });

    const layout = {
      xaxis: { range: [0, maxX * 1.05], ticksuffix: '%', title: { text: 'Airflow (% Capacity)', font: { size: 15 } }, automargin: true },
      yaxis: { range: [0, maxY * 1.05], ticksuffix: '%', title: { text: 'Power (% Full Load)', font: { size: 15 } }, hoverformat: ',.1f' },
      margin: { t: 20, r: 20 },
      legend: { orientation: 'h', y: 1.25 }
    };
    const config = { responsive: true, displaylogo: false };
    this.plotlyService.newPlot(this.cagiChart.nativeElement, traces, layout, config);
  }
}
