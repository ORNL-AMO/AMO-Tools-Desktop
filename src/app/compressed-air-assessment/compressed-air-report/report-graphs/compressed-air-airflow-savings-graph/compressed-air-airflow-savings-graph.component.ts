import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { CompressedAirAssessment, CompressedAirDayType } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentModificationResults } from '../../../calculations/modifications/CompressedAirAssessmentModificationResults';
import { BaselineResults } from '../../../calculations/caCalculationModels';
import { Settings } from '../../../../shared/models/settings';
import { defaultPlotlyConfig } from '../../../../shared/helperFunctions';
import { CompressedAirChartsService } from '../../../services/compressed-air-charts.service';
@Component({
  selector: 'app-compressed-air-airflow-savings-graph',
  templateUrl: './compressed-air-airflow-savings-graph.component.html',
  styleUrl: './compressed-air-airflow-savings-graph.component.css',
  standalone: false
})
export class CompressedAirAirflowSavingsGraphComponent {
  @Input({ required: true })
  assessmentResults: Array<CompressedAirAssessmentModificationResults>;
  @Input({ required: true })
  compressedAirAssessment: CompressedAirAssessment;
  @Input()
  dayTypeId: string;
  @Input()
  baselineResults: BaselineResults;
  @Input()
  settings: Settings;

  @ViewChild("modificationGraph", { static: false }) modificationGraph: ElementRef;
  private readonly compressedAirChartsService = inject(CompressedAirChartsService);

  constructor(private plotlyService: PlotlyService) { }

  ngAfterViewInit() {
    this.drawModificationGraph();
  }

  drawModificationGraph() {
    this.drawDayTypeModificationGraph();
  }

  drawDayTypeModificationGraph() {
    if (this.assessmentResults && this.baselineResults && this.dayTypeId && this.modificationGraph) {
      const dayType: CompressedAirDayType = this.compressedAirAssessment.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId === this.dayTypeId });
      const chart = this.compressedAirChartsService.buildAirflowSavingsChart(dayType, this.baselineResults, this.assessmentResults, this.settings);
      var config = {
        responsive: true,
        displaylogo: false
      };
      this.plotlyService.newPlot(this.modificationGraph.nativeElement, chart.traces, chart.layout, defaultPlotlyConfig(config, chart.traces));
    }
  }
}
