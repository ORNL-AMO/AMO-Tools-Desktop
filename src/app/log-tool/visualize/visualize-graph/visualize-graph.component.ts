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
  clickEventListening: boolean = false;
  constructor(private visualizeService: VisualizeService) {
  }

  ngOnInit() {
    this.selectedGraphDataSubscription = this.visualizeService.selectedGraphObj.subscribe(graphObj => {
      let mode = {
        responsive: true,
        displaylogo: false,
        displayModeBar: true
      }

      //render chart
      Plotly.react('plotlyDiv', graphObj.data, graphObj.layout, mode).then(chart => {
        //use boolean to prevent subscribing on every plot draw
        if (!this.clickEventListening) {
          //subscribe to click event for annotations
          chart.on('plotly_click', (data) => {
            //send data point for annotations
            let newAnnotation: AnnotationData = this.visualizeService.getAnnotationPoint(data.points[0].x, data.points[0].y, data.points[0].fullData.yaxis, data.points[0].fullData.name);
            this.visualizeService.annotateDataPoint.next(newAnnotation);
          });
          this.clickEventListening = true;
        }
      });
    });
  }

  ngOnDestroy() {
    this.selectedGraphDataSubscription.unsubscribe();
  }


}
