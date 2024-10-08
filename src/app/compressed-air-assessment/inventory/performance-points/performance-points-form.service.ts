import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CompressorInventoryItem, PerformancePoint, PerformancePoints, SystemInformation } from '../../../shared/models/compressed-air-assessment';
import { EqualToValidator } from '../../../shared/validators/equal-to';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { LessThanValidator } from '../../../shared/validators/less-than';

@Injectable()
export class PerformancePointsFormService {
  validationMessageMap: BehaviorSubject<ValidationMessageMap>;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.validationMessageMap = new BehaviorSubject<ValidationMessageMap>(undefined);
  }

  getPerformancePointFormFromObj(performancePoint: PerformancePoint, compressor: CompressorInventoryItem, pointName: 'fullLoad' | 'maxFullFlow' | 'noLoad' | 'blowoff' | 'unloadPoint' | 'midTurndown' | 'turndown', systemInformation: SystemInformation): UntypedFormGroup {
    let dischargePressureValidators: Array<ValidatorFn> = this.setDischargePressureValidators(performancePoint, compressor, pointName, systemInformation);
    let airflowValidators: Array<ValidatorFn> = this.setAirFlowValidators(performancePoint, compressor, pointName);
    let powerValidators: Array<ValidatorFn> = this.setPowerValidators(performancePoint, compressor, pointName);

    let form: UntypedFormGroup = this.formBuilder.group({
      dischargePressure: [performancePoint.dischargePressure, dischargePressureValidators],
      isDefaultPressure: [performancePoint.isDefaultPressure],
      airflow: [performancePoint.airflow, airflowValidators],
      isDefaultAirFlow: [performancePoint.isDefaultAirFlow],
      power: [performancePoint.power, powerValidators],
      isDefaultPower: [performancePoint.isDefaultPower],
    });

    if (pointName == 'blowoff' || (pointName == 'unloadPoint' &&
      (compressor.compressorControls.controlType == 8 || compressor.compressorControls.controlType == 10))) {
      form.controls.airflow.disable();
    }
    if (pointName == 'noLoad' && compressor.compressorControls.controlType == 6) {
      form.controls.dischargePressure.patchValue(0);
      form.controls.dischargePressure.disable();
    }

    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getPerformancePointObjFromForm(form: UntypedFormGroup): PerformancePoint {
    return {
      dischargePressure: form.controls.dischargePressure.value,
      isDefaultPressure: form.controls.isDefaultPressure.value,
      airflow: form.controls.airflow.value,
      isDefaultAirFlow: form.controls.isDefaultAirFlow.value,
      power: form.controls.power.value,
      isDefaultPower: form.controls.isDefaultPower.value,
    }
  }

  setPowerValidators(performancePoint: PerformancePoint, compressor: CompressorInventoryItem, pointName: 'fullLoad' | 'maxFullFlow' | 'noLoad' | 'blowoff' | 'unloadPoint' | 'midTurndown' | 'turndown') {
    let powerValidators: Array<ValidatorFn> = [Validators.required];
    // simplifies conditional display for control types having multiple of same validation   
    let validationMessages: ValidationMessageMap = {
      maxFullFlow: {
        greaterThan: undefined,
        min: undefined,
        max: undefined,
        lessThan: undefined,
        equalTo: undefined
      },
      noLoad: {
        greaterThan: undefined,
        min: undefined,
        max: undefined,
        lessThan: undefined,
        equalTo: undefined
      },
    };

    if (performancePoint.power !== null) {
      switch (pointName) {
        case 'fullLoad':
          powerValidators.push(GreaterThanValidator.greaterThan(0));
          break;
        case 'maxFullFlow':
          if (compressor.compressorControls.controlType == 3) {
            powerValidators.push(Validators.min(compressor.performancePoints.fullLoad.power));
          } else if (compressor.compressorControls.controlType == 8 || compressor.compressorControls.controlType == 10) {
            powerValidators.push(EqualToValidator.equalTo(compressor.performancePoints.fullLoad.power));
          } else {
            if (compressor.performancePoints.fullLoad.power) {
              powerValidators.push(Validators.min(compressor.performancePoints.fullLoad.power));
              validationMessages.maxFullFlow.min = `Value can't be less than Full Load Power (${compressor.performancePoints.fullLoad.power})`;
            } else {
              powerValidators.push(GreaterThanValidator.greaterThan(0));
              validationMessages.maxFullFlow.greaterThan = 'Value must be greater than 0';
            }
          }
          break;
        case 'noLoad':
          if (compressor.compressorControls.controlType == 1) {
            powerValidators.push(Validators.min(0), LessThanValidator.lessThan(compressor.performancePoints.fullLoad.power));
            validationMessages.noLoad.lessThan = `Value must be less than Full Load Power (${compressor.performancePoints.fullLoad.power})`;
          } else if (compressor.compressorControls.controlType == 6) {
            powerValidators.push(EqualToValidator.equalTo(0));
          } else if (compressor.compressorControls.controlType == 8 || compressor.compressorControls.controlType == 10) {
            powerValidators.push(Validators.min(0), LessThanValidator.lessThan(compressor.performancePoints.unloadPoint.power));
            validationMessages.noLoad.lessThan = `Value must be less than Unload Point Power (${compressor.performancePoints.unloadPoint.power})`;
          } else {
            powerValidators.push(GreaterThanValidator.greaterThan(0), LessThanValidator.lessThan(compressor.performancePoints.fullLoad.power))
            validationMessages.noLoad.lessThan = `Value must be less than Full Load Power (${compressor.performancePoints.fullLoad.power})`;
          }
          break;
        case 'unloadPoint':
          if (compressor.compressorControls.controlType == 2) {
            powerValidators.push(Validators.min(0));
          } else if (compressor.compressorControls.controlType == 3) {
            powerValidators.push(GreaterThanValidator.greaterThan(0), Validators.max(compressor.performancePoints.maxFullFlow.power))
          } else if (compressor.compressorControls.controlType == 8 || compressor.compressorControls.controlType == 10) {
            powerValidators.push(Validators.min(0), LessThanValidator.lessThan(compressor.performancePoints.fullLoad.power));
          }
          break;
        case 'blowoff':
          if (compressor.compressorControls.controlType == 7 || compressor.compressorControls.controlType == 9) {
            powerValidators.push(Validators.min(0), Validators.max(compressor.performancePoints.fullLoad.power));
          }
          break;
        default:
      }
    }
    this.validationMessageMap.next(validationMessages);
    return powerValidators;
  }

  setDischargePressureValidators(performancePoint: PerformancePoint, compressor: CompressorInventoryItem, pointName: 'fullLoad' | 'maxFullFlow' | 'noLoad' | 'blowoff' | 'unloadPoint' | 'midTurndown' | 'turndown', systemInformation: SystemInformation) {
    let pressureValidators: Array<ValidatorFn> = [Validators.required];

    if (performancePoint.dischargePressure !== null) {
      switch (pointName) {
        case 'fullLoad':
          if (systemInformation.multiCompressorSystemControls == 'isentropicEfficiency') {
            pressureValidators.push(Validators.min(systemInformation.plantMaxPressure));
          } else {
            pressureValidators.push(Validators.min(0));
          }
          break;
        case 'maxFullFlow':
          if (compressor.compressorControls.controlType == 4 || compressor.compressorControls.controlType == 5 || compressor.compressorControls.controlType == 6) {
            pressureValidators.push(GreaterThanValidator.greaterThan(compressor.performancePoints.fullLoad.dischargePressure));
          } else {
            pressureValidators.push(Validators.min(compressor.performancePoints.fullLoad.dischargePressure));
          }
          break;
        case 'noLoad':
          if (compressor.compressorControls.controlType == 6 || compressor.compressorControls.controlType == 8 || compressor.compressorControls.controlType == 10) {
            pressureValidators.push(EqualToValidator.equalTo(0));
          } else if (compressor.compressorControls.controlType == 1) {
            pressureValidators.push(GreaterThanValidator.greaterThan(compressor.performancePoints.fullLoad.dischargePressure));
          } else {
            pressureValidators.push(Validators.min(0), LessThanValidator.lessThan(compressor.performancePoints.fullLoad.dischargePressure));
          }
          break;
        case 'unloadPoint':
          if (compressor.compressorControls.controlType == 2) {
            pressureValidators.push(GreaterThanValidator.greaterThan(compressor.performancePoints.maxFullFlow.dischargePressure));
          } else if (compressor.compressorControls.controlType == 3 || compressor.compressorControls.controlType == 8 || compressor.compressorControls.controlType == 10) {
            pressureValidators.push(Validators.min(compressor.performancePoints.maxFullFlow.dischargePressure));
          }
          break;
        case 'blowoff':
          if (compressor.compressorControls.controlType == 7 || compressor.compressorControls.controlType == 9) {
            pressureValidators.push(EqualToValidator.equalTo(compressor.performancePoints.fullLoad.dischargePressure));
          }
          break;
        default:
      }
    }
    return pressureValidators;
  }

  setAirFlowValidators(performancePoint: PerformancePoint, compressor: CompressorInventoryItem, pointName: 'fullLoad' | 'maxFullFlow' | 'noLoad' | 'blowoff' | 'unloadPoint' | 'midTurndown' | 'turndown') {
    let airFlowValidators: Array<ValidatorFn> = [Validators.required];

    if (performancePoint.airflow !== null) {
      switch (pointName) {
        case 'fullLoad':
          airFlowValidators.push(Validators.min(0));
          break;
        case 'maxFullFlow':
          if (compressor.compressorControls.controlType == 2) {
            airFlowValidators.push(Validators.max(compressor.performancePoints.fullLoad.airflow), GreaterThanValidator.greaterThan(0));
          } else if (compressor.compressorControls.controlType == 5) {
            airFlowValidators.push(LessThanValidator.lessThan(compressor.performancePoints.fullLoad.airflow));
          } else if (compressor.compressorControls.controlType == 3) {
            airFlowValidators.push(EqualToValidator.equalTo(compressor.performancePoints.fullLoad.airflow));
          } else if (compressor.compressorControls.controlType == 4 || compressor.compressorControls.controlType == 6
            || compressor.compressorControls.controlType == 8 || compressor.compressorControls.controlType == 10) {
            airFlowValidators.push(Validators.min(0), Validators.max(compressor.performancePoints.fullLoad.airflow));
          }
          break;
        case 'noLoad':
          airFlowValidators.push(EqualToValidator.equalTo(0));
          break;
        case 'unloadPoint':
          // Control types 8 and 10 locked
          if (compressor.compressorControls.controlType != 8 && compressor.compressorControls.controlType != 10) {
            airFlowValidators.push(Validators.min(0));
          }
          break;
        case 'blowoff':
          // locked
          break;
        default:
      }
    }
    return airFlowValidators;
  }

  checkMotorServiceFactorExceededWarning(power: number, compressor: CompressorInventoryItem): PerformancePointWarnings {
    let motorServiceFactorExceeded: string = null;
    let motorServiceFactor: number = compressor.nameplateData.totalPackageInputPower * compressor.designDetails.serviceFactor;
    if (power > motorServiceFactor) {
      motorServiceFactorExceeded = `Power exceeds Motor Service Factor (${motorServiceFactor})`;
    }
    return {
      motorServiceFactorExceeded: motorServiceFactorExceeded
    }
  }

  checkPerformancePointsValid(compressor: CompressorInventoryItem, systemInformation: SystemInformation): boolean {
    let fullLoadForm: UntypedFormGroup = this.getPerformancePointFormFromObj(compressor.performancePoints.fullLoad, compressor, 'fullLoad', systemInformation);
    let isValid: boolean = fullLoadForm.valid;
    let showMaxFullFlow: boolean = this.checkShowMaxFlowPerformancePoint(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
    if (isValid && showMaxFullFlow) {
      let maxFlowForm: UntypedFormGroup = this.getPerformancePointFormFromObj(compressor.performancePoints.maxFullFlow, compressor, 'maxFullFlow', systemInformation);
      isValid = maxFlowForm.valid;
    }
    let showUnloadForm: boolean = this.checkShowUnloadPerformancePoint(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
    if (isValid && showUnloadForm) {
      let unloadForm: UntypedFormGroup = this.getPerformancePointFormFromObj(compressor.performancePoints.unloadPoint, compressor, 'unloadPoint', systemInformation);
      isValid = unloadForm.valid;
    }
    let showNoLoadForm: boolean = this.checkShowNoLoadPerformancePoint(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
    if (isValid && showNoLoadForm) {
      let noLoadForm: UntypedFormGroup = this.getPerformancePointFormFromObj(compressor.performancePoints.noLoad, compressor, 'noLoad', systemInformation);
      isValid = noLoadForm.valid;
    }
    let showBlowoff: boolean = this.checkShowBlowoffPerformancePoint(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
    if (isValid && showBlowoff) {
      let blowoffForm: UntypedFormGroup = this.getPerformancePointFormFromObj(compressor.performancePoints.blowoff, compressor, 'blowoff', systemInformation);
      isValid = blowoffForm.valid;
    }
    return isValid;
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

  checkShowMidTurndown(controlType: number): boolean {
    if (controlType !== 11) {
      return false;
    }
    return true;
  }

  checkShowTurndown(controlType: number): boolean {
    if (controlType !== 11) {
      return false;
    }
    return true;
  }

  checkShowUnloadPerformancePoint(compressorType: number, controlType: number): boolean {
    if (compressorType == 1 || compressorType == 2) {
      if (controlType == 2 || controlType == 3) {
        return true;
      }
    } else if (compressorType == 6 && (controlType == 8 || controlType == 10)) {
      return true;
    }
    return false;
  }

  checkShowNoLoadPerformancePoint(compressorType: number, controlType: number): boolean {
    if (compressorType == 6) {
      if (controlType == 7 || controlType == 9) {
        return false
      }
    }
    return true;
  }

  checkShowBlowoffPerformancePoint(compressorType: number, controlType: number): boolean {
    //centrifugal
    if (compressorType == 6) {
      //"with blowoff"
      if (controlType == 7 || controlType == 9) {
        return true;
      }
    }
    return false;
  }

  getCompressorPressureMinMax(controlType: number, performancePoints: PerformancePoints): { min: number, max: number } {
    let min: number = performancePoints.fullLoad.dischargePressure || 0;
    let max: number = 0;

    if (controlType == 2 || controlType == 3 || controlType == 8 || controlType == 10) {
      max = performancePoints.unloadPoint.dischargePressure;
    } else if (controlType == 1) {
      max = performancePoints.noLoad.dischargePressure;
    } else if (controlType == 6 || controlType == 4 || controlType == 5) {
      max = performancePoints.maxFullFlow.dischargePressure;
    } else if (controlType == 7 || controlType == 9) {
      max = performancePoints.blowoff.dischargePressure;
    } else if (controlType == 11) {
      max = performancePoints.turndown.dischargePressure;
    }
    return { min: min, max: max };
  }

  getPressureMinMax(inventoryItems: Array<CompressorInventoryItem>): { min: number, max: number } {
    let min: number;
    let max: number;
    inventoryItems.forEach(compressor => {
      let minMax: { min: number, max: number } = this.getCompressorPressureMinMax(compressor.compressorControls.controlType, compressor.performancePoints);
      if (min == undefined || minMax.min < min) {
        min = minMax.min;
      }
      if (max == undefined || minMax.max > max) {
        max = minMax.max;
      }
    });
    return {
      min: min,
      max: max
    }
  }




}


export interface ValidationMessages {
  greaterThan?: string,
  min?: string,
  max?: string,
  equalTo?: string,
  lessThan?: string
}
// // // Control types 1-6
export interface ValidationMessageMap {
  fullLoad?: ValidationMessages,
  maxFullFlow?: ValidationMessages,
  noLoad?: ValidationMessages,
  unloadPoint?: ValidationMessages,
  blowoff?: ValidationMessages,
}

export interface PerformancePointWarnings {
  motorServiceFactorExceeded?: string;
}

