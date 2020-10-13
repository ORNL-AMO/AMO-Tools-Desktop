import { Component, OnInit, Input } from '@angular/core';
import { SSMTInputs, SsmtValid } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';

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
  baselineOutput: SSMTOutput;
  @Input()
  modificationOutputs: Array<{name: string, outputData: SSMTOutput, valid: SsmtValid}>;
  @Input()
  modificationInputData: Array<{ name: string, inputData: SSMTInputs, valid: SsmtValid }>;
  
  constructor() { }

  ngOnInit() {
  }

}
