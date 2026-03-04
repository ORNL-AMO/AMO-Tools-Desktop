import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { InventoryService } from '../baseline-tab-content/inventory-setup/inventory/inventory.service';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../shared/models/compressed-air-assessment';
import { CompressedAirCalculationService, CompressorCalcResult } from '../compressed-air-calculation.service';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { TraceData } from '../../shared/models/plotting';
import { Settings } from '../../shared/models/settings';
import { PlotlyService } from 'angular-plotly.js';
import { CompressedAirAssessmentBaselineResults } from '../calculations/CompressedAirAssessmentBaselineResults';
import { AssessmentCo2SavingsService } from '../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { CompressedAirAssessmentModificationResults } from '../calculations/modifications/CompressedAirAssessmentModificationResults';
import { CompressorInventoryValidationService } from '../compressed-air-assessment-validation/compressor-inventory-validation.service';
import { CompressedAirProfileSummary } from '../calculations/CompressedAirProfileSummary';

@Component({
  selector: 'app-inventory-performance-profile',
  templateUrl: './inventory-performance-profile.component.html',
  styleUrls: ['./inventory-performance-profile.component.css'],
  standalone: false
})
export class InventoryPerformanceProfileComponent implements OnInit {
  @Input()
  context: 'inventory' | 'assessment' | 'report';
  @Input()
  printView: boolean;
  @Input()
  settings: Settings;
  @Input()
  compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults;

  @ViewChild('performanceProfileChart', { static: false }) performanceProfileChart: ElementRef;

  selectedCompressorSub: Subscription;
  selectedCompressor: CompressorInventoryItem;
  showAllCompressors: boolean = false;
  showAvgOpPoints: boolean = false;
  adjustedCompressors: Array<CompressorInventoryItem>;
  modificationResultsSub: Subscription;
  plotlyMarkerShapes: Array<string> = [
    'star',
    'star-diamond',
    'hexagram',
    'star-square',
    'square',
    'diamond',
    'cross',
    'x',
    'diamond-wide',
    'diamond-tall'
  ];
  unloadingControlTypes: Array<number> = [2, 3, 4, 5, 8, 10];

  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  constructor(private inventoryService: InventoryService, private compressedAirCalculationService: CompressedAirCalculationService,
    private compressedAirAssessmentService: CompressedAirAssessmentService,
    private plotlyService: PlotlyService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService,
    private compressorInventoryValidationService: CompressorInventoryValidationService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.compressedAirAssessmentService.settings.getValue();
    }
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(assessment => {
      this.compressedAirAssessment = assessment;
    });

