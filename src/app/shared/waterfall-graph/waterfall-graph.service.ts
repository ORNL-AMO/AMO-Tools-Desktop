import { Injectable, ElementRef } from '@angular/core';
import * as d3 from 'd3';


@Injectable()
export class WaterfallGraphService {

  verticalNodeMargin: number;
  nodeHeight: number;

  constructor() { }

  setNodeHeight(input: WaterfallInput, containerHeight: number) {
    // 10% of graph dedicated to spacing between waterfall nodes
    this.verticalNodeMargin = (containerHeight * 0.1) / (input.inputObjects.length * 2);
    this.nodeHeight = (containerHeight - (containerHeight * 0.1)) / input.inputObjects.length;
  }

  getRange(input1: WaterfallInput, input2?: WaterfallInput): number {
    let max = 0;
    for (let i = 0; i < input1.inputObjects.length; i++) {
      max = input1.inputObjects[i].isStartValue ? input1.inputObjects[i].value : max;
    }
    if (input2 !== undefined && input2 !== null) {
      for (let i = 0; i < input2.inputObjects.length; i++) {
        max = input2.inputObjects[i].isStartValue ? input2.inputObjects[i].value : max;
      }
    }
    return max;
  }

  // removes all svg elements from given parent element
  clearSvg(ngChart: ElementRef): ElementRef {
    d3.select(ngChart.nativeElement).selectAll('.d3-tip').remove();
    d3.select(ngChart.nativeElement).selectAll('.tooltip-pointer').remove();
    d3.select(ngChart.nativeElement).selectAll('svg').remove();
    return ngChart;
  }

  // give dimensions for chart area, returns formatted area
  initSvg(ngChart: ElementRef, width: number, height: number, margin: { top: number, right: number, bottom: number, left: number }): d3.Selection<any> {
    return d3.select(ngChart.nativeElement).append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }

  setScale(range: { min: number, max: number }, domain: { min: number, max: number }) {
    return d3.scaleLinear()
      .range([range.min, range.max])
      .domain([domain.min, domain.max]);
  }

  appendSourceNode(svg: d3.Selection<any>, waterfallInput: WaterfallInput, width: number, height: number, xScale: any, nodeHeight: number, verticalNodeMargin: number, index: number) {
    let tmpWaterfallItem = waterfallInput.inputObjects[index];
    let tmpNodeColor: string;
    if (tmpWaterfallItem.isStartValue) {
      tmpNodeColor = waterfallInput.startColor;
    }
    else {
      tmpNodeColor = tmpWaterfallItem.isNetValue ? waterfallInput.netColor : waterfallInput.lossColor;
    }
    let svgAppended = svg.append('rect')
                         .attr('class', 'waterfall-node')
                         .style('stroke-width', '3px')
                         .style('fill', tmpNodeColor)
                         .style('stroke', tmpNodeColor)
  }

  testAppendCircle(svg: d3.Selection<any>) {
    console.log('testAppendCircle()');
    let circle = svg.append('circle')
      .attr('r', 10)
      .attr('cx', 25)
      .attr('cy', 25)
      .attr('fill', '#00FF00');
    return circle;
  }
}

export interface WaterfallItem {
  value: number,
  label: string,
  isStartValue: boolean,
  isNetValue: boolean
};

export interface WaterfallInput {
  name: string,
  inputObjects: Array<WaterfallItem>,
  startColor: string,
  lossColor: string,
  netColor: string
}