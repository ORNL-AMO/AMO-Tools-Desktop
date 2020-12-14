import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { PHAST } from '../../shared/models/phast/phast';
import * as _ from 'lodash';
import { SvgToPngService } from '../../shared/helper-services/svg-to-png.service';
import * as d3 from 'd3';
import { Settings } from '../../shared/models/settings';
import { SankeyService, FuelResults } from './sankey.service';
import { PhastValidService } from '../phast-valid.service';

var svg;
// use these values to alter label font position and size
const width = 2650,
  height = 1400,
  labelFontSize = 28,
  labelPadding = 4,
  reportFontSize = 34,
  reportPadding = 4,
  topLabelPositionY = 150,
  bottomLabelPositionY = 1250,
  topReportPositionY = 125,
  bottomReportPositionY = 1250,
  availableHeatX = 450,
  availableHeatY = 740,
  exothermicX = 1925,
  exothermicY = 945,
  exothermicLineX0 = 1925,
  exothermicLineY0 = 920,
  exothermicLineX1 = 2020,
  exothermicLineY1 = 830;


@Component({
  selector: 'app-sankey',
  templateUrl: 'sankey.component.html',
  styleUrls: ['sankey.component.css']
})

export class SankeyComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  location: string;
  @Input()
  printView: boolean;
  @Input()
  modIndex: number;
  @Input()
  assessmentName: string;

  //real version
  @ViewChild("ngChart", { static: false }) ngChart: ElementRef;
  @ViewChild("btnDownload", { static: false }) btnDownload: ElementRef;

  exportName: string;

  window: any;
  doc: any;
  // svg: any;
  graph: any;
  isBaseline: boolean;
  firstChange: boolean = true;
  baseSize: number = 300;
  minSize: number = 3;

  availableHeatPercent: { val: number, name: string, x: number, y: number };
  exothermicHeat: { val: number, name: string, x: number, y: number, units: string };
  usefulOutputY: number;


  constructor(private sankeyService: SankeyService, 
              private svgToPngService: SvgToPngService,
              private phastValidService: PhastValidService) {
  }

  ngOnInit() {
    this.phast.valid = this.phastValidService.checkValid(this.phast, this.settings);
    if (this.location !== "sankey-diagram") {
      // this.location = this.location + this.modIndex.toString();
      if (this.location === 'baseline') {
        this.location = this.assessmentName + '-baseline';
        this.isBaseline = true;
      }
      else {
        this.location = this.assessmentName + '-modification';
        this.isBaseline = false;
      }

      if (this.printView) {
        this.location = this.location + '-' + this.modIndex;
      }
      this.location = this.location.replace(/ /g, "");
      this.location = this.location.replace(/[\])}[{(]/g, '');
      this.location = this.location.replace(/#/g, "");
    }
  }

  ngAfterViewInit() {
    if (this.phast.losses) {
      if (this.phast.valid.isValid) {
        this.makeSankey();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.phast) {
      this.phast.valid = this.phastValidService.checkValid(this.phast, this.settings);
      if (!changes.phast.firstChange) {
        if (this.location !== "sankey-diagram") {
          if (this.isBaseline) {
            this.location = this.assessmentName + '-baseline';
          }
          else {
            this.location = this.assessmentName + '-modification';
          }
          this.location = this.location.replace(/ /g, "");
          this.location = this.location.replace(/[\])}[{(]/g, '');
          this.location = this.location.replace(/#/g, "");
        }
        if (this.phast.valid.isValid) {
          this.makeSankey();
        }
      }
    }
  }

  calcAvailableHeatPercent(results: FuelResults) {

    this.availableHeatPercent = {
      val: results.availableHeatPercent,
      x: availableHeatX,
      y: availableHeatY,
      name: "Available Heat"
    };
  }

  calculateExothermicPlacement() {

  }

  makeSankey() {
    let results = this.sankeyService.getFuelTotals(this.phast, this.settings);
    if (results.totalInput > 0) {
      this.calcAvailableHeatPercent(results);
      this.sankey(results);
    }
  }


  sankey(results: FuelResults) {
    // Remove  all Sankeys
    if (this.isBaseline && this.printView) { }
    else { d3.select('#' + this.location).selectAll('svg').remove(); }

    let availableHeat = [{
      val: this.availableHeatPercent.val,
      name: this.availableHeatPercent.name,
      x: this.availableHeatPercent.x,
      y: this.availableHeatPercent.y
    }];


    //create node linkes
    let links = new Array<any>();
    let i = 0;
    for (i; i < results.nodes.length - 2; ) {
      links.push({ source: i, target: i + 1 });
      if (i !== 0) {
        links.push({ source: i, target: i + 2 });
        i = i + 2;
      } else {
        i = i + 1;
      }
    }
    //extra push for output
    links.push({ source: i, target: i + 1 });


    if (this.printView) {
      svg = d3.select('#' + this.location).append('svg')
        .call(() => {
          this.calcSankey(results.nodes);
        })
        .attr("width", "100%")
        .attr("height", "80%")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMin")
        .append("g");
    }
    else {
      svg = d3.select('#' + this.location).append('svg')
        .call(() => {
          this.calcSankey(results.nodes);
        })
        .attr("width", "100%")
        .attr("height", "80%")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMin")
        .append("g");
    }


    this.drawFurnace();
    var color = this.findColor(results.nodes[0].value);
    this.makeGradient(color, results.nodes, links);

    let location = this.location;

    //arrows are created, positioned, and colored
    svg.selectAll('marker')
      .data(links)
      .enter().append('svg:marker')
      .attr('id', function (d) {
        return 'end-' + location + '-' + d.target;
      })
      .attr('orient', 'auto')
      .attr('refX', .1)
      .attr('refY', 0)
      .attr("viewBox", "0 -5 10 10")
      .attr("fill", (d) => {
        return color(results.nodes[d.target].value);
      })
      .append('svg:path')
      .attr("d", "M0,-2.5 L2,0 L0,2.5");

    // Draw links to the svg
    var link = svg.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(links)
      .enter().append('path')
      .attr("d", (d) => {
        return this.makeLinks(d, results.nodes);
      })
      .style("stroke", (d, i) => {
        return "url(#" + location + "-linear-gradient-" + i + ")";
      })
      .style("fill", "none")
      .style("stroke-width", (d) => {
        return results.nodes[d.target].displaySize;
      })
      .attr('marker-end', (d) => {
        return this.getEndMarker(d, results.nodes);
      });

    // Draw nodes to the svg
    var node = svg.selectAll('.node')
      .data(results.nodes)
      .enter()
      .append('g')
      .append("polygon")
      .attr('class', 'node');

    // Label Adjustment
    var nodes_text = svg.selectAll(".nodetext")
      .data(results.nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dx", (d) => {
        if (d.usefulOutput) {
          return d.x + 40;
        }
        if (d.input) {
          if (this.location === 'sankey-diagram') {
            return d.x - 140;
          }
          else if (this.location !== 'sankey-diagram') {
            return d.x - 135;
          }
          return d.x;
        }
        else {
          return d.x;
        }
      })
      .attr("dy", (d) => {
        if (d.input && d.name !== "Exothermic Heat") {
          if (this.location === 'sankey-diagram') {
            return d.y + (d.displaySize) + labelFontSize + labelPadding - 182;
          } else if (this.location !== 'sankey-diagram') {
            return d.y + (d.displaySize) + reportFontSize + reportPadding - 182;
          }
        }

        if (d.usefulOutput) {
          if (this.location === 'sankey-diagram') {
            return d.y + (d.displaySize + (d.displaySize * 0.25)) + labelFontSize + labelPadding;
          } else if (this.location !== 'sankey-diagram') {
            return d.y + (d.displaySize + (d.displaySize * 0.25)) + reportFontSize + reportPadding;
          }
        }
        if (d.top) {
          if (this.location === 'sankey-diagram') {
            return topLabelPositionY;
          } else if (this.location !== 'sankey-diagram') {
            return topReportPositionY;
          }
        }
        else {
          if (this.location === 'sankey-diagram') {
            return bottomLabelPositionY;
          }
          else if (this.location !== 'sankey-diagram') {
            return bottomReportPositionY;
          }
        }
      })
      .text((d) => {
        if (!d.inter) {
          return d.name;
        }
      })
      .style("font-size", (this.location === 'sankey-diagram') ? labelFontSize + "px" : reportFontSize + "px");

    let energyUnits;
    //append values and units
    nodes_text = svg.selectAll(".nodetext")
      .data(results.nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dx", (d) => {
        if (d.usefulOutput) {
          return d.x + 40;
        }
        if (d.input) {
          if (this.location === 'sankey-diagram') {
            return d.x - 140;
          }
          else if (this.location !== 'sankey-diagram') {
            return d.x - 135;
          }
          return d.x + 70;
        }
        else {
          return d.x;
        }
      })
      .attr("dy", (d) => {
        if (d.input && d.name !== "Exothermic Heat") {
          if (this.location === 'sankey-diagram') {
            return d.y + (d.displaySize) + (labelFontSize * 2) + (labelPadding * 2) - 182;
          } else if (this.location !== 'sankey-diagram') {
            return d.y + (d.displaySize) + (reportFontSize * 2) + (reportPadding * 2) - 182;
          }
        }
        if (d.usefulOutput) {
          if (this.location === 'sankey-diagram') {
            return d.y + (d.displaySize + (d.displaySize * 0.25)) + (labelFontSize * 2) + (labelPadding * 2);
          } else if (this.location !== 'sankey-diagram') {
            return d.y + (d.displaySize + (d.displaySize * 0.25)) + (reportFontSize * 2) + (reportPadding * 2);
          }
          return d.y + (d.displaySize) - 135;
        }
        if (d.top) {
          if (this.location === 'sankey-diagram') {
            return topLabelPositionY + labelFontSize + labelPadding;
          } else if (this.location !== 'sankey-diagram') {
            return topReportPositionY + reportFontSize + reportPadding;
          }
        }
        else {
          if (this.location === 'sankey-diagram') {
            return bottomLabelPositionY + labelFontSize + labelPadding;
          }
          else if (this.location !== 'sankey-diagram') {
            return bottomReportPositionY + reportFontSize + reportPadding;
          }
          return bottomLabelPositionY + labelFontSize + labelPadding;
        }
      })
      .text((d) => {
        if (!d.inter) {
          energyUnits = d.units;
          return d.value.toFixed(2) + " " + d.units;
        }
      })
      .style("font-size", (this.location === 'sankey-diagram') ? labelFontSize + "px" : reportFontSize + "px");

    //available heat label
    var availableHeatText = svg
      .data(availableHeat)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dx", function (d) {
        return d.x;
      })
      .attr("dy", function (d) {
        return d.y;
      })
      .text((d) => {
        return d.name;
      })
      .style("font-size", (this.location === 'sankey-diagram') ? labelFontSize + "px" : reportFontSize + "px")
      .attr("fill", "white");

    availableHeatText = svg
      .data(availableHeat)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dx", function (d) {
        return d.x;
      })
      .attr("dy", function (d) {
        if (this.location === 'sankey-diagram') {
          return d.y + labelFontSize + 1 + "px";
        }
        else {
          return d.y + reportFontSize + 1 + "px";
        }
      })
      .text((d) => {
        return Math.floor(d.val + 0.5) + "%";
      })
      .style("font-size", (this.location === 'sankey-diagram') ? labelFontSize + "px" : reportFontSize + "px")
      .attr("fill", "white");

    //fuel label
    let fuel;
    if ((this.sankeyService.getFuelEnergy() !== null && this.sankeyService.getFuelEnergy() !== undefined) || (this.sankeyService.getChemicalEnergy() !== null && this.sankeyService.getChemicalEnergy() !== undefined)) {

      if (this.sankeyService.getFuelEnergy() !== null && this.sankeyService.getFuelEnergy() !== undefined) {
        fuel = [{
          val: this.sankeyService.getFuelEnergy(),
          name: 'Fuel Energy',
          x: 145,
          y: 850,
          units: energyUnits
        }];
      }
      else {
        fuel = [{
          val: this.sankeyService.getChemicalEnergy(),
          name: 'Chemical Energy',
          x: 145,
          y: 850,
          units: energyUnits
        }];
      }


      var fuelDeliveredText = svg
        .data(fuel)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dx", function (d) {
          return d.x;
        })
        .attr("dy", function (d) {
          return d.y;
        })
        .text((d) => {
          return d.name;
        })
        .style("font-size", (this.location === 'sankey-diagram') ? labelFontSize + "px" : reportFontSize + "px")
        .attr("fill", "black");

      fuelDeliveredText = svg
        .data(fuel)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dx", function (d) {
          return d.x;
        })
        .attr("dy", function (d) {
          if (this.location === 'sankey-diagram') {
            return d.y + labelFontSize + 1 + "px";
          }
          else {
            return d.y + reportFontSize + 1 + "px";
          }
        })
        .text((d) => {
          return d.val.toFixed(2) + " " + d.units;
        })
        .style("font-size", (this.location === 'sankey-diagram') ? labelFontSize + "px" : reportFontSize + "px")
        .attr("fill", "black");
    }

    //electrical energy
    if (this.sankeyService.getElectricalEnergy() !== null && this.sankeyService.getElectricalEnergy() !== undefined) {
      let electrical = [{
        val: this.sankeyService.getElectricalEnergy(),
        name: 'Electrical Energy',
        x: 145,
        y: 950,
        units: energyUnits
      }];

      var electricalDeliveredText = svg
        .data(electrical)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dx", function (d) {
          return d.x;
        })
        .attr("dy", function (d) {
          return d.y;
        })
        .text((d) => {
          return d.name;
        })
        .style("font-size", (this.location === 'sankey-diagram') ? labelFontSize + "px" : reportFontSize + "px")
        .attr("fill", "black");

      electricalDeliveredText = svg
        .data(electrical)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dx", function (d) {
          return d.x;
        })
        .attr("dy", function (d) {
          if (this.location === 'sankey-diagram') {
            return d.y + labelFontSize + 1 + "px";
          }
          else {
            return d.y + reportFontSize + 1 + "px";
          }
        })
        .text((d) => {
          return d.val.toFixed(2) + " " + d.units;
        })
        .style("font-size", (this.location === 'sankey-diagram') ? labelFontSize + "px" : reportFontSize + "px")
        .attr("fill", "black");

    }


    var availableHeatText = svg
      .data(availableHeat)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dx", function (d) {
        return d.x;
      })
      .attr("dy", function (d) {
        return d.y;
      })
      .text((d) => {
        return d.name;
      })
      .style("font-size", (this.location === 'sankey-diagram') ? labelFontSize + "px" : reportFontSize + "px")
      .attr("fill", "white");


    //exothermic heat
    let tmpExothermicHeat = this.sankeyService.getExothermicHeat();
    if (tmpExothermicHeat !== 0 && tmpExothermicHeat !== null) {

      let exothermicXSpacing = this.sankeyService.getExothermicHeatSpacing() - 100;

      let exothermicHeat = [{
        val: Math.abs(tmpExothermicHeat),
        name: "Exothermic Heat",
        x: exothermicXSpacing,
        y: exothermicY,
        units: this.settings.energyResultUnit
      }];

      var exothermicHeatText = svg.data(exothermicHeat)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dx", function (d) {
          return d.x;
        })
        .attr("dy", function (d) {
          return d.y;
        })
        .text((d) => {
          return d.name;
        })
        .style("font-size", (this.location === 'sankey-diagram') ? labelFontSize + "px" : reportFontSize + "px")
        .attr("fill", "black");

      exothermicHeatText = svg.data(exothermicHeat)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dx", function (d) {
          return d.x;
        })
        .attr("dy", function (d) {
          if (this.location === 'sankey-diagram') {
            return d.y + labelFontSize + 1 + "px";
          }
          else {
            return d.y + reportFontSize + 1 + "px";
          }
        })
        .text((d) => {
          return d.val.toFixed(2) + " " + d.units;
        })
        .style("font-size", (this.location === 'sankey-diagram') ? labelFontSize + "px" : reportFontSize + "px")
        .attr("fill", "black");

      var exothermicLine = svg.append("line")
        .style("stroke", "black")
        .attr("x1", exothermicXSpacing)
        .attr("y1", exothermicLineY0)
        .attr("x2", exothermicXSpacing + 90)
        .attr("y2", this.usefulOutputY)
        .style("stroke-width", "1.5px");
    }
  }

  //positions elements
  calcSankey(nodes) {
    var alterVal = 0, change;
    nodes.forEach((d, i) => {

      d.y = (height / 2 - nodes[0].displaySize / 2);
      if (d.inter) {
        // Reset heightbn
        if (i === 1) {
          // First interNode
          d.value = nodes[i - 1].value;
          d.displaySize = this.calcDisplayValue(this.baseSize, d.value, nodes[0].value);
        }
        else {
          // Previous node.val - interNode.value
          d.value = (nodes[i - 2].value - nodes[i - 1].value);
          d.displaySize = this.calcDisplayValue(this.baseSize, d.value, nodes[0].value);

          if (d.top) {
            d.y = d.y + alterVal;
          }
          else {
            alterVal += (nodes[i - 2].displaySize - d.displaySize);
            d.y = (d.y + alterVal);
          }
        }
      }
      else {
        if (!d.input) {
          if (d.usefulOutput) {
            // d.value = (nodes[i - 2].value - nodes[i - 1].value);
            d.displaySize = this.calcDisplayValue(this.baseSize, d.value, nodes[0].value);

            //Since this is a static diagram this can be place, but if the final output is off take out the bellow code.
            alterVal -= d.displaySize;
            d.y += (d.displaySize + alterVal);
            this.usefulOutputY = d.y + d.displaySize;
          }
          else {
            if (d.top) {
              d.displaySize = this.calcDisplayValue(this.baseSize, d.value, nodes[0].value);
              d.y -= nodes[i - 1].displaySize - alterVal;
            }
            else {
              d.displaySize = this.calcDisplayValue(this.baseSize, d.value, nodes[0].value);
              d.y += (nodes[i - 1].displaySize * 2) + alterVal;
            }
          }
        }
        else if (d.name === 'Exothermic Heat') {
          // d.displaySize = this.calcDisplayValue(this.baseSize, d.value, nodes[0].value);
          d.displaySize = this.calcDisplayValue(this.baseSize, Math.abs(d.value), nodes[0].value);
          // d.y += (nodes[i - 1].displaySize * 2) + alterVal;

        }
      }
    });
    return nodes;
  }

  calcDisplayValue(baseSize, val, value) {
    return Math.max(baseSize * (val / value), this.minSize);
  }


  makeLinks(d, nodes) {

    var linkGen = d3.line()
      .curve(d3.curveMonotoneX);

    var points = [];
    if (nodes[d.source].input) {

      points.push([nodes[d.source].x, (nodes[d.target].y + (nodes[d.target].displaySize / 2))]);
      points.push([nodes[d.target].x, (nodes[d.target].y + (nodes[d.target].displaySize / 2))]);
    }

    // If it links up with an inter or usefulOutput then go strait tot the interNode
    else if (nodes[d.target].inter || nodes[d.target].usefulOutput) {
      points.push([(nodes[d.source].x - 5), (nodes[d.target].y + (nodes[d.target].displaySize / 2))]);
      points.push([nodes[d.target].x, (nodes[d.target].y + (nodes[d.target].displaySize / 2))]);
    }
    else {
      // Curved linkes
      if (nodes[d.target].top) {
        points.push([(nodes[d.source].x - 5), (nodes[d.source].y + (nodes[d.target].displaySize / 2))]);
        points.push([(nodes[d.source].x + 30), (nodes[d.source].y + (nodes[d.target].displaySize / 2))]);
        points.push([(nodes[d.target].x), (300)]);
      }
      else {
        points.push([(nodes[d.source].x - 5), ((nodes[d.source].y + nodes[d.source].displaySize) - (nodes[d.target].displaySize / 2))]);
        points.push([(nodes[d.source].x + 30), (((nodes[d.source].y + nodes[d.source].displaySize) - (nodes[d.target].displaySize / 2)))]);
        points.push([(nodes[d.target].x), (1100)]);
      }
    }

    return linkGen(points);
  };


  makeGradient(color, nodes, links) {

    let location = this.location;

    links.forEach(function (d, i) {
      var link_data = d;
      svg.append("linearGradient")
        .attr("id", function () {
          return location + "-linear-gradient-" + i;
        })
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", nodes[link_data.source].x)
        .attr("y1", function () {
          if (nodes[link_data.target].inter || nodes[link_data.target].usefulOutput) {
            return (nodes[link_data.target].y + (nodes[link_data.target].displaySize / 2));
          }
          else {
            if (nodes[link_data.target].top) {
              return nodes[link_data.source].y;
            }
            else {
              return (nodes[link_data.source].y + nodes[link_data.source].displaySize);
            }
          }
        })
        .attr("x2", nodes[link_data.target].x)
        .attr("y2", function () {
          if (nodes[link_data.target].inter || nodes[link_data.target].usefulOutput) {
            return (nodes[link_data.target].y + (nodes[link_data.target].displaySize / 2));
          }
          else {
            return nodes[link_data.target].y;
          }
        })
        .selectAll("stop")
        .data([
          { offset: "30%", color: color(nodes[link_data.source].value) },
          { offset: "76%", color: color(nodes[link_data.target].value) },
        ])
        .enter().append("stop")
        .attr("offset", function (d) {
          return d.offset;
        })
        .attr("stop-color", function (d) {
          return d.color;
        });
    });
  }


  getEndMarker(d, nodes) {
    let location = this.location;
    if (!nodes[d.target].inter || nodes[d.target].usefulOutput) {
      return "url(#end-" + location + "-" + d.target + ")";
    }
    else {
      return "";
    }
  }


  updateColors(nodes, links) {

    // make a new gradient
    var color = this.findColor(nodes[0].value);
    let location = this.location;

    nodes.forEach(function (d, i) {
      var node_data = d;
      if (!d.inter || d.usefulOutput) {
        this.svg.select("#end-" + location + "-" + i)
          .attr("fill", function () {
            return color(node_data.value);
          });
      }
    });

    links.forEach(function (d, i) {
      var link_data = d;
      let location = this.location;
      this.svg.select("#" + location + "-linear-gradient-" + i)
        .attr("x1", nodes[link_data.source].x)
        .attr("y1", function () {
          if (nodes[link_data.target].inter || nodes[link_data.target].usefulOutput) {
            return (nodes[link_data.target].y + (nodes[link_data.target].displaySize / 2));
          }
          else {
            if (nodes[link_data.target].top) {
              return nodes[link_data.source].y;
            }
            else {
              return (nodes[link_data.source].y + nodes[link_data.source].displaySize);
            }
          }
        })
        .attr("x2", nodes[link_data.target].x)
        .attr("y2", function () {
          if (nodes[link_data.target].inter || nodes[link_data.target].usefulOutput) {
            return (nodes[link_data.target].y + (nodes[link_data.target].displaySize / 2));
          }
          else {
            return nodes[link_data.target].y;
          }
        })
        .selectAll("stop")
        .data([
          { offset: "0%", color: color(nodes[link_data.source].value) },
          { offset: "76%", color: color(nodes[link_data.target].value) },
        ])
        .attr("offset", function (d) {
          return d.offset;
        })
        .attr("stop-color", function (d) {
          return d.color;
        });
    });
  }


  findColor(value) {
    return d3.scaleLinear()
      .domain([0, value])
      .range(["#ffa400", "#a71600"]);
  }


  changePlaceHolders(nodes) {
    svg.selectAll("input")
      .attr("value", function (d, i) {
        var format = d3.format(",");
        if (i === 8) {
          return format(nodes[15].value);
        }
        else {
          return format(nodes[i * 2].value);
        }
      })
      .each(function (d, i) {
        var format = d3.format(",");
        if (i === 8) {
          this.value = format(nodes[15].value);
        }
        else {
          this.value = format(nodes[i * 2].value);
        }
      });
    svg.selectAll("foreignObject")
      .data(nodes)
      .attr("x", function (d, i) {
        if (i === 8) {
          return nodes[15].x + (nodes[15].displaySize * .7) + 50;
        }
        else if (nodes[i * 2].input) {
          return nodes[i * 2].x - 120;
        }
        else {
          return nodes[i * 2].x - 50;
        }
      })
      .attr("y", function (d, i) {
        if (nodes[i].input) {
          return (nodes[i * 2].y + (nodes[i * 2].displaySize / 2)) + 10;
        }
        else if (i === 8) {
          return (nodes[15].y + (nodes[15].displaySize / 2)) + 10;
        }
        else {
          if (nodes[i * 2].top) {
            return nodes[i * 2].y - 80;
          }
          else {
            return nodes[i * 2].y + 80;
          }
        }
      });
  }


  changeAll(nodes, links, link, nodes_text, nodes_units) {

    nodes = this.calcSankey(nodes);
    this.updateColors(nodes, links);

    link
      .attr("d", (d) => {
        return this.makeLinks(d, nodes);
      })
      .style("stroke-width", (d) => {
        //returns a links width equal to the target's value
        return nodes[d.target].displaySize;
      })
      .attr("marker-end", (d) => {
        return this.getEndMarker(d, nodes);
      });
    link
      .style("stroke", (d, i) => {
        return "url(#linear-gradient-" + i + ")";
      });
    nodes_text
      .attr("dx", function (d) {
        if (d.input) {
          return d.x - 70;
        }
        else if (d.usefulOutput) {
          return d.x + (d.displaySize * .7);
        }
        else {
          return d.x;
        }
      })
      .attr("dy", function (d) {
        if (d.input || d.usefulOutput) {
          return d.y + (d.displaySize / 2);
        }
        else {
          if (d.top) {
            return d.y - 100;
          }
          else {
            return d.y + 60;
          }
        }
      });
    nodes_units
      .attr("dx", (d) => {
        if (d.input) {
          return d.x - 70;
        }
        else if (d.usefulOutput) {
          return d.x + (d.displaySize * .7);
        }
        else {
          return d.x;
        }
      })
      .attr("dy", function (d) {
        if (d.input || d.usefulOutput) {
          return d.y + (d.displaySize / 2) + 60;
        }
        else {
          if (d.top) {
            return d.y - 30;
          }
          else {
            return d.y + 130;
          }
        }
      });
    () => this.changePlaceHolders(nodes);
  }


  drawFurnace() {
    var furnace = svg.append("g")
      .append("polygon")
      .attr("points", function () {
        let xVentAnchor = 520;
        let xLeftSideShift = 60;
        let xRightSideShift = 120;
        return (xVentAnchor - 100 + xLeftSideShift) + "," + ((height / 2) - 500) + "," + (xVentAnchor - 150 + xLeftSideShift) + "," + ((height / 2) - 500) + "," + (xVentAnchor - 150 + xLeftSideShift) + "," + ((height / 2) - 350) + "," + (250 + xLeftSideShift) + "," + ((height / 2) - 350) + "," + (250 + xLeftSideShift) + "," + ((height / 2) + 350) + "," + (width - 500 + xRightSideShift) + "," + ((height / 2) + 350) + "," + (width - 500 + xRightSideShift) + "," + ((height / 2) - 350) + "," + (xVentAnchor + 150 + xLeftSideShift) + "," + ((height / 2) - 350) + "," + (xVentAnchor + 150 + xLeftSideShift) + "," + ((height / 2) - 500) + "," + (xVentAnchor + 100 + xLeftSideShift) + "," + ((height / 2) - 500) + "," + (xVentAnchor + 100 + xLeftSideShift) + "," + ((height / 2) - 300) + "," + ((width - 500) - 50 + xRightSideShift) + "," + ((height / 2) - 300) + "," + ((width - 500) - 50 + xRightSideShift) + "," + ((height / 2) + 300) + "," + (300 + xLeftSideShift) + "," + ((height / 2) + 300) + "," + (300 + xLeftSideShift) + "," + ((height / 2) - 300) + "," + (xVentAnchor - 100 + xLeftSideShift) + "," + ((height / 2) - 300) + "," + (xVentAnchor - 100 + xLeftSideShift) + "," + ((height / 2) - 500);
      })
      .style("fill", "#bae4ce")
      .style("stroke", "black");
  }


  downloadChart() {
    if (!this.exportName) {
      this.exportName = this.location + "-graph";
    }
    this.svgToPngService.exportPNG(this.ngChart, this.exportName);
  }
}
