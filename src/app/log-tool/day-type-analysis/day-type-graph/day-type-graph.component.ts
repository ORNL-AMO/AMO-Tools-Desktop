import { Component, OnInit } from '@angular/core';
import { DayTypeGraphService } from './day-type-graph.service';

@Component({
  selector: 'app-day-type-graph',
  templateUrl: './day-type-graph.component.html',
  styleUrls: ['./day-type-graph.component.css']
})
export class DayTypeGraphComponent implements OnInit {

  graph = {
    data: [],
    layout: { title: 'CFM', hovermode: "closest" }
  };

  constructor(private dayTypeGraphService: DayTypeGraphService) { }

  ngOnInit() {
    let graphData: Array<{ xData: Array<any>, yData: Array<number>, date: Date }> = this.dayTypeGraphService.getDayTypeScatterPlotData();
    graphData.forEach(entry => {
      let color: string = 'green';
      let dayCode: number = entry.date.getDay();
      if(dayCode == 0 || dayCode == 6){
        color = 'blue';
      }
      this.graph.data.push({ x: entry.xData, y: entry.yData, type: 'scatter', mode: 'lines+markers', marker: { color: color }, name: entry.date.toDateString() })
    });
  }

}
