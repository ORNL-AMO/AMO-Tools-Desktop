import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MonthyInputs, PowerFactorCorrectionInputs } from '../power-factor-correction.component';

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

 
  billedOptions: any = [
    {
      name: 'Real Power (kW)',
      value: 0,
    }, {
      name: 'Apperent Power (kVA)',
      value: 1,
    }
  ];

  demandOptions: any = [
    {
      name: 'Power Factor',
      value: 0,
    }, {
      name: 'Actual Demand',
      value: 1,
    }
  ];

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

  setBilledForDemand(){
    if (this.data.billedForDemand === 0) {
      this.data.minimumPowerFactor = 0.95;
    } else if (this.data.billedForDemand === 1) {
      this.data.targetPowerFactor = 0.95;
    }
    this.calculate();
  }

  setAdjustedOrActual(){    
    this.calculate();
  }

  btnAddMonth(){
    let newMonthyInputs: MonthyInputs = {
      input1: 0,
      input2: 0
    }
    this.data.monthyInputs.push(newMonthyInputs);    
    this.calculate();
  }

  btnDeleteMonth(index: number){
    this.data.monthyInputs.splice(index, 1);    
    this.calculate();
  }

  
}
