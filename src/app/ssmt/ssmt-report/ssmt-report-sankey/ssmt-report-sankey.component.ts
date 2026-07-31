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
  ssmtCostSavings: number;
  ssmtBaseline: boolean = true;
  ssmts: Array<SSMT>;
  constructor() { }

  ngOnInit() {
    this.ssmts = [this.assessment.ssmt, ...(this.assessment.ssmt.modifications ?? []).map(modification => modification.ssmt)];
    this.ssmtOptions = this.ssmts.map(ssmt => ({ name: ssmt.name, value: ssmt }));
  }

  setSsmt(selectedSsmt: SSMT) {
    this.ssmtBaseline = this.assessment.ssmt.name == selectedSsmt.name;
    let selectedSSMTCost: number = this.getSelectedSSMTCost(selectedSsmt.name);
    this.ssmtCostSavings = selectedSSMTCost != null ? this.baselineOutput.operationsOutput.totalOperatingCost - selectedSSMTCost : undefined;
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
