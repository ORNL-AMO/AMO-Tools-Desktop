import { Injectable } from '@angular/core';
import { CompressedAirItem, CompressedAirPerformancePointsProperties, PerformancePoint, SystemInformation } from '../../../compressed-air-inventory';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';
import { EqualToValidator } from '../../../../shared/validators/equal-to';
import { LessThanValidator } from '../../../../shared/validators/less-than';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Injectable()
export class PerformancePointsCatalogService {

  validationMessageMap: BehaviorSubject<ValidationMessageMap>;

  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) {
    this.validationMessageMap = new BehaviorSubject<ValidationMessageMap>(undefined);
  }


  checkPerformancePointsValid(compressor: CompressedAirItem, systemInformation: SystemInformation): boolean {
    // let fullLoadForm: UntypedFormGroup = this.getPerformancePointFormFromObj(compressor.compressedAirPerformancePointsProperties.fullLoad, compressor, 'fullLoad', systemInformation);
    // let isValid: boolean = fullLoadForm.valid;
    // let showMaxFullFlow: boolean = this.checkShowMaxFlowPerformancePoint(compressor.nameplateData.compressorType, compressor.compressedAirControlsProperties.controlType);
    // if (isValid && showMaxFullFlow) {
    //   let maxFlowForm: UntypedFormGroup = this.getPerformancePointFormFromObj(compressor.compressedAirPerformancePointsProperties.maxFullFlow, compressor, 'maxFullFlow', systemInformation);
    //   isValid = maxFlowForm.valid;
    // }
    // let showUnloadForm: boolean = this.checkShowUnloadPerformancePoint(compressor.nameplateData.compressorType, compressor.compressedAirControlsProperties.controlType);
    // if (isValid && showUnloadForm) {
    //   let unloadForm: UntypedFormGroup = this.getPerformancePointFormFromObj(compressor.compressedAirPerformancePointsProperties.unloadPoint, compressor, 'unloadPoint', systemInformation);
    //   isValid = unloadForm.valid;
    // }
    // let showNoLoadForm: boolean = this.checkShowNoLoadPerformancePoint(compressor.nameplateData.compressorType, compressor.compressedAirControlsProperties.controlType);
    // if (isValid && showNoLoadForm) {
    //   let noLoadForm: UntypedFormGroup = this.getPerformancePointFormFromObj(compressor.compressedAirPerformancePointsProperties.noLoad, compressor, 'noLoad', systemInformation);
    //   isValid = noLoadForm.valid;
    // }
    // let showBlowoff: boolean = this.checkShowBlowoffPerformancePoint(compressor.nameplateData.compressorType, compressor.compressedAirControlsProperties.controlType);
    // if (isValid && showBlowoff) {
    //   let blowoffForm: UntypedFormGroup = this.getPerformancePointFormFromObj(compressor.compressedAirPerformancePointsProperties.blowoff, compressor, 'blowoff', systemInformation);
    //   isValid = blowoffForm.valid;
    // }
    // return isValid;
    return true;
  }

  checkMotorServiceFactorExceededWarning(power: number, compressor: CompressedAirItem): PerformancePointWarnings {
      let motorServiceFactorExceeded: string = null;
      let motorServiceFactor: number = compressor.nameplateData.totalPackageInputPower * compressor.compressedAirDesignDetailsProperties.serviceFactor;
      if (power > motorServiceFactor) {
        motorServiceFactorExceeded = `Power exceeds Motor Service Factor (${motorServiceFactor})`;
      }
      return {
        motorServiceFactorExceeded: motorServiceFactorExceeded
      }
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

  getPerformancePointFormFromObj(performancePoint: PerformancePoint, compressor: CompressedAirItem, pointName: 'fullLoad' | 'maxFullFlow' | 'noLoad' | 'blowoff' | 'unloadPoint' | 'midTurndown' | 'turndown', systemInformation?: SystemInformation): UntypedFormGroup {
    let dischargePressureValidators: Array<ValidatorFn> = this.setDischargePressureValidators(performancePoint, compressor, pointName);
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
      (compressor.compressedAirControlsProperties.controlType == 8 || compressor.compressedAirControlsProperties.controlType == 10))) {
      form.controls.airflow.disable();
    }
    if (pointName == 'noLoad' && compressor.compressedAirControlsProperties.controlType == 6) {
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


  setDischargePressureValidators(performancePoint: PerformancePoint, compressor: CompressedAirItem, pointName: 'fullLoad' | 'maxFullFlow' | 'noLoad' | 'blowoff' | 'unloadPoint' | 'midTurndown' | 'turndown', systemInformation?: SystemInformation) {
    let pressureValidators: Array<ValidatorFn> = [Validators.required];

    if (performancePoint.dischargePressure !== null) {
      switch (pointName) {
        // case 'fullLoad':
        //   //TODO: CA Inventory validation
        //   if (systemInformation.multiCompressorSystemControls == 'isentropicEfficiency') {
        //     pressureValidators.push(Validators.min(systemInformation.plantMaxPressure));
        //   } else {
        //     pressureValidators.push(Validators.min(0));
        //   }
        //   break;
        case 'maxFullFlow':
          if (compressor.compressedAirControlsProperties.controlType == 4 || compressor.compressedAirControlsProperties.controlType == 5 || compressor.compressedAirControlsProperties.controlType == 6) {
            pressureValidators.push(GreaterThanValidator.greaterThan(compressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure));
          } else {
            pressureValidators.push(Validators.min(compressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure));
          }
          break;
        case 'noLoad':
          if (compressor.compressedAirControlsProperties.controlType == 6 || compressor.compressedAirControlsProperties.controlType == 8 || compressor.compressedAirControlsProperties.controlType == 10) {
            pressureValidators.push(EqualToValidator.equalTo(0));
          } else if (compressor.compressedAirControlsProperties.controlType == 1) {
            pressureValidators.push(GreaterThanValidator.greaterThan(compressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure));
          } else {
            pressureValidators.push(Validators.min(0), LessThanValidator.lessThan(compressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure));
          }
          break;
        case 'unloadPoint':
          if (compressor.compressedAirControlsProperties.controlType == 2) {
            pressureValidators.push(GreaterThanValidator.greaterThan(compressor.compressedAirPerformancePointsProperties.maxFullFlow.dischargePressure));
          } else if (compressor.compressedAirControlsProperties.controlType == 3 || compressor.compressedAirControlsProperties.controlType == 8 || compressor.compressedAirControlsProperties.controlType == 10) {
            pressureValidators.push(Validators.min(compressor.compressedAirPerformancePointsProperties.maxFullFlow.dischargePressure));
          }
          break;
        case 'blowoff':
          if (compressor.compressedAirControlsProperties.controlType == 7 || compressor.compressedAirControlsProperties.controlType == 9) {
            pressureValidators.push(EqualToValidator.equalTo(compressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure));
          }
          break;
        default:
      }
    }
    return pressureValidators;
  }


  setAirFlowValidators(performancePoint: PerformancePoint, compressor: CompressedAirItem, pointName: 'fullLoad' | 'maxFullFlow' | 'noLoad' | 'blowoff' | 'unloadPoint' | 'midTurndown' | 'turndown') {
    let airFlowValidators: Array<ValidatorFn> = [Validators.required];

    if (performancePoint.airflow !== null) {
      switch (pointName) {
        case 'fullLoad':
          airFlowValidators.push(Validators.min(0));
          break;
        case 'maxFullFlow':
          if (compressor.compressedAirControlsProperties.controlType == 2) {
            airFlowValidators.push(Validators.max(compressor.compressedAirPerformancePointsProperties.fullLoad.airflow), GreaterThanValidator.greaterThan(0));
          } else if (compressor.compressedAirControlsProperties.controlType == 5) {
            airFlowValidators.push(LessThanValidator.lessThan(compressor.compressedAirPerformancePointsProperties.fullLoad.airflow));
          } else if (compressor.compressedAirControlsProperties.controlType == 3) {
            airFlowValidators.push(EqualToValidator.equalTo(compressor.compressedAirPerformancePointsProperties.fullLoad.airflow));
          } else if (compressor.compressedAirControlsProperties.controlType == 4 || compressor.compressedAirControlsProperties.controlType == 6
            || compressor.compressedAirControlsProperties.controlType == 8 || compressor.compressedAirControlsProperties.controlType == 10) {
            airFlowValidators.push(Validators.min(0), Validators.max(compressor.compressedAirPerformancePointsProperties.fullLoad.airflow));
          }
          break;
        case 'noLoad':
          airFlowValidators.push(EqualToValidator.equalTo(0));
          break;
        case 'unloadPoint':
          // Control types 8 and 10 locked
          if (compressor.compressedAirControlsProperties.controlType != 8 && compressor.compressedAirControlsProperties.controlType != 10) {
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

  setPowerValidators(performancePoint: PerformancePoint, compressor: CompressedAirItem, pointName: 'fullLoad' | 'maxFullFlow' | 'noLoad' | 'blowoff' | 'unloadPoint' | 'midTurndown' | 'turndown') {
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
          if (compressor.compressedAirControlsProperties.controlType == 3) {
            powerValidators.push(Validators.min(compressor.compressedAirPerformancePointsProperties.fullLoad.power));
          } else if (compressor.compressedAirControlsProperties.controlType == 8 || compressor.compressedAirControlsProperties.controlType == 10) {
            powerValidators.push(EqualToValidator.equalTo(compressor.compressedAirPerformancePointsProperties.fullLoad.power));
          } else {
            if (compressor.compressedAirPerformancePointsProperties.fullLoad.power) {
              powerValidators.push(Validators.min(compressor.compressedAirPerformancePointsProperties.fullLoad.power));
              validationMessages.maxFullFlow.min = `Value can't be less than Full Load Power (${compressor.compressedAirPerformancePointsProperties.fullLoad.power})`;
            } else {
              powerValidators.push(GreaterThanValidator.greaterThan(0));
              validationMessages.maxFullFlow.greaterThan = 'Value must be greater than 0';
            }
          }
          break;
        case 'noLoad':
          if (compressor.compressedAirControlsProperties.controlType == 1) {
            powerValidators.push(Validators.min(0), LessThanValidator.lessThan(compressor.compressedAirPerformancePointsProperties.fullLoad.power));
            validationMessages.noLoad.lessThan = `Value must be less than Full Load Power (${compressor.compressedAirPerformancePointsProperties.fullLoad.power})`;
          } else if (compressor.compressedAirControlsProperties.controlType == 6) {
            powerValidators.push(EqualToValidator.equalTo(0));
          } else if (compressor.compressedAirControlsProperties.controlType == 8 || compressor.compressedAirControlsProperties.controlType == 10) {
            powerValidators.push(Validators.min(0), LessThanValidator.lessThan(compressor.compressedAirPerformancePointsProperties.unloadPoint.power));
            validationMessages.noLoad.lessThan = `Value must be less than Unload Point Power (${compressor.compressedAirPerformancePointsProperties.unloadPoint.power})`;
          } else {
            powerValidators.push(GreaterThanValidator.greaterThan(0), LessThanValidator.lessThan(compressor.compressedAirPerformancePointsProperties.fullLoad.power))
            validationMessages.noLoad.lessThan = `Value must be less than Full Load Power (${compressor.compressedAirPerformancePointsProperties.fullLoad.power})`;
          }
          break;
        case 'unloadPoint':
          if (compressor.compressedAirControlsProperties.controlType == 2) {
            powerValidators.push(Validators.min(0));
          } else if (compressor.compressedAirControlsProperties.controlType == 3) {
            powerValidators.push(GreaterThanValidator.greaterThan(0), Validators.max(compressor.compressedAirPerformancePointsProperties.maxFullFlow.power))
          } else if (compressor.compressedAirControlsProperties.controlType == 8 || compressor.compressedAirControlsProperties.controlType == 10) {
            powerValidators.push(Validators.min(0), LessThanValidator.lessThan(compressor.compressedAirPerformancePointsProperties.fullLoad.power));
          }
          break;
        case 'blowoff':
          if (compressor.compressedAirControlsProperties.controlType == 7 || compressor.compressedAirControlsProperties.controlType == 9) {
            powerValidators.push(Validators.min(0), Validators.max(compressor.compressedAirPerformancePointsProperties.fullLoad.power));
          }
          break;
        default:
      }
    }
    this.validationMessageMap.next(validationMessages);
    return powerValidators;
  }

  calculateAirFlow(capacity: number, pointPressure: number, potentialPressure: number, atmosphericPressure: number, settings: Settings): number {
    let maxFullFlowAirFlow: number;
    if (settings.unitsOfMeasure == 'Metric') {
      atmosphericPressure = this.convertUnitsService.value(atmosphericPressure).from('kPaa').to('psia');
      capacity = this.convertUnitsService.value(capacity).from('m3/min').to('ft3/min');
      pointPressure = this.convertUnitsService.value(pointPressure).from('barg').to('psig');
      potentialPressure = this.convertUnitsService.value(potentialPressure).from('barg').to('psig');
      maxFullFlowAirFlow = (0.000258 * Math.pow(atmosphericPressure, 3) - 0.0116 * Math.pow(atmosphericPressure, 2) + .176 * atmosphericPressure + 0.09992) * capacity * (1 - 0.00075 * (pointPressure - potentialPressure));
      maxFullFlowAirFlow = this.convertUnitsService.value(maxFullFlowAirFlow).from('ft3/min').to('m3/min');
    } else {
      maxFullFlowAirFlow = (0.000258 * Math.pow(atmosphericPressure, 3) - 0.0116 * Math.pow(atmosphericPressure, 2) + .176 * atmosphericPressure + 0.09992) * capacity * (1 - 0.00075 * (pointPressure - potentialPressure));
    }

    return maxFullFlowAirFlow;
  }

  calculatePower(compressorType: number, inputPressure: number, performancePointPressure: number, ratedFullLoadOperatingPressure: number, TotPackageInputPower: number, atmosphericPressure: number, settings: Settings): number {
    let polytropicExponent: number = (1.4 - 1) / 1.4;
    let p1: number;
    let p2: number;
    if (settings.unitsOfMeasure == 'Metric') {
      atmosphericPressure = this.convertUnitsService.value(atmosphericPressure).from('kPaa').to('psia');
      inputPressure = this.convertUnitsService.value(inputPressure).from('barg').to('psig');
      performancePointPressure = this.convertUnitsService.value(performancePointPressure).from('barg').to('psig');
      ratedFullLoadOperatingPressure = this.convertUnitsService.value(ratedFullLoadOperatingPressure).from('barg').to('psig');
    }

    if (compressorType == 1 || compressorType == 2 || compressorType == 3) {
      //screw
      p1 = -.0000577 * Math.pow(atmosphericPressure, 3) + 0.000251 * Math.pow(atmosphericPressure, 2) + .0466 * atmosphericPressure + .4442;
      p2 = (performancePointPressure + inputPressure) / inputPressure;
    } else {
      p1 = (atmosphericPressure / inputPressure);
      p2 = (performancePointPressure + atmosphericPressure) / atmosphericPressure;
    }
    let p3: number = Math.pow(((ratedFullLoadOperatingPressure + inputPressure) / inputPressure), polytropicExponent) - 1;
    let maxFullFlowPower: number = p1 * (Math.pow(p2, polytropicExponent) - 1) / p3 * TotPackageInputPower;
    return maxFullFlowPower;
  }

  getCompressorPressureMinMax(controlType: number, performancePoints: CompressedAirPerformancePointsProperties): { min: number, max: number } {
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




}

export interface ValidationMessages {
  greaterThan?: string,
  min?: string,
  max?: string,
  equalTo?: string,
  lessThan?: string
}

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