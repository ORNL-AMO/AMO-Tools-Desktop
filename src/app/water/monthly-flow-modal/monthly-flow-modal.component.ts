import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, UntypedFormGroup, UntypedFormArray, AbstractControl } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { WaterSystemComponentService } from '../water-system-component.service';
import { Settings } from '../../shared/models/settings';
import { MonthlyFlowData } from 'process-flow-lib';

@Component({
  selector: 'app-monthly-flow-modal',
  standalone: false,
  templateUrl: './monthly-flow-modal.component.html',
  styleUrl: './monthly-flow-modal.component.css'
})
export class MonthlyFlowModalComponent {
@Input()
  settings: Settings;
  @Input()
  monthlyFlow: MonthlyFlowData[];
  @Input()
  flowTypeTitle: string;
  @Output('emitMonthlyFlowData')
  monthlyFlowData = new EventEmitter<MonthlyFlowData>();
  @ViewChild('monthlyFlowModal', { static: false }) public monthlyFlowModal: ModalDirective;
  
  monthlyFlowForm: FormGroup;
  annualFlow: number;
  
  constructor(private formBuilder: FormBuilder, private waterSystemComponentService: WaterSystemComponentService) { }

  ngOnChanges() {
    if (!this.monthlyFlow) {
      this.monthlyFlow = this.getDefaultmonthlyFlow();
    }
    this.monthlyFlowForm = this.getmonthlyFlowForm(this.monthlyFlow);
    this.calculateAnnual(this.monthlyFlow);
  }

  ngAfterViewInit() {
    this.monthlyFlowModal.show();
  }

  getmonthlyFlowForm(monthlyFlow: MonthlyFlowData[]): UntypedFormGroup {
    let monthlyFlowControls: UntypedFormArray = new UntypedFormArray([]);
    monthlyFlow.forEach(intake => {
      monthlyFlowControls.push(this.formBuilder.group({
        month: [intake.month, []],
        flow: [intake.flow, []],
      }))
    })

    let form: UntypedFormGroup = this.formBuilder.group({
      months: [monthlyFlowControls],
    }, {
      validators: []
    });

    return form;
  }

  getMonthlyDataFromForm(): MonthlyFlowData[] {
    return this.monthlyFlowForm.controls.months.value.value;
  }

  getDefaultmonthlyFlow() {
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

  calculateAnnual(monthlyFlow: MonthlyFlowData[]) {
    if (!monthlyFlow) {
      monthlyFlow = this.getMonthlyDataFromForm();
    }
    this.annualFlow = this.waterSystemComponentService.getAnnualUseFromMonthly(monthlyFlow);
  }

  close(shouldReset?: boolean) {
    if (!shouldReset) {  
      this.monthlyFlowData.emit(this.monthlyFlowForm.controls.months.value.value);
    }
    this.monthlyFlowModal.hide();
  }
}
