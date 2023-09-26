import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AssessmentService } from '../dashboard/assessment.service';
import { filter, firstValueFrom, Subscription } from 'rxjs';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { CoreService } from './core.service';
import { NavigationEnd, Router } from '../../../node_modules/@angular/router';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { SqlDbApiService } from '../tools-suite-api/sql-db-api.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { SecurityAndPrivacyService } from '../shared/security-and-privacy/security-and-privacy.service';
import { ElectronService, ReleaseData } from '../electron/electron.service';

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css'],
})

export class CoreComponent implements OnInit {
  showUpdateToast: boolean;
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
  isModalOpen: boolean;
  showSecurityAndPrivacyModal: boolean;
  electronUpdateAvailableSub: Subscription;
  assessmentUpdateAvailableSub: Subscription;
  updateAvailable: boolean;
  releaseDataSub: Subscription;


  constructor(private electronService: ElectronService , 
    private assessmentService: AssessmentService, 
    private changeDetectorRef: ChangeDetectorRef,
    private assessmentDbService: AssessmentDbService,
    private settingsDbService: SettingsDbService, 
    private directoryDbService: DirectoryDbService,
    private analyticsService: AnalyticsService,
    private calculatorDbService: CalculatorDbService, 
    private coreService: CoreService, 
    private router: Router,
    private securityAndPrivacyService: SecurityAndPrivacyService,
    private inventoryDbService: InventoryDbService, private sqlDbApiService: SqlDbApiService) {
  }

  ngOnInit() {
    if (!window.navigator.cookieEnabled) {
      this.showBrowsingDataToast = true;
    }

    if (this.electronService.isElectron) {
      this.electronService.sendAppReady('ready');

      if (this.electronService.isElectron) {
        this.routerSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd))
          .subscribe((event: NavigationEnd) => {
              this.analyticsService.sendAnalyticsPageView(event.urlAfterRedirects);
            });
      }


      this.electronUpdateAvailableSub = this.electronService.updateAvailable.subscribe(val => {
        this.updateAvailable = val;
        if (this.updateAvailable) {
          this.showUpdateToast = true;
          this.assessmentService.updateAvailable.next(true);
          this.changeDetectorRef.detectChanges();
        }
      });

      this.releaseDataSub = this.electronService.releaseData.subscribe(val => {
        this.releaseData = val;
      });

    }

    this.assessmentUpdateAvailableSub = this.assessmentService.updateAvailable.subscribe(val => {
      if (val == true) {
        this.showUpdateToast = true;
        this.changeDetectorRef.detectChanges();
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

    this.initData();

    this.modalOpenSub = this.securityAndPrivacyService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

    this.showSecurityAndPrivacyModalSub = this.securityAndPrivacyService.showSecurityAndPrivacyModal.subscribe(showSecurityAndPrivacyModal => {
      this.showSecurityAndPrivacyModal = showSecurityAndPrivacyModal;
    });

  }


  ngOnDestroy() {
    if (this.electronService.isElectron) {
      this.routerSubscription.unsubscribe();
      this.electronUpdateAvailableSub.unsubscribe();
      this.releaseDataSub.unsubscribe();
    }
    this.assessmentUpdateAvailableSub.unsubscribe();
    this.openingTutorialSub.unsubscribe();
    this.showSecurityAndPrivacyModalSub.unsubscribe();
    this.modalOpenSub.unsubscribe();
  }

  async initData() {
    let existingDirectories: number = await firstValueFrom(this.directoryDbService.count());
    if (existingDirectories === 0) {
      await this.coreService.createDefaultDirectories();
      await this.coreService.createExamples();
      await this.coreService.createDirectorySettings();
      this.setAllDbData();
    } else {
      this.setAllDbData();
    }
  }

  setAllDbData() {
    this.coreService.getAllAppData().subscribe(initializedData => {
      this.directoryDbService.setAll(initializedData.directories);
      this.settingsDbService.setAll(initializedData.settings);
      this.assessmentDbService.setAll(initializedData.assessments);
      this.calculatorDbService.setAll(initializedData.calculators);
      this.inventoryDbService.setAll(initializedData.inventoryItems);
      this.idbStarted = true;
      this.changeDetectorRef.detectChanges();
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
    this.showUpdateToast = false;
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

}
