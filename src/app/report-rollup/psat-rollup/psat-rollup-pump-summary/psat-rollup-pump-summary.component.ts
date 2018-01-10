import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-psat-rollup-pump-summary',
  templateUrl: './psat-rollup-pump-summary.component.html',
  styleUrls: ['./psat-rollup-pump-summary.component.css']
})
export class PsatRollupPumpSummaryComponent implements OnInit {
  @Input()
  settings: Settings
  constructor() { }

  ngOnInit() {
  }

}
