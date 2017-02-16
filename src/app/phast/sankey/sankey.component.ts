import { Component, OnInit, ElementRef} from '@angular/core';
//import {D3Service, D3, Selection} from 'd3-ng2-service';

//import * as d3 from "@types/d3";

declare var d3: any;

@Component({
  selector: 'app-sankey',
  templateUrl: 'sankey.component.html',
  styleUrls: ['sankey.component.css']
})

export class SankeyComponent implements OnInit{

  //private d3: D3;
  //private parentNativeElement: any;

  constructor() {
    //this.d3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
    //this.parentNativeElement = element.nativeElement;
  }

  ngOnInit() {
  }

  makeSankey(){

    /*
    let d3 = this.d3;
    let d3ParentElement: Selection<any, any, any, any>;

    if (this.parentNativeElement !== null) {

      d3ParentElement = d3.select(this.parentNativeElement); // <-- use the D3 select method

      // Do more D3 things
    }
    */

    var width = 2000,
      height = 2000;

    //We want to transfer this to a datafile later on
    var nodes = [
      //What is (top:) : If the node is pushed to the top or bottom when sharing the same zone as a link
      /*0*/{ name: "Input", value: 200, x: 50, y: height/2, input: true, usefulOutput: false, inter: false, top: false},
      /*1*/{ name: "inter1", value: 200, x: 400, y: height/2, input: false, usefulOutput: false, inter: true, top: true},
      /*2*/{ name: "Flue Gas Losses", value: 70, x: 550, y: ((height/2)-200), input: false, usefulOutput: false, inter: false, top: true},
      /*3*/{ name: "inter2", value: 130, x: 600, y: height/2, input: false, usefulOutput: false, inter: true, top: false},
      /*4*/{ name: "Other Losses", value: 5, x: 850, y: ((height/2)-300), input: false, usefulOutput: false, inter: false, top: true},
      /*5*/{ name: "inter3", value: 115, x: 700, y: height/2, input: false, usefulOutput: false, inter: true, top: true},
      /*6*/{ name: "Wall Losses", value: 10, x: 1100, y: ((height/2)-250), input: false, usefulOutput: false, inter: false, top: true},
      /*7*/{ name: "inter4", value: 110, x: 800, y: height/2, input: false, usefulOutput: false, inter: true, top: false},
      /*8*/{ name: "Opening Losses", value: 12, x: 1500, y: ((height/2)-150), input: false, usefulOutput: false, inter: false, top: true},
      /*9*/{ name: "inter5", value: 97, x: 950, y: height/2, input: false, usefulOutput: false, inter: true, top: true},
      /*10*/{ name: "Atmosphere Losses", value: 15, x: 770, y: ((height/2)+250), input: false, usefulOutput: false, inter: false, top: false},
      /*11*/{ name: "inter6", value: 87, x: 1150, y: height/2, input: false, usefulOutput: false, inter: true, top: false},
      /*12*/{ name: "Water Cooling Losses", value: 13, x: 1150, y: ((height/2)+270), input: false, usefulOutput: false, inter: false, top: false},
      /*13*/{ name: "inter7", value: 75, x: 1400, y: height/2, input: false, usefulOutput: false, inter: true, top: false},
      /*14*/{ name: "Fixture/Conveyor Losses", value: 9, x: 1600, y: ((height/2)+250), input: false, usefulOutput: false, inter: false, top: false},
      /*15*/{ name: "Useful Output", value: 66, x: 1700, y: (height/2), input: false, usefulOutput: true, inter: false, top: true}
    ];
    var links = [
      //linking to the first interNode
      { source: 0, target: 1},
      //interNode1 to Flue Gas and interNode2
      { source: 1, target: 3 },
      { source: 1, target: 2 },
      //interNode2 to Atmosphere and interNode3
      { source: 3, target: 10 },
      { source: 3, target: 5 },
      //interNode3 to Other and interNode4
      { source: 5, target: 4 },
      { source: 5, target: 7 },
      //interNode4 to Water and interNode5
      { source: 7, target: 12 },
      { source: 7, target: 9 },
      //interNode5 to Wall and interNode6
      { source: 9, target: 6 },
      { source: 9, target: 11 },
      //interNode6 to Opening and interNode7
      { source: 11, target: 8 },
      { source: 11, target: 13 },
      //interNode7 to Fixture and Useful Output
      { source: 13, target: 14 },
      { source: 13, target: 15 }
    ];

    //Make the svg
    var svg = d3.select('body').append('svg')
      .attr('width', width)
      .attr('height', height)
      .style("border", "1px solid black");



    var alterVal = 0;
    //Draw nodes to the svg
    var node = svg.selectAll('.node')
      .data(nodes)
      .enter().append('polygon')
      .attr('class', 'node')
      .attr('points', function(d, i){
        if (d.input) {
          //input node is made as a square
          return d.x + "," + d.y + "," + d.x + "," + (d.y + d.value) + "," + (d.x + d.value) + "," + (d.y + d.value) + "," + (d.x + d.value) + "," + d.y;
        }
        else if (d.inter) {
          if(d.top) {
            d.y = d.y + alterVal;
            return "";
          }
          else{
            alterVal += (nodes[i-2].value - d.value);
            d.y = (d.y + alterVal);
            return "";
          }
        }
        //Triangle for all other nodes then the source
        else {
          if(d.usefulOutput){
            //Set the output node in relation to where the links will end up
            d.y = d.y+alterVal;
            return d.x + "," + d.y + "," + d.x + "," + (d.y + d.value) + "," + (d.x + d.value) + "," + (d.y + (d.value / 2));
          }
          else {
            return d.x + "," + d.y + "," + d.x + "," + (d.y + d.value) + "," + (d.x + d.value) + "," + (d.y + d.value / 2);
          }
        }

      })
      //Color of node is red
      .style('fill', function (d) {
        return "red";
      })
      //Black outline
      .style('stroke', function (d) {
        return "black";
      });


      //Draw links to the svg
      var link = svg.selectAll('.link')
        .data(links)
        .enter().append('path')
        .attr("class", "link")
        .attr("d", function(d) {
          var dx = nodes[d.target].x - nodes[d.source].x,
              dy = nodes[d.target].y - nodes[d.source].y,
              dr;
          //If the source is an interNode and the target is Useful Output then make the line straight else make it a curve
          if (nodes[d.source].inter && nodes[d.target].usefulOutput) {
            //Straight link
            dr = 0;
          }
          //If the source is input and the target is an interNode then make the link straight
          else if (nodes[d.source].input && nodes[d.target].inter) {
            //Straight link
            dr = 0;
          }
          //Both source and target are interNodes
          else if (nodes[d.source].inter && nodes[d.target].inter) {
            //Straight link
            dr = 0;
          }
          else {
            if(nodes[d.target].top) {
              //Curve link
              dr = Math.sqrt(dx * dx + dy * dy);
              return "M" + (nodes[d.source].x + (nodes[d.target].value / 2)) + "," + nodes[d.source].y + "A" + dr + "," + dr + " 0 0,1 " + nodes[d.target].x + "," + (nodes[d.target].y + (nodes[d.target].value / 2));
            }
            else {
              //Curve link
              dr = Math.sqrt(dx * dx + dy * dy);
              return "M" + nodes[d.source].x + "," +((nodes[d.source].y+nodes[d.source].value)-(nodes[d.target].value/2)) + "A" + dr + "," + dr + " 0 0,1 " + nodes[d.target].x + "," + (nodes[d.target].y + (nodes[d.target].value / 2));
            }
          }
          //For straight paths
          if(nodes[d.target].top) {
            return "M" + nodes[d.source].x + "," + (nodes[d.target].y+( nodes[d.target].value/2)) + "A" + dr + "," + dr + " 0 0,1 " + nodes[d.target].x + "," + (nodes[d.target].y+( nodes[d.target].value/2));
          }
          else{
            return "M" + nodes[d.source].x + "," + (nodes[d.target].y+( nodes[d.target].value/2)) + "A" + dr + "," + dr + " 0 0,1 " + nodes[d.target].x + "," + (nodes[d.target].y+(nodes[d.target].value)/2);
          }

        })
        .style("stroke", "grey")
        .style("stroke-opacity", ".3")
        .style("fill", "none")
        //Edit the link width here
        .style("stroke-width", function(d){
          //returns a links width equal to the target's value
          return nodes[d.target].value;
        });


  }

}