    if (this.context === 'assessment') {
      this.initAssessmentContext();
    } else if (this.context === 'report') {
      this.initReportContext();
    } else if (this.context === 'inventory') {
      this.initInventoryContext();
    }
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.selectedCompressorSub?.unsubscribe();
    this.modificationResultsSub?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.compressedAirAssessmentModificationResults && !changes.compressedAirAssessmentModificationResults.firstChange) {
      this.setCompressorData();
    }
  }

  ngAfterViewInit() {
    this.drawChart();
    window.dispatchEvent(new Event("resize"));
  }

  initAssessmentContext() {
    this.showAllCompressors = true;
    this.modificationResultsSub = this.compressedAirAssessmentService.compressedAirAssessmentModificationResults.subscribe(modificationResults => {
      this.compressedAirAssessmentModificationResults = modificationResults;
      this.setCompressorData();
    });
  }

  initReportContext() {
    this.showAllCompressors = true;
    this.showAvgOpPoints = true;
    this.setCompressorData();
  }

  initInventoryContext() {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      this.selectedCompressor = val;
      this.setCompressorData();
    });
  }


  setCompressorData() {
    if (this.compressedAirAssessmentModificationResults) {
      this.adjustedCompressors = this.compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries[0]?.adjustedCompressors;
      this.drawChart();
    } else {
      this.adjustedCompressors = this.compressedAirAssessment.compressorInventoryItems
      if(this.context == 'assessment' || this.context == 'inventory'){
        this.adjustedCompressors = this.adjustedCompressors.concat(this.compressedAirAssessment.replacementCompressorInventoryItems);
      }      
      this.drawChart();
    }
  }

  getUnloadingTraces(dataItem: ProfileChartData): Array<TraceData> {
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
          dash: 'dot',
          color: dataItem.color
        }
      }
      unloadingTraces.push(unloadingDottedTrace);

    } else {
      // Trace is dotted from unload intersection to noload point
      // Trace is solid the rest of the way

      // starting point for solid line is intersection of noLoad power and airflow
      let lineData: { solid: Array<CompressorCalcResult>, dotted: Array<CompressorCalcResult> } = this.getUnloadingLineData(dataItem.data, dataItem.unloadingData);

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
          color: dataItem.color
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
          color: dataItem.color
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
    if (this.printView) {
      this.showAvgOpPoints = true;
      this.showAllCompressors = true;
    }
    let unloadingLines = [];
    if (this.performanceProfileChart && this.compressedAirAssessment) {
      let chartData: Array<ProfileChartData> = this.getChartData();
      let avgOpPointData: Array<ProfileChartData> = this.getAvgOpPointsData();
      let traceData: Array<TraceData> = new Array();

      // Overrride Plotly color handling - deal with doubled unloading traces
      chartData.forEach(dataItem => {
        if (this.unloadingControlTypes.includes(dataItem.controlType)) {
          let unloadingTraces: Array<TraceData> = [];
          unloadingTraces = this.getUnloadingTraces(dataItem);
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
              color: dataItem.color
            }
          }
          traceData.push(trace);
        }
      });

      if (avgOpPointData) {
        let currentShapeIndex: number = 0;
        avgOpPointData.forEach(dataItem => {
          let currentMarkerShape: string;
          if (this.showAllCompressors) {
            currentMarkerShape = this.plotlyMarkerShapes[currentShapeIndex];
            if (currentShapeIndex == 9) {
              currentShapeIndex = 0;
            } else {
              currentShapeIndex++;
            }
          }
          if (this.unloadingControlTypes.includes(dataItem.controlType)) {
            let unloadingTraces: Array<TraceData> = [];
            unloadingTraces = this.getUnloadingTraces(dataItem);
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
              marker: {
                size: 12,
                symbol: currentMarkerShape,
              },
              fillcolor: dataItem.color,
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
        },
      };
      var config = {
        responsive: true,
        displaylogo: false
      };
      this.plotlyService.newPlot(this.performanceProfileChart.nativeElement, traceData, layout, config);
    }
  }

  getChartData(): Array<ProfileChartData> {
    if (this.context == 'assessment') {
      return this.getAssessmentChartData();
    } else {
      return this.getInventoryChartData();
    }
  }


  getInventoryChartData(): Array<ProfileChartData> {
    let compressorInventory: Array<CompressorInventoryItem> = this.adjustedCompressors;
    let chartData: Array<ProfileChartData> = new Array();
    if (this.showAllCompressors) {
      compressorInventory.forEach(item => {
        let isValid: boolean = this.compressorInventoryValidationService.validateCompressorItem(item, this.compressedAirAssessment.systemInformation).isValid
        if (isValid) {
          let compressorData: Array<CompressorCalcResult> = this.getCompressorData(item);
          let unloadingData: UnloadingData = this.getUnloadingData(item);
          chartData.push({
            compressorName: item.name,
            data: compressorData,
            controlType: item.compressorControls.controlType,
            unloadingData: unloadingData,
            color: item.color
          });
        }
      });
    } else {
      if (this.selectedCompressor) {
        let isValid: boolean = this.compressorInventoryValidationService.validateCompressorItem(this.selectedCompressor, this.compressedAirAssessment.systemInformation).isValid;
        if (isValid) {
          let compressorData: Array<CompressorCalcResult> = this.getCompressorData(this.selectedCompressor);
          let unloadingData: UnloadingData = this.getUnloadingData(this.selectedCompressor);
          chartData.push({
            compressorName: this.selectedCompressor.name,
            data: compressorData,
            unloadingData: unloadingData,
            controlType: this.selectedCompressor.compressorControls.controlType,
            color: this.selectedCompressor.color
          });
        }
      }
    }
    return chartData;
  }
  getAvgOpPointsData(): Array<ProfileChartData> {
    if (this.showAvgOpPoints) {
      let profileSummary: Array<CompressedAirProfileSummary>;
      if (this.compressedAirAssessmentModificationResults) {
        profileSummary = this.compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries.flatMap(dayTypeProfileSummary => {
          return dayTypeProfileSummary.adjustedProfileSummary;
        });
      } else {
        let compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults = new CompressedAirAssessmentBaselineResults(this.compressedAirAssessment, this.settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);
        profileSummary = compressedAirAssessmentBaselineResults.baselineDayTypeProfileSummaries.flatMap(dayTypeProfileSummary => {
          return dayTypeProfileSummary.profileSummary;
        });
      }
      let chartData: Array<ProfileChartData> = new Array();
      if (this.showAvgOpPoints && this.showAllCompressors) {
        this.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
          let profileData: Array<CompressorCalcResult> = this.getProfileSummaryData(profileSummary, dayType.dayTypeId);
          chartData.push({
            compressorName: dayType.name + " Average Operating Points",
            data: profileData,
            unloadingData: null,
            controlType: 0,
            color: undefined
          });
        });
      } else {
        let isValid: boolean = this.compressorInventoryValidationService.validateCompressorItem(this.selectedCompressor, this.compressedAirAssessment.systemInformation).isValid;
        if (isValid && this.showAvgOpPoints && !this.showAllCompressors) {
          profileSummary.forEach(profile => {
            if (profile.compressorId == this.selectedCompressor.itemId) {
              let name: string;
              this.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
                if (dayType.dayTypeId === profile.dayTypeId) {
                  name = dayType.name;
                }
              });
              let profileData: Array<CompressorCalcResult> = this.getProfileData(profile);
              chartData.push({
                compressorName: name + " Average Operating Point",
                data: profileData,
                unloadingData: null,
                controlType: 0,
                color: this.selectedCompressor.color
              });
            }
          });
        }
      }
      return chartData;
    }
    return;
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


  getAssessmentChartData(): Array<ProfileChartData> {
    let chartData: Array<ProfileChartData> = new Array();
    this.adjustedCompressors.forEach(compressor => {
      let isValid: boolean = this.compressorInventoryValidationService.validateCompressorItem(compressor, this.compressedAirAssessment.systemInformation).isValid;
      if (isValid) {
        let compressorData: Array<CompressorCalcResult> = this.getCompressorData(compressor);
        let unloadingData: UnloadingData = this.getUnloadingData(compressor);
        chartData.push({
          compressorName: compressor.name,
          data: compressorData,
          controlType: compressor.compressorControls.controlType,
          unloadingData: unloadingData,
          color: compressor.color
        });
      }
    });
    return chartData;
  }

  getCompressorData(compressor: CompressorInventoryItem): Array<CompressorCalcResult> {
    let compressorData: Array<CompressorCalcResult> = new Array();
    let isCompressorValid: boolean = this.compressorInventoryValidationService.validateCompressorItem(compressor, this.compressedAirAssessment.systemInformation).isValid;
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

  getProfileData(compressor: CompressedAirProfileSummary): Array<CompressorCalcResult> {
    let compressorData: Array<CompressorCalcResult> = new Array();
    if (compressor.avgPercentCapacity) {
      let results: CompressorCalcResult = {
        powerCalculated: compressor.avgPower,
        capacityCalculated: compressor.avgAirflow,
        percentagePower: compressor.avgPercentPower,
        percentageCapacity: compressor.avgPercentCapacity
      }
      compressorData.push(results);

    }
    return compressorData;
  }
  getProfileSummaryData(compressorSummary: Array<CompressedAirProfileSummary>, dayTypeId: string): Array<CompressorCalcResult> {
    let compressorData: Array<CompressorCalcResult> = new Array();
    compressorSummary.forEach(compressorSummary => {
      if (dayTypeId === compressorSummary.dayTypeId && compressorSummary.avgPercentCapacity) {
        let compressor: CompressorInventoryItem = this.adjustedCompressors.find(item => { return item.itemId === compressorSummary.compressorId });
        let results: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(compressor, this.settings, 1, compressorSummary.avgAirflow, this.compressedAirAssessment.systemInformation.atmosphericPressure, this.compressedAirAssessment.systemInformation.totalAirStorage, 0, false);
        compressorData.push(results);
      }
    });
    return compressorData;
  }
}


export interface ProfileChartData {
  data: Array<CompressorCalcResult>,
  unloadingData?: UnloadingData,
  compressorName: string,
  controlType: number,
  color: string
}

export interface UnloadingData {
  unload: { power: number, airflow: number },
  noLoad: { power: number, airflow: number },
}