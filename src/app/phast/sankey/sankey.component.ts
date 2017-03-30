import { Component, OnInit} from '@angular/core';

declare var d3: any;

@Component({
  selector: 'app-sankey',
  templateUrl: 'sankey.component.html',
  styleUrls: ['sankey.component.css']
})

export class SankeyComponent implements OnInit{

  svg: any;

  width: number =  1750;
  height: number = 1200;
  baseSize: number = 300;
  isBase: boolean;


  color: any;
  linkGen: any;

  baseLine: any = [
    /*0*/{ name: "Input", value: 300, displaySize: this.baseSize, width: 300, x: 150, y:0, input: true, usefulOutput: false, inter: false, top: false},
    /*1*/{ name: "inter1", value: 0, displaySize: 0, width: 0, x: 450, y: 0, input: false, usefulOutput: false, inter: true, top: true},
    /*2*/{ name: "Flue Gas Losses", value: 70, displaySize: 0, width: 0, x: 620, y: 0, input: false, usefulOutput: false, inter: false, top: true},
    /*3*/{ name: "inter2", value: 0, displaySize: 0 ,width: 0, x: 500, y: 0, input: false, usefulOutput: false, inter: true, top: false},
    /*4*/{ name: "Atmosphere Losses", value: 40, displaySize: 0, width: 0, x: 650, y: 0, input: false, usefulOutput: false, inter: false, top: false},
    /*5*/{ name: "inter3", value: 0, displaySize: 0, width: 0, x: 630, y: 0, input: false, usefulOutput: false, inter: true, top: true},
    /*6*/{ name: "Other Losses", value: 20, displaySize: 0, width: 0, x: 770,  y: 0, input: false, usefulOutput: false, inter: false, top: true},
    /*7*/{ name: "inter4", value: 0, displaySize: 0, width: 0, x: 740, y: 0, input: false, usefulOutput: false, inter: true, top: false},
    /*8*/{ name: "Water Cooling Losses", value: 30, displaySize: 0, width: 0, x: 890, y: 0, input: false, usefulOutput: false, inter: false, top: false},
    /*9*/{ name: "inter5", value: 0, displaySize: 0, width: 0, x: 900, y: 0, input: false, usefulOutput: false, inter: true, top: true},
    /*10*/{ name: "Wall Losses", value: 40, displaySize: 0, width: 0, x: 1030, y: 0, input: false, usefulOutput: false, inter: false, top: true},
    /*11*/{ name: "inter6", value: 0, displaySize: 0, width: 0, x: 1070, y: 0, input: false, usefulOutput: false, inter: true, top: false},
    /*12*/{ name: "Opening Losses", value: 10, displaySize: 0, width: 0, x: 1200, y: 0, input: false, usefulOutput: false, inter: false, top: true},
    /*13*/{ name: "inter7", value: 0, displaySize: 0, width: 0, x: 1130, y: 0, input: false, usefulOutput: false, inter: true, top: false},
    /*14*/{ name: "Fixture/Conveyor Losses", value: 10, displaySize: 0, width: 0, x: 1270, y: 0, input: false, usefulOutput: false, inter: false, top: false},
    /*15*/{ name: "Useful Output", value: 0, displaySize: 0, width: 0, x: 1350, y: 0, input: false, usefulOutput: true, inter: false, top: true}
  ];

