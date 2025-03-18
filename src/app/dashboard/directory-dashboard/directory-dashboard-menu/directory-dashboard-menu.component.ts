import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { Directory } from '../../../shared/models/directory';
import { DirectoryDashboardService } from '../directory-dashboard.service';
import * as _ from 'lodash';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { ExportService } from '../../../shared/import-export/export.service';
import { DashboardService } from '../../dashboard.service';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';
import { InventoryItem } from '../../../shared/models/inventory/inventory';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-directory-dashboard-menu',
    templateUrl: './directory-dashboard-menu.component.html',
    styleUrls: ['./directory-dashboard-menu.component.css'],
    standalone: false
})
export class DirectoryDashboardMenuComponent implements OnInit { 

  @Input()
  dashboardCollapsed: boolean;
  
  breadCrumbs: Array<Directory>;
  directory: Directory;
  view: string = 'grid';
  isAllSelected: boolean;
  hasSelectedItem: boolean;
  canCopyItem: boolean;
  activatedRouteSub: Subscription;
  updateSelectedStatusSub: Subscription;
  updateDashboardDataSub: Subscription;
  
  constructor(private activatedRoute: ActivatedRoute, 
    private directoryDbService: DirectoryDbService, private directoryDashboardService: DirectoryDashboardService,
    private exportService: ExportService, private dashboardService: DashboardService, private reportRollupService: ReportRollupService, private router: Router) { }

  ngOnInit() {
    this.activatedRouteSub = this.activatedRoute.params.subscribe(params => {
      let id: number = Number(params['id']);
      this.breadCrumbs = new Array();
      this.directory = this.directoryDbService.getById(id);
      this.isAllSelected = false;
      this.setSelectedStatus();
      this.getBreadcrumbs(id);
    });

    this.updateSelectedStatusSub = this.directoryDashboardService.updateSelectedStatus.subscribe(shouldUpdate => {
      this.updateSelectedStatus();
    });

    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(val => {
      this.directory = this.directoryDbService.getById(this.directory.id); 
      if (this.directory){
        this.directory.selected = false;    
        this.isAllSelected = false;
        this.setSelectedStatus();
      }
    });


  }

  ngOnDestroy() {
    this.activatedRouteSub.unsubscribe();
    this.updateSelectedStatusSub.unsubscribe();
    this.updateDashboardDataSub.unsubscribe();
  }

  getBreadcrumbs(dirId: number) {
    let resultDir = this.directoryDbService.getById(dirId);
    if (resultDir.id !== this.directory.id) {
      this.breadCrumbs.unshift(resultDir);
    }
    if (resultDir.parentDirectoryId) {
      this.getBreadcrumbs(resultDir.parentDirectoryId);
    }
  }

  toggleSelectAll() {
    this.directory.selected = this.isAllSelected;
    this.hasSelectedItem = this.isAllSelected;
    this.directory.assessments.forEach(assessment => {
      assessment.selected = this.isAllSelected;
    });
    this.directory.subDirectory.forEach(subDir => {
      subDir.selected = this.isAllSelected;
    });
    this.directory.calculators.forEach(calculator => {
      calculator.selected = this.isAllSelected;
    });
    this.directory.inventories.forEach(inventory => {
      inventory.selected = this.isAllSelected;
    });    
    this.setSelectedStatus();
  }

  updateSelectedStatus() {
    this.setSelectedStatus();
    this.setIsAllSelected();
  }

  setSelectedStatus() {
    let hasAssessmentSelected: Assessment = _.find(this.directory.assessments, (value) => { return value.selected == true });
    let hasDirectorySelected: Directory = _.find(this.directory.subDirectory, (value) => { return value.selected == true });
    let hasInventorySelected: InventoryItem = _.find(this.directory.inventories, (value) => { return value.selected == true });
    let hasCalculatorSelected: Calculator;
    if (this.directory.calculators) {
      hasCalculatorSelected = _.find(this.directory.calculators, (value) => { return value.selected == true });
    }
    this.hasSelectedItem = hasAssessmentSelected != undefined || hasDirectorySelected != undefined || hasInventorySelected != undefined || hasCalculatorSelected != undefined;
    this.canCopyItem = hasAssessmentSelected != undefined || hasInventorySelected != undefined || hasCalculatorSelected != undefined || hasDirectorySelected != undefined;
  }
  
  setIsAllSelected() {
    let hasAssessmentUnselected: Assessment = _.find(this.directory.assessments, (value) => { return value.selected == false });
    let hasDirUnselected: Directory = _.find(this.directory.subDirectory, (value) => { return value.selected == false });
    let hasInventoryUnselected: InventoryItem = _.find(this.directory.inventories, (value) => { return value.selected == false });
    let hasCalculatorUnselected: Calculator;
    if (this.directory.calculators) {
      hasCalculatorUnselected = _.find(this.directory.calculators, (value) => { return value.selected == false });
    }
    this.isAllSelected = hasAssessmentUnselected == undefined && hasDirUnselected == undefined && hasInventoryUnselected == undefined && hasCalculatorUnselected == undefined;
    this.directory.selected = this.isAllSelected;
  }

  checkReport() {
    let assessmentSelectedTest: Assessment = _.find(this.directory.assessments, (value) => { return value.selected == true });
    let directorySelectedTest: Directory = _.find(this.directory.subDirectory, (value) => {
      if (value.selected == true) {
        if (value.assessments != undefined && value.assessments.length != 0) {
          return true;
        }
      }
    });
    return (assessmentSelectedTest != undefined) || (directorySelectedTest != undefined);
  }

  showCreateAssessment() {
    this.dashboardService.createAssessment.next(true);
  }

  showCreateFolder() {
    this.directoryDashboardService.createFolder.next(true);
  }

  showDeleteItemsModal() {
    this.directoryDashboardService.showDeleteItemsModal.next(true);
  }

  showImportModal() {
    this.directoryDashboardService.showImportModal.next(true);
  }

  showAddInventory() {
    this.dashboardService.showCreateInventory.next('motorInventory');
  }

  showExportModal() {
    this.exportService.exportAll = false;
    this.directoryDashboardService.showExportModal.next(true);
  }

  showPreAssessment() {
    this.directoryDashboardService.showPreAssessmentModalIndex.next({ isNew: true, index: 0 });
  }

  generateReport() {
    this.reportRollupService.getReportData(this.directory);
    this.router.navigateByUrl('/report-rollup');
  }

  showCopyItems(){
    this.dashboardService.copyItems.next(true);
  }

  moveToFolder() {
    this.dashboardService.moveItems.next(true);
  }
}
