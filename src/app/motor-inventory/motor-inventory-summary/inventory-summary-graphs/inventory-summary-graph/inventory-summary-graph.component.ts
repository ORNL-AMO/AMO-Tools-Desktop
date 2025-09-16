import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { InventorySummaryGraphsService } from '../inventory-summary-graphs.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { Subscription } from 'rxjs';
import { PlotlyService } from 'angular-plotly.js';

@Component({
    selector: 'app-inventory-summary-graph',
    templateUrl: './inventory-summary-graph.component.html',
    styleUrls: ['./inventory-summary-graph.component.css'],
    standalone: false
})
export class InventorySummaryGraphComponent implements OnInit {

  @ViewChild('visualizeChart', { static: false }) visualizeChart: ElementRef;

  selectedFieldSub: Subscription;
  constructor(private inventorySummaryGraphsService: InventorySummaryGraphsService, private motorInventoryService: MotorInventoryService,
    private inventorySummaryGraphService: InventorySummaryGraphsService, private plotlyService: PlotlyService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.selectedFieldSub = this.inventorySummaryGraphService.selectedField.subscribe(selectedField => {
      if (selectedField) {
        let motorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
        let filterInventorySummary = this.motorInventoryService.filterInventorySummary.getValue();
        let filteredMotorInventoryData = this.motorInventoryService.filterMotorInventoryData(motorInventoryData, filterInventorySummary);
        let chartData = this.inventorySummaryGraphsService.getBinData(filteredMotorInventoryData, selectedField);
        let graphType: string = this.inventorySummaryGraphService.graphType.getValue();
        let data;

        let ticksuffix: string;
        let textTemplate: string;

        let range = [0, Math.max(...chartData.yData)];
        if (graphType === 'pie') {
          data = [
            {
              x: chartData.xData,
              y: chartData.yData,
              values: chartData.yData,
              labels: chartData.xData,
              text: chartData.yData.map((fieldValue, index) => {
                let motorCountString = fieldValue > 1 ? `${fieldValue} motors` : `${fieldValue} motors`;
                let fieldValueString = selectedField.unit? `${chartData.xData[index]} ${selectedField.unit}` : chartData.xData[index];
                return `${fieldValueString} <br> ${motorCountString}`;
              }),
              type: graphType,
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
              type: graphType,
            }
          ];
          ticksuffix = selectedField.unit == undefined? '' : ' ' + selectedField.unit;
        }
        let layout = {
          title: {
            text: 'Motor Inventory',
            font: {
              family: 'Roboto',
              size: 22
            }
          },
          yaxis: {
            // hoverformat: '.3r',
            title: {
              text: '# of Motors',
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
