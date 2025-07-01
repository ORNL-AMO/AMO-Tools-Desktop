import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { Subscription } from 'rxjs';
import { CompressedAirInventorySummaryOverviewService, InventorySummary } from '../compressed-air-inventory-summary-overview.service';

@Component({
  selector: 'app-compressed-air-inventory-overview-pie-chart',
  templateUrl: './compressed-air-inventory-overview-pie-chart.component.html',
  styleUrl: './compressed-air-inventory-overview-pie-chart.component.css',
  standalone: false
})
export class CompressedAirInventoryOverviewPieChartComponent implements OnInit {


  @ViewChild('overviewPieChart', { static: false }) overviewPieChart: ElementRef;

  invetorySummarySub: Subscription;
  constructor(private inventorySummaryOverviewService: CompressedAirInventorySummaryOverviewService,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.invetorySummarySub = this.inventorySummaryOverviewService.inventorySummary.subscribe(inventorySummary => {
      let compressedAirItemData: Array<{ energyCost: number, compressedAirName: string, color: string }> = this.getCompresedAirItemDataFromSummary(inventorySummary);
      var data = [{
        values: compressedAirItemData.map(val => { return val.energyCost }),
        labels: compressedAirItemData.map(val => { return val.compressedAirName }),
        marker: {
          colors: compressedAirItemData.map(val => { return 'rgb(' + val.color + ')' }),
          line: {
            width: compressedAirItemData.map(val => { return 2 }),
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


  getCompresedAirItemDataFromSummary(inventorySummary: InventorySummary): Array<{ energyCost: number, compressedAirName: string, color: string }> {
    let compressedAirItemData = new Array<{ energyCost: number, compressedAirName: string, color: string }>();
    inventorySummary.systemSummaryItems.forEach(systemSummaryItem => {
      systemSummaryItem.compressedAirItemResults.forEach(compressedAirItem => {
        compressedAirItemData.push({
          energyCost: compressedAirItem.results.energyCost,
          compressedAirName: compressedAirItem.name,
          color: systemSummaryItem.systemColor
        })
      })
    });
    return compressedAirItemData;
  }
}
