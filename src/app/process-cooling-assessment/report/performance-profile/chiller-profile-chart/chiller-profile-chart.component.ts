import { Component, ViewChild, ElementRef, AfterViewInit, inject, DestroyRef } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { Subscription } from 'rxjs';
import { PrintOptionsMenuService } from '../../../../shared/print-options-menu/print-options-menu.service';
import { ProcessCoolingResultsService } from '../../../services/process-cooling-results.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProcessCoolingChillerOutput } from '../../../../shared/models/process-cooling-assessment';
import { LOAD_PERCENTAGES } from '../../../constants/process-cooling-constants';

@Component({
  selector: 'app-chiller-profile-chart',
  standalone: false,
  templateUrl: './chiller-profile-chart.component.html',
  styleUrls: ['./chiller-profile-chart.component.css']
})

export class ChillerProfileChartComponent implements AfterViewInit {
  private plotlyService: PlotlyService = inject(PlotlyService);
  private destroyRef = inject(DestroyRef);
  private processCoolingResultsService: ProcessCoolingResultsService = inject(ProcessCoolingResultsService);
  private printOptionsMenuService: PrintOptionsMenuService = inject(PrintOptionsMenuService);

  @ViewChild('chillerProfileChart', { static: false }) chartRef: ElementRef<HTMLDivElement>;

  printView: boolean = false; 
  showPrintViewSub: Subscription;

  private readonly loadPercentages: number[] = LOAD_PERCENTAGES;

  ngOnInit(): void {
    this.showPrintViewSub = this.printOptionsMenuService.showPrintView.subscribe(val => {
      this.printView = val;
    });
  }
  ngOnDestroy(): void {
    if (this.showPrintViewSub) {
      this.showPrintViewSub.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.processCoolingResultsService.baselineResults$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((results) => {
      if (results && results.chiller) {
        this.renderChart(results.chiller);
      } 
    });
  }

  private renderChart(chillerOutput?: ProcessCoolingChillerOutput[]): void {
    const traces = chillerOutput.map((chiller, idx) => ({
      x: this.loadPercentages,
      y: chiller.efficiency,
      type: 'scatter',
      mode: 'lines+markers',
      name: chiller.name,
      line: {
        width: 3,
        dash: 'dot',
        marker: {
          size: 8
        }
      },
      hovertemplate: `${chiller.name}<br>Load: %{x}<br>Efficiency (kW/Ton): %{y:.2f}<extra></extra>`
    }));

    const layout = {
      xaxis: {
        title: { text: '% Load', font: { size: 16 } },
        range: [0, 100],
        dtick: 10,
        ticksuffix: '%',
        automargin: true
      },
      yaxis: {
        title: { text: 'Efficiency (kW/Ton)', font: { size: 16 } },
        rangemode: 'tozero',
        hoverformat: '.2f',
        automargin: true,
        range: [0, 1],
        tickvals: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
        tickformat: '.1f'
      },
      margin: { t: 20, r: 20, l: 60, b: 60 },
      legend: { orientation: 'h', y: 1.15 },
      showlegend: true,
      hovermode: 'closest',
      responsive: true
    };

    const config = {
      responsive: true,
      displaylogo: false
    };

    if (this.chartRef?.nativeElement) {
      this.plotlyService.newPlot(this.chartRef.nativeElement, traces, layout, config);
    }
  }
}

