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
import { IndexedDbService } from '../../../../indexedDb/indexed-db.service';

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

  @ViewChild('pieChartContainer') pieChartContainer: ElementRef;

  directorySettings: Settings;

  exportName: string;
  values: Array<number>;
  labels: Array<string>;
  destroy: boolean;

  chartContainerWidth: number;
  chartContainerHeight: number;

  doc: any;
  window: any;


  constructor(private windowRefService: WindowRefService, private svgToPngService: SvgToPngService, private preAssessmentService: PreAssessmentService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.values = new Array<number>();
    this.labels = new Array<string>();
    this.graphColors = graphColors;
    if (!this.resultType) {
      this.resultType = 'value';
    }

    this.setExportName();

    this.destroy = false;
    if (!this.printView) {
      this.printView = false;
    }

    if (this.directoryId !== undefined) {
      this.getDirectorySettings();
    }
    this.getData();
  }

  ngAfterViewInit() {
    this.doc = this.windowRefService.getDoc();
    this.window = this.windowRefService.nativeWindow;

    if (this.inRollup) {
      this.chartContainerHeight = 220;
    }
    else {
      this.chartContainerHeight = 300;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleCalculate) {
      this.getData();
    }
    if (changes.resultType) {
      this.setExportName();
    }
  }

  getDirectorySettings() {
    this.indexedDbService.getDirectorySettings(this.directoryId).then(results => {
      if (results.length != 0) {
        this.directorySettings = results[0];
      }
    });
  }

  getWidth(): number {
    if (this.pieChartContainer) {
      let containerPadding = 30;
      return this.pieChartContainer.nativeElement.clientWidth - containerPadding;
    }
    else {
      return 0;
    }
  }

  setGraphType(type: string): void {
    this.resultType = type;
    this.getData();
  }

  //invoke preAssessment service to calculate result data from Array<PreAssessment>
  getData(): void {
    this.values = new Array<number>();
    this.labels = new Array<string>();
    if (this.preAssessments) {
      let tmpArray = new Array<{ name: string, percent: number, value: number, color: string }>();
      if (this.directorySettings === undefined) {
        tmpArray = this.preAssessmentService.getResults(this.preAssessments, this.settings, this.resultType);
      }
      else {
        tmpArray = this.preAssessmentService.getResults(this.preAssessments, this.directorySettings, this.resultType);
      }
      for (let i = 0; i < tmpArray.length; i++) {
        this.values.unshift(tmpArray[i].percent);
        this.labels.unshift(tmpArray[i].name + ": " + tmpArray[i].percent.toFixed(2) + "%");

      }
      if (this.values.length > 0) {
        this.destroy = true;
      }
    }
  }

  setExportName(): void {
    this.exportName = 'pre-assessment-' + this.resultType + '-pie-chart';
  }
}