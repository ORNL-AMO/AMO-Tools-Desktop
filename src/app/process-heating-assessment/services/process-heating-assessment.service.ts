import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject, debounceTime, firstValueFrom, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Assessment } from '../../shared/models/assessment';
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { ConvertPhastService } from '../../phast/convert-phast.service';
import { HeatingEquipmentConfiguration } from '../models/views';

export type ProcessHeatingDataProperty = keyof PHAST;

export function deriveHeatingEquipmentConfiguration(settings: Settings): HeatingEquipmentConfiguration {
  if (!settings) return HeatingEquipmentConfiguration.FUEL_FIRED;
  if (settings.energySourceType === 'Electricity') {
    if (settings.furnaceType === 'Electric Arc Furnace (EAF)') return HeatingEquipmentConfiguration.ELECTROTECHNOLOGY_EAF;
    if (settings.furnaceType === 'Custom Electrotechnology') return HeatingEquipmentConfiguration.CUSTOM_ELECTROTECHNOLOGY;
    return HeatingEquipmentConfiguration.ELECTROTECHNOLOGY_STANDARD;
  }
  if (settings.energySourceType === 'Steam') return HeatingEquipmentConfiguration.STEAM;
  return HeatingEquipmentConfiguration.FUEL_FIRED;
}

@Injectable()
export class ProcessHeatingAssessmentService {
  private readonly assessmentDbService = inject(AssessmentDbService);
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly convertPhastService = inject(ConvertPhastService);

  private readonly assessment = new BehaviorSubject<Assessment>(undefined);
  readonly assessment$ = this.assessment.asObservable();

  private readonly processHeating = new BehaviorSubject<PHAST>(undefined);
  readonly processHeating$ = this.processHeating.asObservable();
  readonly processHeatingSignal: Signal<PHAST> = toSignal(this.processHeating$, { requireSync: true });

  private readonly settings = new BehaviorSubject<Settings>(undefined);
  readonly settings$ = this.settings.asObservable();
  readonly settingsSignal: WritableSignal<Settings> = signal<Settings>(undefined);

  readonly heatingEquipmentConfiguration: Signal<HeatingEquipmentConfiguration> = computed(() =>
    deriveHeatingEquipmentConfiguration(this.settingsSignal())
  );

  constructor() {
    this.assessment$.pipe(
      debounceTime(300),
      switchMap(assessment => {
        if (assessment) {
          return this.assessmentDbService.updateWithObservable(assessment).pipe(
             // * getAllAssessments -> setAll workflow is only to satisfy legacy MEASUR patterns that are used for keeping items in memory. 
            // * Satisfying this pattern fixes stale assessment data in the directories
            switchMap(() => this.assessmentDbService.getAllAssessments()),
            tap(allAssessments => this.assessmentDbService.setAll(allAssessments)),
          );
        }
        return [];
      }),
      takeUntilDestroyed()
    ).subscribe();
  }

  setAssessment(assessment: Assessment): void {
    this.assessment.next(assessment);
  }

  get assessmentValue(): Assessment {
    return this.assessment.getValue();
  }

  get settingsValue(): Settings {
    return this.settings.getValue();
  }

  setProcessHeating(phast: PHAST): void {
    this.processHeating.next(phast);
    this.setAssessment({ ...this.assessmentValue, phast });
  }

  setSettings(settings: Settings): void {
    this.settings.next(settings);
    this.settingsSignal.set(settings);
  }

  updateProcessHeatingProperty<K extends ProcessHeatingDataProperty>(key: K, value: PHAST[K]): void {
    const current = this.processHeating.getValue();
    if (current) {
      this.setProcessHeating({ ...current, [key]: value });
    }
  }

  async initAssessmentSettings(assessment: Assessment): Promise<void> {
    let settings: Settings = this.settingsDbService.getByAssessmentId(assessment, true);
    if (settings) {
      this.setSettings(settings);
      return;
    }

    let dirSettings = this.settingsDbService.getByAssessmentId(assessment, false);
    delete dirSettings.id;
    delete dirSettings.directoryId;
    dirSettings.assessmentId = assessment.id;
    await firstValueFrom(this.settingsDbService.addWithObservable(dirSettings));
    const updatedSettings = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
    settings = this.settingsDbService.getByAssessmentId(assessment, true);

    if (settings.unitsOfMeasure === 'Metric') {
      const oldSettings: Settings = JSON.parse(JSON.stringify(settings));
      oldSettings.unitsOfMeasure = 'Imperial';
      assessment.phast = this.convertPhastService.convertExistingData(assessment.phast, oldSettings, settings);
    }

    this.setSettings(settings);
  }
}
