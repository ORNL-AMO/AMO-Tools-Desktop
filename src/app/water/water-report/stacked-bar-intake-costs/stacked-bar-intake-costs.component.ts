import { Component, DestroyRef, ElementRef, inject, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { combineLatest, filter, Subscription } from 'rxjs';
import { PrintOptionsMenuService } from '../../../shared/print-options-menu/print-options-menu.service';
import { getGraphColors } from '../../../shared/helperFunctions';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';
import { PlantSystemSummaryResults } from 'process-flow-lib';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-stacked-bar-intake-costs',
  standalone: false,
  templateUrl: './stacked-bar-intake-costs.component.html',
  styleUrl: './stacked-bar-intake-costs.component.css'
})
export class StackedBarIntakeCostsComponent {
  private readonly waterAssessmentResultsService = inject(WaterAssessmentResultsService);
  private readonly printOptionsMenuService = inject(PrintOptionsMenuService)
  private readonly plotlyService = inject(PlotlyService);
  private readonly destroyRef = inject(DestroyRef);


  printView: boolean;
  showPercent: boolean = false;
  @ViewChild('intakeCostsChart', { static: false }) intakeCostsChart: ElementRef;

  plantSystemSummaryResults: PlantSystemSummaryResults;
  showPrintViewSub: Subscription;
  percentViewSubscription: Subscription;
  updateChartSubscription: Subscription;


  ngOnInit(): void {
    this.showPrintViewSub = this.printOptionsMenuService.showPrintView.subscribe(val => {
      this.printView = val;
    });
  }

  toggleYAxis(): void {
    this.showPercent = !this.showPercent;
    this.renderChart();
  }

  ngAfterViewInit() {
    this.updateChartSubscription = combineLatest([
      this.waterAssessmentResultsService.plantSystemSummaryResults$,
      this.waterAssessmentResultsService.systemStackedBarPercentView
    ]).pipe(
      filter(([plantSystemSummaryResults, systemStackedBarPercentView]) => plantSystemSummaryResults !== undefined && systemStackedBarPercentView !== undefined),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(([plantSystemSummaryResults, systemStackedBarPercentView]) => {
      this.showPercent = systemStackedBarPercentView;
      this.plantSystemSummaryResults = plantSystemSummaryResults;
      this.renderChart();
    });
  }

  renderChart() {

    const systemLabels: string[] = this.plantSystemSummaryResults.allSystemResults.map((system: any) => system.name || 'System');
    const trueCostsRaw: number[] = this.plantSystemSummaryResults.allSystemResults.map((system: any) => system.trueCostPerYear);
    const directCostsRaw: number[] = this.plantSystemSummaryResults.allSystemResults.map((system: any) => system.directCostPerYear);
    const percentTrueCosts: number[] = trueCostsRaw.map(val => (val / this.plantSystemSummaryResults.trueCostPerYear * 100));
    const percentDirectCosts: number[] = directCostsRaw.map(val => (val / this.plantSystemSummaryResults.directCostPerYear * 100));
    const graphColors = getGraphColors();
    const systemColors = systemLabels.map((_, idx) => graphColors[idx % graphColors.length]);

    let chartData = systemLabels.flatMap((label, idx) => {
      let directCostsLabels = this.getPercentLabels(percentDirectCosts, directCostsRaw, idx, label);
      let trueCostsLabels = this.getPercentLabels(percentTrueCosts, trueCostsRaw, idx, label);
      if (!this.showPercent) {
        directCostsLabels = this.getCostUnitLabels(percentDirectCosts, directCostsRaw, idx, label);
        trueCostsLabels = this.getCostUnitLabels(percentTrueCosts, trueCostsRaw, idx, label);
      }
      return [
        {
          type: 'bar',
          x: ['Direct Cost'],
          y: [this.showPercent ? percentDirectCosts[idx] : directCostsRaw[idx]],
          name: label,
          text: directCostsLabels.dataLabel,
          hovertemplate: directCostsLabels.hoverLabel,
          marker: { color: systemColors[idx], line: { color: 'white', width: 1 } },
          orientation: 'v',
          offsetgroup: 0,
          legendgroup: label,
          showlegend: true
        },
        {
          type: 'bar',
          x: ['True Cost'],
          y: [this.showPercent ? percentTrueCosts[idx] : trueCostsRaw[idx]],
          name: label,
          text: trueCostsLabels.dataLabel,
          hovertemplate: trueCostsLabels.hoverLabel,
          marker: { color: systemColors[idx], line: { color: 'white', width: 1 } },
          orientation: 'v',
          offsetgroup: 1,
          legendgroup: label,
          showlegend: false
        }
      ]
    });

    const yAxisTitle = this.showPercent ? 'Cost (% of Total)' : 'Cost (USD)';

    const layout = {
      barmode: 'stack',
      title: `System: Direct Costs vs. True Costs  (${this.showPercent ? '%' : 'USD'})`,
      width: this.printView ? 800 : undefined,
      autosize: true,
      margin: { l: 25, r: 25, t: 80, b: 40 },
      legend: {
        orientation: 'v',
        x: 1.15,
        y: 1,
        xanchor: 'left',
        yanchor: 'top',
        borderwidth: 0,
        bgcolor: 'rgba(0,0,0,0)'
      },
      xaxis: {
        title: '',
        automargin: true
      },
      yaxis: {
        title: yAxisTitle,
        automargin: true,
        tickformat: this.showPercent ? ',.1f%' : undefined,
        tickprefix: this.showPercent ? '' : '$',
        range: this.showPercent ? [0, 100] : undefined,
        side: 'left',
        ticks: 'outside',
        showline: true,
        showgrid: true
      }
    };

    const configOptions = {
      modeBarButtonsToRemove: [
        'toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d',
        'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines',
        'hoverClosestCartesian', 'hoverCompareCartesian'
      ],
      displaylogo: false,
      displayModeBar: true,
      responsive: this.printView ? false : true
    };

    this.plotlyService.newPlot(this.intakeCostsChart.nativeElement, chartData, layout, configOptions)
    .then(chart => {
          chart.on('plotly_legendclick', event => false);
          chart.on('plotly_legenddoubleclick', event => false);
        });
  }

  getPercentLabels(costsPercent: number[], costsRaw: number[], index: number, label: string): { dataLabel: string, hoverLabel: string } {
    const currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    return {
      dataLabel: `${costsPercent[index].toFixed(1)}%`,
      hoverLabel: `${label}: ${costsPercent[index].toFixed(1)}% (${currencyFormatter.format(costsRaw[index])})<extra></extra>`
    }
  }

  getCostUnitLabels(costsPercent: number[], costsRaw: number[], index: number, label: string): { dataLabel: string, hoverLabel: string } {
    const currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    return {
      dataLabel: `${currencyFormatter.format(costsRaw[index])}`,
      hoverLabel: `${label}: ${currencyFormatter.format(costsRaw[index])} (${costsPercent[index].toFixed(1)}%)<extra></extra>`
    }
  }
}
