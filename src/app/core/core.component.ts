import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { AssessmentService } from '../dashboard/assessment.service';
import { Subscription } from 'rxjs';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { CoreService } from './core.service';
import { Router } from '../../../node_modules/@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { SqlDbApiService } from '../tools-suite-api/sql-db-api.service';
declare var google: any;
@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css'],
  animations: [
    trigger('survey', [
      state('show', style({
        bottom: '20px'
      })),
      transition('hide => show', animate('.5s ease-in')),
      transition('show => hide', animate('.5s ease-out'))
    ]),
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
  showUpdateModal: boolean;
  hideTutorial: boolean = true;
  openingTutorialSub: Subscription;
  idbStarted: boolean = false;
  tutorialType: string;
  inTutorialsView: boolean;
  updateError: boolean = false;

  info: any;
  updateAvailableSubscription: Subscription;
  showTranslateModalSub: Subscription;
  showTranslate: string = 'hide';
  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean;
  showWebDisclaimerToast: boolean = false;

  constructor(private electronService: ElectronService, private assessmentService: AssessmentService, private changeDetectorRef: ChangeDetectorRef,
    private indexedDbService: IndexedDbService, private assessmentDbService: AssessmentDbService,
    private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService,
    private calculatorDbService: CalculatorDbService, private coreService: CoreService, private router: Router,
    private inventoryDbService: InventoryDbService, private sqlDbApiService: SqlDbApiService) {
  }

  ngOnInit() {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.once('available', (event, arg) => {
        if (arg === true) {
          this.showUpdateModal = true;
          this.assessmentService.updateAvailable.next(true);
          this.changeDetectorRef.detectChanges();
        }
      });
      
      //send signal to main.js to check for update
      this.electronService.ipcRenderer.send('ready', null);
      
      this.electronService.ipcRenderer.once('release-info', (event, info) => {
        this.info = info;
      })
    }

    this.openingTutorialSub = this.assessmentService.showTutorial.subscribe(val => {
      this.inTutorialsView = (this.router.url === '/tutorials');
      if (val && !this.assessmentService.tutorialShown) {
        this.hideTutorial = false;
        this.tutorialType = val;
        this.changeDetectorRef.detectChanges();
      }
    });

    if (this.indexedDbService.db === undefined) {
      this.initData();
    }

    this.updateAvailableSubscription = this.assessmentService.updateAvailable.subscribe(val => {
      if (val == true && this.electronService.isElectronApp) {
        this.showUpdateModal = true;
        this.changeDetectorRef.detectChanges();
      }
    });

    this.showTranslateModalSub = this.coreService.showTranslateModal.subscribe(val => {
      if (val == true) {
        try {
          let instance = google.translate.TranslateElement.getInstance();
          if (!instance) {
            let element = new google.translate.TranslateElement({ pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE }, 'google_translate_element');
          }
          this.showTranslate = 'show';
        } catch (err) {

        }
      }
    });
  }

  ngOnDestroy() {
    if (this.openingTutorialSub) this.openingTutorialSub.unsubscribe();
    this.updateAvailableSubscription.unsubscribe();
    this.showTranslateModalSub.unsubscribe();
  }

  initData() {
    this.indexedDbService.db = this.indexedDbService.initDb().then(done => {
      this.indexedDbService.getAllDirectories().then(val => {
        if (val.length === 0) {
          this.coreService.createDirectory().then(() => {
            this.coreService.createExamples().then(() => {
              this.coreService.createDirectorySettings().then(() => {
                this.setAllDbData();
              });
            });
          });
        } else {
          this.setAllDbData();
        }
      });
    });
  }

  setAllDbData() {
    this.directoryDbService.setAll().then(() => {
      this.assessmentDbService.setAll().then(() => {
        this.settingsDbService.setAll().then(() => {
          if (!this.electronService.isElectronApp) {
            this.showWebDisclaimer();
          }
          this.calculatorDbService.setAll().then(() => {
            this.inventoryDbService.setAll().then(() => {
              if (this.sqlDbApiService.hasStarted == true) {
                this.sqlDbApiService.initCustomDbMaterials();
              }
              this.idbStarted = true;
              this.changeDetectorRef.detectChanges();
            })
          });
        });
      });
    });
  }

  showWebDisclaimer() {
    if (this.settingsDbService.globalSettings.disableWebDisclaimer != true) {
      this.toastData.title = 'Disclaimer';
      this.toastData.body = 'The web version of MEASUR is still in beta. Please let us know if you have any suggestions for improving the app.';
      this.showWebDisclaimerToast = true;
      this.changeDetectorRef.detectChanges();
    }
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

  disableWebDisclaimer() {
    this.settingsDbService.globalSettings.disableWebDisclaimer = true;
    this.indexedDbService.putSettings(this.settingsDbService.globalSettings).then(() => {
      this.settingsDbService.setAll();
    });
    this.hideToast();
  }

  hideUpdateToast() {
    this.showUpdateModal = false;
    this.changeDetectorRef.detectChanges();
  }

  closeTutorial() {
    this.assessmentService.tutorialShown = true;
    this.hideTutorial = true;
  }

  closeTranslate() {
    this.showTranslate = 'hide';
  }

}
