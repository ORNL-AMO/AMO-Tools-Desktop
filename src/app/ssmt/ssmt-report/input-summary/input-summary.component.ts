import { Component, OnInit, Input } from '@angular/core';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
    selector: 'app-input-summary',
    templateUrl: './input-summary.component.html',
    styleUrls: ['./input-summary.component.css'],
    standalone: false
})
export class InputSummaryComponent implements OnInit {
  @Input()
  baselineInputData: SSMTInputs;
  @Input()
  modificationInputData: Array<{ name: string, inputData: SSMTInputs }>;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  @Input()
  modificationOutputs: Array<SSMTOutput>;

  constructor() { }

  ngOnInit() {
  }

}
