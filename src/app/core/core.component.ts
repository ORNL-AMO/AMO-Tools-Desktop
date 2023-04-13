import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { AssessmentService } from '../dashboard/assessment.service';
import { filter, firstValueFrom, Subscription } from 'rxjs';
import { SuiteDbService } from '../suiteDb/suite-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { CoreService } from './core.service';
import { NavigationEnd, Router } from '../../../node_modules/@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { SecurityAndPrivacyService } from '../shared/security-and-privacy/security-and-privacy.service';

declare var google: any;
@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css'],
  animations: [
    trigger('translate', [
      state('show', style({
        top: '40px'
      })),
      transition('hide => show', animate('.5s ease-in')),
      transition('show => hide', animate('.5s ease-out'))
    ])
  ]
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
  info: any;
  updateAvailableSubscription: Subscription;
  routerSubscription: Subscription;
  modalOpenSub: Subscription;
  showSecurityAndPrivacyModalSub: Subscription;
  isModalOpen: boolean;
  showSecurityAndPrivacyModal: boolean;


  constructor(private electronService: ElectronService, 
    private assessmentService: AssessmentService, 
    private changeDetectorRef: ChangeDetectorRef,
    private suiteDbService: SuiteDbService, 
    private assessmentDbService: AssessmentDbService,
    private settingsDbService: SettingsDbService, 
    private directoryDbService: DirectoryDbService,
    private analyticsService: AnalyticsService,
    private calculatorDbService: CalculatorDbService, 
    private coreService: CoreService, 
    private router: Router,
    private securityAndPrivacyService: SecurityAndPrivacyService,
    private inventoryDbService: InventoryDbService) {
  }

  ngOnInit() {
    if (!window.navigator.cookieEnabled) {
      this.showBrowsingDataToast = true;
    }
   this.routerSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd))
     .subscribe((event: NavigationEnd) => {
      if (this.idbStarted) {
        this.analyticsService.sendAnalyticsPageView(event.urlAfterRedirects);
      }
     });

    this.electronService.ipcRenderer.once('available', (event, arg) => {
      if (arg === true) {
        this.showUpdateToast = true;
        this.assessmentService.updateAvailable.next(true);
        this.changeDetectorRef.detectChanges();
      }
    });

    //send signal to main.js to check for update
    this.electronService.ipcRenderer.send('ready', null);

    this.electronService.ipcRenderer.once('release-info', (event, info) => {
      this.info = info;
    })

    this.openingTutorialSub = this.assessmentService.showTutorial.subscribe(val => {
      this.inTutorialsView = (this.router.url === '/tutorials');
      if (val && !this.assessmentService.tutorialShown) {
        this.hideTutorial = false;
        this.tutorialType = val;
        this.changeDetectorRef.detectChanges();
      }
    });

    if (this.suiteDbService.hasStarted === false) {
      this.suiteDbService.startup();
    }

    window.indexedDB.databases().then(db => {
      this.initData();
    });


    this.updateAvailableSubscription = this.assessmentService.updateAvailable.subscribe(val => {
      if (val == true) {
        this.showUpdateToast = true;
        this.changeDetectorRef.detectChanges();
      }
    });

    this.modalOpenSub = this.securityAndPrivacyService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

    this.showSecurityAndPrivacyModalSub = this.securityAndPrivacyService.showSecurityAndPrivacyModal.subscribe(showSecurityAndPrivacyModal => {
      this.showSecurityAndPrivacyModal = showSecurityAndPrivacyModal;
    });

  }

  ngOnDestroy() {
    if (this.openingTutorialSub) {
      this.openingTutorialSub.unsubscribe();
    }
    this.routerSubscription.unsubscribe();
    this.updateAvailableSubscription.unsubscribe();
    this.showSecurityAndPrivacyModalSub.unsubscribe();
    this.modalOpenSub.unsubscribe();
  }

  async initData() {
    let existingDirectories: number = await firstValueFrom(this.directoryDbService.count());

    // let existingDirectories = 0;
    if (existingDirectories === 0) {
      await this.coreService.createDefaultDirectories();
      await this.coreService.createExamples();
      await this.coreService.createDirectorySettings();
      this.setAllDbData();
    } else {
      this.setAllDbData();
    }
  }

  async setAllDbData() {
    this.coreService.getAllAppData().subscribe(initializedData => {
      this.directoryDbService.setAll(initializedData.directories);
      this.settingsDbService.setAll(initializedData.settings);
      this.assessmentDbService.setAll(initializedData.assessments);
      this.calculatorDbService.setAll(initializedData.calculators);
      this.inventoryDbService.setAll(initializedData.inventoryItems);
      if (this.suiteDbService.hasStarted == true) {
        this.suiteDbService.initCustomDbMaterials();
      }
      this.idbStarted = true;
      this.analyticsService.initAnalyticsSession();
      this.changeDetectorRef.detectChanges();
    });
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
