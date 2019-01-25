import { Component, OnInit, Input, ViewChild, SimpleChanges, ElementRef } from '@angular/core';
import { ReportRollupService, PhastResultsData } from '../report-rollup.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from 'electron';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import * as d3 from 'd3';
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
  chartContainerWidth: number;
  @Input()
  printView: boolean;
  @Input()
  assessmentType: string;

  chartContainerHeight: number;
  exportName: string;

  graphColors: Array<string>;
  labels: Array<string>;
  values: Array<number>;

  constructor() { }

  ngOnInit() {
    this.graphColors = graphColors;
    this.getLabels();
    this.getValues();
    this.setExportName();
    if (!this.printView) {
      this.chartContainerHeight = 220;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.results !== undefined && changes.results !== undefined) {
      if (!changes.results.firstChange) {
        this.getLabels();
        this.getValues();
      }
    }
  }

  getLabels(): void {
    this.labels = new Array<string>();
    for (let i = 0; i < this.results.length; i++) {
      let p: number = +this.results[i].percent;
      let label = this.results[i].name + ": " + p.toFixed(2) + "%";
      this.labels.push(label);
    }
  }

  getValues(): void {
    this.values = new Array<number>();
    for (let i = 0; i < this.results.length; i++) {
      this.values.push(this.results[i].percent);
    }
  }

  setExportName(): void {
    if (this.assessmentType) {
      this.exportName = this.assessmentType + "-energy-use-rollup-pie-chart";
    }
    else {
      this.exportName = "energy-use-rollup-pie-chart";
    }
  }
}