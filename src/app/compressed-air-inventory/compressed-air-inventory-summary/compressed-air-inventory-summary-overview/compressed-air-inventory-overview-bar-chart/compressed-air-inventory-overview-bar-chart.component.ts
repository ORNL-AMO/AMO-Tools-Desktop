import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { Subscription } from 'rxjs';
import { CompressedAirInventorySummaryOverviewService, InventorySummary } from '../compressed-air-inventory-summary-overview.service';

@Component({
  selector: 'app-compressed-air-inventory-overview-bar-chart',
  templateUrl: './compressed-air-inventory-overview-bar-chart.component.html',
  styleUrl: './compressed-air-inventory-overview-bar-chart.component.css',
  standalone: false
})
export class CompressedAirInventoryOverviewBarChartComponent implements OnInit {

  @ViewChild('compressedAirInventoryBarChart', { static: false }) compressedAirInventoryBarChart: ElementRef;

  inventorySummarySub: Subscription;
  constructor(private inventorySummaryOverviewService: CompressedAirInventorySummaryOverviewService,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.inventorySummarySub = this.inventorySummaryOverviewService.inventorySummary.subscribe(inventorySummary => {
      let dataArray = this.getBarChartTraces(inventorySummary);
      let layout = {
        barmode: "stack",
        title: {
          text: 'Compressed Air Energy Costs',
        },
        yaxis: {
          title: {
            text: 'Energy Cost ($/yr)',
            font: {
              family: 'Roboto',
              size: 16
            }
          },
        },
        xaxis: {
          title: 'System'
        },
      };

      let configOptions = {
        modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      };
      this.plotlyService.newPlot(this.compressedAirInventoryBarChart.nativeElement, dataArray, layout, configOptions);
    })
  }

  ngOnDestroy() {
    this.inventorySummarySub.unsubscribe();
  }


  getBarChartTraces(inventorySummary: InventorySummary) {
    let dataTraces = new Array();
    inventorySummary.systemSummaryItems.forEach(systemSummaryItem => {
      let systemOpacity: number = 1;
      let opacityInterval: number = 1 / (systemSummaryItem.compressedAirItemResults.length + 1);
      let i = 0;
      systemSummaryItem.compressedAirItemResults.forEach(compressedAirItem => {
        let markerColor: string = 'rgba(' + systemSummaryItem.systemColor + ',' + systemOpacity + ')';
        dataTraces.push({
          x: [systemSummaryItem.systemName],
          y: [compressedAirItem.results.energyCost],
          name: compressedAirItem.name,
          type: "bar",
          textposition: 'auto',
          barmode: 'stack',
          marker: { color: markerColor, line: { width: 2 } },
          hoverinfo: 'name+value',
          hovertemplate: compressedAirItem.name + ': %{value:$,.0f} <extra></extra>'
        });
        systemOpacity = systemOpacity - opacityInterval;
        i++;
      });
    });
    return dataTraces;
  }

  getFormatedCurrencyValue(num: number): string {
    let formattedWithDecimal = '$' + (num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return formattedWithDecimal.substring(0, formattedWithDecimal.length - 3);
  }
}
