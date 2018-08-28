import { Component, OnInit, Input, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { AssessmentService } from '../../assessment.service';
import { ModalDirective } from 'ngx-bootstrap';
import { Directory } from '../../../shared/models/directory';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import * as _ from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssessmentDbService } from '../../../indexedDb/assessment-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-assessment-card',
  templateUrl: './assessment-card.component.html',
  styleUrls: ['./assessment-card.component.css', '../assessment-grid-view.component.css']
})

export class AssessmentCardComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  isChecked: boolean;
  @Output('changeDirectory')
  changeDirectory = new EventEmitter<boolean>();

  isFirstChange: boolean = true;
  @ViewChild('editModal') public editModal: ModalDirective;
  @ViewChild('copyModal') public copyModal: ModalDirective;
  @ViewChild('deleteModal') public deleteModal: ModalDirective;
  directories: Array<Directory>;

  editForm: FormGroup;
  copyForm: FormGroup;

  dropdownOpen: boolean = false;
  assessmentCopy: Assessment;
  settingsCopy: Settings;
  copyModifications: boolean = false;
  constructor(private assessmentService: AssessmentService,
    private indexedDbService: IndexedDbService, private formBuilder: FormBuilder,
    private assessmentDbService: AssessmentDbService, private settingsDbService: SettingsDbService) { }


  ngOnInit() {
    if (this.isChecked) {
      this.assessment.selected = this.isChecked;
    }
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

  goToAssessment(assessment: Assessment) {
    this.assessmentService.goToAssessment(assessment);
  }

  setDelete() {
    this.assessment.selected = this.isChecked;
  }

  showEditModal() {
    this.indexedDbService.getAllDirectories().then(dirs => {
      this.directories = dirs;
      this.editForm = this.formBuilder.group({
        'name': [this.assessment.name, Validators.required],
        'directoryId': [this.assessment.directoryId, Validators.required]
      })
      this.editModal.show();
    })
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
        'copyModifications': [false]
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

    if(this.copyForm.controls.copyModifications.value == false){
      if(this.assessmentCopy.type == 'PHAST'){
        this.assessmentCopy.phast.modifications = new Array();
      }else if(this.assessmentCopy.type == 'PSAT'){
        this.assessmentCopy.psat.modifications = new Array();
      }
    }

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
        this.assessmentService.updateSidebarData.next(true);
        this.hideEditModal();
      })
    })
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
            console.log('delete')
            this.hideDeleteModal();
            this.assessmentService.updateSidebarData.next(true);
          })
        })
      })
    })
  }


}
