import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ProfileSummaryData } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service'; 
import { ExploreOpportunitiesService } from '../explore-opportunities/explore-opportunities.service';
import { CompressedAirAssessmentResult, CompressedAirAssessmentResultsService, DayTypeModificationResult } from '../compressed-air-assessment-results.service';
import * as _ from 'lodash';
import { AxisRanges, HoverPositionData, SystemProfileGraphsService } from './system-profile-graphs.service';
import { Settings } from '../../shared/models/settings';
import { PlotlyService } from 'angular-plotly.js';

@Component({
  selector: 'app-system-profile-graphs',
  templateUrl: './system-profile-graphs.component.html',
  styleUrls: ['./system-profile-graphs.component.css']
})
export class SystemProfileGraphsComponent implements OnInit {
  @Input()
  inModification: boolean;
  @Input()
  isBaseline: boolean;
  @Input()
  labelName: string;

  @ViewChild("systemCapacityGraph", { static: false }) systemCapacityGraph: ElementRef;
  @ViewChild("compressorCapacityGraph", { static: false }) compressorCapacityGraph: ElementRef;
  @ViewChild("systemPowerGraph", { static: false }) systemPowerGraph: ElementRef;
  @ViewChild("compressorPowerGraph", { static: false }) compressorPowerGraph: ElementRef;

