import { Component, OnInit, Input } from '@angular/core';
import { SSMT, SSMTInputs, SsmtValid } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';
import { Assessment } from '../../../shared/models/assessment';

@Component({
  selector: 'app-report-diagram',
  templateUrl: './report-diagram.component.html',
  styleUrls: ['./report-diagram.component.css']
})
export class ReportDiagramComponent implements OnInit {
  @Input()
  inputData: SSMTInputs;
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  baselineOutput: SSMTOutput;
  @Input()
  modificationOutputs: Array<{name: string, outputData: SSMTOutput, valid: SsmtValid}>;
  @Input()
  modificationInputData: Array<{ name: string, inputData: SSMTInputs, valid: SsmtValid }>;
  

  ssmt1: SSMT;
  ssmt2: SSMT;
  ssmt1Baseline: boolean = true;
  ssmt2Baseline: boolean = false;
  constructor() { }

  ngOnInit() {
    // debugger;
    this.ssmt1 = this.assessment.ssmt;
    // don't need to call this, already set above   
    this.setSsmt1();
    if (this.assessment.ssmt.modifications.length != 0) {
      this.ssmt2 = this.assessment.ssmt.modifications[0].ssmt;
      // Don't need to call
      this.setSsmt2();
    }
  }

  setSsmt1() {
    // Keep since the diagram will need to know if we're in baseline
    this.ssmt1Baseline = this.assessment.ssmt.name == this.ssmt1.name? true : false;
  }

  setSsmt2() {
    this.ssmt2Baseline = this.assessment.ssmt.name == this.ssmt2.name? true : false
  }

}
