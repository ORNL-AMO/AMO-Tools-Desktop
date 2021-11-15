import { Component, Input, OnInit } from '@angular/core';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { CompressedAirReportRollupService } from '../compressed-air-report-rollup.service';
import { CompressedAirResultsData } from '../report-rollup-models';
import { ReportRollupService } from '../report-rollup.service';
import { BarChartDataItem } from '../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { RollupSummaryTableData } from '../rollup-summary-table/rollup-summary-table.component';

@Component({
  selector: 'app-compressed-air-rollup',
  templateUrl: './compressed-air-rollup.component.html',
  styleUrls: ['./compressed-air-rollup.component.css']
})
export class CompressedAirRollupComponent implements OnInit {
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
  constructor(private compressedAirReportRollupService: CompressedAirReportRollupService,
    private convertUnitsService: ConvertUnitsService, private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.settings = this.reportRollupService.settings.getValue();
    this.energyUnit = 'kWh';
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
      this.yAxisLabel = 'Annual Energy Usage (kWh)';
      this.tickFormat = '.2s'
      this.barChartData = this.energyChartData;
    } else {
      this.yAxisLabel = `Annual Energy Cost (${this.settings.currency !== '$' ? '$k' : '$'}/yr)`;
      this.tickFormat = '$.2s';
      this.barChartData = this.costChartData;
    }
  }

  getDataObject(dataOption: string): Array<BarChartDataItem> {
    let hoverTemplate: string = `%{y:$,.0f}<extra></extra>${this.settings.currency !== '$' ? 'k' : ''}`;
    let traceName: string = "Modification Costs";
    if (dataOption == 'energy') {
      hoverTemplate = '%{y:,.0f}<extra></extra> kWh';
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
      this.compressedAirReportRollupService.selectedAssessmentResults.forEach(result => {
        labels.push(result.name);
        let modCost: number = this.getModificationCost(result);
        let savings: number = result.baselineResults.total.totalAnnualOperatingCost - modCost;
        if (this.settings.currency !== '$') {
          savings = this.convertUnitsService.value(savings).from('$').to(this.settings.currency);
          modCost = this.convertUnitsService.value(modCost).from('$').to(this.settings.currency);
        }
        costSavings.push(savings);
        projectedCosts.push(modCost);
      })
    } else if (dataOption == 'energy') {
      this.compressedAirReportRollupService.selectedAssessmentResults.forEach(result => {
        labels.push(result.name);
        let modEnergyUse: number = this.getModificationEnergyUse(result)
        costSavings.push(result.baselineResults.total.energyUse - modEnergyUse);
        projectedCosts.push(modEnergyUse);
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
    this.compressedAirReportRollupService.selectedAssessmentResults.forEach(resultItem => {
      let baselineCost: number = resultItem.baselineResults.total.totalAnnualOperatingCost;
      let modificationCost: number = this.getModificationCost(resultItem);
      let savings: number = resultItem.baselineResults.total.totalAnnualOperatingCost - this.getModificationCost(resultItem);
      let implementationCosts: number = this.getImplementationCost(resultItem);
      let currencyUnit = this.settings.currency;
      if (this.settings.currency !== '$') {
        modificationCost = this.convertUnitsService.value(modificationCost).from('$').to(this.settings.currency);
        baselineCost = this.convertUnitsService.value(baselineCost).from('$').to(this.settings.currency);
        savings = this.convertUnitsService.value(savings).from('$').to(this.settings.currency);
        implementationCosts = this.convertUnitsService.value(implementationCosts).from('$').to(this.settings.currency);
      }
      this.rollupSummaryTableData.push({
        equipmentName: resultItem.name,
        modificationName: resultItem.modName,
        baselineEnergyUse: resultItem.baselineResults.total.energyUse,
        baselineCost: baselineCost,
        modificationEnergyUse: this.getModificationEnergyUse(resultItem),
        modificationCost: modificationCost,
        costSavings: savings,
        implementationCosts: implementationCosts,
        payBackPeriod: this.getPayback(resultItem),
        currencyUnit: currencyUnit
      })
    });
  }

  getModificationCost(resultItem: CompressedAirResultsData): number {
    if (resultItem.modificationResults) {
      return resultItem.modificationResults.totalAnnualOperatingCost;
    } else {
      return resultItem.baselineResults.total.totalAnnualOperatingCost;
    }
  }

  getModificationEnergyUse(resultItem: CompressedAirResultsData): number {
    if (resultItem.modificationResults) {
      return resultItem.modificationResults.allSavingsResults.adjustedResults.power;
    } else {
      return resultItem.baselineResults.total.energyUse;
    }
  }

  getImplementationCost(resultItem: CompressedAirResultsData): number {
    if (resultItem.modificationResults) {
      return resultItem.modificationResults.allSavingsResults.implementationCost;
    } else {
      return 0;
    }
  }

  getPayback(resultItem: CompressedAirResultsData): number {
    if (resultItem.modificationResults) {
      return resultItem.modificationResults.allSavingsResults.paybackPeriod;
    } else {
      return 0;
    }
  }
}
