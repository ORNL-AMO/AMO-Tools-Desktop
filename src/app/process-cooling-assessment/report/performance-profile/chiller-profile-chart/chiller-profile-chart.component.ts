import { Component, effect, inject, input, viewChild, ElementRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlotlyService } from 'angular-plotly.js';
import { ProcessCoolingResultsService } from '../../../services/process-cooling-results.service';
import { ProcessCoolingChartsService } from '../../../services/process-cooling-charts.service';
import { ProcessCoolingChillerOutput } from '../../../../shared/models/process-cooling-assessment';

@Component({
  selector: 'app-chiller-profile-chart',
  standalone: false,
  templateUrl: './chiller-profile-chart.component.html',
  styleUrls: ['./chiller-profile-chart.component.css']
})
export class ChillerProfileChartComponent {
  private plotlyService = inject(PlotlyService);
  private processCoolingResultsService = inject(ProcessCoolingResultsService);
  private chartsService = inject(ProcessCoolingChartsService);
  plotlyMarkerShapes: Array<string> = [
    'star',
    'star-diamond',
    'hexagram',
    'star-square',
    'square',
    'diamond',
    'cross',
    'x',
    'diamond-wide',
    'diamond-tall'
  ];

  chartRef = viewChild<ElementRef<HTMLDivElement>>('chillerProfileChart');

  selectedChillerId = input<string | null | undefined>();
  private baselineResults = toSignal(this.processCoolingResultsService.baselineResults$);

  constructor() {
    effect(() => {
      const nativeElement: HTMLDivElement | undefined = this.chartRef()?.nativeElement;
      const chillerOutput: ProcessCoolingChillerOutput[] | undefined = this.baselineResults()?.chiller;
      const id = this.selectedChillerId();

      if (!nativeElement || !chillerOutput?.length) return;
      const filteredChillers: ProcessCoolingChillerOutput[] = id ? chillerOutput.filter(c => c.id === id) : chillerOutput;

      if (!filteredChillers.length) return;
      const { traces, layout, config } = this.chartsService.buildChillerProfileChart(filteredChillers);

      let currentShapeIndex = 0;

      filteredChillers.forEach((chiller, i) => {
        let currentMarkerShape = this.plotlyMarkerShapes[currentShapeIndex];
        if (traces[i]) {
          traces[i].marker = {
            ...traces[i].marker,
            size: 12,
            symbol: currentMarkerShape,
          };
        }

        if (currentShapeIndex === this.plotlyMarkerShapes.length - 1) {
          currentShapeIndex = 0;
        } else {
          currentShapeIndex++;
        }
      });

      const haloTraces = filteredChillers.map((chiller, i) => ({
        x: traces[i].x,
        y: traces[i].y,
        type: 'scatter',
        mode: 'markers',
        name: chiller.name,
        showlegend: false,
        hoverinfo: 'skip',
        marker: {
          size: 22,
          symbol: 'circle-open',
          color: traces[i].marker.color,
          line: { color: traces[i].marker.color, width: 1.5 },
          opacity: 0.45,
        },
      }));

      this.plotlyService.newPlot(nativeElement, [...traces, ...haloTraces], layout, config);
    });
  }
}

