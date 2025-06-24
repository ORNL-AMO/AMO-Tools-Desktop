import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import _ from 'lodash';
import { firstValueFrom } from 'rxjs';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SettingsService } from '../../settings/settings.service';
import { Assessment } from '../../shared/models/assessment';
import { SystemBasicsFormService } from './system-basics-form.service';
import { ProcessCoolingAssessment, ProcessCoolingSystemBasics } from '../../shared/models/process-cooling-assessment';
import { ConvertProcessCoolingService } from '../convert-process-cooling.service';
import { ProcessCoolingService } from '../process-cooling.service';
import { Settings } from '../../shared/models/settings';
import { copyObject } from '../../shared/helperFunctions';

@Component({
  selector: 'app-system-basics',
  standalone: false,
  templateUrl: './system-basics.component.html',
  styleUrl: './system-basics.component.css'
})
export class SystemBasicsComponent {
 @Input()
  assessment: Assessment;
  @Output('openUpdateUnitsModal') 
  openUpdateUnitsModal = new EventEmitter<Settings>();
  
  
  settingsForm: UntypedFormGroup;
  oldSettings: Settings;
  systemBasicsForm: UntypedFormGroup;
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;
  constructor(private settingsService: SettingsService,
    private processCoolingService: ProcessCoolingService,
    private convertProcessCoolingService: ConvertProcessCoolingService,
    private settingsDbService: SettingsDbService,
    private systemBasicsFormService: SystemBasicsFormService) { }


  ngOnInit() {
    let processCooling: ProcessCoolingAssessment = this.processCoolingService.processCooling.getValue();
    this.systemBasicsForm = this.systemBasicsFormService.getFormFromObj(processCooling.systemBasics);
    let settings: Settings = this.processCoolingService.settings.getValue();
    this.settingsForm = this.settingsService.getFormFromSettings(settings);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);

    if (this.assessment.processCooling.existingDataUnits && this.assessment.processCooling.existingDataUnits != this.oldSettings.unitsOfMeasure) {
      this.oldSettings = this.getExistingDataSettings(this.assessment.processCooling);
      this.showUpdateDataReminder = true;
    }
  }

  ngOnDestroy() {
    if(this.showUpdateDataReminder && this.oldSettings) {
      this.openUpdateUnitsModal.emit(this.oldSettings);
    }
  }

  saveSystemBasics() {
    let processCooling: ProcessCoolingAssessment = this.processCoolingService.processCooling.getValue();
    let systemBasics: ProcessCoolingSystemBasics = this.systemBasicsFormService.getObjFromForm(this.systemBasicsForm);
    processCooling.systemBasics = systemBasics;
    this.processCoolingService.updateProcessCooling(processCooling, true);
  }

  async saveSettings() {
    let currentSettings: Settings = this.processCoolingService.settings.getValue();
    let id = currentSettings.id;
    let createdDate = currentSettings.createdDate;
    let assessmentId = currentSettings.assessmentId;

    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (newSettings.unitsOfMeasure != this.oldSettings.unitsOfMeasure) {
      let processCooling: ProcessCoolingAssessment = this.processCoolingService.processCooling.getValue();
      processCooling.existingDataUnits = this.oldSettings.unitsOfMeasure;
      this.processCoolingService.updateProcessCooling(processCooling, true);
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
    this.processCoolingService.settings.next(newSettings);
  }

  updateData(showSuccess?: boolean) {
    if(showSuccess) {
      this.initSuccessMessage();
    }
    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    let processCooling: ProcessCoolingAssessment = this.processCoolingService.processCooling.getValue();
    processCooling = this.convertProcessCoolingService.convertProcessCooling(processCooling, this.oldSettings, newSettings);
    this.showUpdateDataReminder = false;
    processCooling.existingDataUnits = newSettings.unitsOfMeasure;
    this.processCoolingService.updateProcessCooling(processCooling, true);
    this.oldSettings = newSettings;
  }

  focusField(str: string) {
    this.processCoolingService.focusedField.next(str);
  }

  getExistingDataSettings(processCooling: ProcessCoolingAssessment): Settings {
    let existingSettingsForm: UntypedFormGroup = copyObject(this.settingsForm);
    existingSettingsForm.patchValue({unitsOfMeasure: processCooling.existingDataUnits});
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
}
