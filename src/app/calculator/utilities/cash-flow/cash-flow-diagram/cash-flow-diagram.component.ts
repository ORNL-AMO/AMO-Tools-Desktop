import { Component, OnInit, Input } from '@angular/core';
import { CashFlowResults, CashFlowForm } from '../cash-flow';
import * as d3 from 'd3';

@Component({
  selector: 'app-cash-flow-diagram',
  templateUrl: './cash-flow-diagram.component.html',
  styleUrls: ['./cash-flow-diagram.component.css']
})
export class CashFlowDiagramComponent implements OnInit {
  @Input()
  cashFlowResults: CashFlowResults;
  // x: any;
  // y: any;
  constructor() {
     }

  ngOnInit() {
  }

}

//   function stackData(seriesData) {
//     let l = seriesData[0].length
//     while (l--) {
//       let posBase = 0; // positive base
//       let negBase = 0; // negative base
//
//       seriesData.forEach(function(d) {
//         d = d[l]
//         d.size = Math.abs(d.y)
//         if (d.y < 0) {
//           d.y0 = negBase
//           negBase -= d.size;
//         } else {
//           d.y0 = posBase = posBase + d.size;
//         }
//       });
//     }
//     seriesData.extent = d3.extent(
//       d3.merge(
//         d3.merge(
//           seriesData.map(function(e) {
//             return e.map(function(f) { return [f.y0, f.y0 - f.size];
//             });
//           })
//         )
//       )
//     );
//   }
//
//
// let data = [
//   [ {y: 4},  {y: 8},  {y: -5} ],
//   [ {y: 6},  {y: -3}, {y: -10} ],
//   [ {y: 10}, {y: -5}, {y: 5}  ]
// ]
//
// let h = 500;
// let w = 500;
// let margin = 20;
// let color = d3.scale.ordinal(d3.schemeCategory10);
//
// let x = d3.scale.ordinal()
//   .domain(['1', '2', '3'])
//   .rangeRoundBands([ margin, w - margin ], .1)
//
// let y = d3.scale.linear()
//   .range([h - margin, 0 + margin]);
//
// let xAxis = d3.svg.axis()
//   .scale(x)
//   .orient('bottom')
//   .tickSize(6, 0);
//
// let yAxis = d3.svg.axis()
//   .scale(y)
//   .orient('left');
//
// stackData(data);
// y.domain(data);
//
// this.svg = d3.select('body')
//   .append('svg')
//   .attr('height', h)
//   .attr('width', w)
//
// this.svg.selectAll('.series')
//   .data(data)
//   .enter()
//   .append('g')
//   .classed('series', true)
//   .style('fill', function(d, i) { return color(i);
//   })
//   .style('opacity', 0.8)
//   .selectAll('rect')
//   .data(Object)
//   .enter()
//   .append('rect')
//   .attr('x', function(d, i) { return x(x.domain()[i]) })
//   .attr('y', function(d) { return y(d.y0);
//   })
//   .attr('height', function(d) { return y(0) - y(d.size) })
//   .attr('width', x.rangeBand())
//   .on('mouseover', function() { tooltip.style('display', null); })
//   .on('mouseout', function() { tooltip.style('display', 'none'); })
//   .on('mousemove', function(d) {
//     let xPosition = d3.mouse(this)[0] - 35;
//     let yPosition = d3.mouse(this)[1] - 5;
//     tooltip.attr('transform', 'translate(' + xPosition + ',' + yPosition + ')');
//     tooltip.select('text').text(d.y);
//   });
//
// console.log('y(0)', y(0));
// console.log('margin', margin);
//
// this.svg.append('g')
//   .attr('class', 'axis x')
//   .attr('transform', 'translate(0 ' + y(0) + ')')
//   .call(xAxis);
//
// this.svg.append('g')
//   .attr('class', 'axis y')
//   .attr('transform', 'translate(' + margin + ' 0)')
//   .call(yAxis);
//
//
// let tooltip = this.svg.append('g')
//   .attr('class', 'tooltip')
//   .style('display', 'none');
//
// tooltip.append('rect')
//   .attr('width', 30)
//   .attr('height', 20)
//   .style('fill', 'white')
//   .style('opacity', 0.5);
//
// tooltip.append('text')
//   .attr('x', 15)
//   .attr('dy', '1.2em')
//   .style('text-anchor', 'middle')
//   .attr('font-size', '12px')
//   .attr('font-weight', 'bold');


