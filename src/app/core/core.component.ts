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

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css']
})

export class CoreComponent implements OnInit {
  showUpdateModal: boolean;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getScreenshotHeight();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    this.getScreenshotHeight();
  }

  @ViewChild('screenshotBar') screenshotBar: ElementRef;
  // @ViewChild('coreContainer') coreContainer: ElementRef;
  // @ViewChild('tutorialModal') public tutorialModal: ModalDirective;

  gettingData: boolean = false;
  showFeedback: boolean = true;

  showScreenshot: boolean = true;
  screenshotHeight: number;
  showTutorial: boolean = false;
  hideTutorial: boolean = true;
  toggleDownloadSub: Subscription;
  showFeedbackSub: Subscription;
  openingTutorialSub: Subscription;
  idbStarted: boolean = false;
  dirSub: Subscription;
  calcSub: Subscription;
  assessmentSub: Subscription;
  settingsSub: Subscription;
  constructor(private electronService: ElectronService, private toastyService: ToastyService,
    private toastyConfig: ToastyConfig, private importExportService: ImportExportService, private assessmentService: AssessmentService, private changeDetectorRef: ChangeDetectorRef, private windowRefService: WindowRefService,
    private suiteDbService: SuiteDbService, private indexedDbService: IndexedDbService, private assessmentDbService: AssessmentDbService, private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService,
    private calculatorDbService: CalculatorDbService, private coreService: CoreService, private exportService: ExportService) {
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

    this.toggleDownloadSub = this.importExportService.toggleDownload.subscribe((val) => {
      if (val == true) {
        this.downloadData();
      }
    })
    if (this.electronService.process.platform == 'win32') {
      this.showScreenshot = false;
    }

    this.showFeedbackSub = this.assessmentService.showFeedback.subscribe(val => {
      this.showFeedback = val;
      this.changeDetectorRef.detectChanges();
    })
    this.openingTutorialSub = this.assessmentService.openingTutorial.subscribe(val => {
      if (val && !this.assessmentService.tutorialShown) {
        this.showTutorial = true;
        this.hideTutorial = false;
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
    if (this.showFeedbackSub) this.showFeedbackSub.unsubscribe();
    if (this.openingTutorialSub) this.openingTutorialSub.unsubscribe();
    if (this.toggleDownloadSub) this.toggleDownloadSub.unsubscribe();
    if (this.dirSub) this.dirSub.unsubscribe();
    if (this.calcSub) this.calcSub.unsubscribe();
    if (this.assessmentSub) this.assessmentSub.unsubscribe();
    if (this.settingsSub) this.settingsSub.unsubscribe();
    this.exportService.exportAllClick.next(false);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getScreenshotHeight();
    }, 100);
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

  takeScreenShot() {
    this.importExportService.takeScreenShot();
  }

  hideFeedback() {
    this.showFeedback = false;
  }

  downloadData() {
    // this.gettingData = true;
    // this.importExportService.initAllDirectories().then((allDirs) => {
    //   this.importExportService.selectedItems = new Array<any>();
    //   this.importExportService.getSelected(allDirs);
    //   setTimeout(() => {
    //     this.importExportService.exportData = new Array();
    //     this.importExportService.selectedItems.forEach(item => {
    //       this.importExportService.getAssessmentSettings(item);
    //     })
    //     setTimeout(() => {
    //       this.gettingData = false;
    //       this.importExportService.downloadData(this.importExportService.exportData);
    //     }, 1000)
    //   }, 500)
    // });
    this.exportService.exportAllClick.next(true);
  }

  mailTo() {
    this.importExportService.openMailTo();
  }

  closeModal() {
    this.showUpdateModal = false;
  }


  getScreenshotHeight() {
    if (this.screenshotBar) {
      if (this.screenshotHeight != this.screenshotBar.nativeElement.clientHeight) {
        this.screenshotHeight = this.screenshotBar.nativeElement.clientHeight
      }
      if (this.windowRefService.nativeWindow.pageYOffset >> 0) {
        let scrollTest = this.screenshotBar.nativeElement.clientHeight - this.screenshotBar.nativeElement.scrollHeight;
        if (scrollTest <= 0) {
          this.screenshotHeight = 0;
        }
      }
      this.assessmentService.screenShotHeight.next(this.screenshotHeight);
    }
  }

  closeTutorial() {
    this.assessmentService.tutorialShown = true;
    this.showTutorial = false;
    this.hideTutorial = true;
  }


  // setDirectorySub() {
  //   this.dirSub = this.indexedDbService.setAllDirs.subscribe(val => {
  //     if (val) {
  //       this.directoryDbService.setAll();
  //     }
  //   })
  // }

  // setCalcSub() {
  //   this.calcSub = this.indexedDbService.setAllCalcs.subscribe(val => {
  //     if (val) {
  //       this.calculatorDbService.setAll();
  //     }
  //   })
  // }

  // setAssessmentSub() {
  //   this.assessmentSub = this.indexedDbService.setAllAssessments.subscribe(val => {
  //     if (val) {
  //       this.assessmentDbService.setAll();
  //     }
  //   })
  // }

  // setSettingSub() {
  //   this.settingsSub = this.indexedDbService.setAllSettings.subscribe(val => {
  //     if (val) {
  //       this.settingsDbService.setAll();
  //     }
  //   })
  // }


}
