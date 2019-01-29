import { Component, OnInit, Input } from '@angular/core';
import { BoilerOutput, SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { BoilerInput, SSMTInputs } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-hover-boiler-table',
  templateUrl: './hover-boiler-table.component.html',
  styleUrls: ['./hover-boiler-table.component.css']
})
export class HoverBoilerTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  outputData: SSMTOutput;
  @Input()
  inputData: SSMTInputs;

  boiler: BoilerOutput;
  boilerInput: BoilerInput;
  constructor() { }

  ngOnInit() {
    this.boiler = this.outputData.boilerOutput;
    this.boilerInput = this.inputData.boilerInput;
  }

}
