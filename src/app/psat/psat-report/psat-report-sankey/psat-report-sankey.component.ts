import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-psat-report-sankey',
    templateUrl: './psat-report-sankey.component.html',
    styleUrls: ['./psat-report-sankey.component.css'],
    standalone: false
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
  psat2Baseline = false;
  psat1Baseline = true;
  constructor() { }

  ngOnInit() {
    this.psat1 = this.assessment.psat;
    this.setPsat1();
    if (this.assessment.psat.modifications.length != 0) {
      this.psat2 = this.assessment.psat.modifications.find(modification => {return modification.psat.valid.isValid == true}).psat;
      this.setPsat2();
    }
  }

  setPsat1() {
    this.psat1Baseline = this.assessment.psat.name == this.psat1.name? true : false
    this.psat1CostSavings = this.assessment.psat.outputs.annual_cost - this.psat1.outputs.annual_cost;
  }

  setPsat2() {
    this.psat2Baseline = this.assessment.psat.name == this.psat2.name? true : false
    this.psat2CostSavings = this.assessment.psat.outputs.annual_cost - this.psat2.outputs.annual_cost;
  }
}
