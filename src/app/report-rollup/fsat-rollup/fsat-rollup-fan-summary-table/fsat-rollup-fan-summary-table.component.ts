import { Component, OnInit, Input } from '@angular/core';
import { FsatResultsData } from '../../report-rollup.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-fsat-rollup-fan-summary-table',
  templateUrl: './fsat-rollup-fan-summary-table.component.html',
  styleUrls: ['./fsat-rollup-fan-summary-table.component.css']
})
export class FsatRollupFanSummaryTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  @Input()
  resultData: Array<FsatResultsData>;

  constructor() { }

  ngOnInit() {
  }
  
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
