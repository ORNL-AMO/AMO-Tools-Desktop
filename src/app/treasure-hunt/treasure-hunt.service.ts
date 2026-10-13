import { DestroyRef, inject, Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, debounceTime, filter, firstValueFrom, switchMap, tap } from 'rxjs';
import { TreasureHunt } from '../shared/models/treasure-hunt';
import { Settings } from '../shared/models/settings';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SettingsService } from '../settings/settings.service';
import { Assessment } from '../shared/models/assessment';
import { Router } from '@angular/router';
import { TREASURE_HUNT_MAIN_VIEWS } from './routing/treasure-hunt.routing';

@Injectable()
export class TreasureHuntService {

  treasureHunt: BehaviorSubject<TreasureHunt>;

  private readonly settings: BehaviorSubject<Settings> = new BehaviorSubject<Settings>(undefined);
  readonly settings$ = this.settings.asObservable();
  private destroyRef = inject(DestroyRef);

  mainTab: BehaviorSubject<string>;
  subTab: BehaviorSubject<string>;
  getResults: BehaviorSubject<boolean>;
  updateMenuOptions: BehaviorSubject<boolean>;
  modalOpen: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;
  showExportModal: BehaviorSubject<boolean>;
  assessmentId: number;

  constructor(
        private settingsDbService: SettingsDbService,
        private settingsService: SettingsService,
        private router: Router
  ) {
    this.mainTab = new BehaviorSubject<string>('baseline');
    this.subTab = new BehaviorSubject<string>('settings');
    this.getResults = new BehaviorSubject<boolean>(true);
    this.updateMenuOptions = new BehaviorSubject<boolean>(true);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.treasureHunt = new BehaviorSubject<TreasureHunt>(undefined);
    this.currentField = new BehaviorSubject<string>('operation-costs');
    this.showExportModal = new BehaviorSubject<boolean>(false);

    this.settings$.pipe(
      debounceTime(150),
      filter(settings => Boolean(settings)),
      concatMap(settings =>
        this.settingsDbService.updateWithObservable(settings).pipe(
          switchMap(() => this.settingsDbService.getAllSettings()),
          tap(allSettings => this.settingsDbService.setAll(allSettings)),
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: (error) => console.error('Error updating settings in db', error)
    });
  }

  setTreasureHuntSettings(settings: Settings) {
    this.settings.next(settings);
  }

  async initializeSettings(assessment: Assessment): Promise<void> {
    let settings = this.settingsDbService.getByAssessmentId(assessment, true);
    if (!settings) {
      settings = await this.createTreasureHuntSettings(assessment);
    }
    this.setTreasureHuntSettings(settings);
  }

  async createTreasureHuntSettings(assessment: Assessment): Promise<Settings> {
    let defaultSettings: Settings = this.settingsDbService.getByAssessmentId(assessment, false);
    // ? unclear what this is for - did we already set defaults from above inner call to getDefaultSettings
    let newSettings: Settings = this.settingsService.getNewSettingFromSetting(defaultSettings);
    
    newSettings.assessmentId = assessment.id;
    let addedSettings = await firstValueFrom(this.settingsDbService.addWithObservable(newSettings));

    let allSettings = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(allSettings);
    return addedSettings;
  }

  async setTreasureHuntTutorialsDisabled() {
    this.settingsDbService.globalSettings.disableTreasureHuntTutorial = true;
    await firstValueFrom(this.settingsDbService.updateWithObservable(this.settingsDbService.globalSettings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
  }

  /**
   * @param view one of `TREASURE_HUNT_MAIN_VIEWS`
   */
  goToMainTab(view: string) {
    if (this.assessmentId) {
      this.router.navigate(['/treasure-hunt', this.assessmentId, view]);
    }
  }

  continueMainTab() {
    this.stepMainTab(1);
  }

  backMainTab() {
    this.stepMainTab(-1);
  }

  private stepMainTab(offset: number) {
    const index: number = TREASURE_HUNT_MAIN_VIEWS.indexOf(this.mainTab.getValue());
    const view: string = TREASURE_HUNT_MAIN_VIEWS[index + offset];
    if (index !== -1 && view) {
      this.goToMainTab(view);
    }
  }
}

