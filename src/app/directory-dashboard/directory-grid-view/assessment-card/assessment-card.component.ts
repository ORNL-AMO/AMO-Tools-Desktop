import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';

import { ModalDirective } from 'ngx-bootstrap';
import { Directory } from '../../../shared/models/directory';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssessmentDbService } from '../../../indexedDb/assessment-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { Calculator } from '../../../shared/models/calculators';
import { AssessmentService } from '../../../assessment/assessment.service';

@Component({
  selector: 'app-assessment-card',
  templateUrl: './assessment-card.component.html',
  styleUrls: ['./assessment-card.component.css']
})

export class AssessmentCardComponent implements OnInit {
  @Input()
  assessment: Assessment;

  @ViewChild('editModal', { static: false }) public editModal: ModalDirective;
  @ViewChild('copyModal', { static: false }) public copyModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  directories: Array<Directory>;

  editForm: FormGroup;
  copyForm: FormGroup;

  dropdownOpen: boolean = false;
  assessmentCopy: Assessment;
  settingsCopy: Settings;
  assessmentCalculatorCopy: Calculator;
  calculatorId: number;
  constructor(private assessmentService: AssessmentService,
    private indexedDbService: IndexedDbService, private formBuilder: FormBuilder,
    private assessmentDbService: AssessmentDbService, private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService) { }


  ngOnInit() {
    this.assessmentCopy = JSON.parse(JSON.stringify(this.assessment));
    delete this.assessmentCopy.id;

    let tmpCalculator: Calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
  
    if (tmpCalculator) {
      this.assessmentCalculatorCopy = JSON.parse(JSON.stringify(tmpCalculator));
      this.calculatorId = this.assessmentCalculatorCopy.id;
      delete this.assessmentCalculatorCopy.id;
    }
    let tmpSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment);
    this.settingsCopy = JSON.parse(JSON.stringify(tmpSettings));
    delete this.settingsCopy.id;
  }

  goToAssessment(assessment: Assessment) {
    this.assessmentService.goToAssessment(assessment);
  }

  showEditModal() {
    this.indexedDbService.getAllDirectories().then(dirs => {
      this.directories = dirs;
      this.editForm = this.formBuilder.group({
        'name': [this.assessment.name, Validators.required],
        'directoryId': [this.assessment.directoryId, Validators.required]
      });
      this.editModal.show();
    });
  }

  hideEditModal() {
    this.editModal.hide();
  }

  showCopyModal() {
    this.indexedDbService.getAllDirectories().then(dirs => {
      this.directories = dirs;
      this.copyForm = this.formBuilder.group({
        'name': [this.assessment.name + ' (copy)', Validators.required],
        'directoryId': [this.assessment.directoryId, Validators.required],
        'copyModifications': [false],
        'copyCalculators': [false]
      });
      this.copyModal.show();
    });
  }

  hideCopyModal() {
    this.copyModal.hide();
  }

  createCopy() {
    this.assessmentCopy.name = this.copyForm.controls.name.value;
    this.assessmentCopy.directoryId = this.copyForm.controls.directoryId.value;
    this.assessmentCopy.createdDate = new Date();
    this.assessmentCopy.modifiedDate = new Date();

    if (this.copyForm.controls.copyModifications.value === false) {
      if (this.assessmentCopy.type === 'PHAST') {
        this.assessmentCopy.phast.modifications = new Array();
      } else if (this.assessmentCopy.type === 'PSAT') {
        this.assessmentCopy.psat.modifications = new Array();
      }
    }

    this.indexedDbService.addAssessment(this.assessmentCopy).then(newAssessmentId => {
      this.settingsCopy.assessmentId = newAssessmentId;
      this.indexedDbService.addSettings(this.settingsCopy).then(() => {
        this.settingsDbService.setAll().then(() => {
          this.assessmentDbService.setAll().then(() => {
            if (this.copyForm.controls.copyCalculators.value === true) {
              this.assessmentCalculatorCopy.assessmentId = newAssessmentId;
              this.indexedDbService.addCalculator(this.assessmentCalculatorCopy).then(() => {
                this.calculatorDbService.setAll().then(() => {
                  this.hideCopyModal();
                });
              });
            } else {
              this.hideCopyModal();
            }
          });
        });
      });
    });
  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.directories, (dir) => { return dir.id === id; });
    let str = parentDir.name + '/';
    while (parentDir.parentDirectoryId) {
      parentDir = _.find(this.directories, (dir) => { return dir.id === parentDir.parentDirectoryId; });
      str = parentDir.name + '/' + str;
    }
    return str;
  }

  save() {
    this.assessment.name = this.editForm.controls.name.value;
    this.assessment.directoryId = this.editForm.controls.directoryId.value;
    this.indexedDbService.putAssessment(this.assessment).then(val => {
      this.assessmentDbService.setAll().then(() => {
        this.assessmentService.updateSidebarData.next(true);
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

  deleteAssessment() {
    let deleteSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment);
    this.indexedDbService.deleteAssessment(this.assessment.id).then(() => {
      this.indexedDbService.deleteSettings(deleteSettings.id).then(() => {
        this.assessmentDbService.setAll().then(() => {
          this.settingsDbService.setAll().then(() => {
            if (this.assessmentCalculatorCopy) {
              this.indexedDbService.deleteCalculator(this.calculatorId).then(() => {
                this.calculatorDbService.setAll().then(() => {
                  this.hideDeleteModal();
                  this.assessmentService.updateSidebarData.next(true);
                });
              });
            } else {
              console.log('delete');
              this.hideDeleteModal();
              this.assessmentService.updateSidebarData.next(true);
            }
          });
        });
      });
    });
  }
}
