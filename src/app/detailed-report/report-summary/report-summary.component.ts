import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import * as _ from 'lodash';

@Component({
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.css']
})
export class ReportSummaryComponent implements OnInit {
  @Input()
  assessments: Array<Assessment>;

  pumpSavingsPotential: number = 0;
  numPumps: number = 0;
  constructor() { }

  ngOnInit() {
    this.calcDisplayValues();
  }

  ngOnChanges() {
    this.calcDisplayValues();
  }

  calcDisplayValues() {
    this.pumpSavingsPotential = 0;
    this.numPumps = 0;
    this.assessments.forEach(assessment => {
      if (assessment.psat) {
        if (assessment.psat.outputs) {
          console.log(assessment.name);
          this.pumpSavingsPotential += assessment.psat.outputs.existing.annual_savings_potential;
          this.numPumps++;
        }
      }
    })
  }

}
