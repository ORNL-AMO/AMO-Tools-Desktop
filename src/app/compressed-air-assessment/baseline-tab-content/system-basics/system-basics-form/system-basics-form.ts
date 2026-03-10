import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { SettingsService } from '../../../../settings/settings.service';
import { CASystemBasics, CompressedAirAssessment } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { ConvertCompressedAirService } from '../../../convert-compressed-air.service';
import { SystemBasicsFormService } from './../system-basics-form.service';
import * as _ from 'lodash';
import { firstValueFrom, Subscription } from 'rxjs';
import { IntegrationState } from '../../../../shared/connected-inventory/integrations';

@Component({
  selector: 'app-system-basics-form',
  templateUrl: './system-basics-form.html',
  styleUrl: './system-basics-form.css',
  standalone: false
})
export class SystemBasicsFormComponent {
  @Output('emitShowUpdateDataReminder')
  emitShowUpdateDataReminder = new EventEmitter<boolean>();
  @Input()
  showUpdateUnitsModal: boolean;
  @Input()
  confirmResult: (result: boolean) => void;


  compressedAirAssessmentSub: Subscription;
  settingsForm: UntypedFormGroup;
  oldSettings: Settings;
  systemBasicsForm: UntypedFormGroup;
  showSuccessMessage: boolean = false;
  connectedAssessmentState: IntegrationState;
  isFormChange: boolean = false;
  showUpdateDataReminder: boolean;
  constructor(private settingsService: SettingsService,
    private compressedAirAssessmentService: CompressedAirAssessmentService,
    private convertCompressedAirService: ConvertCompressedAirService,
    private settingsDbService: SettingsDbService,
    private systemBasicsFormService: SystemBasicsFormService) { }


  ngOnInit() {
    let settings: Settings = this.compressedAirAssessmentService.settings.getValue();
    this.settingsForm = this.settingsService.getFormFromSettings(settings);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);

    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      this.setConnectedInventoryWarning(compressedAirAssessment);
      this.setShowUpdateDataReminder(compressedAirAssessment);
      if (!this.isFormChange) {
        this.systemBasicsForm = this.systemBasicsFormService.getFormFromObj(compressedAirAssessment.systemBasics);
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }

  setConnectedInventoryWarning(compressedAirAssessment: CompressedAirAssessment) {
    if (compressedAirAssessment.connectedItem) {
      this.connectedAssessmentState = {
        connectedAssessmentStatus: 'connected-to-inventory'
      }
    } else {
      this.connectedAssessmentState = {
        connectedAssessmentStatus: undefined
      }
    }
  }

  saveSystemBasics() {
    this.isFormChange = true;
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
      this.emitShowUpdateDataReminder.emit(this.showUpdateDataReminder);
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

  async updateData(showSuccess?: boolean) {
    if (showSuccess) {
      this.initSuccessMessage();
    }
    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    compressedAirAssessment = this.convertCompressedAirService.convertCompressedAir(compressedAirAssessment, this.oldSettings, newSettings);
    compressedAirAssessment.existingDataUnits = newSettings.unitsOfMeasure;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
    this.oldSettings = newSettings;
    await this.saveSettings();
    this.showUpdateDataReminder = false;
    this.emitShowUpdateDataReminder.emit(this.showUpdateDataReminder);
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

  closeUpdateUnitsModal() {
    this.showUpdateUnitsModal = false;
    this.confirmResult(true);
  }

  selectUpdateAction(shouldUpdateData: boolean) {
    if (shouldUpdateData == true) {
      this.updateData();
    }
    this.closeUpdateUnitsModal();
  }

  setShowUpdateDataReminder(compressedAirAssessment: CompressedAirAssessment) {
    if (compressedAirAssessment.existingDataUnits && compressedAirAssessment.existingDataUnits != this.oldSettings.unitsOfMeasure) {
      this.oldSettings = this.getExistingDataSettings(compressedAirAssessment);
      this.showUpdateDataReminder = true;
    } else {
      this.showUpdateDataReminder = false;
    }
    this.emitShowUpdateDataReminder.emit(this.showUpdateDataReminder);
  }
}
