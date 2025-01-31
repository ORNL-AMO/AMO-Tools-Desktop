import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CompressedAirDesignDetailsProperties } from '../../../compressed-air-inventory';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';

@Injectable()
export class DesignDetailsCatalogService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromDesignDetails(designDetails: CompressedAirDesignDetailsProperties, compressorType: number, controlType: number): FormGroup {
    let blowdownTimeValidators: Array<ValidatorFn> = [];
    let displayBlowdownTime: boolean = this.checkDisplayBlowdownTime(compressorType, controlType);
    if (displayBlowdownTime) {
      blowdownTimeValidators = [Validators.required, Validators.min(0)];
    }

    let modulatingPressureValidators: Array<Validators> = [];
    let displayModulation: boolean = this.checkDisplayModulation(controlType);
    if (displayModulation) {
      modulatingPressureValidators = [Validators.required, Validators.min(0)];
    }

    let maxFullFlowValidators: Array<Validators> = [];
    if (controlType !== 11) {
      modulatingPressureValidators = [Validators.required];
    }

    let noLoadPowerFMValidators: Array<Validators> = [];
    let displayNoLoadPowerFM: boolean = this.checkDisplayNoLoadPowerFM(compressorType, controlType);
    if (displayNoLoadPowerFM) {
      noLoadPowerFMValidators = [Validators.required];
    }

    let noLoadPowerULValidators: Array<Validators> = [];
    let displayNoLoadPowerUL: boolean = this.checkDisplayNoLoadPowerUL(compressorType, controlType);
    if (displayNoLoadPowerUL) {
      noLoadPowerULValidators = [Validators.required];
    }


    //todo set validators based on control and comp type
    let form: FormGroup = this.formBuilder.group({
      blowdownTime: [designDetails.blowdownTime, blowdownTimeValidators],
      modulatingPressureRange: [designDetails.modulatingPressureRange, modulatingPressureValidators],
      inputPressure: [designDetails.inputPressure, [Validators.required, Validators.min(0), Validators.max(16)]],
      designEfficiency: [designDetails.designEfficiency, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]],
      serviceFactor: [designDetails.serviceFactor, [Validators.required, Validators.min(1)]],
      noLoadPowerFM: [designDetails.noLoadPowerFM, noLoadPowerFMValidators],
      noLoadPowerUL: [designDetails.noLoadPowerUL, noLoadPowerULValidators],
      maxFullFlowPressure: [designDetails.maxFullFlowPressure, maxFullFlowValidators]
    });
    this.markFormDirtyToDisplayValidation(form);
    form.controls.modulatingPressureRange.disable();
    return form;
  }

  updateDesignDetailsFromForm(form: FormGroup, designDetails: CompressedAirDesignDetailsProperties): CompressedAirDesignDetailsProperties {
    designDetails.blowdownTime = form.controls.blowdownTime.value;
    designDetails.modulatingPressureRange = form.controls.modulatingPressureRange.value;
    designDetails.inputPressure = form.controls.inputPressure.value;
    designDetails.designEfficiency = form.controls.designEfficiency.value;
    designDetails.serviceFactor = form.controls.serviceFactor.value;
    designDetails.noLoadPowerFM = form.controls.noLoadPowerFM.value;
    designDetails.noLoadPowerUL = form.controls.noLoadPowerUL.value;
    designDetails.maxFullFlowPressure = form.controls.maxFullFlowPressure.value;
    return designDetails;
  }

  checkDisplayBlowdownTime(compressorType: number, controlType: number): boolean {
    //"lubricant-injected rotary screws"
    if (compressorType == 1 || compressorType == 2) {
      //has word "unloading"
      if (controlType == 1 || controlType == 2 || controlType == 3 || controlType == 4 || controlType == 5) {
        return true;
      }
    }
    return false;
  }

  checkDisplayModulation(controlType: number): boolean {
    //any control type with "modulation" (non-centrifugal) or variable displacement
    if (controlType == 1 || controlType == 2 || controlType == 3) {
      return true;
    }
    return false;
  }

  checkDisplayNoLoadPowerFM(compressorType: number, controlType: number): boolean {
    let showNoLoad: boolean = this.checkShowNoLoadPerformancePoint(compressorType, controlType)
    if (showNoLoad) {
      if (controlType == 1 || controlType == 2 || controlType == 3) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;

    }
  }

  checkDisplayNoLoadPowerUL(compressorType: number, controlType: number): boolean {
    let showNoLoad: boolean = this.checkShowNoLoadPerformancePoint(compressorType, controlType)
    if (showNoLoad) {
      if (controlType != 1 && controlType != 6) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  markFormDirtyToDisplayValidation(form: FormGroup) {
    for (let key in form.controls) {
      if (form.controls[key] && form.controls[key].value != undefined) {
        form.controls[key].markAsDirty();
      }
    }
  }

  checkShowNoLoadPerformancePoint(compressorType: number, controlType: number): boolean {
    if (compressorType == 6) {
      if (controlType == 7 || controlType == 9) {
        return false
      }
    }
    return true;
  }

  checkShowMaxFlowPerformancePoint(compressorType: number, controlType: number): boolean {
    if (compressorType == 6 && (controlType == 7 || controlType == 9)) {
      return false;
    }
    if (compressorType == 1 || compressorType == 2) {
      if (controlType == 1) {
        return false;
      }
    }
    if (controlType === 11) {
      return false;
    }
    return true;
  }


}