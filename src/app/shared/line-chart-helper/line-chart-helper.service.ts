import { Injectable, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { repeat } from 'rxjs/operators';

@Injectable()
export class LineChartHelperService {

  dArray: Array<any>;

  constructor() { }

  setDArray(dArray: Array<any>): void {
    this.dArray = dArray;
  }

  getDArray(): Array<any> {
    return this.dArray;
  }

  // Use this service for basic d3 funtions to build a line chart.
  // Many features of a line chart will be specific to the chart in question, but this service aims
  // to come some of the general d3 functions out of the calculator components. Features such as
  // chart sizing, axis labels, ranges, exporting, and others will be implemented here while
  // data-specific functionality will reamin in individual calculator graph components.

  //removes all svg elements from given parent element
  clearSvg(ngChart: ElementRef): ElementRef {
    d3.select(ngChart.nativeElement).selectAll('.d3-tip').remove();
    d3.select(ngChart.nativeElement).selectAll('.tooltip-pointer').remove();
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


  appendRect(svg: d3.Selection<any>, width: number, height: number) {
    svg.append('rect')
      .attr("id", "graph")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "#F8F9F9")
      .style("filter", "url(#drop-shadow)");
    return svg;
  }


  setScale(scaleType: string, range: { min: number, max: number }, domain: { min: number, max: number }) {
    if (scaleType == 'linear') {
      return d3.scaleLinear()
        .range([range.min, range.max])
        .domain([domain.min, domain.max]);
    }
    else if (scaleType == 'log') {
      return d3.scaleLog()
        .range([range.min, range.max])
        .domain([domain.min, domain.max]);
    }
  }


  setXAxis(svg: d3.Selection<any>, scale: any, height: number, isGridToggled: boolean, ticks?: number, tickSizeInner?: number, tickSizeOuter?: number, tickPadding?: number, tickFormat?: any): d3.Selection<any> {
    let xAxis: d3.Selection<any>;
    let tickSize: number;
    if (isGridToggled) {
      tickSize = height * (-1);
    }
    else {
      tickSize = 0;
    }
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


  setYAxis(svg: d3.Selection<any>, scale: any, width: number, isGridToggled: boolean, ticks?: number, tickSizeInner?: number, tickSizeOuter?: number, tickPadding?: number, tickFormat?: any): d3.Selection<any> {
    let yAxis: d3.Selection<any>;
    let tickSize: number;
    if (isGridToggled) {
      tickSize = width * (-1);
    }
    else {
      tickSize = 0;
    }
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
      .tickFormat(tickFormat);
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


  appendLine(svg: d3.Selection<any>, stroke: string, strokeWidth: string, strokePattern?: string, strokePatternSettings?: string): d3.Selection<any> {
    let line: d3.Selection<any>;
    line = svg.append("path")
      .attr("class", "line")
      .style("stroke-width", strokeWidth)
      .style("fill", "none")
      .style("stroke", stroke)
      .style("display", "none")
      .style('pointer-events', 'none');
    if (strokePattern !== null && strokePatternSettings !== null) {
      line.attr(strokePattern, (strokePatternSettings));
    }
    return line;
  }

  drawLine(line: d3.Selection<any>, xScale: any, yScale: any, data: Array<any>): d3.Selection<any> {
    var currentLi = d3.line()
      .x(function (d) { return xScale(d.x); })
      .y(function (d) { return yScale(d.y); })
      .curve(d3.curveNatural);
    line.data([data])
      .attr("d", currentLi)
      .style("display", null);
    return line;
  }


  appendFocus(svg: d3.Selection<any>, id: string, r?: number, stroke?: string, strokeWidth?: string): d3.Selection<any> {
    if (!r) {
      r = 6;
    }
    if (!stroke) {
      stroke = "#000000";
    }
    if (!strokeWidth) {
      strokeWidth = "3px";
    }
    let focus: d3.Selection<any>;

    focus = svg.append("g")
      .attr('id', id)
      .attr("class", "focus")
      .style("display", "none")
      .style('pointer-events', 'none');
    focus.append("circle")
      .attr("r", r)
      .style("fill", "none")
      .style("stroke", stroke)
      .style("stroke-width", strokeWidth);

    return focus;
  }


  mouseOverDriver(svg: d3.Selection<any>,
    detailBox: d3.Selection<any>,
    detailBoxPointer: d3.Selection<any>,
    margin: { top: number, right: number, bottom: number, left: number },
    dArray: Array<any>,
    focusArray: Array<d3.Selection<any>>,
    dataArray: Array<Array<any>>,
    xScale: any,
    yScale: any,
    xFormat?: any,
    yFormat?: any,
    tooltipData?: Array<{ label: string, value: number, unit: string, formatX: boolean }>,
    width?: number,
    dMembers?: Array<string>) {

    let bisectDate = d3.bisector(function (d) { return d.x; }).left;

    svg.select("#graph")
      .on("mouseover", () => {
        for (let j = 0; j < dataArray.length; j++) {
          let focus = focusArray[j];
          focus
            .style("display", null)
            .style("opacity", 1)
            .style("pointer-events", "none");
        }
      })
      .on("mousemove", () => {
        for (let j = 0; j < dataArray.length; j++) {
          let focus = focusArray[j];
          let data = dataArray[j];
          focus
            .style("display", null)
            .style("opacity", 1)
            .style("pointer-events", "none");

          let x0 = xScale.invert(d3.mouse(d3.event.currentTarget)[0]);
          let i = bisectDate(data, x0, 1);
          if (i >= data.length) {
            i = data.length - 1;
          }
          let d0 = data[i - 1];
          let d1 = data[i];
          let dTemp = x0 - d0.x > d1.x - x0 ? d1 : d0;
          dArray[j] = dTemp;
          focusArray[j].attr("transform", "translate(" + xScale(dArray[j].x) + "," + yScale(dArray[j].y) + ")");
        }
        this.setDArray(dArray);
        if (tooltipData) {
          let iExclusions: number = 0;
          let dMemberCounter: number = 0;
          for (let j = 0; j < tooltipData.length; j++) {
            if (tooltipData[j].formatX === null) {
              let index = Math.max(0, (j - iExclusions));
              index = Math.min(index, dArray.length - 1);
              let tmpVal = dArray[index];
              let tmpMember = dMembers[dMemberCounter];
              tooltipData[j].value = xFormat(tmpVal[tmpMember]);
              dMemberCounter++;
            }
            else if (tooltipData[j].formatX) {
              // tooltipData[j].value = xFormat(dArray[0].x);
              tooltipData[j].value = xFormat(dArray[j].x);
              iExclusions++;
            }
            else {
              let index = Math.max(0, (j - iExclusions));
              index = Math.min(index, dArray.length - 1);
              tooltipData[j].value = yFormat(dArray[index].y);
            }
          }
          let detailLeft: number = Math.min((margin.left + xScale(dArray[0].x) - 125), width - 250);
          let detailTop: number;
          let pointerLeft: number = margin.left + xScale(dArray[0].x) - 10;
          let pointerTop: number;
          for (let j = 0; j < dArray.length; j++) {
            if (j == 0) {
              detailTop = yScale(dArray[j].y);
            }
            else if (detailTop < yScale(dArray[j].y)) {
              detailTop = yScale(dArray[j].y);
            }
          }
          pointerTop = detailTop + margin.top + 16;
          detailTop = detailTop + margin.top + 26;
          this.updateDetailBox(tooltipData, detailBox, detailLeft + "px", detailTop + "px");
          this.updateDetailBoxPointer(detailBoxPointer, pointerLeft + "px", pointerTop + "px");
        }
      })
      .on("mouseout", () => {
        for (let j = 0; j < dataArray.length; j++) {
          focusArray[j].transition()
            .delay(100)
            .duration(300)
            .style("opacity", 0);
        }
        this.hideDetailBox(detailBox);
        this.hideDetailBoxPointer(detailBoxPointer);
      });
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


  appendDetailBox(ngChart: ElementRef) {
    // d3.select("#detailBox").remove();
    let detailBox = d3.select(ngChart.nativeElement).append("div")
      .attr("id", "detailBox")
      .attr("class", "d3-tip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("padding", "10px")
      .style("font", "12px sans-serif")
      .style("width", "250px")
      .style("background", "#ffffff")
      .style("border", "0px")
      .style("box-shadow", "0px 0px 10px 2px grey")
      .style("pointer-events", "none");
    return detailBox;
  }

  appendDetailBoxPointer(ngChart: ElementRef) {
    let detailBoxPointer = d3.select(ngChart.nativeElement).append("div")
      .attr("id", "tooltipPointer")
      .attr("class", "tooltip-pointer")
      .html("<div></div>")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("width", "0px")
      .style("height", "0px")
      .style("border-left", "10px solid transparent")
      .style("border-right", "10px solid transparent")
      .style("border-bottom", "10px solid white")
      .style("pointer-events", "none");
    return detailBoxPointer;
  }

  updateDetailBox(tooltipData: Array<{ label: string, value: number, unit: string, formatX: boolean }>, detailBox: d3.Selection<any>, left: string, top: string) {
    detailBox.html('');
    let htmlString: string;
    for (let i = 0; i < tooltipData.length; i++) {
      if (i == 0) {
        htmlString = "<p>" + "<strong>";
      }
      htmlString = htmlString + "<div style='float:left; position: relative; top: -10px;'>"
        + tooltipData[i].label + ": </div><div style='float: right; position: relative; top: -10px;'>"
        + tooltipData[i].value + tooltipData[i].unit + "</div>";
      if (i < tooltipData.length - 1) {
        htmlString = htmlString + "<br>";
      }
      if (i == tooltipData.length - 1) {
        htmlString = htmlString + "</strong>" + "</p>";
      }
    }

    detailBox
      .style("left", left)
      .style("top", top)
      .html(htmlString)
      .transition()
      .style("opacity", 1);
  }

  updateDetailBoxPointer(detailBoxPointer: d3.Selection<any>, left: string, top: string) {
    detailBoxPointer
      .style("left", left)
      .style("top", top)
      .transition()
      .style("opacity", 1);
  }

  hideDetailBox(detailBox: d3.Selection<any>) {
    detailBox.transition()
      .delay(100)
      .duration(300)
      .style("opacity", 0);
  }

  hideDetailBoxPointer(detailBoxPointer: d3.Selection<any>) {
    detailBoxPointer.transition()
      .delay(100)
      .duration(300)
      .style("opacity", 0);
  }


  tableFocusHelper(svg: d3.Selection<any>, id: string, fill: string, stroke: string, transX: number, transY: number): d3.Selection<any> {
    let splitText = id.split('-', 2);
    let internalText = parseInt(splitText[splitText.length - 1]) + 1;


    let focus: d3.Selection<any> = svg.append("g")
      .attr("class", "tablePoint")
      .style("display", null)
      .style("opacity", 1)
      .style("pointer-events", "none");
    focus.append("circle")
      .attr("r", 6)
      .attr("id", id)
      .style("fill", fill)
      .style("stroke", stroke)
      .style("stroke-width", "3px")
      .style('pointer-events', 'none')
    focus.append("text")
      .attr('dx', -4)
      .attr('dy', -10)
      .text(internalText)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('stroke', '#000000')
      .style('fill', '#000000');

    focus.attr("transform", "translate(" + transX + "," + transY + ")");
    return focus;
  }

  tableHighlightPointHelper(svg: d3.Selection<any>, ids: Array<string>) {
    let highlightedPoint: d3.Selection<any>;
    for (let i = 0; i < ids.length; i++) {
      highlightedPoint = svg.select(ids[i])
        .attr('r', 8);
      repeat();
    }
    function repeat() {
      let tempXPos = (Math.random() * (2 - (0)) + (0)) - 1;
      let tempYPos = (Math.random() * (2 - (0)) + (0)) - 1;

      for (let i = 0; i < ids.length; i++) {
        highlightedPoint = svg.select(ids[i])
          .transition()
          .ease(d3.easeBounce)
          .duration(50)
          .attr("transform", "translate(" + tempXPos + "," + tempYPos + ")")
          .on('end', repeat);
      }
    }
  }

  tableUnhighlightPointHelper(svg: d3.Selection, ids: Array<string>) {
    for (let i = 0; i < ids.length; i++) {
      svg.select(ids[i]).interrupt().attr('r', 6);
    }
  }

}
