import { Component, ViewChild, ElementRef, AfterViewInit, inject, DestroyRef } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { Subscription } from 'rxjs';
import { PrintOptionsMenuService } from '../../../../shared/print-options-menu/print-options-menu.service';
import { ProcessCoolingResultsService } from '../../../services/process-cooling-results.service';
import { ProcessCoolingChartsService } from '../../../services/process-cooling-charts.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProcessCoolingChillerOutput } from '../../../../shared/models/process-cooling-assessment';

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
  private chartsService = inject(ProcessCoolingChartsService);

  @ViewChild('chillerProfileChart', { static: false }) chartRef: ElementRef<HTMLDivElement>;

  printView: boolean = false;
  showPrintViewSub: Subscription;

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
    if (!this.chartRef?.nativeElement) return;
    const { traces, layout, config } = this.chartsService.buildChillerProfileChart(chillerOutput);
    this.plotlyService.newPlot(this.chartRef.nativeElement, traces, layout, config);
  }
}

