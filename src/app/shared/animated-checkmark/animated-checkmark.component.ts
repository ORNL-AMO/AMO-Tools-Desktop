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



  constructor() { }

  ngOnInit() {
    this.initColors();
    this.setupSvg();
    this.drawCheckMark();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.active && !changes.active.firstChange) {
      console.log("check mark toggle");
      if (this.svg === undefined) {
        console.log('this.svg is undefined');
        this.setupSvg();
        this.drawCheckMark();
      }
      else {
        this.updateCheckMark();
      }
    }
  }

  initColors(): void {
    if (this.inactiveBorderColor === undefined) {
      console.log("inactiveBorderColor undefined");
      this.inactiveBorderColor = "#888";
    }
    if (this.activeBorderColor === undefined) {
      this.activeBorderColor = "#04C935";
    }
    if (this.inactiveFillColor === undefined) {
      this.inactiveFillColor = "#fff";
    }
    if (this.activeFillColor === undefined) {
      this.activeFillColor = "#04C935";
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

  drawCheckMark(): void {
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
    // .append('g')
    // .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');


    let circle = this.svg.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', r - 2)
      .style('stroke-width', 2)
      .style('stroke', inactiveBorderColor)
      .style('fill', inactiveFillColor);
  }

  updateCheckMark(): void {
    console.log("updating check mark");
  }

}
