import { Component, Input, OnInit } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { SSMT, SsmtValid } from '../../../shared/models/steam/ssmt';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';
import { SankeyScenarioOption } from '../../../shared/sankey/sankey-scenario-picker/sankey-scenario-picker.component';

@Component({
    selector: 'app-ssmt-report-sankey',
    templateUrl: './ssmt-report-sankey.component.html',
    styleUrls: ['./ssmt-report-sankey.component.css'],
    standalone: false
})
export class SsmtReportSankeyComponent implements OnInit {
@Input()
settings: Settings;
@Input()
assessment: Assessment;
@Input()
baselineOutput: SSMTOutput;
@Input()
modificationOutputs: Array<{ name: string, outputData: SSMTOutput, valid: SsmtValid }>;

  ssmtOptions: Array<SankeyScenarioOption>;
  ssmt1CostSavings: number;
  ssmt2CostSavings: number;
  ssmt1: SSMT;
  ssmt2: SSMT;
  ssmt1Baseline: boolean = true;
  ssmt2Baseline: boolean = false;
  constructor() { }

  ngOnInit() {
    this.ssmtOptions = [{ name: 'Baseline', value: this.assessment.ssmt }];
    this.assessment.ssmt.modifications?.forEach(modification => {
      this.ssmtOptions.push({ name: modification.ssmt.name, value: modification.ssmt });
    });

    this.ssmt1 = this.assessment.ssmt;
    this.setSsmt1();
    this.ssmt2 = this.assessment.ssmt.modifications?.[0]?.ssmt ?? this.assessment.ssmt;
    this.setSsmt2();
  }

  onSsmt1Change(ssmt: SSMT) {
    this.ssmt1 = ssmt;
    this.setSsmt1();
  }

  onSsmt2Change(ssmt: SSMT) {
    this.ssmt2 = ssmt;
    this.setSsmt2();
  }

  setSsmt1() {
    this.ssmt1Baseline = this.assessment.ssmt.name == this.ssmt1.name;
    let selectedSSMTCost: number = this.getSelectedSSMTCost(this.ssmt1.name);
    this.ssmt1CostSavings = selectedSSMTCost != null ? this.baselineOutput.operationsOutput.totalOperatingCost - selectedSSMTCost : undefined;

  }

  setSsmt2() {
    this.ssmt2Baseline = this.assessment.ssmt.name == this.ssmt2.name;
    let selectedSSMTCost: number = this.getSelectedSSMTCost(this.ssmt2.name);
    this.ssmt2CostSavings = selectedSSMTCost != null ? this.baselineOutput.operationsOutput.totalOperatingCost - selectedSSMTCost : undefined;
  }

  getSelectedSSMTCost(selectedName: string): number {
    let cost = this.baselineOutput.operationsOutput.totalOperatingCost;
    if (selectedName != this.assessment.ssmt.name) {
      const selectedMod = this.modificationOutputs.find(mod => mod.name == selectedName);
      if (!selectedMod?.outputData?.operationsOutput) {
        return undefined;
      }
      cost = selectedMod.outputData.operationsOutput.totalOperatingCost;
    }
    return cost;
  }

}
