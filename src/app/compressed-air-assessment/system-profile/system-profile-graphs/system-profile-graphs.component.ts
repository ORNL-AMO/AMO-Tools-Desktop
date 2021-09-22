import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ProfileSummaryData } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import * as Plotly from 'plotly.js';
import { ExploreOpportunitiesService } from '../../explore-opportunities/explore-opportunities.service';
import { CompressedAirAssessmentResult, CompressedAirAssessmentResultsService, DayTypeModificationResult } from '../../compressed-air-assessment-results.service';
import * as _ from 'lodash';
import { AxisRanges, HoverPositionData, SystemProfileGraphsService } from './system-profile-graphs.service';

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
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private systemProfileGraphService: SystemProfileGraphsService,
    private exploreOpportunitiesService: ExploreOpportunitiesService, private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.compressedAirAssessment = val;
      if (!this.inModification) {
        this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId == this.compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId });
      }
      this.inventoryItems = val.compressorInventoryItems;
      this.setProfileData();
      this.drawCharts();
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
    if (this.inModification) {
      this.xAxisHoverSub.unsubscribe();
      this.selectedDayTypeSub.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.drawCharts();
  }

  setProfileData() {
    if (!this.inModification && this.compressedAirAssessment && this.selectedDayType) {
      this.profileSummary = this.compressedAirAssessmentResultsService.calculateBaselineDayTypeProfileSummary(this.compressedAirAssessment, this.selectedDayType);
      this.setMaxLineValues(this.compressedAirAssessment.compressorInventoryItems);
      this.setYAxisRanges(this.compressedAirAssessment.systemProfile.profileSummary, this.profileSummary);
    } else if (this.compressedAirAssessment && this.selectedDayType && !this.isBaseline) {
      let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
      let modification: Modification = this.compressedAirAssessment.modifications.find(mod => { return mod.modificationId == selectedModificationId });
      let compressedAirAssessmentResult: CompressedAirAssessmentResult = this.compressedAirAssessmentResultsService.calculateModificationResults(this.compressedAirAssessment, modification);
      let dayTypeModificationResult: DayTypeModificationResult = compressedAirAssessmentResult.dayTypeModificationResults.find(dayTypeResult => { return dayTypeResult.dayTypeId == this.selectedDayType.dayTypeId });
      this.profileSummary = dayTypeModificationResult.adjustedProfileSummary;
      this.setMaxLineValues(this.compressedAirAssessment.compressorInventoryItems, dayTypeModificationResult.adjustedCompressors);
      this.setYAxisRanges(this.compressedAirAssessment.systemProfile.profileSummary, this.profileSummary);
    } else if (this.compressedAirAssessment && this.selectedDayType && this.isBaseline) {
      this.profileSummary = this.compressedAirAssessmentResultsService.calculateBaselineDayTypeProfileSummary(this.compressedAirAssessment, this.selectedDayType);
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
      systemPowerGraph: {min: 0, max: _.max(powerMax) },
      systemCapacityGraph: {min: 0, max: _.max(airflowMax) },
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
    if (hoverPositionData.chartName == 'systemCapacityGraph' && this.systemCapacityGraph.nativeElement && hoverPositionData.points != undefined) {
      Plotly.Fx.hover(this.systemCapacityGraph.nativeElement, hoverPositionData.points)
    }
    if (hoverPositionData.chartName == 'compressorCapacityGraph' && this.compressorCapacityGraph.nativeElement && hoverPositionData.points != undefined) {
      Plotly.Fx.hover(this.compressorCapacityGraph.nativeElement, hoverPositionData.points)
    }
    if (hoverPositionData.chartName == 'systemPowerGraph' && this.systemPowerGraph.nativeElement && hoverPositionData.points != undefined) {
      Plotly.Fx.hover(this.systemPowerGraph.nativeElement, hoverPositionData.points)
    }
    if (hoverPositionData.chartName == 'compressorPowerGraph' && this.compressorPowerGraph.nativeElement && hoverPositionData.points != undefined) {
      Plotly.Fx.hover(this.compressorPowerGraph.nativeElement, hoverPositionData.points)
    }
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

  drawSystemCapacityChart() {
    if (this.profileSummary && this.systemCapacityGraph) {
      let traceData = new Array();
      this.profileSummary.forEach(compressorProfile => {
        let percentOfSystem: Array<number> = [];
        let trace = {
          x: compressorProfile.profileSummaryData.map(data => { return data.timeInterval }),
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
      let yAxisRanges: AxisRanges = this.systemProfileGraphService.yAxisRangeValues.getValue();
      let yAxisRange: Array<number> = [
        yAxisRanges.systemCapacityGraph.min, 
        yAxisRanges.systemCapacityGraph.max + (yAxisRanges.systemCapacityGraph.max * this.axisRangeAdjustment)
      ];
      let xRangeMax: number = this.profileSummary[0].profileSummaryData.length > 1? 23 : 1;
      var layout = this.getLayout("System Capacity (acfm)", [0, xRangeMax], yAxisRange, this.totalFullLoadCapacity, undefined);
      var config = {
        responsive: true,
        displaylogo: false
      };
      Plotly.newPlot(this.systemCapacityGraph.nativeElement, traceData, layout, config).then(chart => {
        this.updateHoverPositionData(chart, 'systemCapacityGraph');
      });
    }


  }

  drawCompressorPercentCapacityChart() {
    if (this.profileSummary && this.compressorCapacityGraph) {
      let traceData = new Array();
      this.profileSummary.forEach(compressorProfile => {
        let trace = {
          x: compressorProfile.profileSummaryData.map(data => { return data.timeInterval }),
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
      let xRangeMax: number = this.profileSummary[0].profileSummaryData.length > 1? 23 : 1;
      var layout = this.getLayout("Compressor Capacity (%)", [0, xRangeMax], [0, 105], undefined, '%');
      var config = {
        responsive: true,
        displaylogo: false
      };
      Plotly.newPlot(this.compressorCapacityGraph.nativeElement, traceData, layout, config).then(chart => {
        this.updateHoverPositionData(chart, 'compressorCapacityGraph');
      });
    }
  }

  drawSystemPowerChart() {
    if (this.profileSummary && this.systemPowerGraph) {
      let traceData = new Array();
      this.profileSummary.forEach(compressorProfile => {
        let percentOfSystem: Array<number> = [];
        let trace = {
          x: compressorProfile.profileSummaryData.map(data => { return data.timeInterval }),
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
      let yAxisRanges: AxisRanges = this.systemProfileGraphService.yAxisRangeValues.getValue();
      let yAxisRange: Array<number> = [
        yAxisRanges.systemPowerGraph.min, 
        yAxisRanges.systemPowerGraph.max + (yAxisRanges.systemPowerGraph.max * this.axisRangeAdjustment)
      ];
      var layout = this.getLayout("Power (kW)", undefined, yAxisRange, undefined, undefined);
      var config = {
        responsive: true,
        displaylogo: false
      };
      Plotly.newPlot(this.systemPowerGraph.nativeElement, traceData, layout, config).then(chart => {
        this.updateHoverPositionData(chart, 'systemPowerGraph');
      });
    }
  }


  drawCompressorPercentPowerChart() {
    if (this.profileSummary && this.compressorPowerGraph) {
      let traceData = new Array();
      this.profileSummary.forEach(compressorProfile => {
        let trace = {
          x: compressorProfile.profileSummaryData.map(data => { return data.timeInterval }),
          y: compressorProfile.profileSummaryData.map(data => {
            if (data.order != 0) {
              return data.percentPower
            } else {
              return 0;
            }
          }),
          type: 'bar',
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
      var layout = this.getLayout("Compressor Power %", undefined, [0, 100], undefined, '%');
      var config = {
        responsive: true,
        displaylogo: false
      };
      Plotly.newPlot(this.compressorPowerGraph.nativeElement, traceData, layout, config).then(chart => {
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

  getLayout(yAxisTitle: string, xAxisRange: Array<number>, yAxisRange: Array<number>, yMaxValue: number, yAxisTickSuffix: string) {
    let lineShapes = [];
    if (xAxisRange && yMaxValue) {
      lineShapes.push({
          type: 'line',
          x0: xAxisRange[0] - 1,
          y0: yMaxValue,
          x1: xAxisRange[1] + 1,
          y1: yMaxValue,
          line: {
            color: '#7030A0',
            width: 4,
            dash: 'dot'
          }
        });
    }
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
      shapes: lineShapes,
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
