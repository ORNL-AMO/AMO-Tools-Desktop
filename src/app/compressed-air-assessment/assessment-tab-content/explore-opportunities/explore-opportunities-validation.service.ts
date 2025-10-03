import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AddPrimaryReceiverVolume, AdjustCascadingSetPoints, CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ImproveEndUseEfficiency, Modification, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal, ReduceAirLeaks, ReduceSystemAirPressure, SystemProfileSetup } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { AddReceiverVolumeService } from './explore-opportunities-form/add-receiver-volume/add-receiver-volume.service';
import { AdjustCascadingSetPointsService, CompressorForm } from './explore-opportunities-form/adjust-cascading-set-points/adjust-cascading-set-points.service';
import { ImproveEndUseEfficiencyService } from './explore-opportunities-form/improve-end-use-efficiency/improve-end-use-efficiency.service';
import { ReduceAirLeaksService } from './explore-opportunities-form/reduce-air-leaks/reduce-air-leaks.service';
import { ReduceRunTimeService } from './explore-opportunities-form/reduce-run-time/reduce-run-time.service';
import { ReduceSystemAirPressureService } from './explore-opportunities-form/reduce-system-air-pressure/reduce-system-air-pressure.service';
import { UseAutomaticSequencerService } from './explore-opportunities-form/use-automatic-sequencer/use-automatic-sequencer.service';
import { BaselineResults } from '../../calculations/caCalculationModels';
import { CompressedAirAssessmentModificationResults } from '../../calculations/modifications/CompressedAirAssessmentModificationResults';
import { CompressorInventoryItemClass } from '../../calculations/CompressorInventoryItemClass';
import { CompressedAirModifiedDayTypeProfileSummary } from '../../calculations/modifications/CompressedAirModifiedDayTypeProfileSummary';

@Injectable()
export class ExploreOpportunitiesValidationService {

  addReceiverVolumeValid: BehaviorSubject<boolean>;
  adjustCascadingSetPointsValid: BehaviorSubject<boolean>;
  improveEndUseEfficiencyValid: BehaviorSubject<boolean>;
  reduceAirLeaksValid: BehaviorSubject<boolean>;
  reduceRuntimeValid: BehaviorSubject<boolean>;
  reduceSystemAirPressureValid: BehaviorSubject<boolean>;
  useAutomaticSequencerValid: BehaviorSubject<boolean>;
  constructor(private addReceiverVolumeService: AddReceiverVolumeService, private adjustCascadingSetPointsService: AdjustCascadingSetPointsService,
    private improveEndUseEfficiencyService: ImproveEndUseEfficiencyService, private reduceAirLeaksService: ReduceAirLeaksService,
    private reduceSystemAirPressureService: ReduceSystemAirPressureService, private useAutomaticSequencerService: UseAutomaticSequencerService,
    private reduceRunTimeService: ReduceRunTimeService) {
    this.addReceiverVolumeValid = new BehaviorSubject<boolean>(true);
    this.adjustCascadingSetPointsValid = new BehaviorSubject<boolean>(true);
    this.improveEndUseEfficiencyValid = new BehaviorSubject<boolean>(true);
    this.reduceAirLeaksValid = new BehaviorSubject<boolean>(true);
    this.reduceRuntimeValid = new BehaviorSubject<boolean>(true);
    this.reduceSystemAirPressureValid = new BehaviorSubject<boolean>(true);
    this.useAutomaticSequencerValid = new BehaviorSubject<boolean>(true);
  }

  checkModificationValid(modification: Modification, baselineResults: BaselineResults, baselineProfileSummaries: Array<{ dayType: CompressedAirDayType, profileSummaryTotals: Array<ProfileSummaryTotal> }>,
    compressedAirAssessment: CompressedAirAssessment, settings: Settings, compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults): CompressedAirModificationValid {

    let addReceiverVolume: boolean = this.checkAddReceiverVolumeValid(modification.addPrimaryReceiverVolume);
    let adjustCascadingSetPoints: boolean = this.checkAdjustCascadingPointsValid(modification.adjustCascadingSetPoints);
    let improveEndUseEfficiency: boolean = this.checkImproveEndUseEfficiencyValid(modification.improveEndUseEfficiency, baselineResults, baselineProfileSummaries);
    let reduceAirLeaks: boolean = this.checkReduceAirLeaksValid(modification.reduceAirLeaks, baselineResults);
    let reduceRuntime: boolean = this.checkReduceRuntimeValid(compressedAirAssessment, modification, compressedAirAssessmentModificationResults);
    let reduceSystemPressure: boolean = this.checkReduceSystemAirPressureValid(modification.reduceSystemAirPressure, compressedAirAssessment.compressorInventoryItems);
    let useAutomaticSequencer: boolean = this.checkUseAutomaticSequencerValid(compressedAirAssessment, modification, compressedAirAssessmentModificationResults, settings);
    return {
      isValid: addReceiverVolume && adjustCascadingSetPoints && improveEndUseEfficiency && reduceAirLeaks && reduceRuntime && reduceSystemPressure && useAutomaticSequencer,
      addReceiverVolume: addReceiverVolume,
      adjustCascadingSetPoints: adjustCascadingSetPoints,
      improveEndUseEfficiency: improveEndUseEfficiency,
      reduceAirLeaks: reduceAirLeaks,
      reduceRuntime: reduceRuntime,
      reduceSystemPressure: reduceSystemPressure,
      useAutomaticSequencer: useAutomaticSequencer
    }
  }

