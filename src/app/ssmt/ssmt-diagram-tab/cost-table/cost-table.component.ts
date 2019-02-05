import { Component, OnInit, Input } from '@angular/core';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';
import { BoilerOutput, SSMTOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-cost-table',
  templateUrl: './cost-table.component.html',
  styleUrls: ['./cost-table.component.css']
})
export class CostTableComponent implements OnInit {
  @Input()
  inputData: SSMTInputs;
  @Input()
  outputData: SSMTOutput;
  @Input()
  settings: Settings;
  
  constructor() { }

  ngOnInit() {
  }

}
