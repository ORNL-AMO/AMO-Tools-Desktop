import { Component, OnInit } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { Subscription } from 'rxjs';

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
      },
      yaxis: {
        autorange: true,
        type: 'linear'
      }
    }
  };
  selectedGraphDataSubscription: Subscription;
  constructor(private visualizeService: VisualizeService) { }

  ngOnInit() {
    this.selectedGraphDataSubscription = this.visualizeService.selectedGraphData.subscribe(graphData => {
      if (graphData.graphType.value == 'bar') {
        this.graph.layout.title = 'Number of ' + graphData.histogramDataField.alias + ' Data Points';
        this.graph.data = [{ x: graphData.histogramData.xLabels, y: graphData.histogramData.yValues, type: graphData.graphType.value, mode: graphData.scatterPlotMode, name: graphData.graphName }];
      } else {
        this.graph.layout.title = graphData.selectedXDataField.alias + ' vs ' + graphData.selectedYDataField.alias;
        this.graph.data = [{ x: graphData.xData, y: graphData.yData, type: graphData.graphType.value, mode: graphData.scatterPlotMode, name: graphData.graphName }];
      }
    });
  }

  ngOnDestroy() {
    this.selectedGraphDataSubscription.unsubscribe();
  }

}
