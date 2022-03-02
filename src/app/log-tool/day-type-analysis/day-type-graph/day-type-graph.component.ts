import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DayTypeGraphService } from './day-type-graph.service';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import { Subscription } from 'rxjs';
import { DayTypeGraphItem, LogToolField } from '../../log-tool-models';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PlotlyService } from 'angular-plotly.js';
@Component({
  selector: 'app-day-type-graph',
  templateUrl: './day-type-graph.component.html',
  styleUrls: ['./day-type-graph.component.css']
})
export class DayTypeGraphComponent implements OnInit {

  @ViewChild("dayTypeGraph", { static: false }) dayTypeGraph: ElementRef;


  graph = {
    data: [],
    layout: {
      title: undefined,
      hovermode: "closest",
      xaxis: {
        title: {
          text: 'x axis'
        },
        range: [1, 24]
      },
      yaxis: {
        title: {
          text: 'y axis'
        }
      }
    }
  };
  dayTypeScatterPlotDataSub: Subscription;
  dayTypeScatterPlotData: Array<DayTypeGraphItem>;
  selectedGraphTypeSub: Subscription;
  selectedGraphType: string;
  individualDayScatterPlotDataSub: Subscription;
  individualDayScatterPlotData: Array<DayTypeGraphItem>;
  constructor(private dayTypeGraphService: DayTypeGraphService, private dayTypeAnalysisService: DayTypeAnalysisService, private convertUnitsService: ConvertUnitsService,
    private plotlyService: PlotlyService) { }

  ngOnInit() {

    this.dayTypeScatterPlotDataSub = this.dayTypeGraphService.dayTypeScatterPlotData.subscribe(val => {
      this.dayTypeScatterPlotData = val;
      if (this.selectedGraphType == 'dayType') {
        this.setGraphData();
      }
    })

    this.individualDayScatterPlotDataSub = this.dayTypeGraphService.individualDayScatterPlotData.subscribe(val => {
      this.individualDayScatterPlotData = val;
      if (this.selectedGraphType == 'individualDay') {
        this.setGraphData();
      }
    })

    this.selectedGraphTypeSub = this.dayTypeGraphService.selectedGraphType.subscribe(val => {
      this.selectedGraphType = val;
      this.setGraphData();
    });
  }

  ngOnDestroy() {
    this.individualDayScatterPlotDataSub.unsubscribe();
    this.dayTypeScatterPlotDataSub.unsubscribe();
    this.selectedGraphTypeSub.unsubscribe();
  }

  setGraphData() {
    this.graph.data = new Array();
    let selectedDataField: LogToolField = this.dayTypeAnalysisService.selectedDataField.getValue();
    let labelStr: string = selectedDataField.alias;
    if (selectedDataField.unit) {
      let displayUnit: string = this.getUnitDisplay(selectedDataField.unit);
      labelStr = labelStr + ' ' + displayUnit;
    }
    this.graph.layout.title = 'Hourly ' + labelStr + ' Data';
    this.graph.layout.xaxis.title.text = 'Hour of day';
    this.graph.layout.yaxis.title.text = labelStr;
    let graphData: Array<DayTypeGraphItem> = this.getGraphData();
    graphData.forEach(entry => {
      this.graph.data.push({ x: entry.xData, y: entry.yData, type: 'scatter', mode: 'lines+markers', marker: { color: entry.color }, name: entry.name })
    });
    if (this.dayTypeGraph) {
      this.plotlyService.newPlot(this.dayTypeGraph.nativeElement, this.graph.data, this.graph.layout, { responsive: true });
    }
  }

  getGraphData(): Array<DayTypeGraphItem> {
    if (this.selectedGraphType == 'individualDay') {
      return this.individualDayScatterPlotData;
    } else if (this.selectedGraphType == 'dayType') {
      return this.dayTypeScatterPlotData;
    }
  }

  getUnitDisplay(unit: any) {
    if (unit) {
      return this.convertUnitsService.getUnit(unit).unit.name.display;
    }
  }
}
