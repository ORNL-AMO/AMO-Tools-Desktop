import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { PreAssessment } from '../pre-assessment';
import { PreAssessmentService } from '../pre-assessment.service';
import { Settings } from '../../../../shared/models/settings';
import * as _ from 'lodash';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
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
  graphColors: Array<string>;
  @Input()
  printView: boolean;
  @Input()
  inRollup: boolean;
  @Input()
  toggleCalculate: boolean;
  @Input()
  resultType: string;
  @Input()
  directoryId: number;

  @ViewChild('preAssessmentPieChart', { static: false }) preAssessmentPieChart: ElementRef;

  // directorySettings: Settings;
  showPieChart: boolean;
  // exportName: string;
  // values: Array<number>;
  // labels: Array<string>;
  // destroy: boolean;

  // chartContainerWidth: number;
  // chartContainerHeight: number;


  constructor(private cd: ChangeDetectorRef, private preAssessmentService: PreAssessmentService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    // this.values = new Array<number>();
    // this.labels = new Array<string>();
    // this.graphColors = graphColors;
    if (!this.resultType) {
      this.resultType = 'value';
    }

    // this.setExportName();

    // this.destroy = false;
    // if (!this.printView) {
    //   this.printView = false;
    // }

    // if (this.directoryId !== undefined) {
    //   this.getDirectorySettings();
    // }
    // this.getData();
  }

  ngAfterViewInit() {
    this.drawPlot();
    // if (this.inRollup) {
    //   this.chartContainerHeight = 220;
    //   this.cd.detectChanges();
    // }
    // else {
    //   this.chartContainerHeight = 300;
    //   this.cd.detectChanges();
    // }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleCalculate && this.preAssessmentPieChart) {
      this.drawPlot();
    }
    // if (changes.resultType) {
    //   this.setExportName();
    // }
  }

  // getDirectorySettings() {
  //   this.directorySettings = this.settingsDbService.getByDirectoryId(this.directoryId);
  // }

  setGraphType(type: string): void {
    this.resultType = type;
    this.drawPlot();
  }

  //invoke preAssessment service to calculate result data from Array<PreAssessment>
  // getData(): void {
  //   this.values = new Array<number>();
  //   this.labels = new Array<string>();
  //   if (this.preAssessments) {
  //     let tmpArray = new Array<{ name: string, percent: number, value: number, color: string }>();
  //     if (this.directorySettings === undefined) {
  //       tmpArray = this.preAssessmentService.getResults(this.preAssessments, this.settings, this.resultType);
  //     }
  //     else {
  //       tmpArray = this.preAssessmentService.getResults(this.preAssessments, this.directorySettings, this.resultType);
  //     }
  //     tmpArray.forEach(val => {
  //       if (isNaN(val.percent) === false && val.percent !== 0) {
  //         this.values.unshift(val.percent);
  //         this.labels.unshift(val.name + ": " + val.percent.toFixed(2) + "%");
  //       }
  //     });
  //     if (this.values.length > 0) {
  //       this.destroy = true;
  //     }
  //   }
  // }

  // setExportName(): void {
  //   this.exportName = 'pre-assessment-' + this.resultType + '-pie-chart';
  // }

  drawPlot() {
    let valuesAndLabels = this.getValuesAndLabels();
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

      this.showPieChart = true;
      Plotly.purge(this.preAssessmentPieChart.nativeElement);
      var data = [{
        values: values,
        labels: valuesAndLabels.map(val => { return val.name }),
        marker: {
          color: valuesAndLabels.map(val => { return val.color })
        },
        type: 'pie',
        textposition: 'auto',
        insidetextorientation: "horizontal",
        // automargin: true,
        // textinfo: 'label+value',
        hoverformat: '.2r',
        texttemplate: textTemplate,
        hoverinfo: 'label+percent',
        direction: "clockwise",
        rotation: 125
      }];

      var layout = {
        font: {
          size: 10,
        },
        showlegend: false,
        margin: { t: 30, b: 40, l: 135, r: 135 }
      };

      var modebarBtns = {
        modeBarButtonsToRemove: ['hoverClosestPie'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      };
      Plotly.react(this.preAssessmentPieChart.nativeElement, data, layout, modebarBtns);
    } else {
      this.showPieChart = false;
    }
  }

  getValuesAndLabels(): Array<{ name: string, percent: number, value: number, color: string, energyCost: number }> {
    console.log(this.resultType);
    let valuesAndLabels: Array<{ name: string, percent: number, value: number, color: string, energyCost: number }> = new Array();
    if (this.preAssessments) {
      valuesAndLabels = this.preAssessmentService.getResults(this.preAssessments, this.settings, this.resultType);
      // if (this.directorySettings === undefined) {
      //   valuesAndLabels = this.preAssessmentService.getResults(this.preAssessments, this.settings, this.resultType);
      // }
      // else {
      //   valuesAndLabels = this.preAssessmentService.getResults(this.preAssessments, this.directorySettings, this.resultType);
      // }
    }
    return valuesAndLabels;
  }

}
