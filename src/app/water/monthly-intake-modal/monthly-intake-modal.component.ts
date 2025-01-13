import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, UntypedFormArray, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MonthlyIntakeData } from '../../shared/models/water-assessment';
import { WaterSystemComponentService } from '../water-system-component.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-monthly-intake-modal',
  templateUrl: './monthly-intake-modal.component.html',
  styleUrl: './monthly-intake-modal.component.css'
})
export class MonthlyIntakeModalComponent {
  @Input()
  settings: Settings;
  @Input()
  monthlyIntake: MonthlyIntakeData[];

  @Output('emitMonthlyIntakeData')
  monthlyIntakeData = new EventEmitter<MonthlyIntakeData>();
  @ViewChild('monthlyIntakeModal', { static: false }) public monthlyIntakeModal: ModalDirective;
  
  monthlyIntakeForm: FormGroup;
  annualIntake: number;
  constructor(private formBuilder: FormBuilder, private waterSystemComponentService: WaterSystemComponentService) { }

  ngOnChanges() {
    if (!this.monthlyIntake) {
      this.monthlyIntake = this.getDefaultMonthlyIntake();
    }
    this.monthlyIntakeForm = this.getMonthlyIntakeForm(this.monthlyIntake);
    this.calculateAnnual(this.monthlyIntake);
  }

  ngAfterViewInit() {
    this.monthlyIntakeModal.show();
  }

  getMonthlyIntakeForm(monthlyIntake: MonthlyIntakeData[]): UntypedFormGroup {
    let monthlyIntakeControls: UntypedFormArray = new UntypedFormArray([]);
    monthlyIntake.forEach(intake => {
      monthlyIntakeControls.push(this.formBuilder.group({
        month: [intake.month, []],
        flow: [intake.flow, []],
      }))
    })

    let form: UntypedFormGroup = this.formBuilder.group({
      months: [monthlyIntakeControls],
    }, {
      validators: []
    });

    return form;
  }

  getMonthlyDataFromForm(): MonthlyIntakeData[] {
    return this.monthlyIntakeForm.controls.months.value.value;
  }

  getDefaultMonthlyIntake() {
    return [
      {month: 'January', flow: undefined },
      {month: 'February', flow: undefined },
      {month: 'March', flow: undefined },
      {month: 'April', flow: undefined },
      {month: 'May', flow: undefined },
      {month: 'June', flow: undefined },
      {month: 'July', flow: undefined },
      {month: 'August', flow: undefined },
      {month: 'September', flow: undefined },
      {month: 'October', flow: undefined },
      {month: 'November', flow: undefined },
      {month: 'December', flow: undefined },
    ]
  }

  getFormArray(control: AbstractControl): UntypedFormArray {
    return control as UntypedFormArray;
  }

  calculateAnnual(monthlyIntake: MonthlyIntakeData[]) {
    if (!monthlyIntake) {
      monthlyIntake = this.getMonthlyDataFromForm();
    }
    this.annualIntake = this.waterSystemComponentService.getAnnualUseFromMonthly(monthlyIntake);
  }

  close(shouldReset?: boolean) {
    if (!shouldReset) {  
      this.monthlyIntakeData.emit(this.monthlyIntakeForm.controls.months.value.value);
    }
    this.monthlyIntakeModal.hide();
  }
}
