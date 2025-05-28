import { Component, Input, OnInit, Output, ViewChild, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ExportService } from '../export.service';
import { DirectoryDashboardService } from '../../../dashboard/directory-dashboard/directory-dashboard.service';
import { ImportExportData } from '../importExportModel';
import { Directory } from '../../../shared/models/directory';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { ImportExportService } from '../import-export.service';
import * as _ from 'lodash';
import { Assessment } from '../../models/assessment';
import { InventoryItem } from '../../models/inventory/inventory';

@Component({
    selector: 'app-export-modal',
    templateUrl: './export-modal.component.html',
    styleUrls: ['./export-modal.component.css'],
    standalone: false
})
export class ExportModalComponent implements OnInit {

  @Input()
  assessment: Assessment;
  @Input()
  inventoryItem: InventoryItem;
  @Input()
  inAssessment: boolean;
  @Output('close')
  close = new EventEmitter<boolean>();

  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;

  exportData: ImportExportData;
  exportDisplayData: ImportExportData;
  canExportJson: boolean = false;
  exportName: string;
  isSelectAllDirectory: boolean;
  workingDirectoryId: number;
  constructor(private exportService: ExportService, private directoryDashboardService: DirectoryDashboardService, private directoryDbService: DirectoryDbService,
    private importExportService: ImportExportService) { }

  ngOnInit() {
    if (this.exportService.exportAll == true) {
      this.exportAllData();
      this.setDisplayFilteredData();
      this.setExportDefaultName();
    } else {
      this.exportDirectoryData();
    }
    this.canExportJson = this.importExportService.testIfOverLimit(this.exportData);
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
      if (this.inAssessment) {
        this.close.emit(false);
      } else {
        this.directoryDashboardService.showExportModal.next(false);
      }
    })
  }

  exportAllData() {
    this.workingDirectoryId = 1;
    let directory: Directory = this.directoryDbService.getById(this.workingDirectoryId);
    this.exportData = this.exportService.getSelected(directory, true);
  }
  
  exportDirectoryData() {
    if (this.inAssessment) {
      if (this.assessment) {
        this.workingDirectoryId = this.assessment.directoryId;
        let directory: Directory = this.directoryDbService.getById(this.workingDirectoryId);
        this.isSelectAllDirectory = directory.selected;
        this.exportData = this.exportService.getSelectedAssessment(this.assessment);
      } else if (this.inventoryItem) {
        this.workingDirectoryId = this.inventoryItem.directoryId;
        let directory: Directory = this.directoryDbService.getById(this.workingDirectoryId);
        this.isSelectAllDirectory = directory.selected;
        this.exportData = this.exportService.getSelectedInventory(this.inventoryItem);
      }
    } else {
      this.workingDirectoryId = this.directoryDashboardService.selectedDirectoryId.getValue();
      let directory: Directory = this.directoryDbService.getById(this.workingDirectoryId);
      this.isSelectAllDirectory = directory.selected;
      this.exportData = this.exportService.getSelected(directory, this.isSelectAllDirectory);
    }
    this.setDisplayFilteredData();
    this.setExportDefaultName();
  }

  setDisplayFilteredData() {
    this.exportDisplayData = {
      assessments: this.exportData.assessments.filter(assessment => assessment.assessment.directoryId === this.workingDirectoryId),
      inventories: this.exportData.inventories.filter(inventory => inventory.inventoryItem.directoryId === this.workingDirectoryId),
      calculators: this.exportData.calculators.filter(calculator => calculator.directoryId === this.workingDirectoryId),
      diagrams: this.exportData.diagrams.filter(diagram => diagram.diagram.directoryId === this.workingDirectoryId),
      directories: this.exportData.directories.filter(directory => {
        let isNotCurrentDirectory: boolean = directory.directory.id !== this.workingDirectoryId;
        let inCurrentDirectory: boolean = directory.directory.parentDirectoryId === this.workingDirectoryId;
        return isNotCurrentDirectory && inCurrentDirectory;
      }),
    }
  }

  setExportDefaultName() {
    let hasAssessments: boolean = this.exportData.assessments.length != 0;
    let hasInventories: boolean = this.exportData.inventories.length != 0;
    let hasCalculators: boolean = this.exportData.calculators.length != 0;
    let hasDiagrams: boolean = this.exportData.diagrams.length != 0;
    let hasMultipleItemTypes: boolean = [
      hasAssessments, 
      hasInventories, 
      hasCalculators,
    ].filter(Boolean).length >= 2;

    let date = new Date();
    let dateStr = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
    let dateName = 'ExportedData_' + dateStr;

    if (this.isSelectAllDirectory && this.exportData.directories.length != 0) {
      this.exportName = this.exportData.directories[0].directory.name;
    } else if (!this.isSelectAllDirectory && hasMultipleItemTypes) {
      this.exportName = dateName;
    } else if (hasAssessments) {
      this.exportName = this.exportData.assessments[0].assessment.name;
    } else if (hasInventories) {
      this.exportName = this.exportData.inventories[0].inventoryItem.name;
    } else if (hasCalculators) {
      this.exportName = this.exportData.calculators[0].name;
    } else if (hasDiagrams) {
      this.exportName = this.exportData.diagrams[0].diagram.name;
    }
}


  buildExportJSON() {
    this.importExportService.exportInProgress.next(true);
    setTimeout(() => {
      this.importExportService.downloadData(this.exportData, this.exportName);
    }, 1000);
    this.hideExportModal();
  }

  buildExportZip() {
    this.importExportService.exportInProgress.next(true);
    setTimeout(() => {
      this.importExportService.downloadZipData(this.exportData, this.exportName);
    }, 1000);
    this.hideExportModal();
  }

}