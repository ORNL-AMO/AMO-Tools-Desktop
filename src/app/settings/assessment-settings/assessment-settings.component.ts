import { Component, inject, Injector, OnInit, Signal } from '@angular/core';
import { FeatureFlagService } from '../../shared/feature-flag.service';
import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../settings.service'
 
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { UntypedFormGroup } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ResetDataModalComponent, ResetDataResult } from './reset-data-modal/reset-data-modal.component';

@Component({
    selector: 'app-assessment-settings',
    templateUrl: './assessment-settings.component.html',
    styleUrls: ['./assessment-settings.component.css'],
    standalone: false
})
export class AssessmentSettingsComponent implements OnInit {
  public featureFlagService: FeatureFlagService = inject(FeatureFlagService);
  private modalDialogService: ModalDialogService = inject(ModalDialogService);
  private dashboardService: DashboardService = inject(DashboardService);
  private injector: Injector = inject(Injector);
  settings: Settings;
  settingsForm: UntypedFormGroup;

  //add boolean for each section
  showGeneralSettings: boolean = false;
  showPsatSettings: boolean = false;
  showPhastSettings: boolean = false;
  showSteamSettings: boolean = false;
  showFsatSettings: boolean = false;
  showTutorialSettings: boolean = false;
  showPrintSettings: boolean = false;
  showOperationalImpactOptions: boolean = false;
  showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;

  constructor(   
    private settingsDbService: SettingsDbService, 
    private settingsService: SettingsService) {
  }

  ngOnInit() {
    this.initializeSettings();
  }
  
  initializeSettings() {
    this.settings = this.settingsDbService.globalSettings;
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
  }

  async updateSettings() {
    let tmpSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    tmpSettings.directoryId = this.settings.directoryId;
    tmpSettings.id = this.settings.id;
    tmpSettings.appVersion = this.settings.appVersion;
    tmpSettings.disableTutorial = this.settings.disableTutorial;
    await firstValueFrom(this.settingsDbService.updateWithObservable(tmpSettings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());  
    this.settingsDbService.setAll(updatedSettings);
    this.settings = this.settingsDbService.findById(this.settings.id);
  }

  toggleOperationalImpactsOptions() {
    this.showOperationalImpactOptions = !this.showOperationalImpactOptions;
  }

  setShowOperationalImpacts(enabled: boolean) {
    this.featureFlagService.setShowOperationalImpacts(enabled);
  }

  async saveSettings() {
    await firstValueFrom(this.settingsDbService.updateWithObservable(this.settings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());  
    this.settingsDbService.setAll(updatedSettings);
    this.settings = this.settingsDbService.getByDirectoryId(this.settings.id);
  }

  //simple toggle function needed for each section
  toggleGeneralSettings() {
    this.showGeneralSettings = !this.showGeneralSettings;
  }
  togglePsatSettings() {
    this.showPsatSettings = !this.showPsatSettings;
  }
  togglePhastSettings() {
    this.showPhastSettings = !this.showPhastSettings;
  }
  toggleSteamSettings() {
    this.showSteamSettings = !this.showSteamSettings;
  }

  toggleFsatSettings() {
    this.showFsatSettings = !this.showFsatSettings;
  }

  toggleTutorialSettings() {
    this.showTutorialSettings = !this.showTutorialSettings;
  }

  togglePrintSettings() {
    this.showPrintSettings = !this.showPrintSettings;
  }

  showResetSystemSettingsModal() {
    // The injector carries module-level providers (e.g. DashboardService) the modal and its ResetDataService need.
    this.modalDialogService.openModal<ResetDataResult, undefined, ResetDataModalComponent>(
      ResetDataModalComponent,
      {
        width: '720px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        // reset-data-modal-dialog (src/assets/styles/app.css) makes the dialog full screen on small views.
        panelClass: ['app-modal-dialog', 'reset-data-modal-dialog'],
        disableClose: true,
        ariaLabelledBy: 'resetDataModalTitle'
      },
      this.injector
    ).closed.subscribe((result: ResetDataResult | undefined) => {
      if (result?.dataChanged) {
        this.initializeSettings();
        this.dashboardService.updateDashboardData.next(true);
      }
    });
  }
}
