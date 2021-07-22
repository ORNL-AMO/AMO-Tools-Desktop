import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CentrifugalSpecifics, CompressedAirAssessment, CompressedAirDayType, CompressorControls, CompressorInventoryItem, CompressorNameplateData, DesignDetails, InletConditions, PerformancePoint, PerformancePoints, ProfileSummaryData } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { FilterCompressorOptions } from './generic-compressor-modal/filter-compressors.pipe';

@Injectable()
export class InventoryService {

  selectedCompressor: BehaviorSubject<CompressorInventoryItem>;
  filterCompressorOptions: BehaviorSubject<FilterCompressorOptions>;
  collapseControls: boolean = false;
  collapseDesignDetails: boolean = true;
  collapseInletConditions: boolean = true;
  collapsePerformancePoints: boolean = true;
  constructor(private formBuilder: FormBuilder, private compressedAirAssessmentService: CompressedAirAssessmentService) {
    this.selectedCompressor = new BehaviorSubject<CompressorInventoryItem>(undefined);
    this.filterCompressorOptions = new BehaviorSubject<FilterCompressorOptions>(undefined);
  }

  getNewInventoryItem(): CompressorInventoryItem {
    return {
      itemId: Math.random().toString(36).substr(2, 9),
      name: 'New Compressor',
      description: undefined,
      modifiedDate: new Date(),
      nameplateData: {
        compressorType: undefined,
        motorPower: undefined,
        fullLoadOperatingPressure: undefined,
        fullLoadRatedCapacity: undefined,
        ratedLoadPower: undefined,
        ploytropicCompressorExponent: 1.4,
        fullLoadAmps: undefined,
        totalPackageInputPower: undefined
      },
      compressorControls: {
        controlType: undefined,
        unloadPointCapacity: 100,
        numberOfUnloadSteps: 2,
        automaticShutdown: false,
        unloadSumpPressure: 15
      },
      inletConditions: {
        atmosphericPressure: 14.7,
        temperature: undefined
      },
      designDetails: {
        blowdownTime: 40,
        modulatingPressureRange: undefined,
        inputPressure: undefined,
        designEfficiency: undefined,
        serviceFactor: 1.15,
        noLoadPowerFM: undefined,
        noLoadPowerUL: undefined,
        maxFullFlowPressure: undefined
      },
      centrifugalSpecifics: {
        surgeAirflow: undefined,
        maxFullLoadPressure: undefined,
        maxFullLoadCapacity: undefined,
        minFullLoadPressure: undefined,
        minFullLoadCapacity: undefined
      },
      performancePoints: {
        fullLoad: {
          dischargePressure: undefined,
          isDefaultPower: true,
          airflow: undefined,
          isDefaultAirFlow: true,
          power: undefined,
          isDefaultPressure: true
        },
        maxFullFlow: {
          dischargePressure: undefined,
          isDefaultPower: true,
          airflow: undefined,
          isDefaultAirFlow: true,
          power: undefined,
          isDefaultPressure: true
        },
        unloadPoint: {
          dischargePressure: undefined,
          isDefaultPower: true,
          airflow: undefined,
          isDefaultAirFlow: true,
          power: undefined,
          isDefaultPressure: true
        },
        noLoad: {
          dischargePressure: undefined,
          isDefaultPower: true,
          airflow: undefined,
          isDefaultAirFlow: true,
          power: undefined,
          isDefaultPressure: true
        },
        blowoff: {
          dischargePressure: undefined,
          isDefaultPower: true,
          airflow: undefined,
          isDefaultAirFlow: true,
          power: undefined,
          isDefaultPressure: true
        }
      }
    }
  }

