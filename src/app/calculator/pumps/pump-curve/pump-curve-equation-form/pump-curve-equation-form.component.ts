import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, NgModel, FormsModule } from '@angular/forms';
import { PumpCurveForm, PumpCurveDataRow } from '../../../../shared/models/calculators';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-pump-curve-equation-form',
  templateUrl: './pump-curve-equation-form.component.html',
  styleUrls: ['./pump-curve-equation-form.component.css']
})
export class PumpCurveEquationFormComponent implements OnInit {
  @Input()
  pumpCurveForm: PumpCurveForm;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  isFan: boolean;

  orderOptions: Array<number> = [
    2, 3, 4, 5, 6
  ]

  warning: boolean = false;
  constantWarning: string = null;

  // maxFlow
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.emitCalculateChanges();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  emitCalculateChanges() {
    this.checkWarnings();
    if (this.warning) {

    }
    else {
      this.calculate.emit(true);
    }
  }

  checkWarnings() {
    if (this.pumpCurveForm.headConstant <= 0) {
      this.constantWarning = "Value must be greater than 0.";
      this.warning = true;
    }
    else {
      this.warning = false;
      this.constantWarning = null;
    }
  }

  setOrder() {
    if (this.pumpCurveForm.headOrder < 3) {
      this.pumpCurveForm.headFlow3 = 0;
    }
    if (this.pumpCurveForm.headOrder < 4) {
      this.pumpCurveForm.headFlow4 = 0;
    }
    if (this.pumpCurveForm.headOrder < 5) {
      this.pumpCurveForm.headFlow5 = 0;
    }
    if (this.pumpCurveForm.headOrder < 6) {
      this.pumpCurveForm.headFlow6 = 0;
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
