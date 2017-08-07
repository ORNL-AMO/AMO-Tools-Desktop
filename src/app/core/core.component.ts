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

  constructor(private ElectronService: ElectronService, private toastyService: ToastyService,
    private toastyConfig: ToastyConfig, private importExportService: ImportExportService) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.limit = 1;
  }

  ngOnInit() {
    console.log('init');
    this.ElectronService.ipcRenderer.once('available', (event, arg) => {
      if (arg == true) {
        this.showUpdateModal();
      }
    })

    this.ElectronService.ipcRenderer.send('ready', null);
  }


  takeScreenShot() {
    this.importExportService.takeScreenShot();

  }

  downloadData() {
    this.importExportService.initAllDirectories().then((allDirs) => {
      this.importExportService.selectedItems = new Array<any>();
      this.importExportService.getSelected(allDirs);
      setTimeout(() => {
        console.log(this.importExportService.selectedItems);
        this.importExportService.exportData = new Array();
        this.importExportService.selectedItems.forEach(item => {
          this.importExportService.getAssessmentSettings(item);
        })
        setTimeout(() => {
          console.log(this.importExportService.exportData);
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
