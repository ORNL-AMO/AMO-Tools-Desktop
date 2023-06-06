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
  directory: Directory;
  constructor(private exportService: ExportService, private directoryDashboardService: DirectoryDashboardService, private directoryDbService: DirectoryDbService,
    private importExportService: ImportExportService) { }

  ngOnInit() {
    if (this.exportService.exportAll == true) {
      this.exportAllData();
    } else {
      this.exportDirectoryData();
    }
    if (this.noDirectoryAssessments.length == 1 && this.exportData.directories.length == 0) {
      let assessmentName: string = this.noDirectoryAssessments[0].assessment.name;
      this.exportName = assessmentName;
    } else if (this.exportData.directories.length == 1) {
    // } else if (this.exportService.getSelected(this.directory, false).) {
      let folderName: string = this.exportData.directories[0].directory.name;
      this.exportName = folderName;
      // this.exportName = this.exportService.getSelected(this.exportData.directories[0].directory, false).directories[0].directory.name;
    } 
    else {
      let folderName: string = this.directory.name;
      this.exportName = folderName;
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
    this.directory = this.directoryDbService.getById(directoryId);
    this.exportData = this.exportService.getSelected(this.directory, true);
    this.getNoDirectoryAssessments();
    this.canExport = this.importExportService.test(this.exportData);
  }

  // can change method name to be more specific since we're not ONLY exporting DIR data
  exportDirectoryData() {
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.directory = this.directoryDbService.getById(directoryId);
    let isSelectAllFolder: boolean = this.directory.selected;
    this.exportData = this.exportService.getSelected(this.directory, isSelectAllFolder);

    // if exportData has any directories
    //    exportName is first directory name
    // else if exportData has any assessments or inventories
    //    export name is first of any selected (this is fine for our purposes)
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
