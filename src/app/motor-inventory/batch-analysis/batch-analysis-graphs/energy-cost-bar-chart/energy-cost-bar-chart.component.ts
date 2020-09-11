import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BatchAnalysisService } from '../../batch-analysis.service';
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
      let dataArr = new Array();

      //rewind
      let rewindItems = batchAnalysisDataItems.filter(item => { return item.replaceMotor == 'Rewind' });
      if (rewindItems.length != 0) {
        let rewindOpacity: number = 1;
        let opacityInterval: number = 1 / (rewindItems.length + 1);
        let totalCurrentEnergyCost: number = _.sumBy(rewindItems, 'currentEnergyCost');
        let totalModifiedEnergyCost: number = _.sumBy(rewindItems, 'rewindEnergyCost');
        for (let i = 0; i < rewindItems.length; i++) {
          let markerColor: string = 'rgba(125, 60, 152,' + rewindOpacity + ')';
          let text;
          if (i == rewindItems.length - 1) {
            text = [this.getFormatedCurrencyValue(totalCurrentEnergyCost), this.getFormatedCurrencyValue(totalModifiedEnergyCost)];
          }
          dataArr.push({
            x: ['Current', 'Modified'],
            y: [rewindItems[i].currentEnergyCost, rewindItems[i].rewindEnergyCost],
            type: "bar",
            name: rewindItems[i].motorName,
            text: text,
            textposition: 'auto',
            xaxis: 'x1',
            barmode: 'stack',
            marker: { color: markerColor, line: { width: 2 } },
          });
          rewindOpacity = rewindOpacity - opacityInterval;
        }
      }

      //replace when fail
      let replaceWhenFailItems = batchAnalysisDataItems.filter(item => { return item.replaceMotor == 'Replace When Fail' });
      if (replaceWhenFailItems.length != 0) {
        let replaceWhenFailOpacity: number = 1;
        let opacityInterval = 1 / (replaceWhenFailItems.length + 1);
        let totalCurrentEnergyCost: number = _.sumBy(replaceWhenFailItems, 'currentEnergyCost');
        let totalModifiedEnergyCost: number = _.sumBy(replaceWhenFailItems, 'replacementEnergyCost');
        for (let i = 0; i < replaceWhenFailItems.length; i++) {
          let text;
          if (i == replaceWhenFailItems.length - 1) {
            text = [this.getFormatedCurrencyValue(totalCurrentEnergyCost), this.getFormatedCurrencyValue(totalModifiedEnergyCost)];
          }
          let markerColor: string = 'rgba(40, 116, 166,' + replaceWhenFailOpacity + ')';
          dataArr.push({
            x: ['Current', 'Modified'],
            y: [replaceWhenFailItems[i].currentEnergyCost, replaceWhenFailItems[i].replacementEnergyCost],
            type: "bar",
            name: replaceWhenFailItems[i].motorName,
            text: text,
            textposition: 'auto',
            xaxis: 'x2',
            barmode: 'stack',
            marker: { color: markerColor, line: { width: 2 } },
          });
          replaceWhenFailOpacity = replaceWhenFailOpacity - opacityInterval;
        };
      }
      //replace now
      let replaceNowItems = batchAnalysisDataItems.filter(item => { return item.replaceMotor == 'Replace Now' });
      if (replaceNowItems.length != 0) {
        let replaceNowOpacity: number = 1;
        let opacityInterval: number = 1 / (replaceNowItems.length + 1);
        let totalCurrentEnergyCost: number = _.sumBy(replaceNowItems, 'currentEnergyCost');
        let totalModifiedEnergyCost: number = _.sumBy(replaceNowItems, 'replacementEnergyCost');
        for (let i = 0; i < replaceNowItems.length; i++) {
          let text;
          if (i == replaceNowItems.length - 1) {
            text = [this.getFormatedCurrencyValue(totalCurrentEnergyCost), this.getFormatedCurrencyValue(totalModifiedEnergyCost)];
          }
          let markerColor: string = 'rgba(17, 122, 101,' + replaceNowOpacity + ')';
          dataArr.push({
            x: ['Current', 'Modified'],
            y: [replaceNowItems[i].currentEnergyCost, replaceNowItems[i].replacementEnergyCost],
            type: "bar",
            name: replaceNowItems[i].motorName,
            text: text,
            textposition: 'auto',
            xaxis: 'x3',
            barmode: 'stack',
            marker: { color: markerColor, line: { width: 2 } },
          });
          replaceNowOpacity = replaceNowOpacity - opacityInterval;
        };
      }
      let layout = {
        barmode: "stack",
        title: {
          text: 'Motor Energy Costs',
        },
        yaxis: {
          title: {
            text: 'Energy Cost ($/yr)',
            font: {
              family: 'Arial',
              size: 16
            }
          },
        },
        xaxis: {
          domain: [0, 0.33],
          anchor: 'x1',
          title: 'Rewind'
        },
        xaxis2: {
          domain: [0.33, 0.66],
          anchor: 'x2', title: 'Replace When Fail'
        },
        xaxis3: {
          domain: [0.67, 1.0],
          anchor: 'x3', title: 'Replace Now'
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

  getFormatedCurrencyValue(num: number): string {
    return '$' + (num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
  }
}
