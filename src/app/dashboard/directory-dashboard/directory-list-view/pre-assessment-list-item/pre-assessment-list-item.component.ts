import { Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges } from '@angular/core';
import { Calculator } from '../../../../shared/models/calculators';
import { Directory } from '../../../../shared/models/directory';
import { ModalDirective } from 'ngx-bootstrap';
import { IndexedDbService } from '../../../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { CalculatorDbService } from '../../../../indexedDb/calculator-db.service';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { DashboardService } from '../../../dashboard.service';
import { DirectoryDashboardService } from '../../directory-dashboard.service';
import { DirectoryDbService } from '../../../../indexedDb/directory-db.service';
@Component({
  selector: 'app-pre-assessment-list-item',
  templateUrl: './pre-assessment-list-item.component.html',
  styleUrls: ['./pre-assessment-list-item.component.css']
})
export class PreAssessmentListItemComponent implements OnInit {
  @Input()
  calculator: Calculator;
  @Input()
  index: number;

  @ViewChild('editModal', { static: false }) public editModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  @ViewChild('copyModal', { static: false }) public copyModal: ModalDirective;


  allDirectories: Array<Directory>;
  directory: Directory;
  preAssessmentExists: boolean;
  editForm: FormGroup;
  copyForm: FormGroup;
  dropdownOpen: boolean = false;

  calculatorCopy: Calculator;
  settings: Settings;

  updateSidebarDataSub: Subscription;
  constructor(private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService, private formBuilder: FormBuilder, private calculatorDbService: CalculatorDbService,
    private directoryDashboardService: DirectoryDashboardService, private dashboardService: DashboardService, private directoryDbService: DirectoryDbService) { }


  ngOnInit() {
    this.updateSidebarDataSub = this.dashboardService.updateSidebarData.subscribe(val => {
      this.directory = this.directoryDbService.getById(this.calculator.directoryId);
      this.allDirectories = this.directoryDbService.getAll();
      this.settings = this.settingsDbService.getByDirectoryId(this.calculator.directoryId);
    });
  }

  ngOnDestroy() {
    this.updateSidebarDataSub.unsubscribe();
  }

  showPreAssessment() {
    this.directoryDashboardService.showPreAssessmentModalIndex.next({ index: this.index, isNew: false });
  }
  showEditModal() {
    this.editForm = this.formBuilder.group({
      'name': [this.calculator.name],
      'directoryId': [this.calculator.directoryId]
    });
    this.editModal.show();
  }

  hideEditModal() {
    this.editModal.hide();
  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.allDirectories, (dir) => { return dir.id === id; });
    if (parentDir) {
      let str = parentDir.name + '/';
      while (parentDir.parentDirectoryId) {
        parentDir = _.find(this.allDirectories, (dir) => { return dir.id === parentDir.parentDirectoryId; });
        str = parentDir.name + '/' + str;
      }
      return str;
    } else {
      return '';
    }
  }

  save() {
    this.calculator.name = this.editForm.controls.name.value;
    this.calculator.directoryId = this.editForm.controls.directoryId.value;
    this.indexedDbService.putCalculator(this.calculator).then(val => {
      this.calculatorDbService.setAll().then(() => {
        this.hideEditModal();
      });
    });
  }

  showDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  showDeleteModal() {
    this.deleteModal.show();
  }

  hideDeleteModal() {
    this.deleteModal.hide();
  }

  showCopyModal() {
    this.calculatorCopy = JSON.parse(JSON.stringify(this.calculator));
    delete this.calculatorCopy.id;
    this.copyForm = this.formBuilder.group({
      'name': [this.calculator.name + ' (copy)', Validators.required],
      'directoryId': [this.calculator.directoryId, Validators.required]
    });
    this.copyModal.show();
  }

  hideCopyModal() {
    this.copyModal.hide();
  }

  createCopy() {
    this.calculatorCopy.name = this.copyForm.controls.name.value;
    this.calculatorCopy.directoryId = this.copyForm.controls.directoryId.value;
    this.indexedDbService.addCalculator(this.calculatorCopy).then(newAssessmentId => {
      this.calculatorDbService.setAll().then(() => {
        this.hideCopyModal();
      });
    });
  }

  deletePreAssessment() {
    this.indexedDbService.deleteCalculator(this.calculator.id).then(() => {
      this.calculatorDbService.setAll().then(() => {
        this.hideDeleteModal();
      });
    });
  }
}
