import { Component, OnInit, Input, SimpleChange, ViewChild, ElementRef } from '@angular/core';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { SvgToPngService } from '../../../../shared/svg-to-png/svg-to-png.service';
import * as d3 from 'd3';
import * as c3 from 'c3';

@Component({
  selector: 'app-pre-assessment-graph',
  templateUrl: './pre-assessment-graph.component.html',
  styleUrls: ['./pre-assessment-graph.component.css']
})
export class PreAssessmentGraphComponent implements OnInit {
  @Input()
  results: Array<any>;
  @Input()
  chartColors: Array<string>;

  @ViewChild("ngChart") ngChart: ElementRef;
  exportName: string;

  firstChange: boolean = true;
  chart: any;
  columnData: Array<any>;
  chartContainerHeight: number;
  chartContainerWidth: number;

  window: any;
  doc: any;

  constructor(private windowRefService: WindowRefService, private svgToPngService: SvgToPngService) { }

  ngOnInit() {
    this.getData();

  }

  ngOnChanges(changes: SimpleChange) {
    if (changes) {
      this.getData();
      if (this.firstChange) {
        this.firstChange = !this.firstChange;
      }
      else {
        this.initChart();
      }
    }
  }

  ngAfterViewInit() {
    this.doc = this.windowRefService.getDoc();
    this.window = this.windowRefService.nativeWindow;
    this.chartContainerWidth = this.window.innerWidth * 0.41;
    this.chartContainerHeight = 280;
    this.initChart();
  }

  getData() {
    this.columnData = new Array();
    this.results.forEach(val => {
      let tmpArray = new Array();
      tmpArray.push(val.name + ": " + val.percent.toFixed(2).toString() + "%");
      tmpArray.push(val.percent.toFixed(2));
      this.columnData.unshift(tmpArray);
    });
  }

  initChart() {
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
        show: true,
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