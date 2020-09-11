import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BatchAnalysisService, BatchAnalysisSettings, BatchAnalysisResults } from '../../batch-analysis.service';
import * as Plotly from 'plotly.js';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-energy-cost-bar-chart',
  templateUrl: './energy-cost-bar-chart.component.html',
  styleUrls: ['./energy-cost-bar-chart.component.css']
})
export class EnergyCostBarChartComponent implements OnInit {

  @ViewChild('energyBarChart', { static: false }) energyBarChart: ElementRef;
  batchAnalysisDataItemsSub: Subscription;
  constructor(private batchAnalysisService: BatchAnalysisService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.batchAnalysisDataItemsSub = this.batchAnalysisService.batchAnalysisDataItems.subscribe(batchAnalysisDataItems => {
      let groups = _.groupBy(batchAnalysisDataItems, "replaceMotor");
      let dataArr = new Array();
      for (let key in groups) {
        if (key == 'Replace Now') {
          groups[key].forEach(dataItem => {
            dataArr.push({
              x: ['Current', 'Modified'],
              y: [dataItem.currentEnergyUse, dataItem.replacementEnergyUse],
              type: "bar",
              name: dataItem.motorName,
              textinfo: 'value',
              textposition: 'auto',
              xaxis: 'x1',
              barmode: 'stack',
              marker: { color: '#117A65', line: { width: 2 } },
              // hoverinfo: 'name+value',
              // hovertemplate: '%{name}: %{value:,.2f} kWh<extra></extra>'
            })
          });
        } else if (key == 'Rewind') {
          groups[key].forEach(dataItem => {
            dataArr.push({
              x: ['Current', 'Modified'],
              y: [dataItem.currentEnergyUse, dataItem.rewindEnergyUse],
              type: "bar",
              name: dataItem.motorName,
              textinfo: 'value',
              textposition: 'auto',
              xaxis: 'x2',
              barmode: 'stack',
              marker: { color: '#7D3C98', line: { width: 2 } },
              // hoverinfo: 'name+value',
              // hovertemplate: '%{name}: %{value:,.2f} kWh<extra></extra>'
            })
          });
        } else if (key == 'Replace When Fail') {
          groups[key].forEach(dataItem => {
            dataArr.push({
              x: ['Current', 'Modified'],
              y: [dataItem.currentEnergyUse, dataItem.replacementEnergyUse],
              type: "bar",
              name: dataItem.motorName,
              textinfo: 'value',
              textposition: 'auto',
              xaxis: 'x3',
              barmode: 'stack',
              marker: { color: '#2874A6', line: { width: 2 } },
              // hoverinfo: 'name+value',
              // hovertemplate: '%{name}: %{value:,.2f} kWh<extra></extra>'
            })
          });
        }
      }
      // let data = this.getTraceData(val);
      let layout = {
        barmode: "stack",
        title: {
          text: 'Motor Analysis Energy Usage Modifications'
        },
        yaxis: {
          title: {
            text: 'Energy Usage (kWh)',
            font: {
              family: 'Arial',
              size: 16
            }
          },
        },
        xaxis: {
          domain: [0, 0.33],
          anchor: 'x1',
          title: 'Replace Now'
        },
        xaxis2: {
          domain: [0.33, 0.66],
          anchor: 'x2', title: 'Replace When Fail'
        },
        xaxis3: {
          domain: [0.67, 1.0],
          anchor: 'x3', title: 'Rewind'
        }
      };

      var configOptions = {
        modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      };
      Plotly.react(this.energyBarChart.nativeElement, dataArr, layout, configOptions);
    });
  }


  ngOnDestroy() {
    this.batchAnalysisDataItemsSub.unsubscribe();
  }
}
