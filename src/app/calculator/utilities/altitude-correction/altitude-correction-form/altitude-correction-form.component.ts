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
    this.altitudeCorrectionResultsSub.unsubscribe();
  }

  save() {
   let updatedInputs: number = this.altitudecorrectionService.getObjFromForm(this.form);
   this.altitudecorrectionService.altitudeCorrectionInputs.next(updatedInputs);
  }
  
  focusField(str: string) {
    this.altitudecorrectionService.currentField.next(str);
  }

}
