import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import { SsmtResultsData } from '../report-rollup-models';
import { BarChartDataItem } from '../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { RollupSummaryTableData } from '../rollup-summary-table/rollup-summary-table.component';
import { SsmtReportRollupService } from '../ssmt-report-rollup.service';
import { ReportRollupService } from '../report-rollup.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Component({
    selector: 'app-ssmt-rollup',
    templateUrl: './ssmt-rollup.component.html',
    styleUrls: ['./ssmt-rollup.component.css'],
    standalone: false
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
  constructor(private ssmtReportRollupService: SsmtReportRollupService,
    private convertUnitsService: ConvertUnitsService, private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.settings = this.reportRollupService.settings.getValue();
    this.energyUnit = this.settings.steamRollupUnit + '/hr';
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
      this.yAxisLabel = 'Annual Energy Usage (' + this.settings.steamRollupUnit + '/hr)';
      this.tickFormat = '.2s'
      this.barChartData = this.energyChartData;
    } else {
      this.yAxisLabel = `Annual Energy Cost (${this.settings.currency !== '$'? '$k' : '$'}/yr)`;
      this.tickFormat = '$.2s';
      this.barChartData = this.costChartData;
    }
  }

  getDataObject(dataOption: string): Array<BarChartDataItem> {
    let hoverTemplate: string = `%{y:$,.0f}<extra></extra>${this.settings.currency !== '$'? 'k': ''}`;
    let traceName: string = "Modification Costs";
    if (dataOption == 'energy') {
      hoverTemplate = '%{y:,.0f}<extra></extra> ' + this.settings.steamRollupUnit + '/hr';
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
        let savings: number = result.baselineResults.operationsOutput.totalOperatingCost - result.modificationResults.operationsOutput.totalOperatingCost;
        let modCost: number = result.modificationResults.operationsOutput.totalOperatingCost;
        if (this.settings.currency !== '$') {
          savings = this.convertUnitsService.value(savings).from('$').to(this.settings.currency);
          modCost = this.convertUnitsService.value(modCost).from('$').to(this.settings.currency);
        }
        costSavings.push(savings);
        projectedCosts.push(modCost);
      })
    } else if (dataOption == 'energy') {
      this.ssmtReportRollupService.selectedSsmtResults.forEach(result => {
        labels.push(result.name);
        let savings: number = result.baselineResults.operationsOutput.boilerFuelUsage - result.modificationResults.operationsOutput.boilerFuelUsage;
        let modCost: number = result.modificationResults.operationsOutput.boilerFuelUsage;
        if (this.settings.steamRollupUnit !== 'MMBtu') {
          savings = this.convertUnitsService.value(savings).from('MMBtu').to(this.settings.steamRollupUnit);
          modCost = this.convertUnitsService.value(modCost).from('MMBtu').to(this.settings.steamRollupUnit);
        }
        costSavings.push(savings);
        projectedCosts.push(modCost);
        
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
      let baselineCost: number = resultItem.baselineResults.operationsOutput.totalOperatingCost;
      let modificationCost: number = resultItem.modificationResults.operationsOutput.totalOperatingCost;
      let savings: number = resultItem.baselineResults.operationsOutput.totalOperatingCost - resultItem.modificationResults.operationsOutput.totalOperatingCost;
      let implementationCosts: number = resultItem.modification.operatingCosts.implementationCosts;
      let currencyUnit = this.settings.currency;
      if (this.settings.currency !== '$') {
        modificationCost = this.convertUnitsService.value(modificationCost).from('$').to(this.settings.currency);
        baselineCost = this.convertUnitsService.value(baselineCost).from('$').to(this.settings.currency);
        savings = this.convertUnitsService.value(savings).from('$').to(this.settings.currency);
        implementationCosts = this.convertUnitsService.value(implementationCosts).from('$').to(this.settings.currency);
      }
      let energyUsedBaseline: number = resultItem.baselineResults.operationsOutput.boilerFuelUsage;
      let energyUsedMod: number = resultItem.modificationResults.operationsOutput.boilerFuelUsage;
      if (this.settings.steamRollupUnit !== 'MMBtu') {
        energyUsedBaseline = this.convertUnitsService.value(energyUsedBaseline).from('MMBtu').to(this.settings.steamRollupUnit);
        energyUsedMod = this.convertUnitsService.value(energyUsedMod).from('MMBtu').to(this.settings.steamRollupUnit);
      }
      let paybackPeriod: number = this.getPayback(resultItem.modificationResults.operationsOutput.totalOperatingCost, resultItem.baselineResults.operationsOutput.totalOperatingCost, resultItem.modification.operatingCosts.implementationCosts);
      this.rollupSummaryTableData.push({
        equipmentName: resultItem.name,
        modificationName: resultItem.modName,
        baselineEnergyUse: energyUsedBaseline,
        baselineCost: baselineCost,
        modificationEnergyUse: energyUsedMod,
        modificationCost: modificationCost,
        costSavings: savings,
        implementationCosts: implementationCosts,
        payBackPeriod: paybackPeriod,
        currencyUnit: currencyUnit
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
