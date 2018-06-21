import { Component, OnInit, Input, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Router } from '@angular/router';
import { AssessmentService } from '../../assessment.service';
import { PsatService } from '../../../psat/psat.service';
import { Directory } from '../../../shared/models/directory';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { AssessmentDbService } from '../../../indexedDb/assessment-db.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

@Component({
  selector: 'app-assessment-list-item',
  templateUrl: './assessment-list-item.component.html',
  styleUrls: ['./assessment-list-item.component.css']
})
export class AssessmentListItemComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  isChecked: any;
  @Output('changeDirectory')
  changeDirectory = new EventEmitter<boolean>();

  isFirstChange: boolean = true;
  @ViewChild('editModal') public editModal: ModalDirective;
  @ViewChild('copyModal') public copyModal: ModalDirective;
  @ViewChild('deleteModal') public deleteModal: ModalDirective;
  
  directories: Array<Directory>;

  editForm: FormGroup;
  isSetup: boolean;

  showReport: boolean = false;
  copyForm: FormGroup;

  dropdownOpen: boolean = false;
  assessmentCopy: Assessment;
  settingsCopy: Settings;

  @ViewChild('reportModal') public reportModal: ModalDirective;
  constructor(private assessmentService: AssessmentService, private router: Router, private indexedDbService: IndexedDbService, private formBuilder: FormBuilder, private assessmentDbService: AssessmentDbService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    if (this.assessment.phast) {
      this.isSetup = this.assessment.phast.setupDone;
    } else if (this.assessment.psat) {
      this.isSetup = this.assessment.psat.setupDone;
    } else if(this.assessment.fsat){
      //todo: need logic for isSetup in fsat
      this.isSetup = true;
    }
    if (this.isChecked) {
      this.assessment.selected = this.isChecked;
    }

    this.indexedDbService.getAllDirectories().then(dirs => {
      this.directories = dirs;
    })

    this.assessmentCopy = JSON.parse(JSON.stringify(this.assessment));
    delete this.assessmentCopy.id;
    let tmpSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment);
    this.settingsCopy = JSON.parse(JSON.stringify(tmpSettings));
    delete this.settingsCopy.id;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isChecked && !this.isFirstChange) {
      this.assessment.selected = this.isChecked;
    }
    else {
      this.isFirstChange = false;
    }
  }

  goToAssessment(assessment: Assessment, str?: string, str2?: string) {
    this.assessmentService.goToAssessment(assessment, str, str2);
  }

  setDelete() {
    // this.assessment.selected = this.isChecked;
  }
  showEditModal() {
    this.editForm = this.formBuilder.group({
      'name': [this.assessment.name],
      'directoryId': [this.assessment.directoryId]
    })
    this.editModal.show();
  }

  hideEditModal() {
    this.editModal.hide();
  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.directories, (dir) => { return dir.id == id });
    let str = parentDir.name + '/';
    while (parentDir.parentDirectoryId) {
      parentDir = _.find(this.directories, (dir) => { return dir.id == parentDir.parentDirectoryId });
      str = parentDir.name + '/' + str;
    }
    return str;
  }

  save() {
    this.assessment.name = this.editForm.controls.name.value;
    this.assessment.directoryId = this.editForm.controls.directoryId.value;
    this.indexedDbService.putAssessment(this.assessment).then(val => {
      this.assessmentDbService.setAll().then(() => {
        this.changeDirectory.emit(true);
        this.hideEditModal();
      })
    })
  }

  showReportModal() {
    this.showReport = true;
    this.reportModal.show();
  }

  hideReportModal() {
    this.reportModal.hide();
    this.showReport = false;
  }

  showDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  showCopyModal() {
    this.indexedDbService.getAllDirectories().then(dirs => {
      this.directories = dirs;
      this.copyForm = this.formBuilder.group({
        'name': [this.assessment.name + ' (copy)', Validators.required],
        'directoryId': [this.assessment.directoryId, Validators.required]
      })
      this.copyModal.show();
    })
  }

  hideCopyModal() {
    this.copyModal.hide();
  }

  createCopy() {
    this.assessmentCopy.name = this.copyForm.controls.name.value;
    this.assessmentCopy.directoryId = this.copyForm.controls.directoryId.value;
    this.assessmentCopy.createdDate = new Date();
    this.assessmentCopy.modifiedDate = new Date();
    this.indexedDbService.addAssessment(this.assessmentCopy).then(newAssessmentId => {
      this.settingsCopy.assessmentId = newAssessmentId;
      this.indexedDbService.addSettings(this.settingsCopy).then(() => {
        this.settingsDbService.setAll().then(() => {
          this.assessmentDbService.setAll().then(() => {
            this.changeDirectory.emit(true);
            this.hideCopyModal();
          })
        })
      })
    })
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
            this.hideDeleteModal();
            this.changeDirectory.emit(true);
          })
        })
      })
    })
  }
}
