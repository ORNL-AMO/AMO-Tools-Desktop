import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Calculator } from '../../shared/models/calculators';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import * as _ from 'lodash';
import { PieChartDataItem } from '../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { BarChartDataItem } from '../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { RollupSummaryTableData } from '../rollup-summary-table/rollup-summary-table.component';
import { PsatReportRollupService } from '../psat-report-rollup.service';
import { ReportRollupService } from '../report-rollup.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-psat-rollup',
  templateUrl: './psat-rollup.component.html',
  styleUrls: ['./psat-rollup.component.css']
})
export class PsatRollupComponent implements OnInit {
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
  settings: Settings;

  rollupEnergyUnit: string = 'MWh';

  constructor(private psatReportRollupService: PsatReportRollupService, 
    private convertUnitsService: ConvertUnitsService,
    private reportRollupSettings: ReportRollupService) { }



  ngOnInit() {
    this.settings = this.reportRollupSettings.settings.getValue();
    this.rollupEnergyUnit = this.settings.pumpsRollupUnit;
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
      this.yAxisLabel = 'Annual Energy Usage (' + this.settings.pumpsRollupUnit +')';
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
      hoverTemplate = '%{y:,.0f}<extra></extra> ' + this.settings.pumpsRollupUnit;
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
      this.psatReportRollupService.selectedPsatResults.forEach(result => {
        labels.push(result.name);
        let savings: number = result.baselineResults.annual_cost - result.modificationResults.annual_cost;
        let modCost: number = result.modificationResults.annual_cost;
        if (this.settings.currency !== '$') {
          savings = this.convertUnitsService.value(savings).from('$').to(this.settings.currency);
          modCost = this.convertUnitsService.value(modCost).from('$').to(this.settings.currency);
          
        }
        costSavings.push(savings);
        projectedCosts.push(modCost);
      })
    } else if (dataOption == 'energy' || dataOption == 'energySavings') {
      this.psatReportRollupService.selectedPsatResults.forEach(result => {
        labels.push(result.name);
        let savings: number = result.baselineResults.annual_energy - result.modificationResults.annual_energy;
        let modCost: number = result.modificationResults.annual_energy;
        if (this.settings.pumpsRollupUnit !== 'MWh') {
          savings = this.convertUnitsService.value(savings).from('MWh').to(this.settings.pumpsRollupUnit);
          modCost = this.convertUnitsService.value(modCost).from('MWh').to(this.settings.pumpsRollupUnit);          
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
    let totalEnergyUse: number = _.sumBy(this.psatReportRollupService.selectedPsatResults, (result) => { return result.baselineResults.annual_energy; });
    if (this.settings.pumpsRollupUnit !== 'MWh') {
      totalEnergyUse = this.convertUnitsService.value(totalEnergyUse).from('MWh').to(this.settings.pumpsRollupUnit);        
    }
    let totalCost: number = _.sumBy(this.psatReportRollupService.selectedPsatResults, (result) => { return result.baselineResults.annual_cost; });
    //starting with 2, summary table uses 0 and 1
    let colorIndex: number = 2;
    this.psatReportRollupService.selectedPsatResults.forEach(result => {
      let annualCost: number = result.baselineResults.annual_cost;
      let costSavings: number = result.baselineResults.annual_cost - result.modificationResults.annual_cost;
      let total: number = totalCost;
      if (this.settings.currency !== '$') {
        annualCost = this.convertUnitsService.value(annualCost).from('$').to(this.settings.currency);
        costSavings = this.convertUnitsService.value(costSavings).from('$').to(this.settings.currency);
        total = this.convertUnitsService.value(total).from('$').to(this.settings.currency);
      }

      let energyUsedBl: number = result.baselineResults.annual_energy;
      let energyUsedMod: number = result.modificationResults.annual_energy;
      if (this.settings.pumpsRollupUnit !== 'MWh') {
        energyUsedBl = this.convertUnitsService.value(energyUsedBl).from('MWh').to(this.settings.pumpsRollupUnit);
        energyUsedMod = this.convertUnitsService.value(energyUsedMod).from('MWh').to(this.settings.pumpsRollupUnit);        
      }

      this.pieChartData.push({
        equipmentName: result.name,
        energyUsed: energyUsedBl,
        annualCost: annualCost,
        energySavings: energyUsedBl - energyUsedMod,
        costSavings: costSavings,
        percentCost: annualCost / total * 100,
        percentEnergy: energyUsedBl / totalEnergyUse * 100,
        color: graphColors[colorIndex],
        currencyUnit:  this.settings.currency
      });
      colorIndex++;
    });
  }

  setTableData() {
    this.rollupSummaryTableData = new Array();
    this.psatReportRollupService.selectedPsatResults.forEach(dataItem => {
      let baselineCost: number = dataItem.baselineResults.annual_cost;
      let modificationCost: number = dataItem.modificationResults.annual_cost;
      let savings: number = dataItem.baselineResults.annual_cost - dataItem.modificationResults.annual_cost;
      let implementationCosts: number = dataItem.modification.inputs.implementationCosts;
      let currencyUnit = this.settings.currency;
      if (this.settings.currency !== '$') {
        modificationCost = this.convertUnitsService.value(modificationCost).from('$').to(this.settings.currency);
        baselineCost = this.convertUnitsService.value(baselineCost).from('$').to(this.settings.currency);
        savings = this.convertUnitsService.value(savings).from('$').to(this.settings.currency);
        implementationCosts = this.convertUnitsService.value(implementationCosts).from('$').to(this.settings.currency);
      }
      let energyUsedBl: number = dataItem.baselineResults.annual_energy;
      let energyUsedMod: number = dataItem.modificationResults.annual_energy;
      if (this.settings.pumpsRollupUnit !== 'MWh') {
        energyUsedBl = this.convertUnitsService.value(energyUsedBl).from('MWh').to(this.settings.pumpsRollupUnit);
        energyUsedMod = this.convertUnitsService.value(energyUsedMod).from('MWh').to(this.settings.pumpsRollupUnit);        
      }
      this.rollupSummaryTableData.push({
        equipmentName: dataItem.name,
        modificationName: dataItem.modName,
        baselineEnergyUse: energyUsedBl,
        modificationCost: modificationCost,
        modificationEnergyUse: energyUsedMod,
        baselineCost: baselineCost,
        costSavings: savings,
        currencyUnit: currencyUnit,
        implementationCosts: implementationCosts,
        payBackPeriod: this.getPayback(dataItem.modificationResults.annual_cost, dataItem.baselineResults.annual_cost, dataItem.modification.inputs.implementationCosts)
      })
    })
  }
  getPayback(modCost: number, baselineCost: number, implementationCost: number) {
    if (implementationCost) {
      let val = (implementationCost / (baselineCost - modCost)) * 12;
      if (isNaN(val) === false) {
        if(val <= 0){
          return 0;
        }else{
          return val;
        }
        
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }
}
