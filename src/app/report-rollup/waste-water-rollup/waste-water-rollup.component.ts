import { Component, Input, OnInit } from '@angular/core';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import { BarChartDataItem } from '../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { PieChartDataItem } from '../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { RollupSummaryTableData } from '../rollup-summary-table/rollup-summary-table.component';
import { WasteWaterReportRollupService } from '../waste-water-report-rollup.service';
import * as _ from 'lodash';
import { EffluentEnergyResults, NutrientRemovalResults } from '../report-rollup-models';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { ReportRollupService } from '../report-rollup.service';

@Component({
  selector: 'app-waste-water-rollup',
  templateUrl: './waste-water-rollup.component.html',
  styleUrls: ['./waste-water-rollup.component.css']
})
export class WasteWaterRollupComponent implements OnInit {
  @Input()
  printView: boolean;
  
  settings: Settings;

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
  energyUnits: string;
  constructor(private wasteWaterReportRollupService: WasteWaterReportRollupService,
    private convertUnitsService: ConvertUnitsService, private reportRollupService: ReportRollupService) { }

  ngOnInit(): void {
    this.settings = this.reportRollupService.settings.getValue();
    this.energyUnits = this.settings.wasteWaterRollupUnit;
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
      this.yAxisLabel = 'Annual Energy Usage ('+ this.settings.wasteWaterRollupUnit+')';
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
      hoverTemplate = '%{y:,.0f}<extra></extra> '+ this.settings.wasteWaterRollupUnit;
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
        let savings: number = result.baselineResults.AeCost - result.modificationResults.AeCost;
        let modCost: number = result.modificationResults.AeCost;
        if (this.settings.currency !== '$') {
          savings = this.convertUnitsService.value(savings).from('$').to(this.settings.currency);
          modCost = this.convertUnitsService.value(modCost).from('$').to(this.settings.currency);  
        }
        costSavings.push(savings);
        projectedCosts.push(modCost);
      })
    } else if (dataOption == 'energy' || dataOption == 'energySavings') {
      this.wasteWaterReportRollupService.selectedWasteWaterResults.forEach(result => {
        labels.push(result.name);
        let savings: number = result.baselineResults.AeEnergyAnnual - result.modificationResults.AeEnergyAnnual;
        let modCost: number = result.modificationResults.AeEnergyAnnual;
        if (this.settings.wasteWaterRollupUnit !== 'MWh') {
          savings = this.convertUnitsService.value(savings).from('MWh').to(this.settings.wasteWaterRollupUnit);
          modCost = this.convertUnitsService.value(modCost).from('MWh').to(this.settings.wasteWaterRollupUnit);  
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

  setPieChartData() {
    this.pieChartData = new Array();
    let totalEnergyUse: number = _.sumBy(this.wasteWaterReportRollupService.selectedWasteWaterResults, (result) => { return result.baselineResults.AeEnergyAnnual; });
    if (this.settings.wasteWaterRollupUnit !== 'MWh') {
      totalEnergyUse = this.convertUnitsService.value(totalEnergyUse).from('MWh').to(this.settings.wasteWaterRollupUnit);
    }
    let totalCost: number = _.sumBy(this.wasteWaterReportRollupService.selectedWasteWaterResults, (result) => { return result.baselineResults.AeCost; });
    //starting with 2, summary table uses 0 and 1
    let colorIndex: number = 2;
    this.wasteWaterReportRollupService.selectedWasteWaterResults.forEach(result => {
      let annualCost: number = result.baselineResults.AeCost;
      let costSavings: number = result.baselineResults.AeCost - result.modificationResults.AeCost;
      let total: number = totalCost;
      if (this.settings.currency !== '$') {
        annualCost = this.convertUnitsService.value(annualCost).from('$').to(this.settings.currency);
        costSavings = this.convertUnitsService.value(costSavings).from('$').to(this.settings.currency);
        total = this.convertUnitsService.value(total).from('$').to(this.settings.currency);
      }
      let energyUsedBaseline: number = result.baselineResults.AeEnergyAnnual;
      let energyUsedMod: number = result.modificationResults.AeEnergyAnnual;
      if (this.settings.wasteWaterRollupUnit !== 'MWh') {
        energyUsedBaseline = this.convertUnitsService.value(energyUsedBaseline).from('MWh').to(this.settings.wasteWaterRollupUnit);
        energyUsedMod = this.convertUnitsService.value(energyUsedMod).from('MWh').to(this.settings.wasteWaterRollupUnit);
        totalEnergyUse = this.convertUnitsService.value(totalEnergyUse).from('MWh').to(this.settings.wasteWaterRollupUnit);
      }
      this.pieChartData.push({
        equipmentName: result.name,
        energyUsed: energyUsedBaseline,
        annualCost: annualCost,
        energySavings: energyUsedBaseline - energyUsedMod,
        costSavings: costSavings,
        percentCost: annualCost / total * 100,
        percentEnergy: energyUsedBaseline / totalEnergyUse * 100,
        color: graphColors[colorIndex],
        currencyUnit: this.settings.currency
      });
      colorIndex++;
    });
  }

  setTableData() {
    this.rollupSummaryTableData = new Array();
    this.wasteWaterReportRollupService.selectedWasteWaterResults.forEach(dataItem => {
      let baselineCost: number = dataItem.baselineResults.AeCost;
      let modificationCost: number = dataItem.modificationResults.AeCost;
      let savings: number = dataItem.baselineResults.AeCost - dataItem.modificationResults.AeCost;
      let currencyUnit = this.settings.currency;
      if (this.settings.currency !== '$') {
        modificationCost = this.convertUnitsService.value(modificationCost).from('$').to(this.settings.currency);
        baselineCost = this.convertUnitsService.value(baselineCost).from('$').to(this.settings.currency);
        savings = this.convertUnitsService.value(savings).from('$').to(this.settings.currency);
      }
      let energyUsedBaseline: number = dataItem.baselineResults.AeEnergyAnnual;
      let energyUsedMod: number = dataItem.modificationResults.AeEnergyAnnual;
      if (this.settings.wasteWaterRollupUnit !== 'MWh') {
        energyUsedBaseline = this.convertUnitsService.value(energyUsedBaseline).from('MWh').to(this.settings.wasteWaterRollupUnit);
        energyUsedMod = this.convertUnitsService.value(energyUsedMod).from('MWh').to(this.settings.wasteWaterRollupUnit);
      }
      this.rollupSummaryTableData.push({
        equipmentName: dataItem.name,
        modificationName: dataItem.modName,
        baselineEnergyUse: energyUsedBaseline,
        modificationCost: modificationCost,
        modificationEnergyUse: energyUsedMod,
        baselineCost: baselineCost,
        costSavings:  savings,
        implementationCosts: 0,
        currencyUnit: currencyUnit,
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
