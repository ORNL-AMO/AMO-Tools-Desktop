import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OtherData } from '../../../motor-inventory';

@Injectable()
export class OtherDataService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromOtherData(otherData: OtherData): FormGroup {
    return this.formBuilder.group({
      driveType: [otherData.driveType],
      isVFD: [otherData.isVFD],
      hasLoggerData: [otherData.hasLoggerData],
      voltageConnectionType: [otherData.voltageConnectionType]
    });
  }

  updateOtherDataFromForm(form: FormGroup, otherData: OtherData): OtherData {
    otherData.driveType = form.controls.frameNumber.value;
    otherData.isVFD = form.controls.frameNumber.value;
    otherData.hasLoggerData = form.controls.frameNumber.value;
    otherData.voltageConnectionType = form.controls.frameNumber.value;
    return otherData;
  }
}
