import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-report-rollup-units',
  templateUrl: './report-rollup-units.component.html',
  styleUrls: ['./report-rollup-units.component.css']
})
export class ReportRollupUnitsComponent implements OnInit {
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit() {
  }

}
