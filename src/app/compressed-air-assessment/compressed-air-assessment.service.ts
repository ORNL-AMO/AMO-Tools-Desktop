import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompressedAirAssessment, Modification } from '../shared/models/compressed-air-assessment';
import { Settings } from '../shared/models/settings';
import { CompressedAirAssessmentValidationService } from './compressed-air-assessment-validation/compressed-air-assessment-validation.service';
import { CompressedAirAssessmentValidation } from './compressed-air-assessment-validation/CompressedAirAssessmentValidation';
import { CompressedAirAssessmentBaselineResults } from './calculations/CompressedAirAssessmentBaselineResults';
import { AssessmentCo2SavingsService } from '../shared/assessment-co2-savings/assessment-co2-savings.service';
import { CompressedAirCalculationService } from './compressed-air-calculation.service';
import { ExploreOpportunitiesValidationService } from './compressed-air-assessment-validation/explore-opportunities-validation.service';
import { CompressedAirAssessmentModificationResults } from './calculations/modifications/CompressedAirAssessmentModificationResults';

@Injectable({
  providedIn: 'root'
})
export class CompressedAirAssessmentService {

  selectedModification: BehaviorSubject<Modification>;
  compressedAirAssessmentBaselineResults: BehaviorSubject<CompressedAirAssessmentBaselineResults>;
  compressedAirAssessmentModificationResults: BehaviorSubject<CompressedAirAssessmentModificationResults>;

  settings: BehaviorSubject<Settings>;
  focusedField: BehaviorSubject<string>;
  helpTextField: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  compressedAirAssessment: BehaviorSubject<CompressedAirAssessment>;
  showModificationListModal: BehaviorSubject<boolean>;
  showAddModificationModal: BehaviorSubject<boolean>;
  showExportModal: BehaviorSubject<boolean>;
  calcTab: BehaviorSubject<string>;
  constructor(private compressedAirAssessmentValidationService: CompressedAirAssessmentValidationService,
    private compressedAirCalculationService: CompressedAirCalculationService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService,
    private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService
  ) {
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.focusedField = new BehaviorSubject<string>('default');
    this.helpTextField = new BehaviorSubject<string>('default');
    this.compressedAirAssessment = new BehaviorSubject<CompressedAirAssessment>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.showModificationListModal = new BehaviorSubject<boolean>(false);
    this.showAddModificationModal = new BehaviorSubject<boolean>(false);
    this.showExportModal = new BehaviorSubject<boolean>(false);
    this.selectedModification = new BehaviorSubject<Modification>(undefined);
    this.calcTab = new BehaviorSubject<string>('air-flow-conversion');

    this.compressedAirAssessmentBaselineResults = new BehaviorSubject<CompressedAirAssessmentBaselineResults>(undefined);
    this.compressedAirAssessmentModificationResults = new BehaviorSubject<CompressedAirAssessmentModificationResults>(undefined);
    // this.selectedModification.subscribe(val => {
    //   this.setModificationResults(val);
    // });
  }

  updateCompressedAir(compressedAirAssessment: CompressedAirAssessment, isBaselineChange: boolean) {
    if (isBaselineChange) {
      let settings: Settings = this.settings.getValue();
      let validation: CompressedAirAssessmentValidation = this.compressedAirAssessmentValidationService.validateCompressedAirAssessment(compressedAirAssessment, settings);
      compressedAirAssessment.setupDone = validation.baselineValid;
      if (compressedAirAssessment.setupDone == true) {
        let compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults = new CompressedAirAssessmentBaselineResults(compressedAirAssessment, settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);
        this.compressedAirAssessmentBaselineResults.next(compressedAirAssessmentBaselineResults);
      } else {
        this.compressedAirAssessmentBaselineResults.next(undefined);
      }
    }
    this.compressedAirAssessment.next(compressedAirAssessment);
  }

  setSelectedModificationById(modificationId: string) {
    let currentAssessment: CompressedAirAssessment = this.compressedAirAssessment.getValue();
    if (modificationId) {
      let modification: Modification = currentAssessment.modifications.find(mod => { return mod.modificationId == modificationId; });
      this.setSelectedModification(modification);
    } else if (currentAssessment.modifications.length > 0) {
      let modification: Modification = currentAssessment.modifications[0];
      this.setSelectedModification(modification);

    }
  }

  setModificationResults(modification: Modification) {
    if (modification) {
      let compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults = this.compressedAirAssessmentBaselineResults.getValue();
      let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessment.getValue();
      let settings: Settings = this.settings.getValue();
      let compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults = new CompressedAirAssessmentModificationResults(compressedAirAssessment, modification, settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService, compressedAirAssessmentBaselineResults);
      this.compressedAirAssessmentModificationResults.next(compressedAirAssessmentModificationResults);
      this.exploreOpportunitiesValidationService.setModificationValid(modification, compressedAirAssessmentBaselineResults.baselineResults, compressedAirAssessmentBaselineResults.baselineDayTypeProfileSummaries, compressedAirAssessment, settings, compressedAirAssessmentModificationResults);
    } else {
      this.compressedAirAssessmentModificationResults.next(undefined);
      this.exploreOpportunitiesValidationService.compressedAirModificationValid.next(undefined);
    }
  }

  updateModification(modification: Modification) {
    let currentAssessment: CompressedAirAssessment = this.compressedAirAssessment.getValue();
    let modIndex: number = currentAssessment.modifications.findIndex(mod => { return mod.modificationId == modification.modificationId; });
    if (modIndex != -1) {
      currentAssessment.modifications[modIndex] = modification;
      this.updateCompressedAir(currentAssessment, false);
      this.setSelectedModification(modification);
    }
  }

  setSelectedModification(modification: Modification) {
    this.selectedModification.next(modification);
    this.setModificationResults(modification);
  }
}