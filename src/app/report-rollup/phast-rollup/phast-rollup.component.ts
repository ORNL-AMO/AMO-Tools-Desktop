import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Calculator } from '../../shared/models/calculators';
import { PhastResultsData } from '../report-rollup-models';
import { PieChartDataItem } from '../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { ReportRollupService } from '../report-rollup.service';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import * as _ from 'lodash';
import { BarChartDataItem } from '../rollup-summary-bar-chart/rollup-summary-bar-chart.component';
import { PhastResultsService } from '../../phast/phast-results.service';
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
  @Input()
  inPrintView: boolean;

  pieChartDataOption: string = 'energy';
  barChartDataOption: string;
  barChartData: Array<BarChartDataItem>;
  energyBarChartData: Array<BarChartDataItem>;
  costBarChartData: Array<BarChartDataItem>;
  energyIntensityBarChartData: Array<BarChartDataItem>;
  availableHeatBarChartData: Array<BarChartDataItem>;
  tickFormat: string;
  yAxisLabel: string;
  pieChartData: Array<PieChartDataItem>;
  // rollupSummaryTableData: Array<RollupSummaryTableData>;
  constructor(private reportRollupService: ReportRollupService, private convertUnitsService: ConvertUnitsService,
    private phastResultsService: PhastResultsService) { }

  ngOnInit() {
    // this.setTableData();
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
      this.yAxisLabel = 'Annual Energy Usage (' + this.settings.phastRollupUnit + '/yr)';
      this.tickFormat = '.2s'
      this.barChartData = this.energyBarChartData;
    } else if (this.barChartDataOption == 'cost') {
      this.yAxisLabel = 'Annual Energy Cost ($/yr)';
      this.tickFormat = '$.2s';
      this.barChartData = this.costBarChartData;
    } else if (this.barChartDataOption == 'availableHeat') {
      this.yAxisLabel = 'Available Heat (%)';
      this.tickFormat = '.2s';
      this.barChartData = this.availableHeatBarChartData;
    } else if (this.barChartDataOption == 'energyIntensity') {
      let templateUnit: string = this.settings.phastRollupUnit;
      if (this.settings.unitsOfMeasure == 'Metric') {
        templateUnit = templateUnit + '/kg';
      } else {
        templateUnit = templateUnit + '/lb';
      }
      this.yAxisLabel = 'Annual Energy Cost (' + templateUnit + ')';
      this.tickFormat = '.2s';
      this.barChartData = this.energyIntensityBarChartData;
    }
  }

  setBarChartData() {
    this.costBarChartData = this.getDataObject('cost');
    this.energyBarChartData = this.getDataObject('energy');
    this.availableHeatBarChartData = this.getDataObject('availableHeat');
    this.energyIntensityBarChartData = this.getDataObject('energyIntensity');
  }

  getDataObject(dataOption: string): Array<BarChartDataItem> {
    let constData = this.getTemplateAndTrace(dataOption)
    let chartData: { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } = this.getChartData(dataOption);
    let projectCostTrace: BarChartDataItem = {
      x: chartData.labels,
      y: chartData.projectedCosts,
      hoverinfo: 'all',
      hovertemplate: constData.hoverTemplate,
      name: constData.traceName,
      type: "bar",
      marker: {
        color: graphColors[1]
      },
    };
    let baselineName: string = 'Savings From Baseline';
    if(dataOption == 'availableHeat'){
      baselineName = 'Modification Additional Available Heat';
    }
    let costSavingsTrace: BarChartDataItem = {
      x: chartData.labels,
      y: chartData.costSavings,
      hoverinfo: 'all',
      hovertemplate: constData.hoverTemplate,
      name: baselineName,
      type: "bar",
      marker: {
        color: graphColors[0]
      },
    }
    var data = [projectCostTrace, costSavingsTrace];
    return data;
  }

  getTemplateAndTrace(dataOption: string): { hoverTemplate: string, traceName: string } {
    if (dataOption == 'energy') {
      return {
        hoverTemplate: '%{y:,.0f} ' + this.settings.phastRollupUnit + "/yr<extra></extra>",
        traceName: "Modification Energy Use"
      }
    } else if (dataOption == 'cost') {
      return {
        hoverTemplate: '%{y:$,.0f}<extra></extra>',
        traceName: "Modification Costs"
      }
    } else if (dataOption == 'availableHeat') {
      return {
        hoverTemplate: '%{y:,.0f} %<extra></extra>',
        traceName: "Baseline Available Heat"
      }
    } else if (dataOption == 'energyIntensity') {
      let templateUnit: string = this.settings.phastRollupUnit;
      if (this.settings.unitsOfMeasure == 'Metric') {
        templateUnit = templateUnit + '/kg';
      } else {
        templateUnit = templateUnit + '/lb';
      }
      return {
        hoverTemplate: '%{y:,.0f} ' + templateUnit + '<extra></extra>',
        traceName: "Modification Energy Intensity"
      }
    }
  }

  getChartData(dataOption: string): { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } {
    let phastResults: Array<PhastResultsData> = this.reportRollupService.phastResults.getValue();
    //use copy for converting data
    let phastResultsCpy: Array<PhastResultsData> = JSON.parse(JSON.stringify(phastResults));

    let projectedCosts: Array<number> = new Array();
    let labels: Array<string> = new Array();
    let costSavings: Array<number> = new Array();
    if (dataOption == 'cost') {
      phastResultsCpy.forEach(result => {
        labels.push(result.name);
        costSavings.push(result.baselineResults.annualCost - result.modificationResults.annualCost);
        projectedCosts.push(result.modificationResults.annualCost);
      })
    } else if (dataOption == 'energy') {
      phastResultsCpy.forEach(result => {
        result.baselineResults.annualEnergyUsed = this.getConvertedEnergyValue(result.baselineResults.annualEnergyUsed, result.settings);
        result.modificationResults.annualEnergyUsed = this.getConvertedEnergyValue(result.modificationResults.annualEnergyUsed, result.settings);
        labels.push(result.name);
        costSavings.push(result.baselineResults.annualEnergyUsed - result.modificationResults.annualEnergyUsed);
        projectedCosts.push(result.modificationResults.annualEnergyUsed);
      })
    } else if (dataOption == 'availableHeat') {
      phastResultsCpy.forEach(result => {
        let baselineAvailableHeat: number = this.phastResultsService.getAvailableHeat(result.baselineResultData, result.settings);
        let modificatonAvailableHeat: number = this.phastResultsService.getAvailableHeat(result.modificationResultData, result.settings);
        labels.push(result.name);
        costSavings.push(modificatonAvailableHeat - baselineAvailableHeat);
        projectedCosts.push(baselineAvailableHeat);
      })
    } else if (dataOption == 'energyIntensity') {
      phastResultsCpy.forEach(result => {
        result.baselineResults.energyPerMass = this.getConvertedEnergyValue(result.baselineResults.energyPerMass, result.settings);
        result.modificationResults.energyPerMass = this.getConvertedEnergyValue(result.modificationResults.energyPerMass, result.settings);
        labels.push(result.name);
        costSavings.push(result.baselineResults.energyPerMass - result.modificationResults.energyPerMass);
        projectedCosts.push(result.modificationResults.energyPerMass);
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

  getConvertedEnergyValue(val: number, settings: Settings) {
    return this.convertUnitsService.value(val).from(settings.energyResultUnit).to(this.settings.phastRollupUnit);
  }
}
