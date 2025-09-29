import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AssessmentService } from '../dashboard/assessment.service';
import { catchError, first, firstValueFrom, Subscription } from 'rxjs';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { CoreService } from './core.service';
import { Router } from '../../../node_modules/@angular/router';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { SecurityAndPrivacyService } from '../shared/security-and-privacy/security-and-privacy.service';
import { ElectronService } from '../electron/electron.service';
import { EmailMeasurDataService } from '../shared/email-measur-data/email-measur-data.service';
import { AppErrorService } from '../shared/errors/app-error.service';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { AutomaticBackupService } from '../electron/automatic-backup.service';
import { ApplicationInstanceData, ApplicationInstanceDbService } from '../indexedDb/application-instance-db.service';
import { ImportBackupModalService } from '../shared/import-backup-modal/import-backup-modal.service';
import { MeasurSurveyService } from '../shared/measur-survey/measur-survey.service';
import { UpdateApplicationService } from '../shared/update-application/update-application.service';
import { EmailListSubscribeService } from '../shared/subscribe-toast/email-list-subscribe.service';
import { ExportToJustifiTemplateService } from '../shared/export-to-justifi-modal/export-to-justifi-services/export-to-justifi-template.service';
import { CORE_DATA_WARNING, SECONDARY_DATA_WARNING, SnackbarService } from '../shared/snackbar-notification/snackbar.service';
import { BrowserStorageAvailable, BrowserStorageService } from '../shared/browser-storage.service';
import { SolidLiquidMaterialDbService } from '../indexedDb/solid-liquid-material-db.service';
import { FlueGasMaterialDbService } from '../indexedDb/flue-gas-material-db.service';
import { ToolsSuiteApiService } from '../tools-suite-api/tools-suite-api.service';
import {Dialog, DialogRef} from '@angular/cdk/dialog';
import { ModalDialogService } from '../shared/modal-dialog.service';

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css'],
  standalone: false
})

export class CoreComponent implements OnInit {
  hideTutorial: boolean = true;
  openingTutorialSub: Subscription;
  idbStarted: boolean = false;
  tutorialType: string;
  inTutorialsView: boolean;
  analyticsSessionId: string;
  applicationInstanceDataSubscription: Subscription;
  routerSubscription: Subscription;
  showSubscribeModal: boolean = false;

  // * Modals
  showEmailMeasurDataModalSub: Subscription;
  showEmailMeasurDataModal: boolean;
  showImportBackupModalSubscription: Subscription;
  showImportBackupModal: boolean;
  showSecurityAndPrivacyModalSub: Subscription;
  showSecurityAndPrivacyModal: boolean;
  showSurveyModalSub: Subscription;
  showSurveyModal: boolean;
  showSurveyToast: boolean;
  showSubscribeToast: boolean;
  showReleaseNotesModal: boolean;
  showReleaseNotesModalSub: Subscription;
  showSubscribeToastSub: Subscription;
  subscribeModalSub: Subscription;
  emailVisibilitySubscription: Subscription;
  showExportToJustifiModal: boolean = false;
  showExportToJustifiModalSub: Subscription;
  showShareDataModal: boolean = false;
  showShareDataModalSub: Subscription;

  toolsSuiteInitialized: boolean;
  toolsSuiteInitializedSub: Subscription;
  loadingMessage: string;
  defaultDbDataInitialized: boolean = false;

