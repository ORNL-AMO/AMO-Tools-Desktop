import { Component, OnInit } from '@angular/core';
import { DayTypeGraphService } from './day-type-graph.service';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import { Subscription } from 'rxjs';
import * as Plotly from 'plotly.js';
@Component({
  selector: 'app-day-type-graph',
  templateUrl: './day-type-graph.component.html',
  styleUrls: ['./day-type-graph.component.css']
})
export class DayTypeGraphComponent implements OnInit {

  graph = {
    data: [],
    layout: { 
      title: undefined, 
      hovermode: "closest",
      xaxis: {
        title: {
          text: 'x axis'
        }
      },
      yaxis: {
        title: {
          text: 'y axis'
        }
      }
    }
  };
  dayTypesSubscription: Subscription;
  selectedGraphTypeSub: Subscription;
  constructor(private dayTypeGraphService: DayTypeGraphService, private dayTypeAnalysisService: DayTypeAnalysisService) { }

  ngOnInit() {
    this.dayTypesSubscription = this.dayTypeAnalysisService.dayTypes.subscribe(dayTypes => {
      this.dayTypeGraphService.setDayTypeScatterPlotData();
      this.dayTypeGraphService.setIndividualDayScatterPlotData();
      this.setGraphData();
    });

    this.selectedGraphTypeSub = this.dayTypeGraphService.selectedGraphType.subscribe(val => {
      this.setGraphData();
    });
  }

  ngOnDestroy() {
    this.dayTypesSubscription.unsubscribe();
    this.selectedGraphTypeSub.unsubscribe();
  }

  setGraphData() {
    this.graph.data = new Array();
    this.graph.layout.title = 'Hourly ' + this.dayTypeAnalysisService.selectedDataField.getValue().alias + ' Data';
    this.graph.layout.xaxis.title.text = 'Hour of day';
    this.graph.layout.yaxis.title.text = this.dayTypeAnalysisService.selectedDataField.getValue().alias;
    let graphData: Array<{ xData: Array<any>, yData: Array<number>, name: string, color: string }> = this.dayTypeGraphService.getDayTypeScatterPlotData();
    graphData.forEach(entry => {
      this.graph.data.push({ x: entry.xData, y: entry.yData, type: 'scatter', mode: 'lines+markers', marker: { color: entry.color }, name: entry.name })
    });
    Plotly.newPlot('dayTypePlotDiv', this.graph.data, this.graph.layout);
  }
}
