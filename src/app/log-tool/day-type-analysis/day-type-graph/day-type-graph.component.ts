import { Component, OnInit } from '@angular/core';
import { DayTypeGraphService } from './day-type-graph.service';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-day-type-graph',
  templateUrl: './day-type-graph.component.html',
  styleUrls: ['./day-type-graph.component.css']
})
export class DayTypeGraphComponent implements OnInit {

  graph = {
    data: [],
    layout: { title: undefined, hovermode: "closest" }
  };
  dayTypesSubscription: Subscription;
  constructor(private dayTypeGraphService: DayTypeGraphService, private dayTypeAnalysisService: DayTypeAnalysisService) { }

  ngOnInit() {
    this.graph.layout.title = this.dayTypeGraphService.selectedDataField.getValue();
    this.dayTypesSubscription = this.dayTypeAnalysisService.dayTypes.subscribe(dayTypes => {
      this.graph.data = new Array();
      let graphData: Array<{ xData: Array<any>, yData: Array<number>, date: Date, color: string }> = this.dayTypeGraphService.getDayTypeScatterPlotData();
      graphData.forEach(entry => {
        this.graph.data.push({ x: entry.xData, y: entry.yData, type: 'scatter', mode: 'lines+markers', marker: { color: entry.color }, name: entry.date.toDateString() })
      });
    });
  }

  ngOnDestroy() {
    this.dayTypesSubscription.unsubscribe();
  }
}
