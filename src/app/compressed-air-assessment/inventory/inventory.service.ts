import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CentrifugalSpecifics, CompressedAirAssessment, CompressedAirDayType, CompressorControls, CompressorInventoryItem, CompressorNameplateData, DesignDetails, InletConditions, PerformancePoint, PerformancePoints, ProfileSummary, ProfileSummaryData, ReduceRuntimeData } from '../../shared/models/compressed-air-assessment';
import { GreaterThanValidator } from '../../shared/validators/greater-than';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { ExploreOpportunitiesService } from '../explore-opportunities/explore-opportunities.service';
import { FilterCompressorOptions } from './generic-compressor-modal/filter-compressors.pipe';
import { PerformancePointsFormService } from './performance-points/performance-points-form.service';

@Injectable()
export class InventoryService {

  selectedCompressor: BehaviorSubject<CompressorInventoryItem>;
  filterCompressorOptions: BehaviorSubject<FilterCompressorOptions>;
  collapseControls: boolean = false;
  collapseDesignDetails: boolean = true;
  collapseInletConditions: boolean = true;
  collapsePerformancePoints: boolean = true;
  constructor(private formBuilder: FormBuilder, private performancePointsFormService: PerformancePointsFormService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private exploreOpportunitiesService: ExploreOpportunitiesService) {
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
      motorPower: [nameplateData.motorPower, [Validators.min(0)]],
      fullLoadOperatingPressure: [nameplateData.fullLoadOperatingPressure, [Validators.required, Validators.min(0)]],
      fullLoadRatedCapacity: [nameplateData.fullLoadRatedCapacity, [Validators.required, Validators.min(0)]],
      ratedLoadPower: [nameplateData.ratedLoadPower],
      ploytropicCompressorExponent: [nameplateData.ploytropicCompressorExponent],
      fullLoadAmps: [nameplateData.fullLoadAmps, Validators.min(0)],
      totalPackageInputPower: [nameplateData.totalPackageInputPower, Validators.required]
    });
    this.markFormDirtyToDisplayValidation(form);
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
  getCompressorControlsFormFromObj(compressorControls: CompressorControls, compressorType: number): FormGroup {
    // Master control type list in inventoryOptions.ts 
    let unloadSumpPressureValidators: Array<Validators> = [];
    let showUnloadSumpPressure: boolean = this.checkDisplayUnloadSlumpPressure(compressorType);
    if (showUnloadSumpPressure) {
      unloadSumpPressureValidators = [Validators.required];
    }

    let form: FormGroup = this.formBuilder.group({
      controlType: [compressorControls.controlType, Validators.required],
      unloadPointCapacity: [compressorControls.unloadPointCapacity],
      numberOfUnloadSteps: [compressorControls.numberOfUnloadSteps],
      automaticShutdown: [compressorControls.automaticShutdown],
      unloadSumpPressure: [compressorControls.unloadSumpPressure, unloadSumpPressureValidators]
    });
    form = this.setCompressorControlValidators(form);
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  checkDisplayUnloadCapacity(controlType: number): boolean {
    return (controlType == 2 || controlType == 3 || controlType == 4 || controlType == 5 || controlType == 6);
  }

  checkDisplayAutomaticShutdown(controlType: number): boolean {
    return (controlType != undefined && controlType != 5 && controlType != 7 && controlType != 9 && controlType != 1);
  }

  setCompressorControlValidators(form: FormGroup): FormGroup {
    if (form.controls.controlType.value && (form.controls.controlType.value == 2 || form.controls.controlType.value == 3
      || form.controls.controlType.value == 4 || form.controls.controlType.value == 5 || form.controls.controlType.value == 6)) {
      form.controls.unloadPointCapacity.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      form.controls.numberOfUnloadSteps.setValidators([Validators.required, Validators.min(0), Validators.max(5)]);
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


  getCentrifugalFormFromObj(compressor: CompressorInventoryItem): FormGroup {
    //todo set validators base on compressor type
    let surgeAirFlowValidators: Array<ValidatorFn> = this.setSurgeAirFlowValidators(compressor);
    let maxFullLoadPressureValidators: Array<ValidatorFn> = this.setMaxFullLoadPressureValidators(compressor.centrifugalSpecifics);
    let maxFullLoadCapacityValidators: Array<ValidatorFn> = this.setMaxFullLoadCapacityValidators(compressor);
    let minFullLoadPressureValidators: Array<ValidatorFn> = this.setMinFullLoadPressureValidators(compressor.centrifugalSpecifics);

    let form: FormGroup = this.formBuilder.group({
      surgeAirflow: [compressor.centrifugalSpecifics.surgeAirflow, surgeAirFlowValidators],
      maxFullLoadPressure: [compressor.centrifugalSpecifics.maxFullLoadPressure, maxFullLoadPressureValidators],
      maxFullLoadCapacity: [compressor.centrifugalSpecifics.maxFullLoadCapacity, maxFullLoadCapacityValidators],
      minFullLoadPressure: [compressor.centrifugalSpecifics.minFullLoadPressure, minFullLoadPressureValidators],
      minFullLoadCapacity: [compressor.centrifugalSpecifics.minFullLoadCapacity, [Validators.required, Validators.min(0)]]
    });

    for (let key in form.controls) {
      form.controls[key].markAsDirty();
    }
    return form;
  }

  markFormDirtyToDisplayValidation(form: FormGroup) {
    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
  }

  setSurgeAirFlowValidators(compressor: CompressorInventoryItem) {
    let surgeAirFlowValidators: Array<ValidatorFn>;
    if (compressor.centrifugalSpecifics.surgeAirflow) {
      surgeAirFlowValidators = [Validators.required, Validators.min(0), Validators.max(compressor.nameplateData.fullLoadRatedCapacity)];
    } else {
      surgeAirFlowValidators = [Validators.required]
    }
    return surgeAirFlowValidators;
  }

  setMaxFullLoadPressureValidators(centrifugalSpecifics: CentrifugalSpecifics) {
    let maxFullLoadPressureValidators: Array<ValidatorFn>;
    if (centrifugalSpecifics.maxFullLoadPressure) {
      maxFullLoadPressureValidators = [Validators.required, Validators.min(centrifugalSpecifics.minFullLoadPressure)];
    } else {
      maxFullLoadPressureValidators = [Validators.required]
    }
    return maxFullLoadPressureValidators;
  }

  setMaxFullLoadCapacityValidators(compressor: CompressorInventoryItem) {
    let maxFullLoadCapacityValidators: Array<ValidatorFn>;
    if (compressor.centrifugalSpecifics.maxFullLoadCapacity) {
      maxFullLoadCapacityValidators = [Validators.required, Validators.min(0), Validators.max(compressor.nameplateData.fullLoadRatedCapacity)];
    } else {
      maxFullLoadCapacityValidators = [Validators.required]
    }
    return maxFullLoadCapacityValidators;
  }

  setMinFullLoadPressureValidators(centrifugalSpecifics: CentrifugalSpecifics) {
    let minFullLoadPressureValidators: Array<ValidatorFn>;
    if (centrifugalSpecifics.surgeAirflow) {
      minFullLoadPressureValidators = [Validators.required, Validators.min(0), Validators.max(centrifugalSpecifics.surgeAirflow)];
    } else {
      minFullLoadPressureValidators = [Validators.required]
    }
    return minFullLoadPressureValidators;
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
      blowdownTimeValidators = [Validators.required, Validators.min(0)];
    }

    let modulatingPressureValidators: Array<Validators> = [];
    let displayModulation: boolean = this.checkDisplayModulation(controlType);
    if (displayModulation) {
      modulatingPressureValidators = [Validators.required, Validators.min(0)];
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
      maxFullFlowPressure: [designDetails.maxFullFlowPressure, Validators.required]
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }


  checkWarnings(compressor: CompressorInventoryItem): CompressorInventoryItemWarnings {
    let serviceFactorWarning: string = null;
    if (compressor.designDetails.serviceFactor > 2) {
      serviceFactorWarning = 'Service factor is typically around 1.15 or less than 2';
    }
    return {
      serviceFactor: serviceFactorWarning,
    }
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
      if (controlType == 1 || controlType == 2 || controlType == 3 || controlType == 4 || controlType == 5) {
        return true;
      }
    }
    return false;
  }

  checkDisplayUnloadSlumpPressure(compressorType: number): boolean {
    //"lubricant-injected rotary screws"
    //controlType "load/unload"
    if (compressorType == 1 || compressorType == 2) {
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

  checkDisplayNoLoadPowerFM(compressorType: number, controlType: number): boolean {
    let showNoLoad: boolean = this.performancePointsFormService.checkShowNoLoadPerformancePoint(compressorType, controlType)
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
    let showNoLoad: boolean = this.performancePointsFormService.checkShowNoLoadPerformancePoint(compressorType, controlType)
    if (showNoLoad) {
      if (controlType != 1 && controlType != 5) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getInletConditionsFormFromObj(inletConditions: InletConditions): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      temperature: [inletConditions.temperature, [Validators.required, Validators.min(0), Validators.max(1000)]],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getInletConditionsObjFromForm(form: FormGroup): InletConditions {
    return {
      temperature: form.controls.temperature.value
    }
  }

  isCompressorValid(compressor: CompressorInventoryItem): boolean {
    let nameplateForm: FormGroup = this.getNameplateDataFormFromObj(compressor.nameplateData);
    let compressorControlsForm: FormGroup = this.getCompressorControlsFormFromObj(compressor.compressorControls, compressor.nameplateData.compressorType);
    let designDetailsForm: FormGroup = this.getDesignDetailsFormFromObj(compressor.designDetails, compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
    let inletConditionsForm: FormGroup = this.getInletConditionsFormFromObj(compressor.inletConditions);
    let centrifugalSpecsValid: boolean = this.checkCentrifugalSpecsValid(compressor);
    let performancePointsValid: boolean = this.performancePointsFormService.checkPerformancePointsValid(compressor);
    return nameplateForm.valid && compressorControlsForm.valid && designDetailsForm.valid && centrifugalSpecsValid && inletConditionsForm.valid && performancePointsValid;
  }

  hasValidCompressors() {
    let compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let hasValidCompressors: boolean = false;
    if (compressedAirAssessment.compressorInventoryItems.length > 0) {
      hasValidCompressors = compressedAirAssessment.compressorInventoryItems.every(compressorInventoryItem => this.isCompressorValid(compressorInventoryItem));
    }
    return hasValidCompressors;
  }

  checkCentrifugalSpecsValid(compressor: CompressorInventoryItem): boolean {
    if (compressor.nameplateData.compressorType == 6) {
      let form: FormGroup = this.getCentrifugalFormFromObj(compressor);
      return form.valid;
    }
    return true;
  }

  addNewCompressor(numberOfEntries: number) {
    let newInventoryItem: CompressorInventoryItem = this.getNewInventoryItem();
    newInventoryItem.modifiedDate = new Date();
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    compressedAirAssessment.compressorInventoryItems.push(newInventoryItem);
    let intervalData: Array<{ isCompressorOn: boolean, timeInterval: number }> = new Array();
    for (let i = 0; i < 24; i++) {
      intervalData.push({
        isCompressorOn: false,
        timeInterval: i
      })
    }
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      compressedAirAssessment.systemProfile.profileSummary.push({
        compressorId: newInventoryItem.itemId,
        dayTypeId: dayType.dayTypeId,
        profileSummaryData: this.getEmptyProfileSummaryData(numberOfEntries),
        fullLoadPressure: newInventoryItem.performancePoints.fullLoad.dischargePressure,
        fullLoadCapacity: newInventoryItem.performancePoints.fullLoad.airflow
      });
      compressedAirAssessment.modifications.forEach(modification => {
        modification.reduceRuntime.runtimeData.push({
          compressorId: newInventoryItem.itemId,
          dayTypeId: dayType.dayTypeId,
          fullLoadCapacity: newInventoryItem.performancePoints.fullLoad.airflow,
          intervalData: intervalData,
          automaticShutdownTimer: newInventoryItem.compressorControls.automaticShutdown
        });
        modification.useAutomaticSequencer.order = 100;
        modification.useAutomaticSequencer.profileSummary = new Array();
        modification.adjustCascadingSetPoints.setPointData

        modification.adjustCascadingSetPoints.setPointData.push({
          compressorId: newInventoryItem.itemId,
          controlType: newInventoryItem.compressorControls.controlType,
          compressorType: newInventoryItem.nameplateData.compressorType,
          fullLoadDischargePressure: newInventoryItem.performancePoints.fullLoad.dischargePressure,
          maxFullFlowDischargePressure: newInventoryItem.performancePoints.maxFullFlow.dischargePressure
        })
      })
    });
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

    let reduceRuntimeData: ReduceRuntimeData;
    compressedAirAssessment.compressorInventoryItems.forEach(item => {
      let profileSummary: ProfileSummary = {
        compressorId: item.itemId,
        dayTypeId: newDayType.dayTypeId,
        profileSummaryData: this.getEmptyProfileSummaryData(compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval),
        fullLoadPressure: item.performancePoints.fullLoad.dischargePressure,
        fullLoadCapacity: item.performancePoints.fullLoad.airflow
      }

      compressedAirAssessment.systemProfile.profileSummary.push(profileSummary);

      let intervalData: Array<{
        isCompressorOn: boolean,
        timeInterval: number,
      }> = new Array();
      profileSummary.profileSummaryData.forEach(dataItem => {
        intervalData.push({
          isCompressorOn: dataItem.order != 0,
          timeInterval: dataItem.timeInterval
        })
      });
      reduceRuntimeData = {
        compressorId: item.itemId,
        fullLoadCapacity: item.performancePoints.fullLoad.airflow,
        intervalData: intervalData,
        dayTypeId: newDayType.dayTypeId,
        automaticShutdownTimer: item.compressorControls.automaticShutdown
      };
    });
    compressedAirAssessment.modifications.forEach(modification => {
      modification.improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => {
        item.reductionData.push({
          dayTypeName: dayTypeName,
          dayTypeId: dayTypeId,
          data: this.exploreOpportunitiesService.getDefaultReductionData(compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval)
        });
      });
      modification.reduceRuntime.runtimeData.push(reduceRuntimeData);
      modification.useAutomaticSequencer.order = 100;
      modification.useAutomaticSequencer.profileSummary = new Array();
    })
    return compressedAirAssessment;
  }

  getEmptyProfileSummaryData(numberOfEntries: number): Array<ProfileSummaryData> {
    let summaryData: Array<ProfileSummaryData> = new Array();
    for (let i = 0; i < numberOfEntries; i++) {
      summaryData.push({
        power: 0,
        airflow: 0,
        percentCapacity: 0,
        timeInterval: i,
        percentPower: undefined,
        percentSystemCapacity: undefined,
        percentSystemPower: undefined,
        order: 0
      })
    }
    return summaryData;
  }
}
export interface CompressorInventoryItemWarnings {
  serviceFactor?: string;
}

