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
    layout: { title: undefined, hovermode: "closest" }
  };
  selectedGraphDataSubscription: Subscription;
  constructor(private visualizeService: VisualizeService) { }

  ngOnInit() {
    this.selectedGraphDataSubscription = this.visualizeService.selectedGraphData.subscribe(graphData => {
      console.log(graphData);
      this.graph.layout.title = graphData.selectedXDataField.alias + ' vs ' + graphData.selectedYDataField.alias;
      this.graph.data = [{ x: graphData.xData, y: graphData.yData, type: graphData.graphType.value, mode: graphData.scatterPlotMode, name: graphData.graphName }];
    });
  }

  ngOnDestroy() {
    this.selectedGraphDataSubscription.unsubscribe();
  }

}
