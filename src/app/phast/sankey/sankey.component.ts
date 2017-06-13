import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Losses } from '../../shared/models/phast';
import * as _ from 'lodash';

// declare var d3: any;
import * as d3 from 'd3';
var svg;

const width = 1950,
  height = 1200;

@Component({
  selector: 'app-sankey',
  templateUrl: 'sankey.component.html',
  styleUrls: ['sankey.component.css']
})

export class SankeyComponent implements OnInit {
  @Input()
  losses: Losses;

  totalChargeMaterialLoss: number = 0;
  totalWallLoss: number = 0;
  totalOtherLoss: number = 0;
  totalOpeningLoss: number = 0;
  totalLeakageLoss: number = 0;
  totalFixtureLoss: number = 0;
  totalExtSurfaceLoss: number = 0;
  totalCoolingLoss: number = 0;
  totalAtmosphereLoss: number = 0;

  firstChange: boolean = true;

  baseSize: number = 300;
  constructor() {
  }

  ngOnInit() {
    if (this.losses) {
      this.getTotals();
    }
  }

  // For dynamic sankey, will calculate totals when losses input changes value
  // ngOnChanges(changes: SimpleChanges) {
  //   if (!this.firstChange) {
  //     if (changes.losses) {
  //       this.getTotals();
  //     }
  //   }
  //   else {
  //     this.firstChange = false;
  //   }
  // }

  getTotals() {
    this.totalWallLoss = _.sumBy(this.losses.wallLosses, 'heatLoss');
    this.totalAtmosphereLoss = _.sumBy(this.losses.atmosphereLosses, 'heatLoss');
    this.totalOtherLoss = _.sumBy(this.losses.otherLosses, 'heatLoss');
    this.totalCoolingLoss = _.sumBy(this.losses.coolingLosses, 'heatLoss');
    this.totalOpeningLoss = _.sumBy(this.losses.openingLosses, 'heatLoss');
    this.totalFixtureLoss = _.sumBy(this.losses.fixtureLosses, 'heatLoss');

    this.totalLeakageLoss = _.sumBy(this.losses.leakageLosses, 'heatLoss');
    this.totalExtSurfaceLoss = _.sumBy(this.losses.extendedSurfaces, 'heatLoss');
    this.totalChargeMaterialLoss = (_.sumBy(this.losses.chargeMaterials, 'gasChargeMaterial.heatRequired') + _.sumBy(this.losses.chargeMaterials, 'liquidChargeMaterial.heatRequired') + _.sumBy(this.losses.chargeMaterials, 'solidChargeMaterial.heatRequired'))

  }

  closeSankey(location) {
    // Remove Sankey
    d3.select(location).selectAll('svg').remove();
  }

  zoom(location) {
    d3.select(location).selectAll('svg')
      .attr("width", "100%")
      .attr("height", "700");
  }

  unZoom() {
    svg
      .attr("width", "900")
      .attr("height", "600")
  }

  makeSankey(location) {
    // Sankey will not be made if even a single loss has not been entered
    if (this.totalWallLoss != null && this.totalAtmosphereLoss != null && this.totalOtherLoss != null && this.totalCoolingLoss != null && this.totalOpeningLoss != null
      && this.totalFixtureLoss != null && this.totalLeakageLoss != null && this.totalExtSurfaceLoss != null && this.totalChargeMaterialLoss != null) {
      this.sankey(location);
    }
  }

