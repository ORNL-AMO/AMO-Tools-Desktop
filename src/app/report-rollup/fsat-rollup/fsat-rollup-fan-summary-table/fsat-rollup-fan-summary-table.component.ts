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

}
