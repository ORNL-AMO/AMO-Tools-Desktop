import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { InventoryService } from '../../inventory/inventory.service';
import * as Plotly from 'plotly.js';
import { CompressorInventoryItem } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirCalculationService, CompressorCalcResult } from '../../compressed-air-calculation.service';
@Component({
  selector: 'app-inventory-performance-profile',
  templateUrl: './inventory-performance-profile.component.html',
  styleUrls: ['./inventory-performance-profile.component.css']
})
export class InventoryPerformanceProfileComponent implements OnInit {

  @ViewChild('performanceProfileChart', { static: false }) performanceProfileChart: ElementRef;

  selectedCompressorSub: Subscription;
  selectedCompressor: CompressorInventoryItem;
  constructor(private inventoryService: InventoryService, private compressedAirCalculationService: CompressedAirCalculationService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      console.log('change')
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
      let chartData: Array<{ x: number, y: number }> = this.getChartData();
      let traceData = new Array();
      let trace = {
        x: chartData.map(data => { return data.x }),
        y: chartData.map(data => { return data.y }),
        type: 'scatter'
      }
      traceData.push(trace);


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

  getChartData(): Array<{ x: number, y: number }> {
    let chartData: Array<{ x: number, y: number }> = new Array();
    for (let airFlow = 0; airFlow <= 100;) {
      let results: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(this.selectedCompressor, 1, airFlow);
      chartData.push({
        x: airFlow,
        y: results.percentagePower
      });
      airFlow = airFlow + 5;
    }
    return chartData;
  }


}
