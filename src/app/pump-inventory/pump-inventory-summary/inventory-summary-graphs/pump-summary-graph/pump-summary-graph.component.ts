import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { PumpSummaryGraphsService } from '../pump-summary-graphs.service';
import { PlotlyService } from 'angular-plotly.js';
import { PumpInventoryService } from '../../../pump-inventory.service';

@Component({
  selector: 'app-pump-summary-graph',
  templateUrl: './pump-summary-graph.component.html',
  styleUrls: ['./pump-summary-graph.component.css']
})
export class PumpSummaryGraphComponent {

  @ViewChild('visualizeChart', { static: false }) visualizeChart: ElementRef;

  selectedFieldSub: Subscription;
  constructor(private pumpSummaryGraphsService: PumpSummaryGraphsService, private pumpInventoryService: PumpInventoryService,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.selectedFieldSub = this.pumpSummaryGraphsService.selectedField.subscribe(selectedField => {
      if (selectedField) {
        let pumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
        let filterInventorySummary = this.pumpInventoryService.filterInventorySummary.getValue();
        let filteredPumpInventoryData = this.pumpInventoryService.filterPumpInventoryData(pumpInventoryData, filterInventorySummary);
        let chartData = this.pumpSummaryGraphsService.getBinData(filteredPumpInventoryData, selectedField);
        let type: string = this.pumpSummaryGraphsService.graphType.getValue();

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
                let fieldValueString = selectedField.unit? `${chartData.xData[index]} ${selectedField.unit}` : chartData.xData[index];
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
          ticksuffix = selectedField.unit == undefined? '' : ' ' + selectedField.unit;

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
