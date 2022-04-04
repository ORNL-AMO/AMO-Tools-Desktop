import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Calculator } from '../../../../shared/models/calculators';
import { Directory } from '../../../../shared/models/directory';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IndexedDbService } from '../../../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PreAssessmentService } from '../../../../calculator/utilities/pre-assessment/pre-assessment.service';
import { Settings } from '../../../../shared/models/settings';
import { CalculatorDbService } from '../../../../indexedDb/calculator-db.service';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { DirectoryDashboardService } from '../../directory-dashboard.service';
import { DashboardService } from '../../../dashboard.service';
import { DirectoryDbService } from '../../../../indexedDb/directory-db.service';
import { firstValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-pre-assessment-item',
  templateUrl: './pre-assessment-item.component.html',
  styleUrls: ['./pre-assessment-item.component.css']
})
export class PreAssessmentItemComponent implements OnInit {
  @Input()
  calculator: Calculator;
  @Input()
  index: number;


  @ViewChild('editModal', { static: false }) public editModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  @ViewChild('copyModal', { static: false }) public copyModal: ModalDirective;

  allDirectories: Array<Directory>;
  directory: Directory;
  editForm: FormGroup;
  copyForm: FormGroup;
  numUnits: number = 0;
  energyUsed: number = 0;
  energyCost: number = 0;
  dropdownOpen: boolean = false;

  settings: Settings;

  updateDashboardDataSub: Subscription;
  dashboardView: string;
  dashboardViewSub: Subscription;
  constructor(private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService, private formBuilder: FormBuilder, private preAssessmentService: PreAssessmentService, private calculatorDbService: CalculatorDbService,
    private directoryDashboardService: DirectoryDashboardService, private dashboardService: DashboardService, private directoryDbService: DirectoryDbService) { }

  ngOnInit() {
    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(val => {
      this.directory = this.directoryDbService.getById(this.calculator.directoryId);
      this.setDirectories();
      this.settings = this.settingsDbService.getByDirectoryId(this.calculator.directoryId);
      this.calculateData();
    });

    this.dashboardViewSub = this.directoryDashboardService.dashboardView.subscribe(val => {
      this.dashboardView = val;
    });
  }

  ngOnDestroy() {
    this.updateDashboardDataSub.unsubscribe();
    this.dashboardViewSub.unsubscribe();
  }

  async setDirectories() {
    this.allDirectories = await firstValueFrom(this.directoryDbService.getAllDirectories());
  }


  calculateData() {
    if (this.calculator.preAssessments) {
      this.numUnits = this.calculator.preAssessments.length;
      let tmpResults = this.preAssessmentService.getResults(this.calculator.preAssessments, this.settings, 'MMBtu', false);
      this.energyUsed = _.sumBy(tmpResults, 'value');
      this.energyCost = _.sumBy(tmpResults, 'energyCost');
    } 
  }

  async deletePreAssessment() {
    let calculators: Calculator[] = await firstValueFrom(this.calculatorDbService.deleteByIdWithObservable(this.calculator.id)); 
    this.calculatorDbService.setAll(calculators); 
    this.dashboardService.updateDashboardData.next(true);
    this.hideDeleteModal();
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

  async save() {
    this.calculator.name = this.editForm.controls.name.value;
    this.calculator.directoryId = this.editForm.controls.directoryId.value;
    let updatedCalculators: Calculator[] = await firstValueFrom(this.calculatorDbService.updateWithObservable(this.calculator)) 
    this.calculatorDbService.setAll(updatedCalculators);
    this.dashboardService.updateDashboardData.next(true);
    this.hideEditModal();
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
    this.copyForm = this.formBuilder.group({
      'name': [this.calculator.name + ' (copy)', Validators.required],
      'directoryId': [this.calculator.directoryId, Validators.required]
    });
    this.copyModal.show();
  }

  hideCopyModal() {
    this.copyModal.hide();
  }

  async createCopy() {
    let calculatorCopy: Calculator = JSON.parse(JSON.stringify(this.calculator));
    delete calculatorCopy.id;
    calculatorCopy.name = this.copyForm.controls.name.value;
    calculatorCopy.directoryId = this.copyForm.controls.directoryId.value;
    
    await firstValueFrom(this.calculatorDbService.addWithObservable(calculatorCopy));
    let updatedCalculators = await firstValueFrom(this.calculatorDbService.getAllCalculators());
    this.calculatorDbService.setAll(updatedCalculators);
    this.dashboardService.updateDashboardData.next(true);
    this.hideCopyModal();
  }
}
