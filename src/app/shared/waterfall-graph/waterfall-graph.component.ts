import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { WaterfallGraphService, WaterfallInput, WaterfallItem } from './waterfall-graph.service';
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
  focusInput1: boolean;
  @Input()
  containerWidth: number;
  @Input()
  containerHeight: number;
  @Input()
  printView: boolean;
  @ViewChild('ngChart') ngChart: ElementRef;
  canvasWidth: number;
  canvasHeight: number;
  width: number;
  height: number;

  nodeHeight: number;
  margin: { top: number, right: number, bottom: number, left: number };
  svg: d3.Selection<any>;
  x: any;
  y: any;
  range: { min: number, max: number };
  domain: { min: number, max: number };

  // add this boolean to keep track if graph has been expanded
  expanded: boolean = false;

  constructor(private waterfallGraphService: WaterfallGraphService) { }


  ngOnInit() {
    console.log('containerWidth = ' + this.containerWidth);
    console.log('containerHeight = ' + this.containerHeight);
    this.checkInputs();
    // this.nodeHeight = this.waterfallGraphService.getNodeHeight(this.waterfallInput1, this.containerHeight);
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
      max: this.waterfallGraphService.getRange(this.waterfallInput1, this.waterfallInput2 !== undefined && this.waterfallInput2 !== null ? this.waterfallInput2 : null)
    }
  }

  setDomain() {
    this.domain = {
      min: 0,
      max: this.width
    };
  }



  resizeGraph() {
    //need to update curveGraph to grab a new containing element 'panelChartContainer'
    //make sure to update html container in the graph component as well
    // let curveGraph = this.ngChartContainer.nativeElement;
    // //conditional sizing if graph is expanded/compressed
    // if (!this.expanded) {
    //   this.canvasWidth = curveGraph.clientWidth;
    //   this.canvasHeight = this.canvasWidth * (3 / 5);
    // } else {
    //   this.canvasWidth = curveGraph.clientWidth;
    //   this.canvasHeight = curveGraph.clientHeight * 0.9;
    // }

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
    this.ngChart = this.waterfallGraphService.clearSvg(this.ngChart);
    this.svg = this.waterfallGraphService.initSvg(this.ngChart, this.width, this.height, this.margin);
    this.waterfallGraphService.setNodeHeight(this.waterfallInput1, this.height);
    
  }

}