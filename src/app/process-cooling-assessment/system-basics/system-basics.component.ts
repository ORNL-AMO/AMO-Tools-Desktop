import { Component, computed, inject, Signal, WritableSignal } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { firstValueFrom, Observable } from 'rxjs';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SettingsService } from '../../settings/settings.service';
import { ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
import { ConvertProcessCoolingService } from '../services/convert-process-cooling.service';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-assessment.service';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';
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
  private processCoolingWeatherContextService = inject(WEATHER_CONTEXT);
  private settingsDbService: SettingsDbService = inject(SettingsDbService);

  readonly assessment$: Observable<Assessment> = this.processCoolingAssessmentService.assessment$;
  readonly settings: WritableSignal<Settings> = this.processCoolingAssessmentService.settingsSignal;
  readonly processCooling: Signal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;
  readonly showUpdateDataReminder: Signal<boolean> = computed(() => {
    const existingDataUnits: string = this.processCooling()?.existingDataUnits;
    return Boolean(existingDataUnits) && existingDataUnits !== this.settings()?.unitsOfMeasure;
  });

  settingsForm!: UntypedFormGroup;
  showSuccessMessage: boolean = false;

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings());
  }

  async saveSettings() {
    const currentSettings = this.settings();
    let id = currentSettings.id;
    let createdDate = currentSettings.createdDate;
    let assessmentId = currentSettings.assessmentId;

    let newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (newSettings.unitsOfMeasure != currentSettings.unitsOfMeasure) {
      // * existingDataUnits keeps the units of the data until it is updated, so changing units back clears the reminder
      const existingDataUnits: string = this.processCooling().existingDataUnits ?? currentSettings.unitsOfMeasure;
      if (existingDataUnits !== this.processCooling().existingDataUnits) {
        this.processCoolingAssessmentService.setProcessCooling({ ...this.processCooling(), existingDataUnits });
      }
      if (newSettings.unitsOfMeasure != existingDataUnits) {
        this.processCoolingUIService.showUpdateUnitsModalSignal.set(true);
      }
      this.convertWeatherData(currentSettings, newSettings);
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

  updateData() {
    this.initSuccessMessage();
    this.processCoolingAssessmentService.updateDataUnits(this.settings());
  }

  /**
   * Weather data comes from a station or file, so it always follows the settings units, independent of "Update Data"
   */
  convertWeatherData(currentSettings: Settings, newSettings: Settings) {
    const weatherData = this.processCoolingWeatherContextService.getWeatherData();
    if (!weatherData?.weatherDataPoints) return;
    const convertedWeatherData = this.convertProcessCoolingService.convertWeatherData(weatherData, currentSettings, newSettings);
    this.processCoolingWeatherContextService.setWeatherData(convertedWeatherData);
    this.processCoolingAssessmentService.setProcessCooling({ ...this.processCooling(), weatherData: convertedWeatherData });
  }

  focusField(str: string) {
    this.processCoolingUIService.focusedFieldSignal.set(str);
  }

  updateNotes(notes: string) {
    const processCooling = this.processCooling();
    this.processCoolingAssessmentService.updateProcessCoolingProperty('systemBasics', { ...processCooling.systemBasics, notes });
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
