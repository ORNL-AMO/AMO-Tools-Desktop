import { Injectable, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Injectable()
export class WaterfallGraphService {
  legendHeight: number;
  verticalNodeMargin: number;
  nodeHeight: number;
  format: any;

  constructor() { }

  setNodeHeight(input: WaterfallInput, containerHeight: number) {
    // 10% of graph dedicated to spacing between waterfall nodes
    this.verticalNodeMargin = (containerHeight * 0.1) / (input.inputObjects.length * 2);
    this.legendHeight = (containerHeight * 0.1);
    this.nodeHeight = (containerHeight - this.legendHeight - (containerHeight * 0.1)) / input.inputObjects.length;
  }

  setFormat() {
    this.format = d3.format(',.2f');
  }

  getDomain(input1: WaterfallInput, input2?: WaterfallInput): number {
    let max = 0;
    for (let i = 0; i < input1.inputObjects.length; i++) {
      max = input1.inputObjects[i].isStartValue ? input1.inputObjects[i].value : max;
    }
    if (input2 !== undefined && input2 !== null) {
      for (let i = 0; i < input2.inputObjects.length; i++) {
        let tmpMax = input2.inputObjects[i].isStartValue ? input2.inputObjects[i].value : max;
        if (tmpMax > max) {
          max = tmpMax;
        }
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
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  }

  setScale(range: { min: number, max: number }, domain: { min: number, max: number }) {
    return d3.scaleLinear()
      .range([range.min, range.max])
      .domain([domain.min, domain.max]);
  }

  addMinMaxLines(svg: d3.Selection<any>, width: number, height: number, domain: { min: number, max: number }, xScale: any) {
    svg.append('line')
      .attr('class', 'waterfall-line waterfall-min-line')
      .attr('x1', (width * 0.25) + xScale(domain.min))
      .attr('y1', this.legendHeight)
      .attr('x2', (width * 0.25) + xScale(domain.min))
      .attr('y2', height - this.verticalNodeMargin)
      .attr('stroke', 'rgba(0,0,0,0.5)')
      .attr('stroke-width', '1px')
      .style('stroke-dasharray', '5,5');

    svg.append('line')
      .attr('class', 'waterfall-line waterfall-max-line')
      .attr('x1', (width * 0.25) + xScale(domain.max))
      .attr('y1', this.legendHeight)
      .attr('x2', (width * 0.25) + xScale(domain.max))
      .attr('y2', height - this.verticalNodeMargin)
      .attr('stroke', 'rgba(0,0,0,0.5)')
      .attr('stroke-width', '1px')
      .style('stroke-dasharray', '5,5');

    svg.append('text')
      .attr('class', 'waterfall-line-label')
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .attr('x', (width * 0.25) + xScale(domain.min))
      .attr('y', this.legendHeight - this.verticalNodeMargin)
      .text(this.format(domain.min));
    svg.append('text')
      .attr('class', 'waterfall-line-label')
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .attr('x', (width * 0.25) + xScale(domain.max))
      .attr('y', this.legendHeight - this.verticalNodeMargin)
      .text(this.format(domain.max));
  }

  appendLegend(svg: d3.Selection<any>, width: number, waterfallInput1: WaterfallInput, waterfallInput2?: WaterfallInput) {
    svg.append('text')
      .attr('class', 'waterfall-node-label-title waterfall-primary')
      .style('font-size', '16px')
      .style('cursor', 'pointer')
      .style('font-weight', 'bold')
      .attr('x', 10)
      .attr('y', this.legendHeight / 2)
      .text(waterfallInput1.name);

    if (waterfallInput2 !== undefined && waterfallInput2 !== null) {
      svg.append('text')
        .attr('class', 'waterfall-node-label-title waterfall-secondary')
        .style('font-size', '16px')
        .style('cursor', 'pointer')
        .style('font-weight', 'bold')
        .style('text-anchor', 'end')
        .attr('x', width - 10)
        .attr('y', this.legendHeight / 2)
        .text(waterfallInput2.name);
    }
  }

  appendSourceNode(svg: d3.Selection<any>, waterfallInput: WaterfallInput, width: number, height: number, xScale: any, index: number, maxValue: number, xOffset: number, isPrimary: boolean) {
    let tmpWaterfallItem = waterfallInput.inputObjects[index];
    let tmpNodeColor: string;
    if (tmpWaterfallItem.isStartValue) {
      tmpNodeColor = waterfallInput.startColor;
    }
    else {
      tmpNodeColor = tmpWaterfallItem.isNetValue ? waterfallInput.netColor : waterfallInput.lossColor;
    }
    svg.append('rect')
      .attr('class', 'waterfall-node waterfall-' + (isPrimary ? 'primary' : 'secondary'))
      .attr('id', 'node-' + waterfallInput.name + '-' + index)
      .style('stroke-width', '0.5px')
      .style('fill', tmpNodeColor)
      .style('stroke', isPrimary ? '#333' : tmpNodeColor)
      .style('stroke-width', isPrimary ? '1px' : '0px')
      .style('cursor', 'pointer')
      .style('opacity', 0.5)
      .style('margin-top', this.verticalNodeMargin + 'px')
      .style('margin-bottom', this.verticalNodeMargin + 'px')
      .attr('width', function (d) {
        return xScale(tmpWaterfallItem.value);
      })
      .attr('height', this.nodeHeight)
      .attr('x', (width * 0.25) + xScale(maxValue - tmpWaterfallItem.value - xOffset))
      // .attr('y', 0)
      // .transition()
      // .duration(500)
      .attr('y', this.legendHeight + (this.nodeHeight + 2 * this.verticalNodeMargin) * index);

    svg.append('text')
      .attr('class', 'waterfall-node-label waterfall-' + (isPrimary ? 'primary' : 'secondary'))
      .style('cursor', 'pointer')
      .style('font-size', '14px')
      .style('text-anchor', isPrimary ? 'start' : 'end')
      .attr('x', function (d) {
        return isPrimary ? 10 : width - 10;
      })
      .attr('y', this.legendHeight + (this.nodeHeight + 2 * this.verticalNodeMargin) * index + (this.verticalNodeMargin + this.nodeHeight / 2))
      .text(tmpWaterfallItem.label + ': ' + (tmpWaterfallItem.isNetValue || tmpWaterfallItem.isStartValue ? '' : '-') + this.format(tmpWaterfallItem.value) + ' ' + waterfallInput.units);
  }

  addHoverEvent() {
    d3.selectAll('.waterfall-primary, .waterfall-secondary')
      .on('mouseover', null)
      .on('mouseout', null);
    d3.selectAll('.waterfall-primary')
      .on('mouseover', function (d) {
        d3.selectAll('.waterfall-primary')
          .transition()
          .duration(200)
          .style('opacity', 1.0);
        d3.selectAll('.waterfall-secondary')
          .transition()
          .duration(200)
          .style('opacity', 0.05);
        d3.selectAll('.waterfall-node-label-title.waterfall-primary')
          .style('text-decoration', 'underline');
      })
      .on('mouseout', function (d) {
        d3.selectAll('.waterfall-primary, .waterfall-secondary')
          .transition()
          .duration(200)
          .style('opacity', 0.5);
        d3.selectAll('.waterfall-node-label-title')
          .style('text-decoration', 'none');
      });

    d3.selectAll('.waterfall-secondary')
      .on('mouseover', function (d) {
        d3.selectAll('.waterfall-secondary')
          .transition()
          .duration(200)
          .style('opacity', 1.0);
        d3.selectAll('.waterfall-primary')
          .transition()
          .duration(200)
          .style('opacity', 0.05);
        d3.selectAll('.waterfall-node-label-title.waterfall-secondary')
          .style('text-decoration', 'underline');
      })
      .on('mouseout', function (d) {
        d3.selectAll('.waterfall-primary, .waterfall-secondary')
          .transition()
          .duration(200)
          .style('opacity', 0.5);
        d3.selectAll('.waterfall-node-label-title')
          .style('text-decoration', 'none');
      });
  }

  styleForNoComparison() {
    d3.selectAll('.waterfall-primary')
      .style('opacity', 1.0);
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
  units: string,
  startColor: string,
  lossColor: string,
  netColor: string
}