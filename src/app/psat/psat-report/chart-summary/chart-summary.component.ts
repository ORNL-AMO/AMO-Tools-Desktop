import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';

@Component({
  selector: 'app-chart-summary',
  templateUrl: './chart-summary.component.html',
  styleUrls: ['./chart-summary.component.css']
})
export class ChartSummaryComponent implements OnInit {
  @Input()
  baseline: PSAT;
  constructor() { }

  ngOnInit() {
  }

}
