import { Component, EventEmitter, inject, Inject, Input, Output, ViewChild } from '@angular/core';
import { DirectoryDashboardService } from '../../../dashboard/directory-dashboard/directory-dashboard.service';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { Assessment } from '../../models/assessment';
import { Directory } from '../../models/directory';
import { InventoryItem } from '../../models/inventory/inventory';
import { ExportService } from '../export.service';
import { ImportExportService } from '../import-export.service';
import { ImportExportData } from '../importExportModel';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

// * NOTE this component is a new export-modal to be used with the angular cdk dialog and modal-dialog service as we move way from the bootstrap wrapper. it is essentially a copy of "export-modal"
@Component({
  selector: 'app-export-item',
  standalone: false,
  templateUrl: './export-item.component.html',
  styleUrls: ['./export-item.component.css'],
})
export class ExportItemComponent {
  dialogRef = inject<DialogRef<string>>(DialogRef);

  @Input()
  assessment: Assessment;
  @Input()
  inventoryItem: InventoryItem;
  @Input()
  inAssessment: boolean;
  @Output('close')
  close = new EventEmitter<boolean>();

  exportData: ImportExportData;
  exportDisplayData: ImportExportData;
  canExportJson: boolean = false;
  exportName: string;
  isSelectAllDirectory: boolean;
  workingDirectoryId: number;
  constructor(private exportService: ExportService,
    @Inject(DIALOG_DATA) modalDialogData: ExportItemComponentDataInputs, 
    private directoryDashboardService: DirectoryDashboardService, private directoryDbService: DirectoryDbService,
    private importExportService: ImportExportService) {
      this.assessment = modalDialogData.assessment;
      this.inventoryItem = modalDialogData.inventoryItem;
      this.inAssessment = modalDialogData.inAssessment;
     }

  ngOnInit() {
    // todo 8296 - db items export workflows are treated as mutable, should instead be copied or treated as immutable to avoid side effects
    if (this.exportService.exportAll == true) {
      this.exportAllData();
      this.setDisplayFilteredData();
      this.setExportDefaultName();
    } else {
      this.exportDirectoryData();
    }
    this.canExportJson = !this.importExportService.testIsOverLimit(this.exportData);
  }

  hideExportModal() {
    this.exportService.exportAll = false;
    if (this.inAssessment) {
      this.close.emit(false);
    } else {
      this.directoryDashboardService.showExportModal.next(false);
    }
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

  closeDialog() {
    this.dialogRef.close();
  }


  buildExportJSON() {
    this.exportData.origin = 'AMO-TOOLS-DESKTOP';
    this.importExportService.exportInProgress.next(true);
      setTimeout(() => {
        this.importExportService.downloadData(this.exportData, this.exportName);
      }, 0);
    this.closeDialog();
  }

  buildExportZip() {
    this.exportData.origin = 'AMO-TOOLS-DESKTOP';
    this.importExportService.exportInProgress.next(true);
    setTimeout(() => {
      this.importExportService.downloadZipData(this.exportData, this.exportName);
    }, 0);
    this.closeDialog();
  }

}

export interface ExportItemComponentDataInputs {
  inAssessment: boolean;
  assessment?: Assessment;
  inventoryItem?: InventoryItem;
}