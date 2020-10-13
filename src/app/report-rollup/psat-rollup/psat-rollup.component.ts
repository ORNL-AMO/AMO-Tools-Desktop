import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Calculator } from '../../shared/models/calculators';
import { ReportRollupService } from '../report-rollup.service';
import { PsatResultsData } from '../report-rollup-models';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import * as _ from 'lodash';
import { PieChartDataItem } from '../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { BarChartDataItem } from '../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { RollupSummaryTableData } from '../rollup-summary-table/rollup-summary-table.component';

@Component({
  selector: 'app-psat-rollup',
  templateUrl: './psat-rollup.component.html',
  styleUrls: ['./psat-rollup.component.css']
})
export class PsatRollupComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  calculators: Array<Calculator>;
  @Input()
  inPrintView: boolean;

  showPreAssessment: boolean = true;
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
    let psatResults: Array<PsatResultsData> = this.reportRollupService.psatResults.getValue();
    let projectedCosts: Array<number> = new Array();
    let labels: Array<string> = new Array();
    let costSavings: Array<number> = new Array();
    if (dataOption == 'cost') {
      psatResults.forEach(result => {
        labels.push(result.name);
        costSavings.push(result.baselineResults.annual_cost - result.modificationResults.annual_cost);
        projectedCosts.push(result.modificationResults.annual_cost);
      })
    } else if (dataOption == 'energy') {
      psatResults.forEach(result => {
        labels.push(result.name);
        costSavings.push(result.baselineResults.annual_energy - result.modificationResults.annual_energy);
        projectedCosts.push(result.modificationResults.annual_energy);
      })
    }
    return {
      projectedCosts: projectedCosts,
      labels: labels,
      costSavings: costSavings
    }
  }

  setPieChartData() {
    let psatResults: Array<PsatResultsData> = this.reportRollupService.psatResults.getValue();
    this.pieChartData = new Array();
    let totalEnergyUse: number = _.sumBy(psatResults, (result) => { return result.baselineResults.annual_energy; });
    let totalCost: number = _.sumBy(psatResults, (result) => { return result.baselineResults.annual_cost; });
    //starting with 2, summary table uses 0 and 1
    let colorIndex: number = 2;
    psatResults.forEach(result => {
      this.pieChartData.push({
        equipmentName: result.name,
        energyUsed: result.baselineResults.annual_energy,
        annualCost: result.baselineResults.annual_cost,
        percentCost: result.baselineResults.annual_cost / totalCost * 100,
        percentEnergy: result.baselineResults.annual_energy / totalEnergyUse * 100,
        color: graphColors[colorIndex]
      });
      colorIndex++;
    });
  }

  setTableData() {
    this.rollupSummaryTableData = new Array();
    let psatResultData: Array<PsatResultsData> = this.reportRollupService.psatResults.getValue();
    psatResultData.forEach(dataItem => {
      this.rollupSummaryTableData.push({
        equipmentName: dataItem.name,
        modificationName: dataItem.modName,
        baselineEnergyUse: dataItem.baselineResults.annual_energy,
        modificationCost: dataItem.modificationResults.annual_cost,
        modificationEnergyUse: dataItem.baselineResults.annual_energy,
        baselineCost: dataItem.baselineResults.annual_cost,
        costSavings: dataItem.baselineResults.annual_cost - dataItem.modificationResults.annual_cost,
        implementationCosts: dataItem.modification.inputs.implementationCosts,
        payBackPeriod: this.getPayback(dataItem.modificationResults.annual_cost, dataItem.baselineResults.annual_cost, dataItem.modification.inputs.implementationCosts)
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
