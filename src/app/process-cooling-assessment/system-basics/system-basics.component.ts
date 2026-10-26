import { Component, inject, Signal, WritableSignal } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { firstValueFrom, Observable } from 'rxjs';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SettingsService } from '../../settings/settings.service';
import { copyObject } from '../../shared/helperFunctions';
import { ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
import { ConvertProcessCoolingService } from '../services/convert-process-cooling.service';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-assessment.service';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';
import { ChillerInventoryService } from '../services/chiller-inventory.service';
import { WEATHER_CONTEXT } from '../../shared/modules/weather-data/weather-context.token';

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
  private inventoryService: ChillerInventoryService = inject(ChillerInventoryService);
  private processCoolingWeatherContextService = inject(WEATHER_CONTEXT);
  private settingsDbService: SettingsDbService = inject(SettingsDbService);

  readonly assessment$: Observable<Assessment> = this.processCoolingAssessmentService.assessment$;
  readonly settings: WritableSignal<Settings> = this.processCoolingAssessmentService.settingsSignal;
  readonly processCooling: Signal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;

  settingsForm!: UntypedFormGroup;
  oldSettings!: Settings;
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;
  showUpdateUnitsModal: boolean = false;

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings());
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);

    if (this.processCooling()?.existingDataUnits && this.processCooling().existingDataUnits != this.oldSettings.unitsOfMeasure) {
      this.oldSettings = this.getExistingDataSettings(this.processCooling());
      this.showUpdateDataReminder = true;
    }
  }

  async saveSettings() {
    const currentSettings = this.settings();
    let id = currentSettings.id;
    let createdDate = currentSettings.createdDate;
    let assessmentId = currentSettings.assessmentId;

    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (newSettings.unitsOfMeasure != this.oldSettings.unitsOfMeasure) {
      let processCooling: ProcessCoolingAssessment = { ...this.processCooling() };
      processCooling.existingDataUnits = this.oldSettings.unitsOfMeasure as string;
      this.processCoolingAssessmentService.setProcessCooling(processCooling);
      this.showUpdateDataReminder = true;
      if (newSettings.unitsOfMeasure != currentSettings.unitsOfMeasure) {
        this.showUpdateUnitsModal = true;
      }
    } else if (this.showUpdateDataReminder) {
      // * units were changed back to the units of the existing data
      this.processCoolingAssessmentService.setProcessCooling({ ...this.processCooling(), existingDataUnits: newSettings.unitsOfMeasure as string });
      this.showUpdateDataReminder = false;
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
    this.processCoolingWeatherContextService.settings = newSettings;
  }

  updateData(showSuccess?: boolean) {
    if (showSuccess) {
      this.initSuccessMessage();
    }
    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    let processCooling: ProcessCoolingAssessment = copyObject(this.processCooling());
    processCooling = this.convertProcessCoolingService.convertProcessCooling(processCooling, this.oldSettings, newSettings);
    this.showUpdateDataReminder = false;
    processCooling.existingDataUnits = newSettings.unitsOfMeasure as string;
    this.processCoolingAssessmentService.setProcessCooling(processCooling);
    if (processCooling.weatherData) {
      this.processCoolingWeatherContextService.setWeatherData(processCooling.weatherData);
    }
    const selectedChillerId: string = this.inventoryService.selectedChillerValue?.itemId;
    const selectedChiller = processCooling.inventory.find(chiller => chiller.itemId === selectedChillerId);
    if (selectedChiller) {
      this.inventoryService.setSelectedChiller(selectedChiller);
    }
    this.oldSettings = newSettings;
  }

  focusField(str: string) {
    this.processCoolingUIService.focusedFieldSignal.set(str);
  }

  updateNotes(notes: string) {
    const processCooling = this.processCooling();
    this.processCoolingAssessmentService.updateProcessCoolingProperty('systemBasics', { ...processCooling.systemBasics, notes });
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

  selectUpdateAction(shouldUpdateData: boolean) {
    if (shouldUpdateData == true) {
      this.updateData();
    }
    this.showUpdateUnitsModal = false;
  }
}
