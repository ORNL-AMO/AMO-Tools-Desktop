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

  // prepPsatOptions() {
  //   this.psatOptions = new Array<{name, psat}>();
  //   this.psatOptions.push({name: 'Baseline', psat: this.psat});
  //   this.psat1 = this.psatOptions[0];

  //   if (this.psat.modifications !== undefined && this.psat.modifications !== null) {
  //     this.modExists = true;
  //     this.psat.modifications.forEach(mod => {
  //       this.psatOptions.push({name: mod.psat.name, psat: mod.psat});
  //     });
  //     this.psat2 = this.psatOptions[1];
  //   }
  // }

  // getPsat1Savings() {
  //   if (!this.psat1 || !this.psat1.psat.outputs || this.psat1.psat.outputs === null) {
  //     return;
  //   }
  //   let isMod;
  //   if (this.psat1.name == this.psat.name) {
  //     isMod = false;
  //   }
  //   else {
  //     isMod = true;
  //   }
  //   let annualSavingsPotential = this.psat.outputs.annual_cost - this.psat1.psat.outputs.annual_cost;
  //   this.psat1CostSavings = annualSavingsPotential;
  // }

  // getPsat2Savings() {
  //   if (!this.psat2 || !this.psat2.psat.outputs || this.psat2.psat.outputs === null) {
  //     return;
  //   }
  //   let isMod;
  //   if (this.psat2.name == this.psat.name) {
  //     isMod = false;
  //   }
  //   else {
  //     isMod = true;
  //   }
  //   let annualSavingsPotential = this.psat.outputs.annual_cost - this.psat2.psat.outputs.annual_cost;
  //   this.psat2CostSavings = annualSavingsPotential;
  // }

}
