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
  psatCostSavings: number;
  psatBaseline: boolean = true;
  psats: Array<PSAT>;
  constructor() { }

  ngOnInit() {
    this.psats = [this.assessment.psat, ...(this.assessment.psat.modifications ?? []).map(modification => modification.psat)];
    this.psatOptions = this.psats.map(psat => ({ name: psat.name, value: psat }));
  }

  setPsat(selectedPsat: PSAT) {
    this.psatBaseline = this.assessment.psat.name == selectedPsat.name;
    this.psatCostSavings = (this.assessment.psat.outputs && selectedPsat.valid?.isValid && selectedPsat.outputs)
      ? this.assessment.psat.outputs.annual_cost - selectedPsat.outputs.annual_cost : undefined;
  }
}
