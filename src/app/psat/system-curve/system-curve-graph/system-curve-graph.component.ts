import { Component, OnInit, Input } from '@angular/core';

declare var d3: any;

var panelSVG, graphSVG;

const width = 500,
  height = 500;


@Component({
  selector: 'app-system-curve-graph',
  templateUrl: './system-curve-graph.component.html',
  styleUrls: ['./system-curve-graph.component.css']
})
export class SystemCurveGraphComponent implements OnInit {
  @Input()
  curveConstants: any;
  @Input()
  pointOne: any;
  @Input()
  pointTwo: any;
  @Input()
  staticHead: number;
  @Input()
  lossCoefficient: number;
  constructor() { }

  ngOnInit() {

    //Remove  all previous graphs
    d3.select('app-system-curve-graph').selectAll('svg').remove();


    panelSVG  = d3.select('app-system-curve-graph').append('svg')
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", "0 0 " + width + " " + height)
      .attr("preserveAspectRatio", "xMinYMin")
      .style("border", "1px solid black")
      .style("border", "1px solid black")
      .append("g");

    panelSVG.append('text')
      .attr("x", "50")
      .attr("y", "50")
      .attr("dy", "8px")
      .text("Loss Coefficient: " + this.lossCoefficient);

    panelSVG.append('text')
      .attr("x", "50")
      .attr("y", "80")
      .attr("dy", "8")
      .text("Static Head: " + this.staticHead);


  }

  updateInformation(){
        panelSVG.append('text')
      .attr("x", "50")
      .attr("y", "50")
      .attr("dy", "8px")
      .text("Loss Coefficient: " + this.lossCoefficient);

    panelSVG.append('text')
      .attr("x", "50")
      .attr("y", "80")
      .attr("dy", "8")
      .text("Static Head: " + this.staticHead);
  }

}
