import { Component, DestroyRef, ElementRef, inject, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { PlantSystemSummaryResults, SystemAnnualSummaryResults } from 'process-flow-lib';
import { combineLatest, Subscription } from 'rxjs';
import { PrintOptionsMenuService } from '../../../shared/print-options-menu/print-options-menu.service';
import { WaterAssessmentService } from '../../water-assessment.service';
import { getGraphColors } from '../../../shared/helperFunctions';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-stacked-bar-intake-flow',
  standalone: false,
  templateUrl: './stacked-bar-intake-flow.component.html',
  styleUrl: './stacked-bar-intake-flow.component.css'
})
export class StackedBarIntakeFlowComponent {
  private readonly waterAssessmentService = inject(WaterAssessmentService);
  private readonly waterAssessmentResultsService = inject(WaterAssessmentResultsService);
  private readonly printOptionsMenuService = inject(PrintOptionsMenuService);
  private readonly plotlyService = inject(PlotlyService);
  private readonly destroyRef = inject(DestroyRef);

  printView: boolean;
  showPercent: boolean = false; 
  @ViewChild('intakeFlowsChart', { static: false }) intakeFlowsChart: ElementRef;

  showPrintViewSub: Subscription;
  percentViewSubscription: Subscription;

  ngOnInit(): void {
    this.showPrintViewSub = this.printOptionsMenuService.showPrintView.subscribe(val => {
      this.printView = val;
    });
  }

  ngOnDestroy() {
      this.showPrintViewSub.unsubscribe();
      this.percentViewSubscription?.unsubscribe();
  }

  ngAfterViewInit() {
      combineLatest([
        this.waterAssessmentResultsService.plantSystemSummaryResults$,
        this.waterAssessmentResultsService.systemStackedBarPercentView
      ]).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(([plantSystemSummaryResults, systemStackedBarPercentView]) => {
        this.showPercent = systemStackedBarPercentView;
        this.renderChart(plantSystemSummaryResults);
      });
    }

  renderChart(report: PlantSystemSummaryResults) {
    const settings = this.waterAssessmentService.settings.getValue();
    const units = settings && settings.unitsOfMeasure === 'Imperial' ? 'Mgal' : 'm<sup>3</sup>';
    const decimalPrecision = settings.flowDecimalPrecision ?? 2;

    const systemNames: string[] = report.allSystemResults.map((system: SystemAnnualSummaryResults) => system.name || 'System');
    const intakeValuesRaw: number[] = report.allSystemResults.map((system: SystemAnnualSummaryResults) => system.sourceWaterIntake || 0);
    const totalIntake = report.sourceWaterIntake || 1;
    const percentIntakes: number[] = intakeValuesRaw.map(val => (val / totalIntake * 100));

    let chartData: any[];
    let yAxisTitle: string;

    const graphColors = getGraphColors();
    const systemColors = systemNames.map((_, idx) => graphColors[idx % graphColors.length]);

    if (this.showPercent) {
      chartData = systemNames.map((name, idx) => ({
        type: 'bar',
        x: ['System Intake Volume'],
        y: [Number(percentIntakes[idx].toFixed(1))],
        name: name,
        text: percentIntakes[idx].toFixed(1) + '%',
        textposition: 'auto',
        hovertemplate: `${name}: ${percentIntakes[idx].toFixed(1)}%<extra></extra>`,
        marker: { color: systemColors[idx], line: { color: 'white', width: 1 } },
        orientation: 'v'
      }));
      yAxisTitle = 'System Intake Volume (%)';
    } else {
      chartData = systemNames.map((name, idx) => ({
        type: 'bar',
        x: ['System Intake Volume'],
        y: [Number(intakeValuesRaw[idx].toFixed(decimalPrecision))],
        name: name,
        text: intakeValuesRaw[idx].toFixed(decimalPrecision) + ' ' + units,
        textposition: 'auto',
        hovertemplate: `${name}: ${intakeValuesRaw[idx].toFixed(decimalPrecision)} ${units}<extra></extra>`,
        marker: { color: systemColors[idx], line: { color: 'white', width: 1 } },
        orientation: 'v'
      }));
      yAxisTitle = `Total Intake volume (${units})`;
    }

    const layout = {
      barmode: 'stack',
      title: `System Intake Volume (${units ? units : '%'})`,
      width: this.printView ? 800 : undefined,
      autosize: true,
      margin: { l: 40, r: 40, t: 80, b: 40 },
      pad: { l: 50, b: 50 },
      showlegend: false,
      xaxis: {
        title: '',
        automargin: true
      },
      yaxis: {
        title: yAxisTitle,
        automargin: true,
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

    this.plotlyService.newPlot(this.intakeFlowsChart.nativeElement, chartData, layout, configOptions);
  }


}