  checkAddReceiverVolumeValid(addPrimaryReceiverVolume: AddPrimaryReceiverVolume): boolean {
    let isValid: boolean = true;
    if (addPrimaryReceiverVolume.order != 100) {
      let form: UntypedFormGroup = this.addReceiverVolumeService.getFormFromObj(addPrimaryReceiverVolume);
      isValid = form.valid;
    }
    return isValid;
  }

  checkAdjustCascadingPointsValid(adjustCascadingSetPoints: AdjustCascadingSetPoints): boolean {
    let isValid: boolean = true;
    if (adjustCascadingSetPoints.order != 100) {
      let implementationCostForm: UntypedFormGroup = this.adjustCascadingSetPointsService.getImplementationCostForm(adjustCascadingSetPoints);
      isValid = implementationCostForm.valid;
      if (isValid) {
        let compressorForms: Array<CompressorForm> = this.adjustCascadingSetPointsService.getFormFromObj(adjustCascadingSetPoints.setPointData);
        compressorForms.forEach(compressorForm => {
          if (isValid) {
            isValid = compressorForm.form.valid;
          }
        })
      }
    }
    return isValid;
  }

  checkImproveEndUseEfficiencyValid(improveEndUseEfficiency: ImproveEndUseEfficiency, baselineResults: BaselineResults, baselineProfileSummaries: Array<{ dayType: CompressedAirDayType, profileSummaryTotals: Array<ProfileSummaryTotal> }>): boolean {
    let isValid: boolean = true;
    if (improveEndUseEfficiency.order != 100) {
      improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => {
        if (isValid) {
          let form: UntypedFormGroup = this.improveEndUseEfficiencyService.getFormFromObj(item, baselineResults);
          isValid = form.valid;
          if (isValid) {
            let dataForms: Array<{ dayTypeName: string, dayTypeId: string, form: UntypedFormGroup }> = this.improveEndUseEfficiencyService.getDataForms(item, baselineProfileSummaries);
            dataForms.forEach(dataForm => {
              if (isValid) {
                isValid = dataForm.form.valid;
              }
            });
          }
        }
      });
    }
    return isValid;
  }

  checkReduceAirLeaksValid(reduceAirLeaks: ReduceAirLeaks, baselineResults: BaselineResults): boolean {
    let isValid: boolean = true;
    if (reduceAirLeaks.order != 100) {
      let form: UntypedFormGroup = this.reduceAirLeaksService.getFormFromObj(reduceAirLeaks, baselineResults);
      isValid = form.valid;
    }
    return isValid;
  }

  checkReduceRuntimeValid(compressedAirAssessment: CompressedAirAssessment, modification: Modification, compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults): boolean {
    let isValid: boolean = true;
    if (modification.reduceRuntime.order != 100) {
      let form: UntypedFormGroup = this.reduceRunTimeService.getFormFromObj(modification.reduceRuntime);
      isValid = form.valid;
      if (isValid) {
        compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
          if (isValid) {
            let modificationProfileSummary: CompressedAirModifiedDayTypeProfileSummary = compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries.find(dayTypeModResult => { return dayTypeModResult.dayType.dayTypeId == dayType.dayTypeId });
            let adjustedProfileSummary: Array<ProfileSummary> = modificationProfileSummary.getProfileSummaryFromOrder(modification.reduceRuntime.order - 1);
            let eemSequencerProfileSummary: Array<ProfileSummary> = modificationProfileSummary.reduceRunTimeResults.profileSummary;
            let dataArrays: ValidationDataArrays = this.getDataArrays(adjustedProfileSummary, compressedAirAssessment.systemProfile.systemProfileSetup, eemSequencerProfileSummary, compressedAirAssessment.compressorInventoryItems, false);
            isValid = dataArrays.isValid;
          }
        });
      }
    }
    return isValid;
  }

  checkReduceSystemAirPressureValid(reduceSystemAirPressure: ReduceSystemAirPressure, compressorInventoryItems: Array<CompressorInventoryItem>): boolean {
    let isValid: boolean = true;
    if (reduceSystemAirPressure.order != 100) {
      let form: UntypedFormGroup = this.reduceSystemAirPressureService.getFormFromObj(reduceSystemAirPressure, compressorInventoryItems);
      isValid = form.valid;
    }
    return isValid;
  }

  checkUseAutomaticSequencerValid(compressedAirAssessment: CompressedAirAssessment, modification: Modification, compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults, settings: Settings): boolean {
    let isValid: boolean = true;
    if (modification.useAutomaticSequencer.order != 100) {
      let form: UntypedFormGroup = this.useAutomaticSequencerService.getFormFromObj(modification.useAutomaticSequencer);
      isValid = form.valid;
      if (isValid) {
        compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
          if (isValid) {
            let inventoryItemsClass: Array<CompressorInventoryItemClass> = compressedAirAssessment.compressorInventoryItems.map(item => { return new CompressorInventoryItemClass(item) });
            inventoryItemsClass.forEach(itemClass => {
              itemClass.adjustCompressorPerformancePointsWithSequencer(modification.useAutomaticSequencer.targetPressure, modification.useAutomaticSequencer.variance, compressedAirAssessment.systemInformation, settings);
            });
            let adjustedCompressors: Array<CompressorInventoryItem> = inventoryItemsClass.map(itemClass => { return itemClass.toModel() });
            let modificationProfileSummary: CompressedAirModifiedDayTypeProfileSummary = compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries.find(dayTypeModResult => { return dayTypeModResult.dayType.dayTypeId == dayType.dayTypeId });
            let adjustedProfileSummary: Array<ProfileSummary> = modificationProfileSummary.getProfileSummaryFromOrder(modification.useAutomaticSequencer.order - 1);
            let eemSequencerProfileSummary: Array<ProfileSummary> = modificationProfileSummary.useAutomaticSequencerResults.profileSummary;
            let dataArrays: ValidationDataArrays = this.getDataArrays(adjustedProfileSummary, compressedAirAssessment.systemProfile.systemProfileSetup, eemSequencerProfileSummary, adjustedCompressors, false);
            isValid = dataArrays.isValid;
          }
        });
      }
    }
    return isValid;

  }


  getDataArrays(previousOrderProfile: Array<ProfileSummary>, systemProfileSetup: SystemProfileSetup,
    eemProfileSummary: Array<ProfileSummary>, adjustedCompressors: Array<CompressorInventoryItem>,
    profilePowerNeeded: boolean): ValidationDataArrays {
    let requiredAirflow: Array<number> = new Array();
    let availableAirflow: Array<number> = new Array();
    let profilePower: Array<number> = new Array();
    previousOrderProfile.forEach(summary => {
      let index: number = 0;
      for (let i = 0; i < 24;) {
        if (requiredAirflow[index] == undefined) {
          requiredAirflow.push(0);
        }
        if (availableAirflow[index] == undefined) {
          availableAirflow.push(0);
        }
        if (profilePower[index] == undefined) {
          profilePower.push(0);
        }
        if (summary.profileSummaryData[index].order != 0) {
          requiredAirflow[index] = requiredAirflow[index] + summary.profileSummaryData[index].airflow;
        }
        let profileSummary: ProfileSummary = eemProfileSummary.find(sequencerSummary => { return summary.compressorId == sequencerSummary.compressorId && summary.dayTypeId == sequencerSummary.dayTypeId });
        let intervalItem: ProfileSummaryData = profileSummary.profileSummaryData.find(data => { return data.timeInterval == i });
        if (intervalItem.order != 0) {
          availableAirflow[index] = availableAirflow[index] + this.getFullLoadCapacity(profileSummary.compressorId, adjustedCompressors);
        }
        if (profilePowerNeeded) {
          let powerProfile: ProfileSummary = eemProfileSummary.find(profileSummary => { return summary.compressorId == profileSummary.compressorId && summary.dayTypeId == profileSummary.dayTypeId });
          let powerProfileData: ProfileSummaryData = powerProfile.profileSummaryData.find(data => { return data.timeInterval == i });
          profilePower[index] = profilePower[index] + powerProfileData.power;
        }
        i = i + systemProfileSetup.dataInterval;
        index++;
      }
    });
    let isValid: boolean = this.checkAirflowValid(requiredAirflow, availableAirflow);
    return { requiredAirflow: requiredAirflow, availableAirflow: availableAirflow, profilePower: profilePower, isValid: isValid }
  }

  getFullLoadCapacity(compressorId: string, adjustedCompressors: Array<CompressorInventoryItem>): number {
    let compressor: CompressorInventoryItem = adjustedCompressors.find(compressor => { return compressor.itemId == compressorId });
    return compressor.performancePoints.fullLoad.airflow;
  }

  checkAirflowValid(requiredAirflow: Array<number>, availableAirflow: Array<number>): boolean {
    let isValid: boolean = true;
    for (let i = 0; i < requiredAirflow.length; i++) {
      if (availableAirflow[i] < requiredAirflow[i]) {
        isValid = false;
        i = requiredAirflow.length;
      }
    }
    return isValid;
  }


}

export interface CompressedAirModificationValid {
  isValid: boolean,
  addReceiverVolume: boolean,
  adjustCascadingSetPoints: boolean,
  improveEndUseEfficiency: boolean,
  reduceAirLeaks: boolean,
  reduceRuntime: boolean,
  reduceSystemPressure: boolean,
  useAutomaticSequencer: boolean
}



export interface ValidationDataArrays {
  requiredAirflow: Array<number>,
  availableAirflow: Array<number>,
  profilePower: Array<number>,
  isValid: boolean
}