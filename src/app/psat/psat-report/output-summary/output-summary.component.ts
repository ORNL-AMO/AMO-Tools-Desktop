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

  unit: string;
  titlePlacement: string;
  constructor() { }

  ngOnInit() {
    this.unit = '%';
    this.titlePlacement = 'top';
  }

  checkSavings(num: number) {
    return this.psat.outputs.annual_cost - num;
  }

  getSavingsPercentage(baseline: PSAT, modification: PSAT): number {
    let tmpSavingsPercent = Number(Math.round(((((baseline.outputs.annual_cost - modification.outputs.annual_cost) * 100) / baseline.outputs.annual_cost) * 100) / 100).toFixed(0));
    return tmpSavingsPercent;
  }

}
