import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject, debounceTime, firstValueFrom, map, tap } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { ChillerInventoryItem, MonthlyOperatingSchedule, ProcessCoolingAssessment, ProcessCoolingDataProperty, ProcessCoolingSystemInformationProperty, SystemInformation, WeeklyOperatingSchedule } from '../../shared/models/process-cooling-assessment';
import { Settings } from '../../shared/models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { ConvertProcessCoolingService } from './convert-process-cooling.service';
import { getDefaultInventoryItem } from '../process-cooling-constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { WEATHER_CONTEXT, WeatherContextData } from '../../shared/modules/weather-data/weather-context.token';
import { SystemInformationFormService } from '../system-information/system-information-form.service';

/**
 * Service currently uses both signals and observables for the same state. This is a prototype, 
 * we should pick one or the other when it becomes clear which fit better with existing MEASUR patterns
 */
@Injectable()
export class ProcessCoolingAssessmentService {
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly convertProcessCoolingService = inject(ConvertProcessCoolingService);
  private readonly assessmentDbService = inject(AssessmentDbService);
  private readonly processCoolingWeatherContextService = inject(WEATHER_CONTEXT);

  private readonly systemInformationFormService = inject(SystemInformationFormService);
  
  private readonly assessment = new BehaviorSubject<Assessment>(undefined);
  readonly assessment$ = this.assessment.asObservable();

  private readonly processCooling: BehaviorSubject<ProcessCoolingAssessment> = new BehaviorSubject<ProcessCoolingAssessment>(undefined);
  readonly processCooling$ = this.processCooling.asObservable();
  processCoolingSignal: WritableSignal<ProcessCoolingAssessment> = signal<ProcessCoolingAssessment>(undefined);

  private readonly settings: BehaviorSubject<Settings> = new BehaviorSubject<Settings>(undefined);
  readonly settings$ = this.settings.asObservable();
  settingsSignal: WritableSignal<Settings> = signal<Settings>(undefined);

  constructor() {
    // * keep DB updates in service as a side-effect of state changes (instead of top-level component)
    this.assessment$.pipe(
      debounceTime(300),
      tap(assessment => {
        if (assessment) {
          this.assessmentDbService.updateWithObservable(assessment).subscribe(
            () => { console.log('Updated assessment in db'); },
            (error) => { console.error('Error updating assessment in db', error); }
          );
        }
      }),
      takeUntilDestroyed()
    ).subscribe();

    this.processCoolingWeatherContextService.weatherContextData$.pipe(
      tap(weatherData => {
        const isValidWeatherData = this.processCoolingWeatherContextService.isValidWeatherData();
        if (isValidWeatherData) {
          this.setProcessCoolingWeatherData(weatherData);
        }
      }),
      takeUntilDestroyed()
    ).subscribe();
  }

  setAssessment(assessment: Assessment) {
    this.assessment.next(assessment);
  }

  get assessmentValue(): Assessment {
    return this.assessment.getValue();
  }

  get settingsValue(): Settings {
    return this.settings.getValue();
  }

