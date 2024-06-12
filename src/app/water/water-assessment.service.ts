import { Injectable } from '@angular/core';
import { isNull, isUndefined } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { DayTypeService } from '../compressed-air-assessment/day-types/day-type.service';
import { SystemInformationFormService } from '../compressed-air-assessment/system-information/system-information-form.service';
import { InventoryService } from '../dashboard/inventory.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
import { WaterAssessment } from '../shared/models/water-assessment';

@Injectable({
  providedIn: 'root'
})
export class WaterAssessmentService {

  settings: BehaviorSubject<Settings>;
  mainTab: BehaviorSubject<string>;
  setupTab: BehaviorSubject<string>;
  focusedField: BehaviorSubject<string>;
  helpTextField: BehaviorSubject<string>;
  calcTab: BehaviorSubject<string>;
  assessmentTab: BehaviorSubject<string>;
  secondaryAssessmentTab: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  waterAssessment: BehaviorSubject<WaterAssessment>;
  selectedModificationId: BehaviorSubject<string>;
  showModificationListModal: BehaviorSubject<boolean>;
  showAddModificationModal: BehaviorSubject<boolean>;
  showExportModal: BehaviorSubject<boolean>;
  setupTabs: Array<string> = [
    'system-basics',
  ];
  constructor(
    private systemInformationFormService: SystemInformationFormService, 
    private convertUnitsService: ConvertUnitsService) {
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.setupTab = new BehaviorSubject<string>('system-basics');
    this.focusedField = new BehaviorSubject<string>('default');
    this.helpTextField = new BehaviorSubject<string>('default');
    // this.calcTab = new BehaviorSubject<string>('air-flow-conversion');
    this.assessmentTab = new BehaviorSubject<string>('explore-opportunities');
    this.secondaryAssessmentTab = new BehaviorSubject<string>('modifications');
    this.waterAssessment = new BehaviorSubject<WaterAssessment>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.selectedModificationId = new BehaviorSubject<string>(undefined);
    this.showModificationListModal = new BehaviorSubject<boolean>(false);
    this.showAddModificationModal = new BehaviorSubject<boolean>(false);
    this.showExportModal = new BehaviorSubject<boolean>(false);
  }

  updateWaterAssessment(waterAssessment: WaterAssessment, isBaselineChange: boolean) {
    console.log('updateWaterAssessment', waterAssessment)
    if (isBaselineChange) {
      let settings: Settings = this.settings.getValue();
      // let hasValidSystemInformation = this.systemInformationFormService.getFormFromObj(waterAssessment.systemInformation, settings).valid;
      // let hasValidCompressors = this.inventoryService.hasValidCompressors(waterAssessment);
      // let hasValidDayTypes = this.dayTypeService.hasValidDayTypes(waterAssessment.compressedAirDayTypes);
      // let profileSummaryValid = this.hasValidProfileSummaryData(waterAssessment);
      // waterAssessment.setupDone = (hasValidSystemInformation && hasValidCompressors && hasValidDayTypes && profileSummaryValid.isValid);
    }
    this.waterAssessment.next(waterAssessment);
  }

  continue() {
    let tmpSetupTab: string = this.setupTab.getValue();
    let assessmentTabIndex: number = this.setupTabs.indexOf(tmpSetupTab);
    let nextTab: string = this.setupTabs[assessmentTabIndex + 1];
    this.setupTab.next(nextTab);
  }

  back() {
    let tmpSetupTab: string = this.setupTab.getValue();
    if (tmpSetupTab !== 'system-basics' && this.mainTab.getValue() == 'system-setup') {
      let assessmentTabIndex: number = this.setupTabs.indexOf(tmpSetupTab);
      let nextTab: string = this.setupTabs[assessmentTabIndex - 1];
      this.setupTab.next(nextTab);
    } else if (this.mainTab.getValue() == 'assessment') {
      this.mainTab.next('system-setup');
    }
  }

}
