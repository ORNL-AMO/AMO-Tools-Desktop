import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PsatResultsData } from '../../report-rollup-models';
import { ReportRollupService } from '../../report-rollup.service';
import { RollupSummaryTableData } from '../../rollup-summary-table/rollup-summary-table.component';

@Component({
  selector: 'app-psat-rollup-pump-summary-table',
  templateUrl: './psat-rollup-pump-summary-table.component.html',
  styleUrls: ['./psat-rollup-pump-summary-table.component.css']
})
export class PsatRollupPumpSummaryTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;


  tableData: Array<RollupSummaryTableData>;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.tableData = new Array();
    let psatResultData: Array<PsatResultsData> = this.reportRollupService.psatResults.getValue();
    psatResultData.forEach(dataItem => {
      this.tableData.push({
        equipmentName: dataItem.name,
        modificationName: dataItem.modName,
        baselineEnergyUse: dataItem.baselineResults.annual_energy,
        modificationCost: dataItem.modificationResults.annual_cost,
        modificationEnergyUse: dataItem.baselineResults.annual_energy,
        baselineCost: dataItem.baselineResults.annual_cost,
        costSavings: dataItem.baselineResults.annual_cost - dataItem.modificationResults.annual_cost,
        implementationCosts: dataItem.modification.inputs.implementationCosts,
        payBackPeriod: this.getPayback(dataItem.modificationResults.annual_cost, dataItem.baselineResults.annual_cost, dataItem.modification.inputs.implementationCosts)
      })
    })
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

  getSavings(modCost: number, baselineCost: number) {
    return baselineCost - modCost;
  }
}
