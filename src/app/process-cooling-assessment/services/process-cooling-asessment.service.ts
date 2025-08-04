import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { ProcessCoolingAssessment, ProcessCoolingDataProperty, ProcessCoolingSystemInformationProperty, SystemInformation } from '../../shared/models/process-cooling-assessment';
import { Settings } from '../../shared/models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { ConvertProcessCoolingService } from './convert-process-cooling.service';

@Injectable()
export class ProcessCoolingAssessmentService {
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly convertProcessCoolingService = inject(ConvertProcessCoolingService);

  private readonly assessment = new BehaviorSubject<Assessment>(undefined);
  readonly assessment$ = this.assessment.asObservable();

  private readonly processCooling: BehaviorSubject<ProcessCoolingAssessment> = new BehaviorSubject<ProcessCoolingAssessment>(undefined);
  readonly processCooling$ = this.processCooling.asObservable();
  processCoolingSignal: WritableSignal<ProcessCoolingAssessment> = signal<ProcessCoolingAssessment>(undefined);

  private readonly settings: BehaviorSubject<Settings> = new BehaviorSubject<Settings>(undefined);
  readonly settings$ = this.settings.asObservable();
  settingsSignal: WritableSignal<Settings> = signal<Settings>(undefined);


  setAssessment(assessment: Assessment) {
    this.assessment.next(assessment);
  }

  get assessmentValue(): Assessment {
    return this.assessment.getValue();
  }

  get settingsValue(): Settings {
    return this.settings.getValue();
  }

  setProcessCooling(processCooling: ProcessCoolingAssessment) {
    // todo may not need this pattern
    //  if (isBaselineChange) {
    //   this.setIsSetupDone(assessment)
    // }
    console.log('[ProcessCoolingService] processCooling:', processCooling);
    this.processCooling.next(processCooling);
    this.processCoolingSignal.set(processCooling);
  }

  setSettings(settings: Settings) {
    this.settings.next(settings);
    this.settingsSignal.set(settings);
  }

  // * prefer immutability, don't mutate the current object, return new (like React patterns )
  updateProcessCoolingProperty<K extends ProcessCoolingDataProperty>(key: K, value: ProcessCoolingAssessment[K]) {
    if (this.processCooling.getValue()) {
      let updatedProcessCooling = { ...this.processCooling.getValue() };
      updatedProcessCooling[key] = value;
      this.setProcessCooling(updatedProcessCooling);
    }
  }


  updateSystemInformation<K extends ProcessCoolingSystemInformationProperty>(key: K, value: SystemInformation[K]) {
    let updatedProcessCooling = { ...this.processCooling.getValue() };
    updatedProcessCooling.systemInformation[key] = value;
    this.setProcessCooling(updatedProcessCooling);
  }

  setIsSetupDone(assessment: ProcessCoolingAssessment) {
    // let settings: Settings = this.settings.getValue();
    // let hasValidSystemInformation = this.systemInformationFormService.getFormFromObj(assessment.systemInformation, settings).valid;
    let hasValidSystemSetup = true;
    let hasValidInventory = true;
    assessment.setupDone = hasValidSystemSetup && hasValidInventory;
  }

  // * logic used in every top level assessment component
  // todo move to assessments.service, return the new settings, if changed then handle assessment conversion in component
    /**
   * Initializes the settings for a given assessment.
   * 
   * If settings for the assessment already exist, they are loaded and set.
   * If not, default settings are created, associated with the assessment, and persisted.
   * If the settings use 'Metric' units, the process cooling data is converted from 'Imperial' to 'Metric'.
   * 
   * @returns A promise that resolves when initialization is complete.
   */
  async initAssessmentSettings(assessment: Assessment) {
    let settings: Settings = this.settingsDbService.getByAssessmentId(assessment, true);
    if (settings) {
      this.setSettings(settings);
    } else {
      let settings = this.settingsDbService.getByAssessmentId(assessment, false);
      delete settings.id;
      delete settings.directoryId;
      settings.assessmentId = assessment.id;
      await firstValueFrom(this.settingsDbService.addWithObservable(settings));
      let updatedSettings = await firstValueFrom(this.settingsDbService.getAllSettings());

      this.settingsDbService.setAll(updatedSettings);
      settings = this.settingsDbService.getByAssessmentId(assessment, true);

      if (settings.unitsOfMeasure == 'Metric') {
        let oldSettings: Settings = JSON.parse(JSON.stringify(settings));
        oldSettings.unitsOfMeasure = 'Imperial';
        assessment.processCooling = this.convertProcessCoolingService.convertProcessCooling(assessment.processCooling, oldSettings, settings);
      }
      // todo find out why we need settings for getting compressors
      // this.genericCompressorDbService.getAllCompressors(this.settings);
      this.setSettings(settings);
    }
    return Promise.resolve();
  }

  readonly isBaselineValid$ = this.assessment$.pipe(
    map((assessment: Assessment) => assessment ? assessment.processCooling.setupDone : false)
  );

  get assessmentId(): number | undefined {
    const assessment = this.assessment.getValue();
    return assessment ? assessment.id : undefined;
  }

  isSystemInformationValid(): boolean {
    return true;
  }
  isChillerInventoryValid(): boolean {
    return true;
  }
}