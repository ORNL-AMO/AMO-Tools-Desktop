import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FileImportStatus, ImportService } from '../import.service';
import { ImportExportData } from '../importExportModel';
import { DirectoryDashboardService } from '../../../dashboard/directory-dashboard/directory-dashboard.service';
import { DashboardService } from '../../../dashboard/dashboard.service';
import * as pako from 'pako';

@Component({
  selector: 'app-import-modal',
  templateUrl: './import-modal.component.html',
  styleUrls: ['./import-modal.component.css'],
  standalone: false
})
export class ImportModalComponent implements OnInit {

  @ViewChild('importModal', { static: false }) public importModal: ModalDirective;

  importInProgress: boolean = false;
  fileImportStatus: FileImportStatus;
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

  async setImportFile($event) {
    if ($event.target.files && $event.target.files.length !== 0) {
      let gzRegex = /.gz$/;
      let jsonRegex = /.json$/;
      let importFile: File = $event.target.files[0];

      if (gzRegex.test(importFile.name)) {
        try {
          const arrayBuffer = await this.importService.readFileAsArrayBuffer(importFile);
          const jsonString = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
          this.importJson = JSON.parse(jsonString);
          this.fileImportStatus = this.importService.getIsValidImportType(this.importJson, 'AMO-TOOLS-DESKTOP');
        } catch (err) {
          console.error('Error processing gzip file:', err);
          this.fileImportStatus = { isValid: false, fileType: 'UNKNOWN' };
        }
      }
      else if (jsonRegex.test(importFile.name)) {
        try {
          const fileContent = await this.importService.readFileAsText(importFile);
          this.importJson = JSON.parse(fileContent);
          this.fileImportStatus = this.importService.getIsValidImportType(this.importJson, 'AMO-TOOLS-DESKTOP');
        } catch (err) {
          console.error('File reading/parsing error:', err);
          this.fileImportStatus = { isValid: false, fileType: 'UNKNOWN' };
        }
      } else {
        this.fileImportStatus = { isValid: false, fileType: 'UNKNOWN' };
      }
    }
  }

  async importFile() {
    let importData: ImportExportData = this.importJson as ImportExportData;
    this.importInProgress = true;
    let workingDirectoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    await this.importService.importData(importData, workingDirectoryId);
    this.hideImportModal();
    this.importInProgress = false;
    this.dashboardService.updateDashboardData.next(true);
  }

}