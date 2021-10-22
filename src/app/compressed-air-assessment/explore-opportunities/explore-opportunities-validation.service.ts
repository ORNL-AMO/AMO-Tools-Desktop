import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AddPrimaryReceiverVolume, AdjustCascadingSetPoints, CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ImproveEndUseEfficiency, Modification, ProfileSummary, ProfileSummaryTotal, ReduceAirLeaks, ReduceRuntime, ReduceSystemAirPressure, UseAutomaticSequencer } from '../../shared/models/compressed-air-assessment';
import { BaselineResults, CompressedAirAssessmentResult, CompressedAirAssessmentResultsService } from '../compressed-air-assessment-results.service';
import { AddReceiverVolumeService } from './add-receiver-volume/add-receiver-volume.service';
import { AdjustCascadingSetPointsService, CompressorForm } from './adjust-cascading-set-points/adjust-cascading-set-points.service';
import { ExploreOpportunitiesService } from './explore-opportunities.service';
import { ImproveEndUseEfficiencyService } from './improve-end-use-efficiency/improve-end-use-efficiency.service';
import { ReduceAirLeaksService } from './reduce-air-leaks/reduce-air-leaks.service';
import { ReduceSystemAirPressureService } from './reduce-system-air-pressure/reduce-system-air-pressure.service';
import { SequencerDataArrays, UseAutomaticSequencerService } from './use-automatic-sequencer/use-automatic-sequencer.service';

@Injectable()
export class ExploreOpportunitiesValidationService {

  constructor(private addReceiverVolumeService: AddReceiverVolumeService, private adjustCascadingSetPointsService: AdjustCascadingSetPointsService,
    private improveEndUseEfficiencyService: ImproveEndUseEfficiencyService, private reduceAirLeaksService: ReduceAirLeaksService,
    private reduceSystemAirPressureService: ReduceSystemAirPressureService, private useAutomaticSequencerService: UseAutomaticSequencerService,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService, private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  checkModificationValid(modification: Modification, baselineResults: BaselineResults, baselineProfileSummaries: Array<{ dayType: CompressedAirDayType, profileSummaryTotals: Array<ProfileSummaryTotal> }>,
    compressedAirAssessment: CompressedAirAssessment): CompressedAirModificationValid {
    let compressedAirAssessmentResult: CompressedAirAssessmentResult = this.compressedAirAssessmentResultsService.calculateModificationResults(compressedAirAssessment, modification);

    let addReceiverVolume: boolean = this.checkAddReceiverVolumeValid(modification.addPrimaryReceiverVolume);
    let adjustCascadingSetPoints: boolean = this.checkAdjustCascadingPointsValid(modification.adjustCascadingSetPoints);
    let improveEndUseEfficiency: boolean = this.checkImproveEndUseEfficiencyValid(modification.improveEndUseEfficiency, baselineResults, baselineProfileSummaries);
    let reduceAirLeaks: boolean = this.checkReduceAirLeaksValid(modification.reduceAirLeaks, baselineResults);
    let reduceRuntime: boolean = this.checkReduceRuntimeValid(modification.reduceRuntime);
    let reduceSystemPressure: boolean = this.checkReduceSystemAirPressureValid(modification.reduceSystemAirPressure, compressedAirAssessment.compressorInventoryItems);
    let useAutomaticSequencer: boolean = this.checkUseAutomaticSequencerValid(compressedAirAssessment, modification, compressedAirAssessmentResult);
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
      let form: FormGroup = this.addReceiverVolumeService.getFormFromObj(addPrimaryReceiverVolume);
      isValid = form.valid;
    }
    return isValid;
  }

  checkAdjustCascadingPointsValid(adjustCascadingSetPoints: AdjustCascadingSetPoints): boolean {
    let isValid: boolean = true;
    if (adjustCascadingSetPoints.order != 100) {
      let implementationCostForm: FormGroup = this.adjustCascadingSetPointsService.getImplementationCostForm(adjustCascadingSetPoints);
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
          let form: FormGroup = this.improveEndUseEfficiencyService.getFormFromObj(item, baselineResults);
          isValid = form.valid;
          if (isValid) {
            let dataForms: Array<{ dayTypeName: string, dayTypeId: string, form: FormGroup }> = this.improveEndUseEfficiencyService.getDataForms(item, baselineProfileSummaries);
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
      let form: FormGroup = this.reduceAirLeaksService.getFormFromObj(reduceAirLeaks, baselineResults);
      isValid = form.valid;
    }
    return isValid;
  }

  checkReduceRuntimeValid(reduceRuntime: ReduceRuntime): boolean {
    let isValid: boolean = true;
    if (reduceRuntime.order != 100) {
      //TODO:
    }
    return isValid;
  }

  checkReduceSystemAirPressureValid(reduceSystemAirPressure: ReduceSystemAirPressure, compressorInventoryItems: Array<CompressorInventoryItem>): boolean {
    let isValid: boolean = true;
    if (reduceSystemAirPressure.order != 100) {
      let form: FormGroup = this.reduceSystemAirPressureService.getFormFromObj(reduceSystemAirPressure, compressorInventoryItems);
      isValid = form.valid;
    }
    return isValid;
  }

  checkUseAutomaticSequencerValid(compressedAirAssessment: CompressedAirAssessment, modification: Modification, modificationResults: CompressedAirAssessmentResult): boolean {
    let isValid: boolean = true;
    if (modification.useAutomaticSequencer.order != 100) {
      //TODO:
      let form: FormGroup = this.useAutomaticSequencerService.getFormFromObj(modification.useAutomaticSequencer);
      isValid = form.valid;
      if (isValid) {
        compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
          if (isValid) {
            let adjustedCompressors: Array<CompressorInventoryItem> = this.compressedAirAssessmentResultsService.useAutomaticSequencerAdjustCompressor(modification.useAutomaticSequencer, JSON.parse(JSON.stringify(compressedAirAssessment.compressorInventoryItems)), modification.useAutomaticSequencer.profileSummary, dayType.dayTypeId);
            let adjustedProfileSummary: Array<ProfileSummary> = this.exploreOpportunitiesService.getPreviousOrderProfileSummary(modification.useAutomaticSequencer.order, modification, modificationResults, dayType.dayTypeId);
            let numberOfSummaryIntervals: number = compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;
            let dataArrays: SequencerDataArrays = this.useAutomaticSequencerService.getDataArrays(dayType.dayTypeId, adjustedProfileSummary, numberOfSummaryIntervals, modification.useAutomaticSequencer, modificationResults.dayTypeModificationResults, adjustedCompressors, false);
            isValid = dataArrays.isValid;
          }
        });
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