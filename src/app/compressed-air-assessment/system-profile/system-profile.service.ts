import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CompressedAirDayType, CompressorInventoryItem, ProfileSummary, SystemInformation, SystemProfileSetup } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';
import { CompressedAirAssessmentResultsService } from '../compressed-air-assessment-results.service';
import { SharedPointCalculationsService } from '../inventory/performance-points/calculations/shared-point-calculations.service';

@Injectable()
export class SystemProfileService {

  constructor(private formBuilder: UntypedFormBuilder,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService,
    private sharedPointCalculationsService: SharedPointCalculationsService) {
  }

  getProfileSetupFormFromObj(systemProfileSetup: SystemProfileSetup, dayTypes: Array<CompressedAirDayType>): UntypedFormGroup {
    let dayTypeExists: CompressedAirDayType = dayTypes.find(dayType => { return dayType.dayTypeId == systemProfileSetup.dayTypeId });
    if (!dayTypeExists && dayTypes.length != 0) {
      systemProfileSetup.dayTypeId = dayTypes[0].dayTypeId;
      systemProfileSetup.profileDataType = dayTypes[0].profileDataType;
    }
    let form: UntypedFormGroup = this.formBuilder.group({
      dayTypeId: [systemProfileSetup.dayTypeId],
      numberOfHours: [systemProfileSetup.numberOfHours, [Validators.required, Validators.min(24)]],
      dataInterval: [systemProfileSetup.dataInterval, [Validators.required]],
      profileDataType: [systemProfileSetup.profileDataType]
    })
    return form;
  }

  getProfileSetupFromForm(form: UntypedFormGroup): SystemProfileSetup {
    return {
      dayTypeId: form.controls.dayTypeId.value,
      numberOfHours: form.controls.numberOfHours.value,
      dataInterval: form.controls.dataInterval.value,
      profileDataType: form.controls.profileDataType.value
    }
  }

  //cascading
  updateCompressorOrderingCascading(profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, numberOfHourIntervals: number): Array<ProfileSummary> {
    let dayTypeSummaries: Array<ProfileSummary> = profileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    for (let compressorIndex = 0; compressorIndex < dayTypeSummaries.length; compressorIndex++) {
      for (let orderIndex = 0; orderIndex < numberOfHourIntervals; orderIndex++) {
        let order: number = 1;
        for (let compressorOrderIndex = 0; compressorOrderIndex < dayTypeSummaries.length; compressorOrderIndex++) {
          if (compressorOrderIndex != compressorIndex && dayTypeSummaries[compressorOrderIndex].profileSummaryData[orderIndex].order != 0) {
            if (dayTypeSummaries[compressorIndex].fullLoadPressure < dayTypeSummaries[compressorOrderIndex].fullLoadPressure) {
              order++;
            } else if (dayTypeSummaries[compressorOrderIndex].fullLoadPressure == dayTypeSummaries[compressorIndex].fullLoadPressure && compressorOrderIndex < compressorIndex) {
              order++;
            }
          }
        }
        if (dayTypeSummaries[compressorIndex].profileSummaryData[orderIndex].order != 0) {
          let summaryIndex: number = profileSummary.findIndex(summary => { return summary.compressorId == dayTypeSummaries[compressorIndex].compressorId && summary.dayTypeId == dayTypeSummaries[compressorIndex].dayTypeId })
          profileSummary[summaryIndex].profileSummaryData[orderIndex].order = order;
        }
      }
    }
    return profileSummary;
  }

  //target pressure sequencer
  updateCompressorOrderingSequencer(profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, removedSummary: ProfileSummary, numberOfHourIntervals: number): Array<ProfileSummary> {
    let dayTypeSummaries: Array<ProfileSummary> = profileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    for (let compressorIndex = 0; compressorIndex < dayTypeSummaries.length; compressorIndex++) {
      for (let orderIndex = 0; orderIndex < numberOfHourIntervals; orderIndex++) {
        if (dayTypeSummaries[compressorIndex].profileSummaryData[orderIndex].order > removedSummary.profileSummaryData[orderIndex].order) {
          let summaryIndex: number = profileSummary.findIndex(summary => { return summary.compressorId == dayTypeSummaries[compressorIndex].compressorId && summary.dayTypeId == dayTypeSummaries[compressorIndex].dayTypeId })
          profileSummary[summaryIndex].profileSummaryData[orderIndex].order--;
        }
      }
    }
    return profileSummary;
  }

