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
    this.energyUnit = this.settings.compressedAirRollupUnit;
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
      this.yAxisLabel = 'Annual Energy Usage (' + this.settings.compressedAirRollupUnit + ')';
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
      hoverTemplate = '%{y:,.0f}<extra></extra> ' + this.settings.compressedAirRollupUnit;
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
        let modEnergyUse: number = this.getModificationEnergyUse(result);
        let savings: number = result.baselineResults.total.energyUse;
        if (this.settings.compressedAirRollupUnit !== 'kWh') {
          savings = this.convertUnitsService.value(savings).from('kWh').to(this.settings.compressedAirRollupUnit);
          modEnergyUse = this.convertUnitsService.value(modEnergyUse).from('kWh').to(this.settings.compressedAirRollupUnit);
        }
        costSavings.push(savings - modEnergyUse);
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
      let basePeakCost: number = resultItem.baselineResults.total.demandCost;
      let modPeakCost: number = this.getModificationPeakCost(resultItem);
      if (this.settings.currency !== '$') {
        modificationCost = this.convertUnitsService.value(modificationCost).from('$').to(this.settings.currency);
        baselineCost = this.convertUnitsService.value(baselineCost).from('$').to(this.settings.currency);
        savings = this.convertUnitsService.value(savings).from('$').to(this.settings.currency);
        implementationCosts = this.convertUnitsService.value(implementationCosts).from('$').to(this.settings.currency);
        basePeakCost = this.convertUnitsService.value(basePeakCost).from('$').to(this.settings.currency);
        modPeakCost = this.convertUnitsService.value(modPeakCost).from('$').to(this.settings.currency);
      }
      let modEnergyUse: number = this.getModificationEnergyUse(resultItem);
      let modPeakEnergyUse: number = this.getModificationPeakEnergy(resultItem);
      let baseEnergyUsed: number = resultItem.baselineResults.total.energyUse;
      let basePeakEnergy: number = resultItem.baselineResults.total.peakDemand;
      if (this.settings.compressedAirRollupUnit !== 'kWh') {
        baseEnergyUsed = this.convertUnitsService.value(baseEnergyUsed).from('kWh').to(this.settings.compressedAirRollupUnit);
        modEnergyUse = this.convertUnitsService.value(modEnergyUse).from('kWh').to(this.settings.compressedAirRollupUnit);
        basePeakEnergy = this.convertUnitsService.value(basePeakEnergy).from('kWh').to(this.settings.compressedAirRollupUnit);
        modPeakEnergyUse = this.convertUnitsService.value(modPeakEnergyUse).from('kWh').to(this.settings.compressedAirRollupUnit);
      }
      this.rollupSummaryTableData.push({
        equipmentName: resultItem.name,
        modificationName: resultItem.modName,
        baselineEnergyUse: baseEnergyUsed,
        baselineCost: baselineCost,
        modificationEnergyUse: modEnergyUse,
        modificationCost: modificationCost,
        costSavings: savings,
        implementationCosts: implementationCosts,
        payBackPeriod: this.getPayback(resultItem),
        currencyUnit: currencyUnit,
        baselinePeakDemandEnergy: basePeakEnergy,
        baselinePeakDemandCost: basePeakCost,
        modPeakDemandEnergy: modPeakEnergyUse,
        modPeakDemandCost: modPeakCost
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

  getModificationPeakEnergy(resultItem: CompressedAirResultsData): number {
    if (resultItem.modificationResults) {
      return resultItem.modificationResults.peakDemand;
    } else {
      return resultItem.baselineResults.total.peakDemand;
    }
  }

  getModificationPeakCost(resultItem: CompressedAirResultsData): number {
    if (resultItem.modificationResults) {
      return resultItem.modificationResults.peakDemandCost;
    } else {
      return resultItem.baselineResults.total.demandCost;
    }
  }
}
