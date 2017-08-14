import { Component, OnInit, ViewChild, Input, SimpleChanges } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { ElectronService } from 'ngx-electron';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { ImportExportService } from '../shared/import-export/import-export.service';

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
  constructor(private ElectronService: ElectronService, private toastyService: ToastyService,
    private toastyConfig: ToastyConfig, private importExportService: ImportExportService) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.limit = 1;
  }

  ngOnInit() {
    this.ElectronService.ipcRenderer.once('available', (event, arg) => {
      if (arg == true) {
        this.showUpdateModal();
      }
    })

    this.ElectronService.ipcRenderer.send('ready', null);

    this.importExportService.toggleDownload.subscribe((val) => {
      if(val == true){
        this.downloadData();
      }
    })
  }


  takeScreenShot() {
    this.importExportService.takeScreenShot();
  }

  hideFeedback(){
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
    this.ElectronService.ipcRenderer.send('update', null);
  }

  cancel() {
    this.updateModal.hide();
    this.ElectronService.ipcRenderer.send('later', null);
  }
}