  //isentropic efficiency
  updateCompressorOrderingIsentropicEfficiency(profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, numberOfHourIntervals: number, compressorInventory: Array<CompressorInventoryItem>, settings: Settings, systemInformation: SystemInformation): Array<ProfileSummary> {
    let dayTypeSummaries: Array<ProfileSummary> = profileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    dayTypeSummaries = this.setAdjustedIsentropicEfficiencies(dayTypeSummaries, compressorInventory, settings, systemInformation);
    //set adjusted efficiencies
    console.log(dayTypeSummaries);
    for (let compressorIndex = 0; compressorIndex < dayTypeSummaries.length; compressorIndex++) {
      for (let orderIndex = 0; orderIndex < numberOfHourIntervals; orderIndex++) {
        let order: number = 1;
        for (let compressorOrderIndex = 0; compressorOrderIndex < dayTypeSummaries.length; compressorOrderIndex++) {
          if (compressorOrderIndex != compressorIndex && dayTypeSummaries[compressorOrderIndex].profileSummaryData[orderIndex].order != 0) {
            if (dayTypeSummaries[compressorIndex].adjustedIsentropicEfficiency < dayTypeSummaries[compressorOrderIndex].adjustedIsentropicEfficiency) {
              order++;
            } else if (dayTypeSummaries[compressorOrderIndex].adjustedIsentropicEfficiency == dayTypeSummaries[compressorIndex].adjustedIsentropicEfficiency && compressorOrderIndex < compressorIndex) {
              order++;
            }
          }
        }
        if (dayTypeSummaries[compressorIndex].profileSummaryData[orderIndex].order != 0) {
          let summaryIndex: number = profileSummary.findIndex(summary => { return summary.compressorId == dayTypeSummaries[compressorIndex].compressorId && summary.dayTypeId == dayTypeSummaries[compressorIndex].dayTypeId })
          profileSummary[summaryIndex].profileSummaryData[orderIndex].order = order;
        }
      }
    }
    return profileSummary;
  }

  setAdjustedIsentropicEfficiencies(dayTypeSummaries: Array<ProfileSummary>, compressorInventory: Array<CompressorInventoryItem>, settings: Settings, systemInformation: SystemInformation): Array<ProfileSummary> {
    dayTypeSummaries.forEach(summary => {
      let compressor: CompressorInventoryItem = compressorInventory.find(item => { return item.itemId == summary.compressorId });
      console.log(compressor.name)
      if (compressor.performancePoints.fullLoad.dischargePressure == systemInformation.plantMaxPressure) {
        console.log('is equal')
        //calculate rated specific power
        let ratedSpecificPower: number = this.compressedAirAssessmentResultsService.calculateRatedSpecificPower(compressor);
        //calculate rated isentropic efficiency
        let ratedIsentropicEfficiency: number = this.compressedAirAssessmentResultsService.calculateRatedIsentropicEfficiency(compressor, ratedSpecificPower, settings);
        //calculate adjustedCompPower & adjustedAirflow
        let adjustedPressure: number = compressor.performancePoints.fullLoad.dischargePressure;
        let adjustedCompressorPower: number = compressor.performancePoints.fullLoad.power;
        let adjustedAirFlow: number = compressor.performancePoints.fullLoad.airflow;
        summary.adjustedIsentropicEfficiency = ratedIsentropicEfficiency;
        let adjustedSpecPower: number = ratedSpecificPower;
      } else {
        console.log('not equal');
        let adjustedPressure: number = systemInformation.plantMaxPressure;
        let a: number = ((adjustedPressure + systemInformation.atmosphericPressure) / systemInformation.atmosphericPressure);
        a = Math.pow(a, .283);
        let b: number = ((compressor.performancePoints.fullLoad.dischargePressure + 14.7) / 14.7);
        b = Math.pow(b, .283);
        let adjustedCompressorPower: number = compressor.performancePoints.fullLoad.power * ((a - 1) / (b - 1));
        let adjustedAirFlow: number = this.sharedPointCalculationsService.calculateAirFlow(compressor.performancePoints.fullLoad.airflow, adjustedPressure, compressor.nameplateData.fullLoadOperatingPressure, systemInformation.atmosphericPressure, settings)
        //calculate adjustedSpecPower
        let adjustedSpecPower: number = (adjustedCompressorPower / adjustedAirFlow) * 100;
        //calculate adjustedIsentropicEfficiency
        let c: number = (adjustedPressure + 14.5) / 14.5;
        c = Math.pow(c, .2857);
        summary.adjustedIsentropicEfficiency = ((16.52 * (c - 1)) / adjustedSpecPower) * 100;
      }
      console.log(summary.adjustedIsentropicEfficiency);
    });
    return dayTypeSummaries;
  }

  //load sharing
  updateCompressorOrderingLoadSharing(profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, numberOfHourIntervals: number): Array<ProfileSummary> {

    return profileSummary;
  }
  //base/trim
  // updateCompressorOrderingBaseTrim(profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, numberOfHourIntervals: number): Array<ProfileSummary> {

  //   return profileSummary;
  // }


}
