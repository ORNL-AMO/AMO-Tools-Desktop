import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AddPrimaryReceiverVolume, AdjustCascadingSetPoints, CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ImproveEndUseEfficiency, Modification, ProfileSummaryTotal, ReduceAirLeaks, ReduceSystemAirPressure } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';
import { AddReceiverVolumeService } from '../assessment-tab-content/explore-opportunities/explore-opportunities-form/add-receiver-volume/add-receiver-volume.service';
import { AdjustCascadingSetPointsService, CompressorForm } from '../assessment-tab-content/explore-opportunities/explore-opportunities-form/adjust-cascading-set-points/adjust-cascading-set-points.service';
import { ImproveEndUseEfficiencyService } from '../assessment-tab-content/explore-opportunities/explore-opportunities-form/improve-end-use-efficiency/improve-end-use-efficiency.service';
import { ReduceAirLeaksService } from '../assessment-tab-content/explore-opportunities/explore-opportunities-form/reduce-air-leaks/reduce-air-leaks.service';
import { ReduceRunTimeService } from '../assessment-tab-content/explore-opportunities/explore-opportunities-form/reduce-run-time/reduce-run-time.service';
import { ReduceSystemAirPressureService } from '../assessment-tab-content/explore-opportunities/explore-opportunities-form/reduce-system-air-pressure/reduce-system-air-pressure.service';
import { UseAutomaticSequencerService } from '../assessment-tab-content/explore-opportunities/explore-opportunities-form/use-automatic-sequencer/use-automatic-sequencer.service';
import { BaselineResults } from '../calculations/caCalculationModels';
import { CompressedAirAssessmentModificationResults } from '../calculations/modifications/CompressedAirAssessmentModificationResults';
import { CompressedAirModifiedDayTypeProfileSummary } from '../calculations/modifications/CompressedAirModifiedDayTypeProfileSummary';
import { CompressedAirModificationValid } from './CompressedAirAssessmentValidation';

@Injectable()
export class ExploreOpportunitiesValidationService {

  compressedAirModificationValid: BehaviorSubject<CompressedAirModificationValid>;
  constructor(private addReceiverVolumeService: AddReceiverVolumeService, private adjustCascadingSetPointsService: AdjustCascadingSetPointsService,
    private improveEndUseEfficiencyService: ImproveEndUseEfficiencyService, private reduceAirLeaksService: ReduceAirLeaksService,
    private reduceSystemAirPressureService: ReduceSystemAirPressureService, private useAutomaticSequencerService: UseAutomaticSequencerService,
    private reduceRunTimeService: ReduceRunTimeService) {
    this.compressedAirModificationValid = new BehaviorSubject<CompressedAirModificationValid>(undefined);
  }

  setModificationValid(modification: Modification, baselineResults: BaselineResults, baselineProfileSummaries: Array<{ dayType: CompressedAirDayType, profileSummaryTotals: Array<ProfileSummaryTotal> }>,
    compressedAirAssessment: CompressedAirAssessment, settings: Settings, compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults): CompressedAirModificationValid {
    let addReceiverVolume: boolean = this.checkAddReceiverVolumeValid(modification.addPrimaryReceiverVolume);
    let adjustCascadingSetPoints: boolean = this.checkAdjustCascadingPointsValid(modification.adjustCascadingSetPoints);
    let improveEndUseEfficiency: boolean = this.checkImproveEndUseEfficiencyValid(modification.improveEndUseEfficiency, baselineResults, baselineProfileSummaries);
    let reduceAirLeaks: boolean = this.checkReduceAirLeaksValid(modification.reduceAirLeaks, baselineResults);
    let reduceRuntime: boolean = this.checkReduceRuntimeValid(compressedAirAssessment, modification, compressedAirAssessmentModificationResults);
    let reduceSystemPressure: boolean = this.checkReduceSystemAirPressureValid(modification.reduceSystemAirPressure, compressedAirAssessment.compressorInventoryItems);
    let useAutomaticSequencer: boolean = this.checkUseAutomaticSequencerValid(compressedAirAssessment, modification, compressedAirAssessmentModificationResults);
    let compressedAirModificationValid: CompressedAirModificationValid = {
      isValid: addReceiverVolume && adjustCascadingSetPoints && improveEndUseEfficiency && reduceAirLeaks && reduceRuntime && reduceSystemPressure && useAutomaticSequencer,
      addReceiverVolume: addReceiverVolume,
      adjustCascadingSetPoints: adjustCascadingSetPoints,
      improveEndUseEfficiency: improveEndUseEfficiency,
      reduceAirLeaks: reduceAirLeaks,
      reduceRuntime: reduceRuntime,
      reduceSystemPressure: reduceSystemPressure,
      useAutomaticSequencer: useAutomaticSequencer
    }
    this.compressedAirModificationValid.next(compressedAirModificationValid);
    return compressedAirModificationValid;
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
            isValid = modificationProfileSummary.reduceRunTimeProfileValidation.isValid;
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

  checkUseAutomaticSequencerValid(compressedAirAssessment: CompressedAirAssessment, modification: Modification, compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults): boolean {
    let isValid: boolean = true;
    if (modification.useAutomaticSequencer.order != 100) {
      let form: UntypedFormGroup = this.useAutomaticSequencerService.getFormFromObj(modification.useAutomaticSequencer);
      isValid = form.valid;
      if (isValid) {
        compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
          if (isValid) {
            let modificationProfileSummary: CompressedAirModifiedDayTypeProfileSummary = compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries.find(dayTypeModResult => { return dayTypeModResult.dayType.dayTypeId == dayType.dayTypeId });
            isValid = modificationProfileSummary.useAutomaticSequencerProfileValidation.isValid;
          }
        });
      }
    }
    return isValid;

  }
}
