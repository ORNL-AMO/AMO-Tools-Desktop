import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-specific-speed-form',
  templateUrl: './specific-speed-form.component.html',
  styleUrls: ['./specific-speed-form.component.css']
})
export class SpecificSpeedFormComponent implements OnInit {
  @Input()
  speedForm: FormGroup;
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

  constructor() { }

  ngOnInit() {

  }



  emitCalculate() {
    this.calculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
}
