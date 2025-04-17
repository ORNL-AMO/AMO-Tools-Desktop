import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { InventorySummary, InventorySummaryOverviewService } from '../inventory-summary-overview.service';
import { Subscription } from 'rxjs';
import { PlotlyService } from 'angular-plotly.js';

@Component({
    selector: 'app-inventory-overview-pie-chart',
    templateUrl: './inventory-overview-pie-chart.component.html',
    styleUrls: ['./inventory-overview-pie-chart.component.css'],
    standalone: false
})
export class InventoryOverviewPieChartComponent implements OnInit {


  @ViewChild('overviewPieChart', { static: false }) overviewPieChart: ElementRef;

  invetorySummarySub: Subscription;
  constructor(private inventorySummaryOverviewService: InventorySummaryOverviewService,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.invetorySummarySub = this.inventorySummaryOverviewService.inventorySummary.subscribe(inventorySummary => {
      let motorItemData: Array<{ energyCost: number, motorName: string, color: string }> = this.getMotorItemDataFromSummary(inventorySummary);
      var data = [{
        values: motorItemData.map(val => { return val.energyCost }),
        labels: motorItemData.map(val => { return val.motorName }),
        marker: {
          colors: motorItemData.map(val => { return 'rgb(' + val.color + ')' }),
          line: {
            width: motorItemData.map(val => { return 2 }),
            color: '#fff'
          }
        },
        type: 'pie',
        textposition: 'auto',
        insidetextorientation: "horizontal",
        textinfo: 'label+value',
        texttemplate: '%{label}<br>%{value:$,.0f}',
        hoverinfo: 'label+percent',
        hovertemplate: '%{percent:%,.2f} <extra></extra>',
        // direction: "clockwise",
        // rotation: -45,
        sort: false,
        automargin: true
      }];
      let layout = {
        title: {
          text: 'Annual Energy Cost'
        },
        showlegend: false,
        font: {
          size: 12,
        },
      };

      let configOptions = {
        modeBarButtonsToRemove: ['hoverClosestPie'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      };
      this.plotlyService.newPlot(this.overviewPieChart.nativeElement, data, layout, configOptions);
    })
  }

  ngOnDestroy() {
    this.invetorySummarySub.unsubscribe();
  }


  getMotorItemDataFromSummary(inventorySummary: InventorySummary): Array<{ energyCost: number, motorName: string, color: string }> {
    let motorItemData = new Array<{ energyCost: number, motorName: string, color: string }>();
    inventorySummary.departmentSummaryItems.forEach(departmentSummaryItem => {
      departmentSummaryItem.motorItemResults.forEach(motorItem => {
        motorItemData.push({
          energyCost: motorItem.results.existingEnergyCost,
          motorName: motorItem.name,
          color: departmentSummaryItem.departmentColor
        })
      })
    });
    return motorItemData;
  }
}
