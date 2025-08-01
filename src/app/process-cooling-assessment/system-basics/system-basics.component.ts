import { Component, EventEmitter, inject, Input, Output, WritableSignal } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { firstValueFrom, Observable } from 'rxjs';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SettingsService } from '../../settings/settings.service';
import { copyObject } from '../../shared/helperFunctions';
import { ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
import { ConvertProcessCoolingService } from '../services/convert-process-cooling.service';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-asessment.service';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';

@Component({
  selector: 'app-system-basics',
  standalone: false,
  templateUrl: './system-basics.component.html',
  styleUrl: './system-basics.component.css'
})
export class SystemBasicsComponent {
  private settingsService: SettingsService = inject(SettingsService);
  private processCoolingAssessmentService: ProcessCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private processCoolingUIService: ProcessCoolingUiService = inject(ProcessCoolingUiService);
  private convertProcessCoolingService: ConvertProcessCoolingService = inject(ConvertProcessCoolingService);
  private settingsDbService: SettingsDbService = inject(SettingsDbService);

  readonly assessment$: Observable<Assessment> = this.processCoolingAssessmentService.assessment$;
  readonly settings: WritableSignal<Settings> = this.processCoolingAssessmentService.settingsSignal;
  readonly processCooling: WritableSignal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;

  @Output('openUpdateUnitsModal')
  openUpdateUnitsModal = new EventEmitter<Settings>();
  settingsForm: UntypedFormGroup;
  oldSettings: Settings;
  systemBasicsForm: UntypedFormGroup;
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;
  showUpdateUnitsModal: boolean = false;

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings());
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);

    if (this.processCooling() && this.processCooling().existingDataUnits != this.oldSettings.unitsOfMeasure) {
      this.oldSettings = this.getExistingDataSettings(this.processCooling());
      this.showUpdateDataReminder = true;
    }
  }

  ngOnDestroy() {
    if (this.showUpdateDataReminder && this.oldSettings) {
      this.openUpdateUnitsModal.emit(this.oldSettings);
    }
  }

  async saveSettings() {
    const currentSettings = this.settings();
    let id = currentSettings.id;
    let createdDate = currentSettings.createdDate;
    let assessmentId = currentSettings.assessmentId;

    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (newSettings.unitsOfMeasure != this.oldSettings.unitsOfMeasure) {
      let processCooling: ProcessCoolingAssessment = this.processCooling();
      processCooling.existingDataUnits = this.oldSettings.unitsOfMeasure;
      this.processCoolingAssessmentService.setProcessCooling(processCooling);
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
    this.processCoolingAssessmentService.setSettings(newSettings);
  }

  updateData(showSuccess?: boolean) {
    if (showSuccess) {
      this.initSuccessMessage();
    }
    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    let processCooling: ProcessCoolingAssessment = this.processCooling();
    processCooling = this.convertProcessCoolingService.convertProcessCooling(processCooling, this.oldSettings, newSettings);
    this.showUpdateDataReminder = false;
    processCooling.existingDataUnits = newSettings.unitsOfMeasure;
    this.processCoolingAssessmentService.setProcessCooling(processCooling);
    this.oldSettings = newSettings;
  }

  focusField(str: string) {
    this.processCoolingUIService.focusedFieldSignal.set(str);
  }

  getExistingDataSettings(processCooling: ProcessCoolingAssessment): Settings {
    let existingSettingsForm: UntypedFormGroup = copyObject(this.settingsForm);
    existingSettingsForm.patchValue({ unitsOfMeasure: processCooling.existingDataUnits });
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
      // not sure we need below
      // this.compressedAirAssessmentService.mainTab.next('baseline');
      // this.compressedAirAssessmentService.setupTab.next('system-basics');
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
}