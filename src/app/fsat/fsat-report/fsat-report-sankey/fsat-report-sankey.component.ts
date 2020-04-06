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
  constructor() { }

  ngOnInit() {
    this.fsat1 = this.assessment.fsat;
    this.setPsat1Savings();
    if (this.assessment.fsat.modifications.length != 0) {
      this.fsat2 = this.assessment.fsat.modifications[0].fsat;
      this.setPsat2Savings();
    }
  }

  setPsat1Savings() {
    this.fsat1CostSavings = this.assessment.fsat.outputs.annualCost - this.fsat1.outputs.annualCost;
  }

  setPsat2Savings() {
    this.fsat2CostSavings = this.assessment.fsat.outputs.annualCost - this.fsat2.outputs.annualCost;
  }

}
