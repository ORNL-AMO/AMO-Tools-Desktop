import { Component, OnInit, ViewChild, ElementRef, Input, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-animated-checkmark',
  templateUrl: './animated-checkmark.component.html',
  styleUrls: ['./animated-checkmark.component.css']
})
export class AnimatedCheckmarkComponent implements OnInit {
  @Input()
  active: boolean;
  @Input()
  inactiveBorderColor: string;
  @Input()
  activeBorderColor: string;
  @Input()
  inactiveFillColor: string;
  @Input()
  activeFillColor: string;
  @Input()
  checkMarkColor: string;
  @Input()
  svgContainerWidth: number;
  svgContainerHeight: number;
  @ViewChild('checkMarkContainer') checkMarkContainer: ElementRef;

  htmlElement: any;
  radius: number;
  host: d3.Selection<any>;
  svg: d3.Selection<any>;
  circle: any;
  // checkMark: any;

  shortLine: any;
  longLine: any;

  animationTime: number;


  constructor() { }

  ngOnInit() {
    this.animationTime = 350;
    this.initColors();
    this.setupSvg();
    this.initCircles();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.active && !changes.active.firstChange) {
      if (this.svg === undefined) {
        this.setupSvg();
        this.initCircles();
      }
      else {
        this.updateCheckMark();
      }
    }
  }

  initColors(): void {
    if (this.inactiveBorderColor === undefined) {
      this.inactiveBorderColor = "#888";
    }
    if (this.activeBorderColor === undefined) {
      this.activeBorderColor = "#00B52D";
    }
    if (this.inactiveFillColor === undefined) {
      this.inactiveFillColor = "#fff";
    }
    if (this.activeFillColor === undefined) {
      this.activeFillColor = "#00B52D";
    }
    if (this.checkMarkColor === undefined) {
      this.checkMarkColor = "#fff";
    }
  }


  setupSvg(): void {
    this.htmlElement = this.checkMarkContainer.nativeElement;
    this.host = d3.select(this.htmlElement);
    this.host.html('');
    this.svgContainerHeight = 30;
    if (this.svgContainerWidth === undefined) {
      this.svgContainerWidth = this.svgContainerHeight;
    }

    this.radius = Math.min(this.svgContainerHeight, this.svgContainerWidth) / 2;
  }

  initCircles(): void {
    let r = this.radius;
    let height = this.svgContainerHeight;
    let width = this.svgContainerWidth;
    let active = this.active;
    let inactiveBorderColor = this.inactiveBorderColor;
    let activeBorderColor = this.activeBorderColor;
    let inactiveFillColor = this.inactiveFillColor;
    let activeFillColor = this.activeFillColor;

    this.svg = this.host.append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr("viewBox", "0 0 " + width + " " + height)
      .attr("preserveAspectRatio", "xMinYMin");

    this.circle = this.svg.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', r - 2)
      .style('stroke-width', 2)
      .style('stroke', inactiveBorderColor)
      .style('fill', inactiveFillColor);

    this.shortLine = this.svg.append('line')
      .attr('stroke-width', 3)
      .attr('stroke', '#fff')
      .attr('x1', r * 0.33)
      .attr('y1', r)
      .attr('x2', r * 0.33)
      .attr('y2', r);

    this.longLine = this.svg.append('line')
      .attr('stroke-width', 3)
      .attr('stroke', '#fff')
      .attr('x1', r * 0.767)
      .attr('y1', r * 1.5)
      .attr('x2', r * 0.767)
      .attr('y2', r * 1.5);
  }

  updateCheckMark(): void {
    if (this.svg === undefined || this.circle === undefined) {
      return;
    }

    if (this.active) {
      this.addCheckMark();
    }
    else {
      this.removeCheckMark();
    }
  }


  addCheckMark(): void {
    if (this.svg === undefined) {
      return;
    }
    if (this.circle === undefined) {
      return;
    }

    let radius = this.radius;

    this.circle.transition()
      .duration(this.animationTime)
      .style('fill', this.activeFillColor)
      .style('stroke', this.activeFillColor);


    this.shortLine.transition()
      .duration(this.animationTime)
      .attr('x2', radius * 0.8)
      .attr('y2', radius * 1.5);

    this.longLine.transition()
      .duration(this.animationTime)
      .attr('x2', radius * 1.633)
      .attr('y2', radius * .533);

  }

  removeCheckMark(): void {
    if (this.svg === undefined) {
      return;
    }
    let r = this.radius;

    this.circle.transition()
      .duration(this.animationTime)
      .style('fill', this.inactiveFillColor)
      .style('stroke', this.inactiveBorderColor);

    this.shortLine.transition()
      .duration(this.animationTime)
      .attr('x2', r * 0.33)
      .attr('y2', r);

    this.longLine.transition()
      .duration(this.animationTime)
      .attr('x2', r * 0.767)
      .attr('y2', r * 1.5);
  }

}
