import { Component, OnInit } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { Subscription } from 'rxjs';
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-visualize-graph',
  templateUrl: './visualize-graph.component.html',
  styleUrls: ['./visualize-graph.component.css']
})
export class VisualizeGraphComponent implements OnInit {

  graph = {
    data: [],
    layout: {
      title: undefined,
      hovermode: "closest",
      xaxis: {
        autorange: true,
        type: 'linear',
        title: {
          text: 'x axis'
        }
      },
      yaxis: {
        autorange: true,
        type: 'linear',
        title: {
          text: 'y axis'
        }
      }
    }
  };
  selectedGraphDataSubscription: Subscription;
  constructor(private visualizeService: VisualizeService) { }

  ngOnInit() {
    this.selectedGraphDataSubscription = this.visualizeService.selectedGraphData.subscribe(graphData => {
      if (graphData.graphType.value == 'bar') {
        this.graph.layout.title = 'Number of ' + graphData.histogramDataField.alias + ' Data Points';
        this.graph.layout.xaxis.title.text = graphData.histogramDataField.alias;
        this.graph.layout.yaxis.title.text = 'Number of Data Points';
        this.graph.data = [{ x: graphData.histogramData.xLabels, y: graphData.histogramData.yValues, type: graphData.graphType.value, mode: graphData.scatterPlotMode, name: graphData.graphName }];
      } else {
        this.graph.layout.title = graphData.selectedXDataField.alias + ' vs ' + graphData.selectedYDataField.alias;
        this.graph.layout.xaxis.title.text = graphData.selectedXDataField.alias;
        this.graph.layout.yaxis.title.text = graphData.selectedYDataField.alias;
        this.graph.data = [{ x: graphData.xData, y: graphData.yData, type: graphData.graphType.value, mode: graphData.scatterPlotMode, name: graphData.graphName }];
      }
      console.log(this.graph.data);
      Plotly.newPlot('plotlyDiv', this.graph.data, this.graph.layout, { responsive: true });
    });
  }

  ngOnDestroy() {
    this.selectedGraphDataSubscription.unsubscribe();
  }
}
