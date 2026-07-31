import { Component, OnInit, Input } from '@angular/core';
import { FSAT } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { SankeyScenarioOption } from '../../../shared/sankey/sankey-scenario-picker/sankey-scenario-picker.component';

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
  fsatCostSavings: number;
  fsatBaseline: boolean = true;
  fsats: Array<FSAT>;
  constructor() { }

  ngOnInit() {
    this.fsats = [this.assessment.fsat, ...(this.assessment.fsat.modifications ?? []).map(modification => modification.fsat)];
    this.fsatOptions = this.fsats.map(fsat => ({ name: fsat.name, value: fsat }));
  }

  setFsat(selectedFsat: FSAT) {
    this.fsatBaseline = this.assessment.fsat.name == selectedFsat.name;
    this.fsatCostSavings = (this.assessment.fsat.outputs && selectedFsat.valid?.isValid && selectedFsat.outputs)
      ? this.assessment.fsat.outputs.annualCost - selectedFsat.outputs.annualCost : undefined;
  }
}
