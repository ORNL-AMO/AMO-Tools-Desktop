import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompressedAirAssessment, Modification } from '../shared/models/compressed-air-assessment';
import { Settings } from '../shared/models/settings';

@Injectable({
  providedIn: 'root'
})
export class CompressedAirAssessmentService {

  settings: BehaviorSubject<Settings>;
  mainTab: BehaviorSubject<string>;
  setupTab: BehaviorSubject<string>;
  focusedField: BehaviorSubject<string>;
  profileTab: BehaviorSubject<string>;
  calcTab: BehaviorSubject<string>;
  assessmentTab: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  compressedAirAssessment: BehaviorSubject<CompressedAirAssessment>;
  selectedModificationId: BehaviorSubject<string>;
  constructor() {
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.setupTab = new BehaviorSubject<string>('system-basics');
    this.focusedField = new BehaviorSubject<string>('default');
    this.profileTab = new BehaviorSubject<string>('setup');
    this.calcTab = new BehaviorSubject<string>('air-flow-conversion');
    this.assessmentTab = new BehaviorSubject<string>('explore-opportunities');
    this.compressedAirAssessment = new BehaviorSubject<CompressedAirAssessment>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.selectedModificationId = new BehaviorSubject<string>(undefined);
  }

  updateCompressedAir(compressedAirAssessment: CompressedAirAssessment) {
    // wasteWater.baselineData.valid = this.checkWasteWaterValid(wasteWater.baselineData.activatedSludgeData, wasteWater.baselineData.aeratorPerformanceData, wasteWater.systemBasics);
    // wasteWater.setupDone = wasteWater.baselineData.valid.isValid;
    // wasteWater.modifications.forEach(mod => {
    //   mod.valid = this.checkWasteWaterValid(mod.activatedSludgeData, mod.aeratorPerformanceData, wasteWater.systemBasics);
    // });
    this.compressedAirAssessment.next(compressedAirAssessment);
  }

}
