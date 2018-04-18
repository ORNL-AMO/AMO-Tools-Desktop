import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../../shared/models/psat';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-psat-report-graphs-print',
  templateUrl: './psat-report-graphs-print.component.html',
  styleUrls: ['./psat-report-graphs-print.component.css']
})
export class PsatReportGraphsPrintComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  psat: PSAT;
  @Input()
  barLabels: Array<string>;
  @Input()
  barChartWidth: number;
  @Input()
  pieChartWidth: number;
  @Input()
  printView: boolean;
  @Input()
  modExists: boolean;
  @Input()
  printSankey: boolean;
  @Input()
  printGraphs: boolean;

  baselinePsat: PSAT;


  constructor() { }

  ngOnInit() {
  }

}
