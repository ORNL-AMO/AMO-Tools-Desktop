import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-psat-rollup-energy-table',
  templateUrl: './psat-rollup-energy-table.component.html',
  styleUrls: ['./psat-rollup-energy-table.component.css']
})
export class PsatRollupEnergyTableComponent implements OnInit {
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit() {
  }

}
