import { Component, OnInit, ViewChild, ElementRef, HostListener, EventEmitter, Output, Renderer2, Inject } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { debounce, interval, Subscription } from 'rxjs';
import { AnnotationData, GraphObj, LoadingSpinner, VisualizerGraphData } from '../../log-tool-models';
import { PlotlyService } from 'angular-plotly.js';
import { LogToolDataService } from '../../log-tool-data.service';
import * as _ from 'lodash';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import * as Plotly from 'plotly.js-dist';


@Component({
    selector: 'app-visualize-graph',
    templateUrl: './visualize-graph.component.html',
    styleUrls: ['./visualize-graph.component.css'],
    standalone: false
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
  hasPlot: boolean;
  loadingSpinner: LoadingSpinner;
  toolTipHoldTimeout;
  showTooltipHover: boolean = false;
  showTooltipClick: boolean = false;
  shouldRenderGraphSub: Subscription;

  constructor(private visualizeService: VisualizeService,
    @Inject(DOCUMENT) private document: Document,
    private logToolDataService: LogToolDataService,
    private router: Router,
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
      this.checkValidGraph();
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
  async checkValidGraph() {
    if (this.selectedGraphObj.invalidState) {
      Plotly.purge('plotlyDiv');
      this.hasPlot = false;
    }
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

  navigateToSetupTab(tabUrl: string) {
    let url = '/log-tool/data-setup/' + tabUrl;
    this.router.navigate([url]);

  }

  renderGraph() {
    // * For banner events (add New Graph, select graph) need to grab updated value due to race condition --> selectedGraphObj event vs shouldRenderGraph event
    this.selectedGraphObj = this.visualizeService.selectedGraphObj.getValue();
    let toggleRangeButtonName = 'Toggle Range Slider';

    this.setTimeSeriesRangeSlider(this.selectedGraphObj);
    //* ensure we check for typeof click to avoid error from imported graphs
    let hasToggleRangeButton = this.selectedGraphObj.mode.modeBarButtonsToAdd.find(button => button.name === toggleRangeButtonName && button.click && typeof button.click === 'function');
    if (this.selectedGraphObj.isTimeSeries && !hasToggleRangeButton) {
      this.selectedGraphObj.mode.modeBarButtonsToAdd = this.selectedGraphObj.mode.modeBarButtonsToAdd.filter(
        button => !(button && button.name === toggleRangeButtonName)
      );
      this.selectedGraphObj.mode.modeBarButtonsToAdd.push({
        name: toggleRangeButtonName,
        icon: RangeSliderIcon,
        click: (gd) => {
          let isOn = Boolean(this.selectedGraphObj.layout.xaxis.rangeslider == undefined);
          this.setTimeSeriesRangeSlider(this.selectedGraphObj, isOn)
          Plotly.relayout(gd, this.selectedGraphObj.layout)
        }});
    } else if (!this.selectedGraphObj.isTimeSeries) {
      this.selectedGraphObj.mode.modeBarButtonsToAdd = ['toggleSpikelines'];
    }

    if (this.visualizeGraph && this.selectedGraphObj) {
      this.setGraphInteractivity();
      if (this.selectedGraphObj.shouldRenderNewPlot) {
        this.plotGraph(this.selectedGraphObj);
      } else if (this.visualizeGraph.nativeElement.data) {
        this.relayoutGraph();
      }
      this.hasPlot = true;
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
  
  setTimeSeriesRangeSlider(selectedGraphObj: GraphObj, isOn = true) {
    if (selectedGraphObj.isTimeSeries && isOn) {
      selectedGraphObj.layout.xaxis.rangeslider = {
        autorange: true,
        visible: true
      }
      selectedGraphObj.layout.xaxis.type = 'date';
    } else {
      selectedGraphObj.layout.xaxis.rangeslider = undefined;
    }
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

const RangeSliderIcon = {
  svg: `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
  <path d="M12 8V12L14.5 14.5" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M5.60423 5.60423L5.0739 5.0739V5.0739L5.60423 5.60423ZM4.33785 6.87061L3.58786 6.87438C3.58992 7.28564 3.92281 7.61853 4.33408 7.6206L4.33785 6.87061ZM6.87963 7.63339C7.29384 7.63547 7.63131 7.30138 7.63339 6.88717C7.63547 6.47296 7.30138 6.13549 6.88717 6.13341L6.87963 7.63339ZM5.07505 4.32129C5.07296 3.90708 4.7355 3.57298 4.32129 3.57506C3.90708 3.57715 3.57298 3.91462 3.57507 4.32882L5.07505 4.32129ZM3.75 12C3.75 11.5858 3.41421 11.25 3 11.25C2.58579 11.25 2.25 11.5858 2.25 12H3.75ZM16.8755 20.4452C17.2341 20.2378 17.3566 19.779 17.1492 19.4204C16.9418 19.0619 16.483 18.9393 16.1245 19.1468L16.8755 20.4452ZM19.1468 16.1245C18.9393 16.483 19.0619 16.9418 19.4204 17.1492C19.779 17.3566 20.2378 17.2341 20.4452 16.8755L19.1468 16.1245ZM5.14033 5.07126C4.84598 5.36269 4.84361 5.83756 5.13505 6.13191C5.42648 6.42626 5.90134 6.42862 6.19569 6.13719L5.14033 5.07126ZM18.8623 5.13786C15.0421 1.31766 8.86882 1.27898 5.0739 5.0739L6.13456 6.13456C9.33366 2.93545 14.5572 2.95404 17.8017 6.19852L18.8623 5.13786ZM5.0739 5.0739L3.80752 6.34028L4.86818 7.40094L6.13456 6.13456L5.0739 5.0739ZM4.33408 7.6206L6.87963 7.63339L6.88717 6.13341L4.34162 6.12062L4.33408 7.6206ZM5.08784 6.86684L5.07505 4.32129L3.57507 4.32882L3.58786 6.87438L5.08784 6.86684ZM12 3.75C16.5563 3.75 20.25 7.44365 20.25 12H21.75C21.75 6.61522 17.3848 2.25 12 2.25V3.75ZM12 20.25C7.44365 20.25 3.75 16.5563 3.75 12H2.25C2.25 17.3848 6.61522 21.75 12 21.75V20.25ZM16.1245 19.1468C14.9118 19.8483 13.5039 20.25 12 20.25V21.75C13.7747 21.75 15.4407 21.2752 16.8755 20.4452L16.1245 19.1468ZM20.25 12C20.25 13.5039 19.8483 14.9118 19.1468 16.1245L20.4452 16.8755C21.2752 15.4407 21.75 13.7747 21.75 12H20.25ZM6.19569 6.13719C7.68707 4.66059 9.73646 3.75 12 3.75V2.25C9.32542 2.25 6.90113 3.32791 5.14033 5.07126L6.19569 6.13719Z" fill="#1C274C"/>
  </svg>`
  }