  appModalDialogSubscription: Subscription;
  appModalDialog: DialogRef<any, any>;
  constructor(public electronService: ElectronService,
    private assessmentService: AssessmentService,
    private changeDetectorRef: ChangeDetectorRef,
    private assessmentDbService: AssessmentDbService,
    private diagramIdbService: DiagramIdbService,
    private settingsDbService: SettingsDbService,
    private directoryDbService: DirectoryDbService,
    private calculatorDbService: CalculatorDbService,
    private coreService: CoreService,
    private router: Router,
    private securityAndPrivacyService: SecurityAndPrivacyService,
    private emailMeasurDataService: EmailMeasurDataService,
    private appErrorService: AppErrorService,
    private automaticBackupService: AutomaticBackupService,
    private applicationInstanceDbService: ApplicationInstanceDbService,
    private importBackupModalService: ImportBackupModalService,
    private measurSurveyService: MeasurSurveyService,
    private updateApplicationService: UpdateApplicationService,
    private emailSubscribeService: EmailListSubscribeService,
    private inventoryDbService: InventoryDbService,
    private snackBarService: SnackbarService,
    private browserStorageService: BrowserStorageService,
    private exportToJustifiTemplateService: ExportToJustifiTemplateService,
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService,
    private toolsSuiteApiService: ToolsSuiteApiService,
    private modalDialogService: ModalDialogService
  ) {
  }

  ngOnInit() {
    this.setLoadingMessage();
    this.toolsSuiteInitializedSub = this.coreService.initializedToolsSuiteModule.subscribe(val => {
      this.toolsSuiteInitialized = val;
      this.initializeDefaultDbData();
    });

    if (this.electronService.isElectron) {
      this.electronService.sendAppReady('ready');
    }
    this.applicationInstanceDataSubscription = this.applicationInstanceDbService.applicationInstanceData.subscribe((applicationData: ApplicationInstanceData) => {
      if (applicationData) {
        this.setSurveyToastVisibility(applicationData);
        if (!this.automaticBackupService.observableDataChanges && applicationData.isAutomaticBackupOn) {
          this.automaticBackupService.subscribeToDataChanges();
        }
      }
    });

    this.emailVisibilitySubscription = this.applicationInstanceDbService.applicationInstanceData
      .pipe(
        first(data => !!data)
      )
      .subscribe(applicationData => {
        this.emailSubscribeService.setEmailSubscribeVisibility(applicationData);
      });

    this.showSurveyModalSub = this.measurSurveyService.showSurveyModal.subscribe(val => {
      this.showSurveyModal = val;
      if (this.showSurveyModal) {
        this.setSurveyDone();
      }
    });

    this.showSubscribeToastSub = this.emailSubscribeService.shouldShowToast.subscribe((showSubscribeToast: boolean) => {
      if (showSubscribeToast) {
        setTimeout(() => {
          this.showSubscribeToast = showSubscribeToast
        }, 5000);
      } else {
        this.showSubscribeToast = false;
      }
    });

    this.subscribeModalSub = this.emailSubscribeService.showModal.subscribe((isOpen: boolean) => {
      this.showSubscribeModal = isOpen;
    });


    this.showReleaseNotesModalSub = this.updateApplicationService.showReleaseNotesModal.subscribe(val => {
      this.showReleaseNotesModal = val;
    });

    this.browserStorageService.detectAppStorageOptions().subscribe((browserStorageOptions: BrowserStorageAvailable) => {
      if (browserStorageOptions.indexedDB.success) {
        let cookiesFunction = browserStorageOptions.cookies.navigatorEnabled && (browserStorageOptions.cookies.successfulWrite || (this.electronService.isElectron && !browserStorageOptions.cookies.successfulWrite));
        if (!browserStorageOptions.localStorage || !cookiesFunction) {
          this.snackBarService.setSnackbarMessage(SECONDARY_DATA_WARNING, 'info', 'none', [
            { label: 'Data Storage and Backup', uri: '/data-and-backup' },
            { label: 'Privacy', uri: '/privacy' }
          ]);
        } else if (!this.electronService.isElectron) {
          setTimeout(() => {
            this.snackBarService.setSnackbarMessage('appDataStorageNotice', 'info', 'none', [
              { label: 'Data Storage and Backup', uri: '/data-and-backup' },
              { label: 'Privacy', uri: '/privacy' }
            ]);
          }, 3000);
        }
        this.initData();
      } else {
        this.snackBarService.setSnackbarMessage(CORE_DATA_WARNING, 'danger', 'none');
      }
    });

    this.openingTutorialSub = this.assessmentService.showTutorial.subscribe(val => {
      this.inTutorialsView = (this.router.url === '/tutorials');
      if (val && !this.assessmentService.tutorialShown) {
        this.hideTutorial = false;
        this.tutorialType = val;
        this.changeDetectorRef.detectChanges();
      }
    });

    this.showSecurityAndPrivacyModalSub = this.securityAndPrivacyService.showSecurityAndPrivacyModal.subscribe(showSecurityAndPrivacyModal => {
      this.showSecurityAndPrivacyModal = showSecurityAndPrivacyModal;
    });

    this.showEmailMeasurDataModalSub = this.emailMeasurDataService.showEmailMeasurDataModal.subscribe(showModal => {
      this.showEmailMeasurDataModal = showModal;
    });

    this.showImportBackupModalSubscription = this.importBackupModalService.showImportBackupModal.subscribe(showModal => {
      this.showImportBackupModal = showModal;
    });

    this.showExportToJustifiModalSub = this.exportToJustifiTemplateService.showExportToJustifiModal.subscribe(val => {
      this.showExportToJustifiModal = val;
    });

    this.showShareDataModalSub = this.coreService.showShareDataModal.subscribe((showShareDataModal: boolean) => {
      this.showShareDataModal = showShareDataModal;
    });

    this.appModalDialogSubscription = this.modalDialogService.modalDialogRef$.subscribe((modalDialogRef) => {
      this.appModalDialog = modalDialogRef;
    });
  }


