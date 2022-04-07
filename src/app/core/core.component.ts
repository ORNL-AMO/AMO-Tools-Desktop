import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { AssessmentService } from '../dashboard/assessment.service';
import { firstValueFrom, forkJoin, Observable, Subscription } from 'rxjs';
import { SuiteDbService } from '../suiteDb/suite-db.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { CoreService } from './core.service';
import { Router } from '../../../node_modules/@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { NgxIndexedDBService } from 'ngx-indexed-db';

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
  constructor(private electronService: ElectronService, 
    private assessmentService: AssessmentService, 
    private changeDetectorRef: ChangeDetectorRef,
    private suiteDbService: SuiteDbService, 
    private assessmentDbService: AssessmentDbService,
    private settingsDbService: SettingsDbService, 
    private directoryDbService: DirectoryDbService,
    private calculatorDbService: CalculatorDbService, private coreService: CoreService, private router: Router,
    private inventoryDbService: InventoryDbService) {
  }

  ngOnInit() {
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

    const start = performance.now(); 
    window.indexedDB.databases().then(db => {
      const duration = performance.now() - start;
      console.log(db, duration);
      this.initData();
    });


    this.updateAvailableSubscription = this.assessmentService.updateAvailable.subscribe(val => {
      if (val == true) {
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
    })

  }


  ngOnDestroy() {
    if (this.openingTutorialSub) this.openingTutorialSub.unsubscribe();
    this.updateAvailableSubscription.unsubscribe();
    this.showTranslateModalSub.unsubscribe();
  }

  async initData() {
    // try {
    //   this.dbService.openCursor(this.directoryDbService.storeName).subscribe((evt) => {
    //     console.log(evt);
    //   });
    // } catch(e) {
    //   console.log(e);
    // }
    let existingDirectories: number = await firstValueFrom(this.directoryDbService.count());

    // let existingDirectories = 0;
    console.log('existing dirs', existingDirectories)
    if (existingDirectories === 0) {
      console.log('no existing data')
      await this.coreService.createDefaultDirectories();
      await this.coreService.createExamples();
      await this.coreService.createDirectorySettings();
      this.setAllDbData();
    } else {
      console.log('has existing data')
      this.setAllDbData();
    }
  }

  async setAllDbData() {
    this.coreService.getAllAppData().subscribe(initializedData => {
      console.log('core.component app data initilized', initializedData);
      this.directoryDbService.setAll(initializedData.directories);
      this.settingsDbService.setAll(initializedData.settings);
      this.assessmentDbService.setAll(initializedData.assessments);
      this.calculatorDbService.setAll(initializedData.calculators);
      this.inventoryDbService.setAll(initializedData.inventoryItems);
      if (this.suiteDbService.hasStarted == true) {
        // this.suiteDbService.initCustomDbMaterials();
      }
      this.idbStarted = true;
      this.changeDetectorRef.detectChanges();
    });
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
