import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompressedAirAssessment, Modification } from '../shared/models/compressed-air-assessment';
import { Settings } from '../shared/models/settings';
import { DayTypeService } from './day-types/day-type.service';
import { InventoryService } from './inventory/inventory.service';
import { SystemInformationFormService } from './system-information/system-information-form.service';

@Injectable({
  providedIn: 'root'
})
export class CompressedAirAssessmentService {

  settings: BehaviorSubject<Settings>;
  mainTab: BehaviorSubject<string>;
  setupTab: BehaviorSubject<string>;
  focusedField: BehaviorSubject<string>;
  helpTextField: BehaviorSubject<string>;
  profileTab: BehaviorSubject<string>;
  calcTab: BehaviorSubject<string>;
  assessmentTab: BehaviorSubject<string>;
  secondaryAssessmentTab: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  compressedAirAssessment: BehaviorSubject<CompressedAirAssessment>;
  selectedModificationId: BehaviorSubject<string>;
  showModificationListModal: BehaviorSubject<boolean>;
  showAddModificationModal: BehaviorSubject<boolean>;

  constructor(private systemInformationFormService: SystemInformationFormService, private inventoryService: InventoryService,
    private dayTypeService: DayTypeService) {
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.setupTab = new BehaviorSubject<string>('system-basics');
    this.focusedField = new BehaviorSubject<string>('default');
    this.helpTextField = new BehaviorSubject<string>('default');
    this.profileTab = new BehaviorSubject<string>('setup');
    this.calcTab = new BehaviorSubject<string>('air-flow-conversion');
    this.assessmentTab = new BehaviorSubject<string>('explore-opportunities');
    this.secondaryAssessmentTab = new BehaviorSubject<string>('modifications');
    this.compressedAirAssessment = new BehaviorSubject<CompressedAirAssessment>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.selectedModificationId = new BehaviorSubject<string>(undefined);
    this.showModificationListModal = new BehaviorSubject<boolean>(false);
    this.showAddModificationModal = new BehaviorSubject<boolean>(false);

  }

  updateCompressedAir(compressedAirAssessment: CompressedAirAssessment, isBaselineChange: boolean) {
    if (isBaselineChange) {
      let settings: Settings = this.settings.getValue();
      let hasValidSystemInformation = this.systemInformationFormService.getFormFromObj(compressedAirAssessment.systemInformation, settings).valid;
      let hasValidCompressors = this.inventoryService.hasValidCompressors(compressedAirAssessment);
      let hasValidDayTypes = this.dayTypeService.hasValidDayTypes(compressedAirAssessment.compressedAirDayTypes);
      let hasValidSystemProfile = this.hasValidProfileSummaryData(compressedAirAssessment);
      compressedAirAssessment.setupDone = (hasValidSystemInformation && hasValidCompressors && hasValidDayTypes && hasValidSystemProfile);
    }
    //TODO? set modifications valid?
    this.compressedAirAssessment.next(compressedAirAssessment);
  }


  hasValidProfileSummaryData(compressedAirAssessment?: CompressedAirAssessment) {
    if (!compressedAirAssessment) {
      compressedAirAssessment = this.compressedAirAssessment.getValue();
    }
    let isInvalidProfileSummaryData = false;
    let profileSummary = compressedAirAssessment.systemProfile.profileSummary;
    let profileDataType = compressedAirAssessment.systemProfile.systemProfileSetup.profileDataType;
    let selectedDayTypeId = compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId;

    isInvalidProfileSummaryData = profileSummary.some(summary => {
      if (summary.dayTypeId == selectedDayTypeId) {
        let hasInvalidData = summary.profileSummaryData.some(data => {
          if (data.order != 0) {
            if (profileDataType == 'percentCapacity' && (data.percentCapacity < 0 || isNaN(data.percentCapacity))) {
              return true
            } else if (profileDataType == 'power' && (data.power < 0 || isNaN(data.power))) {
              return true;
            } else if (profileDataType == 'airflow' && (data.airflow < 0 || isNaN(data.airflow))) {
              return true;
            } else if (profileDataType == 'percentPower' && (data.percentPower < 0) || isNaN(data.airflow)) {
              return true;
            } else if (profileDataType == 'powerFactor' && (data.powerFactor < 0 || isNaN(data.powerFactor) || data.amps < 0 || isNaN(data.amps) || data.volts < 0 || isNaN(data.volts))) {
              return true;
            }
          }
        });
        return hasInvalidData;
      }
    });
    return !isInvalidProfileSummaryData;
  }



}
