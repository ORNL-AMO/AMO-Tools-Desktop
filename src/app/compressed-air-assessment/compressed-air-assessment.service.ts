import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompressedAirAssessment, Modification } from '../shared/models/compressed-air-assessment';
import { Settings } from '../shared/models/settings';
import { CompressedAirAssessmentValidationService } from './compressed-air-assessment-validation/compressed-air-assessment-validation.service';
import { CompressedAirAssessmentValidation } from './compressed-air-assessment-validation/CompressedAirAssessmentValidation';

@Injectable({
  providedIn: 'root'
})
export class CompressedAirAssessmentService {

  selectedModification: BehaviorSubject<Modification>;
  settings: BehaviorSubject<Settings>;
  focusedField: BehaviorSubject<string>;
  helpTextField: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  compressedAirAssessment: BehaviorSubject<CompressedAirAssessment>;
  showModificationListModal: BehaviorSubject<boolean>;
  showAddModificationModal: BehaviorSubject<boolean>;
  showExportModal: BehaviorSubject<boolean>;
  calcTab: BehaviorSubject<string>;
  constructor(private compressedAirAssessmentValidationService: CompressedAirAssessmentValidationService) {
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
  }

  updateCompressedAir(compressedAirAssessment: CompressedAirAssessment, isBaselineChange: boolean) {
    if (isBaselineChange) {
      let validation: CompressedAirAssessmentValidation = this.compressedAirAssessmentValidationService.validateCompressedAirAssessment(compressedAirAssessment, this.settings.getValue());
      compressedAirAssessment.setupDone = validation.baselineValid;
    }
    this.compressedAirAssessment.next(compressedAirAssessment);
  }

  setSelectedModificationById(modificationId: string) {
    let currentAssessment: CompressedAirAssessment = this.compressedAirAssessment.getValue();
    if (modificationId) {
      let modification: Modification = currentAssessment.modifications.find(mod => { return mod.modificationId == modificationId; });
      this.selectedModification.next(modification);
    } else if (currentAssessment.modifications.length > 0) {
      let modification: Modification = currentAssessment.modifications[0];
      this.selectedModification.next(modification);
    }
  }
}