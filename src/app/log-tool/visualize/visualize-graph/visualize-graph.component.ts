import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { Subscription } from 'rxjs';
import { AnnotationData } from '../../log-tool-models';
import { LogToolDbService } from '../../log-tool-db.service';
import { PlotlyService } from 'angular-plotly.js';

@Component({
  selector: 'app-visualize-graph',
  templateUrl: './visualize-graph.component.html',
  styleUrls: ['./visualize-graph.component.css']
})
export class VisualizeGraphComponent implements OnInit {

  @ViewChild('visualizeChart', { static: false }) visualizeChart: ElementRef;

  selectedGraphDataSubscription: Subscription;
  plotClickSubscription: any;
  gettingRanges: any;
  constructor(private visualizeService: VisualizeService, private logToolDbService: LogToolDbService,
    private plotlyService: PlotlyService) {
  }

  ngOnInit() {
    //on init react
    this.visualizeService.plotFunctionType = 'react';

  }

  ngAfterViewInit() {
    this.selectedGraphDataSubscription = this.visualizeService.selectedGraphObj.subscribe(graphObj => {
      this.logToolDbService.saveData();
      let mode = {
        modeBarButtonsToRemove: ['lasso2d'],
        responsive: true,
        displaylogo: false,
        displayModeBar: true
      }
      if (this.visualizeChart) {
        //first time rendering chart
        // if (this.visualizeService.plotFunctionType == 'react') {
        // Plotly.purge('plotlyDiv');
        // render chart
        //use copy of layout otherwise range value gets set and messes stuff up
        //layoutCopy ranges used in data table
        let layoutCopy = JSON.parse(JSON.stringify(graphObj.layout));
        this.plotlyService.newPlot(this.visualizeChart.nativeElement, graphObj.data, layoutCopy, mode).then(chart => {
          let newRanges: PlotlyAxisRanges = this.getRestyleRanges(layoutCopy);
          this.visualizeService.restyleRanges.next(newRanges);
          // subscribe to click event for annotations
          chart.on('plotly_click', (data) => {
            // send data point for annotations
            let newAnnotation: AnnotationData = this.visualizeService.getAnnotationPoint(data.points[0].x, data.points[0].y, data.points[0].fullData.yaxis, data.points[0].fullData.name);
            this.visualizeService.annotateDataPoint.next(newAnnotation);
          });

          chart.on('plotly_relayout', (data) => {
            let newRanges: PlotlyAxisRanges = this.getRestyleRanges(layoutCopy);
            this.visualizeService.restyleRanges.next(newRanges);
          })
        });
        // } else {
        //   //update chart
        //   //use copy of layout otherwise range value gets set and messes stuff up
        //   this.plotlyService.update(this.visualizeChart.nativeElement, graphObj.data, JSON.parse(JSON.stringify(graphObj.layout)), mode);
        // }
      }
    });
  }

  ngOnDestroy() {
    this.selectedGraphDataSubscription.unsubscribe();
  }


  getRestyleRanges(layout: any): PlotlyAxisRanges {
    let xMin: number;
    let xMax: number;
    let yMin: number;
    let yMax: number;
    let y2Min: number;
    let y2Max: number;
    if (layout.xaxis.range) {
      xMin = layout.xaxis.range[0];
      xMax = layout.xaxis.range[1];
    }
    if (layout.yaxis.range) {
      yMin = layout.yaxis.range[0];
      yMax = layout.yaxis.range[1];
    }
    if (layout.yaxis2.range) {
      y2Min = layout.yaxis2.range[0];
      y2Max = layout.yaxis2.range[1];
    }
    return {
      xMin: xMin,
      xMax: xMax,
      yMin: yMin,
      yMax: yMax,
      y2Min: y2Min,
      y2Max: y2Max
    }
  }
}


export interface PlotlyAxisRanges {
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  y2Min: number,
  y2Max: number
}