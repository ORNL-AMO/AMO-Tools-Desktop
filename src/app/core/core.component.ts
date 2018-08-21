import { Component, OnInit, ViewChild, Input, SimpleChanges, HostListener, ChangeDetectorRef, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { ElectronService } from 'ngx-electron';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { ImportExportService } from '../shared/import-export/import-export.service';
import { AssessmentService } from '../assessment/assessment.service';
import { WindowRefService } from '../indexedDb/window-ref.service';
import { Subscription } from 'rxjs';
import { SuiteDbService } from '../suiteDb/suite-db.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { CoreService } from './core.service';
import { ExportService } from '../shared/import-export/export.service';
import { ActivatedRoute, Router } from '../../../node_modules/@angular/router';

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css']
})

export class CoreComponent implements OnInit {
  showUpdateModal: boolean;

  gettingData: boolean = false;

  showScreenshot: boolean = true;
  showTutorial: boolean = false;
  hideTutorial: boolean = true;
  openingTutorialSub: Subscription;
  idbStarted: boolean = false;
  dirSub: Subscription;
  calcSub: Subscription;
  assessmentSub: Subscription;
  settingsSub: Subscription;
  tutorialType: string;
  inTutorialsView: boolean;
  constructor(private electronService: ElectronService, private toastyService: ToastyService,
    private toastyConfig: ToastyConfig, private importExportService: ImportExportService, private assessmentService: AssessmentService, private changeDetectorRef: ChangeDetectorRef, private windowRefService: WindowRefService,
    private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private assessmentDbService: AssessmentDbService, private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService,
    private calculatorDbService: CalculatorDbService, private coreService: CoreService, private exportService: ExportService, private router: Router) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.limit = 1;
  }

  ngOnInit() {
    this.electronService.ipcRenderer.once('available', (event, arg) => {
      if (arg == true) {
        this.showUpdateModal = true;
        this.assessmentService.updateAvailable.next(true);
        this.changeDetectorRef.detectChanges();
      }
    })

    //send signal to main.js to check for update
    this.electronService.ipcRenderer.send('ready', null);

    if (this.electronService.process.platform == 'win32') {
      this.showScreenshot = false;
    }

    this.openingTutorialSub = this.assessmentService.showTutorial.subscribe(val => {
      this.inTutorialsView = (this.router.url == '/');
      if (val && !this.assessmentService.tutorialShown) {
        this.showTutorial = true;
        this.hideTutorial = false;
        this.tutorialType = val;
        this.changeDetectorRef.detectChanges();
      }
    })

    if (this.suiteDbService.hasStarted == false) {
      this.suiteDbService.startup();
    }
    if (this.indexedDbService.db == undefined) {
      this.initData();
    }
  }

  ngOnDestroy() {
    if (this.openingTutorialSub) this.openingTutorialSub.unsubscribe();
    if (this.dirSub) this.dirSub.unsubscribe();
    if (this.calcSub) this.calcSub.unsubscribe();
    if (this.assessmentSub) this.assessmentSub.unsubscribe();
    if (this.settingsSub) this.settingsSub.unsubscribe();
    this.exportService.exportAllClick.next(false);
  }

  initData() {
    this.indexedDbService.db = this.indexedDbService.initDb().then(done => {
      this.indexedDbService.getAllDirectories().then(val => {
        if (val.length == 0) {
          this.coreService.createDirectory().then(() => {
            this.coreService.createDirectorySettings().then(() => {
              this.coreService.createExamples().then(() => {
                this.setAllDbData();
              });
            });
          });
        } else {
          this.setAllDbData();
        }
      })
    })
  }

  setAllDbData() {
    this.directoryDbService.setAll().then(() => {
      this.assessmentDbService.setAll().then(() => {
        this.settingsDbService.setAll().then(() => {
          this.calculatorDbService.setAll().then(() => {
            this.idbStarted = true;
            this.changeDetectorRef.detectChanges();
          })
        })
      })
    })
  }



  closeModal() {
    this.showUpdateModal = false;
  }


  closeTutorial() {
    this.assessmentService.tutorialShown = true;
    this.showTutorial = false;
    this.hideTutorial = true;
  }
}