  //general information
  getGeneralInformationFormFromObj(name: string, description: string): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [name, Validators.required],
      description: [description]
    });
    return form;
  }

  //CompressorNameplateData
  getNameplateDataFormFromObj(nameplateData: CompressorNameplateData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      compressorType: [nameplateData.compressorType, Validators.required],
      motorPower: [nameplateData.motorPower, Validators.required],
      fullLoadOperatingPressure: [nameplateData.fullLoadOperatingPressure, Validators.required],
      fullLoadRatedCapacity: [nameplateData.fullLoadRatedCapacity, Validators.required],
      ratedLoadPower: [nameplateData.ratedLoadPower],
      ploytropicCompressorExponent: [nameplateData.ploytropicCompressorExponent],
      fullLoadAmps: [nameplateData.fullLoadAmps],
      totalPackageInputPower: [nameplateData.totalPackageInputPower]
    });
    return form;
  }

  getNameplateDataFromFrom(form: FormGroup): CompressorNameplateData {
    return {
      compressorType: form.controls.compressorType.value,
      motorPower: form.controls.motorPower.value,
      fullLoadOperatingPressure: form.controls.fullLoadOperatingPressure.value,
      fullLoadRatedCapacity: form.controls.fullLoadRatedCapacity.value,
      ratedLoadPower: form.controls.ratedLoadPower.value,
      ploytropicCompressorExponent: form.controls.ploytropicCompressorExponent.value,
      fullLoadAmps: form.controls.fullLoadAmps.value,
      totalPackageInputPower: form.controls.totalPackageInputPower.value
    }
  }

  //CompressorControls
  getCompressorControlsFormFromObj(compressorControls: CompressorControls): FormGroup {
    // control type: 1 Inlet modulation without unloading
    // control type: 2 Inlet modulation with unloading
    // control type: 3 Variable displacement with unloading
    // control type: 4 Load/unload
    // control type: 6 Start/Stop
    // control type: 7 Multi-step unloading
    let form: FormGroup = this.formBuilder.group({
      controlType: [compressorControls.controlType, Validators.required],
      unloadPointCapacity: [compressorControls.unloadPointCapacity],
      numberOfUnloadSteps: [compressorControls.numberOfUnloadSteps],
      automaticShutdown: [compressorControls.automaticShutdown],
      unloadSumpPressure: [compressorControls.unloadSumpPressure]
    });
    form = this.setCompressorControlValidators(form);
    return form;
  }

  checkDisplayUnloadCapacity(controlType: number): boolean {
    return (controlType == 2 || controlType == 3 || controlType == 4 || controlType == 5 || controlType == 6);
  }

  checkDisplayAutomaticShutdown(controlType: number): boolean {
    return (controlType == 2 || controlType == 3 || controlType == 4 || controlType == 6);
  }

  setCompressorControlValidators(form: FormGroup): FormGroup {
    if (form.controls.controlType.value && (form.controls.controlType.value == 2 || form.controls.controlType.value == 3
      || form.controls.controlType.value == 4 || form.controls.controlType.value == 5 || form.controls.controlType.value == 6)) {
      form.controls.unloadPointCapacity.setValidators([Validators.required]);
      form.controls.numberOfUnloadSteps.setValidators([Validators.required]);
      if (form.controls.controlType.value != 5) {
        form.controls.automaticShutdown.setValidators([Validators.required]);
      } else {
        form.controls.automaticShutdown.setValidators([]);
      }
    } else {
      form.controls.automaticShutdown.setValidators([]);
      form.controls.unloadPointCapacity.setValidators([]);
      form.controls.numberOfUnloadSteps.setValidators([]);
    }
    form.controls.unloadPointCapacity.updateValueAndValidity();
    form.controls.numberOfUnloadSteps.updateValueAndValidity();
    form.controls.automaticShutdown.updateValueAndValidity();

    return form;
  }

  getCompressorControlsObjFromForm(form: FormGroup): CompressorControls {
    return {
      controlType: form.controls.controlType.value,
      unloadPointCapacity: form.controls.unloadPointCapacity.value,
      numberOfUnloadSteps: form.controls.numberOfUnloadSteps.value,
      automaticShutdown: form.controls.automaticShutdown.value,
      unloadSumpPressure: form.controls.unloadSumpPressure.value
    };
  }


  getCentrifugalFormFromObj(centrifugalSpecifics: CentrifugalSpecifics): FormGroup {
    //todo set validators base on compressor type
    let form: FormGroup = this.formBuilder.group({
      surgeAirflow: [centrifugalSpecifics.surgeAirflow, [Validators.required]],
      maxFullLoadPressure: [centrifugalSpecifics.maxFullLoadPressure, [Validators.required]],
      maxFullLoadCapacity: [centrifugalSpecifics.maxFullLoadCapacity, [Validators.required]],
      minFullLoadPressure: [centrifugalSpecifics.minFullLoadPressure, [Validators.required]],
      minFullLoadCapacity: [centrifugalSpecifics.minFullLoadCapacity, [Validators.required]],
    });
    return form;
  }

  getCentrifugalObjFromForm(form: FormGroup): CentrifugalSpecifics {
    return {
      surgeAirflow: form.controls.surgeAirflow.value,
      maxFullLoadPressure: form.controls.maxFullLoadPressure.value,
      maxFullLoadCapacity: form.controls.maxFullLoadCapacity.value,
      minFullLoadPressure: form.controls.minFullLoadPressure.value,
      minFullLoadCapacity: form.controls.minFullLoadCapacity.value,
    };
  }

  getDesignDetailsFormFromObj(designDetails: DesignDetails, compressorType: number, controlType: number): FormGroup {
    let blowdownTimeValidators: Array<ValidatorFn> = [];
    let displayBlowdownTime: boolean = this.checkDisplayBlowdownTime(compressorType, controlType);
    if (displayBlowdownTime) {
      blowdownTimeValidators = [Validators.required];
    }

    let modulatingPressureValidators: Array<Validators> = [];
    let displayModulation: boolean = this.checkDisplayModulation(controlType);
    if (displayModulation) {
      modulatingPressureValidators = [Validators.required];
    }
    //todo set validators based on control and comp type
    let form: FormGroup = this.formBuilder.group({
      blowdownTime: [designDetails.blowdownTime, blowdownTimeValidators],
      modulatingPressureRange: [designDetails.modulatingPressureRange, modulatingPressureValidators],
      inputPressure: [designDetails.inputPressure],
      designEfficiency: [designDetails.designEfficiency],
      serviceFactor: [designDetails.serviceFactor],
      noLoadPowerFM: [designDetails.noLoadPowerFM],
      noLoadPowerUL: [designDetails.noLoadPowerUL],
      maxFullFlowPressure: [designDetails.maxFullFlowPressure]
    });
    return form;
  }

  getDesignDetailsObjFromForm(form: FormGroup): DesignDetails {
    return {
      blowdownTime: form.controls.blowdownTime.value,
      modulatingPressureRange: form.controls.modulatingPressureRange.value,
      inputPressure: form.controls.inputPressure.value,
      designEfficiency: form.controls.designEfficiency.value,
      serviceFactor: form.controls.serviceFactor.value,
      noLoadPowerFM: form.controls.noLoadPowerFM.value,
      noLoadPowerUL: form.controls.noLoadPowerUL.value,
      maxFullFlowPressure: form.controls.maxFullFlowPressure.value
    }
  }

  checkDisplayBlowdownTime(compressorType: number, controlType: number): boolean {
    //"lubricant-injected rotary screws"
    if (compressorType == 1 || compressorType == 2) {
      //has word "unloading"
      if (controlType == 1 || controlType == 2 || controlType == 3) {
        return true;
      }
    }
    return false;
  }

  checkDisplayUnloadSlumpPressure(compressorType: number, controlType: number): boolean {
    //"lubricant-injected rotary screws"
    //controlType "load/unload"
    if ((compressorType == 1 || compressorType == 2) && controlType == 4) {
      return true;
    }
    return false;
  }

  checkDisplayModulation(controlType: number): boolean {
    //any control type with "modulation"
    if (controlType == 1 || controlType == 2 || controlType == 7 || controlType == 8 || controlType == 9 || controlType == 10) {
      return true;
    }
    return false;
  }



  getPerformancePointFormFromObj(performancePoint: PerformancePoint): FormGroup {
    //todo validators
    let form: FormGroup = this.formBuilder.group({
      dischargePressure: [performancePoint.dischargePressure, Validators.required],
      isDefaultPressure: [performancePoint.isDefaultPressure],
      airflow: [performancePoint.airflow, Validators.required],
      isDefaultAirFlow: [performancePoint.isDefaultAirFlow],
      power: [performancePoint.power, Validators.required],
      isDefaultPower: [performancePoint.isDefaultPower],
    });
    return form;
  }

  getPerformancePointObjFromForm(form: FormGroup): PerformancePoint {
    return {
      dischargePressure: form.controls.dischargePressure.value,
      isDefaultPressure: form.controls.isDefaultPressure.value,
      airflow: form.controls.airflow.value,
      isDefaultAirFlow: form.controls.isDefaultAirFlow.value,
      power: form.controls.power.value,
      isDefaultPower: form.controls.isDefaultPower.value,
    }
  }

  getInletConditionsFormFromObj(inletConditions: InletConditions): FormGroup {
    //todo validators
    let form: FormGroup = this.formBuilder.group({
      atmosphericPressure: [inletConditions.atmosphericPressure, Validators.required],
      temperature: [inletConditions.temperature],
    });
    return form;
  }

  getInletConditionsObjFromForm(form: FormGroup): InletConditions {
    return {
      atmosphericPressure: form.controls.atmosphericPressure.value,
      temperature: form.controls.temperature.value
    }
  }


  isCompressorValid(compressor: CompressorInventoryItem): boolean {
    let nameplateForm: FormGroup = this.getNameplateDataFormFromObj(compressor.nameplateData);
    let compressorControlsForm: FormGroup = this.getCompressorControlsFormFromObj(compressor.compressorControls);
    let designDetailsForm: FormGroup = this.getDesignDetailsFormFromObj(compressor.designDetails, compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
    let inletConditionsForm: FormGroup = this.getInletConditionsFormFromObj(compressor.inletConditions);
    let centrifugalSpecsValid: boolean = this.checkCentrifugalSpecsValid(compressor);
    let performancePointsValid: boolean = this.checkPerformancePointsValid(compressor);
    return nameplateForm.valid && compressorControlsForm.valid && designDetailsForm.valid && centrifugalSpecsValid && inletConditionsForm.valid && performancePointsValid;
  }

  checkCentrifugalSpecsValid(compressor: CompressorInventoryItem): boolean {
    if (compressor.nameplateData.compressorType == 6) {
      let form: FormGroup = this.getCentrifugalFormFromObj(compressor.centrifugalSpecifics);
      return form.valid;
    }
    return true;
  }

  checkPerformancePointsValid(compressor: CompressorInventoryItem): boolean {
    let fullLoadForm: FormGroup = this.getPerformancePointFormFromObj(compressor.performancePoints.fullLoad);
    let isValid: boolean = fullLoadForm.valid;
    let showMaxFullFlow: boolean = this.checkShowMaxFlowPerformancePoint(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
    if (isValid && showMaxFullFlow) {
      let maxFlowForm: FormGroup = this.getPerformancePointFormFromObj(compressor.performancePoints.maxFullFlow);
      isValid = maxFlowForm.valid;
    }
    let showUnloadForm: boolean = this.checkShowUnloadPerformancePoint(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
    if (isValid && showUnloadForm) {
      let unloadForm: FormGroup = this.getPerformancePointFormFromObj(compressor.performancePoints.unloadPoint);
      isValid = unloadForm.valid;
    }
    let showNoLoadForm: boolean = this.checkShowNoLoadPerformancePoint(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
    if (isValid && showNoLoadForm) {
      let noLoadForm: FormGroup = this.getPerformancePointFormFromObj(compressor.performancePoints.noLoad);
      isValid = noLoadForm.valid;
    }
    let showBlowoff: boolean = this.checkShowBlowoffPerformancePoint(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
    if (isValid && showBlowoff) {
      let blowoffForm: FormGroup = this.getPerformancePointFormFromObj(compressor.performancePoints.blowoff);
      isValid = blowoffForm.valid;
    }
    return isValid;
  }

  checkShowMaxFlowPerformancePoint(compressorType: number, controlType: number): boolean {
    if (compressorType == 6 && (controlType == 7 || controlType == 9)) {
      return false;
    } else if (compressorType == 1 || compressorType == 2) {
      if (controlType == 1) {
        return false;
      }
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

  addNewCompressor() {
    let newInventoryItem: CompressorInventoryItem = this.getNewInventoryItem();
    newInventoryItem.modifiedDate = new Date();
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    compressedAirAssessment.compressorInventoryItems.push(newInventoryItem);
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      compressedAirAssessment.systemProfile.profileSummary.push({
        compressorId: newInventoryItem.itemId,
        compressorName: newInventoryItem.name,
        dayTypeId: dayType.dayTypeId,
        profileSummaryData: this.getEmptyProfileSummaryData(),
        fullLoadPressure: newInventoryItem.performancePoints.fullLoad.dischargePressure
      });
    })
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.selectedCompressor.next(newInventoryItem);
  }

  addNewDayType(compressedAirAssessment: CompressedAirAssessment, dayTypeName: string, dayTypeId?: string): CompressedAirAssessment {
    if (!dayTypeId) {
      dayTypeId = Math.random().toString(36).substr(2, 9);
    }
    let newDayType: CompressedAirDayType = {
      dayTypeId: dayTypeId,
      name: dayTypeName,
      numberOfDays: 0,
      profileDataType: "percentCapacity"
    };
    compressedAirAssessment.compressedAirDayTypes.push(newDayType);
    compressedAirAssessment.compressorInventoryItems.forEach(item => {
      compressedAirAssessment.systemProfile.profileSummary.push({
        compressorId: item.itemId,
        compressorName: item.name,
        dayTypeId: newDayType.dayTypeId,
        profileSummaryData: this.getEmptyProfileSummaryData(),
        fullLoadPressure: item.performancePoints.fullLoad.dischargePressure
      })
    });
    return compressedAirAssessment;
  }

  getEmptyProfileSummaryData(): Array<ProfileSummaryData> {
    let summaryData: Array<ProfileSummaryData> = new Array();
    for (let i = 0; i < 24; i++) {
      summaryData.push({
        power: undefined,
        airflow: undefined,
        percentCapacity: undefined,
        timeInterval: i,
        percentPower: undefined,
        percentSystemCapacity: undefined,
        order: 0
      })
    }
    return summaryData;
  }

  getEmptyOrders(): Array<number> {
    let emptyOrders: Array<number> = new Array();
    for (let i = 0; i < 24; i++) {
      emptyOrders.push(0)
    }
    return emptyOrders;
  }
}
