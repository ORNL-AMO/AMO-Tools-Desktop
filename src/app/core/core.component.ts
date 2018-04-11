import { Component, OnInit, ViewChild, Input, SimpleChanges, HostListener, ChangeDetectorRef, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { ElectronService } from 'ngx-electron';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { ImportExportService } from '../shared/import-export/import-export.service';
import { AssessmentService } from '../assessment/assessment.service';
import { WindowRefService } from '../indexedDb/window-ref.service';

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
  constructor(private electronService: ElectronService, private toastyService: ToastyService,
    private toastyConfig: ToastyConfig, private importExportService: ImportExportService, private assessmentService: AssessmentService, private changeDetectorRef: ChangeDetectorRef, private windowRefService: WindowRefService) {
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

    this.importExportService.toggleDownload.subscribe((val) => {
      if (val == true) {
        this.downloadData();
      }
    })
    if (this.electronService.process.platform == 'win32') {
      this.showScreenshot = false;
    }

    this.assessmentService.showFeedback.subscribe(val => {
      this.showFeedback = val;
      this.changeDetectorRef.detectChanges();
    })

    this.assessmentService.openingTutorial.subscribe(val => {
      if(val){
        this.showTutorial = true;
        this.hideTutorial = false;
      }
    })
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getScreenshotHeight();
    }, 100);

    // setTimeout(()=> {
    //   this.showTutorial = true;
    //   this.changeDetectorRef.detectChanges();
    // },2500)
  }
  takeScreenShot() {
    this.importExportService.takeScreenShot();
  }

  hideFeedback() {
    this.showFeedback = false;
  }

  downloadData() {
    this.gettingData = true;
    this.importExportService.initAllDirectories().then((allDirs) => {
      this.importExportService.selectedItems = new Array<any>();
      this.importExportService.getSelected(allDirs);
      setTimeout(() => {
        this.importExportService.exportData = new Array();
        this.importExportService.selectedItems.forEach(item => {
          this.importExportService.getAssessmentSettings(item);
        })
        setTimeout(() => {
          this.gettingData = false;
          this.importExportService.downloadData(this.importExportService.exportData);
        }, 1000)
      }, 500)
    });
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

  closeTutorial(){
    this.showTutorial = false;
    this.hideTutorial = true;
  }
}
