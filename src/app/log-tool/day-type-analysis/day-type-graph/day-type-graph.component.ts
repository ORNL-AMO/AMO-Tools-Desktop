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
  selectedGraphTypeSub: Subscription;
  constructor(private dayTypeGraphService: DayTypeGraphService, private dayTypeAnalysisService: DayTypeAnalysisService) { }

  ngOnInit() {
    this.dayTypesSubscription = this.dayTypeAnalysisService.dayTypes.subscribe(dayTypes => {
      this.setGraphData();
    });

    this.selectedGraphTypeSub = this.dayTypeGraphService.selectedGraphType.subscribe(val => {
      this.setGraphData();
    })
  }

  ngOnDestroy() {
    this.dayTypesSubscription.unsubscribe();
    this.selectedGraphTypeSub.unsubscribe();
  }

  setGraphData() {
    this.graph.data = new Array();
    this.graph.layout.title = this.dayTypeAnalysisService.selectedDataField.getValue();
    let graphData: Array<{ xData: Array<any>, yData: Array<number>, name: string, color: string }> = this.dayTypeGraphService.getDayTypeScatterPlotData();
    graphData.forEach(entry => {
      this.graph.data.push({ x: entry.xData, y: entry.yData, type: 'scatter', mode: 'lines+markers', marker: { color: entry.color }, name: entry.name })
    });
  }
}
