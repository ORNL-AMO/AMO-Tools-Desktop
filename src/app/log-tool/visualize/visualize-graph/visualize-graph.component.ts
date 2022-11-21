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
      let newAnnotation: AnnotationData = this.visualizeService.getAnnotationPoint(data);
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
      this.selectedGraphObj.layout.annotations = this.setAnnotationsInCurrentRange(this.selectedGraphObj);
    } 
  }

  setTimeSeriesSegments(graphObj: GraphObj) {
    this.timeSeriesSegments = [];
    if (this.selectedGraphObj.graphInteractivity.hasLargeDataset) {
      if (this.selectedGraphObj.selectedXAxisDataOption.dataField.fieldName === 'Time Series') {
        this.timeSeriesSegments = this.createTimeSeriesSegments(graphObj);
      } else {
        // A non time-series axis is selected
        let timeSeriesData: Array<number | string> = this.visualizeService.getTimeSeriesData(graphObj.selectedXAxisDataOption.dataField);
        if (timeSeriesData) {
          this.timeSeriesSegments = this.createTimeSeriesSegments(graphObj, timeSeriesData);
        }
      }

      if (this.selectedTimeSeriesSegment) {
        this.selectedGraphObj.data = this.selectedTimeSeriesSegment.data;
      } else {
        this.selectedTimeSeriesSegment = this.timeSeriesSegments[0];
      }
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
    graphObj.layout.annotations = this.setAnnotationsInCurrentRange(graphObj)
    
    this.plotGraph(graphObj, false);
  }


  createTimeSeriesSegments(graphObj: GraphObj, notSelectedTimeSeriesData?: Array<number | string>): Array<TimeSeriesSegment> {
    this.selectedTimeSeriesSegment = undefined;

    let config: SegmentConfig = {
      dataSetLength: graphObj.data[0].y.length,
      segmentSize: Math.floor(graphObj.data[0].y.length * .15),
      allDataMinDate: this.dayTypeAnalysisService.allDataMinDate,
      allDataMaxDate: this.dayTypeAnalysisService.allDataMaxDate,
    }
    
    let segmentDays: Array<TimeSeriesSegment> = [];
    graphObj.data.forEach((graphDataSeries: VisualizerGraphData, seriesIndex) => {
      let timeSeriesData: Array<string | number> = graphDataSeries.x;

      if (notSelectedTimeSeriesData) {
        timeSeriesData = notSelectedTimeSeriesData;
      }

      let currentDay: string = moment(timeSeriesData[0]).format("MMM Do");

      //======
      // 6040 band aid until file/dataset processing supports multi files better
      // use only the time series data for the selected series (y axis), DE logic currently concats all time series data. 
      let previousSeriesEnd: number = 0;
      if (seriesIndex !== 0) {
        previousSeriesEnd = graphObj.data[seriesIndex - 1].y.length;
      }
      timeSeriesData = timeSeriesData.slice(previousSeriesEnd, previousSeriesEnd + graphDataSeries.y.length);
      //======

      let currentDayData: VisualizerGraphData = JSON.parse(JSON.stringify(graphDataSeries));
      currentDayData.x = [];
      currentDayData.y = [];

      timeSeriesData.forEach((dateStamp, coordinateIndex) => {
        let monthDay: string = moment(dateStamp).format("MMM Do");

        let xValue: string | number = dateStamp;
        if (notSelectedTimeSeriesData) {
          xValue = graphDataSeries.x[coordinateIndex];
        }

        let isLastDay: boolean = coordinateIndex === timeSeriesData.length - 1;
        if (monthDay !== currentDay || isLastDay) {
          if (isLastDay) {
            currentDayData.x.push(xValue);
            currentDayData.y.push(graphDataSeries.y[coordinateIndex]);
          }
          
          if (seriesIndex === 0) {
            segmentDays.push({
              segmentText: currentDay,
              data: [currentDayData]
            });
          } 
          else {
            let existingSegment: TimeSeriesSegment = segmentDays[segmentDays.findIndex(day => day.segmentText === currentDay)];
            existingSegment.data.push(currentDayData);
          }
          
          currentDay = monthDay;
          currentDayData = JSON.parse(JSON.stringify(graphDataSeries));
          currentDayData.x = [];
          currentDayData.y = [];

        } else {
          currentDayData.x.push(xValue);
          currentDayData.y.push(graphDataSeries.y[coordinateIndex]);
        }

      });
    });

    // Group day segments into reasonable amount of segments until day selection is implemented
    return this.groupTimeSeriesDaySegments(segmentDays, graphObj, config);
  }

  groupTimeSeriesDaySegments(segmentDays: Array<TimeSeriesSegment>, graphObj: GraphObj, config: SegmentConfig): Array<TimeSeriesSegment> {
    let timeSeriesSegments: Array<TimeSeriesSegment> = [{segmentText: 'All Datapoints', data: [...graphObj.data]}];
    let groupedSegment: TimeSeriesSegment = {segmentText: undefined, data: []}

    let startDate: string = segmentDays[0].segmentText;
    let endDate: string;

    segmentDays.forEach((daySegment, index) => {
      if (!startDate) {
        startDate = daySegment.segmentText
      }

      daySegment.data.forEach((dataSeries, index) => {
        if (!groupedSegment.data[index]) {
          groupedSegment.data.push(dataSeries);
        } else {
          groupedSegment.data[index].x = groupedSegment.data[index].x.concat(dataSeries.x)
          groupedSegment.data[index].y = groupedSegment.data[index].y.concat(dataSeries.y)
        }
      });

      let isSegmentLengthLimit: boolean = groupedSegment.data[0].y.length >= config.segmentSize;
      if (isSegmentLengthLimit || index === segmentDays.length - 1) {
        endDate = daySegment.segmentText;
        let segmentText: string = `${startDate} - ${endDate}`;
        groupedSegment.segmentText = segmentText;
        startDate = undefined;
        timeSeriesSegments.push(groupedSegment);
        groupedSegment = {
          segmentText: undefined,
          data: []
        }
      } 
    });

    return timeSeriesSegments;
  }

  setAnnotationsInCurrentRange(graphObj: GraphObj): AnnotationData[] {
    if (graphObj.layout.annotations && graphObj.layout.annotations.length > 0) {
      let annotationsInRange: AnnotationData[] = []
      graphObj.layout.annotations.forEach(annotation => {
        graphObj.data.forEach(dataSeries => {

          let matchingYIndicies: number[] = [];
          dataSeries.y.forEach((yVal, index) => {
            if (yVal === annotation.y) {
              matchingYIndicies.push(index)
            };
          });
          
          matchingYIndicies.forEach(i => {
            if (dataSeries.x[i] === annotation.x) {
              let existingAnnotation = annotationsInRange.find(existing => {
                return existing.x === annotation.x && existing.y === annotation.y;
              });
              // Only add point once - some annotation point values/intersecitons appear many times in data
              if (!existingAnnotation) {
                annotationsInRange.push(annotation);
              }
            }
          })
        
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
  segmentSize: number;
  // below in date ms
  allDataMinDate: Date;
  allDataMaxDate: Date;
}

export interface TimeSeriesSegment {segmentText: string, data: Array<VisualizerGraphData>}