  sankey(location) {

    // Remove  all Sankeys
    d3.select(location).selectAll('svg').remove();

    var nodes = [
      /*0*/{ name: "Input", value: 20000000, displaySize: this.baseSize, width: 300, x: 150, y: 0, input: true, usefulOutput: false, inter: false, top: false },
      /*1*/{ name: "inter1", value: 0, displaySize: 0, width: 0, x: 300, y: 0, input: false, usefulOutput: false, inter: true, top: true },
      /*2*/{ name: "Flue Gas Losses", value: 0, displaySize: 0, width: 0, x: 480, y: 0, input: false, usefulOutput: false, inter: false, top: true },
      /*3*/{ name: "inter2", value: 0, displaySize: 0, width: 0, x: 410, y: 0, input: false, usefulOutput: false, inter: true, top: false },
      /*4*/{ name: "Atmosphere Losses", value: this.totalAtmosphereLoss, displaySize: 0, width: 0, x: 550, y: 0, input: false, usefulOutput: false, inter: false, top: false },
      /*5*/{ name: "inter3", value: 0, displaySize: 0, width: 0, x: 590, y: 0, input: false, usefulOutput: false, inter: true, top: true },
      /*6*/{ name: "Other Losses", value: this.totalOtherLoss, displaySize: 0, width: 0, x: 720, y: 0, input: false, usefulOutput: false, inter: false, top: true },
      /*7*/{ name: "inter4", value: 0, displaySize: 0, width: 0, x: 700, y: 0, input: false, usefulOutput: false, inter: true, top: false },
      /*8*/{ name: "Water Cooling Losses", value: this.totalCoolingLoss, displaySize: 0, width: 0, x: 840, y: 0, input: false, usefulOutput: false, inter: false, top: false },
      /*9*/{ name: "inter5", value: 0, displaySize: 0, width: 0, x: 810, y: 0, input: false, usefulOutput: false, inter: true, top: true },
      /*10*/{ name: "Wall Losses", value: this.totalWallLoss, displaySize: 0, width: 0, x: 970, y: 0, input: false, usefulOutput: false, inter: false, top: true },
      /*11*/{ name: "inter6", value: 0, displaySize: 0, width: 0, x: 920, y: 0, input: false, usefulOutput: false, inter: true, top: false },
      /*12*/{ name: "Opening Losses", value: this.totalOpeningLoss, displaySize: 0, width: 0, x: 1090, y: 0, input: false, usefulOutput: false, inter: false, top: false },
      /*13*/{ name: "inter7", value: 0, displaySize: 0, width: 0, x: 1060, y: 0, input: false, usefulOutput: false, inter: true, top: true },
      /*14*/{ name: "Fixture/Conveyor Losses", value: this.totalFixtureLoss, displaySize: 0, width: 0, x: 1230, y: 0, input: false, usefulOutput: false, inter: false, top: true },
      /*15*/{ name: "inter8", value: 0, displaySize: 0, width: 0, x: 1170, y: 0, input: false, usefulOutput: false, inter: true, top: false },
      /*16*/{ name: "Leakage Losses", value: this.totalLeakageLoss, displaySize: 0, width: 0, x: 1330, y: 0, input: false, usefulOutput: false, inter: false, top: false },
      /*17*/{ name: "inter9", value: 0, displaySize: 0, width: 0, x: 1310, y: 0, input: false, usefulOutput: false, inter: true, top: true },
      /*18*/{ name: "External SurfaceLosses", value: this.totalExtSurfaceLoss, displaySize: 0, width: 0, x: 1480, y: 0, input: false, usefulOutput: false, inter: false, top: true },
      /*19*/{ name: "inter10", value: 0, displaySize: 0, width: 0, x: 1440, y: 0, input: false, usefulOutput: false, inter: true, top: false },
      /*20*/{ name: "Charge Material Losses", value: this.totalChargeMaterialLoss, displaySize: 0, width: 0, x: 1580, y: 0, input: false, usefulOutput: false, inter: false, top: false },
      /*21*/{ name: "Useful Output", value: 0, displaySize: 0, width: 0, x: 1650, y: 0, input: false, usefulOutput: true, inter: false, top: false }
    ];

    var links = [
      // linking to the first interNode
      { source: 0, target: 1 },
      // interNode1 to Flue Gas and interNode2
      { source: 1, target: 2 },
      { source: 1, target: 3 },
      // interNode2 to Atmosphere and interNode3
      { source: 3, target: 4 },
      { source: 3, target: 5 },
      // interNode3 to Other and interNode4
      { source: 5, target: 6 },
      { source: 5, target: 7 },
      // interNode4 to Water and interNode5
      { source: 7, target: 8 },
      { source: 7, target: 9 },
      // interNode5 to Wall and interNode6
      { source: 9, target: 10 },
      { source: 9, target: 11 },
      // interNode6 to Opening and interNode7
      { source: 11, target: 12 },
      { source: 11, target: 13 },
      // interNode7 to Fixture and interNode8
      { source: 13, target: 14 },
      { source: 13, target: 15 },
      // interNode8 to Leakage and interNode9
      { source: 15, target: 16 },
      { source: 15, target: 17 },
      // interNode9 to External and interNode10
      { source: 17, target: 18 },
      { source: 17, target: 19 },
      // interNode10 to Charge and usefulOutput
      { source: 19, target: 20 },
      { source: 19, target: 21 },
    ];

    svg = d3.select(location).append('svg')
      .call(() => {
        this.calcSankey(nodes);
      })
      .attr("width", "900")
      .attr("height", "600")
      .attr("viewBox", "0 0 " + width + " " + height)
      .attr("preserveAspectRatio", "xMinYMin")
      .style("border", "1px solid black")
      .append("g");

    this.drawFurnace();

    var color = this.findColor(nodes[0].value);

    this.makeGradient(color, nodes, links);

    svg.selectAll('marker')
      .data(links)
      .enter().append('svg:marker')
      .attr('id', function (d) {
        return 'end-' + d.target;
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
        return "url(" + window.location + "#linear-gradient-" + i + ")";
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

    var nodes_text = svg.selectAll(".nodetext")
      .data(nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dx", (d) => {
        if (d.input) {
          return d.x - 70;
        }
        else if (d.usefulOutput) {
          return d.x + (d.displaySize * .7) + 100;
        }
        else {
          return d.x;
        }
      })
      .attr("dy", (d) => {
        if (d.input || d.usefulOutput) {
          return d.y + (d.displaySize / 2);
        }
        else {
          if (d.top) {
            return d.y - 120;
          }
          else {
            return d.y + 60;
          }
        }
      })
      .text((d) => {
        if (!d.inter) {
          return d.name;
        }
      })
      .style("font-size", "30px");

    var nodes_units = svg.selectAll(".nodetext")
      .data(nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dx", function (d) {
        if (d.input) {
          return d.x - 70;
        }
        else if (d.usefulOutput) {
          return d.x + (d.displaySize * .7) + 100;
        }
        else {
          return d.x;
        }
      })
      .attr("dy", function (d) {
        if (d.input || d.usefulOutput) {
          return d.y + (d.displaySize / 2) + 95;
        }
        else {
          if (d.top) {
            return d.y - 20;
          }
          else {
            return d.y + 160;
          }
        }
      })
      .text(function (d) {
        if (!d.inter) {
          return "Btu/Hr.";
        }
      })
      .style("font-size", "30px");

    nodes.forEach((d, i) => {
      var node_val = d, i = i;
      if (!node_val.inter) {
        svg.append('foreignObject')
          .attr("id", "inputObject")
          .attr("x", function () {
            if (node_val.input) {
              return node_val.x - 150;
            }
            else if (node_val.usefulOutput) {
              return d.x + (d.displaySize * .7) + 30;
            }
            else {
              return node_val.x - 70;
            }
          })
          .attr("y", function () {
            if (node_val.input || node_val.usefulOutput) {
              return (node_val.y + (node_val.displaySize / 2)) + 10;
            }
            else if (node_val.top) {
              return node_val.y - 100;
            }
            else {
              return node_val.y + 80;
            }
          })
          .attr("width", 100)
          .attr("height", 50)
          .append("xhtml:sankey-diagram")
          .append("input")
          .attr("id", ("inputBox" + i))
          .data(nodes)
          .attr("type", "text")
          .attr("id", node_val.name)
          .attr("value", function () {
            var format = d3.format(",.3f");
            return format(node_val.value);
          })
          .style("width", "140px")
          .style("font-size", "30px");
        /*
        .on("change", (inputBox) => {

          console.log("value: " + inputBox.value);
          if (isNaN(parseFloat(inputBox.value))) {
            nodes[i].value = 0;
          }
          else {
            inputBox.value = inputBox.value.toString();
            nodes[i].value = parseFloat(inputBox.value.replace(new RegExp(",", "g"), ""));
          }

          nodes = this.calcSankey(nodes);
          console.log("nodes after: ");
          console.log(nodes);
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
            .attr("dx", function(d){
              if(d.input){
                return d.x - 70;
              }
              else if(d.usefulOutput){
                return d.x + (d.displaySize*.7)  + 100;
              }
              else {
                return d.x;
              }
            })
            .attr("dy", function(d){
              if(d.input || d.usefulOutput){
                return d.y + (d.displaySize/2);
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
              if(d.input){
                return d.x - 70;
              }
              else if(d.usefulOutput){
                return d.x + (d.displaySize*.7)  + 100;
              }
              else {
                return d.x;
              }
            })
            .attr("dy", function(d){
              if(d.input || d.usefulOutput){
                return d.y + (d.displaySize/2) + 60;
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
          this.changePlaceHolders(nodes);


        });
        */
      }
    });

  }

