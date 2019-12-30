import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Directory, DirectoryDbRef } from '../../shared/models/directory';
import { Router } from '@angular/router';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { Settings } from '../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import * as _ from 'lodash';
import { AssessmentService } from '../assessment.service';
import { DirectoryDashboardService } from '../directory-dashboard/directory-dashboard.service';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-assessment-create',
  templateUrl: './assessment-create.component.html',
  styleUrls: ['./assessment-create.component.css']
})
export class AssessmentCreateComponent implements OnInit {


  @ViewChild('createModal', { static: false }) public createModal: ModalDirective;
  newAssessmentForm: FormGroup;
  selectedEquip: string = 'new';
  showDropdown: boolean = false;
  selectedAssessment: string = 'Select Pump';
  canCreate: boolean;
  directories: Array<Directory>;
  showNewFolder: boolean = false;
  newFolderForm: FormGroup;
  directory: Directory;
  settings: Settings;
  constructor(
    private formBuilder: FormBuilder,
    private assessmentService: AssessmentService,
    private router: Router,
    private indexedDbService: IndexedDbService,
    private settingsDbService: SettingsDbService,
    private assessmentDbService: AssessmentDbService,
    private directoryDbService: DirectoryDbService,
    private directoryDashboardService: DirectoryDashboardService,
    private dashboardService: DashboardService) { }

  ngOnInit() {
    this.directories = this.directoryDbService.getAll();
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.directory = this.directoryDbService.getById(directoryId);
    this.settings = this.settingsDbService.getByDirectoryId(directoryId);
    this.newAssessmentForm = this.initForm();
    this.newFolderForm = this.initFolderForm();
    this.canCreate = true;
    if (this.dashboardService.newAssessmentType) {
      this.newAssessmentForm.patchValue({
        assessmentType: this.dashboardService.newAssessmentType
      });
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
  showCreateModal() {
    this.createModal.show();
  }

  hideCreateModal(bool?: boolean) {
    this.showDropdown = false;
    this.createModal.hide();
    this.dashboardService.newAssessmentType = undefined;
    this.dashboardService.createAssessment.next(false);
  }

  createAssessment() {
    if (this.newAssessmentForm.valid && this.canCreate) {
      this.canCreate = false;
      this.hideCreateModal(true);
      this.createModal.onHidden.subscribe(() => {
        this.assessmentService.tab = 'system-setup';
        //psat
        if (this.newAssessmentForm.controls.assessmentType.value === 'Pump') {
          let tmpAssessment = this.assessmentService.getNewAssessment('PSAT');
          tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
          let tmpPsat = this.assessmentService.getNewPsat();
          tmpAssessment.psat = tmpPsat;
          if (this.settings.powerMeasurement !== 'hp') {
            tmpAssessment.psat.inputs.motor_rated_power = 150;
          }
          tmpAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
          this.indexedDbService.addAssessment(tmpAssessment).then(assessmentId => {
            this.assessmentDbService.setAll().then(() => {
              tmpAssessment.id = assessmentId;
              this.router.navigateByUrl('/psat/' + tmpAssessment.id);
            });
          });
        }
        //phast
        else if (this.newAssessmentForm.controls.assessmentType.value === 'Furnace') {
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
          };
          this.indexedDbService.addAssessment(tmpAssessment).then(assessmentId => {
            this.assessmentDbService.setAll().then(() => {
              tmpAssessment.id = assessmentId;
              this.router.navigateByUrl('/phast/' + tmpAssessment.id);
            });
          });
        }
        //fsat
        else if (this.newAssessmentForm.controls.assessmentType.value === 'Fan') {
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
              };
              this.indexedDbService.putDirectory(tmpDirRef).then(results => {
                this.router.navigateByUrl('/fsat/' + tmpAssessment.id);
              });
            });
          });
        }
        //ssmt
        else if (this.newAssessmentForm.controls.assessmentType.value === 'Steam') {
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
              };
              this.indexedDbService.putDirectory(tmpDirRef).then(results => {
                this.router.navigateByUrl('/ssmt/' + tmpAssessment.id);
              });
            });
          });
        } if (this.newAssessmentForm.controls.assessmentType.value == 'TreasureHunt') {
          let tmpAssessment = this.assessmentService.getNewAssessment('TreasureHunt');
          tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
          tmpAssessment.directoryId = this.directory.id;
          //tmpAssessment.treasureHunt = this.assessmentService.getNewTreasureHunt();
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
                this.router.navigateByUrl('/treasure-hunt/' + tmpAssessment.id)
              });
            })
          });
        }
      });
    }
  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.directories, (dir) => { return dir.id === id; });
    if (parentDir) {
      let str = parentDir.name + '/';
      while (parentDir.parentDirectoryId) {
        parentDir = _.find(this.directories, (dir) => { return dir.id === parentDir.parentDirectoryId; });
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
    };
    let tmpSettings: Settings = this.settingsDbService.getByDirectoryId(this.newFolderForm.controls.directoryId.value);
    delete tmpSettings.facilityInfo;
    delete tmpSettings.id;
    if (this.newFolderForm.controls.companyName.value || this.newFolderForm.controls.facilityName.value) {
      tmpSettings.facilityInfo = {
        companyName: this.newFolderForm.controls.companyName.value,
        facilityName: this.newFolderForm.controls.facilityName.value,
        date: new Date().toLocaleDateString()
      };
    }
    this.indexedDbService.addDirectory(tmpFolder).then((newDirId) => {
      tmpSettings.directoryId = newDirId;
      this.directoryDbService.setAll().then(() => {
        this.indexedDbService.addSettings(tmpSettings).then(() => {
          this.settingsDbService.setAll().then(() => {
            this.directories = this.directoryDbService.getAll();
            this.newAssessmentForm.patchValue({
              'directoryId': newDirId
            });
            this.cancelNewFolder();
          });
        });
      });
    });
  }

  initFolderForm() {
    return this.formBuilder.group({
      'folderName': ['', Validators.required],
      'companyName': [''],
      'facilityName': [''],
      'directoryId': [this.directory.id, Validators.required]
    });
  }
}
