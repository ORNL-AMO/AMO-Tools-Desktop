import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Calculator } from '../../shared/models/calculators';
import { BarChartDataItem } from '../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { PieChartDataItem } from '../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { RollupSummaryTableData } from '../rollup-summary-table/rollup-summary-table.component';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import * as _ from 'lodash';
import { FsatReportRollupService } from '../fsat-report-rollup.service';
import { ReportRollupService } from '../report-rollup.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-fsat-rollup',
  templateUrl: './fsat-rollup.component.html',
  styleUrls: ['./fsat-rollup.component.css']
})
export class FsatRollupComponent implements OnInit { 

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
  settings: Settings;

  rollupEnergyUnit: string = 'MWh';
  
  constructor(private fsatReportRollupService: FsatReportRollupService, private convertUnitsService: ConvertUnitsService, private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.settings = this.reportRollupService.settings.getValue();
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
      this.yAxisLabel = `Annual Energy Cost (${this.settings.currency !== '$'? '$k' : '$'}/yr)`;
      this.tickFormat = '$.2s';
      this.barChartData = this.costBarChartData;
    }
  }

  setBarChartData() {
    this.costBarChartData = this.getDataObject('cost');
    this.energyBarChartData = this.getDataObject('energy');
  }

  getDataObject(dataOption: string): Array<BarChartDataItem> {
    let hoverTemplate: string = `%{y:$,.0f}<extra></extra>${this.settings.currency !== '$'? 'k': ''}`;
    let traceName: string = "Modification Costs";
    if (dataOption == 'energy') {
      hoverTemplate = '%{y:,.0f}<extra></extra> ' + 'MWh';
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
      this.fsatReportRollupService.selectedFsatResults.forEach(result => {
        labels.push(result.name);
        let savings: number = result.baselineResults.annualCost - result.modificationResults.annualCost;
        let modCost: number = result.modificationResults.annualCost;
        if (this.settings.currency !== '$') {
          savings = this.convertUnitsService.value(savings).from('$').to(this.settings.currency);
          modCost = this.convertUnitsService.value(modCost).from('$').to(this.settings.currency);
        }
        costSavings.push(savings);
        projectedCosts.push(modCost);
      })
    } else if (dataOption == 'energy' || dataOption == 'energySavings') {
      this.fsatReportRollupService.selectedFsatResults.forEach(result => {
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
    this.pieChartData = new Array();
    let totalEnergyUse: number = _.sumBy(this.fsatReportRollupService.selectedFsatResults, (result) => { return result.baselineResults.annualEnergy; });
    let totalCost: number = _.sumBy(this.fsatReportRollupService.selectedFsatResults, (result) => { return result.baselineResults.annualCost; });
    //starting with 2, summary table uses 0 and 1
    let colorIndex: number = 2;
    this.fsatReportRollupService.selectedFsatResults.forEach(result => {
      let annualCost: number = result.baselineResults.annualCost;
      let costSavings: number = result.baselineResults.annualCost - result.modificationResults.annualCost;
      let total: number = totalCost;
      if (this.settings.currency !== '$') {
        annualCost = this.convertUnitsService.value(annualCost).from('$').to(this.settings.currency);
        costSavings = this.convertUnitsService.value(costSavings).from('$').to(this.settings.currency);
        total = this.convertUnitsService.value(total).from('$').to(this.settings.currency);
      }

      this.pieChartData.push({
        equipmentName: result.name,
        energyUsed: result.baselineResults.annualEnergy,
        annualCost: annualCost,
        energySavings: result.baselineResults.annualEnergy - result.modificationResults.annualEnergy,
        costSavings: costSavings,
        percentCost: annualCost / total * 100,
        percentEnergy: result.baselineResults.annualEnergy / totalEnergyUse * 100,
        color: graphColors[colorIndex],
        currencyUnit: this.settings.currency
      });
      colorIndex++;
    });
  }

  setTableData() {
    this.rollupSummaryTableData = new Array();
    this.fsatReportRollupService.selectedFsatResults.forEach(dataItem => {
      let baselineCost: number = dataItem.baselineResults.annualCost;
      let modificationCost: number = dataItem.modificationResults.annualCost;
      let savings: number = dataItem.baselineResults.annualCost - dataItem.modificationResults.annualCost;
      let implementationCosts: number = dataItem.modification.implementationCosts;
      let currencyUnit = this.settings.currency;
      if (this.settings.currency !== '$') {
        modificationCost = this.convertUnitsService.value(modificationCost).from('$').to(this.settings.currency);
        baselineCost = this.convertUnitsService.value(baselineCost).from('$').to(this.settings.currency);
        savings = this.convertUnitsService.value(savings).from('$').to(this.settings.currency);
        implementationCosts = this.convertUnitsService.value(implementationCosts).from('$').to(this.settings.currency);
      }
      this.rollupSummaryTableData.push({
        equipmentName: dataItem.name,
        modificationName: dataItem.modName,
        baselineEnergyUse: dataItem.baselineResults.annualEnergy,
        modificationCost: modificationCost,
        modificationEnergyUse: dataItem.modificationResults.annualEnergy,
        baselineCost: baselineCost,
        costSavings: savings,
        currencyUnit: currencyUnit,
        implementationCosts: implementationCosts,
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
