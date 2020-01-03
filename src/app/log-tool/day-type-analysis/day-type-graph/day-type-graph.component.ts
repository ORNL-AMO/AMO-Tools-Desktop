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
  secondaryDayTypesSubscription: Subscription;
  constructor(private dayTypeGraphService: DayTypeGraphService, private dayTypeAnalysisService: DayTypeAnalysisService) { }

  ngOnInit() {
    this.graph.layout.title = this.dayTypeGraphService.selectedDataField.getValue();
    this.dayTypesSubscription = this.dayTypeAnalysisService.dayTypes.subscribe(dayTypes => {
      this.setGraphData();
    });

    this.secondaryDayTypesSubscription = this.dayTypeAnalysisService.secondaryDayTypes.subscribe(dayTypes => {
      this.setGraphData();
    });

    this.selectedGraphTypeSub = this.dayTypeGraphService.selectedGraphType.subscribe(val => {
      this.setGraphData();
    })
  }

  ngOnDestroy() {
    this.dayTypesSubscription.unsubscribe();
    this.selectedGraphTypeSub.unsubscribe();
    this.secondaryDayTypesSubscription.unsubscribe();
  }

  setGraphData(){
    this.graph.data = new Array();
    let graphData: Array<{ xData: Array<any>, yData: Array<number>, name: string, color: string }> = this.dayTypeGraphService.getDayTypeScatterPlotData();
    graphData.forEach(entry => {
      this.graph.data.push({ x: entry.xData, y: entry.yData, type: 'scatter', mode: 'lines+markers', marker: { color: entry.color }, name: entry.name })
    });
  }
}
