import { Component, OnInit, ViewChild, ViewChildren, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Directory, DirectoryDbRef } from '../../shared/models/directory';
import { ModelService } from '../../shared/model.service';
import { Router } from '@angular/router';
import { AssessmentService } from '../assessment.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { Settings } from '../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Assessment } from '../../shared/models/assessment';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-assessment-create',
  templateUrl: './assessment-create.component.html',
  styleUrls: ['./assessment-create.component.css']
})
export class AssessmentCreateComponent implements OnInit {
  @Input()
  directory: Directory;
  @Input()
  settings: Settings;
  @Output('hideModal')
  hideModal = new EventEmitter<boolean>();
  @Input()
  type: string;

  newAssessmentForm: FormGroup;
  selectedEquip: string = 'new';
  showDropdown: boolean = false;
  selectedAssessment: string = 'Select Pump';
  allAssessments: Array<Assessment>;
  filteredAssessments: Array<Assessment>;
  canCreate: boolean;
  directories: Array<Directory>;
  showNewFolder: boolean = false;
  newFolderForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private assessmentService: AssessmentService,
    private router: Router,
    private indexedDbService: IndexedDbService,
    private settingsDbService: SettingsDbService,
    private assessmentDbService: AssessmentDbService,
    private directoryDbService: DirectoryDbService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.directories = this.directoryDbService.getAll();
    this.newAssessmentForm = this.initForm();
    this.newFolderForm = this.initFolderForm();
    this.allAssessments = this.directory.assessments;
    this.filteredAssessments = this.allAssessments;
    this.canCreate = true;
    if (this.type) {
      this.newAssessmentForm.patchValue({
        assessmentType: this.type
      })
    }

  }

  ngAfterViewInit() {
    this.showCreateModal();
  }

  initForm() {
    return this.formBuilder.group({
      'assessmentName': ['New Assessment', Validators.required],
      'assessmentType': ['Pump', Validators.required],
      'directoryId': [this.directory.id, Validators.required]
    });
  }

  //  CREATE ASSESSMENT MODAL
  @ViewChild('createModal') public createModal: ModalDirective;
  showCreateModal() {
    this.createModal.show();
  }

  hideCreateModal(bool?: boolean) {
    this.showDropdown = false;
    this.createModal.hide();
    this.hideModal.emit(true);
    // this.hideModal.emit(true);
    if (!bool) {
      this.assessmentService.createAssessment.next(false);
    }

  }

  createAssessment() {
    if (this.newAssessmentForm.valid && this.canCreate) {
      this.canCreate = false;
      this.hideCreateModal(true);
      this.createModal.onHidden.subscribe(() => {
        this.assessmentService.tab = 'system-setup';
        //psat
        if (this.newAssessmentForm.controls.assessmentType.value == 'Pump') {
          let tmpAssessment = this.assessmentService.getNewAssessment('PSAT');
          tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
          let tmpPsat = this.assessmentService.getNewPsat();
          tmpAssessment.psat = tmpPsat;
          if (this.settings.powerMeasurement != 'hp') {
            tmpAssessment.psat.inputs.motor_rated_power = 150;
          }
          tmpAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
          this.indexedDbService.addAssessment(tmpAssessment).then(assessmentId => {
            this.assessmentDbService.setAll().then(() => {
              tmpAssessment.id = assessmentId;
              this.assessmentService.createAssessment.next(false);
              this.router.navigateByUrl('/psat/' + tmpAssessment.id)
            })
          })
        }
        //phast
        else if (this.newAssessmentForm.controls.assessmentType.value == 'Furnace') {
          let tmpAssessment = this.assessmentService.getNewAssessment('PHAST');
          tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
          let tmpPhast = this.assessmentService.getNewPhast();
          tmpAssessment.phast = tmpPhast;
          tmpAssessment.phast.setupDone = false;
          tmpAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
          tmpAssessment.phast.operatingCosts = {
            electricityCost: this.settings.electricityCost || .066,
            steamCost: this.settings.steamCost || 4.69,
            fuelCost: this.settings.fuelCost || 3.99
          }
          this.indexedDbService.addAssessment(tmpAssessment).then(assessmentId => {
            this.assessmentDbService.setAll().then(() => {
              tmpAssessment.id = assessmentId;
              this.assessmentService.createAssessment.next(false);
              this.router.navigateByUrl('/phast/' + tmpAssessment.id);
            });
          });
        } 
        //fsat
        else if (this.newAssessmentForm.controls.assessmentType.value == 'Fan') {
          let tmpAssessment = this.assessmentService.getNewAssessment('FSAT');
          tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
          tmpAssessment.directoryId = this.directory.id;
          tmpAssessment.fsat = this.assessmentService.getNewFsat();
          this.indexedDbService.addAssessment(tmpAssessment).then(assessmentId => {
            this.indexedDbService.getAssessment(assessmentId).then(assessment => {
              tmpAssessment = assessment;
              if (this.directory.assessments) {
                this.directory.assessments.push(tmpAssessment);
              } else {
                this.directory.assessments = new Array();
                this.directory.assessments.push(tmpAssessment);
              }

              let tmpDirRef: DirectoryDbRef = {
                name: this.directory.name,
                id: this.directory.id,
                parentDirectoryId: this.directory.parentDirectoryId,
                createdDate: this.directory.createdDate,
                modifiedDate: this.directory.modifiedDate
              }
              this.indexedDbService.putDirectory(tmpDirRef).then(results => {
                this.assessmentService.createAssessment.next(false);
                this.router.navigateByUrl('/fsat/' + tmpAssessment.id)
              });
            })
          });
        }
        //ssmt
        else if (this.newAssessmentForm.controls.assessmentType.value == 'Steam') {
          let tmpAssessment = this.assessmentService.getNewAssessment('SSMT');
          tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
          tmpAssessment.directoryId = this.directory.id;
          tmpAssessment.ssmt = this.assessmentService.getNewSsmt();
          this.indexedDbService.addAssessment(tmpAssessment).then(assessmentId => {
            this.indexedDbService.getAssessment(assessmentId).then(assessment => {
              tmpAssessment = assessment;
              if (this.directory.assessments) {
                this.directory.assessments.push(tmpAssessment);
              } else {
                this.directory.assessments = new Array();
                this.directory.assessments.push(tmpAssessment);
              }
              let tmpDirRef: DirectoryDbRef = {
                name: this.directory.name,
                id: this.directory.id,
                parentDirectoryId: this.directory.parentDirectoryId,
                createdDate: this.directory.createdDate,
                modifiedDate: this.directory.modifiedDate
              }
              this.indexedDbService.putDirectory(tmpDirRef).then(results => {
                this.assessmentService.createAssessment.next(false);
                this.router.navigateByUrl('/ssmt/' + tmpAssessment.id)
              });
            })
          });
        }
      })
    }
  }

  selectEquip(eq: string) {
    this.selectedEquip = eq;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  setAssessment(psatName: string) {
    this.selectedAssessment = psatName;
    this.toggleDropdown();
  }

  onKey(str: string) {
    if (str != '') {
      let temp = this.allAssessments.filter(f => f.name.toLowerCase().indexOf(str.toLowerCase()) >= 0);
      if (temp.length != 0) {
        this.filteredAssessments = temp;
      } else {
        this.filteredAssessments = this.allAssessments;
      }
    } else {
      this.filteredAssessments = this.allAssessments;
    }
  }

  getAllDirectories() {
    this.directories = this.directoryDbService.getAll();
    // _.remove(this.directories, (dir) => { return dir.id == this.directory.id });
    // _.remove(this.directories, (dir) => { return dir.parentDirectoryId == this.directory.id });
  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.directories, (dir) => { return dir.id == id });
    if (parentDir) {
      let str = parentDir.name + '/';
      while (parentDir.parentDirectoryId) {
        parentDir = _.find(this.directories, (dir) => { return dir.id == parentDir.parentDirectoryId });
        str = parentDir.name + '/' + str;
      }
      return str;
    } else {
      return '';
    }
  }


  addFolder() {
    this.showNewFolder = true;
  }

  cancelNewFolder() {
    this.showNewFolder = false;
  }


  createFolder() {
    let tmpFolder: Directory = {
      name: this.newFolderForm.controls.folderName.value,
      parentDirectoryId: this.newFolderForm.controls.directoryId.value
    }
    let tmpSettings: Settings = this.settingsDbService.getByDirectoryId(this.newFolderForm.controls.directoryId.value);
    delete tmpSettings.facilityInfo;
    delete tmpSettings.id;
    if (this.newFolderForm.controls.companyName.value || this.newFolderForm.controls.facilityName.value) {
      tmpSettings.facilityInfo = {
        companyName: this.newFolderForm.controls.companyName.value,
        facilityName: this.newFolderForm.controls.facilityName.value,
        date: new Date().toLocaleDateString()
      }
    }
    this.indexedDbService.addDirectory(tmpFolder).then((newDirId) => {
      tmpSettings.directoryId = newDirId;
      this.directoryDbService.setAll().then(() => {
        this.indexedDbService.addSettings(tmpSettings).then(() => {
          this.settingsDbService.setAll().then(() => {
            this.getAllDirectories();
            this.newAssessmentForm.patchValue({
              'directoryId': newDirId
            })
            this.cancelNewFolder();
          })
        })
      })
    })
  }

  initFolderForm() {
    return this.formBuilder.group({
      'folderName': ['', Validators.required],
      'companyName': [''],
      'facilityName': [''],
      'directoryId': [this.directory.id, Validators.required]
    })
  }
}