  ngOnDestroy() {
    if (this.electronService.isElectron) {
      if (this.applicationInstanceDataSubscription) {
        this.applicationInstanceDataSubscription.unsubscribe();
      }
    }
    this.openingTutorialSub.unsubscribe();
    this.showSecurityAndPrivacyModalSub.unsubscribe();
    this.showReleaseNotesModalSub.unsubscribe();
    this.showEmailMeasurDataModalSub.unsubscribe();
    this.showImportBackupModalSubscription.unsubscribe();
    this.showSurveyModalSub.unsubscribe();
    this.showSubscribeToastSub.unsubscribe();
    this.subscribeModalSub.unsubscribe();
    this.emailVisibilitySubscription.unsubscribe();
    this.showExportToJustifiModalSub.unsubscribe();
    this.showShareDataModalSub.unsubscribe();
    this.toolsSuiteInitializedSub.unsubscribe();
    this.appModalDialogSubscription.unsubscribe();
  }

  async initData() {
    console.log('=== IndexedDB Initializing data ===');
    const isFirstStartup = await this.getIsFirstStartup();
    if (isFirstStartup) {
      try {
        await this.coreService.setNewApplicationInstanceData();
        await this.coreService.createDefaultDirectories();
        await this.coreService.createExamples();
        await this.coreService.createDirectorySettings();
      } catch (e) {
        this.appErrorService.handleAppError(e, 'Error creating MEASUR database');
      }
      this.setAllDbData();
    } else {
      await this.coreService.setApplicationInstanceData();
      this.setAllDbData();
      //initialize db Behavior Subjects
      //data initialized in createDefaultProcessHeatingMaterials on startup
      await this.solidLiquidMaterialDbService.setAllMaterialsFromDb();
      await this.flueGasMaterialDbService.setAllMaterialsFromDb();
    }
  }

  async setSurveyToastVisibility(applicationData: ApplicationInstanceData) {
    if (!applicationData.isSurveyDone) {
      if (applicationData.doSurveyReminder) {
        setTimeout(() => {
          this.measurSurveyService.showSurveyModal.next(true);
        }, 5000);
        await firstValueFrom(this.applicationInstanceDbService.setSurveyDone());
      } else {
        let hasMetModalRequirements = this.measurSurveyService.getHasModalUsageRequirements(applicationData);

        setTimeout(() => {
          this.measurSurveyService.showSurveyModal.next(hasMetModalRequirements);
        }, 5000);

        let canShowToast = this.measurSurveyService.getHasToastUsageRequirements(applicationData);
        if (canShowToast && !applicationData.isSurveyToastDone && !hasMetModalRequirements) {
          setTimeout(() => {
            this.showSurveyToast = true;
          }, 5000);
        }
      }
    }
  }

