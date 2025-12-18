import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PowerFactorCorrectionInputs } from '../power-factor-correction.component';
import { PowerFactorCorrectionService } from '../power-factor-correction.service';
import { FormBuilder, FormGroup, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

@Component({
    selector: 'app-power-factor-correction-form',
    templateUrl: './power-factor-correction-form.component.html',
    styleUrls: ['./power-factor-correction-form.component.css'],
    standalone: false
})
export class PowerFactorCorrectionFormComponent implements OnInit {
  
  // the @Input() decorator defines a variable that will be passed in from the parent
  //updates to this variable in the parent will update automatically in the child
  @Input()
  data: PowerFactorCorrectionInputs;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  form: UntypedFormGroup;
  //the @Output decorator defines a variable as an output to the parent component
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<PowerFactorCorrectionInputs>();
  //to emit a change, we need to define an EventEmitter<Type>() to be able
  //to call .emit()
  minGreaterThanTargetError: boolean = false;

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
  

  constructor(private powerFactorCorrectionService: PowerFactorCorrectionService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this.powerFactorCorrectionService.getApparentPowerAndPowerFactor(this.data);
  }

  validatePowerFactorInputs() {
    let monthyInputs = this.form.get('monthyInputs') as FormArray;
    if (monthyInputs && monthyInputs.controls) {
      for (let group of monthyInputs.controls) {
        let input1 = group.get('input1')?.value;
        let input2 = group.get('input2')?.value;
          console.log(input1, input2);
        if (input1 >= input2) {
          this.minGreaterThanTargetError = true;
          return;
        } else {
          this.minGreaterThanTargetError = false;
          this.calculate();
          return;
        }
      }
    }
  }

  //elements when they are updated/changed
  calculate() {
    //.emit() will tell the parent to do something
    this.emitCalculate.emit(this.form.value);
  }

  updateStartingYear() {   
    if (this.form.value.startYear != null) {
      const updatedInputs = this.form.value.monthyInputs.map((input) => {
        if (input.month) {
          const monthOnly = input.month.split(' ')[0];
          return { ...input, month: `${monthOnly} ${this.form.value.startYear}` };
        }
        return input;
      });

      this.form.patchValue({ monthyInputs: updatedInputs });

      this.calculate();
    }
  }

  focusField(str: string) {
    this.data.monthyInputs = this.form.value.monthyInputs;
    this.changeField.emit(str);
  }

  setBilledForDemand(){
    if (this.form.value.billedForDemand === 0) {
      this.form.value.minimumPowerFactor = 0.95;
    } else if (this.form.value.billedForDemand === 1) {
      this.form.value.targetPowerFactor = 0.95;
    }
    this.calculate();
  }

  setAdjustedOrActual(){    
    if (this.form.value.adjustedOrActual === 2){
      this.form.value.billedForDemand = 0;
    }
    this.calculate();
  }

  // btnAddMonth(){;
  //   let newMonthyInputs: MonthyInputs = {
  //     month: "new month",
  //     input1: 0,
  //     input2: 0,
  //     input3: 0
  //   }
  //   this.data.monthyInputs.push(newMonthyInputs);    
  //   this.setMonthNames();
  //   this.calculate();
  // }

  btnAddMonth() {

    // let newMonthyInputs: MonthyInputs = {
    //   month: "new month",
    //   input1: 0,
    //   input2: 0,
    //   input3: 0
    // }
    this.monthyInputsFormArray.push(this.createMonthInputGroup());
    this.setMonthNames();
    this.calculate();
  }

  createMonthInputGroup(): FormGroup {
    return this.fb.group({
      'month': ['', Validators.required],
      'input1': [null, Validators.required],
      'input2': [null, Validators.required],
      'input3': [null, Validators.required]
    });
  }

  btnDeleteLastMonth(){
    this.monthyInputsFormArray.removeAt(this.monthyInputsFormArray.length - 1);
    this.calculate();
  }

  setMonthNames(){
    let year = this.form.value.startYear;
    let month = this.form.value.startMonth;
    this.monthyInputsFormArray.controls.forEach((group: FormGroup) => {
      if (month > 12) {
        month = 1;
        year++;
      }
      const monthName = this.monthList[month - 1].name;
      group.get('month')?.setValue(`${monthName} ${year}`);
      month++;
    });
  }

  get monthyInputsFormArray(): FormArray {
    return this.form.get('monthyInputs') as FormArray;
  }
  
}
