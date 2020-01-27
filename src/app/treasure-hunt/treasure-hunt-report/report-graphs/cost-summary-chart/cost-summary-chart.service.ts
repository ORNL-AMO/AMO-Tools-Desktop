import { Injectable, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Injectable()
export class CostSummaryChartService {

  legendHeight: number;
  horizontalNodeMargin: number;
  nodeWidth: number;

  constructor() { }

  setNodeWidth(input: Array<Array<number>>, containerWidth: number) {
    // 10% of graph dedicated to spacing between bar nodes
    this.horizontalNodeMargin = (containerWidth * 0.1) / (input.length * 2);
    this.nodeWidth = (containerWidth - (containerWidth * 0.1)) / input.length;
  }

  clearSvg(ngChart: ElementRef): ElementRef {
    d3.select(ngChart.nativeElement).selectAll('svg').remove();
    return ngChart;
  }

  //give dimensions for chart area, returns formatted area
  initSvg(ngChart: ElementRef, width: number, height: number, margin: { top: number, right: number, bottom: number, left: number }): d3.Selection<any> {
    return d3.select(ngChart.nativeElement).append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }

  //init, create, and append filters to svg
  applyFilter(svg: d3.Selection<any>): d3.Selection<any> {
    let defs: d3.Selection<any> = svg.append("defs");
    let filter: d3.Selection<any>;
    let feMerge: d3.Selection<any>;
    // create filter with id #drop-shadow
    // height=130% so that the shadow is not clipped
    filter = defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");
    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result
    // in blur
    filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3)
      .attr("result", "blur");
    // translate output of Gaussian blur to the right and downwards with 2px
    // store result in offsetBlur
    filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("result", "offsetBlur");
    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode")
      .attr("in", "offsetBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");
    return svg;
  }

  appendRect(svg: d3.Selection<any>, width: number, height: number) {
    svg.append('rect')
      .attr("id", "graph")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "#F8F9F9")
      .style("filter", "url(#drop-shadow)");
    return svg;
  }

  setScale(range: { min: number, max: number }, domain: { min: number, max: number }) {
    return d3.scaleLinear()
      .range([range.min, range.max])
      .domain([domain.min, domain.max]);
  }

  setCategoryScale(range: { min: number, max: number }, titles: Array<string>) {
    return d3.scaleBand().domain(titles).range([range.min, range.max]);
  }

  setXAxis(svg: d3.Selection<any>, scale: any, height: number, ticks?: number, tickSizeInner?: number, tickSizeOuter?: number, tickPadding?: number, tickFormat?: any): d3.Selection<any> {
    let xAxis: d3.Selection<any>;
    let tickSize: number;
    tickSize = 0;
    if (!tickFormat) {
      tickFormat = null;
    }
    xAxis = d3.axisBottom()
      .scale(scale)
      .tickSizeInner(tickSizeInner)
      .tickSizeOuter(tickSizeOuter)
      .tickPadding(tickPadding)
      .tickSize(tickSize)
      .ticks(ticks)
      .tickFormat(tickFormat);
    xAxis = svg.append('g')
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .style("stroke-width", ".5px")
      .selectAll('text')
      .style("text-anchor", "end")
      .style("font-size", "13px")
      .attr("transform", "rotate(-65) translate(-15, 0)")
      .attr("dy", "12px");
    return xAxis;
  }

  setYAxis(svg: d3.Selection<any>, scale: any, width: number, ticks?: number, tickSizeInner?: number, tickSizeOuter?: number, tickPadding?: number, tickFormat?: any): d3.Selection<any> {
    let yAxis: d3.Selection<any>;
    let tickSize: number;
    tickSize = width * (-1);

    if (!tickFormat) {
      tickFormat = null;
    }
    yAxis = d3.axisLeft()
      .scale(scale)
      .tickSizeInner(tickSizeInner)
      .tickSizeOuter(tickSizeOuter)
      .tickPadding(tickPadding)
      .tickSize(tickSize)
      .ticks(ticks)
      .tickFormat(d3.formatPrefix("$,.0", 1e4));
    yAxis = svg.append('g')
      .attr("class", "y axis")
      .call(yAxis)
      .style("stroke-width", ".5px")
      .selectAll('text')
      .style("font-size", "13px");
    return yAxis;
  }

  setXAxisLabel(svg: d3.Selection<any>, width: number, height: number, widthAdjustment: number, heightAdjustment: number, text: string) {
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "translate(" + ((width / 2) + widthAdjustment) + "," + (height + heightAdjustment) + ")")
      .html(text);
  }

  setYAxisLabel(svg: d3.Selection<any>, width: number, height: number, widthAdjustment: number, heightAdjustment: number, text: string) {
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "translate(" + widthAdjustment + "," + ((height / 2) + heightAdjustment) + ")rotate(-90)")
      .html(text);
  }

  appendSourceNode(svg: d3.Selection<any>, inputGroup: Array<number>, index: number, graphColor: Array<string>, yScale: any) {

    let yOffset = 0;
    let yBase = yScale(0);
    for (let i = 0; i < inputGroup.length; i++) {
      svg.append('rect')
        .attr('class', 'stacked-bar-node stacked-bar-node-' + index)
        .attr('id', 'node-' + index + '-' + i)
        .style('stroke-width', '0px')
        .style('fill', graphColor[i])
        .style('stroke', graphColor[i])
        .style('cursor', 'pointer')
        .style('margin-left', this.horizontalNodeMargin + 'px')
        .style('margin-right', this.horizontalNodeMargin + 'px')
        .attr('width', this.nodeWidth)
        .attr('x', this.horizontalNodeMargin + (this.nodeWidth + 2 * this.horizontalNodeMargin) * index)
        .attr('y', yScale(inputGroup[i]) - yOffset)
        .attr('height', function (d) {
          yOffset += (yScale(0) - yScale(inputGroup[i]));
          return yScale(0) - yScale(inputGroup[i]);
        });
    }

  }

  appendLegend(svg: d3.Selection<any>, width: number, height: number, graphColors: Array<string>, titles: Array<string>) {
    for (let i = 0; i < titles.length; i++) {
      svg.append('circle')
        .attr('class', 'stacked-bar-legend-item stacked-bar-legend-item-circle')
        .attr('r', 5)
        .style('fill', graphColors[i])
        .attr('cx', width + 10)
        .attr('cy', function (d) {
          return 5 + (15 * i);
        });
      svg.append('text')
        .attr('class', 'stacked-bar-legend-item stacked-bar-legend-item-text')
        .style('stroke', 'rgba(0,0,0,0)')
        .style('font-size', '10px')
        .text(titles[i])
        .attr('x', width + 20)
        .attr('y', function (d) {
          return 8 + (15 * i);
        });
    }
  }
}
