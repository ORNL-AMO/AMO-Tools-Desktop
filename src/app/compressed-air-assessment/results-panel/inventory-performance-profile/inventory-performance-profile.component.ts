import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { InventoryService } from '../../inventory/inventory.service';
import * as Plotly from 'plotly.js';
import { CompressorInventoryItem } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirCalculationService, CompressorCalcResult } from '../../compressed-air-calculation.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
@Component({
  selector: 'app-inventory-performance-profile',
  templateUrl: './inventory-performance-profile.component.html',
  styleUrls: ['./inventory-performance-profile.component.css']
})
export class InventoryPerformanceProfileComponent implements OnInit {

  @ViewChild('performanceProfileChart', { static: false }) performanceProfileChart: ElementRef;

  selectedCompressorSub: Subscription;
  selectedCompressor: CompressorInventoryItem;
  constructor(private inventoryService: InventoryService, private compressedAirCalculationService: CompressedAirCalculationService,
    private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      this.selectedCompressor = val;
      this.drawChart();
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.drawChart();
  }

  drawChart() {
    if (this.performanceProfileChart && this.selectedCompressor) {
      let chartData: Array<ProfileChartData> = this.getChartData();
      let traceData = new Array();
      chartData.forEach(dataItem => {
        let trace = {
          x: dataItem.data.map(cData => { return cData.percentageCapacity }),
          y: dataItem.data.map(cData => { return cData.percentagePower }),
          type: 'scatter',
          name: dataItem.compressorName
        }
        traceData.push(trace);
      });
      var layout = {
        // barmode: 'group',
        title: {
          text: 'Performance Profile',
          font: {
            size: 24
          },
        },
        xaxis: {
          ticksuffix: '%',
          // autotick: false,
          title: {
            text: 'Airflow (% Capacity)',
            font: {
              size: 18
            },
          },
        },
        yaxis: {
          range: [0, 100],
          ticksuffix: '%',
          title: {
            text: 'Power (% Full Load)',
            font: {
              size: 18
            },
          },
          hoverformat: ",.2f",
        }
      };
      var config = {
        responsive: true,
      };
      Plotly.newPlot(this.performanceProfileChart.nativeElement, traceData, layout, config);
    }
  }

  getChartData(): Array<ProfileChartData> {
    let compressorInventory: Array<CompressorInventoryItem> = this.compressedAirAssessmentService.compressedAirAssessment.getValue().compressorInventoryItems;
    let chartData: Array<ProfileChartData> = new Array();
    compressorInventory.forEach(item => {
      let compressorData: Array<CompressorCalcResult> = new Array();
      let isValid: boolean = this.inventoryService.isCompressorValid(item)
      if (isValid) {
        for (let airFlow = 0; airFlow <= 100;) {
          let results: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(item, 1, airFlow);
          compressorData.push(results);
          airFlow = airFlow + 10;
        }
        chartData.push({
          compressorName: item.name,
          data: compressorData
        });
      }
    });
    return chartData;
  }


}


export interface ProfileChartData {
  data: Array<CompressorCalcResult>
  compressorName: string
}