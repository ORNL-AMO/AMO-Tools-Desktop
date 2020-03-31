import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Calculator } from '../../shared/models/calculators';
import { PhastResultsData } from '../report-rollup-models';
import { PieChartDataItem } from '../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { ReportRollupService } from '../report-rollup.service';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-phast-rollup',
  templateUrl: './phast-rollup.component.html',
  styleUrls: ['./phast-rollup.component.css']
})
export class PhastRollupComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phastResults: Array<PhastResultsData>;
  @Input()
  calculators: Array<Calculator>;

  pieChartDataOption: string = 'energy';
  // barChartDataOption: string;
  // barChartData: Array<BarChartDataItem>;
  // energyBarChartData: Array<BarChartDataItem>;
  // costBarChartData: Array<BarChartDataItem>;
  // tickFormat: string;
  // yAxisLabel: string;
  pieChartData: Array<PieChartDataItem>;
  // rollupSummaryTableData: Array<RollupSummaryTableData>;
  constructor(private reportRollupService: ReportRollupService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    // this.setTableData();
    // this.setBarChartData();
    // this.setBarChartOption('energy');
    this.setPieChartData();
  }

  setPieChartOption(str: string) {
    this.pieChartDataOption = str;
  }

  // setBarChartOption(str: string) {
  //   this.barChartDataOption = str;
  //   if (this.barChartDataOption == 'energy') {
  //     this.yAxisLabel = 'Annual Energy Usage (' + this.settings.powerMeasurement + ')';
  //     this.tickFormat = '.2s'
  //     this.barChartData = this.energyBarChartData;
  //   } else {
  //     this.yAxisLabel = 'Annual Energy Cost ($/yr)';
  //     this.tickFormat = '$.2s';
  //     this.barChartData = this.costBarChartData;
  //   }
  // }

  // setBarChartData() {
  //   this.costBarChartData = this.getDataObject('cost');
  //   this.energyBarChartData = this.getDataObject('energy');
  // }

  // getDataObject(dataOption: string): Array<BarChartDataItem> {
  //   let hoverTemplate: string = '%{y:$,.0f}<extra></extra>';
  //   let traceName: string = "Modification Costs";
  //   if (dataOption == 'energy') {
  //     hoverTemplate = '%{y:,.0f}<extra></extra> ' + this.settings.powerMeasurement;
  //     traceName = "Modification Energy Use";
  //   }
  //   let chartData: { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } = this.getChartData(dataOption);
  //   let projectCostTrace: BarChartDataItem = {
  //     x: chartData.labels,
  //     y: chartData.projectedCosts,
  //     hoverinfo: 'all',
  //     hovertemplate: hoverTemplate,
  //     name: traceName,
  //     type: "bar",
  //     marker: {
  //       color: graphColors[1]
  //     },
  //   };
  //   let costSavingsTrace: BarChartDataItem = {
  //     x: chartData.labels,
  //     y: chartData.costSavings,
  //     hoverinfo: 'all',
  //     hovertemplate: hoverTemplate,
  //     name: "Savings From Baseline",
  //     type: "bar",
  //     marker: {
  //       color: graphColors[0]
  //     },
  //   }
  //   var data = [projectCostTrace, costSavingsTrace];
  //   return data;
  // }

  // getChartData(dataOption: string): { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } {
  //   let fsatResults: Array<FsatResultsData> = this.reportRollupService.fsatResults.getValue();
  //   let projectedCosts: Array<number> = new Array();
  //   let labels: Array<string> = new Array();
  //   let costSavings: Array<number> = new Array();
  //   if (dataOption == 'cost') {
  //     fsatResults.forEach(result => {
  //       labels.push(result.name);
  //       costSavings.push(result.baselineResults.annualCost - result.modificationResults.annualCost);
  //       projectedCosts.push(result.modificationResults.annualCost);
  //     })
  //   } else if (dataOption == 'energy') {
  //     fsatResults.forEach(result => {
  //       labels.push(result.name);
  //       costSavings.push(result.baselineResults.annualEnergy - result.modificationResults.annualEnergy);
  //       projectedCosts.push(result.modificationResults.annualEnergy);
  //     })
  //   }
  //   return {
  //     projectedCosts: projectedCosts,
  //     labels: labels,
  //     costSavings: costSavings
  //   }
  // }

  setPieChartData() {
    this.pieChartData = new Array();
    let phastResults: Array<PhastResultsData> = this.reportRollupService.phastResults.getValue();
    //Use copy to avoid changing original results, convert all data to a common unit for comparisons
    let phastResultsCpy: Array<PhastResultsData> = JSON.parse(JSON.stringify(phastResults));
    phastResultsCpy.forEach(result => {
      result.baselineResults.annualEnergyUsed = this.getConvertedEnergyValue(result.baselineResults.annualEnergyUsed, result.settings);
      result.modificationResults.annualEnergyUsed = this.getConvertedEnergyValue(result.modificationResults.annualEnergyUsed, result.settings);
    });
    let totalEnergyUse: number = _.sumBy(phastResultsCpy, (result) => { return result.baselineResults.annualEnergyUsed; });
    let totalCost: number = _.sumBy(phastResultsCpy, (result) => { return result.baselineResults.annualCost; });
    //starting with 2, summary table uses 0 and 1
    let colorIndex: number = 2;
    phastResultsCpy.forEach(result => {
      this.pieChartData.push({
        equipmentName: result.name,
        energyUsed: result.baselineResults.annualEnergyUsed,
        annualCost: result.baselineResults.annualCost,
        percentCost: result.baselineResults.annualCost / totalCost * 100,
        percentEnergy: result.baselineResults.annualEnergyUsed / totalEnergyUse * 100,
        color: graphColors[colorIndex],
        furnaceType: result.settings.energySourceType
      });
      colorIndex++;
    });
  }

  setEnergyUseTableData(){

  }

  // setTableData() {
  //   this.rollupSummaryTableData = new Array();
  //   let fsatResults: Array<FsatResultsData> = this.reportRollupService.fsatResults.getValue();
  //   fsatResults.forEach(dataItem => {
  //     this.rollupSummaryTableData.push({
  //       equipmentName: dataItem.name,
  //       modificationName: dataItem.modName,
  //       baselineEnergyUse: dataItem.baselineResults.annualEnergy,
  //       modificationCost: dataItem.modificationResults.annualCost,
  //       modificationEnergyUse: dataItem.baselineResults.annualEnergy,
  //       baselineCost: dataItem.baselineResults.annualCost,
  //       costSavings: dataItem.baselineResults.annualCost - dataItem.modificationResults.annualCost,
  //       implementationCosts: dataItem.modification.implementationCosts,
  //       payBackPeriod: this.getPayback(dataItem.modificationResults.annualCost, dataItem.baselineResults.annualCost, dataItem.modification.implementationCosts)
  //     })
  //   })
  // }
  // getPayback(modCost: number, baselineCost: number, implementationCost: number) {
  //   if (implementationCost) {
  //     let val = (implementationCost / (baselineCost - modCost)) * 12;
  //     if (isNaN(val) === false) {
  //       return val;
  //     } else {
  //       return 0;
  //     }
  //   } else {
  //     return 0;
  //   }
  // }

  getConvertedEnergyValue(val: number, settings: Settings) {
    return this.convertUnitsService.value(val).from(settings.energyResultUnit).to(this.settings.phastRollupUnit);
  }
}
