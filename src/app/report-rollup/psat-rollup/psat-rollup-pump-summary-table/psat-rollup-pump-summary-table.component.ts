import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PsatResultsData, ReportRollupService } from '../../report-rollup.service';

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
  @Input()
  resultData: Array<PsatResultsData>;


  // constructor(private reportRollupService: ReportRollupService) { }
  constructor() { }
  ngOnInit() { }



  getPayback(modCost: number, baselineCost: number, implementationCost: number) {
    if (implementationCost) {
      let val = (implementationCost / (baselineCost - modCost)) * 12;
      if (isNaN(val) == false) {
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
