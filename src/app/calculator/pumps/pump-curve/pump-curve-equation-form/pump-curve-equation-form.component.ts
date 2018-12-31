import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, NgModel, FormsModule } from '@angular/forms';
import { PumpCurve, PumpCurveDataRow } from '../../../../shared/models/calculators';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-pump-curve-equation-form',
  templateUrl: './pump-curve-equation-form.component.html',
  styleUrls: ['./pump-curve-equation-form.component.css']
})
export class PumpCurveEquationFormComponent implements OnInit {
  @Input()
  pumpCurveForm: FormGroup;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;
  @Output('calculate')
  calculate = new EventEmitter<FormGroup>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  isFan: boolean;

  orderOptions: Array<number> = [
    2, 3, 4, 5, 6
  ]

  constantWarning: string = null;
  maxFlowWarning: string = null;

  // maxFlow
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.emitCalculateChanges();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  emitCalculateChanges() {
    // this.checkWarnings();
    if (this.constantWarning == null && this.maxFlowWarning == null) {
      this.calculate.emit(this.pumpCurveForm);
    }
  }


  checkWarnings() {
    // if (this.pumpCurveForm.controls.headConstant.value <= 0) {
    //   this.constantWarning = "Value must be greater than 0.";
    // }
    // else {
    //   this.constantWarning = null;
    // }
    // if (this.pumpCurveForm.controls.maxFlow > 1000000) {
    //   this.maxFlowWarning = "Value must not be greater than 1,000,000.";
    // }
    // else {
    //   this.maxFlowWarning = null;
    // }
  }

  setOrder() {
    if (this.pumpCurveForm.controls.headOrder.value + 2 < 3) {
      this.pumpCurveForm.controls.headFlow3.patchValue(0);
    }
    if (this.pumpCurveForm.controls.headOrder.value + 2 < 4) {
      this.pumpCurveForm.controls.headFlow4.patchValue(0);
    }
    if (this.pumpCurveForm.controls.headOrder.value + 2 < 5) {
      this.pumpCurveForm.controls.headFlow5.patchValue(0);
    }
    if (this.pumpCurveForm.controls.headOrder.value + 2 < 6) {
      this.pumpCurveForm.controls.headFlow6.patchValue(0);
    }
    this.emitCalculateChanges();
  }
  getDisplayUnit(unit: string) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }
}
