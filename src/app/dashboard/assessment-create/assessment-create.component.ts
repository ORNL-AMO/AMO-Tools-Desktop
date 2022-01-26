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
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-assessment-create',
  templateUrl: './assessment-create.component.html',
  styleUrls: ['./assessment-create.component.css']
})
export class AssessmentCreateComponent implements OnInit {


  @ViewChild('createModal', { static: false }) public createModal: ModalDirective;
  newAssessmentForm: FormGroup;
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

  hideCreateModal() {
    this.createModal.hide();
    this.dashboardService.newAssessmentType = undefined;
    this.dashboardService.createAssessment.next(false);
  }

  createAssessment() {
    if (this.newAssessmentForm.valid && this.canCreate) {
      this.canCreate = false;
      this.assessmentService.tab = 'system-setup';
      //psat
      if (this.newAssessmentForm.controls.assessmentType.value === 'Pump') {
        let tmpAssessment = this.assessmentService.getNewAssessment('PSAT');
        tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
        let tmpPsat = this.assessmentService.getNewPsat(this.settings);
        tmpAssessment.psat = tmpPsat;
        tmpAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
        this.addAssessment(tmpAssessment, '/psat/');
      }
      //phast
      else if (this.newAssessmentForm.controls.assessmentType.value === 'Furnace') {
        let tmpAssessment: Assessment = this.assessmentService.getNewAssessment('PHAST');
        tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
        let tmpPhast = this.assessmentService.getNewPhast(this.settings);
        tmpAssessment.phast = tmpPhast;
        tmpAssessment.phast.setupDone = false;
        tmpAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
        this.addAssessment(tmpAssessment, '/phast/');
      }
      //fsat
      else if (this.newAssessmentForm.controls.assessmentType.value === 'Fan') {
        let tmpAssessment: Assessment = this.assessmentService.getNewAssessment('FSAT');
        tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
        tmpAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
        tmpAssessment.fsat = this.assessmentService.getNewFsat(this.settings);
        this.addAssessment(tmpAssessment, '/fsat/');
      }
      //ssmt
      else if (this.newAssessmentForm.controls.assessmentType.value === 'Steam') {
        let tmpAssessment: Assessment = this.assessmentService.getNewAssessment('SSMT');
        tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
        tmpAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
        tmpAssessment.ssmt = this.assessmentService.getNewSsmt();
        this.addAssessment(tmpAssessment, '/ssmt/');
      }
      //treasure hunt
      else if (this.newAssessmentForm.controls.assessmentType.value == 'TreasureHunt') {
        let tmpAssessment: Assessment = this.assessmentService.getNewAssessment('TreasureHunt');
        tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
        tmpAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
        this.addAssessment(tmpAssessment, '/treasure-hunt/');
      } 
      // Waste Water
      else if (this.newAssessmentForm.controls.assessmentType.value == 'WasteWater') {
        let tmpAssessment = this.assessmentService.getNewAssessment('WasteWater');
        tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
        tmpAssessment.directoryId = this.directory.id;
        tmpAssessment.wasteWater = this.assessmentService.getNewWasteWater(this.settings);
        this.addAssessment(tmpAssessment, '/waste-water/');
      }
      // Compressed Air
      else if (this.newAssessmentForm.controls.assessmentType.value == 'CompressedAir') {
        let tmpAssessment = this.assessmentService.getNewAssessment('CompressedAir');
        tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
        tmpAssessment.directoryId = this.directory.id;
        tmpAssessment.compressedAirAssessment = this.assessmentService.getNewCompressedAirAssessment(this.settings);
        this.addAssessment(tmpAssessment, '/compressed-air/');
      }
    }
  }

  addAssessment(assessment: Assessment, navigationUrl: string) {
    this.indexedDbService.addAssessment(assessment).then(assessmentId => {
      this.assessmentDbService.setAll();
      this.hideCreateModal();
      this.createModal.onHidden.subscribe(() => {
        this.router.navigateByUrl(navigationUrl + assessmentId);
      });
    });
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
