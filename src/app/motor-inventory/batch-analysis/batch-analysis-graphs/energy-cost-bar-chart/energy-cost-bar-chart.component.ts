import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BatchAnalysisService, BatchAnalysisResults, BatchAnalysisSettings } from '../../batch-analysis.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { PlotlyService } from 'angular-plotly.js';

@Component({
  selector: 'app-energy-cost-bar-chart',
  templateUrl: './energy-cost-bar-chart.component.html',
  styleUrls: ['./energy-cost-bar-chart.component.css']
})
export class EnergyCostBarChartComponent implements OnInit {

  @ViewChild('energyBarChart', { static: false }) energyBarChart: ElementRef;
  batchAnalysisDataItemsSub: Subscription;
  constructor(private batchAnalysisService: BatchAnalysisService, private plotlyService: PlotlyService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.batchAnalysisDataItemsSub = this.batchAnalysisService.batchAnalysisDataItems.subscribe(batchAnalysisDataItems => {
      let batchAnalysisSettings: BatchAnalysisSettings = this.batchAnalysisService.batchAnalysisSettings.getValue();

      let dataArray = new Array();
      //rewind
      let rewindItems: Array<BatchAnalysisResults> = batchAnalysisDataItems.filter(item => { return item.replaceMotor == 'Rewind When Fail' });
      if (rewindItems.length != 0) {
        this.addTraceGroupDataToDataArray(dataArray, rewindItems, 'rgba(125, 60, 152,', 'x1', 'Rewind When Fail');
      }
      //replace when fail
      let replaceWhenFailItems: Array<BatchAnalysisResults> = batchAnalysisDataItems.filter(item => { return item.replaceMotor == 'Replace When Fail' });
      if (replaceWhenFailItems.length != 0) {
        this.addTraceGroupDataToDataArray(dataArray, replaceWhenFailItems, 'rgba(40, 116, 166,', 'x2', 'Replace When Fail');
      }
      //replace now
      let replaceNowItems: Array<BatchAnalysisResults> = batchAnalysisDataItems.filter(item => { return item.replaceMotor == 'Replace Now' });
      if (replaceNowItems.length != 0) {
        this.addTraceGroupDataToDataArray(dataArray, replaceNowItems, 'rgba(17, 122, 101,', 'x3', 'Replace Now');
      }

      //N/A (left over batch analysis items)
      let incompleteItems: Array<BatchAnalysisResults> = batchAnalysisDataItems.filter(item => { return item.isBatchAnalysisValid == false && item.currentEnergyCost });
      if (batchAnalysisSettings.displayIncompleteMotors && incompleteItems.length != 0) {
        this.addTraceGroupDataToDataArray(dataArray, incompleteItems, 'rgba(112, 123, 124,', 'x4', 'Incomplete');
      }


      let xAxisDomains = this.getXAxisDomains(rewindItems.length != 0, replaceNowItems.length != 0, replaceWhenFailItems.length != 0, (batchAnalysisDataItems.length != 0 && batchAnalysisSettings.displayIncompleteMotors));
      let layout = {
        barmode: "stack",
        title: {
          text: 'Motor Annual Energy Costs',
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
          domain: xAxisDomains.rewindDomain,
          anchor: 'x1',
          title: 'Rewind When Fail'
        },
        xaxis2: {
          domain: xAxisDomains.replaceWhenFailDomain,
          anchor: 'x2',
          title: 'Replace When Fail'
        },
        xaxis3: {
          domain: xAxisDomains.replaceDomain,
          anchor: 'x3',
          title: 'Replace Now'
        },
        xaxis4: {
          domain: xAxisDomains.incompleteDomain,
          anchor: 'x4',
          title: 'Incomplete'
        }
      };

      let configOptions = {
        modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      };
      this.plotlyService.newPlot(this.energyBarChart.nativeElement, dataArray, layout, configOptions);
    });
  }

  ngOnDestroy() {
    this.batchAnalysisDataItemsSub.unsubscribe();
  }

