import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { InventoryService } from '../../inventory/inventory.service';
import * as Plotly from 'plotly.js';
import { CompressedAirAssessment, CompressorInventoryItem, Modification } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirCalculationService, CompressorCalcResult } from '../../compressed-air-calculation.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';
@Component({
  selector: 'app-inventory-performance-profile',
  templateUrl: './inventory-performance-profile.component.html',
  styleUrls: ['./inventory-performance-profile.component.css']
})
export class InventoryPerformanceProfileComponent implements OnInit {
  @Input()
  inAssessment: boolean;

  @ViewChild('performanceProfileChart', { static: false }) performanceProfileChart: ElementRef;

  dataSub: Subscription;
  selectedCompressor: CompressorInventoryItem;
  showAllCompressors: boolean = false;
  compressedAirAssessment: CompressedAirAssessment;
  constructor(private inventoryService: InventoryService, private compressedAirCalculationService: CompressedAirCalculationService,
    private compressedAirAssessmentService: CompressedAirAssessmentService,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {
    if (!this.inAssessment) {
      this.dataSub = this.inventoryService.selectedCompressor.subscribe(val => {
        this.selectedCompressor = val;
        this.drawChart();
      });
    } else {
      this.dataSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
        this.compressedAirAssessment = val;
        this.drawChart();
      });
    }
  }

  ngOnDestroy() {
    this.dataSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.drawChart();
  }

  drawChart() {
    if (this.performanceProfileChart && (this.selectedCompressor || this.compressedAirAssessment)) {
      let chartData: Array<ProfileChartData>;
      if (!this.inAssessment) {
        chartData = this.getInventoryChartData();
      } else {
        chartData = this.getAssessmentChartData();
      }
      let traceData = new Array();
      chartData.forEach(dataItem => {
        let trace = {
          x: dataItem.data.map(cData => { return cData.percentageCapacity }),
          y: dataItem.data.map(cData => { return cData.percentagePower }),
          type: 'scatter',
          name: dataItem.compressorName,
          text: dataItem.data.map(cData => { return dataItem.compressorName }),
          hovertemplate: "%{text}: (Airflow: %{x:.2f}%, Power: %{y:.2f}%) <extra></extra>"
        }
        traceData.push(trace);
      });
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
    let compressorInventory: Array<CompressorInventoryItem> = this.compressedAirAssessmentService.compressedAirAssessment.getValue().compressorInventoryItems;
    let chartData: Array<ProfileChartData> = new Array();
    if (this.showAllCompressors) {
      compressorInventory.forEach(item => {
        let isValid: boolean = this.inventoryService.isCompressorValid(item)
        if (isValid) {
          let compressorData: Array<CompressorCalcResult> = this.getCompressorData(item);
          chartData.push({
            compressorName: item.name,
            data: compressorData
          });
        }
      });
    } else {
      let isValid: boolean = this.inventoryService.isCompressorValid(this.selectedCompressor);
      if (isValid) {
        let compressorData: Array<CompressorCalcResult> = this.getCompressorData(this.selectedCompressor);
        chartData.push({
          compressorName: this.selectedCompressor.name,
          data: compressorData
        });
      }
    }
    return chartData;
  }


  getAssessmentChartData(): Array<ProfileChartData> {
    let chartData: Array<ProfileChartData> = new Array();
    // let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
    // let modification: Modification = this.compressedAirAssessment.modifications.find(mod => { return mod.modificationId == selectedModificationId });
    this.compressedAirAssessment.compressorInventoryItems.forEach(compressor => {
      let isValid: boolean = this.inventoryService.isCompressorValid(compressor)
      if (isValid) {
        let compressorData: Array<CompressorCalcResult> = this.getCompressorData(compressor);
        chartData.push({
          compressorName: compressor.name,
          data: compressorData
        });
        // if (modification.useUnloadingControls.order != 100) {
        //   let adjustedCompressor: CompressorInventoryItem = this.compressedAirAssessmentResultsService.adjustCompressorControl(modification.useUnloadingControls, JSON.parse(JSON.stringify(compressor)));
        //   // debugger
        //   let adjustedCompressorData: Array<CompressorCalcResult> = this.getCompressorData(adjustedCompressor);
        //   // console.log(adjustedCompressorData);
        //   chartData.push({
        //     compressorName: compressor.name + ' (Adjusted)',
        //     data: adjustedCompressorData
        //   });
        // }
      }
    });
    return chartData;
  }

  getCompressorData(compressor: CompressorInventoryItem): Array<CompressorCalcResult> {
    let compressorData: Array<CompressorCalcResult> = new Array();
    for (let airFlow = 0; airFlow <= 100;) {
      let results: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(compressor, 1, airFlow, 0, false);
      compressorData.push(results);
      if(airFlow < 95){
        airFlow = airFlow + 1;
      }else{
        airFlow = airFlow + .5;
      }
    }
    return compressorData;
  }

}


export interface ProfileChartData {
  data: Array<CompressorCalcResult>
  compressorName: string
}