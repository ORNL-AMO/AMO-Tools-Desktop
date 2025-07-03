import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirInventorySummaryGraphsService } from '../compressed-air-inventory-summary-graphs.service';
import { PlotlyService } from 'angular-plotly.js';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';

@Component({
  selector: 'app-compressed-air-summary-graph',
  templateUrl: './compressed-air-summary-graph.component.html',
  styleUrl: './compressed-air-summary-graph.component.css',
  standalone: false
})
export class CompressedAirSummaryGraphComponent {

  @ViewChild('visualizeChart', { static: false }) visualizeChart: ElementRef;

  selectedFieldSub: Subscription;
  constructor(
    private compressedAirInventorySummaryGraphsService: CompressedAirInventorySummaryGraphsService,
    private compressedAirInventoryService: CompressedAirInventoryService,
    private plotlyService: PlotlyService
  ) { }


  ngOnInit(): void {

  }
  ngAfterViewInit() {
    this.selectedFieldSub = this.compressedAirInventorySummaryGraphsService.selectedField.subscribe(selectedField => {
      if (selectedField) {
        let pumpInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
        let filterInventorySummary = this.compressedAirInventoryService.filterInventorySummary.getValue();
        let filteredPumpInventoryData = this.compressedAirInventoryService.filterCompressedAirInventoryData(pumpInventoryData, filterInventorySummary);
        let chartData = this.compressedAirInventorySummaryGraphsService.getBinData(filteredPumpInventoryData, selectedField);
        let type: string = this.compressedAirInventorySummaryGraphsService.graphType.getValue();

        let ticksuffix: string;
        let textTemplate: string;
        let data;

        let range = [0, Math.max(...chartData.yData)];
        if (type === 'pie') {
          data = [
            {
              x: chartData.xData,
              y: chartData.yData,
              values: chartData.yData,
              labels: chartData.xData,
              text: chartData.yData.map((fieldValue, index) => {
                let pumpCountString = fieldValue > 1 ? `${fieldValue} pumps` : `${fieldValue} pump`;
                let fieldValueString = selectedField.unit ? `${chartData.xData[index]} ${selectedField.unit}` : chartData.xData[index];
                return `${fieldValueString} <br> ${pumpCountString}`;
              }),
              type: type,
              textposition: 'auto',
              insidetextorientation: "horizontal",
              textinfo: 'text',
              texttemplate: textTemplate,
              hovertemplate: '%{text} <br> %{percent} <extra></extra>',
            }
          ];
        } else {
          data = [
            {
              x: chartData.xData,
              y: chartData.yData,
              values: chartData.yData,
              labels: chartData.xData,
              type: type,
            }
          ];
          ticksuffix = selectedField.unit == undefined ? '' : ' ' + selectedField.unit;

        }
        let layout = {
          title: {
            text: 'Pump Inventory',
            font: {
              family: 'Roboto',
              size: 22
            }
          },
          yaxis: {
            // hoverformat: '.3r',
            title: {
              text: '# of Pumps',
              font: {
                family: 'Roboto',
                size: 16
              }
            },
            range: range,
            autoticks: true,
            tick0: 0,
            dtick: 1,
          },
          xaxis: {
            fixedrange: true,
            title: {
              text: selectedField.display
            },
            font: {
              family: 'Roboto',
              size: 16
            },
            type: 'category',
            ticksuffix: ticksuffix
          },
        };

        let config = { responsive: true }
        if (this.visualizeChart) {
          this.plotlyService.newPlot(this.visualizeChart.nativeElement, data, layout, config);
        }
      }
    });
  }

  ngOnDestroy() {
    this.selectedFieldSub.unsubscribe();
  }
}

