import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Losses, PHAST } from '../../shared/models/phast/phast';
import * as _ from 'lodash';
import { PhastService } from '../phast.service';
// declare var d3: any;
import * as d3 from 'd3';
var svg;
import { Settings } from '../../shared/models/settings';
import { SankeyService, FuelResults } from './sankey.service';

// use these values to alter label font position and size
const width = 2650,
  height = 1400,
  labelFontSize = 28,
  labelPadding = 4,
  reportFontSize = 30,
  reportPadding = 4,
  topLabelPositionY = 150,
  bottomLabelPositionY = 1250,
  topReportPositionY = 125,
  bottomReportPositionY = 1250;


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

  firstChange: boolean = true;
  baseSize: number = 300;
  minSize: number = 3;

  constructor(private phastService: PhastService, private sankeyService: SankeyService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.phast.losses) {
      this.makeSankey();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.phast) {
      if (!changes.phast.firstChange) {
        this.makeSankey();
      }
    }
  }

  makeSankey() {
    let results = this.sankeyService.getFuelTotals(this.phast, this.settings);
    if (results.totalInput > 0) {
      this.sankey(results);
    }
  }

  sankey(results: FuelResults) {
    // Remove  all Sankeys
    d3.select('#' + this.location).selectAll('svg').remove();

    //create node linkes
    let links = new Array<any>();
    let i = 0;
    for (i; i < results.nodes.length - 2;) {
      links.push({ source: i, target: i + 1 });
      if (i != 0) {
        links.push({ source: i, target: i + 2 });
        i = i + 2;
      } else {
        i = i + 1;
      }
    }
    //extra push for output
    links.push({ source: i, target: i + 1 })


    svg = d3.select('#' + this.location).append('svg')
      .call(() => {
        this.calcSankey(results.nodes);
      })
      .attr("width", "100%")
      .attr("height", "80%")
      .attr("viewBox", "0 0 " + width + " " + height)
      .attr("preserveAspectRatio", "xMinYMin")
      .append("g");

    this.drawFurnace();
    var color = this.findColor(results.nodes[0].value);
    this.makeGradient(color, results.nodes, links);

    //arrows are created, positioned, and colored
    svg.selectAll('marker')
      .data(links)
      .enter().append('svg:marker')
      .attr('id', function (d) {
        return 'end-' + d.target;
      })
      //real version
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
        return "url(" + window.location + "#linear-gradient-" + i + ")";
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
          return d.x + (d.displaySize * .7) + 40;
        }
        if (d.input) {
          if (this.location === 'sankey-diagram') {
            return d.x - 70;
          }
          else if (this.location !== 'sankey-diagram') {
            return d.x + 70;
          }
          return d.x
        }
        else {
          return d.x;
        }
      })
      .attr("dy", (d) => {
        if (d.input) {
          if (this.location === 'sankey-diagram') {
            return d.y + (d.displaySize) + labelFontSize + labelPadding;
          } else if (this.location !== 'sankey-diagram') {
            return d.y + (d.displaySize) + reportFontSize + reportPadding;
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


    //append values and units
    nodes_text = svg.selectAll(".nodetext")
      .data(results.nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dx", (d) => {
        if (d.usefulOutput) {
          return d.x + (d.displaySize * .7) + 40;
        }
        if (d.input) {
          if (this.location === 'sankey-diagram') {
            return d.x - 70;
          }
          else if (this.location !== 'sankey-diagram') {
            return d.x + 70;
          }
          return d.x + 70;
        }
        else {
          return d.x;
        }
      })
      .attr("dy", (d) => {
        if (d.input) {
          if (this.location === 'sankey-diagram') {
            return d.y + (d.displaySize) + (labelFontSize * 2) + (labelPadding * 2);
          } else if (this.location !== 'sankey-diagram') {
            return d.y + (d.displaySize) + (reportFontSize * 2) + (reportPadding * 2);
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
          return d.value.toFixed(2) + " " + d.units;
        }
      })
      .style("font-size", (this.location === 'sankey-diagram') ? labelFontSize + "px" : reportFontSize + "px");
  }

  //positions elements
  calcSankey(nodes) {
    var alterVal = 0, change;
    nodes.forEach((d, i) => {

      d.y = (height / 2 - nodes[0].displaySize / 2);
      if (d.inter) {
        // Reset heightbn
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
          if (d.usefulOutput) {
            // d.value = (nodes[i - 2].value - nodes[i - 1].value);
            d.displaySize = this.calcDisplayValue(this.baseSize, d.value, nodes[0].value);

            //Since this is a static diagram this can be place, but if the final output is off take out the bellow code.
            alterVal -= d.displaySize;

            d.y += (d.displaySize + alterVal);
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

  //debug version
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

    links.forEach(function (d, i) {
      var link_data = d;
      svg.append("linearGradient")
        .attr("id", function () {
          return "linear-gradient-" + i;
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
    if (!nodes[d.target].inter || nodes[d.target].usefulOutput) {
      return "url(" + window.location + "#end-" + d.target + ")";
    }
    else {
      return "";
    }
  }


  updateColors(nodes, links) {

    // make a new gradient
    var color = this.findColor(nodes[0].value);

    nodes.forEach(function (d, i) {
      var node_data = d;
      if (!d.inter || d.usefulOutput) {
        svg.select("#end-" + i)
          .attr("fill", function () {
            return color(node_data.value);
          })
      }
    });

    links.forEach(function (d, i) {
      var link_data = d;
      svg.select("#linear-gradient-" + i)
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
        return "url(" + window.location + "#linear-gradient-" + i + ")"
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
        return (580 - 100) + "," + ((height / 2) - 500) + "," + (580 - 150) + "," + ((height / 2) - 500) + "," + (580 - 150) + "," + ((height / 2) - 350) + "," + 250 + "," + ((height / 2) - 350) + "," + 250 + "," + ((height / 2) + 350) + "," + (width - 300) + "," + ((height / 2) + 350) + "," + (width - 300) + "," + ((height / 2) - 350) + "," + (580 + 150) + "," + ((height / 2) - 350) + "," + (580 + 150) + "," + ((height / 2) - 500) + "," + (580 + 100) + "," + ((height / 2) - 500) + "," + (580 + 100) + "," + ((height / 2) - 300) + "," + ((width - 300) - 50) + "," + ((height / 2) - 300) + "," + ((width - 300) - 50) + "," + ((height / 2) + 300) + "," + 300 + "," + ((height / 2) + 300) + "," + 300 + "," + ((height / 2) - 300) + "," + (580 - 100) + "," + ((height / 2) - 300) + "," + (580 - 100) + "," + ((height / 2) - 500);
      })
      .style("fill", "#bae4ce")
      .style("stroke", "black");
  }
}
