import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { FSAT } from '../../shared/models/fans';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import * as d3 from 'd3';
import { FsatService } from '../fsat.service';


var svg;

// use these values to alter label font position and size
var width = 2650,
  height = 1400,
  labelFontSize = 28,
  labelPadding = 4,
  reportFontSize = 34,
  reportPadding = 4,
  topLabelPositionY = 150,
  bottomLabelPositionY = 1250,
  topReportPositionY = 125,
  bottomReportPositionY = 1250;

@Component({
  selector: 'app-fsat-sankey',
  templateUrl: './fsat-sankey.component.html',
  styleUrls: ['./fsat-sankey.component.css']
})
export class FsatSankeyComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  location: string;
  @Input()
  printView: boolean;
  @Input()
  modIndex: number;
  @Input()
  assessmentName: string;
  @Input()
  isBaseline: boolean;

  @ViewChild('ngChart') ngChart: ElementRef;
  width: number;
  height: number;

  firstChange: boolean = true;
  baseSize: number = 300;
  minSize: number = 3;

  title: string;
  unit: string;
  titlePlacement: string;

  energyInput: number;
  motorLosses: number;
  driveLosses: number;
  fanLosses: number;
  usefulOutput: number;

  constructor(private convertUnitsService: ConvertUnitsService, private fsatService: FsatService) { }

  ngOnInit() {
    if (this.location != "sankey-diagram" && this.location != "explore-opportunities-sankey") {
      // this.location = this.location + this.modIndex.toString();
      if (this.location == 'baseline') {
        this.location = this.assessmentName + '-baseline';
      }
      else {
        this.location = this.assessmentName + '-modification';
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
    this.getResults();
    this.sankey();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fsat) {
      if (!changes.fsat.firstChange) {
        if (this.location != "sankey-diagram") {
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
        this.getResults();
        this.sankey();
      }
    }
  }

  closeSankey() {
    // Remove Sankey
    d3.select('#' + this.location).selectAll('svg').remove();
  }

  getResults() {
    let energyInput: number, motorLoss: number, driveLoss: number, fanLoss: number, usefulOutput: number;
    let motorShaftPower: number, fanShaftPower: number;
    let resultType: string;

    if (this.fsat.name === undefined || this.fsat.name === null || this.fsat.name == 'Baseline') {
      resultType = 'existing';
    }
    else {
      resultType = 'modified';
    }
    let tmpOutput = this.fsatService.getResults(this.fsat, resultType, this.settings);

    if (this.settings.fanPowerMeasurement === 'hp') {
      motorShaftPower = this.convertUnitsService.value(tmpOutput.motorShaftPower).from('hp').to('kW');
      fanShaftPower = this.convertUnitsService.value(tmpOutput.fanShaftPower).from('hp').to('kW');

      energyInput = tmpOutput.motorPower;
      motorLoss = energyInput - this.convertUnitsService.value(tmpOutput.motorShaftPower).from('hp').to('kW');
      driveLoss = this.convertUnitsService.value(tmpOutput.motorShaftPower - tmpOutput.fanShaftPower).from('hp').to('kW');
      fanLoss = this.convertUnitsService.value(tmpOutput.fanShaftPower).from('hp').to('kW') * (1 - (tmpOutput.fanEfficiency / 100));
      usefulOutput = this.convertUnitsService.value(tmpOutput.fanShaftPower).from('hp').to('kW') * (tmpOutput.fanEfficiency / 100);
    }
    else {
      motorShaftPower = tmpOutput.motorShaftPower;
      fanShaftPower = tmpOutput.fanShaftPower;

      energyInput = tmpOutput.motorPower;
      motorLoss = tmpOutput.motorPower - tmpOutput.motorShaftPower;
      driveLoss = tmpOutput.motorShaftPower - tmpOutput.fanShaftPower;
      fanLoss = tmpOutput.fanShaftPower * (1 - (tmpOutput.fanEfficiency / 100));
      usefulOutput = tmpOutput.fanShaftPower * (tmpOutput.fanEfficiency / 100);
    }

    this.energyInput = energyInput;
    this.fanLosses = fanLoss;
    this.driveLosses = driveLoss;
    this.motorLosses = motorLoss;
    this.usefulOutput = usefulOutput;
  }



  sankey() {

    if (this.energyInput === undefined || this.energyInput === null) {
      return;
    }
    if (this.usefulOutput === undefined || this.energyInput === null) {
      return;
    }

    d3.select(this.ngChart.nativeElement).selectAll('svg').remove();

    if (this.location === 'explore-opportunities-sankey') {
      labelFontSize = 8,
        labelPadding = 10,
        topLabelPositionY = 40,
        bottomLabelPositionY = 1250,
        topReportPositionY = 125,
        bottomReportPositionY = 1250,
        width = 400,
        height = 300;
      this.width = 400;
      this.height = 300;
      this.baseSize = 50;
      svg = d3.select(this.ngChart.nativeElement).append('svg')
        .attr("viewBox", "0 0 400 300")
        .attr("preserveAspectRatio", "xMinYMin")
        .append("g");
    }
    else {
      width = 2650,
        height = 1400,
        labelFontSize = 28,
        labelPadding = 4,
        reportFontSize = 34,
        reportPadding = 4,
        topLabelPositionY = 150,
        bottomLabelPositionY = 1250,
        topReportPositionY = 125,
        bottomReportPositionY = 1250;
      this.width = width;
      this.height = height;
      this.baseSize = 300;
      svg = d3.select(this.ngChart.nativeElement).append('svg')
        .attr("width", "100%")
        .attr("height", "80%")
        .attr("viewBox", "0 0 " + this.width + " " + this.height)
        .attr("preserveAspectRatio", "xMinYMin")
        .append("g");
    }

    var nodes = [];
    nodes.push(
      /*0*/{
        name: "Energy Input",
        value: this.energyInput,
        displaySize: this.baseSize,
        width: 300,
        x: (this.width * .15),
        y: 0,
        input: true,
        output: false,
        inter: false,
        top: false
      },
      /*1*/{
        name: "inter1",
        value: 0,
        displaySize: 0,
        width: 0,
        x: (this.width * .20),
        y: 0,
        input: false,
        output: false,
        inter: true,
        top: true
      },
      /*2*/{
        name: "Motor Losses",
        value: this.motorLosses,
        displaySize: 0,
        width: 0,
        x: (this.width * .40),
        y: 0,
        input: false,
        output: false,
        inter: false,
        top: true
      });


    if (this.driveLosses > 0) {
      nodes.push(/*3*/{
        name: "inter2",
        value: 0,
        displaySize: 0,
        width: 0,
        x: (this.width * .35),
        y: 0,
        input: false,
        output: false,
        inter: true,
        top: false
      },
        /*4*/{
          name: "Drive Losses",
          value: this.driveLosses,
          displaySize: 0,
          width: 0,
          x: (this.width * .55),
          y: 0,
          input: false,
          output: false,
          inter: false,
          top: true
        });
    }

    nodes.push(
      /*5*/{
        name: "inter3",
        value: 0,
        displaySize: 0,
        width: 0,
        x: (this.width * .50),
        y: 0,
        input: false,
        output: false,
        inter: true,
        top: false
      },
      /*6*/{
        name: "Fan Losses",
        value: this.fanLosses,
        displaySize: 0,
        width: 0,
        x: (this.width * .70),
        y: 0,
        input: false,
        output: false,
        inter: false,
        top: true
      },
      /*7*/{
        name: "Useful Output",
        value: 0,
        displaySize: 0,
        width: 0,
        x: (this.width * .80),
        y: 0,
        input: false,
        output: true,
        inter: false,
        top: false
      });


    var links = [];
    links.push(
      // linking to the first interNode
      { source: 0, target: 1 },

      { source: 1, target: 2 },
      { source: 1, target: 3 });


    if (this.driveLosses > 0) {
      links.push(
        { source: 3, target: 4 },
        { source: 3, target: 5 },

        // interNode3 to Other and interNode4
        { source: 5, target: 6 },
        { source: 5, target: 7 })
    }
    else {
      links.push(
        // interNode3 to Other and interNode4
        { source: 3, target: 4 },
        { source: 3, target: 5 });
    }

    svg.call(() => {
      this.calcSankey(nodes);
    });

    var color = this.findColor(nodes[0].value);

    this.makeGradient(color, nodes, links);
    let location = this.location;

    svg.selectAll('marker')
      .data(links)
      .enter().append('svg:marker')
      .attr('id', function (d) {
        return 'fsat-end-' + location + '-' + d.target;
      })
      .attr('orient', 'auto')
      .attr('refX', .1)
      .attr('refY', 0)
      .attr("viewBox", "0 -5 10 10")
      .style("border", "1px solid black")
      .attr("fill", (d) => {
        return color(nodes[d.target].value);
      })
      .append('svg:path')
      .attr("d", "M0,-2.5L2,0L0,2.5");

    // Draw links to the svg
    var link = svg.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(links)
      .enter().append('path')
      .attr("d", (d) => {
        return this.makeLinks(d, nodes);
      })
      .style("stroke", (d, i) => {
        return "url(" + window.location + "#fsat-" + location + "-linear-gradient-" + i + ")";
      })
      .style("fill", "none")
      .style("stroke-width", (d) => {
        return nodes[d.target].displaySize;
      })
      .attr('marker-end', (d) => {
        return this.getEndMarker(d, nodes);
      });

    // Draw nodes to the svg
    var node = svg.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .append("polygon")
      .attr('class', 'node');


    if (this.location === 'explore-opportunities-sankey') {
      var nodes_text = svg.selectAll(".nodetext")
        .data(nodes)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dx", function (d) {
          if (d.input) {
            return d.x - 30;
          }
          else if (d.output) {
            return d.x + (d.displaySize * .7) + 24;
          }
          else {
            return d.x;
          }
        })
        .attr("dy", function (d) {
          if (d.input || d.output) {
            return d.y + (d.displaySize);
          }
          else {
            if (d.top) {
              return topLabelPositionY;
            }
            else {
              return topLabelPositionY;
            }
          }
        })
        .text(function (d) {
          if (!d.inter) {
            return d.name;
          }
        })
        .style("font-size", labelFontSize + "px");

      var twoDecimalFormat = d3.format(".3");

      var nodes_value = svg.selectAll(".nodetext")
        .data(nodes)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dx", function (d) {
          if (d.input) {
            return d.x - 30;
          }
          else if (d.output) {
            return d.x + (d.displaySize * .7) + 24;
          }
          else {
            return d.x;
          }
        })
        .attr("dy", function (d) {
          if (d.input || d.output) {
            return d.y + (d.displaySize) + labelPadding;
          }
          else if (d.top) {
            return topLabelPositionY + labelPadding;
          }
          else {
            return topLabelPositionY + labelPadding;
          }
        })
        .text(function (d) {
          if (!d.inter) {
            return twoDecimalFormat(d.value) + " kW";
          }
        })
        .style("font-size", labelFontSize + "px");
    }
    else {
      var nodes_text = svg.selectAll(".nodetext")
        .data(nodes)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dx", function (d) {
          if (d.input) {
            return d.x - 150;
          }
          else if (d.output) {
            return d.x + 200;
          }
          else {
            return d.x;
          }
        })
        .attr("dy", function (d) {
          if (d.input || d.output) {
            if (this.location === 'sankey-diagram') {
              return d.y + (d.displaySize) + labelFontSize + labelPadding - 170;
            }
            else {
              return d.y + (d.displaySize) + reportFontSize + reportPadding - 170;
            }
          }
          else {
            if (d.top) {
              if (this.location === 'sankey-diagram') {
                return topLabelPositionY;
              }
              else {
                return topReportPositionY;
              }
            }
            else {
              if (this.location === 'sankey-diagram') {
                return bottomLabelPositionY;
              }
              else {
                return bottomReportPositionY;
              }
            }
          }
        })
        .text(function (d) {
          if (!d.inter) {
            return d.name;
          }
        })
        .style("font-size", (this.location === 'sankey-diagram') ? labelFontSize + "px" : reportFontSize + "px");

      var twoDecimalFormat = d3.format(".3");

      var nodes_value = svg.selectAll(".nodetext")
        .data(nodes)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dx", function (d) {
          if (d.input) {
            return d.x - 150;
          }
          else if (d.output) {
            return d.x + 200;
          }
          else {
            return d.x;
          }
        })
        .attr("dy", function (d) {
          if (d.input || d.output) {
            if (this.location === 'sankey-diagram') {
              return d.y + (d.displaySize) + (labelFontSize * 2) + (labelPadding * 2) - 170;
            }
            else {
              return d.y + (d.displaySize) + (reportFontSize * 2) + (reportPadding * 2) - 170;
            }
          }
          else if (d.top) {
            if (this.location === 'sankey-diagram') {
              return topLabelPositionY + labelFontSize + labelPadding;
            }
            else {
              return topReportPositionY + reportFontSize + reportPadding;
            }
          }
          else {
            if (this.location === 'sankey-diagram') {
              return bottomLabelPositionY + labelFontSize + labelPadding;
            }
            else {
              return bottomReportPositionY + reportFontSize + reportPadding;
            }
          }
        })
        .text(function (d) {
          if (!d.inter) {
            return twoDecimalFormat(d.value) + " kW";
          }
        })
        .style("font-size", (this.location === 'sankey-diagram') ? labelFontSize + "px" : reportFontSize + "px");
    }
  }



  calcSankey(nodes) {

    var alterVal = 0, change;
    nodes.forEach((d, i) => {
      d.y = (this.height / 2 - nodes[0].displaySize / 2);
      if (d.inter) {
        // Reset height
        if (i == 1) {
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
          if (d.output) {
            if (d.top) {
              d.value = (nodes[i - 2].value - nodes[i - 1].value);
              d.displaySize = this.calcDisplayValue(this.baseSize, d.value, nodes[0].value);
              d.y = d.y + alterVal;
            }
            else {
              d.value = (nodes[i - 2].value - nodes[i - 1].value);
              d.displaySize = this.calcDisplayValue(this.baseSize, d.value, nodes[0].value);
              d.y = d.y + alterVal + nodes[i - 1].displaySize;
            }
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
    // If it links up with an inter or output then go strait tot the interNode
    else if (nodes[d.target].inter || nodes[d.target].output) {
      points.push([(nodes[d.source].x - 5), (nodes[d.target].y + (nodes[d.target].displaySize / 2))]);
      points.push([nodes[d.target].x, (nodes[d.target].y + (nodes[d.target].displaySize / 2))]);
    }
    else {
      // Curved linkes
      if (nodes[d.target].top) {
        points.push([(nodes[d.source].x - 5), (nodes[d.source].y + (nodes[d.target].displaySize / 2))]);
        points.push([(nodes[d.source].x + 30), (nodes[d.source].y + (nodes[d.target].displaySize / 2))]);
        points.push([(nodes[d.target].x), (nodes[d.target].y + (nodes[d.target].displaySize / 2))]);
      }
      else {
        points.push([(nodes[d.source].x - 5), ((nodes[d.source].y + nodes[d.source].displaySize) - (nodes[d.target].displaySize / 2))]);
        points.push([(nodes[d.source].x + 30), (((nodes[d.source].y + nodes[d.source].displaySize) - (nodes[d.target].displaySize / 2)))]);
        points.push([(nodes[d.target].x), (nodes[d.target].y - (nodes[d.target].displaySize / 2))]);
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
          return "fsat-" + location + "-linear-gradient-" + i;
        })
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", nodes[link_data.source].x)
        .attr("y1", function () {
          if (nodes[link_data.target].inter || nodes[link_data.target].output) {
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
          if (nodes[link_data.target].inter || nodes[link_data.target].output) {
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
    if (!nodes[d.target].inter || nodes[d.target].output) {
      return "url(" + window.location + "#fsat-end-" + location + "-" + d.target + ")";
    }
    else {
      return "";
    }
  }

  updateColors(nodes, links) {

    // make a new gradient
    let location = this.location;
    var color = this.findColor(nodes[0].value);

    nodes.forEach(function (d, i) {
      var node_data = d;
      if (!d.inter || d.output) {
        svg.select("#fsat-end-" + location + "-" + i)
          .attr("fill", function () {
            return color(node_data.value);
          })
      }
    });

    links.forEach(function (d, i) {
      var link_data = d;
      svg.select("#fsat-" + location + "-linear-gradient-" + i)
        .attr("x1", nodes[link_data.source].x)
        .attr("y1", function () {
          if (nodes[link_data.target].inter || nodes[link_data.target].output) {
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
          if (nodes[link_data.target].inter || nodes[link_data.target].output) {
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
      .range(["#FFED5C", "#D1BB00"]);
  }

  finalOutputColor(value) {
    return d3.scaleLinear()
      .domain([0, value])
      .range(["#FFED5C", "#D1BB00"]);
  }


  changePlaceHolders(nodes) {
    svg.selectAll("input")
      .attr("value", function (d, i) {
        var format = d3.format(",");
        if (i == 8) {
          return format(nodes[15].value);
        }
        else {
          return format(nodes[i * 2].value);
        }
      })
      .each(function (d, i) {
        var format = d3.format(",");
        if (i == 8) {
          this.value = format(nodes[15].value);
        }
        else {
          this.value = format(nodes[i * 2].value);
        }
      });
    svg.selectAll("foreignObject")
      .data(nodes)
      .attr("x", function (d, i) {
        if (i == 8) {
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
        else if (i == 8) {
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
        return "url(" + window.location + "#fsat-linear-gradient-" + i + ")"
      });
    nodes_text
      .attr("dx", function (d) {
        if (d.input) {
          return d.x - 70;
        }
        else if (d.output) {
          return d.x + (d.displaySize * .7) + 100;
        }
        else {
          return d.x;
        }
      })
      .attr("dy", function (d) {
        if (d.input || d.output) {
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
        else if (d.output) {
          return d.x + (d.displaySize * .7) + 100;
        }
        else {
          return d.x;
        }
      })
      .attr("dy", function (d) {
        if (d.input || d.output) {
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

}
