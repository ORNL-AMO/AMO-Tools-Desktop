import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
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
  @Input()
  disabled: boolean;

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.disabled && changes.disabled.firstChange == false) {
      if (this.disabled == true) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    }
  }

  setForm() {
    if (this.isBaseline == true) {
      let inputData: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.baselineInputs.getValue();
      this.form = this.boilerBlowdownRateService.getFormFromObj(inputData, this.settings);
    } else {
      let inputData: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.modificationInputs.getValue();
      if (inputData) {
        this.form = this.boilerBlowdownRateService.getFormFromObj(inputData, this.settings);
      }
    }
    if (this.disabled == true && this.form) {
      this.form.disable();
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
