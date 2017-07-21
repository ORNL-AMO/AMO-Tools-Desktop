import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { PSAT } from '../../shared/models/psat';
import * as _ from 'lodash';

@Component({
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.css']
})
export class ReportSummaryComponent implements OnInit {
  @Input()
  pumpSavingsPotential: number;
  @Input()
  numPsats: number;
  @Input()
  energySavingsPotential: number;
  constructor() { }

  ngOnInit() {
  }
}