  modified: any = [
  /*0*/{ name: "Input", value: 300, displaySize: this.baseSize, width: 300, x: 150, y:0, input: true, usefulOutput: false, inter: false, top: false},
  /*1*/{ name: "inter1", value: 0, displaySize: 0, width: 0, x: 450, y: 0, input: false, usefulOutput: false, inter: true, top: true},
  /*2*/{ name: "Flue Gas Losses", value: 70, displaySize: 0, width: 0, x: 620, y: 0, input: false, usefulOutput: false, inter: false, top: true},
  /*3*/{ name: "inter2", value: 0, displaySize: 0 ,width: 0, x: 500, y: 0, input: false, usefulOutput: false, inter: true, top: false},
  /*4*/{ name: "Atmosphere Losses", value: 40, displaySize: 0, width: 0, x: 650, y: 0, input: false, usefulOutput: false, inter: false, top: false},
  /*5*/{ name: "inter3", value: 0, displaySize: 0, width: 0, x: 630, y: 0, input: false, usefulOutput: false, inter: true, top: true},
  /*6*/{ name: "Other Losses", value: 20, displaySize: 0, width: 0, x: 770,  y: 0, input: false, usefulOutput: false, inter: false, top: true},
  /*7*/{ name: "inter4", value: 0, displaySize: 0, width: 0, x: 740, y: 0, input: false, usefulOutput: false, inter: true, top: false},
  /*8*/{ name: "Water Cooling Losses", value: 30, displaySize: 0, width: 0, x: 890, y: 0, input: false, usefulOutput: false, inter: false, top: false},
  /*9*/{ name: "inter5", value: 0, displaySize: 0, width: 0, x: 900, y: 0, input: false, usefulOutput: false, inter: true, top: true},
  /*10*/{ name: "Wall Losses", value: 40, displaySize: 0, width: 0, x: 1030, y: 0, input: false, usefulOutput: false, inter: false, top: true},
  /*11*/{ name: "inter6", value: 0, displaySize: 0, width: 0, x: 1070, y: 0, input: false, usefulOutput: false, inter: true, top: false},
  /*12*/{ name: "Opening Losses", value: 10, displaySize: 0, width: 0, x: 1200, y: 0, input: false, usefulOutput: false, inter: false, top: true},
  /*13*/{ name: "inter7", value: 0, displaySize: 0, width: 0, x: 1130, y: 0, input: false, usefulOutput: false, inter: true, top: false},
  /*14*/{ name: "Fixture/Conveyor Losses", value: 10, displaySize: 0, width: 0, x: 1270, y: 0, input: false, usefulOutput: false, inter: false, top: false},
  /*15*/{ name: "Useful Output", value: 0, displaySize: 0, width: 0, x: 1350, y: 0, input: false, usefulOutput: true, inter: false, top: true}
  ];

  nodes: any = [];

  links: any = [
  //linking to the first interNode
  { source: 0, target: 1, endWidth: 0 },
  //interNode1 to Flue Gas and interNode2
  { source: 1, target: 2, endWidth: 0 },
  { source: 1, target: 3, endWidth: 0 },
  //interNode2 to Atmosphere and interNode3
  { source: 3, target: 4, endWidth: 0},
  { source: 3, target: 5, endWidth: 0 },
  //interNode3 to Other and interNode4
  { source: 5, target: 6, endWidth: 0 },
  { source: 5, target: 7, endWidth: 0 },
  //interNode4 to Water and interNode5
  { source: 7, target: 8, endWidth: 0 },
  { source: 7, target: 9, endWidth: 0 },
  //interNode5 to Wall and interNode6
  { source: 9, target: 10, endWidth: 0 },
  { source: 9, target: 11, endWidth: 0 },
  //interNode6 to Opening and interNode7
  { source: 11, target: 12, endWidth: 0 },
  { source: 11, target: 13, endWidth: 0 },
  //interNode7 to Fixture and Useful Output
  { source: 13, target: 14, endWidth: 0 },
  { source: 13, target: 15, endWidth: 0 }
];

  constructor() {
  }

  ngOnInit() {
    this.isBase = false;
  }

  closeSankey(location){
    //Remove Sankey
    d3.select(location).selectAll('svg').remove();
  }

  zoom(location){
    d3.select(location).selectAll('svg')
      .attr("width", "100%")
      .attr("height", "700");
  }

