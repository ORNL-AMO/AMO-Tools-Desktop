import { Component, OnInit, Input, SimpleChange, ViewChild, ElementRef, SimpleChanges, OnChanges } from '@angular/core';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';
import * as d3 from 'd3';
import * as c3 from 'c3';
import { PreAssessment } from '../pre-assessment';
import { PreAssessmentService } from '../pre-assessment.service';
import { Settings } from '../../../../shared/models/settings';
import { Calculator } from '../../../../shared/models/calculators';
import * as _ from 'lodash';

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
  chartColors: Array<string>;
  @Input()
  printView: boolean;
  @Input()
  inRollup: boolean;
  @Input()
  toggleCalculate: boolean;


  @ViewChild("ngChart") ngChart: ElementRef;
  exportName: string;

  firstChange: boolean = true;
  chart: any;
  columnData: Array<any>;
  chartContainerHeight: number;
  chartContainerWidth: number;

  hideTooltip: boolean = false;

  showLegend: boolean;
  destroy: boolean;

  window: any;
  doc: any;
  resultType: string = 'value';
  constructor(private windowRefService: WindowRefService, private svgToPngService: SvgToPngService, private preAssessmentService: PreAssessmentService) { }

  ngOnInit() {
    this.destroy = true;
    if (!this.printView) {
      this.printView = false;
    }

    if (this.inRollup) {
      this.showLegend = false;
    }
    else {
      this.showLegend = true;
    }
    this.chartColors = graphColors;
    this.getData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (changes.toggleCalculate) {
        this.getData();
        if (this.firstChange) {
          this.firstChange = !this.firstChange;
        }
        else if (this.columnData && this.columnData.length > 0 && !_.includes(this.columnData[0][0], 'NaN')) {
          this.destroy = false;
          this.initChart();
        }
        else {
          if (!this.destroy) {
            this.destroyChart();
          }
        }
      }
    }
  }

  ngAfterViewInit() {
    this.doc = this.windowRefService.getDoc();
    this.window = this.windowRefService.nativeWindow;
    this.chartContainerWidth = (this.window.innerWidth - 30) * .28;
    this.chartContainerHeight = 280;
    if (this.printView) {
      this.chartContainerWidth = 500;
    }
    if (this.columnData && this.columnData.length > 0 && !_.includes(this.columnData[0][0], 'NaN')) {
      this.initChart();
      this.destroy = false;
    }
    else {
      this.destroy = true;
    }
  }

  setGraphType(str: string){
    this.resultType = str;
    this.getData();
    this.initChart();
  }

  //invoke preAssessment service to calculate result data from Array<PreAssessment>
  getData() {
    this.columnData = new Array();
    if (this.preAssessments) {
      let tmpArray = new Array<{ name: string, percent: number, value: number, color: string }>();
      tmpArray = this.preAssessmentService.getResults(this.preAssessments, this.settings, this.resultType);
      for (let i = 0; i < tmpArray.length; i++) {
        this.columnData.unshift([tmpArray[i].name + ": " + tmpArray[i].percent.toFixed(2) + "%", tmpArray[i].percent]);
      }
    }
  }

  destroyChart() {
    if (this.chart) {
      this.chart.destroy();
      this.destroy = true;
    }
  }

  initChart() {

    this.hideTooltip = true;

    this.chart = c3.generate({
      bindto: this.ngChart.nativeElement,
      data: {
        columns: this.columnData,
        type: 'pie',
      },
      size: {
        width: this.chartContainerWidth,
        height: this.chartContainerHeight
      },
      color: {
        pattern: this.chartColors
      },
      legend: {
        show: this.showLegend,
        position: 'right'
      },
      tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
          let styling = "background-color: rgba(0, 0, 0, 0.7); border-radius: 5px; color: #fff; padding: 3px; font-size: 13px;";
          let html = "<div style='" + styling + "'>" + d[0].name + "</div>";
          return html;
        }
      }
    });
  }

  updateChart() {
    if (this.chart) {
      this.chart.load({
        columns: this.columnData
      });
    }
  }

  downloadChart() {
    if (!this.exportName) {
      this.exportName = "pre-assessment-graph";
    }
    this.svgToPngService.exportPNG(this.ngChart, this.exportName);
  }
}