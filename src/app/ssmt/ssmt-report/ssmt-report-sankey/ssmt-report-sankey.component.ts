import { Component, Input, OnInit } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { SSMT, SsmtValid } from '../../../shared/models/steam/ssmt';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-ssmt-report-sankey',
  templateUrl: './ssmt-report-sankey.component.html',
  styleUrls: ['./ssmt-report-sankey.component.css']
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

  ssmt1CostSavings: number;
  ssmt2CostSavings: number;
  ssmt1: SSMT;
  ssmt2: SSMT;
  ssmt1Baseline: boolean = true;
  ssmt2Baseline: boolean = false;
  constructor() { }

  ngOnInit() {
    this.ssmt1 = this.assessment.ssmt;
    this.setSsmt1();
    if (this.assessment.ssmt.modifications.length != 0) {
      this.ssmt2 = this.assessment.ssmt.modifications[0].ssmt;
      this.setSsmt2();
    }
  }

  setSsmt1() {
    this.ssmt1Baseline = this.assessment.ssmt.name == this.ssmt1.name? true : false;
    let selectedSSMTCost: number = this.getSelectedSSMTCost(this.ssmt1.name);
    this.ssmt1CostSavings = this.baselineOutput.operationsOutput.totalOperatingCost - selectedSSMTCost;

  }

  setSsmt2() {
    this.ssmt2Baseline = this.assessment.ssmt.name == this.ssmt2.name? true : false
    let selectedSSMTCost: number = this.getSelectedSSMTCost(this.ssmt2.name);
    this.ssmt2CostSavings = this.baselineOutput.operationsOutput.totalOperatingCost - selectedSSMTCost;
  }

  getSelectedSSMTCost(selectedName: string) {
    let cost = this.baselineOutput.operationsOutput.totalOperatingCost;
    if (selectedName != this.assessment.ssmt.name) {
      this.modificationOutputs.forEach(mod => {
        if (mod.name == selectedName) {
          cost = mod.outputData.operationsOutput.totalOperatingCost;
        }
      })
    }
    return cost;
  }

}