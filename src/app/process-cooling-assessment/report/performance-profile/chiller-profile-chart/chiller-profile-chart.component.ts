import { Component, effect, inject, input, signal, viewChild, ElementRef } from '@angular/core';
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

  chartRef = viewChild<ElementRef<HTMLDivElement>>('chillerProfileChart');
  selectedChillerId = input<string | null | undefined>();
  context = input<'inventory' | 'report'>('report');
  showFactored = signal<boolean>(false);
  private baselineResults = toSignal(this.processCoolingResultsService.baselineResults$);

  constructor() {
    effect(() => {
      const nativeElement: HTMLDivElement | undefined = this.chartRef()?.nativeElement;
      if (!nativeElement) return;

      const chillerOutput: ProcessCoolingChillerOutput[] | undefined = this.baselineResults()?.chiller;
      const id = this.selectedChillerId();
      const filteredChillers: ProcessCoolingChillerOutput[] = chillerOutput?.length
        ? (id ? chillerOutput.filter(c => c.id === id) : chillerOutput)
        : [];

      if (!filteredChillers.length) {
        this.plotlyService.getPlotly().then(Plotly => Plotly.purge(nativeElement));
        return;
      }

      const showFactoredProfile = this.context() === 'inventory' && this.showFactored();
      const { traces, layout, config } = this.chartsService.buildChillerProfileChart(filteredChillers, showFactoredProfile);
      this.plotlyService.newPlot(nativeElement, traces, layout, config);
    });
  }

  onShowFactoredChange(event: Event): void {
    this.showFactored.set((event.target as HTMLInputElement).checked);
  }
}