  calcSankey(nodes) {
    var alterVal = 0, change;
    nodes.forEach((d, i) => {
      d.y = (height / 2 - nodes[0].displaySize / 2);
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
          if (d.usefulOutput) {
            d.value = (nodes[i - 2].value - nodes[i - 1].value);
            d.displaySize = this.calcDisplayValue(this.baseSize, d.value, nodes[0].value);
            d.y = d.y + alterVal;
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
    return baseSize * (val / value);
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
      .range(["#ffcc00", "#ff3300"]);
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
          return d.x + (d.displaySize * .7) + 100;
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
          return d.x + (d.displaySize * .7) + 100;
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
        return (480 - 100) + "," + ((height / 2) - 500) + "," + (480 - 150) + "," + ((height / 2) - 500) + "," + (480 - 150) + "," + ((height / 2) - 350) + "," + 250 + "," + ((height / 2) - 350) + "," + 250 + "," + ((height / 2) + 350) + "," + 1400 + "," + ((height / 2) + 350) + "," + 1400 + "," + ((height / 2) - 350) + "," + (480 + 150) + "," + ((height / 2) - 350) + "," + (480 + 150) + "," + ((height / 2) - 500) + "," + (480 + 100) + "," + ((height / 2) - 500) + "," + (480 + 100) + "," + ((height / 2) - 300) + "," + (1400 - 50) + "," + ((height / 2) - 300) + "," + (1400 - 50) + "," + ((height / 2) + 300) + "," + 300 + "," + ((height / 2) + 300) + "," + 300 + "," + ((height / 2) - 300) + "," + (480 - 100) + "," + ((height / 2) - 300) + "," + (480 - 100) + "," + ((height / 2) - 500);
      })
      .style("fill", "#bae4ce")
      .style("stroke", "black");
  }

}
