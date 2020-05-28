import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { Subscription } from 'rxjs';
import * as Plotly from 'plotly.js';
import { AnnotationData } from '../../log-tool-models';

@Component({
  selector: 'app-visualize-graph',
  templateUrl: './visualize-graph.component.html',
  styleUrls: ['./visualize-graph.component.css']
})
export class VisualizeGraphComponent implements OnInit {

  @ViewChild('visualizeChart', { static: false }) visualizeChart: ElementRef;

  selectedGraphDataSubscription: Subscription;
  isSubscribed: boolean = false;
  constructor(private visualizeService: VisualizeService) {
  }

  ngOnInit() {
    //on init react
    this.visualizeService.plotFunctionType = 'react';

    this.selectedGraphDataSubscription = this.visualizeService.selectedGraphObj.subscribe(graphObj => {
      let mode = {
        modeBarButtonsToRemove: ['lasso2d'],
        responsive: true,
        displaylogo: false,
        displayModeBar: true
      }

      //first time rendering chart
      if (this.visualizeService.plotFunctionType == 'react') {
        Plotly.purge('plotlyDiv');
        // render chart
        //use copy of layout otherwise range value gets set and messes stuff up
        Plotly.newPlot('plotlyDiv', graphObj.data, JSON.parse(JSON.stringify(graphObj.layout)), mode).then(chart => {
          //use boolean to only subscribe once
          if (!this.isSubscribed) {
            // subscribe to click event for annotations
            chart.on('plotly_click', (data) => {
              // send data point for annotations
              let newAnnotation: AnnotationData = this.visualizeService.getAnnotationPoint(data.points[0].x, data.points[0].y, data.points[0].fullData.yaxis, data.points[0].fullData.name);
              this.visualizeService.annotateDataPoint.next(newAnnotation);
            });
            this.isSubscribed = true;
          }
        });
      } else {
        //update chart
        //use copy of layout otherwise range value gets set and messes stuff up
        Plotly.update('plotlyDiv', graphObj.data, JSON.parse(JSON.stringify(graphObj.layout)), mode);
      }
    });
  }

  ngOnDestroy() {
    this.selectedGraphDataSubscription.unsubscribe();
  }
}
