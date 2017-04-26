import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Settings, PsatSettings, PhastSettings } from '../shared/models/settings';
@Injectable()
export class SettingsService {

  constructor(private formBuilder: FormBuilder) { }

  getSettingsForm() {
    return this.formBuilder.group({
      'language': ['', Validators.required],
      'currency': ['', Validators.required],
      'unitsOfMeasure': ['', Validators.required]
    });
  }

  getFormFromSettings(settings: Settings){
    return this.formBuilder.group({
      'language': [settings.language, Validators.required],
      'currency': [settings.currency, Validators.required],
      'unitsOfMeasure': [settings.unitsOfMeasure, Validators.required]
    });
  }

  getSettingsFromForm(form: any){
    let tmpSettings: Settings  = {
      language: form.value.language,
      currency: form.value.currency,
      unitsOfMeasure: form.value.unitsOfMeasure
    };
    return tmpSettings;
  }
}
