'use strict';

import { Component, OnInit} from '@angular/core';
import {ColorPickerService} from 'angular2-color-picker';

declare var d3: any;

var svg;

const width = 1200,
  height = 700;

const portionAmount = 30000;

@Component({
  selector: 'app-sankey',
  templateUrl: 'sankey.component.html',
  styleUrls: ['sankey.component.css']
})

export class SankeyComponent implements OnInit{

  private color: string = "#127bdc";
  constructor(private cpService: ColorPickerService) {
  }

  ngOnInit() {
  }

  closeSankey(){
    //Remove Sankey
    d3.select('app-sankey-diagram').selectAll('svg').remove();

  }

  resetZoom(){
    svg.attr("transform", "translate(150, 0) scale(.8)");
  }

  makeSankey(){

    var color = "#485bff";

    var nodes = [

      /*0*/{ name: "Input", value: 6000000, proportion: 0, x: 0, y:(height/2), input: true, usefulOutput: false, inter: false, top: false},
      /*1*/{ name: "inter1", value: 0, proportion: 0, x: 200, y: (height/2), input: false, usefulOutput: false, inter: true, top: true},
      /*2*/{ name: "Flue Gas Losses", value: 1500000, proportion: 0, x: 310, y: (height/2), input: false, usefulOutput: false, inter: false, top: true},
      /*3*/{ name: "inter2", value: 0, proportion: 0, x: 280, y: (height/2), input: false, usefulOutput: false, inter: true, top: false},
      /*4*/{ name: "Atmosphere Losses", value: 500000, proportion: 0, x: 390, y: (height/2), input: false, usefulOutput: false, inter: false, top: false},
      /*5*/{ name: "inter3", value: 0, proportion: 0, x: 390, y: (height/2), input: false, usefulOutput: false, inter: true, top: true},
      /*6*/{ name: "Other Losses", value: 400000, proportion: 0, x: 510, y: (height/2), input: false, usefulOutput: false, inter: false, top: true},
      /*7*/{ name: "inter4", value: 0, proportion: 0, x: 510, y: (height/2), input: false, usefulOutput: false, inter: true, top: false},
      /*8*/{ name: "Water Cooling Losses", value: 800000, proportion: 0, x: 670, y: (height/2), input: false, usefulOutput: false, inter: false, top: false},
      /*9*/{ name: "inter5", value: 0, proportion: 0, x: 660, y: (height/2), input: false, usefulOutput: false, inter: true, top: true},
      /*10*/{ name: "Wall Losses", value: 400000, proportion: 0, x: 780, y: (height/2), input: false, usefulOutput: false, inter: false, top: true},
      /*11*/{ name: "inter6", value: 0, proportion: 0, x: 790, y: (height/2), input: false, usefulOutput: false, inter: true, top: false},
      /*12*/{ name: "Opening Losses", value: 100000, proportion: 0, x: 920, y: (height/2), input: false, usefulOutput: false, inter: false, top: true},
      /*13*/{ name: "inter7", value: 0, proportion: 0, x: 850, y: (height/2), input: false, usefulOutput: false, inter: true, top: false},
      /*14*/{ name: "Fixture/Conveyor Losses", value: 100000, proportion: 0, x: 970, y: (height/2), input: false, usefulOutput: false, inter: false, top: false},
      /*15*/{ name: "Useful Output", value: 0, proportion: 0, x: 1000, y: (height/2), input: false, usefulOutput: true, inter: false, top: true}
    ];
    var links = [
      //linking to the first interNode
      { source: 0, target: 1},
      //interNode1 to Flue Gas and interNode2
      { source: 1, target: 2 },
      { source: 1, target: 3 },
      //interNode2 to Atmosphere and interNode3
      { source: 3, target: 4 },
      { source: 3, target: 5 },
      //interNode3 to Other and interNode4
      { source: 5, target: 6 },
      { source: 5, target: 7 },
      //interNode4 to Water and interNode5
      { source: 7, target: 8 },
      { source: 7, target: 9 },
      //interNode5 to Wall and interNode6
      { source: 9, target: 10 },
      { source: 9, target: 11 },
      //interNode6 to Opening and interNode7
      { source: 11, target: 12 },
      { source: 11, target: 13 },
      //interNode7 to Fixture and Useful Output
      { source: 13, target: 14 },
      { source: 13, target: 15 }
    ];


    svg = d3.select('app-sankey-diagram').append('svg')
      .attr('width', width)
      .attr('height', height)
      .style("border", "1px solid black")
      .call(calcSankey)
      .call(d3.zoom().on("zoom", function(){
        svg.attr("transform", d3.event.transform);
      }))
      .append("g");


    function calcSankey() {
      var alterVal = 0, shiftVal = 0;
      nodes.forEach(function (d, i) {

        if (d.inter) {
          d.y = height/2;
          //Reset height
          if (i == 1) {
            //First interNode
            d.value = nodes[i - 1].value;
            d.proportion = portionValue(d.value, portionAmount);
            shiftVal = (nodes[0].x + nodes[0].proportion) - d.x;
          }
          else {
            //Previous node.val - interNode.value
            d.value = (nodes[i - 2].value - nodes[i - 1].value);
            d.proportion = portionValue(d.value, portionAmount);
            if (d.top) {
              d.y = d.y + alterVal;
            }
            else {
              alterVal += (nodes[i - 2].proportion - d.proportion);
              d.y = (d.y + alterVal);
            }
          }
          d.x += shiftVal;
        }
        //Triangle for all other nodes then the source
        else {
          if(!d.input) {
            d.y = (height/2);
            if (d.usefulOutput) {
              //Set the output node in relation to where the links will end up
              d.y = d.y + alterVal;
              d.value = (nodes[i - 2].value - nodes[i - 1].value);
              d.proportion = portionValue(d.value, portionAmount);
            }
            else {
              d.proportion = portionValue(d.value, portionAmount);
              if (d.top) {
                d.y -= nodes[i - 1].proportion - alterVal;
              }
              else {
                d.y += (nodes[i - 1].proportion * 2) + alterVal;
              }
            }
            d.x += shiftVal;
          }
          else{
            d.proportion = portionValue(d.value, portionAmount);
          }
        }
      })
    }

    function makeLinks(d){

      var points = [];

      if(nodes[d.source].input){
        points.push([((nodes[d.source].x+nodes[d.source].proportion) - 5), (nodes[d.target].y+( nodes[d.target].proportion/2))]);
        points.push([nodes[d.target].x, (nodes[d.target].y+(nodes[d.target].proportion/2))]);
      }
      //If it links up with an inter or usefulOutput then go strait tot the interNode
      else if(nodes[d.target].inter || nodes[d.target].usefulOutput){
        points.push([(nodes[d.source].x - 5), (nodes[d.target].y+( nodes[d.target].proportion/2))]);
        points.push([nodes[d.target].x, (nodes[d.target].y+(nodes[d.target].proportion/2))]);
      }
      else {
        //Curved linkes
        if(nodes[d.target].top) {
          points.push([(nodes[d.source].x-5 ), (nodes[d.source].y+(nodes[d.target].proportion/2))]);
          points.push([(nodes[d.source].x + 30), (nodes[d.source].y+(nodes[d.target].proportion/2))]);
          points.push([(nodes[d.target].x ),(nodes[d.target].y + (nodes[d.target].proportion / 2))]);
        }
        else {
          points.push([(nodes[d.source].x-5), ((nodes[d.source].y+nodes[d.source].proportion)-(nodes[d.target].proportion/2))]);
          points.push([(nodes[d.source].x + 30), (((nodes[d.source].y+nodes[d.source].proportion)-(nodes[d.target].proportion/2)))]);
          points.push([(nodes[d.target].x ),(nodes[d.target].y - (nodes[d.target].proportion / 2))]);
        }
      }

      return linkGen(points);
    };

    function makeInputNode(d){
      if (d.input) {
        console.log(d.proportion);
        return d.x + "," + d.y + "," + d.x + "," + (d.y + d.proportion) + "," + (d.x + d.proportion) + "," + (d.y + d.proportion) + "," + (d.x + d.proportion) + "," + d.y;
      }
      else if(d.inter){
        return "";
      }
    }

    function makeEndMarker(d){
      if(!nodes[d.target].inter || nodes[d.target].usefulOutput) {
        return "url(" + window.location + "#end)";
      }
      else{
        return "";
      }
    }

    function portionValue(value, proportion){
      return value/proportion;
    }

    var marker = svg.append('svg:defs').selectAll('marker')
      .data(links)
      .enter()
      .append('svg:marker')
      .attr('id','end')
      .attr('orient', 'auto')
      .attr('refX', .1)
      .attr('refY', 0)
      .attr("viewBox", "0 -5 10 10")
      .append('svg:path')
      .attr("d", "M0,-2.5L2,0L0,2.5")
      .attr('fill', color);

    var linkGen = d3.line()
      .curve(d3.curveMonotoneX);

    //Draw links to the svg
    var link = svg.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(links)
      .enter().append('path')
      .attr("d", function(d){
        return makeLinks(d);
      })

      .style("stroke", color)
      //.style("stroke-opacity", ".3")
      .style("fill", "none")
      //Edit the link width here
      .style("stroke-width", function(d){
        //returns a links width equal to the target's value
        return nodes[d.target].proportion;
      })
      .attr('marker-end', function(d){
        return makeEndMarker(d);
      });

    //Draw nodes to the svg
    var node = svg.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .append("polygon")
      .attr('class', 'node')
      .attr('points', function(d, i){
        return makeInputNode(d);
      })
      //Color of node is red
      .style('fill', color);

    var nodes_text = svg.selectAll(".nodetext")
      .data(nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dx", function(d){
        if(d.input){
          return d.x - 70;
        }
        else if(d.usefulOutput){
          return d.x + + (nodes[15].proportion*.8) + 50;
        }
        else {
          return d.x;
        }
      })
      .attr("dy", function(d){
        if(d.input || d.usefulOutput){
          return d.y + (d.proportion/2);
        }
        else {
          if (d.top) {
            return d.y - 100;
          }
          else {
            return d.y + 100;
          }
        }
      })
      .text(function(d) {
        if(!d.inter) {
          return d.name;
        }
      });

