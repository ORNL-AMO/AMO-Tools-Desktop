import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { debounce, interval, Subscription } from 'rxjs';
import { AnnotationData, GraphInteractivity, GraphObj, LoadingSpinner, VisualizerGraphData } from '../../log-tool-models';
import { LogToolDbService } from '../../log-tool-db.service';
import { PlotlyService } from 'angular-plotly.js';
import { LogToolDataService } from '../../log-tool-data.service';

@Component({
  selector: 'app-visualize-graph',
  templateUrl: './visualize-graph.component.html',
  styleUrls: ['./visualize-graph.component.css']
})
export class VisualizeGraphComponent implements OnInit {

  @ViewChild('visualizeChart', { static: false }) visualizeChart: ElementRef;

  selectedGraphDataSubscription: Subscription;
  userGraphOptionsSubscription: Subscription;
  selectedGraphObj: GraphObj;
  graphInteractivity: GraphInteractivity;
  // timeSeriesSegments: Array<{segmentText: string, data: VisualizerGraphData}> = [];
  // selectedTimeSeriesSegment: {segmentText: string, data: VisualizerGraphData};

  loadingSpinnerSub: Subscription;
  loadingSpinner: LoadingSpinner;
  constructor(private visualizeService: VisualizeService, 
    private logToolDbService: LogToolDbService,
    private logToolDataService: LogToolDataService,
    private plotlyService: PlotlyService) {
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.selectedGraphDataSubscription.unsubscribe();
    this.userGraphOptionsSubscription.unsubscribe();
  }
  
  // 3777 TODO save selectedGraphObj held in graphUserOPtions and annotatins
  ngAfterViewInit() {
    this.selectedGraphDataSubscription = this.visualizeService.selectedGraphObj.pipe(
      debounce((graphObj: GraphObj) => {
        let userInputDelay = this.visualizeService.userInputDelay.getValue()
        return interval(userInputDelay);
      })
      ).subscribe((graphObj: GraphObj) => {
        this.logToolDbService.saveData();
        if (this.visualizeChart && graphObj) {
          this.selectedGraphObj = JSON.parse(JSON.stringify(graphObj));
          this.setGraphInteractivity(this.selectedGraphObj.graphInteractivity);
          this.plotGraph();
      }
    });

    this.userGraphOptionsSubscription = this.visualizeService.userGraphOptions
    .pipe(
      debounce((userGraphOptionsGraphObj: GraphObj) => {
        let userInputDelay = this.visualizeService.userInputDelay.getValue()
        return interval(userInputDelay);
      })
      ).subscribe((userGraphOptionsGraphObj: GraphObj) => {
      if (this.visualizeChart && userGraphOptionsGraphObj) {
        this.setUserGraphOptions(userGraphOptionsGraphObj);
        this.relayoutGraph();
        }
    });
  }

  plotGraph(displaySpinner: boolean = true) {
    this.plotlyService.newPlot(this.visualizeChart.nativeElement, this.selectedGraphObj.data, this.selectedGraphObj.layout, this.selectedGraphObj.mode)
    .then(chart => this.handlePlotlyInstanceEvents(chart, displaySpinner));
  }

  async relayoutGraph() {
    // call update form instance to avoid resize event issues
    let plotlyInstance = await this.plotlyService.getPlotly();
    plotlyInstance.update(this.visualizeChart.nativeElement, this.selectedGraphObj.data, this.selectedGraphObj.layout, this.selectedGraphObj.mode);
  }

  handlePlotlyInstanceEvents(chart, displayLoadingSpinner: boolean) {
    if (this.selectedGraphObj.data[0].type == 'bar') {
      let newRanges: PlotlyAxisRanges = this.getRestyleRanges(this.selectedGraphObj.layout);
      this.visualizeService.restyleRanges.next(newRanges);
    }
    chart.on('plotly_click', (data) => {
      if (this.graphInteractivity.isGraphInteractive) {
        let newAnnotation: AnnotationData = this.visualizeService.getAnnotationPoint(data.points[0].x, data.points[0].y, data.points[0].fullData.yaxis, data.points[0].fullData.name);
        this.visualizeService.annotateDataPoint.next(newAnnotation);
      }
    });
    if (displayLoadingSpinner) {
      setTimeout(() => {
        this.logToolDataService.loadingSpinner.next({show: false, msg: `Finishing Plot...`});
      }, 1000);
    }
  }

  dismissPerformanceWarning() {
    this.graphInteractivity.showPerformanceWarning = false;
  }

  setGraphInteractivity(graphInteractivity: GraphInteractivity) {
    this.graphInteractivity = graphInteractivity;

    if (graphInteractivity.isGraphInteractive) {
      this.selectedGraphObj.layout.hovermode = 'closest';
      // 3777 hovermode: 'x' - better performance,
      // 3777 Should we show hoverline? seen in old log tool
      this.selectedGraphObj.layout.dragmode = true;
    } else {
      this.selectedGraphObj.layout.hovermode = false;
      this.selectedGraphObj.layout.dragmode = true;
    }
  }

  setUserGraphOptions(userGraphOptionsGraphObj: GraphObj) {
    this.setGraphInteractivity(userGraphOptionsGraphObj.graphInteractivity);
    this.selectedGraphObj.layout.title.text = userGraphOptionsGraphObj.layout.title.text;
    this.selectedGraphObj.layout.xaxis.title.text = userGraphOptionsGraphObj.layout.xaxis.title.text;
    this.selectedGraphObj.layout.yaxis.title = userGraphOptionsGraphObj.layout.yaxis.title;
    this.selectedGraphObj.layout.yaxis2.title = userGraphOptionsGraphObj.layout.yaxis2.title;
    this.selectedGraphObj.layout.annotations = userGraphOptionsGraphObj.layout.annotations;
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