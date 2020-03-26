import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService } from '../../report-rollup.service';
import { SsmtResultsData } from '../../report-rollup-models';

@Component({
  selector: 'app-ssmt-rollup-summary-table',
  templateUrl: './ssmt-rollup-summary-table.component.html',
  styleUrls: ['./ssmt-rollup-summary-table.component.css']
})
export class SsmtRollupSummaryTableComponent implements OnInit {
  @Input()
  settings: Settings;

  resultData: Array<{
    baselineName: string,
    modificationName: string,
    baselineEnergyUse: number,
    modificationEnergyUse: number,
    baselineCost: number,
    modificationCost: number,
    costSavings: number,
    energySavings: number,
    implementationCosts: number,
    paybackPeriod: number
  }>
  constructor(private reportRollupService: ReportRollupService) { }
  ngOnInit(): void {
    this.setResultData();
  }

  setResultData() {
    let ssmtResults: Array<SsmtResultsData> = this.reportRollupService.ssmtResults.getValue();
    this.resultData = new Array();
    ssmtResults.forEach(resultItem => {
      let paybackPeriod: number = this.getPayback(resultItem.modificationResults.operationsOutput.totalOperatingCost, resultItem.baselineResults.operationsOutput.totalOperatingCost, resultItem.modification.operatingCosts.implementationCosts);
      this.resultData.push({
        baselineName: resultItem.name,
        modificationName: resultItem.modName,
        baselineEnergyUse: resultItem.baselineResults.operationsOutput.boilerFuelUsage,
        baselineCost: resultItem.baselineResults.operationsOutput.totalOperatingCost,
        modificationEnergyUse: resultItem.modificationResults.operationsOutput.boilerFuelUsage,
        modificationCost: resultItem.modificationResults.operationsOutput.totalOperatingCost,
        costSavings: resultItem.baselineResults.operationsOutput.totalOperatingCost - resultItem.modificationResults.operationsOutput.totalOperatingCost,
        energySavings: resultItem.baselineResults.operationsOutput.boilerFuelUsage - resultItem.modificationResults.operationsOutput.boilerFuelUsage,
        implementationCosts: resultItem.modification.operatingCosts.implementationCosts,
        paybackPeriod: paybackPeriod
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