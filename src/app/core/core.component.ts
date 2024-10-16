import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AssessmentService } from '../dashboard/assessment.service';
import { catchError, firstValueFrom, merge, Subscription } from 'rxjs';
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
import { PwaService } from '../shared/pwa/pwa.service';
import { AppErrorService } from '../shared/errors/app-error.service';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { AutomaticBackupService } from '../electron/automatic-backup.service';
import { ApplicationInstanceData, ApplicationInstanceDbService } from '../indexedDb/application-instance-db.service';
import { ImportBackupModalService } from '../shared/import-backup-modal/import-backup-modal.service';

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css'],
})

export class CoreComponent implements OnInit {
  updateDesktop: boolean;
  updatePwa: boolean;
  showBrowsingDataToast: boolean;
  hideTutorial: boolean = true;
  openingTutorialSub: Subscription;
  idbStarted: boolean = false;
  tutorialType: string;
  inTutorialsView: boolean;
  updateError: boolean = false;
  isOnline: boolean;
  releaseData: ReleaseData;

  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean;
  showWebDisclaimerToast: boolean = false;
  routerSubscription: Subscription;
  analyticsSessionId: string;
  modalOpenSub: Subscription;
  showSecurityAndPrivacyModalSub: Subscription;
  showSecurityAndPrivacyModal: boolean;
  showEmailMeasurDataModal: boolean;
  electronUpdateAvailableSub: Subscription;
  assessmentUpdateAvailableSub: Subscription;
  updateAvailable: boolean;
  releaseDataSub: Subscription;
  showEmailMeasurDataModalSub: Subscription;
  showImportBackupModalSubscription: Subscription;
  showImportBackupModal: boolean;
  pwaUpdateAvailableSubscription: Subscription;
  applicationInstanceDataSubscription: Subscription;

  constructor(private electronService: ElectronService,
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
    private pwaService: PwaService,
    private appErrorService: AppErrorService,
    private automaticBackupService: AutomaticBackupService,
    private applicationInstanceDbService: ApplicationInstanceDbService,
    private importBackupModalService: ImportBackupModalService,
    private sqlDbApiService: SqlDbApiService,
    private inventoryDbService: InventoryDbService) {
  }

  ngOnInit() {
    if (!window.navigator.cookieEnabled) {
      this.showBrowsingDataToast = true;
    }

    if (this.electronService.isElectron) {
      this.electronService.sendAppReady('ready');
      this.electronUpdateAvailableSub = this.electronService.updateAvailable.subscribe(val => {
        this.updateAvailable = val;
        if (this.updateAvailable) {
          this.updateDesktop = true;
          this.assessmentService.updateAvailable.next(true);
          this.changeDetectorRef.detectChanges();
        }
      });

      this.releaseDataSub = this.electronService.releaseData.subscribe(val => {
        this.releaseData = val;
      });
    }

    this.applicationInstanceDataSubscription = this.applicationInstanceDbService.applicationInstanceData.subscribe(applicationData => {
        if (!this.automaticBackupService.observableDataChanges && applicationData?.isAutomaticBackupOn) {
          this.automaticBackupService.subscribeToDataChanges();
        }
    });

    this.assessmentUpdateAvailableSub = this.assessmentService.updateAvailable.subscribe(val => {
      if (val == true) {
        this.updateDesktop = true;
        this.changeDetectorRef.detectChanges();
      }
    });

    this.pwaUpdateAvailableSubscription = this.pwaService.displayUpdateToast.subscribe(updatePwa => {
      this.updatePwa = updatePwa;
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
      this.electronUpdateAvailableSub.unsubscribe();
      this.releaseDataSub.unsubscribe();
      if (this.applicationInstanceDataSubscription) {
        this.applicationInstanceDataSubscription.unsubscribe();
      }
    }
    this.assessmentUpdateAvailableSub.unsubscribe();
    this.openingTutorialSub.unsubscribe();
    this.showSecurityAndPrivacyModalSub.unsubscribe();
    this.showEmailMeasurDataModalSub.unsubscribe();
    this.showImportBackupModalSubscription.unsubscribe();
    this.pwaUpdateAvailableSubscription.unsubscribe();
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
          this.sqlDbApiService.initCustomDbMaterials();
          this.changeDetectorRef.detectChanges();
          if (this.electronService.isElectron) {
            this.automaticBackupService.saveVersionedBackup();
          }
        },
        error: (error) => {}
      });
  }

  hideToast() {
    this.showToast = false;
    this.toastData = {
      title: '',
      body: '',
      setTimeoutVal: undefined
    };
    this.changeDetectorRef.detectChanges();
  }

  hideUpdateToast() {
    this.updateDesktop = false;
    this.updatePwa = false;
    this.changeDetectorRef.detectChanges();
  }

  hideBrowsingDataToast() {
    this.showBrowsingDataToast = false;
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

}
