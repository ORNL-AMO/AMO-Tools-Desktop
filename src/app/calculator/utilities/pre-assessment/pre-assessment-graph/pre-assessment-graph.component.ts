import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { PreAssessment } from '../pre-assessment';
import { PreAssessmentService } from '../pre-assessment.service';
import { Settings } from '../../../../shared/models/settings';
import * as _ from 'lodash';
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-pre-assessment-graph',
  templateUrl: './pre-assessment-graph.component.html',
  styleUrls: ['./pre-assessment-graph.component.css']
})
export class PreAssessmentGraphComponent implements OnInit, OnChanges {
  @Input()
  settings: Settings;
  @Input()
  preAssessments: Array<PreAssessment>;
  @Input()
  printView: boolean;
  @Input()
  inRollup: boolean;
  @Input()
  resultType: string;
  @Input()
  toggleCalculate: boolean;

  @ViewChild('preAssessmentPieChart', { static: false }) preAssessmentPieChart: ElementRef;

  showPieChart: boolean;
  constructor(private preAssessmentService: PreAssessmentService) { }

  ngOnInit() {
    if (!this.resultType) {
      this.resultType = this.preAssessmentService.resultType;
    }
  }

  ngAfterViewInit() {
    this.drawPlot();
  }

  ngOnChanges() {
    if (this.preAssessmentPieChart) {
      this.drawPlot();
    }
  }

  setGraphType(type: string): void {
    this.resultType = type;
    this.drawPlot();
  }

  drawPlot() {
    let valuesAndLabels = this.getValuesAndLabels();
    Plotly.purge(this.preAssessmentPieChart.nativeElement);
    if (valuesAndLabels.length != 0) {
      let values: Array<number> = new Array();
      let textTemplate: string;
      if (this.resultType == 'value') {
        values = valuesAndLabels.map(val => { return val.value });
        textTemplate = '<b>%{label}: </b>%{value:,.0f}';
        if (this.settings.unitsOfMeasure != 'Metric') {
          textTemplate = textTemplate + ' MMBtu';
        } else {
          textTemplate = textTemplate + ' GJ';
        }
      } else {
        values = valuesAndLabels.map(val => { return val.energyCost });
        textTemplate = '<b>%{label}: </b>%{value:$,.0f}';
      }
      var data = [{
        values: values,
        labels: valuesAndLabels.map(val => { return val.name }),
        marker: {
          colors: valuesAndLabels.map(val => { return val.color })
        },
        type: 'pie',
        textposition: 'auto',
        insidetextorientation: "horizontal",
        automargin: true,
        // textinfo: 'label+value',
        hoverformat: '.2r',
        texttemplate: textTemplate,
        hoverinfo: 'label+percent',
        direction: "clockwise",
        rotation: 125
      }];

      var layout = {
        font: {
          size: 12,
        },
        showlegend: false,
        margin: { t: 30, b: 40, l: 40, r: 40 },
        // paper_bgcolor: 'rgba(0,0,0,0)',
        // plot_bgcolor: 'rgba(0,0,0,0)',
      };

      var modebarBtns = {
        modeBarButtonsToRemove: ['hoverClosestPie'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      };
      Plotly.react(this.preAssessmentPieChart.nativeElement, data, layout, modebarBtns);
    }
  }

  getValuesAndLabels(): Array<{ name: string, percent: number, value: number, color: string, energyCost: number }> {
    let valuesAndLabels: Array<{ name: string, percent: number, value: number, color: string, energyCost: number }> = new Array();
    if (this.preAssessments) {
      valuesAndLabels = this.preAssessmentService.getResults(this.preAssessments, this.settings, this.resultType, false);
    }
    return valuesAndLabels;
  }

}
