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
  noDirectoryAssessments: Array<ImportExportAssessment>;
  exportName: string;
  constructor(private exportService: ExportService, private directoryDashboardService: DirectoryDashboardService, private directoryDbService: DirectoryDbService,
    private importExportService: ImportExportService) { }

  ngOnInit() {
    if (this.exportService.exportAll == true) {
      this.exportAllData();
    } else {
      this.exportDirectoryData();
    }
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
    this.getNoDirectoryAssessments();
    this.canExport = this.importExportService.test(this.exportData);
  }

  exportDirectoryData() {
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    let directory: Directory = this.directoryDbService.getById(directoryId);
    let isSelectAllFolder: boolean = directory.selected;
    this.exportData = this.exportService.getSelected(directory, isSelectAllFolder);
    this.getNoDirectoryAssessments();
    this.canExport = this.importExportService.test(this.exportData);
  }


  getNoDirectoryAssessments() {
    this.noDirectoryAssessments = new Array();
    let allAssessments: Array<ImportExportAssessment> = JSON.parse(JSON.stringify(this.exportData.assessments));
    if (allAssessments != undefined && allAssessments.length != 0) {
      this.noDirectoryAssessments = _.filter(allAssessments, (assessment) => {
        let testVal: ImportExportDirectory = _.find(this.exportData.directories, (directory => { return directory.directory.id == assessment.assessment.directoryId }));
        if (testVal == undefined) {
          return true;
        }
      });
    }
  }

  buildExportJSON() {
    this.importExportService.downloadData(this.exportData, this.exportName);
    this.hideExportModal();
  }

}
