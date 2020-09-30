import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Calculator } from '../../shared/models/calculators';
import { BarChartDataItem } from '../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { PieChartDataItem } from '../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { RollupSummaryTableData } from '../rollup-summary-table/rollup-summary-table.component';
import { ReportRollupService } from '../report-rollup.service';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import { FsatResultsData } from '../report-rollup-models';
import * as _ from 'lodash';
@Component({
  selector: 'app-fsat-rollup',
  templateUrl: './fsat-rollup.component.html',
  styleUrls: ['./fsat-rollup.component.css']
})
export class FsatRollupComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  calculators: Array<Calculator>;
  @Input()
  inPrintView: boolean;

  pieChartDataOption: string = 'energy';
  barChartDataOption: string;
  barChartData: Array<BarChartDataItem>;
  energyBarChartData: Array<BarChartDataItem>;
  costBarChartData: Array<BarChartDataItem>;
  tickFormat: string;
  yAxisLabel: string;
  pieChartData: Array<PieChartDataItem>;
  rollupSummaryTableData: Array<RollupSummaryTableData>;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.setTableData();
    this.setBarChartData();
    this.setBarChartOption('energy');
    this.setPieChartData();
  }

  setPieChartOption(str: string) {
    this.pieChartDataOption = str;
  }

  setBarChartOption(str: string) {
    this.barChartDataOption = str;
    if (this.barChartDataOption == 'energy') {
      this.yAxisLabel = 'Annual Energy Usage (' + this.settings.powerMeasurement + ')';
      this.tickFormat = '.2s'
      this.barChartData = this.energyBarChartData;
    } else {
      this.yAxisLabel = 'Annual Energy Cost ($/yr)';
      this.tickFormat = '$.2s';
      this.barChartData = this.costBarChartData;
    }
  }

  setBarChartData() {
    this.costBarChartData = this.getDataObject('cost');
    this.energyBarChartData = this.getDataObject('energy');
  }

  getDataObject(dataOption: string): Array<BarChartDataItem> {
    let hoverTemplate: string = '%{y:$,.0f}<extra></extra>';
    let traceName: string = "Modification Costs";
    if (dataOption == 'energy') {
      hoverTemplate = '%{y:,.0f}<extra></extra> ' + this.settings.powerMeasurement;
      traceName = "Modification Energy Use";
    }
    let chartData: { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } = this.getChartData(dataOption);
    let projectCostTrace: BarChartDataItem = {
      x: chartData.labels,
      y: chartData.projectedCosts,
      hoverinfo: 'all',
      hovertemplate: hoverTemplate,
      name: traceName,
      type: "bar",
      marker: {
        color: graphColors[1]
      },
    };
    let costSavingsTrace: BarChartDataItem = {
      x: chartData.labels,
      y: chartData.costSavings,
      hoverinfo: 'all',
      hovertemplate: hoverTemplate,
      name: "Savings From Baseline",
      type: "bar",
      marker: {
        color: graphColors[0]
      },
    }
    var data = [projectCostTrace, costSavingsTrace];
    return data;
  }

  getChartData(dataOption: string): { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } {
    let fsatResults: Array<FsatResultsData> = this.reportRollupService.fsatResults.getValue();
    let projectedCosts: Array<number> = new Array();
    let labels: Array<string> = new Array();
    let costSavings: Array<number> = new Array();
    if (dataOption == 'cost') {
      fsatResults.forEach(result => {
        labels.push(result.name);
        costSavings.push(result.baselineResults.annualCost - result.modificationResults.annualCost);
        projectedCosts.push(result.modificationResults.annualCost);
      })
    } else if (dataOption == 'energy') {
      fsatResults.forEach(result => {
        labels.push(result.name);
        costSavings.push(result.baselineResults.annualEnergy - result.modificationResults.annualEnergy);
        projectedCosts.push(result.modificationResults.annualEnergy);
      })
    }
    return {
      projectedCosts: projectedCosts,
      labels: labels,
      costSavings: costSavings
    }
  }

  setPieChartData() {
    let fsatResults: Array<FsatResultsData> = this.reportRollupService.fsatResults.getValue();
    this.pieChartData = new Array();
    let totalEnergyUse: number = _.sumBy(fsatResults, (result) => { return result.baselineResults.annualEnergy; });
    let totalCost: number = _.sumBy(fsatResults, (result) => { return result.baselineResults.annualCost; });
    //starting with 2, summary table uses 0 and 1
    let colorIndex: number = 2;
    fsatResults.forEach(result => {
      this.pieChartData.push({
        equipmentName: result.name,
        energyUsed: result.baselineResults.annualEnergy,
        annualCost: result.baselineResults.annualCost,
        percentCost: result.baselineResults.annualCost / totalCost * 100,
        percentEnergy: result.baselineResults.annualEnergy / totalEnergyUse * 100,
        color: graphColors[colorIndex]
      });
      colorIndex++;
    });
  }

  setTableData() {
    this.rollupSummaryTableData = new Array();
    let fsatResults: Array<FsatResultsData> = this.reportRollupService.fsatResults.getValue();
    fsatResults.forEach(dataItem => {
      this.rollupSummaryTableData.push({
        equipmentName: dataItem.name,
        modificationName: dataItem.modName,
        baselineEnergyUse: dataItem.baselineResults.annualEnergy,
        modificationCost: dataItem.modificationResults.annualCost,
        modificationEnergyUse: dataItem.baselineResults.annualEnergy,
        baselineCost: dataItem.baselineResults.annualCost,
        costSavings: dataItem.baselineResults.annualCost - dataItem.modificationResults.annualCost,
        implementationCosts: dataItem.modification.implementationCosts,
        payBackPeriod: this.getPayback(dataItem.modificationResults.annualCost, dataItem.baselineResults.annualCost, dataItem.modification.implementationCosts)
      })
    })
  }
  getPayback(modCost: number, baselineCost: number, implementationCost: number) {
    if (implementationCost) {
      let val = (implementationCost / (baselineCost - modCost)) * 12;
      if (isNaN(val) === false) {
        return val;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }
}
