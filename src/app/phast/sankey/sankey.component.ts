import { Component, OnInit} from '@angular/core';

declare var d3: any;

@Component({
  selector: 'app-sankey',
  templateUrl: 'sankey.component.html',
  styleUrls: ['sankey.component.css']
})

export class SankeyComponent implements OnInit{


  constructor() {

  }

  ngOnInit() {
    this.makeSankey();
  }

  makeSankey(){

    var width = 1100,
      height = 1000;

    var color = "#485bff";


    var nodes = [

      /*0*/{ name: "Input", value: 150, x: 125, y: height/2, input: true, usefulOutput: false, inter: false, top: false},
      /*1*/{ name: "inter1", value: 0, x: 200, y: height/2, input: false, usefulOutput: false, inter: true, top: true},
      /*2*/{ name: "Flue Gas Losses", value: 50, x: 350, y: ((height/2)-50), input: false, usefulOutput: false, inter: false, top: true},
      /*3*/{ name: "inter2", value: 0, x: 275, y: height/2, input: false, usefulOutput: false, inter: true, top: false},
      /*4*/{ name: "Other Losses", value: 20, x: 575, y: ((height/2)-60), input: false, usefulOutput: false, inter: false, top: true},
      /*5*/{ name: "inter3", value: 0, x: 350, y: height/2, input: false, usefulOutput: false, inter: true, top: true},
      /*6*/{ name: "Wall Losses", value: 16, x: 725, y: ((height/2)-40), input: false, usefulOutput: false, inter: false, top: true},
      /*7*/{ name: "inter4", value: 0, x: 425, y: height/2, input: false, usefulOutput: false, inter: true, top: false},
      /*8*/{ name: "Opening Losses", value: 7, x: 800, y: ((height/2)-25), input: false, usefulOutput: false, inter: false, top: true},
      /*9*/{ name: "inter5", value: 0, x: 500, y: height/2, input: false, usefulOutput: false, inter: true, top: true},
      /*10*/{ name: "Atmosphere Losses", value: 14, x: 500, y: ((height/2)+225), input: false, usefulOutput: false, inter: false, top: false},
      /*11*/{ name: "inter6", value: 0, x: 575, y: height/2, input: false, usefulOutput: false, inter: true, top: false},
      /*12*/{ name: "Water Cooling Losses", value: 5, x: 650, y: ((height/2)+235), input: false, usefulOutput: false, inter: false, top: false},
      /*13*/{ name: "inter7", value: 0, x: 650, y: height/2, input: false, usefulOutput: false, inter: true, top: false},
      /*14*/{ name: "Fixture/Conveyor Losses", value: 5, x: 850, y: ((height/2)+225), input: false, usefulOutput: false, inter: false, top: false},
      /*15*/{ name: "Useful Output", value: 0, x: 800, y: (height/2), input: false, usefulOutput: true, inter: false, top: true}
    ];
    var links = [
      //linking to the first interNode
      { source: 0, target: 1},
      //interNode1 to Flue Gas and interNode2
      { source: 1, target: 2 },
      { source: 1, target: 3 },
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



    var alterVal = 0, shiftVal = 0;

    nodes.forEach(function(d, i){
      if (d.inter) {
        if(i == 1){
          //First interNode
          d.value = nodes[i-1].value;
          shiftVal = (nodes[0].x + nodes[0].value)-d.x;
        }
        else {
          d.value = (nodes[i - 2].value - nodes[links[i - 2].target].value);
          if (d.top) {
            d.y = d.y + alterVal;
          }
          else {
            alterVal += (nodes[i - 2].value - d.value);
            d.y = (d.y + alterVal);
          }
        }
        d.x += shiftVal;
      }
      //Triangle for all other nodes then the source
      else {
        if(d.usefulOutput){
          //Set the output node in relation to where the links will end up
          d.y = d.y+alterVal;
          d.value = (nodes[i-2].value - nodes[i-1].value);
          d.x += shiftVal;
        }
      }
    });


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

        var points = [];
        var pointsS = [];


        if(nodes[d.source].input){
          points.push([(nodes[d.source].x+nodes[d.source].value), (nodes[d.target].y+( nodes[d.target].value/2))]);
          points.push([nodes[d.target].x, (nodes[d.target].y+(nodes[d.target].value/2))]);
        }
        //If it links up with an inter or usefulOutput then go strait tot the interNode
        else if(nodes[d.target].inter || nodes[d.target].usefulOutput){
          points.push([nodes[d.source].x, (nodes[d.target].y+( nodes[d.target].value/2))]);
          points.push([nodes[d.target].x, (nodes[d.target].y+(nodes[d.target].value/2))]);
        }
        else {
          if(nodes[d.target].top) {
            points.push([(nodes[d.source].x ), (nodes[d.source].y+(nodes[d.target].value/2))]);
            points.push([(nodes[d.source].x + 30), (nodes[d.source].y+(nodes[d.target].value/2))]);
            //points.push([(nodes[d.source].x + 80), ((nodes[d.source].y+(nodes[d.target].value/2))-30)]);
            points.push([(nodes[d.target].x ),(nodes[d.target].y + (nodes[d.target].value / 2))]);
          }
          else {
            points.push([(nodes[d.source].x), ((nodes[d.source].y+nodes[d.source].value)-(nodes[d.target].value/2))]);
            points.push([(nodes[d.source].x + 30), (((nodes[d.source].y+nodes[d.source].value)-(nodes[d.target].value/2)))]);
            //points.push([(nodes[d.source].x + 80), (((nodes[d.source].y+nodes[d.source].value)-(nodes[d.target].value/2))+30)]);
            points.push([(nodes[d.target].x ),(nodes[d.target].y + (nodes[d.target].value / 2))]);
          }
        }

        return linkGen(points);

      })
      .style("stroke", color)
      //.style("stroke-opacity", ".3")
      .style("fill", "none")
      //Edit the link width here
      .style("stroke-width", function(d){
        //returns a links width equal to the target's value
        return nodes[d.target].value;
      })
      .attr('marker-end', function(d){
        if(!nodes[d.target].inter || nodes[d.target].usefulOutput) {
          return "url(" + window.location + "#end)";
        }
        else{
          return "";
        }
      });


    //Draw nodes to the svg
    var node = svg.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .append("polygon")
      .attr('class', 'node')
      .attr('points', function(d, i){
        if (d.input) {
          //input node is made as a square
          return d.x + "," + d.y + "," + (d.x+(d.value/2)) + "," + (d.y+(d.value/2)) + "," + d.x + "," + (d.y + d.value) + "," + (d.x + d.value) + "," + (d.y + d.value) + "," + (d.x + d.value) + "," + d.y;
        }
        return "";
      })
      //Color of node is red
      .style('fill', function (d) {
        return color;
      });

    var nodes_text = svg.selectAll(".nodetext")
      .data(nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dx", function(d){
        if(d.input){
          return d.x - 50;
        }
        else if(d.usefulOutput){
          return d.x + 90;
        }
        return d.x;
      })
      .attr("dy", function(d){
        if(d.input || d.usefulOutput){
          return d.y + (d.value/2);
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


  }

}
