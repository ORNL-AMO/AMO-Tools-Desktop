import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Calculator } from '../../../shared/models/calculators';

@Component({
  selector: 'app-psat-rollup-print',
  templateUrl: './psat-rollup-print.component.html',
  styleUrls: ['./psat-rollup-print.component.css']
})
export class PsatRollupPrintComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  calculators: Array<Calculator>;
  constructor() { }

  ngOnInit() {
  }

}
