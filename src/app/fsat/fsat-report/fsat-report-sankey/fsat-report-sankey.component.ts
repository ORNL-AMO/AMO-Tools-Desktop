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
  fsat1CostSavings: number;
  fsat2CostSavings: number;
  fsat1: FSAT;
  fsat2: FSAT;
  fsat1Baseline: boolean = true;
  fsat2Baseline: boolean = false;
  constructor() { }

  ngOnInit() {
    this.fsatOptions = [{ name: 'Baseline', value: this.assessment.fsat }];
    this.assessment.fsat.modifications?.forEach(modification => {
      this.fsatOptions.push({ name: modification.fsat.name, value: modification.fsat });
    });

    this.fsat1 = this.assessment.fsat;
    this.setFsat1();
    const validModification = this.assessment.fsat.modifications?.find(modification => modification.fsat?.valid?.isValid);
    this.fsat2 = (validModification ?? this.assessment.fsat.modifications?.[0])?.fsat ?? this.assessment.fsat;
    this.setFsat2();
  }

  onFsat1Change(fsat: FSAT) {
    this.fsat1 = fsat;
    this.setFsat1();
  }

  onFsat2Change(fsat: FSAT) {
    this.fsat2 = fsat;
    this.setFsat2();
  }

  setFsat1() {
    this.fsat1Baseline = this.assessment.fsat.name == this.fsat1.name;
    this.fsat1CostSavings = (this.assessment.fsat.outputs && this.fsat1.valid?.isValid && this.fsat1.outputs)
      ? this.assessment.fsat.outputs.annualCost - this.fsat1.outputs.annualCost : undefined;
  }

  setFsat2() {
    this.fsat2Baseline = this.assessment.fsat.name == this.fsat2.name;
    this.fsat2CostSavings = (this.assessment.fsat.outputs && this.fsat2.valid?.isValid && this.fsat2.outputs)
      ? this.assessment.fsat.outputs.annualCost - this.fsat2.outputs.annualCost : undefined;
  }

}
