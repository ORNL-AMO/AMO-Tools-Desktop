import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { Subscription } from 'rxjs';
import { InventorySummaryOverviewService, InventorySummary } from '../inventory-summary-overview.service';

@Component({
    selector: 'app-inventory-overview-bar-chart',
    templateUrl: './inventory-overview-bar-chart.component.html',
    styleUrls: ['./inventory-overview-bar-chart.component.css'],
    standalone: false
})
export class PumpInventoryOverviewBarChartComponent implements OnInit {

  @ViewChild('pumpInventoryBarChart', { static: false }) pumpInventoryBarChart: ElementRef;

  invetorySummarySub: Subscription;
  constructor(private inventorySummaryOverviewService: InventorySummaryOverviewService,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.invetorySummarySub = this.inventorySummaryOverviewService.inventorySummary.subscribe(inventorySummary => {
      let dataArray = this.getBarChartTraces(inventorySummary);
      let layout = {
        barmode: "stack",
        title: {
          text: 'Pump Energy Costs',
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
          title: 'Department'
        },
      };

      let configOptions = {
        modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      };
      this.plotlyService.newPlot(this.pumpInventoryBarChart.nativeElement, dataArray, layout, configOptions);
    })
  }

  ngOnDestroy() {
    this.invetorySummarySub.unsubscribe();
  }


  getBarChartTraces(inventorySummary: InventorySummary) {
    let dataTraces = new Array();
    inventorySummary.departmentSummaryItems.forEach(departmentSummaryItem => {
      let departmentOpacity: number = 1;
      let opacityInterval: number = 1 / (departmentSummaryItem.pumpItemResults.length + 1);
      let i = 0;
      departmentSummaryItem.pumpItemResults.forEach(pumpItem => {
        let markerColor: string = 'rgba(' + departmentSummaryItem.departmentColor + ',' + departmentOpacity + ')';
        dataTraces.push({
          x: [departmentSummaryItem.departmentName],
          y: [pumpItem.results.energyCost],
          name: pumpItem.name,
          type: "bar",
          textposition: 'auto',
          barmode: 'stack',
          marker: { color: markerColor, line: { width: 2 } },
          hoverinfo: 'name+value',
          hovertemplate: pumpItem.name + ': %{value:$,.0f} <extra></extra>'
        });
        departmentOpacity = departmentOpacity - opacityInterval;
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
