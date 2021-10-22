import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CompressorInventoryItem, ProfileSummary, ProfileSummaryData, UseAutomaticSequencer } from '../../../shared/models/compressed-air-assessment';
import { DayTypeModificationResult } from '../../compressed-air-assessment-results.service';

@Injectable()
export class UseAutomaticSequencerService {

  constructor(private formBuilder: FormBuilder) { }


  getFormFromObj(useAutomaticSequencer: UseAutomaticSequencer): FormGroup {
    let varianceValidators: Array<ValidatorFn> = [Validators.min(0), Validators.required];
    if (useAutomaticSequencer.targetPressure) {
      let maxVariance: number = useAutomaticSequencer.targetPressure * .5;
      varianceValidators.push(Validators.max(maxVariance));
    }
    let form: FormGroup = this.formBuilder.group({
      targetPressure: [useAutomaticSequencer.targetPressure, [Validators.min(0), Validators.required]],
      variance: [useAutomaticSequencer.variance, varianceValidators],
      implementationCost: [useAutomaticSequencer.implementationCost, [Validators.min(0)]],
      order: [useAutomaticSequencer.order]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  updateObjFromForm(form: FormGroup, useAutomaticSequencer: UseAutomaticSequencer): UseAutomaticSequencer {
    useAutomaticSequencer.targetPressure = form.controls.targetPressure.value;
    useAutomaticSequencer.variance = form.controls.variance.value;
    useAutomaticSequencer.implementationCost = form.controls.implementationCost.value;
    useAutomaticSequencer.order = form.controls.order.value;
    return useAutomaticSequencer;
  }

  getDataArrays(dayTypeId: string, adjustedProfileSummary: Array<ProfileSummary>, numberOfSummaryIntervals: number,
    useAutomaticSequencer: UseAutomaticSequencer, dayTypeModificationResults: Array<DayTypeModificationResult>, adjustedCompressors: Array<CompressorInventoryItem>,
    profilePowerNeeded: boolean): SequencerDataArrays {
    let requiredAirflow: Array<number> = new Array();
    let availableAirflow: Array<number> = new Array();
    let profilePower: Array<number> = new Array();

    adjustedProfileSummary.forEach(summary => {
      for (let i = 0; i < numberOfSummaryIntervals; i++) {
        if (!requiredAirflow[i]) {
          requiredAirflow.push(0);
        }
        if (!availableAirflow[i]) {
          availableAirflow.push(0);
        }
        if (!profilePower[i]) {
          profilePower.push(0);
        }
        if (summary.profileSummaryData[i].order != 0) {
          requiredAirflow[i] = requiredAirflow[i] + summary.profileSummaryData[i].airflow;
        }
        let profileSummary: ProfileSummary = useAutomaticSequencer.profileSummary.find(sequencerSummary => { return summary.compressorId == sequencerSummary.compressorId && summary.dayTypeId == sequencerSummary.dayTypeId });
        let intervalItem: ProfileSummaryData = profileSummary.profileSummaryData.find(data => { return data.timeInterval == i });
        if (intervalItem.order != 0) {
          availableAirflow[i] = availableAirflow[i] + this.getFullLoadCapacity(profileSummary.compressorId, adjustedCompressors);
        }
        if (profilePowerNeeded) {
          let automaticSequencerProfileSummary: Array<ProfileSummary> = dayTypeModificationResults.find(dayTypeModResult => { return dayTypeModResult.dayTypeId == dayTypeId }).useAutomaticSequencerProfileSummary;
          let powerProfile: ProfileSummary = automaticSequencerProfileSummary.find(profileSummary => { return summary.compressorId == profileSummary.compressorId && summary.dayTypeId == profileSummary.dayTypeId });
          let powerProfileData: ProfileSummaryData = powerProfile.profileSummaryData.find(data => { return data.timeInterval == i });
          profilePower[i] = profilePower[i] + powerProfileData.power;
        }
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


export interface SequencerDataArrays {
  requiredAirflow: Array<number>,
  availableAirflow: Array<number>,
  profilePower: Array<number>,
  isValid: boolean
}