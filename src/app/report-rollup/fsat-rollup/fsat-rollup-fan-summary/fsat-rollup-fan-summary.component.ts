import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-fsat-rollup-fan-summary',
  templateUrl: './fsat-rollup-fan-summary.component.html',
  styleUrls: ['./fsat-rollup-fan-summary.component.css']
})
export class FsatRollupFanSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  constructor() { }

  ngOnInit() {
  }

}
