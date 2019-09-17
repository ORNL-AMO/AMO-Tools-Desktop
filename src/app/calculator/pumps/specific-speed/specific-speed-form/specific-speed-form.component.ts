import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { pumpTypesConstant } from '../../../../psat/psatConstants';

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

  pumpTypes: Array<{value: number, display: string}>;

  constructor() { }

  ngOnInit() {
    this.pumpTypes = JSON.parse(JSON.stringify(pumpTypesConstant));
    //remove specified
    this.pumpTypes.pop();
  }



  emitCalculate() {
    this.calculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
}
