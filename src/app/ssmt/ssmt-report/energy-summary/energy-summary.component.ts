import { Component, OnInit, Input } from '@angular/core';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-energy-summary',
  templateUrl: './energy-summary.component.html',
  styleUrls: ['./energy-summary.component.css']
})
export class EnergySummaryComponent implements OnInit {
  @Input()
  baselineOutput: SSMTOutput;
  @Input()
  modificationOutputs: Array<{name: string, outputData: SSMTOutput}>;
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }

}