  makeSankey(location){

    //Remove  all Sankeys
    d3.select(location).selectAll('svg').remove();

    this.svg = d3.select(location).append('svg')
      .call(this.changeNodes)
      .call(this.calcSankey)
      .attr("width", "900")
      .attr("height", "600")
      .attr("viewBox", "0 0 " + this.width + " " + this.height)
      .attr("preserveAspectRatio", "xMinYMin")
      .style("border", "1px solid black")
      .append("g")
      .call(this.findColor);

    this.links.forEach( function(d, i) {
      var link_data = d;
      this.svg.append("linearGradient")
        .attr("id", function(){
          return "linear-gradient-" + i;
        })
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", this.nodes[link_data.source].x)
        .attr("y1", function() {
          if (this.nodes[link_data.target].inter || this.nodes[link_data.target].usefulOutput){
            return (this.nodes[link_data.target].y + (this.nodes[link_data.target].displaySize/2));
          }
          else{
            if(this.nodes[link_data.target].top) {
              return this.nodes[link_data.source].y;
            }
            else{
              return (this.nodes[link_data.source].y+this.nodes[link_data.source].displaySize);
            }
          }
        })
        .attr("x2", this.nodes[link_data.target].x)
        .attr("y2", function(){
          if (this.nodes[link_data.target].inter || this.nodes[link_data.target].usefulOutput) {
            return (this.nodes[link_data.target].y + (this.nodes[link_data.target].displaySize/2));
          }
          else{
            return this.nodes[link_data.target].y;
          }
        })
        .selectAll("stop")
        .data([
          {offset: "0%", color: this.color(this.nodes[link_data.source].value)},
          {offset: "76%", color: this.color(this.nodes[link_data.target].value)},
        ])
        .enter().append("stop")
        .attr("offset", function (d) {
          return d.offset;
        })
        .attr("stop-color", function (d) {
          return d.color;
        });
    });


    this.svg.selectAll('marker')
      .data(this.links)
      .enter().append('svg:marker')
      .attr('id', function (d) {
        return 'end-' + d.target;
      })
      .attr('orient', 'auto')
      .attr('refX', .1)
      .attr('refY', 0)
      .attr("viewBox", "0 -5 10 10")
      .style("border", "1px solid black")
      .attr("fill", function (d) {
        return this.color(this.nodes[d.target].value);
      })
      .append('svg:path')
      .attr("d", "M0,-2.5L2,0L0,2.5");


    this.linkGen = d3.line()
      .curve(d3.curveMonotoneX);

    //Draw links to the svg
    var link = this.svg.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(this.links)
      .enter().append('path')
      .attr("d", function(d){
        return this.makeLinks(d);
      })
      .style("stroke", function(d, i){
        return "url(" + window.location + "#linear-gradient-" + i + ")"
      })
      .style("fill", "none")
      .style("stroke-width", function(d){
        return this.nodes[d.target].displaySize;
      })
      .attr('marker-end', function(d) {
        return this.getEndMarker(d);
      })
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout);

    var displayValue = d3.select("app-sankey-diagram").append("div")
      .attr("class", "tooltip")
      .attr("display", "none");

    function mouseover() {
      displayValue.attr("display", "inline");
    }

    function mousemove() {
      displayValue
        .text("hi")
        .attr("left", (d3.event.pageX - 34) + "px")
        .attr("top", (d3.event.pageY - 12) + "px");
    }

    function mouseout() {
      displayValue.attr("display", "none");
    }


    //Draw nodes to the svg
    var node = this.svg.selectAll('.node')
      .data(this.nodes)
      .enter()
      .append('g')
      .append("polygon")
      .attr('class', 'node');

