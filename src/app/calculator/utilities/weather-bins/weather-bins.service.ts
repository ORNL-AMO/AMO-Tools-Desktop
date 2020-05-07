import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Injectable()
export class WeatherBinsService {

  constructor(private formBuilder: FormBuilder) { }

  getDataSetupForm(): FormGroup {
    return this.formBuilder.group({
      'state': [],
      'city': [],
      'startDate': [],
      'endDate': []
    });
  }


}
