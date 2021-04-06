import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import { SsmtResultsData } from '../report-rollup-models';
import { BarChartDataItem } from '../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { RollupSummaryTableData } from '../rollup-summary-table/rollup-summary-table.component';
import { SsmtReportRollupService } from '../ssmt-report-rollup.service';
import { ReportRollupService } from '../report-rollup.service';

@Component({
  selector: 'app-ssmt-rollup',
  templateUrl: './ssmt-rollup.component.html',
  styleUrls: ['./ssmt-rollup.component.css']
})
export class SsmtRollupComponent implements OnInit {
  @Input()
  printView: boolean;

  dataOption: string = 'cost';
  barChartData: Array<BarChartDataItem>;
  costChartData: Array<BarChartDataItem>;
  energyChartData: Array<BarChartDataItem>;
  tickFormat: string;
  yAxisLabel: string;
  rollupSummaryTableData: Array<RollupSummaryTableData>;
  energyUnit: string;
  settings: Settings;
  constructor(private ssmtReportRollupService: SsmtReportRollupService, private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.settings = this.reportRollupService.settings.getValue();
    this.energyUnit = this.settings.steamEnergyMeasurement + '/hr';
    this.setTableData();
    this.setBarChartData();
    this.setBarChartOption('energy');
  }

  setBarChartData() {
    this.costChartData = this.getDataObject('cost');
    this.energyChartData = this.getDataObject('energy');
  }

  setBarChartOption(str: string) {
    this.dataOption = str;
    if (this.dataOption == 'energy') {
      this.yAxisLabel = 'Annual Energy Usage (' + this.settings.steamEnergyMeasurement + '/hr)';
      this.tickFormat = '.2s'
      this.barChartData = this.energyChartData;
    } else {
      this.yAxisLabel = 'Annual Energy Cost ($/yr)';
      this.tickFormat = '$.2s';
      this.barChartData = this.costChartData;
    }
  }

  getDataObject(dataOption: string): Array<BarChartDataItem> {
    let hoverTemplate: string = '%{y:$,.0f}<extra></extra>';
    let traceName: string = "Modification Costs";
    if (dataOption == 'energy') {
      hoverTemplate = '%{y:,.0f}<extra></extra> ' + this.settings.steamEnergyMeasurement + '/hr';
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
    if (dataOption == 'cost') {
      this.ssmtReportRollupService.selectedSsmtResults.forEach(result => {
        labels.push(result.name);
        costSavings.push(result.baselineResults.operationsOutput.totalOperatingCost - result.modificationResults.operationsOutput.totalOperatingCost);
        projectedCosts.push(result.modificationResults.operationsOutput.totalOperatingCost);
      })
    } else if (dataOption == 'energy') {
      this.ssmtReportRollupService.selectedSsmtResults.forEach(result => {
        labels.push(result.name);
        costSavings.push(result.baselineResults.operationsOutput.boilerFuelUsage - result.modificationResults.operationsOutput.boilerFuelUsage);
        projectedCosts.push(result.modificationResults.operationsOutput.boilerFuelUsage);
      })
    }
    return {
      projectedCosts: projectedCosts,
      labels: labels,
      costSavings: costSavings
    }
  }

  setTableData() {
    this.rollupSummaryTableData = new Array();
    this.ssmtReportRollupService.selectedSsmtResults.forEach(resultItem => {
      let paybackPeriod: number = this.getPayback(resultItem.modificationResults.operationsOutput.totalOperatingCost, resultItem.baselineResults.operationsOutput.totalOperatingCost, resultItem.modification.operatingCosts.implementationCosts);
      this.rollupSummaryTableData.push({
        equipmentName: resultItem.name,
        modificationName: resultItem.modName,
        baselineEnergyUse: resultItem.baselineResults.operationsOutput.boilerFuelUsage,
        baselineCost: resultItem.baselineResults.operationsOutput.totalOperatingCost,
        modificationEnergyUse: resultItem.modificationResults.operationsOutput.boilerFuelUsage,
        modificationCost: resultItem.modificationResults.operationsOutput.totalOperatingCost,
        costSavings: resultItem.baselineResults.operationsOutput.totalOperatingCost - resultItem.modificationResults.operationsOutput.totalOperatingCost,
        implementationCosts: resultItem.modification.operatingCosts.implementationCosts,
        payBackPeriod: paybackPeriod
      })
    });
  }


  getPayback(modCost: number, baselineCost: number, implementationCost: number) {
    if (implementationCost) {
      let paybackMonths = (implementationCost / (baselineCost - modCost)) * 12 * 1000;
      if (isNaN(paybackMonths) === false) {
        return paybackMonths;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }
}
