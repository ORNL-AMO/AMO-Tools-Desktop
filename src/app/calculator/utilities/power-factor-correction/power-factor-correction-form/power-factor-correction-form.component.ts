import { Component, OnInit } from '@angular/core';
import { AdjustedOrActual, BilledForDemand, PowerFactorCorrectionInputs, PowerFactorCorrectionService } from '../power-factor-correction.service';
import { FormBuilder, FormGroup, UntypedFormGroup, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-power-factor-correction-form',
  templateUrl: './power-factor-correction-form.component.html',
  styleUrls: ['./power-factor-correction-form.component.css'],
  standalone: false
})
export class PowerFactorCorrectionFormComponent implements OnInit {
  form: UntypedFormGroup;
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

  BilledForDemand = BilledForDemand;
  AdjustedOrActual = AdjustedOrActual;

  constructor(private powerFactorCorrectionService: PowerFactorCorrectionService, private fb: FormBuilder) { }

  ngOnInit() {
    this.initForm();
    this.calculate();
  }

  initForm(inputs?: PowerFactorCorrectionInputs) {
    if (!inputs) {
      inputs = this.powerFactorCorrectionService.powerFactorInputs.getValue();
    }
    this.form = this.powerFactorCorrectionService.getApparentPowerAndPowerFactor(inputs);
  }

  calculate() {
    let updatedInput: PowerFactorCorrectionInputs = this.form.getRawValue();
    const results = this.powerFactorCorrectionService.getResults(updatedInput);
    this.powerFactorCorrectionService.powerFactorInputs.next(updatedInput);
    this.powerFactorCorrectionService.powerFactorOutputs.next(results);
  }

  btnResetData() {
    this.initForm(this.powerFactorCorrectionService.getDefaultEmptyInputs());
    this.calculate();
  }


  btnGenerateExample() {
    this.initForm(this.powerFactorCorrectionService.getExampleData());
    this.calculate();
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

  setBilledForDemand() {
    if (this.form.value.billedForDemand === 0) {
      this.form.value.minimumPowerFactor = 0.95;
    } else if (this.form.value.billedForDemand === 1) {
      this.form.value.targetPowerFactor = 0.95;
    }
    this.calculate();
  }

  setAdjustedOrActual() {
    if (this.form.value.adjustedOrActual === 2) {
      this.form.value.billedForDemand = 0;
    }
    this.calculate();
  }


  btnAddMonth() {
    this.monthyInputsFormArray.push(this.createMonthInputGroup());
    this.setMonthNames();
    this.calculate();
  }

  createMonthInputGroup(): FormGroup {
    return this.fb.group({
      'month': ['', Validators.required],
      'actualDemand': [null, Validators.required],
      'powerFactor': [null, Validators.required],
      'pfAdjustedDemand': [null, Validators.required]
    });
  }

  btnDeleteLastMonth() {
    this.monthyInputsFormArray.removeAt(this.monthyInputsFormArray.length - 1);
    this.calculate();
  }

  setMonthNames() {
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

  focusField(str: string) {
    this.powerFactorCorrectionService.currentField.next(str);
  }

  get monthyInputsFormArray(): FormArray {
    return this.form.get('monthyInputs') as FormArray;
  }

  get billedForDemand(): number {
    return this.form.value.billedForDemand;
  }

  get adjustedOrActual(): number {
    return this.form.value.adjustedOrActual;
  }

}