import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as Plotly from 'plotly.js';
import { InventorySummaryGraphsService } from '../inventory-summary-graphs.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { Subscription } from 'rxjs';
import { MotorInventorySummaryService } from '../../motor-inventory-summary.service';

@Component({
  selector: 'app-inventory-summary-graph',
  templateUrl: './inventory-summary-graph.component.html',
  styleUrls: ['./inventory-summary-graph.component.css']
})
export class InventorySummaryGraphComponent implements OnInit {

  @ViewChild('visualizeChart', { static: false }) visualizeChart: ElementRef;

  selectedFieldSub: Subscription;
  constructor(private inventorySummaryGraphsService: InventorySummaryGraphsService, private motorInventoryService: MotorInventoryService,
    private inventorySummaryGraphService: InventorySummaryGraphsService, private motorInventorySummaryService: MotorInventorySummaryService) { }

  ngOnInit(): void {
    this.selectedFieldSub = this.inventorySummaryGraphService.selectedField.subscribe(val => {
      Plotly.purge('inventoryGraph');
      if (val) {
        let motorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
        let filterInventorySummary = this.motorInventorySummaryService.filterInventorySummary.getValue();
        let filteredMotorInventoryData = this.motorInventorySummaryService.filterMotorInventoryData(motorInventoryData, filterInventorySummary);
        let calcedData = this.inventorySummaryGraphsService.getBinData(filteredMotorInventoryData, val);
        let type: string = this.inventorySummaryGraphService.graphType.getValue();
        let data = [
          {
            x: calcedData.xData,
            y: calcedData.yData,
            values: calcedData.yData,
            labels: calcedData.xData,
            type: type,
            textinfo: 'label+value'
          }
        ];
        let ticksuffix: string;
        if (val.unit) {
          ticksuffix = ' ' + val.unit
        }

        let layout = {
          title: {
            text: 'Motor Inventory',
            font: {
              family: 'Arial',
              size: 22
            }
          },
          yaxis: {
            // hoverformat: '.3r',
            title: {
              text: '# of Motors',
              font: {
                family: 'Arial',
                size: 16
              }
            },
            fixedrange: true,
            tickformat: ',d'
          },
          xaxis: {
            fixedrange: true,
            title: {
              text: val.display
            },
            font: {
              family: 'Arial',
              size: 16
            },
            type: 'category',
            ticksuffix: ticksuffix
          },
        };
        let config = { responsive: true }
        Plotly.newPlot('inventoryGraph', data, layout, config);
      }
    });
  }

  ngOnDestroy() {
    this.selectedFieldSub.unsubscribe();
  }
}
