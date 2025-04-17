import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PlotlyService } from 'angular-plotly.js';
import { WaterAssessmentService } from '../../water-assessment.service';
import { Subscription } from 'rxjs';
import { DischargeOutlet, IntakeSource, WaterAssessment, WaterProcessComponentType } from 'process-flow-lib';

@Component({
  selector: 'app-monthly-flow-chart',
  standalone: false,
  templateUrl: './monthly-flow-chart.component.html',
  styleUrl: './monthly-flow-chart.component.css'
})
export class MonthlyFlowChartComponent {
  @Input()
  settings: Settings;
  @Input()
  componentType: WaterProcessComponentType;

  plantMonthlyFlowTraces: any[] = [];
  flowLabel: string = 'Intake';
  flowUnits: string = 'Mgal';
  @ViewChild("monthlyFlowChart", { static: false }) monthlyFlowChart: ElementRef;

  waterAssessmentSub: Subscription;
  waterAssessment: WaterAssessment

  constructor(private plotlyService: PlotlyService, private waterAssessmentService: WaterAssessmentService) { }

  ngAfterViewInit() {
    this.waterAssessmentSub = this.waterAssessmentService.waterAssessment.subscribe(assessment => {
      this.waterAssessment = assessment;
      this.setPlantMonthlyFlowData();
      this.createChart();
    });
  }

  ngOnDestroy() {
    this.waterAssessmentSub.unsubscribe();
  }

  setPlantMonthlyFlowData() {
    this.plantMonthlyFlowTraces = [];
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.flowUnits = 'm<sup>3</sup>/yr';
    }

    if (this.componentType === 'water-intake') {
      this.flowLabel = 'Intake';
      this.setTraceData(this.waterAssessment.intakeSources);
    } else if (this.componentType === 'water-discharge') {
      this.flowLabel = 'Discharge';
      this.setTraceData(this.waterAssessment.dischargeOutlets);
    }
  }

  setTraceData(waterComponents: IntakeSource[] | DischargeOutlet[]) {
    waterComponents.forEach((component: IntakeSource | DischargeOutlet) => {
      if (component.monthlyFlow) {
        let xData = component.monthlyFlow.map(data => data.month);
        let yData = component.monthlyFlow.map(data => data.flow !== null? data.flow : 0);
        let trace = {
          x: xData,
          y: yData,
          type: 'bar',
          hovertemplate: `%{y:.2r} ${this.flowUnits}`,
          name: component.name,
        }
        this.plantMonthlyFlowTraces.push(trace);
      }
    });
  }

  createChart() {
    let tracesMin = [];
    let tracesMax = this.plantMonthlyFlowTraces.map(trace => {
        tracesMin.push(Math.min(...trace.y));
        return Math.max(...trace.y);
    });
    let yRange: Array<number> = [Math.min(...tracesMin), Math.max(...tracesMax)];

    let yTitle = `${this.flowLabel} (${this.flowUnits})`;
    let layout = {
      showlegend: true,
      barmode: 'stack',
      xaxis: {},
      yaxis: {
        range: yRange,
        title: {
          text: yTitle,
          font: {
            size: 16
          },
        },
        hoverformat: ",.2f",
      },
      margin: {
        t: 20,
        r: 20
      },
      legend: {
        orientation: "h",
        y: 1.25
      }
    };

    let config = {
      responsive: true,
      displaylogo: false
    }

    this.plotlyService.newPlot(this.monthlyFlowChart.nativeElement, this.plantMonthlyFlowTraces, layout, config)
  }
}
