import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Calculator } from '../../shared/models/calculators';
import { ReportRollupService } from '../report-rollup.service';
import { PsatResultsData } from '../report-rollup-models';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import * as _ from 'lodash';
import { PieChartDataItem } from '../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { BarChartDataItem } from '../rollup-summary-bar-chart/rollup-summary-bar-chart.component';

@Component({
  selector: 'app-psat-rollup',
  templateUrl: './psat-rollup.component.html',
  styleUrls: ['./psat-rollup.component.css']
})
export class PsatRollupComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  calculators: Array<Calculator>;

  showPreAssessment: boolean = true;
  pieChartDataOption: string = 'energy';
  barChartDataOption: string = 'energy';
  barChartData: Array<BarChartDataItem>;
  tickFormat: string;
  yAxisLabel: string;
  pieChartData: Array<PieChartDataItem>;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    console.log(this.calculators);
    this.setBarChartData();
    this.setPieChartData();
  }

  setPieChartOption(str: string) {
    this.pieChartDataOption = str;
    this.setPieChartData();
  }

  setBarChartOption(str: string) {
    this.barChartDataOption = str;
    this.setBarChartData();

  }

  setBarChartData() {
    this.barChartData = this.getDataObject();
    this.yAxisLabel = 'Annual Energy Cost ($/yr)';
    this.tickFormat = '$.2s';
    if (this.barChartDataOption == 'energy') {
      this.yAxisLabel = 'Annual Energy Usage (' + this.settings.powerMeasurement + ')';
      this.tickFormat = '.2s'
    }
  }

  getDataObject(): Array<BarChartDataItem> {
    let hoverTemplate: string = '%{y:$,.0f}<extra></extra>';
    let traceName: string = "Modification Costs";
    if (this.barChartDataOption == 'energy') {
      hoverTemplate = '%{y:,.0f}<extra></extra> ' + this.settings.powerMeasurement;
      traceName = "Modification Energy Use";
    }
    let chartData: { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } = this.getChartData();
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

  getChartData(): { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } {
    let psatResults: Array<PsatResultsData> = this.reportRollupService.psatResults.getValue();
    let projectedCosts: Array<number> = new Array();
    let labels: Array<string> = new Array();
    let costSavings: Array<number> = new Array();
    if (this.barChartDataOption == 'cost') {
      psatResults.forEach(result => {
        labels.push(result.name);
        costSavings.push(result.baselineResults.annual_cost - result.modificationResults.annual_cost);
        projectedCosts.push(result.modificationResults.annual_cost);
      })
    } else if (this.barChartDataOption == 'energy') {
      psatResults.forEach(result => {
        labels.push(result.name);
        costSavings.push(result.baselineResults.annual_energy - result.modificationResults.annual_energy);
        projectedCosts.push(result.modificationResults.annual_energy);
      })
    }
    return {
      projectedCosts: projectedCosts,
      labels: labels,
      costSavings: costSavings
    }
  }

  setPieChartData() {
    let psatResults: Array<PsatResultsData> = this.reportRollupService.psatResults.getValue();
    this.pieChartData = new Array();
    let totalEnergyUse: number = _.sumBy(psatResults, (result) => { return result.baselineResults.annual_energy; });
    let totalCost: number = _.sumBy(psatResults, (result) => { return result.baselineResults.annual_cost; });
    //starting with 2, summary table uses 0 and 1
    let colorIndex: number = 2;
    psatResults.forEach(result => {
      this.pieChartData.push({
        equipmentName: result.name,
        energyUsed: result.baselineResults.annual_energy,
        annualCost: result.baselineResults.annual_cost,
        percentCost: result.baselineResults.annual_cost / totalCost * 100,
        percentEnergy: result.baselineResults.annual_energy / totalEnergyUse * 100,
        color: graphColors[colorIndex]
      });
      colorIndex++;
    });
  }
}
