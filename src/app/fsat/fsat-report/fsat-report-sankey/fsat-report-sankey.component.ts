import { Component, OnInit, Input } from '@angular/core';
import { FSAT } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { SankeyScenarioOption } from '../../../shared/sankey/sankey-scenario-picker/sankey-scenario-picker.component';

export interface FsatSankeyScenario {
  scenario: FSAT;
  costSavings: number;
  isBaseline: boolean;
}

@Component({
    selector: 'app-fsat-report-sankey',
    templateUrl: './fsat-report-sankey.component.html',
    styleUrls: ['./fsat-report-sankey.component.css'],
    standalone: false
})
export class FsatReportSankeyComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;

  fsatOptions: Array<SankeyScenarioOption>;
  sankeyScenarios: Array<FsatSankeyScenario>;
  constructor() { }

  ngOnInit() {
    const fsats = [this.assessment.fsat, ...(this.assessment.fsat.modifications ?? []).map(modification => modification.fsat)];
    this.fsatOptions = fsats.map(fsat => ({ name: fsat.name, value: fsat }));
    this.sankeyScenarios = fsats.map(fsat => ({ scenario: fsat, costSavings: this.getCostSavings(fsat), isBaseline: fsat === this.assessment.fsat }));
  }

  setFsat(sankeyScenario: FsatSankeyScenario, selectedFsat: FSAT) {
    sankeyScenario.scenario = selectedFsat;
    sankeyScenario.isBaseline = selectedFsat === this.assessment.fsat;
    sankeyScenario.costSavings = this.getCostSavings(selectedFsat);
  }

  getCostSavings(selectedFsat: FSAT): number {
    return (this.assessment.fsat.outputs && selectedFsat.valid?.isValid && selectedFsat.outputs)
      ? this.assessment.fsat.outputs.annualCost - selectedFsat.outputs.annualCost : undefined;
  }
}
