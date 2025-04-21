import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AssessmentService } from '../dashboard/assessment.service';
import { catchError, first, firstValueFrom, merge, Subscription } from 'rxjs';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { CoreService } from './core.service';
import { Router } from '../../../node_modules/@angular/router';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { SqlDbApiService } from '../tools-suite-api/sql-db-api.service';
import { SecurityAndPrivacyService } from '../shared/security-and-privacy/security-and-privacy.service';
import { ElectronService, ReleaseData } from '../electron/electron.service';
import { EmailMeasurDataService } from '../shared/email-measur-data/email-measur-data.service';
import { AppErrorService } from '../shared/errors/app-error.service';
import { AutomaticBackupService } from '../electron/automatic-backup.service';
import { ApplicationInstanceData, ApplicationInstanceDbService } from '../indexedDb/application-instance-db.service';
import { ImportBackupModalService } from '../shared/import-backup-modal/import-backup-modal.service';
import { MeasurSurveyService } from '../shared/measur-survey/measur-survey.service';
import { UpdateApplicationService } from '../shared/update-application/update-application.service';
import { EmailListSubscribeService } from '../shared/subscribe-toast/email-list-subscribe.service';

@Component({
    selector: 'app-core',
    templateUrl: './core.component.html',
    styleUrls: ['./core.component.css'],
    standalone: false
})

export class CoreComponent implements OnInit {
  showBrowsingDataToast: boolean;
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
  modalOpenSub: Subscription;
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

  constructor(public electronService: ElectronService,
    private assessmentService: AssessmentService,
    private changeDetectorRef: ChangeDetectorRef,
    private assessmentDbService: AssessmentDbService,
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
    private sqlDbApiService: SqlDbApiService,
    private measurSurveyService: MeasurSurveyService,
    private updateApplicationService: UpdateApplicationService,
    private emailSubscribeService: EmailListSubscribeService,
    private inventoryDbService: InventoryDbService) {
  }

  ngOnInit() {
    if (!window.navigator.cookieEnabled) {
      this.showBrowsingDataToast = true;
    }

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

    this.openingTutorialSub = this.assessmentService.showTutorial.subscribe(val => {
      this.inTutorialsView = (this.router.url === '/tutorials');
      if (val && !this.assessmentService.tutorialShown) {
        this.hideTutorial = false;
        this.tutorialType = val;
        this.changeDetectorRef.detectChanges();
      }
    });

    this.initData();

    this.showSecurityAndPrivacyModalSub = this.securityAndPrivacyService.showSecurityAndPrivacyModal.subscribe(showSecurityAndPrivacyModal => {
      this.showSecurityAndPrivacyModal = showSecurityAndPrivacyModal;
    });

    this.showEmailMeasurDataModalSub = this.emailMeasurDataService.showEmailMeasurDataModal.subscribe(showModal => {
      this.showEmailMeasurDataModal = showModal;
    });

    this.showImportBackupModalSubscription = this.importBackupModalService.showImportBackupModal.subscribe(showModal => {
      this.showImportBackupModal = showModal;
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
  }

  async initData() {
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
        let hasMetUsageRequirement = await this.measurSurveyService.getHasMetUsageRequirements(applicationData);
        let showModalToExistingUser = await this.measurSurveyService.checkIsExistingUser();
        let showModal = showModalToExistingUser || hasMetUsageRequirement;
        
        setTimeout(() => {
          this.measurSurveyService.showSurveyModal.next(showModal);
        }, 5000);
        
        if (!applicationData.isSurveyToastDone && !showModalToExistingUser) {
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
          this.calculatorDbService.setAll(initializedData.calculators);
          this.inventoryDbService.setAll(initializedData.inventoryItems);
          this.idbStarted = true;
          this.sqlDbApiService.initCustomDbMaterials();
          this.changeDetectorRef.detectChanges();
          if (this.electronService.isElectron) {
            this.automaticBackupService.saveVersionedBackup();
          }
        },
        error: (error) => {}
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

  hideBrowsingDataToast() {
    this.showBrowsingDataToast = false;
    this.changeDetectorRef.detectChanges();
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

}