  compressedAirAssessmentSub: Subscription;
  profileSummary: Array<ProfileSummary>;
  inventoryItems: Array<CompressorInventoryItem>;
  compressedAirAssessment: CompressedAirAssessment;
  selectedDayType: CompressedAirDayType;
  selectedDayTypeSub: Subscription;
  xAxisHoverSub: Subscription;
  axisRangeAdjustment: number = .25;
  totalFullLoadPower: number;
  totalFullLoadCapacity: number;
  showingCapacityMaxSub: Subscription;
  showingPowerMaxSub: Subscription;
  settings: Settings;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private systemProfileGraphService: SystemProfileGraphsService,
    private exploreOpportunitiesService: ExploreOpportunitiesService, private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.compressedAirAssessment = val;
      if (!this.inModification) {
        this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId == this.compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId });
      }
      this.inventoryItems = val.compressorInventoryItems;
      this.setProfileData();
      this.drawCharts();
    });
    this.showingCapacityMaxSub = this.systemProfileGraphService.showingCapacityMax.subscribe(val => {
      if (this.isBaseline === false) {
        this.drawSystemCapacityChart();
      }
    });

    this.showingPowerMaxSub = this.systemProfileGraphService.showingPowerMax.subscribe(val => {
      if (this.isBaseline === false) {
        this.drawSystemPowerChart();
      }
    });

    if (this.inModification) {
      this.initModificationSubs();
    }
  }

  initModificationSubs() {
    this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
      this.setProfileData();
      this.drawCharts();
    });
    this.xAxisHoverSub = this.systemProfileGraphService.xAxisHover.subscribe(val => {
      if (val) {
        this.setHover(val);
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.showingPowerMaxSub.unsubscribe();
    this.showingCapacityMaxSub.unsubscribe();
    if (this.inModification) {
      this.xAxisHoverSub.unsubscribe();
      this.selectedDayTypeSub.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.drawCharts();
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));      
    }, 100)
  }

  setProfileData() {
    if (!this.inModification && this.compressedAirAssessment && this.selectedDayType) {
      this.profileSummary = this.compressedAirAssessmentResultsService.calculateBaselineDayTypeProfileSummary(this.compressedAirAssessment, this.selectedDayType, this.settings);
      this.setMaxLineValues(this.compressedAirAssessment.compressorInventoryItems);
      this.setYAxisRanges(this.compressedAirAssessment.systemProfile.profileSummary, this.profileSummary);
    } else if (this.compressedAirAssessment && this.selectedDayType && !this.isBaseline) {
      let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
      let modification: Modification = this.compressedAirAssessment.modifications.find(mod => { return mod.modificationId == selectedModificationId });
      let compressedAirAssessmentResult: CompressedAirAssessmentResult = this.compressedAirAssessmentResultsService.calculateModificationResults(this.compressedAirAssessment, modification, this.settings);
      let dayTypeModificationResult: DayTypeModificationResult = compressedAirAssessmentResult.dayTypeModificationResults.find(dayTypeResult => { return dayTypeResult.dayTypeId == this.selectedDayType.dayTypeId });
      this.profileSummary = dayTypeModificationResult.adjustedProfileSummary;
      this.setMaxLineValues(this.compressedAirAssessment.compressorInventoryItems, dayTypeModificationResult.adjustedCompressors);
      this.setYAxisRanges(this.compressedAirAssessment.systemProfile.profileSummary, this.profileSummary);
    } else if (this.compressedAirAssessment && this.selectedDayType && this.isBaseline) {
      this.profileSummary = this.compressedAirAssessmentResultsService.calculateBaselineDayTypeProfileSummary(this.compressedAirAssessment, this.selectedDayType, this.settings);
      this.setMaxLineValues(this.compressedAirAssessment.compressorInventoryItems);
      this.setYAxisRanges(this.compressedAirAssessment.systemProfile.profileSummary, this.profileSummary);
    }
  }

  setMaxLineValues(baselineCompressors: Array<CompressorInventoryItem>, modCompressors?: Array<CompressorInventoryItem>) {
    if (modCompressors) {
      this.totalFullLoadCapacity = _.sumBy(modCompressors, (compressor) => {
        return compressor.nameplateData.fullLoadRatedCapacity;
      });
      this.totalFullLoadPower = _.sumBy(modCompressors, (compressor) => {
        return compressor.performancePoints.fullLoad.power;
      });
    } else {
      this.totalFullLoadCapacity = _.sumBy(baselineCompressors, (inventoryItem) => {
        return inventoryItem.nameplateData.fullLoadRatedCapacity;
      });
      this.totalFullLoadPower = _.sumBy(baselineCompressors, (inventoryItem) => {
        return inventoryItem.performancePoints.fullLoad.power;
      });
    }
  }

  getMaxLineTrace(xAxisRange: Array<number>, yMaxvalue: number, name: string) {
    if (yMaxvalue) {
      let maxLineTrace = {
        x: [xAxisRange[0] - 1, xAxisRange[1] + 1],
        y: [yMaxvalue, yMaxvalue],
        type: 'scatter',
        showlegend: this.isBaseline === false ? false : true,
        mode: 'lines',
        name: name,
        line: {
          dash: 'dot',
          width: 6,
          color: '#7030A0',
        },
      };

      return maxLineTrace;
    }
  }

  setYAxisRanges(baselineSummary: Array<ProfileSummary>, modificationSummary: Array<ProfileSummary>) {
    let powerMax: Array<number> = [
      this.getStackedPowerMax(baselineSummary),
      this.getStackedPowerMax(modificationSummary)
    ];

    let airflowMax: Array<number> = [
      this.getStackedAirFlowMax(baselineSummary),
      this.getStackedAirFlowMax(modificationSummary)
    ];

    let yAxisRanges = {
      systemPowerGraph: { min: 0, max: _.max(powerMax) },
      systemCapacityGraph: { min: 0, max: _.max(airflowMax) },
    };

    this.systemProfileGraphService.yAxisRangeValues.next(yAxisRanges);
  }

  getStackedPowerMax(profileSummary: Array<ProfileSummary>) {
    let stackedMax: number = 0;
    profileSummary.forEach(summary => {
      stackedMax += _.max(summary.profileSummaryData.map(data => data.power));
    });
    return stackedMax;
  }

  getStackedAirFlowMax(profileSummary: Array<ProfileSummary>) {
    let stackedMax: number = 0;
    profileSummary.forEach(summary => {
      stackedMax += _.max(summary.profileSummaryData.map(data => data.airflow));
    });
    return stackedMax;
  }

  drawCharts() {
    this.drawSystemCapacityChart();
    this.drawCompressorPercentCapacityChart();
    this.drawSystemPowerChart();
    this.drawCompressorPercentPowerChart();
  }

  setHover(hoverPositionData: HoverPositionData) {
    // if (hoverPositionData.chartName == 'systemCapacityGraph' && this.systemCapacityGraph.nativeElement && hoverPositionData.points != undefined) {
    //   Plotly.Fx.hover(this.systemCapacityGraph.nativeElement, hoverPositionData.points)
    // }
    // if (hoverPositionData.chartName == 'compressorCapacityGraph' && this.compressorCapacityGraph.nativeElement && hoverPositionData.points != undefined) {
    //   Plotly.Fx.hover(this.compressorCapacityGraph.nativeElement, hoverPositionData.points)
    // }
    // if (hoverPositionData.chartName == 'systemPowerGraph' && this.systemPowerGraph.nativeElement && hoverPositionData.points != undefined) {
    //   Plotly.Fx.hover(this.systemPowerGraph.nativeElement, hoverPositionData.points)
    // }
    // if (hoverPositionData.chartName == 'compressorPowerGraph' && this.compressorPowerGraph.nativeElement && hoverPositionData.points != undefined) {
    //   Plotly.Fx.hover(this.compressorPowerGraph.nativeElement, hoverPositionData.points)
    // }
  }

  updateHoverPositionData(chart: any, chartName: string) {
    chart.on('plotly_hover', (data) => {
      let hoverPositionData: HoverPositionData = {
        chartName: chartName,
        points: data.points
      }
      this.systemProfileGraphService.xAxisHover.next(hoverPositionData);
    });
    chart.on('plotly_unhover', () => {
      this.systemProfileGraphService.xAxisHover.next(undefined);
    });
  }

  updateLayout(chart: any, chartRef: ElementRef) {
    chart.on('plotly_legendclick', (data) => {
      if (data.curveNumber == 2) {
        if (chartRef.nativeElement.id == 'systemCapacityGraph') {
          this.systemProfileGraphService.showingCapacityMax.next(!this.systemProfileGraphService.showingCapacityMax.getValue());
          this.drawSystemCapacityChart();
        } else {
          this.systemProfileGraphService.showingPowerMax.next(!this.systemProfileGraphService.showingPowerMax.getValue());
          this.drawSystemPowerChart();
        }
      }
    });
  }

  drawSystemCapacityChart() {
    if (this.profileSummary && this.systemCapacityGraph) {
      let traceData = new Array();
      let interval: number;
      let x: Array<number> = [];
      if (this.profileSummary[0].profileSummaryData.length > 24) {
        interval = 24 / this.profileSummary[0].profileSummaryData.length;
        for (let i = 1; i < this.profileSummary[0].profileSummaryData.length;) {
          x.push(i);
          i = i + interval;
        }
      } else {
        let xRangeMax: number = this.profileSummary[0].profileSummaryData.length > 1 ? 24 : 1;
        x = [1, xRangeMax];
      }
      this.profileSummary.forEach(compressorProfile => {
        let percentOfSystem: Array<number> = [];
        let trace = {
          x: x,
          y: compressorProfile.profileSummaryData.map(data => {
            if (data.order != 0) {
              percentOfSystem.push(data.percentSystemCapacity);
              return data.airflow
            } else {
              percentOfSystem.push(0);
              return 0;
            }
          }),
          customdata: percentOfSystem,
          type: 'bar',
          hovertemplate: `%{y:.3r} (%{customdata: .3r}%)`,
          name: this.getCompressorName(compressorProfile.compressorId),
          marker: {
            line: {
              width: 3
            }
          },

        }
        traceData.push(trace);
      });
      let yAxisRange: Array<number> = this.getYAxisRange(true, this.totalFullLoadCapacity);
      let xRangeMax: number = this.profileSummary[0].profileSummaryData.length > 1 ? 24 : 1;
      let xRange: Array<number> = [1, xRangeMax];
      let unit: string = 'acfm';
      if (this.settings.unitsOfMeasure == 'Metric') {
        unit = 'm&#xB3;/min'
      }
      let yAxisTitle: string = "System Capacity (" + unit + ")";
      var layout = this.getLayout(yAxisTitle, xRange, yAxisRange, undefined);
      var config = {
        responsive: true,
        displaylogo: false
      };

      if (this.isBaseline !== false || (this.isBaseline === false && this.systemProfileGraphService.showingCapacityMax.getValue() === true)) {
        let maxLineTrace = this.getMaxLineTrace(xRange, this.totalFullLoadCapacity, 'Max System Capacity');
        traceData.push(maxLineTrace);
      }

      this.plotlyService.newPlot(this.systemCapacityGraph.nativeElement, traceData, layout, config).then(chart => {
        this.updateHoverPositionData(chart, 'systemCapacityGraph');
        this.updateLayout(chart, this.systemCapacityGraph);
      });
    }
  }

  getYAxisRange(isCapacityGraph: boolean, maxValue: number): Array<number> {
    let yAxisRanges: AxisRanges = this.systemProfileGraphService.yAxisRangeValues.getValue();
    let graphDataMin: number;
    let graphDataMax: number;
    let showingMax: boolean;
    if (isCapacityGraph) {
      showingMax = this.systemProfileGraphService.showingCapacityMax.getValue();
      graphDataMin = yAxisRanges.systemCapacityGraph.min;
      graphDataMax = yAxisRanges.systemCapacityGraph.max;
    } else {
      showingMax = this.systemProfileGraphService.showingPowerMax.getValue();
      graphDataMin = yAxisRanges.systemPowerGraph.min;
      graphDataMax = yAxisRanges.systemPowerGraph.max;
    }
    let yAxisRange: Array<number> = [graphDataMin];
    if (showingMax && maxValue > graphDataMax) {
      yAxisRange.push(maxValue);
    } else {
      yAxisRange.push(graphDataMax + (graphDataMax * this.axisRangeAdjustment));
    }
    return yAxisRange;
  }

  drawCompressorPercentCapacityChart() {
    if (this.profileSummary && this.compressorCapacityGraph) {
      let traceData = new Array();
      let interval: number;
      let x: Array<number> = [];
      if (this.profileSummary[0].profileSummaryData.length > 24) {
        interval = 24 / this.profileSummary[0].profileSummaryData.length;
        for (let i = 1; i < this.profileSummary[0].profileSummaryData.length;) {
          x.push(i);
          i = i + interval;
        }
      } else {
        let xRangeMax: number = this.profileSummary[0].profileSummaryData.length > 1 ? 24 : 1;
        x = [1, xRangeMax];
      }
      this.profileSummary.forEach(compressorProfile => {
        let trace = {
          x: x,
          y: compressorProfile.profileSummaryData.map(data => {
            if (data.order != 0) {
              return data.percentCapacity;
            } else {
              return 0;
            }
          }),
          mode: 'lines+markers',
          hovertemplate: `%{y:.3r}`,
          name: this.getCompressorName(compressorProfile.compressorId),
          marker: {
            line: {
              width: 3
            }
          }
        }
        traceData.push(trace);
      });
      let xRangeMax: number = this.profileSummary[0].profileSummaryData.length > 1 ? 24 : 1;
      var layout = this.getLayout("Compressor Capacity (%)", [1, xRangeMax], [0, 105], '%');
      var config = {
        responsive: true,
        displaylogo: false
      };
      this.plotlyService.newPlot(this.compressorCapacityGraph.nativeElement, traceData, layout, config).then(chart => {
        this.updateHoverPositionData(chart, 'compressorCapacityGraph');
      });
    }
  }

  drawSystemPowerChart() {
    if (this.profileSummary && this.systemPowerGraph) {
      let traceData = new Array();
      let interval: number;
      let x: Array<number> = [];
      if (this.profileSummary[0].profileSummaryData.length > 24) {
        interval = 24 / this.profileSummary[0].profileSummaryData.length;
        for (let i = 1; i < this.profileSummary[0].profileSummaryData.length;) {
          x.push(i);
          i = i + interval;
        }
      } else {
        let xRangeMax: number = this.profileSummary[0].profileSummaryData.length > 1 ? 24 : 1;
        x = [1, xRangeMax];
      }
      this.profileSummary.forEach(compressorProfile => {
        let percentOfSystem: Array<number> = [];
        let trace = {
          x: x,
          y: compressorProfile.profileSummaryData.map(data => {
            if (data.order != 0) {
              percentOfSystem.push(data.percentSystemPower);
              return data.power
            } else {
              percentOfSystem.push(0);
              return 0;
            }
          }),
          customdata: percentOfSystem,
          type: 'bar',
          hovertemplate: `%{y:.3r} (%{customdata: .3r}%)`,
          name: this.getCompressorName(compressorProfile.compressorId),
          marker: {
            line: {
              width: 3
            }
          }
        }
        traceData.push(trace);
      });
      let yAxisRange: Array<number> = this.getYAxisRange(false, this.totalFullLoadPower);
      let xRangeMax: number = this.profileSummary[0].profileSummaryData.length > 1 ? 24 : 1;
      let xRange: Array<number> = [1, xRangeMax];
      var layout = this.getLayout("Power (kW)", xRange, yAxisRange, undefined);
      var config = {
        responsive: true,
        displaylogo: false
      };

      if (this.isBaseline !== false || (this.isBaseline === false && this.systemProfileGraphService.showingPowerMax.getValue() === true)) {
        let maxLineTrace = this.getMaxLineTrace(xRange, this.totalFullLoadPower, 'Max Full Load Power');
        traceData.push(maxLineTrace);
      }

      this.plotlyService.newPlot(this.systemPowerGraph.nativeElement, traceData, layout, config).then(chart => {
        this.updateHoverPositionData(chart, 'systemPowerGraph');
        this.updateLayout(chart, this.systemPowerGraph);
      });
    }
  }


  drawCompressorPercentPowerChart() {
    if (this.profileSummary && this.compressorPowerGraph) {
      let traceData = new Array();
      let interval: number;
      let x: Array<number> = [];
      if (this.profileSummary[0].profileSummaryData.length > 24) {
        interval = 24 / this.profileSummary[0].profileSummaryData.length;
        for (let i = 1; i < this.profileSummary[0].profileSummaryData.length;) {
          x.push(i);
          i = i + interval;
        }
      } else {
        let xRangeMax: number = this.profileSummary[0].profileSummaryData.length > 1 ? 24 : 1;
        x = [1, xRangeMax];
      }
      
      this.profileSummary.forEach(compressorProfile => {
        let trace = {
          x: x,
          y: compressorProfile.profileSummaryData.map(data => {
            if (data.order != 0) {
              return data.percentPower
            } else {
              return 0;
            }
          }),
          mode: 'lines+markers',
          hovertemplate: `%{y:.3r}`,
          name: this.getCompressorName(compressorProfile.compressorId),
          marker: {
            line: {
              width: 3
            }
          }
        }
        traceData.push(trace);
      });
      let xRangeMax: number = this.profileSummary[0].profileSummaryData.length > 1 ? 24 : 1;
      let xRange: Array<number> = [1, xRangeMax];
      var layout = this.getLayout("Compressor Power %", xRange, [0, 100], '%');
      var config = {
        responsive: true,
        displaylogo: false
      };
      this.plotlyService.newPlot(this.compressorPowerGraph.nativeElement, traceData, layout, config).then(chart => {
        this.updateHoverPositionData(chart, 'compressorPowerGraph');
      });
    }
  }


  getCompressorName(compressorId: string): string {
    let compressor: CompressorInventoryItem = this.inventoryItems.find(item => { return item.itemId == compressorId });
    if (compressor) {
      return compressor.name
    } else {
      return '';
    }
  }

  getLayout(yAxisTitle: string, xAxisRange: Array<number>, yAxisRange: Array<number>, yAxisTickSuffix: string) {
    return {
      showlegend: true,
      barmode: 'stack',
      xaxis: {
        autotick: false,
        range: xAxisRange,
        title: {
          text: 'Hour',
          font: {
            size: 16
          },
        },
        automargin: true
      },
      yaxis: {
        range: yAxisRange,
        ticksuffix: yAxisTickSuffix,
        title: {
          text: yAxisTitle,
          font: {
            size: 16
          },
        },
        hoverformat: ",.2f",
      },
      margin: {
        t: 20,
        r: 20
      },
      legend: {
        orientation: "h",
        y: 1.25
      }
    };
  }
}
