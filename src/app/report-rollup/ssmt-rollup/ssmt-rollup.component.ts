import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { BarChartDataItem } from '../rollup-summary-bar-chart/bar-chart-data';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import { SsmtResultsData } from '../report-rollup-models';
import { ReportRollupService } from '../report-rollup.service';

@Component({
  selector: 'app-ssmt-rollup',
  templateUrl: './ssmt-rollup.component.html',
  styleUrls: ['./ssmt-rollup.component.css']
})
export class SsmtRollupComponent implements OnInit {
  @Input()
  settings: Settings;

  dataOption: string = 'cost';
  barChartData: Array<BarChartDataItem>;
  tickFormat: string;
  yAxisLabel: string;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.setBarChartData();
  }

  setDataOption(str: string) {
    this.dataOption = str;
    this.setBarChartData();
  }
  setBarChartData() {
    this.barChartData = this.getDataObject();
    this.yAxisLabel = 'Annual Energy Cost ($/yr)';
    this.tickFormat = '$.2s';
    if (this.dataOption == 'energy') {
      this.yAxisLabel = 'Annual Energy Usage (' + this.settings.steamEnergyMeasurement + '/hr)';
      this.tickFormat = '.2s'
    }
  }

  getDataObject(): Array<BarChartDataItem> {
    let hoverTemplate: string = '%{y:$,.0f}<extra></extra>';
    if (this.dataOption == 'energy') {
      hoverTemplate = '%{y:,.0f}<extra></extra> ' + this.settings.steamEnergyMeasurement + '/hr';
    }
    let chartData: { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } = this.getChartData();
    let projectCostTrace: BarChartDataItem = {
      x: chartData.labels,
      y: chartData.projectedCosts,
      hoverinfo: 'all',
      hovertemplate: hoverTemplate,
      name: "Modification Costs",
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
    let ssmtResults: Array<SsmtResultsData> = this.reportRollupService.ssmtResults.getValue();
    let projectedCosts: Array<number> = new Array();
    let labels: Array<string> = new Array();
    let costSavings: Array<number> = new Array();
    if (this.dataOption == 'cost') {
      ssmtResults.forEach(result => {
        labels.push(result.name);
        costSavings.push(result.baselineResults.operationsOutput.totalOperatingCost - result.modificationResults.operationsOutput.totalOperatingCost);
        projectedCosts.push(result.modificationResults.operationsOutput.totalOperatingCost);
      })
    } else if (this.dataOption == 'energy') {
      ssmtResults.forEach(result => {
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

}
