import { Component, DestroyRef, effect, inject, input, signal, viewChild, ElementRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlotlyService } from 'angular-plotly.js';
import { ProcessCoolingResultsService } from '../../../services/process-cooling-results.service';
import { ProcessCoolingChartsService } from '../../../services/process-cooling-charts.service';
import { ProcessCoolingChillerOutput } from '../../../../shared/models/process-cooling-assessment';

const COMPACT_MEDIA_QUERY = '(max-width: 575px)';

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
  private destroyRef = inject(DestroyRef);

  chartRef = viewChild<ElementRef<HTMLDivElement>>('chillerProfileChart');
  selectedChillerId = input<string | null | undefined>();
  context = input<'inventory' | 'report'>('report');
  showFactored = signal<boolean>(false);
  compact = signal<boolean>(false);
  private baselineResults = toSignal(this.processCoolingResultsService.baselineResults$);

  constructor() {
    const compactQuery = window.matchMedia(COMPACT_MEDIA_QUERY);
    this.compact.set(compactQuery.matches);
    const onCompactQueryChange = (event: MediaQueryListEvent) => this.compact.set(event.matches);
    compactQuery.addEventListener('change', onCompactQueryChange);
    this.destroyRef.onDestroy(() => compactQuery.removeEventListener('change', onCompactQueryChange));

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
      const { traces, layout, config } = this.chartsService.buildChillerProfileChart(filteredChillers, showFactoredProfile, this.compact());
      this.plotlyService.newPlot(nativeElement, traces, layout, config);
    });
  }

  onShowFactoredChange(event: Event): void {
    this.showFactored.set((event.target as HTMLInputElement).checked);
  }
}

