import { Component, OnInit, Input } from '@angular/core';
import { FSAT } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';

@Component({
  selector: 'app-fsat-report-sankey',
  templateUrl: './fsat-report-sankey.component.html',
  styleUrls: ['./fsat-report-sankey.component.css']
})
export class FsatReportSankeyComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;

  fsat1CostSavings: number;
  fsat2CostSavings: number;
  fsat1: FSAT;
  fsat2: FSAT;
  fsat1Baseline: boolean = true;
  fsat2Baseline: boolean = false;
  constructor() { }

  ngOnInit() {
    this.fsat1 = this.assessment.fsat;
    this.setFsat1Savings();
    if (this.assessment.fsat.modifications.length != 0) {
      this.fsat2 = this.assessment.fsat.modifications[0].fsat;
      this.setFsat2Savings();
    }
  }

  setFsat1Savings() {
    this.fsat1CostSavings = this.assessment.fsat.outputs.annualCost - this.fsat1.outputs.annualCost;
  }

  setFsat2Savings() {
    this.fsat2CostSavings = this.assessment.fsat.outputs.annualCost - this.fsat2.outputs.annualCost;
  }

  setFsat1() {
    this.fsat1Baseline = this.assessment.fsat.name == this.fsat1.name? true : false
    this.fsat1CostSavings = this.assessment.fsat.outputs.annualCost - this.fsat1.outputs.annualCost;
  }

  setFsat2() {
    this.fsat2Baseline = this.assessment.fsat.name == this.fsat2.name? true : false
    this.fsat2CostSavings = this.assessment.fsat.outputs.annualCost - this.fsat2.outputs.annualCost;
  }

}
