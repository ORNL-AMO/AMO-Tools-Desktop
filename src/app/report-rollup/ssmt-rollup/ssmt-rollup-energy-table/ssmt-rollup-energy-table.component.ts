import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService } from '../../report-rollup.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { SsmtResultsData } from '../../report-rollup-models';
import * as _ from 'lodash';
@Component({
  selector: 'app-ssmt-rollup-energy-table',
  templateUrl: './ssmt-rollup-energy-table.component.html',
  styleUrls: ['./ssmt-rollup-energy-table.component.css']
})
export class SsmtRollupEnergyTableComponent implements OnInit {
  @Input()
  settings: Settings;

  energyTableData: Array<{ name: string, energyUse: number, cost: number, costPercent: number, energyUsePercent: number, pieColor: string }>;
  totalEnergyUse: number;
  totalCost: number;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.setData();
  }

  setData() {
    this.energyTableData = new Array();
    let resultData: Array<SsmtResultsData> = this.reportRollupService.ssmtResults.getValue();
    this.totalEnergyUse = _.sumBy(resultData, (resultItem) => { return resultItem.baselineResults.operationsOutput.boilerFuelUsage; });
    this.totalCost = _.sumBy(resultData, (resultItem) => { return resultItem.baselineResults.operationsOutput.totalOperatingCost; });

    let index: number = 0;
    resultData.forEach(resultItem => {
      this.energyTableData.push({
        name: resultItem.name,
        energyUse: resultItem.baselineResults.operationsOutput.boilerFuelUsage,
        cost: resultItem.baselineResults.operationsOutput.totalOperatingCost,
        costPercent: (resultItem.baselineResults.operationsOutput.totalOperatingCost / this.totalCost) * 100,
        energyUsePercent: (resultItem.baselineResults.operationsOutput.boilerFuelUsage / this.totalEnergyUse) * 100,
        pieColor: graphColors[index]
      });
      index++;
    });
  }
}
