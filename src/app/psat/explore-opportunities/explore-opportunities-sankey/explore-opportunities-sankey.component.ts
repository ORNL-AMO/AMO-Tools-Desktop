import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

// declare var d3: any;
import * as d3 from 'd3';
var svg;

@Component({
  selector: 'app-explore-opportunities-sankey',
  templateUrl: './explore-opportunities-sankey.component.html',
  styleUrls: ['./explore-opportunities-sankey.component.css']
})
export class ExploreOpportunitiesSankeyComponent implements OnInit, OnChanges {
  @Input()
  baselineResults: any;
  @Input()
  modificationResults: any;
  @Input()
  settings: Settings;

  motor: number;
  drive: number;
  pump: number;

  width: number;
  height: number;

  firstChange: boolean = true;

  //Max width of Sankey

  baseSize: number = 50;


  selectedView: string = 'Baseline';


  constructor(private convertUnitsService: ConvertUnitsService) {
  }

  ngOnInit() {
    this.createSankey();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.baselineResults) {
      if (this.selectedView == 'Baseline') {
        this.createSankey();
      }
    }
    if (changes.modificationResults) {
      if (this.selectedView == 'Modified') {
        this.createSankey();
      }
    }
  }
  createSankey() {
    if (this.selectedView == 'Baseline') {
      this.sankey("app-explore-opportunities-sankey", this.baselineResults);
    } else if (this.selectedView == 'Modified') {
      this.sankey("app-explore-opportunities-sankey", this.modificationResults);
    }
  }



  closeSankey(location) {
    // Remove Sankey
    d3.select(location).selectAll('svg').remove();
  }

  sankey(location, results) {

    this.baseSize = 50 * (results.motor_power/this.baselineResults.motor_power);

    // Remove  all Sankeys
    d3.select(location).selectAll('svg').remove();

    this.width = 400;
    this.height = 400;

    svg = d3.select(location).append('svg')
      .attr("viewBox", "0 0 " + this.width + " " + this.height)
      .attr("preserveAspectRatio", "xMinYMin")
      .append("g");

    this.calcLosses(results);

    var nodes = [];
    nodes.push(
      /*0*/{
        name: "Input",
        value: results.motor_power,
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
        name: "Motor",
        value: this.motor,
        displaySize: 0,
        width: 0,
        x: (this.width * .40),
        y: 0,
        input: false,
        output: false,
        inter: false,
        top: true
      });


    if (this.drive > 0) {
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
          name: "Drive",
          value: this.drive,
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
        name: "Pump",
        value: this.pump,
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
        name: "Output",
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


    if (this.drive > 0) {
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
          return d.y + (d.displaySize / 2) - 9;
        }
        else {
          if (d.top) {
            return d.y - 50;
          }
          else {
            return d.y + 60;
          }
        }
      })
      .text(function (d) {
        if (!d.inter) {
          return d.name;
        }
      })
      .style("font-size", "12px");

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
          return (d.y + (d.displaySize / 2)) + 6;
        }
        else if (d.top) {
          return d.y - 35;
        }
        else {
          return d.y + 110;
        }
      })
      .text(function (d) {
        if (!d.inter) {
          return twoDecimalFormat(d.value);
        }
      })
      .style("font-size", "12px");

    var nodes_units = svg.selectAll(".nodetext")
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
          return d.y + (d.displaySize / 2) + 21;
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
          return "kW";
        }
      })
      .style("font-size", "12px");
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
    links.forEach(function (d, i) {
      var link_data = d;
      svg.append("linearGradient")
        .attr("id", function () {
          return "linear-gradient-" + i;
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
    if (!nodes[d.target].inter || nodes[d.target].output) {
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
      if (!d.inter || d.output) {
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
      .range(["#40B8DB", "#1C20DB"]);
  }

  finalOutputColor(value) {
    return d3.scaleLinear()
      .domain([0, value])
      .range(["#40B8DB", "#1C20DB"]);
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


  calcLosses(results) {
    var motorShaftPower;
    var pumpShaftPower;
    if (this.settings.powerMeasurement === "hp") {
      motorShaftPower = this.convertUnitsService.value(results.motor_shaft_power).from("hp").to('kW');
      pumpShaftPower = this.convertUnitsService.value(results.pump_shaft_power).from("hp").to('kW');
    }
    else {
      motorShaftPower = results.motor_shaft_power;
      pumpShaftPower = results.pump_shaft_power;
    }

    this.motor = results.motor_power * (1 - (results.motor_efficiency / 100));

    this.drive = motorShaftPower - pumpShaftPower;

    this.pump = (results.motor_power - this.motor - this.drive) * (1 - (results.pump_efficiency / 100));

  }

}

