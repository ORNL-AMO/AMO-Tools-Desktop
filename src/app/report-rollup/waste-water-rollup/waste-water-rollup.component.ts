import { Component, Input, OnInit } from '@angular/core';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import { BarChartDataItem } from '../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { PieChartDataItem } from '../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { RollupSummaryTableData } from '../rollup-summary-table/rollup-summary-table.component';
import { WasteWaterReportRollupService } from '../waste-water-report-rollup.service';
import * as _ from 'lodash';
import { EffluentEnergyResults, NutrientRemovalResults } from '../report-rollup-models';

@Component({
  selector: 'app-waste-water-rollup',
  templateUrl: './waste-water-rollup.component.html',
  styleUrls: ['./waste-water-rollup.component.css']
})
export class WasteWaterRollupComponent implements OnInit {
  @Input()
  printView: boolean;

  pieChartDataOption: string = 'energy';
  barChartDataOption: string;
  barChartData: Array<BarChartDataItem>;
  energyBarChartData: Array<BarChartDataItem>;
  costBarChartData: Array<BarChartDataItem>;
  tickFormat: string;
  yAxisLabel: string;
  pieChartData: Array<PieChartDataItem>;
  rollupSummaryTableData: Array<RollupSummaryTableData>;
  rollupEffluentEnergyTable: Array<EffluentEnergyResults>;
  rollupNutrientTable: Array<NutrientRemovalResults>;
  // settings: Settings;
  constructor(private wasteWaterReportRollupService: WasteWaterReportRollupService) { }

  ngOnInit(): void {
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
      this.yAxisLabel = 'Annual Energy Usage (MWh)';
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
      hoverTemplate = '%{y:,.0f}<extra></extra> MWh';
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
    let projectedCosts: Array<number> = new Array();
    let labels: Array<string> = new Array();
    let costSavings: Array<number> = new Array();
    if (dataOption == 'cost' || dataOption == 'costSavings') {
      this.wasteWaterReportRollupService.selectedWasteWaterResults.forEach(result => {
        labels.push(result.name);
        costSavings.push(result.baselineResults.AeCost - result.modificationResults.AeCost);
        projectedCosts.push(result.modificationResults.AeCost);
      })
    } else if (dataOption == 'energy' || dataOption == 'energySavings') {
      this.wasteWaterReportRollupService.selectedWasteWaterResults.forEach(result => {
        labels.push(result.name);
        costSavings.push(result.baselineResults.AeEnergyAnnual - result.modificationResults.AeEnergyAnnual);
        projectedCosts.push(result.modificationResults.AeEnergyAnnual);
      })
    }
    return {
      projectedCosts: projectedCosts,
      labels: labels,
      costSavings: costSavings
    }
  }

  setPieChartData() {
    this.pieChartData = new Array();
    let totalEnergyUse: number = _.sumBy(this.wasteWaterReportRollupService.selectedWasteWaterResults, (result) => { return result.baselineResults.AeEnergyAnnual; });
    let totalCost: number = _.sumBy(this.wasteWaterReportRollupService.selectedWasteWaterResults, (result) => { return result.baselineResults.AeCost; });
    //starting with 2, summary table uses 0 and 1
    let colorIndex: number = 2;
    this.wasteWaterReportRollupService.selectedWasteWaterResults.forEach(result => {
      this.pieChartData.push({
        equipmentName: result.name,
        energyUsed: result.baselineResults.AeEnergyAnnual,
        annualCost: result.baselineResults.AeCost,
        energySavings: result.baselineResults.AeEnergyAnnual - result.modificationResults.AeEnergyAnnual,
        costSavings: result.baselineResults.AeCost - result.modificationResults.AeCost,
        percentCost: result.baselineResults.AeCost / totalCost * 100,
        percentEnergy: result.baselineResults.AeEnergyAnnual / totalEnergyUse * 100,
        color: graphColors[colorIndex]
      });
      colorIndex++;
    });
  }

  setTableData() {
    this.rollupSummaryTableData = new Array();
    this.wasteWaterReportRollupService.selectedWasteWaterResults.forEach(dataItem => {
      this.rollupSummaryTableData.push({
        equipmentName: dataItem.name,
        modificationName: dataItem.modName,
        baselineEnergyUse: dataItem.baselineResults.AeEnergyAnnual,
        modificationCost: dataItem.modificationResults.AeCost,
        modificationEnergyUse: dataItem.baselineResults.AeEnergyAnnual,
        baselineCost: dataItem.baselineResults.AeCost,
        costSavings: dataItem.baselineResults.AeCost - dataItem.modificationResults.AeCost,
        implementationCosts: 0,
        payBackPeriod: this.getPayback(dataItem.modificationResults.AeCost, dataItem.baselineResults.AeCost, 0)
      })
    });

    this.rollupNutrientTable = this.wasteWaterReportRollupService.nutrientRemovalResults;
    this.rollupEffluentEnergyTable = this.wasteWaterReportRollupService.effluentEnergyResults;
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
