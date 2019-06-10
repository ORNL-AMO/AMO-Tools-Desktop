import { Component, OnInit, Input } from '@angular/core';
import { DeaeratorOutput, SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { SSMTInputs, BoilerInput } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-hover-deaerator-table',
  templateUrl: './hover-deaerator-table.component.html',
  styleUrls: ['./hover-deaerator-table.component.css']
})
export class HoverDeaeratorTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  outputData: SSMTOutput;
  @Input()
  inputData: SSMTInputs;

  deaerator: DeaeratorOutput;
  boilerInput: BoilerInput;
  constructor() { }

  ngOnInit() {
    this.deaerator = this.outputData.deaeratorOutput;
    this.boilerInput = this.inputData.boilerInput;
  }

}
