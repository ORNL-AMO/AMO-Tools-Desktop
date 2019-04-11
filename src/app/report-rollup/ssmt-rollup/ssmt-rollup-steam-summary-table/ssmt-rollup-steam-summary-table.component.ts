import { Component, OnInit, Input } from '@angular/core';
import { SsmtResultsData } from '../../report-rollup-models';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-ssmt-rollup-steam-summary-table',
  templateUrl: './ssmt-rollup-steam-summary-table.component.html',
  styleUrls: ['./ssmt-rollup-steam-summary-table.component.css']
})
export class SsmtRollupSteamSummaryTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  @Input()
  resultData: Array<SsmtResultsData>;

  constructor() { }

  ngOnInit() {
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
