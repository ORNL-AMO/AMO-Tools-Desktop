import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PowerFactorCorrectionInputs } from '../power-factor-correction.component';

@Component({
  selector: 'app-power-factor-correction-form',
  templateUrl: './power-factor-correction-form.component.html',
  styleUrls: ['./power-factor-correction-form.component.css']
})
export class PowerFactorCorrectionFormComponent implements OnInit {
  
  // the @Input() decorator defines a variable that will be passed in from the parent
  //updates to this variable in the parent will update automatically in the child
  @Input()
  data: PowerFactorCorrectionInputs;
  @Output('changeField')
  changeField = new EventEmitter<string>();

  //the @Output decorator defines a variable as an output to the parent component
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<PowerFactorCorrectionInputs>();
  //to emit a change, we need to define an EventEmitter<Type>() to be able
  //to call .emit()

  constructor() { }

  ngOnInit() {
  }

  //this function should be called from the <input> or <select> html
  //elements when they are updated/changed
  calculate() {
    //.emit() will tell the parent to do something
    this.emitCalculate.emit(this.data);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
}
