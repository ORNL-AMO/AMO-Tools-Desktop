import { Component, OnInit, Input, ViewChild, SimpleChanges, ElementRef } from '@angular/core';
import { ReportRollupService, PhastResultsData } from '../report-rollup.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from 'electron';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import { SigFigsPipe } from '../../shared/sig-figs.pipe';
import { SvgToPngService } from '../../shared/svg-to-png/svg-to-png.service';
import * as d3 from 'd3';
import * as c3 from 'c3';
@Component({
  selector: 'app-rollup-pie-chart',
  templateUrl: './rollup-pie-chart.component.html',
  styleUrls: ['./rollup-pie-chart.component.css']
})
export class RollupPieChartComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: Array<any>;
  @Input()
  graphColors: Array<string>;
  @Input()
  isUpdate: boolean;
  @Input()
  showLegend: boolean;
  @Input()
  labels: boolean;
  @Input()
  chartContainerWidth: number;
  @Input()
  printView: boolean;
  @Input()
  title: string;
  @Input()
  showTitle: boolean;
  @Input()
  chartIndex: number;
  @Input()
  assessmentType: string;

  chartContainerHeight: number;

  @ViewChild("ngChart") ngChart: ElementRef;
  @ViewChild('btnDownload') btnDownload: ElementRef;
  exportName: string;

  pieChart: any;

  constructor(private svgToPngService: SvgToPngService) { }

  ngOnInit() {
    this.graphColors = graphColors;
  }

  ngAfterViewInit() {
    if (this.printView) {
      this.chartContainerHeight = 310;
      this.chartContainerWidth = 500;
    }
    else {
      this.chartContainerHeight = 280;
    }
    this.initChart();
  }

  ngOnChanges() {
    if (this.isUpdate) {
      this.updateChart();
    }
  }


  initChart() {
    let currentChart;

    if (this.assessmentType == "phast") {
      if (this.printView) {
        this.ngChart.nativeElement.className = "printing-phast-rollup-pie-chart";
      }

    }
    else if (this.assessmentType == "psat") {
      if (this.printView) {

        this.ngChart.nativeElement.className = "printing-psat-rollup-pie-chart";
      }
    }

    this.pieChart = c3.generate({
      bindto: this.ngChart.nativeElement,
      data: {
        columns: [],
        type: 'pie',
        labels: this.labels,
      },
      legend: {
        show: this.showLegend,
        position: 'right'
      },
      color: {
        pattern: this.graphColors
      },
      size: {
        width: this.chartContainerWidth,
        height: this.chartContainerHeight
      },
      tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
          let styling = "background-color: rgba(0, 0, 0, 0.7); border-radius: 5px; color: #fff; padding: 3px; font-size: 13px;";
          let html = "<div style='" + styling + "'>" + d[0].name + "</div>";
          return html;
        }
      }
    });

    for (let j = 0; j < this.results.length; j++) {
      this.pieChart.load({
        columns: [
          [this.results[j].name, this.results[j].percent]
        ],
        labels: this.labels
      });
    }

    if (this.printView) {
      //formatting chart
      d3.selectAll(".c3-legend-item text").style("font-size", "13px");
    }
  }

  updateChart() {
    if (this.pieChart) {
      for (let i = 0; i < this.results.length; i++) {
        this.pieChart.load({
          columns: [
            [this.results[i].name, this.results[i].percent]
          ],
          type: 'pie',
          labels: this.labels
        });
      }
    }
  }


  downloadChart() {
    if (!this.title) {
      if (this.assessmentType == "phast") {
        this.exportName = "phast-rollup-pie-graph";
      }
      else {
        this.exportName = "psat-rollup-pie-graph";
      }
    }
    else {
      this.exportName = this.title + "-graph";
    }
    this.svgToPngService.exportPNG(this.ngChart, this.exportName);
  }
}
