import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WaterfallGraphService, WaterfallInput } from './waterfall-graph.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-waterfall-graph',
  templateUrl: './waterfall-graph.component.html',
  styleUrls: ['./waterfall-graph.component.css']
})
export class WaterfallGraphComponent implements OnInit {
  @Input()
  waterfallInput1: WaterfallInput;
  @Input()
  waterfallInput2: WaterfallInput;
  @Input()
  changeWaterfall: boolean;
  @Input()
  modExists: boolean;
  @Input()
  focusInput1: boolean;
  @Input()
  containerWidth: number;
  @Input()
  containerHeight: number;
  @Input()
  printView: boolean;

  @ViewChild('ngChart', { static: false }) ngChart: ElementRef;
  canvasWidth: number;
  canvasHeight: number;
  width: number;
  height: number;

  nodeHeight: number;
  margin: { top: number, right: number, bottom: number, left: number };
  svg: d3.Selection<any>;
  xScale: any;
  x: any;
  y: any;
  range: { min: number, max: number };
  domain: { min: number, max: number };

  // add this boolean to keep track if graph has been expanded
  expanded: boolean = false;

  input1MaxGreater: boolean;
  inputMaxDifference: number;

  constructor(private waterfallGraphService: WaterfallGraphService) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.ngChart) {
      if (changes.waterfallInput1 && !changes.waterfallInput1.firstChange) {
        this.checkInputs();
        this.resizeGraph();
      }
      if (changes.waterfallInput2 && !changes.waterfallInput2.firstChange) {
        this.checkInputs();
        this.resizeGraph();
      }
    }
  }

  ngAfterViewInit() {
    this.checkInputs();
    this.resizeGraph();
  }

  checkInputs() {
    if (this.waterfallInput1 !== undefined && this.waterfallInput1 !== null && this.waterfallInput2 !== undefined && this.waterfallInput2 !== null) {
      if (this.waterfallInput1.inputObjects.length !== this.waterfallInput2.inputObjects.length) {
        throw "Two input objects detected - must have equal data array length. Input 1 = " + this.waterfallInput1.inputObjects.length + ", Input 2 = " + this.waterfallInput2.inputObjects.length + ".";
      }
    }
  }

  setRange() {
    this.range = {
      min: 0,
      max: this.width * 0.5
    }
  }

  setDomain() {
    this.domain = {
      min: 0,
      max: this.waterfallGraphService.getDomain(this.waterfallInput1, this.modExists ? this.waterfallInput2 : null)
    };

    if (this.modExists) {
      this.inputMaxDifference = this.waterfallGraphService.getDomain(this.waterfallInput1, null) - this.waterfallGraphService.getDomain(this.waterfallInput2, null);
      if (this.inputMaxDifference >= 0) {
        this.input1MaxGreater = true;
      }
      else {
        this.input1MaxGreater = false;
        this.inputMaxDifference = this.inputMaxDifference * (-1);
      }
    }
  }

  resizeGraph() {
    if (this.containerWidth < 400) {
      this.margin = { top: 10, right: 10, bottom: 10, left: 10 };
    } else {
      if (!this.expanded) {
        this.margin = { top: 30, right: 30, bottom: 30, left: 30 };
      }
      else {
        this.margin = { top: 30, right: 30, bottom: 30, left: 30 };
      }
    }
    this.width = this.containerWidth - this.margin.left - this.margin.right;
    this.height = this.containerHeight - this.margin.top - this.margin.bottom;
    this.makeGraph();
  }

  makeGraph() {
    this.setRange();
    this.setDomain();
    this.xScale = this.waterfallGraphService.setScale(this.range, this.domain);
    this.ngChart = this.waterfallGraphService.clearSvg(this.ngChart);
    this.svg = this.waterfallGraphService.initSvg(this.ngChart, this.width, this.height, this.margin);
    this.waterfallGraphService.setNodeHeight(this.waterfallInput1, this.height);
    this.waterfallGraphService.setFormat();

    let xOffset = 0;
    let maxValue = this.domain.max;
    this.waterfallGraphService.appendLegend(this.svg, this.width, this.waterfallInput1, this.modExists ? this.waterfallInput2 : null);
    if (this.modExists && !this.input1MaxGreater) {
      xOffset = this.inputMaxDifference;
    }
    for (let i = 0; i < this.waterfallInput1.inputObjects.length; i++) {
      this.waterfallGraphService.appendSourceNode(this.svg, this.waterfallInput1, this.width, this.height, this.xScale, i, maxValue, xOffset, true);
      xOffset += this.waterfallInput1.inputObjects[i].isStartValue ? 0 : this.waterfallInput1.inputObjects[i].value;
    }

    if (this.modExists) {
      xOffset = 0;
      if (this.input1MaxGreater) {
        xOffset = this.inputMaxDifference;
      }
      for (let i = 0; i < this.waterfallInput2.inputObjects.length; i++) {
        this.waterfallGraphService.appendSourceNode(this.svg, this.waterfallInput2, this.width, this.height, this.xScale, i, maxValue, xOffset, false);
        xOffset += this.waterfallInput2.inputObjects[i].isStartValue ? 0 : this.waterfallInput2.inputObjects[i].value;
      }
    }
    this.waterfallGraphService.addMinMaxLines(this.svg, this.width, this.height, this.domain, this.xScale);
    if (!this.modExists) {
      this.waterfallGraphService.styleForNoComparison();
    }

    setTimeout(() => {
      if (this.modExists) {
        this.waterfallGraphService.addHoverEvent();
      }
    }, 500);
  }
}