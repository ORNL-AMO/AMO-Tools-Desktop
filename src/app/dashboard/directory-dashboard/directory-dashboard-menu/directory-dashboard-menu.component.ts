import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { Directory } from '../../../shared/models/directory';
import { DirectoryDashboardService } from '../directory-dashboard.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { ExportService } from '../../import-export/export.service';
import { DashboardService } from '../../dashboard.service';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';
import { InventoryItem } from '../../../shared/models/inventory/inventory';
import { ModalDirective } from 'ngx-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { AssessmentDbService } from '../../../indexedDb/assessment-db.service';
@Component({
  selector: 'app-directory-dashboard-menu',
  templateUrl: './directory-dashboard-menu.component.html',
  styleUrls: ['./directory-dashboard-menu.component.css']
})
export class DirectoryDashboardMenuComponent implements OnInit {
  @ViewChild('moveModal', { static: false }) public moveModal: ModalDirective;
  moveForm: FormGroup;
  updateDashboardDataSub: Subscription;
  allDirectories: Array<Directory>;
  breadCrumbs: Array<Directory>;
  directory: Directory;
  view: string = 'grid';
  isAllSelected: boolean;
  constructor(private activatedRoute: ActivatedRoute, private directoryDbService: DirectoryDbService, private directoryDashboardService: DirectoryDashboardService,
    private exportService: ExportService, private dashboardService: DashboardService, private reportRollupService: ReportRollupService, private router: Router,
    private formBuilder: FormBuilder, private indexedDbService: IndexedDbService, private assessmentDbService: AssessmentDbService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      let id: number = Number(params['id']);
      this.breadCrumbs = new Array();
      this.directory = this.directoryDbService.getById(id);
      this.isAllSelected = false;
      this.getBreadcrumbs(id);
    });
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
    })
  }

  checkSelected() {
    let assessmentSelectedTest: Assessment = _.find(this.directory.assessments, (value) => { return value.selected == true });
    let directorySelectedTest: Directory = _.find(this.directory.subDirectory, (value) => { return value.selected == true });
    let inventorySelectedTest: InventoryItem = _.find(this.directory.inventories, (value) => { return value.selected == true });
    let checkAssessmentDirectorySelected: boolean = (assessmentSelectedTest != undefined) || (directorySelectedTest != undefined) || (inventorySelectedTest != undefined);
    let calculatorSelectedTest: Calculator
    if (this.directory.calculators) {
      calculatorSelectedTest = _.find(this.directory.calculators, (value) => { return value.selected == true });
    }
    return checkAssessmentDirectorySelected || (calculatorSelectedTest != undefined);
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
    this.dashboardService.createInventory.next(true);
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

  moveToFolder() {
    this.showMoveModal();

  }

  showMoveModal() {
    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(val => {
      this.allDirectories = this.directoryDbService.getAll();
    });
    this.moveForm = this.formBuilder.group({      
      'directoryId': [this.directory.id, Validators.required]
    });
    this.moveModal.show();
  }

  hideMoveModal() {
    this.updateDashboardDataSub.unsubscribe();    
    this.moveModal.hide();
  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.allDirectories, (dir) => { return dir.id === id; });
    let str = parentDir.name + '/';
    while (parentDir.parentDirectoryId) {
      parentDir = _.find(this.allDirectories, (dir) => { return dir.id === parentDir.parentDirectoryId; });
      str = parentDir.name + '/' + str;
    }
    return str;
  }

  save() {
    this.directory.assessments.forEach(assessment => {
      if (assessment.selected) {
        assessment.directoryId = this.moveForm.controls.directoryId.value;
        this.indexedDbService.putAssessment(assessment).then(val => {
          this.assessmentDbService.setAll().then(() => {
            this.dashboardService.updateDashboardData.next(true);
          });
        });
      }
      this.hideMoveModal();

    });

  }

}
