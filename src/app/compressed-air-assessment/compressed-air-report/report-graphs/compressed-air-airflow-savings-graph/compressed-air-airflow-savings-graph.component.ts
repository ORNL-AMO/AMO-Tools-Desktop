import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { CompressedAirAssessment, CompressedAirDayType } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentModificationResults } from '../../../calculations/modifications/CompressedAirAssessmentModificationResults';
import { BaselineResults } from '../../../calculations/caCalculationModels';
import { Settings } from '../../../../shared/models/settings';

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
  constructor(private plotlyService: PlotlyService) { }

  ngAfterViewInit() {
    this.drawModificationGraph();
  }

  drawModificationGraph() {
    this.drawDayTypeModificationGraph();
  }

  drawDayTypeModificationGraph() {
    if (this.assessmentResults && this.baselineResults && this.dayTypeId && this.modificationGraph) {
      let dayType: CompressedAirDayType = this.compressedAirAssessment.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId === this.dayTypeId });

      let y: Array<string> = this.assessmentResults.map(result => {
        return result.modification.name
      });
      y.unshift('Baseline');

      let baselineDayTypeResult = this.baselineResults.dayTypeResults.find(result => { return result.dayTypeId === this.dayTypeId });
      let xValue = new Array();
      this.assessmentResults.forEach(result => {
        let dayTypeResult = result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId });
        xValue.push(dayTypeResult.averageAirFlow);
      });
      xValue.unshift(baselineDayTypeResult.averageAirFlow);
      let traceData = [];
      let text = xValue.map(v => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v) + ' ' + this.getUnits());
      let trace = this.getTrace(xValue, y, 'Adjusted Average Airflow', text);
      traceData.push(trace);
      var layout = {
        showlegend: true,
        barmode: 'stack',
        title: {
          text: `Adjusted Average Airflow by Modification <br> ${dayType.name}`,
        },
        yaxis: {
          autotick: false,
          automargin: true,
        },
        xaxis: {
          tickprefix: '',
          tickformat: '~s',
          hoverformat: '~s',
        },
        margin: {},
        legend: {
          orientation: 'h',
        },
        hovermode: 'y unified'
      }
      var config = {
        responsive: true,
        displaylogo: false
      };
      this.plotlyService.newPlot(this.modificationGraph.nativeElement, traceData, layout, config);
    }
  }

  getTrace(xValue: Array<number>, y: Array<string>, name: string, text?: Array<string>) {
    return {
      x: xValue,
      y: y,
      type: 'bar',
      orientation: 'h',
      name: name,
      hovertemplate: name + ': %{x:,.0f}<extra></extra> ' + this.getUnits(),
      text: text,
      textposition: 'auto',
      marker: {
        line: {
          width: 3
        }
      },
    }
  }

  getUnits(): string{
    if(this.settings.unitsOfMeasure == 'Imperial'){
      return 'acfm';
    } else {
      return 'm<sup>3</sup>/min';
    }
  }
}