  addTraceGroupDataToDataArray(dataArray: Array<any>, dataItems: Array<BatchAnalysisResults>, markerColorStr: string, xAxis: string, replaceRewindVal: string) {
    let rewindOpacity: number = 1;
    let opacityInterval: number = 1 / (dataItems.length + 1);
    for (let i = 0; i < dataItems.length; i++) {
      let markerColor: string = markerColorStr + rewindOpacity + ')';
      let text;
      if (i == dataItems.length - 1) {
        let totalCurrentCost: number = _.sumBy(dataItems, 'currentEnergyCost');
        if (replaceRewindVal == 'Rewind When Fail') {
          let totalRewindCost: number = _.sumBy(dataItems, 'rewindEnergyCost');
          text = [this.getFormatedCurrencyValue(totalCurrentCost), this.getFormatedCurrencyValue(totalRewindCost)];
        } else if (replaceRewindVal != 'Incomplete') {

          let totalReplaceCost: number = _.sumBy(dataItems, 'replacementEnergyCost');
          text = [this.getFormatedCurrencyValue(totalCurrentCost), this.getFormatedCurrencyValue(totalReplaceCost)];
        } else {
          text = [this.getFormatedCurrencyValue(totalCurrentCost)];
        }
      }
      let yData: Array<number>;
      let xData: Array<string>;
      if (replaceRewindVal != 'Incomplete') {
        if (replaceRewindVal == 'Rewind When Fail') {
          yData = [dataItems[i].currentEnergyCost, dataItems[i].replacementEnergyCost];
          xData = ['Current', 'Rewind'];
        } else {
          yData = [dataItems[i].currentEnergyCost, dataItems[i].rewindEnergyCost];
          xData = ['Current', 'Replace'];
        }
      } else if (replaceRewindVal == 'Incomplete') {
        yData = [dataItems[i].currentEnergyCost]
        xData = ['Current'];
      }
      dataArray.push({
        x: xData,
        y: yData,
        type: "bar",
        name: dataItems[i].motorName,
        text: text,
        textposition: 'auto',
        xaxis: xAxis,
        barmode: 'stack',
        marker: { color: markerColor, line: { width: 2 } },
        hoverinfo: 'name+value',
        hovertemplate: dataItems[i].motorName + ': %{value:$,.0f} <extra></extra>'
      });
      rewindOpacity = rewindOpacity - opacityInterval;
    }
  }

  getFormatedCurrencyValue(num: number): string {
    let formattedWithDecimal = '$' + (num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return formattedWithDecimal.substring(0, formattedWithDecimal.length - 3);
  }

  getXAxisDomains(hasRewind: boolean, hasReplace: boolean, hasReplaceWhenFail: boolean, hasIncomplete: boolean): { rewindDomain: Array<number>, replaceDomain: Array<number>, replaceWhenFailDomain: Array<number>, incompleteDomain: Array<number> } {
    let numTypes: number = 0;
    if (hasRewind) { numTypes++ }
    if (hasReplace) { numTypes++ }
    if (hasReplaceWhenFail) { numTypes++ }
    if (hasIncomplete) { numTypes++ }
    let domainInterval: number = 1 / numTypes;
    let incompleteInterval: number = 0;
    if (hasIncomplete) {
      incompleteInterval = domainInterval / numTypes;
    }
    let start: number = 0;
    //rewind
    let rewindDomain: Array<number>;
    //replace when fail
    let replaceWhenFailDomain: Array<number>;
    //replace now
    let replaceDomain: Array<number>;
    //incomplete
    let incompleteDomain: Array<number>;
    if (hasRewind) {
      rewindDomain = [start, start + domainInterval + incompleteInterval - .05];
      start = start + domainInterval + incompleteInterval;
    }
    if (hasReplaceWhenFail) {
      replaceWhenFailDomain = [start, start + domainInterval + incompleteInterval - .05];
      start = start + domainInterval + incompleteInterval;
    }
    if (hasReplace) {
      replaceDomain = [start, start + domainInterval + incompleteInterval - .05];
      start = start + domainInterval + incompleteInterval;
    }
    if (hasIncomplete) {
      incompleteDomain = [start, start + incompleteInterval];
      start = start + incompleteInterval;
    }
    return { rewindDomain: rewindDomain, replaceDomain: replaceDomain, replaceWhenFailDomain: replaceWhenFailDomain, incompleteDomain: incompleteDomain };
  }
}
