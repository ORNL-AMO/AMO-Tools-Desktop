import { Component, OnInit, ViewChild, Input, SimpleChanges } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { ElectronService } from 'ngx-electron';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { ImportExportService } from '../shared/import-export/import-export.service';
import { AssessmentService } from '../assessment/assessment.service';

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css']
})

export class CoreComponent implements OnInit {
  updateAvailable: boolean;
  updateSelected: boolean;

  @ViewChild('updateModal') public updateModal: ModalDirective;

  gettingData: boolean = false;
  showFeedback: boolean = true;

  showScreenshot: boolean = true;
  constructor(private electronService: ElectronService, private toastyService: ToastyService,
    private toastyConfig: ToastyConfig, private importExportService: ImportExportService, private assessmentService: AssessmentService) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.limit = 1;
  }

  ngOnInit() {
    this.electronService.ipcRenderer.once('available', (event, arg) => {
      console.log(arg);
      if (arg == true) {
        this.showUpdateModal();
      }
    })

    // setTimeout(() => {
    //   console.log('call ready for update');
    //   this.electronService.ipcRenderer.send('ready', null);
    // }, 3000);

    this.importExportService.toggleDownload.subscribe((val) => {
      if (val == true) {
        this.downloadData();
      }
    })

    if (this.electronService.process.platform == 'win32') {
      this.showScreenshot = false;
    }
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

  showUpdateModal() {
    this.updateModal.show();
  }

  hideUpdateModal() {
    this.updateModal.hide();
  }

  updateClick() {
    this.updateSelected = true;
    this.updateAvailable = false;
    this.electronService.ipcRenderer.send('update', null);
  }

  cancel() {
    this.updateModal.hide();
    this.electronService.ipcRenderer.send('later', null);
  }
}
