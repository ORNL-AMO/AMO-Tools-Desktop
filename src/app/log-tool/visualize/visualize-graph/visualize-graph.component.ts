import { Component, OnInit, ViewChild, ElementRef, HostListener, EventEmitter, Output, Renderer2, Inject } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { debounce, interval, Subscription } from 'rxjs';
import { AnnotationData, GraphObj, LoadingSpinner, VisualizerGraphData } from '../../log-tool-models';
import { PlotlyService } from 'angular-plotly.js';
import { LogToolDataService } from '../../log-tool-data.service';
import * as _ from 'lodash';
import { DOCUMENT } from '@angular/common';


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
    this.logToolDataService.loadingSpinner.next({ show: false, msg: 'Finalizing Data Setup...' });
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
    this.setTimeSeriesRangeSlider();

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

  focusGraph() {
    this.visualizeService.focusedPanel.next('visualize-graph');
  }
  setTimeSeriesRangeSlider() {
      this.selectedGraphObj.layout.xaxis.rangeslider = {
        autorange: true,
        visible: true
      }
    this.selectedGraphObj.layout.xaxis.type = 'date';
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
