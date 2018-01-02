import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-specific-speed-form',
  templateUrl: './specific-speed-form.component.html',
  styleUrls: ['./specific-speed-form.component.css']
})
export class SpecificSpeedFormComponent implements OnInit {
  @Input()
  speedForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;

  pumpTypes: Array<string> = [
    'End Suction Slurry',
    'End Suction Sewage',
    'End Suction Stock',
    'API Double Suction',
    'Multistage Boiler Feed',
    'End Suction ANSI/API',
    'Axial Flow',
    'Double Suction',
    'Vertical Turbine',
    'Large End Suction',
    // When user selects below they need a way to provide the optimal efficiency
    //'Specified Optimal Efficiency'
  ];
  tmpPumpType: string;
  tmpPumpRpm: number;
  tmpFlowRate: number;
  tmpHead: number;
  constructor() { }

  ngOnInit() {
    if (this.speedForm) {
      this.tmpPumpType = this.speedForm.controls.pumpType.value;
      this.tmpPumpRpm = this.speedForm.controls.pumpRPM.value;
      this.tmpFlowRate = this.speedForm.controls.flowRate.value;
      this.tmpHead = this.speedForm.controls.head.value;
    }
  }



  emitCalculate() {
    this.speedForm.patchValue({
      pumpType: this.tmpPumpType,
      pumpRPM: this.tmpPumpRpm,
      flowRate: this.tmpFlowRate,
      head: this.tmpHead
    })
    this.calculate.emit(true);
  }
  focusField(str: string) {
    this.changeField.emit(str);
  }
}
