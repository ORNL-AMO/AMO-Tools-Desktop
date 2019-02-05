import { Component, OnInit, Input } from '@angular/core';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-input-summary',
  templateUrl: './input-summary.component.html',
  styleUrls: ['./input-summary.component.css']
})
export class InputSummaryComponent implements OnInit {
  @Input()
  baselineInputData: SSMTInputs;
  @Input()
  modificationInputData: Array<{ name: string, inputData: SSMTInputs }>;
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }

}
