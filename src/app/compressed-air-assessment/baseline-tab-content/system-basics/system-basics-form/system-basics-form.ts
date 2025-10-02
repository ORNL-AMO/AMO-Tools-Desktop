import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { SettingsService } from '../../../../settings/settings.service';
import { Assessment } from '../../../../shared/models/assessment';
import { CASystemBasics, CompressedAirAssessment } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { ConvertCompressedAirService } from '../../../convert-compressed-air.service';
import { SystemBasicsFormService } from './../system-basics-form.service';
import * as _ from 'lodash';
import { firstValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-system-basics-form',
  templateUrl: './system-basics-form.html',
  styleUrl: './system-basics-form.css',
  standalone: false
})
export class SystemBasicsFormComponent {

  showUpdateUnitsModal: boolean = false;

  assessmentSub: Subscription;
  assessment: Assessment;

  settingsForm: UntypedFormGroup;
  oldSettings: Settings;
  systemBasicsForm: UntypedFormGroup;
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;
  constructor(private settingsService: SettingsService,
    private compressedAirAssessmentService: CompressedAirAssessmentService,
    private convertCompressedAirService: ConvertCompressedAirService,
    private settingsDbService: SettingsDbService,
    private systemBasicsFormService: SystemBasicsFormService) { }


  ngOnInit() {
    this.assessmentSub = this.compressedAirAssessmentService.assessment.subscribe(val => {
      this.assessment = val;
    });
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.systemBasicsForm = this.systemBasicsFormService.getFormFromObj(compressedAirAssessment.systemBasics);
    let settings: Settings = this.compressedAirAssessmentService.settings.getValue();
    this.settingsForm = this.settingsService.getFormFromSettings(settings);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);

    if (this.assessment.compressedAirAssessment.existingDataUnits && this.assessment.compressedAirAssessment.existingDataUnits != this.oldSettings.unitsOfMeasure) {
      this.oldSettings = this.getExistingDataSettings(this.assessment.compressedAirAssessment);
      this.showUpdateDataReminder = true;
    }
  }

  ngOnDestroy() {
    this.assessmentSub.unsubscribe();

    //TODO: ADD ROUTE GAURD TO SHOW UPDATE UNITS MODAL
    // if(this.showUpdateDataReminder && this.oldSettings) {
    //   this.openUpdateUnitsModal.emit(this.oldSettings);
    // }
  }

  saveSystemBasics() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let systemBasics: CASystemBasics = this.systemBasicsFormService.getObjFromForm(this.systemBasicsForm);
    compressedAirAssessment.systemBasics = systemBasics;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
  }

  async saveSettings() {
    let currentSettings: Settings = this.compressedAirAssessmentService.settings.getValue();
    let id = currentSettings.id;
    let createdDate = currentSettings.createdDate;
    let assessmentId = currentSettings.assessmentId;

    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (newSettings.unitsOfMeasure != this.oldSettings.unitsOfMeasure) {
      let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
      compressedAirAssessment.existingDataUnits = this.oldSettings.unitsOfMeasure;
      this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
      this.showUpdateDataReminder = true;
    }

    if (this.showSuccessMessage === true) {
      this.showSuccessMessage = false;
    }

    newSettings.id = id;
    newSettings.createdDate = createdDate;
    newSettings.assessmentId = assessmentId;
    await firstValueFrom(this.settingsDbService.updateWithObservable(newSettings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
    this.compressedAirAssessmentService.settings.next(newSettings);
  }

  updateData(showSuccess?: boolean) {
    if (showSuccess) {
      this.initSuccessMessage();
    }
    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    compressedAirAssessment = this.convertCompressedAirService.convertCompressedAir(compressedAirAssessment, this.oldSettings, newSettings);
    this.showUpdateDataReminder = false;
    compressedAirAssessment.existingDataUnits = newSettings.unitsOfMeasure;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
    this.oldSettings = newSettings;
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  getExistingDataSettings(compressedAirAssessment: CompressedAirAssessment): Settings {
    let existingSettingsForm: UntypedFormGroup = _.cloneDeep(this.settingsForm);
    existingSettingsForm.patchValue({ unitsOfMeasure: compressedAirAssessment.existingDataUnits });
    let existingSettings = this.settingsService.setUnits(existingSettingsForm);
    return this.settingsService.getSettingsFromForm(existingSettings);
  }

  initSuccessMessage() {
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  dismissSuccessMessage() {
    this.showSuccessMessage = false;
  }

  initUpdateUnitsModal(oldSettings: Settings) {
    this.oldSettings = oldSettings;
    this.showUpdateUnitsModal = true;
    // this.cd.detectChanges();
  }

  closeUpdateUnitsModal(updated?: boolean) {
    if (updated) {
      this.compressedAirAssessmentService.mainTab.next('baseline');
      this.compressedAirAssessmentService.setupTab.next('system-basics');
    }
    this.showUpdateUnitsModal = false;
    // this.cd.detectChanges();
  }

  selectUpdateAction(shouldUpdateData: boolean) {
    if (shouldUpdateData == true) {
      this.updateData();
    }
    this.closeUpdateUnitsModal(shouldUpdateData);
  }

  // updateData() {
  //   let currentSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
  //   this.assessment.compressedAirAssessment = this.convertCompressedAirService.convertCompressedAir(this.assessment.compressedAirAssessment, this.oldSettings, currentSettings);
  //   this.assessment.compressedAirAssessment.existingDataUnits = currentSettings.unitsOfMeasure;
  //   this.save(this.assessment.compressedAirAssessment);
  // }
}