    var nodes_text = this.svg.selectAll(".nodetext")
      .data(this.nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
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
      })
      .text(function(d) {
        if(!d.inter) {
          return d.name;
        }
      });

    var nodes_units = this.svg.selectAll(".nodetext")
      .data(this.nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
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
      })
      .text(function(d) {
        if(!d.inter) {
          return "Btu/Hr.";
        }
      });

    this.nodes.forEach(function(d, i){
      var node_val  = d, i = i;
      if(!node_val.inter) {
        this.svg.append('foreignObject')
          .attr("id", "inputObject")
          .attr("x", function () {
            if (node_val.input) {
              return node_val.x - 120;
            }
            else if (node_val.usefulOutput) {
              return d.x + (d.displaySize*.7) + 50;
            }
            else {
              return node_val.x - 50;
            }
          })
          .attr("y", function () {
            if (node_val.input || node_val.usefulOutput) {
              return (node_val.y + (node_val.displaySize / 2)) + 10;
            }
            else if (node_val.top) {
              return node_val.y - 80;
            }
            else {
              return node_val.y + 80;
            }
          })
          .attr("width", 100)
          .attr("height", 50)
          .append("xhtml:sankey-diagram")
          .append("input")
          .data(this.nodes)
          .attr("type", "text")
          .attr("id", node_val.name)
          .attr("value", function(){
            var format = d3.format(",");
            return format(node_val.value);
          })
          .style("width", "100px")
          .on("change", function(){
            if(isNaN(parseFloat(this.value))){
              this.nodes[i].value = 0;
            }
            else{
              this.nodes[i].value = parseFloat(this.value.replace(new RegExp(",", "g"), ""));
            }
            this.calcSankey();
            this.updateColors();
            link
              .attr("d", function(d){
                return this.makeLinks(d)
              })
              .style("stroke-width", function(d){
                //returns a links width equal to the target's value
                return this.nodes[d.target].displaySize;
              })
              .attr("marker-end", function (d) {
                return this.getEndMarker(d);
              });
            link
              .style("stroke", function(d, i){
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

            changePlaceHolders();
          });
      }
    });


    function changePlaceHolders(){
      this.svg.selectAll("input")
        .attr("value", function(d,i){
          var format = d3.format(",");
          if(i == 8){
            return format(this.nodes[15].value);
          }
          else {
            return format(this.nodes[i * 2].value);
          }
        })
        .each(function(d, i){
          var format = d3.format(",");
          if(i == 8){
            this.value = format(this.nodes[15].value);
          }
          else {
            this.value = format(this.nodes[i * 2].value);
          }
        });
      this.svg.selectAll("foreignObject")
        .data(this.nodes)
        .attr("x", function (d, i) {
          if(i == 8){
            return this.nodes[15].x + (this.nodes[15].displaySize*.7) + 50;
          }
          else if(this.nodes[i * 2].input){
            return this.nodes[i * 2].x - 120;
          }
          else{
            return this.nodes[i * 2].x - 50;
          }
        })
        .attr("y", function (d, i) {
          if (this.nodes[i].input){
            return (this.nodes[i * 2].y + (this.nodes[i * 2].displaySize / 2)) + 10;
          }
          else if(i == 8 ){
            return (this.nodes[15].y + (this.nodes[15].displaySize / 2)) + 10;
          }
          else{
            if (this.nodes[i * 2].top) {
              return this.nodes[i * 2].y - 80;
            }
            else {
              return this.nodes[i * 2].y + 80;
            }
          }
        });
    }

  }

  changeNodes(){
    //check if the nodes currently have baseLine or modified
    if(this.isBase){
      //Nodes was baseLine but will be changed to modified
      for(var i = 0; i < this.modified.length; i++){
        this.nodes.push(this.modified[i]);
      }
      this.isBase = false;
    }
    else{
      //Nodes was modofied but will be changed to baseLine
      console.log("size: " + this.baseLine.length);
      for(var i = 0; i < this.baseLine.length; i++){
        console.log(this.baseLine[i]);
        this.nodes.push(this.baseLine[i]);
      }
      this.isBase = true;
    }
  }
  calcSankey() {
    var alterVal = 0, height = this.height;

    this.nodes.forEach(function (d, i) {
      console.log(this.height);
      d.y = (this.height/2 - this.nodes[0].displaySize/2);
      if (d.inter) {
        //Reset height
        if (i == 1) {
          //First interNode
          d.value = this.nodes[i - 1].value;
          d.displaySize = this.calcDisplayValue(d.value);
        }
        else {
          //Previous node.val - interNode.value
          d.value = (this.nodes[i - 2].value - this.nodes[i - 1].value);
          d.displaySize = this.calcDisplayValue(d.value);
          if (d.top) {
            d.y = d.y + alterVal;
          }
          else {
            alterVal += (this.nodes[i - 2].displaySize - d.displaySize);
            d.y = (d.y + alterVal);
          }
        }
      }
      else {
        if(!d.input) {
          if (d.usefulOutput) {
            d.value = (this.nodes[i - 2].value - this.nodes[i - 1].value);
            d.displaySize = this.calcDisplayValue(d.value);
            d.y = d.y + alterVal;
          }
          else {
            if (d.top) {
              d.displaySize = this.calcDisplayValue(d.value);
              d.y -= this.nodes[i - 1].displaySize - alterVal;
            }
            else {
              d.displaySize = this.calcDisplayValue(d.value);
              d.y += (this.nodes[i - 1].displaySize * 2) + alterVal;
            }
          }
        }
      }
    });
  }

  calcDisplayValue(val){
    return this.baseSize * (val/this.nodes[0].value);
  }

  makeLinks(d){

    var points = [];

    if(this.nodes[d.source].input){
      points.push([this.nodes[d.source].x, (this.nodes[d.target].y+( this.nodes[d.target].displaySize/2))]);
      points.push([this.nodes[d.target].x, (this.nodes[d.target].y+( this.nodes[d.target].displaySize/2))]);
    }
    //If it links up with an inter or usefulOutput then go strait tot the interNode
    else if(this.nodes[d.target].inter || this.nodes[d.target].usefulOutput){
      points.push([(this.nodes[d.source].x - 5), (this.nodes[d.target].y+( this.nodes[d.target].displaySize/2))]);
      points.push([this.nodes[d.target].x, (this.nodes[d.target].y+(this.nodes[d.target].displaySize/2))]);
    }
    else {
      //Curved linkes
      if(this.nodes[d.target].top) {
        points.push([(this.nodes[d.source].x-5 ), (this.nodes[d.source].y+(this.nodes[d.target].displaySize/2))]);
        points.push([(this.nodes[d.source].x + 30), (this.nodes[d.source].y+(this.nodes[d.target].displaySize/2))]);
        points.push([(this.nodes[d.target].x ),(this.nodes[d.target].y + (this.nodes[d.target].displaySize / 2))]);
      }
      else {
        points.push([(this.nodes[d.source].x-5), ((this.nodes[d.source].y+this.nodes[d.source].displaySize)-(this.nodes[d.target].displaySize/2))]);
        points.push([(this.nodes[d.source].x + 30), (((this.nodes[d.source].y+this.nodes[d.source].displaySize)-(this.nodes[d.target].displaySize/2)))]);
        points.push([(this.nodes[d.target].x ),(this.nodes[d.target].y - (this.nodes[d.target].displaySize / 2))]);
      }
    }
    return this.linkGen(points);
  };

  getEndMarker(d){
    if(!this.nodes[d.target].inter || this.nodes[d.target].usefulOutput) {
      return "url(" + window.location + "#end-" + d.target + ")";
    }
    else{
      return "";
    }
  }

  updateColors(){

    //make a new gradient
    this.findColor();

    this.nodes.forEach(function(d , i){
      var node_data = d;
      if(!d.inter || d.usefulOutput) {
        console.log("num: " + i);
        this.svg.select("#end-" + i)
          .attr("fill", function () {
            return this.color(node_data.value);
          })
      }
    });

    this.links.forEach( function(d, i) {
      var link_data = d;
      this.svg.select("#linear-gradient-" + i)
        .attr("x1", this.nodes[link_data.source].x)
        .attr("y1", function() {
          if (this.nodes[link_data.target].inter || this.nodes[link_data.target].usefulOutput){
            return (this.nodes[link_data.target].y + (this.nodes[link_data.target].displaySize/2));
          }
          else{
            if(this.nodes[link_data.target].top) {
              return this.nodes[link_data.source].y;
            }
            else{
              return (this.nodes[link_data.source].y+this.nodes[link_data.source].displaySize);
            }
          }
        })
        .attr("x2", this.nodes[link_data.target].x)
        .attr("y2", function(){
          if (this.nodes[link_data.target].inter || this.nodes[link_data.target].usefulOutput) {
            return (this.nodes[link_data.target].y + (this.nodes[link_data.target].displaySize/2));
          }
          else{
            return this.nodes[link_data.target].y;
          }
        })
        .selectAll("stop")
        .data([
          {offset: "0%", color: this.color(this.nodes[link_data.source].value)},
          {offset: "76%", color: this.color(this.nodes[link_data.target].value)},
        ])
        .attr("offset", function (d) {
          return d.offset;
        })
        .attr("stop-color", function (d) {
          return d.color;
        });
    });
  }

  findColor() {
    this.color = d3.scaleLinear()
      .domain([0, this.nodes[0].value])
      .range(["#ffcc00", "#ff3300"]);
  }



}
