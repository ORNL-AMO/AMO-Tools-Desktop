import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-psat-report-sankey',
  templateUrl: './psat-report-sankey.component.html',
  styleUrls: ['./psat-report-sankey.component.css']
})
export class PsatReportSankeyComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;

  psat1CostSavings: number;
  psat2CostSavings: number;
  psat1: PSAT;
  psat2: PSAT;
  constructor() { }

  ngOnInit() {
    this.psat1 = this.assessment.psat;
    this.setPsat1Savings();
    if (this.assessment.psat.modifications.length != 0) {
      this.psat2 = this.assessment.psat.modifications[0].psat;
      this.setPsat2Savings();
    }
  }

  setPsat1Savings() {
    this.psat1CostSavings = this.assessment.psat.outputs.annual_cost - this.psat1.outputs.annual_cost;
  }

  setPsat2Savings() {
    this.psat2CostSavings = this.assessment.psat.outputs.annual_cost - this.psat2.outputs.annual_cost;
  }
}