    nodes.forEach(function(d, i){
      var node_val  = d, i = i;
      if(!node_val.inter) {
        svg.append('foreignObject')
          .attr("id", "inputObject")
          .attr("x", function () {
            if (node_val.input) {
              return node_val.x - 120;
            }
            else if (node_val.usefulOutput) {
              return d.x + + (nodes[15].proportion*.8);
            }
            else {
              return node_val.x - 50;
            }
          })
          .attr("y", function () {
            if (node_val.input || node_val.usefulOutput) {
              return (node_val.y + (node_val.proportion / 2)) + 10;
            }
            else if (node_val.top) {
              return node_val.y - 80;
            }
            else {
              return node_val.y + 50;
            }
          })
          .attr("width", 100)
          .attr("height", 50)
          .append("xhtml:sankey-diagram")
          .append("input")
          .data(nodes)
          .attr("type", "text")
          .attr("id", node_val.name)
          .attr("value", node_val.value)
          .style("width", "100px")
          .on("change", function(){
            nodes[i].value = parseFloat(this.value);
            calcSankey();
            link
              .attr("d", function(d){
                return makeLinks(d)
              })
              .style("stroke-width", function(d){
                //returns a links width equal to the target's value
                return nodes[d.target].proportion;
              })
              .attr("marker-end", function (d) {
                return makeEndMarker(d);
              });
            node
              .attr("points", function(d){
                return makeInputNode(d);
              });
            nodes_text
              .attr("dx", function(d){
                if(d.input){
                  return d.x - 70;
                }
                else if(d.usefulOutput){
                  return d.x + + (nodes[15].proportion*.8) + 50;
                }
                else {
                  return d.x;
                }
              })
              .attr("dy", function(d){
                if(d.input || d.usefulOutput){
                  return d.y + (d.proportion/2);
                }
                else {
                  if (d.top) {
                    return d.y - 100;
                  }
                  else {
                    return d.y + 100;
                  }
                }
              });

            changePlaceHolders();
          });
      }
    });


    function changePlaceHolders(){
      svg.selectAll("input")
        .attr("value", function(d,i){
          if(i == 8){
            return nodes[15].value;
          }
          else {
            return nodes[i * 2].value;
          }
        });
      svg.selectAll("inputObject")
        .data(nodes)
        .attr("x", function (d, i) {
          console.log(d);
          if(i == 8){
            return nodes[15].x + (nodes[15].proportion*.8);
          }
          else if(nodes[i * 2].input){
            return nodes[i * 2].x - 120;
          }
          else{
            return nodes[i * 2].x - 50;
          }
        })
        .attr("y", function (d, i) {
          if (nodes[i].input){
            return (nodes[i * 2].y + (nodes[i * 2].proportion / 2)) + 10;
          }
          else if(i == 8 ){
            return (nodes[15].y + (nodes[15].proportion / 2)) + 10;
          }
          else{
            if (nodes[i * 2].top) {
              return nodes[i * 2].y - 80;
            }
            else {
              return nodes[i * 2].y + 50;
            }
          }
        });

      var colorPicker = svg.html("<input [(colorPicker)]='color' [style.background]='color' [value]='color'/>");

    }
  }
}
