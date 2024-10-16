import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MonthyInputs, PowerFactorCorrectionInputs } from '../power-factor-correction.component';
import { PowerFactorCorrectionService } from '../power-factor-correction.service';

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


  monthList: Array<{ value: number, name: string }> = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  constructor(private powerFactorCorrectionService: PowerFactorCorrectionService) { }

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
    if (this.data.adjustedOrActual === 2){
      this.data.billedForDemand = 0;
    }
    this.calculate();
  }

  btnAddMonth(){;
    let newMonthyInputs: MonthyInputs = {
      month: "new month",
      input1: 0,
      input2: 0,
      input3: 0
    }
    this.data.monthyInputs.push(newMonthyInputs);    
    this.setMonthNames();
    this.calculate();
  }

  btnDeleteMonth(index: number){
    this.data.monthyInputs.splice(index, 1);    
    this.calculate();
  }

  btnDeleteLastMonth(){
    this.data.monthyInputs.pop();    
    this.calculate();
  }

  setMonthNames(){
    let year = this.data.startYear;
    let monthNumber = this.data.startMonth;
    this.data.monthyInputs.forEach(month => {
      let monthName: string = this.monthList[monthNumber - 1].name;
      month.month = monthName + ' ' + year;
      monthNumber += 1;
      if(monthNumber == 13){
        monthNumber = 1;
        year += 1;
      }
    });
  }
  
}