  async getIsFirstStartup() {
    let existingDirectories: number = await firstValueFrom(this.directoryDbService.count());
    return existingDirectories === 0;
  }

  setAllDbData() {
    this.coreService.getAllAppData()
      .pipe(catchError(error => this.appErrorService.handleObservableAppError('Error loading MEASUR database', error))).subscribe({
        next: (initializedData) => {
          this.directoryDbService.setAll(initializedData.directories);
          this.settingsDbService.setAll(initializedData.settings);
          this.assessmentDbService.setAll(initializedData.assessments);
          this.diagramIdbService.setAll(initializedData.diagrams);
          this.calculatorDbService.setAll(initializedData.calculators);
          this.inventoryDbService.setAll(initializedData.inventoryItems);
          this.idbStarted = true;
          this.initializeDefaultDbData();
          this.changeDetectorRef.detectChanges();
          if (this.electronService.isElectron) {
            this.automaticBackupService.saveVersionedBackup();
          }
        },
        error: (error) => { }
      });
  }

  async hideSurveyToast() {
    this.setSurveyToastDone();
  }

  async setSurveyToastDone() {
    this.showSurveyToast = false;
    let appData = await firstValueFrom(this.applicationInstanceDbService.setSurveyToastDone());
    this.applicationInstanceDbService.applicationInstanceData.next(appData);
  }

  async setSurveyDone() {
    let appData = await firstValueFrom(this.applicationInstanceDbService.setSurveyDone());
    this.applicationInstanceDbService.applicationInstanceData.next(appData);
  }

  async initializeDefaultDbData() {
    if (this.toolsSuiteInitialized && this.idbStarted && !this.defaultDbDataInitialized) {
      console.log('==== Initialize Default DB Data ====');
      await this.toolsSuiteApiService.initializeDefaultDbData();
      this.defaultDbDataInitialized = true;
    }
  }

  hideSubscribeToast() {
    this.showSubscribeToast = false;
    this.changeDetectorRef.detectChanges();
  }

  closeTutorial() {
    this.assessmentService.tutorialShown = true;
    this.hideTutorial = true;
  }

  closeNoticeModal(isClosedEvent?: boolean) {
    this.securityAndPrivacyService.modalOpen.next(false)
    this.securityAndPrivacyService.showSecurityAndPrivacyModal.next(false);
  }

  closeEmailModal(isClosedEvent?: boolean) {
    this.emailMeasurDataService.modalOpen.next(false)
    this.emailMeasurDataService.showEmailMeasurDataModal.next(false);
  }

  closeReleaseNotes() {
    this.updateApplicationService.showReleaseNotesModal.next(false);
  }

  setLoadingMessage() {
    const messages = [
      "Loading... I hope you're having a nice day!",
      "Just a moment, wishing you a wonderful day!",
      "Preparing things for you. Hope your day is going well!",
      "Hang tight! I hope you're having a fantastic day!",
      "Almost there—hope your day is as great as you are!",
      "Setting things up. I hope you're enjoying your day!",
      "Loading your experience. Have a nice day!",
      "Good things are coming. Hope your day is pleasant!",
      "Getting ready... I hope you're having a nice day!",
      "Thanks for your patience. Wishing you a great day!",
      "Just a sec! I hope your day is going smoothly!",
      "Loading magic. Hope you're having a nice day!",
      "Almost done! I hope your day is wonderful!",
      "Preparing your app. Have a fantastic day!",
      "One moment please. I hope you're having a nice day!"
    ];
    const randomIndex = Math.floor(Math.random() * messages.length);
    this.loadingMessage = messages[randomIndex];
  }

}
