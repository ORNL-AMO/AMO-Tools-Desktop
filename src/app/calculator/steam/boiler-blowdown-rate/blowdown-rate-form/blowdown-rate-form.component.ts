import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { BoilerBlowdownRateService, BoilerBlowdownRateInputs } from '../boiler-blowdown-rate.service';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-blowdown-rate-form',
  templateUrl: './blowdown-rate-form.component.html',
  styleUrls: ['./blowdown-rate-form.component.css']
})
export class BlowdownRateFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;

  form: FormGroup;
  setFormSub: Subscription;
  constructor(private boilerBlowdownRateService: BoilerBlowdownRateService) { }

  ngOnInit() {
    this.setFormSub = this.boilerBlowdownRateService.setForms.subscribe(val => {
      this.setForm();
    });
  }

  ngOnDestroy() {
    this.setFormSub.unsubscribe();
  }

  setForm() {
    if (this.isBaseline == true) {
      let inputData: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.baselineInputs.getValue();
      this.form = this.boilerBlowdownRateService.getFormFromObj(inputData, this.settings);
    } else {
      let inputData: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.modificationInputs.getValue();
      this.form = this.boilerBlowdownRateService.getFormFromObj(inputData, this.settings);
    }
  }

  focusField(str: string) {
    this.boilerBlowdownRateService.currentField.next(str);
  }

  focusOut() {
    this.boilerBlowdownRateService.currentField.next('default');
  }

  save() {
    let inputData: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.getObjFromForm(this.form);
    if (this.isBaseline == true) {
      this.boilerBlowdownRateService.baselineInputs.next(inputData);
    } else {
      this.boilerBlowdownRateService.modificationInputs.next(inputData);
    }
  }
}
