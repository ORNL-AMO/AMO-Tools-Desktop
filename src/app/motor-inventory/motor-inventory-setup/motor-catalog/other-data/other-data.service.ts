import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { OtherData } from '../../../motor-inventory';

@Injectable()
export class OtherDataService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromOtherData(otherData: OtherData): UntypedFormGroup {
    return this.formBuilder.group({
      driveType: [otherData.driveType],
      isVFD: [otherData.isVFD],
      hasLoggerData: [otherData.hasLoggerData],
      voltageConnectionType: [otherData.voltageConnectionType]
    });
  }

  updateOtherDataFromForm(form: UntypedFormGroup, otherData: OtherData): OtherData {
    otherData.driveType = form.controls.driveType.value;
    otherData.isVFD = form.controls.isVFD.value;
    otherData.hasLoggerData = form.controls.hasLoggerData.value;
    otherData.voltageConnectionType = form.controls.voltageConnectionType.value;
    return otherData;
  }
}
