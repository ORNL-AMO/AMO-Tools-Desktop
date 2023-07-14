import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ImportService } from '../import.service';
import { ImportExportData } from '../importExportModel';
import { DirectoryDashboardService } from '../../directory-dashboard/directory-dashboard.service';
import { DashboardService } from '../../dashboard.service';
import * as pako from 'pako';

@Component({
  selector: 'app-import-modal',
  templateUrl: './import-modal.component.html',
  styleUrls: ['./import-modal.component.css']
})
export class ImportModalComponent implements OnInit {

  @ViewChild('importModal', { static: false }) public importModal: ModalDirective;

  importInProgress: boolean = false;
  fileReference: any;
  validFile: boolean;
  treasureFile: boolean;
  importJson: any = null;
  constructor(private importService: ImportService, private directoryDashboardService: DirectoryDashboardService, private dashboardService: DashboardService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.showImportModal();
  }

  showImportModal() {
    this.importModal.show();
  }

  hideImportModal() {
    this.importModal.hide();
    this.importModal.onHidden.subscribe(val => {
      this.directoryDashboardService.showImportModal.next(false);
    });
  }

  setImportFile($event) {
    if ($event.target.files) {
      if ($event.target.files.length !== 0) {
        let regex = /.gz$/;
        if (regex.test($event.target.files[0].name)) {
          let blob = new Blob([$event.target.files[0]], { type: 'application/octet-stream' });
          let arrayBuffer;
          let result;
          let fileReader = new FileReader();
          fileReader.onload = () => {
            arrayBuffer = fileReader.result as ArrayBuffer;
            result = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
            try {
              this.importJson = JSON.parse(JSON.stringify(result));
              this.validFile = true;
            } catch (err) {
              this.validFile = false;
            }
          };
          fileReader.readAsArrayBuffer(blob);
        }
        else {
          regex = /.json$/;
          if (regex.test($event.target.files[0].name)) {
            this.fileReference = $event;
            this.validFile = true;
          } else {
            let fr: FileReader = new FileReader();
            fr.readAsText($event.target.files[0]);
            fr.onloadend = (e) => {
              try {
                this.importJson = JSON.parse(JSON.stringify(fr.result));
                this.validFile = true;
              } catch (err) { 
                this.validFile = false;
              }
            };
          }
        }
      }
    }
  }

  importFile() {
    if (!this.importJson) {
      let fr: FileReader = new FileReader();
      fr.readAsText(this.fileReference.target.files[0]);
      fr.onloadend = (e) => {
        this.importJson = JSON.parse(JSON.stringify(fr.result));
        this.runImport(this.importJson)
      };
    }
    else {
      this.runImport(this.importJson);
    }
  }

  runImport(data: string) {
    let importData: ImportExportData = JSON.parse(data);

    if (importData.origin === "AMO-TOOLS-DESKTOP") {
      this.importInProgress = true;
      let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
      this.importService.importData(importData, directoryId);
      setTimeout(() => {
        this.hideImportModal();
        this.importInProgress = false;
        this.dashboardService.updateDashboardData.next(true);
      }, 1500);
    }
    else if (importData.origin === "AMO-TOOLS-DESKTOP-OPPORTUNITIES") {
      this.treasureFile = true;
      this.validFile = false;
      this.dashboardService.dashboardToastMessage.next('INVALID FILE DESTINATION - This is a treasure hunt opportunites file and must be imported from within a treasure hunt.');
    }
    else {
      this.treasureFile = false;
      this.validFile = false;
      this.dashboardService.dashboardToastMessage.next('INVALID FILE');
    }
  }
}