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
  graphColors: Array<string>;
  @Input()
  psatOptions: Array<{ name: string, psat: PSAT }>;
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
  @Input()
  allChartData: { pieLabels: Array<Array<string>>, pieValues: Array<Array<number>>, barLabels: Array<string>, barValues: Array<Array<number>> }
  // @Input()
  // allPieLabels: Array<Array<string>>;
  // @Input()
  // allPieValues: Array<Array<number>>;

  baselinePsat: { name: string, psat: PSAT };
  allNotes: Array<Array<string>>;


  constructor() { }

  ngOnInit() {
    if (this.psatOptions === null || this.psatOptions === undefined) {
      console.error('psat print error');
      return;
    }
    this.setBaseline();
  }


  setBaseline(): void {
    this.baselinePsat = this.psatOptions[0];
  }



}
