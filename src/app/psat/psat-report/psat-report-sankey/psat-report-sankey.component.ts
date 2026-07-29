import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { SankeyScenarioOption } from '../../../shared/sankey/sankey-scenario-picker/sankey-scenario-picker.component';

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

  psatOptions: Array<SankeyScenarioOption>;
  psat1CostSavings: number;
  psat2CostSavings: number;
  psat1: PSAT;
  psat2: PSAT;
  psat2Baseline = false;
  psat1Baseline = true;
  constructor() { }

  ngOnInit() {
    this.psatOptions = [{ name: 'Baseline', value: this.assessment.psat }];
    this.assessment.psat.modifications?.forEach(modification => {
      this.psatOptions.push({ name: modification.psat.name, value: modification.psat });
    });

    this.psat1 = this.assessment.psat;
    this.setPsat1();
    const validModification = this.assessment.psat.modifications?.find(modification => modification.psat?.valid?.isValid);
    this.psat2 = (validModification ?? this.assessment.psat.modifications?.[0])?.psat ?? this.assessment.psat;
    this.setPsat2();
  }

  onPsat1Change(psat: PSAT) {
    this.psat1 = psat;
    this.setPsat1();
  }

  onPsat2Change(psat: PSAT) {
    this.psat2 = psat;
    this.setPsat2();
  }

  setPsat1() {
    this.psat1Baseline = this.assessment.psat.name == this.psat1.name;
    this.psat1CostSavings = (this.assessment.psat.outputs && this.psat1.valid?.isValid && this.psat1.outputs)
      ? this.assessment.psat.outputs.annual_cost - this.psat1.outputs.annual_cost : undefined;
  }

  setPsat2() {
    this.psat2Baseline = this.assessment.psat.name == this.psat2.name;
    this.psat2CostSavings = (this.assessment.psat.outputs && this.psat2.valid?.isValid && this.psat2.outputs)
      ? this.assessment.psat.outputs.annual_cost - this.psat2.outputs.annual_cost : undefined;
  }
}
