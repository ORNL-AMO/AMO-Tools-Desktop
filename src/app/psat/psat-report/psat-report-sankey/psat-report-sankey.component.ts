import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { SankeyScenarioOption } from '../../../shared/sankey/sankey-scenario-picker/sankey-scenario-picker.component';

export interface PsatSankeyScenario {
  scenario: PSAT;
  costSavings: number;
  isBaseline: boolean;
}

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
  sankeyScenarios: Array<PsatSankeyScenario>;
  constructor() { }

  ngOnInit() {
    const psats = [this.assessment.psat, ...(this.assessment.psat.modifications ?? []).map(modification => modification.psat)];
    this.psatOptions = psats.map(psat => ({ name: psat.name, value: psat }));
    this.sankeyScenarios = psats.map(psat => ({ scenario: psat, costSavings: this.getCostSavings(psat), isBaseline: psat === this.assessment.psat }));
  }

  setPsat(sankeyScenario: PsatSankeyScenario, selectedPsat: PSAT) {
    sankeyScenario.scenario = selectedPsat;
    sankeyScenario.isBaseline = selectedPsat === this.assessment.psat;
    sankeyScenario.costSavings = this.getCostSavings(selectedPsat);
  }

  getCostSavings(selectedPsat: PSAT): number {
    return (this.assessment.psat.outputs && selectedPsat.valid?.isValid && selectedPsat.outputs)
      ? this.assessment.psat.outputs.annual_cost - selectedPsat.outputs.annual_cost : undefined;
  }
}
