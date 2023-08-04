import { Component, OnInit, ViewChild, ElementRef, HostListener, EventEmitter, Output, Renderer2, Inject } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { debounce, interval, Subscription } from 'rxjs';
import { AnnotationData, GraphLayout, GraphObj, LoadingSpinner, VisualizerGraphData } from '../../log-tool-models';
import { LogToolDbService } from '../../log-tool-db.service';
import { PlotlyService } from 'angular-plotly.js';
import { LogToolDataService } from '../../log-tool-data.service';
import * as _ from 'lodash';
import { DOCUMENT } from '@angular/common';
import { DayTypeAnalysisService } from '../../day-type-analysis/day-type-analysis.service';
import { HelperFunctionsService } from '../../../shared/helper-services/helper-functions.service';
import { VisualizeMenuService } from '../visualize-menu/visualize-menu.service';

@Component({
  selector: 'app-visualize-graph',
  templateUrl: './visualize-graph.component.html',
  styleUrls: ['./visualize-graph.component.css']
})
export class VisualizeGraphComponent implements OnInit {

  @ViewChild('visualizeGraph', { static: false }) visualizeGraph: ElementRef;
  @Output('emitHeight')
  emitHeight = new EventEmitter<number>();

  @ViewChild('graphContainer', { static: false }) graphContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
      this.emitHeight.emit(this.graphContainer.nativeElement.offsetHeight);
  }

  selectedGraphDataSubscription: Subscription;
  selectedGraphObj: GraphObj;
  timeSeriesSegments: Array<TimeSeriesSegment> = [];
  selectedTimeSeriesSegment: TimeSeriesSegment;

  loadingSpinner: LoadingSpinner;
  toolTipHoldTimeout;
  showTooltipHover: boolean = false;
  showTooltipClick: boolean = false;
  shouldRenderGraphSub: Subscription;

  constructor(private visualizeService: VisualizeService,
    @Inject(DOCUMENT) private document: Document,
    private logToolDataService: LogToolDataService,
    private plotlyService: PlotlyService) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.selectedGraphDataSubscription.unsubscribe();
    this.shouldRenderGraphSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.selectedGraphDataSubscription = this.visualizeService.selectedGraphObj.pipe(
      debounce((graphObj: GraphObj) => {
        let userInputDelay: number = this.visualizeService.userInputDelay.getValue();
        return interval(userInputDelay);
      })
      ).subscribe((graphObj: GraphObj) => {
      // todo 6284 save data is creating zone.js lag
      // this.logToolDbService.saveData();
      this.selectedGraphObj = graphObj;
      this.updateGraphObjects();
      this.renderUserInputEvents();
    });

    this.shouldRenderGraphSub = this.visualizeService.shouldRenderGraph.subscribe(shouldRenderGraph => {
      if (shouldRenderGraph) {
        this.renderGraph();
      }
    });

    // if navigating from map data/time without day type analysis
    this.logToolDataService.loadingSpinner.next({show: false, msg: 'Finalizing Data Setup...'});
    window.dispatchEvent(new Event("resize"));
  }

  renderUserInputEvents() {
    // * Allow repeated emits from small input/text changes to render without Update Graph button event
    if (this.visualizeService.userInputDelay.getValue() !== 0) {
      this.visualizeService.userInputDelay.next(0);
      this.renderGraph();
    }
  }

  updateGraphObjects() {
    let graphObjects: Array<GraphObj> = this.visualizeService.graphObjects.getValue();
    if (this.selectedGraphObj) {
      let updateGraphIndex: number = graphObjects.findIndex(graph => graph.graphId === this.selectedGraphObj.graphId);
      graphObjects[updateGraphIndex] = this.selectedGraphObj;
    }
  }

  renderGraph() {
    // * For banner events (add New Graph, select graph) need to grab updated value due to race condition --> selectedGraphObj event vs shouldRenderGraph event
    this.selectedGraphObj = this.visualizeService.selectedGraphObj.getValue();
    // this.setTimeSeriesSegments(this.selectedGraphObj);
    if (this.visualizeGraph && this.selectedGraphObj) {
      this.setGraphInteractivity();
      if (this.selectedGraphObj.shouldRenderNewPlot) {
        this.plotGraph(this.selectedGraphObj);
      } else if (this.visualizeGraph.nativeElement.data) {
        this.relayoutGraph();
      }
      this.visualizeService.selectedGraphObj.next(this.selectedGraphObj);
    }
  }


  plotGraph(graphObj: GraphObj) {
    this.checkLegendDisplay(graphObj);
    this.plotlyService.newPlot(this.visualizeGraph.nativeElement, graphObj.data, graphObj.layout, graphObj.mode)
      .then(chart => {
        graphObj.shouldRenderNewPlot = false;
        this.selectedGraphObj.hasChanges = false;
        this.selectedGraphObj.isGraphInitialized = true;
        this.handlePlotlyInstanceEvents(chart);
        this.logToolDataService.loadingSpinner.next({
          show: false, msg: `Graphing Data. This may take a moment
            depending on the amount of data you have supplied...`});
        window.dispatchEvent(new Event("resize"));
      });
  }

  async relayoutGraph() {
    // call update fromm instance to avoid resize event issues
    let plotlyInstance = await this.plotlyService.getPlotly();
    plotlyInstance.update(this.visualizeGraph.nativeElement, this.selectedGraphObj.data, this.selectedGraphObj.layout, this.selectedGraphObj.mode);
    this.selectedGraphObj.hasChanges = false;
    this.logToolDataService.loadingSpinner.next({
      show: false, msg: `Graphing Data. This may take a moment
      depending on the amount of data you have supplied...`});
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

  handlePlotlyInstanceEvents(chart) {
    if (this.selectedGraphObj.data[0].type == 'bar') {
      let newRanges: PlotlyAxisRanges = this.getRestyleRanges(this.selectedGraphObj.layout);
      this.visualizeService.restyleRanges.next(newRanges);
    }
    chart.on('plotly_click', async (data) => {
      let newAnnotation: AnnotationData = this.visualizeService.getAnnotationPoint(data);
      if (this.selectedGraphObj.graphInteractivity.isGraphInteractive) {
        this.visualizeService.annotateDataPoint.next(newAnnotation);
      }
    });
  }

  setGraphInteractivity() {
    if (this.selectedGraphObj.graphInteractivity.isGraphInteractive) {
      this.selectedGraphObj.layout.hovermode = 'closest';
      this.selectedGraphObj.layout.dragmode = true;
    } else {
      this.selectedGraphObj.layout.hovermode = false;
      this.selectedGraphObj.layout.dragmode = true;
    }
  }















  // setSelectedTimeSeriesSegment(segment: TimeSeriesSegment) {
  //   this.selectedTimeSeriesSegment = segment;
  //   this.selectedGraphObj.data.forEach((graphDataSeries, seriesIndex) => {
  //     this.selectedGraphObj.data[seriesIndex] = this.selectedTimeSeriesSegment.data[seriesIndex];
  //   });

  //   let resetLayoutRanges: GraphLayout = this.visualizeService.selectedGraphObj.getValue().layout;
  //   // let resetLayoutRanges: GraphLayout = this.helperFunctionService.copyObject(this.visualizeService.selectedGraphObj.getValue().layout);
  //   this.selectedGraphObj.layout.xaxis = resetLayoutRanges.xaxis;
  //   this.selectedGraphObj.layout.yaxis = resetLayoutRanges.yaxis;
  //   this.selectedGraphObj.layout.yaxis2 = resetLayoutRanges.yaxis2;

  //   this.setGraphInteractivity();
  //   // 90-120 ms
  //   let graphObj: GraphObj = this.selectedGraphObj;
  //   // let graphObj: GraphObj = this.helperFunctionService.copyObject(this.selectedGraphObj);
  //   graphObj.layout.annotations = this.setAnnotationsInCurrentRange(graphObj);
  //   if (this.selectedTimeSeriesSegment.segmentText === 'All Datapoints' && this.selectedGraphObj.graphInteractivity.hasLargeDataset) {
  //     this.setInteractivityOffAndUpdate(graphObj);
  //   } 
  //   this.plotGraph(graphObj);
  // }

  // setInteractivityOffAndUpdate(graphObj: GraphObj) {
  //   this.logToolDataService.loadingSpinner.next({show: true, msg: `Graphing Data. This may take a moment depending on the amount of data you have supplied...`});
  //   graphObj.graphInteractivity.isGraphInteractive = false;
  //   graphObj.graphInteractivity.showUserToggledPerformanceWarning = false;
  //   graphObj.graphInteractivity.showDefaultPerformanceWarning = true;

  //   this.visualizeService.selectedGraphObj.next(graphObj);
  // }

  // setTimeSeriesSegments(graphObj: GraphObj) {
  //   this.timeSeriesSegments = [];
  //   if (this.selectedGraphObj.graphInteractivity.hasLargeDataset) {
  //       this.timeSeriesSegments = this.createTimeSeriesSegments(graphObj);
  //     if (this.selectedTimeSeriesSegment) {
  //       this.selectedGraphObj.data = this.selectedTimeSeriesSegment.data;
  //     } else {
  //       this.selectedTimeSeriesSegment = this.timeSeriesSegments[0];
  //     }
  //   }
  // }


  // // * this method creates time series segments for ANY axis selection, 'Time series' or not
  // createTimeSeriesSegments(graphObj: GraphObj): Array<TimeSeriesSegment> {
  //   this.selectedTimeSeriesSegment = undefined;
  //   let config: SegmentConfig = {
  //     dataSetLength: graphObj.data[0].y.length,
  //     // * .15 arbitrary value set to create the number of segments
  //     segmentSize: Math.floor(graphObj.data[0].y.length * .15),
  //     allDataMinDate: this.dayTypeAnalysisService.allDataMinDate,
  //     allDataMaxDate: this.dayTypeAnalysisService.allDataMaxDate,
  //   }
  //   let segmentDays: Array<TimeSeriesSegment> = [];

  //   graphObj.data.forEach((graphDataSeries: VisualizerGraphData, seriesIndex) => {
  //     // * 83 ms
  //     let currentDayData: VisualizerGraphData = this.helperFunctionService.copyObject(graphDataSeries);
  //     currentDayData.x = [];
  //     currentDayData.y = [];
  //     let timeSeriesDataX: Array<string | number> = graphDataSeries.x;
  //     if (this.selectedGraphObj.selectedXAxisDataOption.dataField.fieldName !== 'Time Series') {
  //       // * A non time-series axis is selected - get x dates to use as range for each segment
  //       timeSeriesDataX = this.visualizeService.getTimeSeriesData(graphObj.selectedXAxisDataOption.dataField);
  //     }

  //     // * if multiple data series how does non time series data change? 
  //     let currentDayText: string = moment(timeSeriesDataX[0]).format("MMM Do");
  //     // 6225 not needed anymore? check if series differ in length.. when were these concattenated?
  //     // timeSeriesDataX = this.filterTimeSeriesForSelectedY(graphObj, seriesIndex, timeSeriesDataX);

  //     for (let coordinateIndex = 0; coordinateIndex < timeSeriesDataX.length; coordinateIndex++) {
  //       let dateStamp: number | string = timeSeriesDataX[coordinateIndex];
  //       let xValue: string | number = dateStamp;
  //       if (this.selectedGraphObj.selectedXAxisDataOption.dataField.fieldName !== 'Time Series') {
  //         // * graph actual x data, not datetime values
  //         xValue = graphDataSeries.x[coordinateIndex];
  //       }  
  //       // * .02 ms * N  -> currently 4-5 seconds
  //       let monthDay: string = moment(dateStamp).format("MMM Do");
  //       let isLastDay: boolean = coordinateIndex === timeSeriesDataX.length - 1;
  //       if (monthDay !== currentDayText || isLastDay) {
  //         if (isLastDay) {
  //           // * add remaining coordinates to last series
  //           currentDayData.x.push(xValue);
  //           currentDayData.y.push(graphDataSeries.y[coordinateIndex]);
  //         } 
  //         // * 1ms
  //         let existingSegmentDayIndex = segmentDays.findIndex(day => day.segmentText === currentDayText);
  //         if (seriesIndex === 0) {
  //           // * add segment day
  //           segmentDays.push({
  //             segmentText: currentDayText,
  //             data: [currentDayData]
  //           });
  //         } 
  //         else {
  //           let existingSegment: TimeSeriesSegment = segmentDays[existingSegmentDayIndex];
  //           existingSegment.data.push(currentDayData);
  //         }

  //         currentDayText = monthDay;
  //         // * 30 ms each
  //         currentDayData = this.helperFunctionService.copyObject(graphDataSeries);
  //         currentDayData.x = [];
  //         currentDayData.y = [];

  //       } else {
  //         currentDayData.x.push(xValue);
  //         currentDayData.y.push(graphDataSeries.y[coordinateIndex]);
  //       }
  //     }
  //   });

  //   // Group day segments into reasonable amount of segments until day selection is implemented

  //   // * 4 ms
  //   let segments = this.groupTimeSeriesDaySegments(segmentDays, graphObj, config);

  //   // *4.5 secs total
  //   return segments;
  // }

  // //  6225 this method may no longer be needed
  // filterTimeSeriesForSelectedY(graphObj: GraphObj, seriesIndex: number, timeSeriesData: Array<string | number>) {
  //   //======
  //     // 6040 band aid until file/dataset processing supports multi files better
  //     // use only the time series data for the selected series (y axis), DE logic currently concats all time series data. 
  //     let previousSeriesEnd: number = 0;
  //     if (seriesIndex !== 0) {
  //       previousSeriesEnd = graphObj.data[seriesIndex - 1].y.length - 1;
  //     }
  //     timeSeriesData = timeSeriesData.slice(previousSeriesEnd, previousSeriesEnd + graphObj.data[seriesIndex].y.length);
  //     return timeSeriesData;
  //     //======
  // }

  // // create groupings, ex Jun 20 - Jul 2
  // groupTimeSeriesDaySegments(segmentDays: Array<TimeSeriesSegment>, graphObj: GraphObj, config: SegmentConfig): Array<TimeSeriesSegment> {
  //   let timeSeriesSegments: Array<TimeSeriesSegment> = [{segmentText: 'All Datapoints', data: [...graphObj.data]}];
  //   let groupedSegment: TimeSeriesSegment = {segmentText: undefined, data: []}

  //   let startDate: string = segmentDays[0].segmentText;
  //   let endDate: string;

  //   segmentDays.forEach((daySegment, index) => {
  //     if (!startDate) {
  //       startDate = daySegment.segmentText
  //     }

  //     daySegment.data.forEach((dataSeries, index) => {
  //       if (!groupedSegment.data[index]) {
  //         groupedSegment.data.push(dataSeries);
  //       } else {
  //         groupedSegment.data[index].x = groupedSegment.data[index].x.concat(dataSeries.x);
  //         groupedSegment.data[index].y = groupedSegment.data[index].y.concat(dataSeries.y);
  //       }
  //     });

  //     let isSegmentLengthLimit: boolean = groupedSegment.data[0].y.length >= config.segmentSize;
  //     if (isSegmentLengthLimit || index === segmentDays.length - 1) {
  //       endDate = daySegment.segmentText;
  //       let segmentText: string = `${startDate} - ${endDate}`;
  //       groupedSegment.segmentText = segmentText;
  //       startDate = undefined;
  //       timeSeriesSegments.push(groupedSegment);
  //       groupedSegment = {
  //         segmentText: undefined,
  //         data: []
  //       }
  //     } 
  //   });

  //   return timeSeriesSegments;
  // }

  // setAnnotationsInCurrentRange(graphObj: GraphObj): AnnotationData[] {
  //   if (graphObj.layout.annotations && graphObj.layout.annotations.length > 0) {
  //     let annotationsInRange: AnnotationData[] = []
  //     graphObj.layout.annotations.forEach(annotation => {
  //       graphObj.data.forEach((dataSeries, index) => {
  //         let matchingYIndicies: number[] = [];
  //         for (let i = 0; i < dataSeries.y.length; i++) {
  //           let yVal: number | string = dataSeries.y[i];
  //           if (yVal === annotation.y) {
  //             matchingYIndicies.push(i);
  //           };
  //         }
  //         let timeSeriesData: Array<string | number> = dataSeries.x;
  //         if (this.selectedTimeSeriesSegment.segmentText === 'All Datapoints') {
  //           timeSeriesData = this.filterTimeSeriesForSelectedY(graphObj, index, dataSeries.x);
  //         }
  //         matchingYIndicies.forEach(i => {
  //           // see if it's x pair === annotaiton x
  //           if (timeSeriesData[i] === annotation.x) {
  //             let existingAnnotation = annotationsInRange.find(existing => {
  //               if (existing.x === annotation.x && existing.y === annotation.y) {
  //                 return true;
  //               } else {
  //                 return false;
  //               }
  //             });
  //             // Only add point once - some annotation point values/intersecitons appear many times in data
  //             if (!existingAnnotation) {
  //               annotationsInRange.push(annotation);
  //             }
  //           }
  //         });
  //       });
  //     })

  //     graphObj.layout.annotations = annotationsInRange;
  //   }
  //   return graphObj.layout.annotations;
  // }



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

  toggleClickTooltip() {
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
  segmentSize: number;
  // below in date ms
  allDataMinDate: Date;
  allDataMaxDate: Date;
}

export interface TimeSeriesSegment { segmentText: string, data: Array<VisualizerGraphData> }
