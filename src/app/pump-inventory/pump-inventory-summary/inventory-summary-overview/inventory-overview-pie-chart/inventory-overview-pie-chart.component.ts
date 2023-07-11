import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { Subscription } from 'rxjs';
import { InventorySummaryOverviewService, InventorySummary } from '../inventory-summary-overview.service';

@Component({
  selector: 'app-inventory-overview-pie-chart',
  templateUrl: './inventory-overview-pie-chart.component.html',
  styleUrls: ['./inventory-overview-pie-chart.component.css']
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
      let pumpItemData: Array<{ energyCost: number, pumpName: string, color: string }> = this.getPumpItemDataFromSummary(inventorySummary);
      var data = [{
        values: pumpItemData.map(val => { return val.energyCost }),
        labels: pumpItemData.map(val => { return val.pumpName }),
        marker: {
          colors: pumpItemData.map(val => { return 'rgb(' + val.color + ')' }),
          line: {
            width: pumpItemData.map(val => { return 2 }),
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


  getPumpItemDataFromSummary(inventorySummary: InventorySummary): Array<{ energyCost: number, pumpName: string, color: string }> {
    let pumpItemData = new Array<{ energyCost: number, pumpName: string, color: string }>();
    inventorySummary.departmentSummaryItems.forEach(departmentSummaryItem => {
      departmentSummaryItem.pumpItemResults.forEach(pumpItem => {
        pumpItemData.push({
          energyCost: pumpItem.results.energyCost,
          pumpName: pumpItem.name,
          color: departmentSummaryItem.departmentColor
        })
      })
    });
    return pumpItemData;
  }
}
