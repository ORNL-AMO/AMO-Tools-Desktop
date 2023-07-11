import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ExportService } from '../export.service';
import { DirectoryDashboardService } from '../../directory-dashboard/directory-dashboard.service';
import { ImportExportData, ImportExportDirectory, ImportExportAssessment } from '../importExportModel';
import { Directory } from '../../../shared/models/directory';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { ImportExportService } from '../import-export.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-modal.component.html',
  styleUrls: ['./export-modal.component.css']
})
export class ExportModalComponent implements OnInit {

  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;

  exportData: ImportExportData;
  canExport: boolean = false;
  exportName: string;
  isSelectAllFolder: boolean;
  constructor(private exportService: ExportService, private directoryDashboardService: DirectoryDashboardService, private directoryDbService: DirectoryDbService,
    private importExportService: ImportExportService) { }

  ngOnInit() {
    if (this.exportService.exportAll == true) {
      this.exportAllData();
    } else {
      this.exportDirectoryData();
    }
    this.canExport = this.importExportService.test(this.exportData);
  }

  ngAfterViewInit() {
    this.showExportModal();
  }

  showExportModal() {
    this.exportModal.show();
  }

  hideExportModal() {
    this.exportModal.hide();
    this.exportModal.onHidden.subscribe(val => {
      this.exportService.exportAll = false;
      this.directoryDashboardService.showExportModal.next(false);
    })
  }

  exportAllData() {
    let directoryId: number = 1;
    let directory: Directory = this.directoryDbService.getById(directoryId);
    this.exportData = this.exportService.getSelected(directory, true);
  }

  exportDirectoryData() {
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    let directory: Directory = this.directoryDbService.getById(directoryId);
    this.isSelectAllFolder = directory.selected;
    this.exportData = this.exportService.getSelected(directory, this.isSelectAllFolder);
    this.setExportDefaultName();
  }

  setExportDefaultName() {
    if (this.isSelectAllFolder && this.exportData.directories.length != 0) {
      this.exportName = this.exportData.directories[0].directory.name;
    } else if (this.exportData.assessments.length != 0) {
      this.exportName = this.exportData.assessments[0].assessment.name;
    } else if (this.exportData.inventories.length != 0) {
      this.exportName = this.exportData.inventories[0].inventoryItem.name;
    }
}


  buildExportJSON() {
    this.importExportService.downloadData(this.exportData, this.exportName);
    this.hideExportModal();
  }

  buildExportZip() {
    this.importExportService.downloadZipData(this.exportData, this.exportName);
    this.hideExportModal();
  }

}