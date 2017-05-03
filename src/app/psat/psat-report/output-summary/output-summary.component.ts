import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-output-summary',
  templateUrl: './output-summary.component.html',
  styleUrls: ['./output-summary.component.css']
})
export class OutputSummaryComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit() {
  }

}
