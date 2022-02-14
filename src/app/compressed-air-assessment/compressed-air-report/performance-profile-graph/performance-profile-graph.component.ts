import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { InventoryService } from '../../inventory/inventory.service';
import * as Plotly from 'plotly.js';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ProfileSummary } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirCalculationService, CompressorCalcResult } from '../../compressed-air-calculation.service';
import { CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';
import { TraceData } from '../../../shared/models/plotting';
import { Settings } from '../../../shared/models/settings';
@Component({
  selector: 'app-performance-profile-graph',
  templateUrl: './performance-profile-graph.component.html',
  styleUrls: ['./performance-profile-graph.component.css']
})
export class PerformanceProfileGraphComponent implements OnInit {
  @Input()
  printView: boolean;

  @Input()
  compressedAirAssessment: CompressedAirAssessment;

  @Input()
  settings: Settings;

  @ViewChild('performanceProfileChart', { static: false }) performanceProfileChart: ElementRef;

  selectedCompressor: CompressorInventoryItem;
  showAvgOpPoints: boolean = false;
  selectedDayType: CompressedAirDayType;
  // From Plotly source
  plotlyTraceColors: Array<string> = [
    '#1f77b4',  // muted blue
    '#ff7f0e',  // safety orange
    '#2ca02c',  // cooked asparagus green
    '#d62728',  // brick red
    '#9467bd',  // muted purple
    '#8c564b',  // chestnut brown
    '#e377c2',  // raspberry yogurt pink
    '#7f7f7f',  // middle gray
    '#bcbd22',  // curry yellow-green
    '#17becf'   // blue-teal
  ];
  unloadingControlTypes: Array<number> = [2, 3, 4, 5, 8, 10];



  constructor(private inventoryService: InventoryService, private compressedAirCalculationService: CompressedAirCalculationService,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {

    if (this.printView) {
      this.showAvgOpPoints = true;
    }

    this.selectedCompressor = this.compressedAirAssessment.compressorInventoryItems[0];
    this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId == this.compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId });
    this.drawChart();

  }



  ngAfterViewInit() {
    if (this.printView) {
      this.showAvgOpPoints = true;
    }
    this.drawChart();
    window.dispatchEvent(new Event("resize"));
  }

  ngOnChanges() {
    if (this.performanceProfileChart) {
      if (this.printView) {
        this.showAvgOpPoints = true;
      }
      this.drawChart();
    }
  }


  getUnloadingTraces(dataItem: ProfileChartData, traceColor: string): Array<TraceData> {
    let unloadingTraces = [];
    if (dataItem.controlType == 4 || dataItem.controlType == 5) {
      // Trace is dotted
      let unloadingDottedTrace = {
        x: dataItem.data.map(cData => {
          return cData.percentageCapacity
        }),
        y: dataItem.data.map(cData => { return cData.percentagePower }),
        type: 'scatter',
        name: dataItem.compressorName,
        text: dataItem.data.map(cData => { return dataItem.compressorName }),
        hovertemplate: "%{text}: (Airflow: %{x:.2f}%, Power: %{y:.2f}%) <extra></extra>",
        mode: 'lines',
        line: {
          dash: 'dot'
        }
      }
      unloadingTraces.push(unloadingDottedTrace);

    } else {
      // Trace is dotted from unload intersection to noload point
      // Trace is solid the rest of the way

      // starting point for solid line is intersection of noLoad power and airflow
      let lineData: { solid: Array<CompressorCalcResult>, dotted: Array<CompressorCalcResult> } = this.getUnloadingLineData(dataItem.data, dataItem.unloadingData);

      let color: string = traceColor ? traceColor : this.plotlyTraceColors[0];
      let unloadingDottedTrace = {
        x: lineData.dotted.map(cData => {
          return cData.percentageCapacity
        }),
        y: lineData.dotted.map(cData => { return cData.percentagePower }),
        type: 'scatter',
        name: dataItem.compressorName + '(Unloading)',
        text: dataItem.data.map(cData => { return dataItem.compressorName }),
        hovertemplate: "%{text}: (Airflow: %{x:.2f}%, Power: %{y:.2f}%) <extra></extra>",
        mode: 'lines',
        line: {
          dash: 'dot',
          color: color
        }
      }
      let unloadingSolidTrace = {
        x: lineData.solid.map(cData => {
          return cData.percentageCapacity
        }),
        y: lineData.solid.map(cData => { return cData.percentagePower }),
        type: 'scatter',
        name: dataItem.compressorName,
        text: dataItem.data.map(cData => { return dataItem.compressorName }),
        hovertemplate: "%{text}: (Airflow: %{x:.2f}%, Power: %{y:.2f}%) <extra></extra>",
        mode: 'lines',
        line: {
          dash: 'solid',
          color: color
        }
      }

      unloadingTraces.push(unloadingDottedTrace, unloadingSolidTrace);
    }

    return unloadingTraces;
  }

  getUnloadingLineData(chartData: Array<CompressorCalcResult>, unloadingData: UnloadingData): { solid: Array<CompressorCalcResult>, dotted: Array<CompressorCalcResult> } {
    let unloadPercentagePoints: { power: number, airflow: number } = unloadingData.unload;
    let smallestDistanceBetweenPoints = Infinity;
    let intersectionIndex: number;

    chartData.forEach((chartDataPoint, index) => {
      //distance = (p1.x - p2.x)^2 + (p1.y - p2.y)^2
      let distanceBetweenCurrentPoint = Math.pow((chartDataPoint.percentageCapacity - unloadPercentagePoints.airflow), 2) + Math.pow((chartDataPoint.percentagePower - unloadPercentagePoints.power), 2)
      if (smallestDistanceBetweenPoints > distanceBetweenCurrentPoint) {
        smallestDistanceBetweenPoints = distanceBetweenCurrentPoint;
        intersectionIndex = index;
      }
    });

    //New line starting from unload intersection index
    let solidLineData = [];
    let dottedLineData = [];
    chartData.forEach((data, index) => {
      if (index >= intersectionIndex) {
        solidLineData.push(data);
      }
    });
    chartData.forEach((data, index) => {
      if (index <= intersectionIndex) {
        dottedLineData.push(data);
      }
    });

    return { solid: solidLineData, dotted: dottedLineData };
  }

  drawChart() {
    let unloadingLines = [];
    if (this.performanceProfileChart && this.selectedCompressor && this.compressedAirAssessment) {
      let chartData: Array<ProfileChartData>;
      let avgOpPointData: Array<ProfileChartData>;

      chartData = this.getInventoryChartData();
      avgOpPointData = this.getAvgOpPointsData();

      let traceData: Array<TraceData> = new Array();

      // Overrride Plotly color handling - deal with doubled unloading traces
      let currentColorIndex: number = 0;
      chartData.forEach(dataItem => {
        let currentTraceColor: string;
        currentTraceColor = this.plotlyTraceColors[currentColorIndex];
        if (currentColorIndex == 9) {
          currentColorIndex = 0;
        } else {
          currentColorIndex++;
        }
        if (this.unloadingControlTypes.includes(dataItem.controlType)) {
          let unloadingTraces: Array<TraceData> = [];
          unloadingTraces = this.getUnloadingTraces(dataItem, currentTraceColor);
          if (traceData.length > 0) {
            traceData = traceData.concat(unloadingTraces);
          } else {
            traceData = unloadingTraces;
          }
        } else {
          let trace: TraceData = {
            x: dataItem.data.map(cData => {
              return cData.percentageCapacity
            }),
            y: dataItem.data.map(cData => { return cData.percentagePower }),
            type: 'scatter',
            name: dataItem.compressorName,
            text: dataItem.data.map(cData => { return dataItem.compressorName }),
            hovertemplate: "%{text}: (Airflow: %{x:.2f}%, Power: %{y:.2f}%) <extra></extra>",
            line: {
              dash: 'solid',
              color: currentTraceColor
            }
          }
          traceData.push(trace);
        }
      });

      if (avgOpPointData) {
        avgOpPointData.forEach(dataItem => {
          let currentTraceColor: string;
          currentTraceColor = this.plotlyTraceColors[currentColorIndex];
          if (currentColorIndex == 9) {
            currentColorIndex = 0;
          } else {
            currentColorIndex++;
          }
          if (this.unloadingControlTypes.includes(dataItem.controlType)) {
            let unloadingTraces: Array<TraceData> = [];
            unloadingTraces = this.getUnloadingTraces(dataItem, currentTraceColor);
            if (traceData.length > 0) {
              traceData = traceData.concat(unloadingTraces);
            } else {
              traceData = unloadingTraces;
            }
          } else {
            let trace: TraceData = {
              x: dataItem.data.map(cData => {
                return cData.percentageCapacity
              }),
              y: dataItem.data.map(cData => { return cData.percentagePower }),
              type: 'scatter',
              name: dataItem.compressorName,
              text: dataItem.data.map(cData => { return dataItem.compressorName }),
              hovertemplate: "%{text}: (Airflow: %{x:.2f}%, Power: %{y:.2f}%) <extra></extra>",
              mode: 'markers',
              fillcolor: currentTraceColor
            }
            traceData.push(trace);
          }
        });
      }

      var layout = {
        xaxis: {
          range: [0, 105],
          ticksuffix: '%',
          title: {
            text: 'Airflow (% Capacity)',
            font: {
              size: 16
            },
          },
          automargin: true
        },
        yaxis: {
          range: [0, 105],
          ticksuffix: '%',
          title: {
            text: 'Power (% Full Load)',
            font: {
              size: 16
            },
          },
          hoverformat: ",.2f",
        },
        shapes: unloadingLines,
        margin: {
          t: 20,
          r: 20
        },
        legend: {
          orientation: "h",
          y: 1.5
        }
      };
      var config = {
        responsive: true,
        displaylogo: false
      };
      Plotly.newPlot(this.performanceProfileChart.nativeElement, traceData, layout, config);
    }
  }

  getInventoryChartData(): Array<ProfileChartData> {
    let compressorInventory: Array<CompressorInventoryItem> = this.compressedAirAssessment.compressorInventoryItems;
    let chartData: Array<ProfileChartData> = new Array();
    compressorInventory.forEach(item => {
      let isValid: boolean = this.inventoryService.isCompressorValid(item)
      if (isValid) {
        let compressorData: Array<CompressorCalcResult> = this.getCompressorData(item);
        let unloadingData: UnloadingData = this.getUnloadingData(item);
        chartData.push({
          compressorName: item.name,
          data: compressorData,
          controlType: item.compressorControls.controlType,
          unloadingData: unloadingData
        });
      }
    });

    return chartData;
  }

  getAvgOpPointsData(): Array<ProfileChartData> {
    let profileSummary: Array<ProfileSummary> = new Array<ProfileSummary>();
    this.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      let profiles: Array<ProfileSummary> = this.compressedAirAssessmentResultsService.calculateBaselineDayTypeProfileSummary(this.compressedAirAssessment, dayType, this.settings);
      profiles.forEach(val => {
        profileSummary.push(val);
      });
    });
    let chartData: Array<ProfileChartData> = new Array();
    if (this.showAvgOpPoints) {
      profileSummary.forEach(profile => {
        let name: string = this.compressedAirAssessment.compressorInventoryItems.find(item => { return item.itemId == profile.compressorId }).name;
        let dayName: string;
        this.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
          if (dayType.dayTypeId === profile.dayTypeId) {
            dayName = dayType.name;
          }
        });
        let profileData: Array<CompressorCalcResult> = this.getProfileData(profile);
        chartData.push({
          compressorName: name + " " + dayName + " Average Operating Point",
          data: profileData,
          unloadingData: null,
          controlType: 0
        });
      });
    }


    return chartData;
  }

  getUnloadingData(compressorItem: CompressorInventoryItem) {
    let unloadingData: UnloadingData;
    if (this.unloadingControlTypes.includes(compressorItem.compressorControls.controlType)) {
      let unloadPower = this.getUnloadingPercentage(compressorItem.performancePoints.unloadPoint.power, compressorItem.performancePoints.fullLoad.power);
      let unloadAirflow = this.getUnloadingPercentage(compressorItem.performancePoints.unloadPoint.airflow, compressorItem.performancePoints.fullLoad.airflow);
      let noLoadPower = this.getUnloadingPercentage(compressorItem.performancePoints.noLoad.power, compressorItem.performancePoints.fullLoad.power);
      let noLoadAirflow = this.getUnloadingPercentage(compressorItem.performancePoints.noLoad.airflow, compressorItem.performancePoints.fullLoad.airflow);

      if (unloadPower === undefined || unloadAirflow === undefined || noLoadPower === undefined || noLoadAirflow === undefined) {
        return unloadingData;
      }

      unloadingData = {
        unload: {
          power: unloadPower,
          airflow: unloadAirflow
        },
        noLoad: {
          power: noLoadPower,
          airflow: noLoadAirflow
        },
      }
    }
    return unloadingData;
  }

  getUnloadingPercentage(pointValue: number, fullLoadvalue: number) {
    let percentValue: number;
    if (pointValue === 0) {
      percentValue = 0;
    } else if (pointValue === undefined) {
      percentValue = undefined;
    } else {
      percentValue = (pointValue / fullLoadvalue) * 100;
    }
    return percentValue;
  }



  getCompressorData(compressor: CompressorInventoryItem): Array<CompressorCalcResult> {
    let compressorData: Array<CompressorCalcResult> = new Array();
    let isCompressorValid: boolean = this.inventoryService.isCompressorValid(compressor)
    for (let airFlow = 0; airFlow <= 100;) {
      if (isCompressorValid) {
        let results: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(compressor, this.settings, 1, airFlow, this.compressedAirAssessment.systemInformation.atmosphericPressure, this.compressedAirAssessment.systemInformation.totalAirStorage, 0, false);
        compressorData.push(results);
      } else {
        let results: CompressorCalcResult = this.compressedAirCalculationService.getEmptyCalcResults();
        compressorData.push(results);
      }
      if (airFlow < 95) {
        airFlow = airFlow + 1;
      } else {
        airFlow = airFlow + .5;
      }
    }
    return compressorData;
  }


  getProfileData(compressor: ProfileSummary): Array<CompressorCalcResult> {
    let compressorData: Array<CompressorCalcResult> = new Array();
    if (compressor.avgPercentCapacity) {
      let results: CompressorCalcResult = {
        powerCalculated: compressor.avgPower,
        capacityCalculated: compressor.avgAirflow,
        percentagePower: compressor.avgPrecentPower,
        percentageCapacity: compressor.avgPercentCapacity
      }
      compressorData.push(results);

    }
    return compressorData;
  }

}


export interface ProfileChartData {
  data: Array<CompressorCalcResult>,
  unloadingData?: UnloadingData,
  compressorName: string,
  controlType: number
}

export interface UnloadingData {
  unload: { power: number, airflow: number },
  noLoad: { power: number, airflow: number },
}
