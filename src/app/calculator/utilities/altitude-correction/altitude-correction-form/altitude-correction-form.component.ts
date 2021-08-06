import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { AltitudeCorrectionService } from '../altitude-correction.service';

@Component({
  selector: 'app-altitude-correction-form',
  templateUrl: './altitude-correction-form.component.html',
  styleUrls: ['./altitude-correction-form.component.css']
})
export class AltitudeCorrectionFormComponent implements OnInit {
  @Input()
  settings: Settings;

  form: FormGroup;
  barometricPressure: number;

  resetFormSubscription: Subscription;
  generateFormSubscription: Subscription;
  altitudeCorrectionResultsSub: Subscription;

  constructor( private convertUnitsService: ConvertUnitsService, private altitudecorrectionService: AltitudeCorrectionService) { }

  ngOnInit() {
    this.initSubscriptions();
    this.save()
  }

  initSubscriptions() {
    this.resetFormSubscription = this.altitudecorrectionService.resetData.subscribe(value => {
      this.initForm();
    });
    this.generateFormSubscription = this.altitudecorrectionService.generateExample.subscribe(value => {
      this.initForm();
    })
    this.altitudeCorrectionResultsSub = this.altitudecorrectionService.altitudeCorrectionOutputs.subscribe(result => {
      this.barometricPressure = result;
    })
  }

  initForm(){
    let altitudeInput: number = this.altitudecorrectionService.altitudeCorrectionInputs.getValue();
    this.form = this.altitudecorrectionService.getFormFromObj(altitudeInput);
    this.save();
  }

  ngOnDestroy() {
    this.resetFormSubscription.unsubscribe();
    this.generateFormSubscription.unsubscribe();
  }

  save() {
   let updatedInputs: number = this.altitudecorrectionService.getObjFromForm(this.form);
   this.altitudecorrectionService.altitudeCorrectionInputs.next(updatedInputs);
  }

  calculateBarometricPressure() {
    let altitude = this.form.controls.altitude.value;
    if (this.settings.unitsOfMeasure != 'Metric') {
      altitude = this.convertUnitsService.value(altitude).from('ft').to('m');
    }
    let parensOp = 1 - .0000225577 * altitude;
    let exponentOp = Math.pow(parensOp, 5.2559);
    let barometricPressure = 101.325 * exponentOp;
    if (this.settings.unitsOfMeasure != 'Metric') {
      barometricPressure = this.convertUnitsService.value(barometricPressure).from('kPaa').to('inHg');
    }
    return barometricPressure;
  }

  setValidators() {
    //this.form = this.altitudecorrectionService.setValidators(this.form, this.settings);
    this.save();
  }

  getDisplayUnit(unit: any) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }

  focusField(str: string) {
    this.altitudecorrectionService.currentField.next(str);
  }

}
