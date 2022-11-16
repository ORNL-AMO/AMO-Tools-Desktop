import { Component, OnInit, ViewChild, ElementRef, HostListener, EventEmitter, Output, Renderer2, Inject } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { debounce, interval, Subscription } from 'rxjs';
import { AnnotationData, GraphLayout, GraphObj, LoadingSpinner, VisualizerGraphData } from '../../log-tool-models';
import { LogToolDbService } from '../../log-tool-db.service';
import { PlotlyService } from 'angular-plotly.js';
import { LogToolDataService } from '../../log-tool-data.service';
import moment from 'moment';
import * as _ from 'lodash';
import { DOCUMENT } from '@angular/common';
import { DayTypeAnalysisService } from '../../day-type-analysis/day-type-analysis.service';

@Component({
  selector: 'app-visualize-graph',
  templateUrl: './visualize-graph.component.html',
  styleUrls: ['./visualize-graph.component.css']
})
export class VisualizeGraphComponent implements OnInit {

  @ViewChild('visualizeChart', { static: false }) visualizeChart: ElementRef;
  @Output('emitHeight')
  emitHeight = new EventEmitter<number>();

  @ViewChild('graphContainer', { static: false }) graphContainer: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.emitHeight.emit(this.graphContainer.nativeElement.offsetHeight);
    }, 50);
  }

  selectedGraphDataSubscription: Subscription;
  userGraphOptionsSubscription: Subscription;
  selectedGraphObj: GraphObj;
  timeSeriesSegments: Array<TimeSeriesSegment> = [];
  selectedTimeSeriesSegment: TimeSeriesSegment;

  loadingSpinnerSub: Subscription;
  loadingSpinner: LoadingSpinner;
  toolTipHoldTimeout;
  showTooltipHover: boolean = false;
  showTooltipClick: boolean = false;

  constructor(private visualizeService: VisualizeService, 
    @Inject(DOCUMENT) private document: Document,
    private logToolDbService: LogToolDbService,
    private logToolDataService: LogToolDataService,
    private dayTypeAnalysisService: DayTypeAnalysisService,
    private plotlyService: PlotlyService) {
  }

  ngOnInit() {
    this.logToolDataService.loadingSpinner.next({show: true, msg: `Graphing Data...`});
  }

  ngOnDestroy() {
    this.selectedGraphDataSubscription.unsubscribe();
    this.userGraphOptionsSubscription.unsubscribe();
  }
  
  ngAfterViewInit() {
    this.selectedGraphDataSubscription = this.visualizeService.selectedGraphObj.pipe(
      debounce((graphObj: GraphObj) => {
        let userInputDelay: number = this.visualizeService.userInputDelay.getValue()
        return interval(userInputDelay);
      })
      ).subscribe((graphObj: GraphObj) => {
        this.logToolDbService.saveData();
        if (this.visualizeChart && graphObj) {
          this.selectedGraphObj = JSON.parse(JSON.stringify(graphObj));
          this.visualizeService.setDefaultGraphInteractivity(this.selectedGraphObj, this.selectedGraphObj.data[0].x.length)
          this.setGraphInteractivity(this.selectedGraphObj);
          this.setTimeSeriesSegments(this.selectedGraphObj);
          this.plotGraph(this.selectedGraphObj);
          window.dispatchEvent(new Event("resize"));
      }
    });

    this.userGraphOptionsSubscription = this.visualizeService.userGraphOptions
    .pipe(
      debounce((userGraphOptionsGraphObj: GraphObj) => {
        let userInputDelay: number = this.visualizeService.userInputDelay.getValue()
        return interval(userInputDelay);
      })
      ).subscribe((userGraphOptionsGraphObj: GraphObj) => {
      if (this.visualizeChart && this.selectedGraphObj && userGraphOptionsGraphObj) {
        this.setUserGraphOptions(userGraphOptionsGraphObj);
        this.relayoutGraph();
      } 
    });
  }

  plotGraph(graphObj: GraphObj, displaySpinner: boolean = true) {
    this.checkLegendDisplay(graphObj);
    this.plotlyService.newPlot(this.visualizeChart.nativeElement, graphObj.data, graphObj.layout, graphObj.mode)
    .then(chart => this.handlePlotlyInstanceEvents(chart, displaySpinner));
    window.dispatchEvent(new Event("resize"));
  }

  async relayoutGraph() {
    // call update form instance to avoid resize event issues
    let plotlyInstance = await this.plotlyService.getPlotly();
    plotlyInstance.update(this.visualizeChart.nativeElement, this.selectedGraphObj.data, this.selectedGraphObj.layout, this.selectedGraphObj.mode);
    window.dispatchEvent(new Event("resize"));
  }

  checkLegendDisplay(graphObj: GraphObj) {
    if (graphObj.data.length > 1) {
      let hasLongName: boolean = graphObj.data.some(dataSeries => dataSeries.name.length > 20);
      if (hasLongName) {
        graphObj.layout.legend = {
          orientation: "h",
          y: -.25,
          margin: {
            t: 75,
            b: 50
          }
        }
      }
    }
  }

  handlePlotlyInstanceEvents(chart, displayLoadingSpinner: boolean) {
    if (this.selectedGraphObj.data[0].type == 'bar') {
      let newRanges: PlotlyAxisRanges = this.getRestyleRanges(this.selectedGraphObj.layout);
      this.visualizeService.restyleRanges.next(newRanges);
    }
    chart.on('plotly_click', async (data) => {
      let newAnnotation: AnnotationData = this.visualizeService.getAnnotationPoint(data.points[0].x, data.points[0].y, data.points[0].fullData.yaxis, data.points[0].fullData.name);
      if (this.selectedGraphObj.graphInteractivity.isGraphInteractive) {
        this.visualizeService.annotateDataPoint.next(newAnnotation);
      }
    });
    if (displayLoadingSpinner) {
      setTimeout(() => {
        this.logToolDataService.loadingSpinner.next({show: false, msg: `Graphing Data...`});
      }, 1000);
    }
  }

  setGraphInteractivity(graphObj: GraphObj) {
    if (graphObj.graphInteractivity.isGraphInteractive) {
      this.selectedGraphObj.graphInteractivity = graphObj.graphInteractivity;
      this.selectedGraphObj.layout.hovermode = 'closest';
      this.selectedGraphObj.layout.dragmode = true;
    } else {
      this.selectedGraphObj.layout.hovermode = false;
      this.selectedGraphObj.layout.dragmode = true;
    }
  }

  setUserGraphOptions(userGraphOptionsGraphObj: GraphObj) {
    // Keep current layout and any zooms/drags
    let graphElement: any = this.document.getElementById('plotlyDiv');
    this.selectedGraphObj.layout = graphElement.layout;

    this.visualizeService.setCustomGraphInteractivity(userGraphOptionsGraphObj, userGraphOptionsGraphObj.data[0].x.length);
    this.setGraphInteractivity(userGraphOptionsGraphObj);
    this.selectedGraphObj.layout.title.text = userGraphOptionsGraphObj.layout.title.text;
    this.selectedGraphObj.layout.xaxis.title.text = userGraphOptionsGraphObj.layout.xaxis.title.text;
    this.selectedGraphObj.layout.yaxis.title = userGraphOptionsGraphObj.layout.yaxis.title;
    this.selectedGraphObj.layout.yaxis2.title = userGraphOptionsGraphObj.layout.yaxis2.title;
    this.selectedGraphObj.layout.annotations = userGraphOptionsGraphObj.layout.annotations;

    if (this.selectedTimeSeriesSegment && this.selectedTimeSeriesSegment !== this.timeSeriesSegments[0]) {
      this.selectedGraphObj.layout.annotations = this.checkRemoveAnnotationsFromSegment(this.selectedGraphObj);
    } 
  }

  setSelectedTimeSeriesSegment(segment: TimeSeriesSegment) {
    this.selectedTimeSeriesSegment = segment;
    this.selectedGraphObj.data.forEach((graphDataSeries, seriesIndex) => {
      this.selectedGraphObj.data[seriesIndex] = this.selectedTimeSeriesSegment.data[seriesIndex];
    });
    
    let userGraphOptionsObj: GraphObj = this.visualizeService.userGraphOptions.getValue()
    if (userGraphOptionsObj) {
      this.selectedGraphObj.layout = userGraphOptionsObj.layout;
      this.selectedGraphObj.graphInteractivity = userGraphOptionsObj.graphInteractivity;
    }

    let resetLayoutRanges: GraphLayout = JSON.parse(JSON.stringify(this.visualizeService.selectedGraphObj.getValue().layout));
    this.selectedGraphObj.layout.xaxis = resetLayoutRanges.xaxis;
    this.selectedGraphObj.layout.yaxis = resetLayoutRanges.yaxis;
    this.selectedGraphObj.layout.yaxis2 = resetLayoutRanges.yaxis2;

    this.setGraphInteractivity(this.selectedGraphObj);

    let graphObj: GraphObj = JSON.parse(JSON.stringify(this.selectedGraphObj))
    graphObj.layout.annotations = this.checkRemoveAnnotationsFromSegment(graphObj)
    
    this.plotGraph(graphObj, false);
  }

  // currently only works for single chart
  setTimeSeriesSegments(graphObj: GraphObj) {
    this.timeSeriesSegments = [];
    if (this.selectedGraphObj.selectedXAxisDataOption.dataField.fieldName === 'Time Series' &&
      this.selectedGraphObj.graphInteractivity.hasLargeDataset) {
      this.timeSeriesSegments = this.createTimeSeriesSegments(graphObj);
      if (this.selectedTimeSeriesSegment) {
        this.selectedGraphObj.data = this.selectedTimeSeriesSegment.data;
      } else {
        this.selectedTimeSeriesSegment = this.timeSeriesSegments[0];
      }
    }
  }


  // Update for 3781 multiple files compare
  // createTimeSeriesSegments(graphObj: GraphObj): Array<TimeSeriesSegment> {
  //   this.selectedTimeSeriesSegment = undefined;
    
  //   let timeSeriesSegments: Array<TimeSeriesSegment> = [
  //     {
  //       segmentText: 'All Datapoints',
  //       data: [...graphObj.data]
  //     }
  //   ];

  //   // Assume same data length for all series
  //   let dataSetLength = graphObj.data[0].y.length;
  //   let segmentSize: number = Math.floor(dataSetLength / 5);
    
  //   for (let i = 0; i < dataSetLength; i += segmentSize) {  
  //     let segmentStart: number = i;
  //     let segmentEnd: number = i + segmentSize;
  //     let lastSegment: boolean = i + segmentSize > dataSetLength;
  //     if (lastSegment) {
  //       segmentEnd = dataSetLength - 1;
  //     }
      
  //     let timeSeriesSegment: TimeSeriesSegment = {
  //       segmentText: undefined,
  //       data: []
  //     }

  //     graphObj.data.forEach((graphDataSeries, seriesIndex) => {
  //       let xVals = graphDataSeries.x;
  //       let yVals = graphDataSeries.y;
  //       let YtimeSeriesSegment: Array<(string | number)> = yVals.slice(segmentStart, segmentEnd);
  //       let XtimeSeriesSegment: Array<(string | number)> = xVals.slice(segmentStart, segmentEnd);
  //       let timeSeriesData = JSON.parse(JSON.stringify(graphDataSeries));
  //       timeSeriesData.x = XtimeSeriesSegment;
  //       timeSeriesData.y = YtimeSeriesSegment;

  //       debugger;
  //       let startDate: string = moment(XtimeSeriesSegment[0]).format("MMM Do");
  //       let endDate: string = moment(XtimeSeriesSegment[XtimeSeriesSegment.length - 1]).format("MMM Do");
        
  //       if (seriesIndex === 0) {
  //         let segmentText: string = `${startDate} - ${endDate}`;
  //         timeSeriesSegment.segmentText = segmentText
  //       } 
  //       timeSeriesSegment.data.push(timeSeriesData)
  
  //       if (lastSegment) {
  //         let previousSegment = timeSeriesSegments[timeSeriesSegments.length - 1];
  //         previousSegment.segmentText = `${previousSegment.segmentText.split('-')[0]} - ${endDate}`;
  //         previousSegment.data[seriesIndex].x.push(timeSeriesData.x);
  //         previousSegment.data[seriesIndex].y.push(timeSeriesData.y);
  //       }
  //     });
      
  //     if (!lastSegment) {
  //       timeSeriesSegments.push(timeSeriesSegment);
  //     }
  //   }

  //   return timeSeriesSegments;
  // }

  createTimeSeriesSegments(graphObj: GraphObj): Array<TimeSeriesSegment> {
    this.selectedTimeSeriesSegment = undefined;
    
    let timeSeriesSegments: Array<TimeSeriesSegment> = [
      {
        segmentText: 'All Datapoints',
        data: [...graphObj.data]
      }
    ];


    let config: SegmentConfig = this.setSeriesSegmentConfig(graphObj);
    
    // Assume same data length for all series
    for (let i = 0; i < config.dataSetLength; i += config.segmentSize) {  
      let segmentStart: number = i;
      let segmentEnd: number = i + config.segmentSize;
      let lastSegment: boolean = i + config.segmentSize > config.dataSetLength;
      if (lastSegment) {
        segmentEnd = config.dataSetLength - 1;
      }

      let timeSeriesSegment: TimeSeriesSegment = {
        segmentText: undefined,
        data: []
      }

      graphObj.data.forEach((graphDataSeries, seriesIndex) => {
        let xVals = graphDataSeries.x;
        let yVals = graphDataSeries.y;
        let YtimeSeriesSegment: Array<(string | number)> = yVals.slice(segmentStart, segmentEnd);
        let XtimeSeriesSegment: Array<(string | number)> = xVals.slice(segmentStart, segmentEnd);
        let timeSeriesData = JSON.parse(JSON.stringify(graphDataSeries));
        timeSeriesData.x = XtimeSeriesSegment;
        timeSeriesData.y = YtimeSeriesSegment;

        let startDate: string = moment(XtimeSeriesSegment[0]).format("MMM Do");
        let endDate: string = moment(XtimeSeriesSegment[XtimeSeriesSegment.length - 1]).format("MMM Do");
        
        if (seriesIndex === 0) {
          let segmentText: string = `${startDate} - ${endDate}`;
          timeSeriesSegment.segmentText = segmentText
        } 
        timeSeriesSegment.data.push(timeSeriesData)
  
        if (lastSegment) {
          let previousSegment = timeSeriesSegments[timeSeriesSegments.length - 1];
          previousSegment.segmentText = `${previousSegment.segmentText.split('-')[0]} - ${endDate}`;
          previousSegment.data[seriesIndex].x.push(timeSeriesData.x);
          previousSegment.data[seriesIndex].y.push(timeSeriesData.y);
        }
      });
      
      if (!lastSegment) {
        timeSeriesSegments.push(timeSeriesSegment);
      }
    }

    return timeSeriesSegments;
  }

  setSeriesSegmentConfig(graphObj: GraphObj) {
    let config: SegmentConfig = {
      dataSetLength: graphObj.data[0].y.length,
      totalSegments: 5,
      segmentSize: Math.floor(graphObj.data[0].y.length / 5),
      allDataMinDate: this.dayTypeAnalysisService.allDataMinDate,
      allDataMaxDate: this.dayTypeAnalysisService.allDataMaxDate,
      dataSeriesStarts: [],
      dataSeriesEnds: []
    }

    // graphObj.data.forEach((graphDataSeries, seriesIndex) => {

    // });

    return config;
  }

  checkRemoveAnnotationsFromSegment(graphObj: GraphObj): AnnotationData[] {
    if (graphObj.layout.annotations && graphObj.layout.annotations.length > 0) {
      let annotationsInRange: AnnotationData[] = []
      graphObj.layout.annotations.forEach(annotation => {
        let matchingYIndicies: number[] = [];
        graphObj.data[0].y.forEach((yVal, index) => {
          if (yVal === annotation.y) {
            matchingYIndicies.push(index)
          };
        });
        
        matchingYIndicies.forEach(i => {
          if (graphObj.data[0].x[i] === annotation.x) {
            annotationsInRange.push(annotation);
          }
        })
      })
      
      graphObj.layout.annotations = annotationsInRange;
    }
    return graphObj.layout.annotations;
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

  hideTooltipHover() {
    // Allow user to hover on tip text
    this.toolTipHoldTimeout = setTimeout(() => {
      this.showTooltipHover = false;
    }, 200)
  }

  displayTooltipHover(hoverOnInfo: boolean = false) {
    if (hoverOnInfo) {
      clearTimeout(this.toolTipHoldTimeout);
    }
    this.showTooltipHover = true;
  }

  toggleClickTooltip(){
    this.showTooltipClick = !this.showTooltipClick;
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

export interface SegmentConfig {
  dataSetLength: number;
  totalSegments: number;
  segmentSize: number;

  // below in date ms
  allDataMinDate: Date;
  allDataMaxDate: Date;
  dataSeriesStarts: Array<number>;
  dataSeriesEnds: Array<number>;

}

export interface TimeSeriesSegment {segmentText: string, data: Array<VisualizerGraphData>}