  // todo too many sources of truth
  setProcessCooling(processCooling: ProcessCoolingAssessment) {
    console.log('[ProcessCoolingService] processCooling:', processCooling);
    // todo will have race conditions if used together (isBaselineValid$)
    this.processCooling.next(processCooling);
    this.processCoolingSignal.set(processCooling);

    const updatedAssessment = { ...this.assessmentValue, processCooling };
    this.setAssessment(updatedAssessment);
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

  updateSystemInformationProperty<K extends ProcessCoolingSystemInformationProperty>(key: K, value: SystemInformation[K]) {
    let updatedProcessCooling = { ...this.processCooling.getValue() };
    updatedProcessCooling.systemInformation[key] = value;
    this.setProcessCooling(updatedProcessCooling);
  }

  updateWeeklyOperatingSchedule(weeklyOperatingSchedule: WeeklyOperatingSchedule) {
    let updatedProcessCooling = { ...this.processCooling.getValue() };
    // todo process weekly schedule into hours on per day see form service
    updatedProcessCooling.weeklyOperatingSchedule = weeklyOperatingSchedule;
    this.setProcessCooling(updatedProcessCooling);
  }

  updateMonthlyOperatingSchedule(monthlyOperatingSchedule: MonthlyOperatingSchedule) {
    let updatedProcessCooling = { ...this.processCooling.getValue() };
    // todo process monthly schedule into hours on per month
    updatedProcessCooling.monthlyOperatingSchedule = monthlyOperatingSchedule;
    this.setProcessCooling(updatedProcessCooling);
  }
  
    /**
   * Adds new default chiller
   * @returns The new chiller.
   */
  addNewChillerToAssessment(): ChillerInventoryItem {
    let newChiller: ChillerInventoryItem = getDefaultInventoryItem();
    let updatedProcessCooling = { ...this.processCooling.getValue() };
    updatedProcessCooling.inventory.push(newChiller);
    this.setProcessCooling(updatedProcessCooling);
    return newChiller;
  }

  /**
   * Deletes a chiller from the assessment.
   * @returns The updated inventory after deletion.
   */
  deleteChillerFromAssessment(id: string) {
    let updatedProcessCooling = { ...this.processCooling.getValue() };
    let itemIndex: number = updatedProcessCooling.inventory.findIndex(inventoryItem => { return inventoryItem.itemId == id });
    if (itemIndex !== -1) {
      updatedProcessCooling.inventory.splice(itemIndex, 1);
      this.setProcessCooling(updatedProcessCooling);
    }
    return updatedProcessCooling.inventory;
  }

  updateAssessmentChiller(updatedChiller: ChillerInventoryItem) {
    let updatedProcessCooling = { ...this.processCooling.getValue() };
    updatedProcessCooling.inventory = updatedProcessCooling.inventory.map(chiller => {
      if (chiller.itemId === updatedChiller.itemId) {
        return { ...updatedChiller};
      }
      return chiller;
    });
    this.setProcessCooling(updatedProcessCooling);
  }

  setProcessCoolingWeatherData(data: WeatherContextData) {
    let updatedProcessCooling = { ...this.processCooling.getValue() };
    updatedProcessCooling.weatherData = data;
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

  readonly isBaselineValid$ = this.processCooling$.pipe(
    map((processCooling: ProcessCoolingAssessment) => {
      if (processCooling) {
        const isSystemInformationValid = this.isSystemInformationValid(processCooling.systemInformation);
        const isChillerInventoryValid = this.isChillerInventoryValid(processCooling.inventory);
        const isSystemOperatingDataValid = this.isSystemOperatingDataValid(processCooling.weeklyOperatingSchedule, processCooling.monthlyOperatingSchedule);
        const isWeatherDataValid = this.processCoolingWeatherContextService.isValidWeatherData();
        const isValid = isSystemInformationValid && isChillerInventoryValid && isSystemOperatingDataValid && isWeatherDataValid;
        console.log('isBaselineValid', isValid);
        return isValid;
      }
      return false;
    })
  );

  readonly isSystemInformationValid$ = this.processCooling$.pipe(
    map((processCooling: ProcessCoolingAssessment) => {
      if (processCooling) {
        const isSystemInformationValid = this.isSystemInformationValid(processCooling.systemInformation);
        return isSystemInformationValid;
      }
      return false;
    })
  );

  readonly isChillerInventoryValid$ = this.processCooling$.pipe(
    map((processCooling: ProcessCoolingAssessment) => {
      if (processCooling && processCooling.inventory) {
        return this.isChillerInventoryValid(processCooling.inventory);
      }
      return false;
    })
  );

  readonly isOperatingScheduleValid$ = this.processCooling$.pipe(
    map((processCooling: ProcessCoolingAssessment) => {
      return this.isSystemOperatingDataValid(processCooling?.weeklyOperatingSchedule, processCooling?.monthlyOperatingSchedule);
    })
  );

  readonly isLoadScheduleValid$ = this.processCooling$.pipe(
    map((processCooling: ProcessCoolingAssessment) => {
      if (processCooling && processCooling.monthlyOperatingSchedule && processCooling.monthlyOperatingSchedule.hoursOnPerMonth) {
        return processCooling.monthlyOperatingSchedule.hoursOnPerMonth.some(hour => hour > 0);
      }
      return false;
    })
  );



  get condenserCoolingMethod(): number {
    return this.processCoolingSignal()?.systemInformation.operations.condenserCoolingMethod;
  }

  get assessmentId(): number | undefined {
    const assessment = this.assessment.getValue();
    return assessment ? assessment.id : undefined;
  }

  isSystemInformationValid(systemInformation: SystemInformation): boolean {
    return this.systemInformationFormService.isValid(systemInformation);
  }
  isChillerInventoryValid(chillerInventory: ChillerInventoryItem[]): boolean {
    return chillerInventory && chillerInventory.length > 0;
  }
  isSystemOperatingDataValid(weeklyOperatingSchedule: WeeklyOperatingSchedule, monthlyOperatingSchedule: MonthlyOperatingSchedule): boolean {
    if (weeklyOperatingSchedule && monthlyOperatingSchedule) {
      const validWeekly = weeklyOperatingSchedule.hoursOnMonToSun && weeklyOperatingSchedule.hoursOnMonToSun.some(hour => hour > 0);
      const validMonthly = monthlyOperatingSchedule.hoursOnPerMonth && monthlyOperatingSchedule.hoursOnPerMonth.some(hour => hour > 0);
      return validWeekly && validMonthly;
    }
    return false;
  }
}