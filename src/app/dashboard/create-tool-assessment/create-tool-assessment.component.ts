import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { DashboardService } from '../dashboard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-tool-assessment',
  templateUrl: './create-tool-assessment.component.html',
  styleUrls: ['./create-tool-assessment.component.css']
})
export class CreateToolAssessmentComponent implements OnInit {


  @ViewChild('createModal', { static: false }) public createModal: ModalDirective;
  newToolAssessmentForm: FormGroup;
  selectedEquip: string = 'new';
  showDropdown: boolean = false;
  selectedAssessment: string = 'Select Pump';
  canCreate: boolean;
  // showNewFolder: boolean = false;
  // newFolderForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    // private assessmentService: AssessmentService,
    private router: Router,
    private indexedDbService: IndexedDbService,
    // private settingsDbService: SettingsDbService,
    // private assessmentDbService: AssessmentDbService,
    // private directoryDbService: DirectoryDbService,
    // private directoryDashboardService: DirectoryDashboardService,
    private dashboardService: DashboardService) { }

  ngOnInit() {
    // this.directories = this.directoryDbService.getAll();
    // let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    // this.directory = this.directoryDbService.getById(directoryId);
    // this.settings = this.settingsDbService.getByDirectoryId(directoryId);
    this.newToolAssessmentForm = this.initForm();
    // this.newFolderForm = this.initFolderForm();
    this.canCreate = true;
    // if (this.dashboardService.newAssessmentType) {
    //   this.newAssessmentForm.patchValue({
    //     assessmentType: this.dashboardService.newAssessmentType
    //   });
    // }
  }

  ngAfterViewInit() {
    this.showCreateModal();
  }

  initForm() {
    return this.formBuilder.group({
      'assessmentName': ['New Assessment', Validators.required],
      'assessmentType': ['logger', Validators.required],
      // 'directoryId': [this.directory.id, Validators.required]
    });
  }

  //  CREATE ASSESSMENT MODAL
  showCreateModal() {
    this.createModal.show();
  }

  hideCreateModal(bool?: boolean) {
    this.showDropdown = false;
    this.createModal.hide();
    // this.dashboardService.newAssessmentType = undefined;
    this.dashboardService.createToolAssessment.next(false);
  }

  createAssessment() {
    this.hideCreateModal();
    this.createModal.onHidden.subscribe(() => {
      this.router.navigateByUrl('/log-tool');
    })
  }

  // getParentDirStr(id: number) {
  //   let parentDir = _.find(this.directories, (dir) => { return dir.id === id; });
  //   if (parentDir) {
  //     let str = parentDir.name + '/';
  //     while (parentDir.parentDirectoryId) {
  //       parentDir = _.find(this.directories, (dir) => { return dir.id === parentDir.parentDirectoryId; });
  //       str = parentDir.name + '/' + str;
  //     }
  //     return str;
  //   } else {
  //     return '';
  //   }
  // }


  // addFolder() {
  //   this.showNewFolder = true;
  // }

  // cancelNewFolder() {
  //   this.showNewFolder = false;
  // }


  // createFolder() {
  //   let tmpFolder: Directory = {
  //     name: this.newFolderForm.controls.folderName.value,
  //     parentDirectoryId: this.newFolderForm.controls.directoryId.value
  //   };
  //   let tmpSettings: Settings = this.settingsDbService.getByDirectoryId(this.newFolderForm.controls.directoryId.value);
  //   delete tmpSettings.facilityInfo;
  //   delete tmpSettings.id;
  //   if (this.newFolderForm.controls.companyName.value || this.newFolderForm.controls.facilityName.value) {
  //     tmpSettings.facilityInfo = {
  //       companyName: this.newFolderForm.controls.companyName.value,
  //       facilityName: this.newFolderForm.controls.facilityName.value,
  //       date: new Date().toLocaleDateString()
  //     };
  //   }
  //   this.indexedDbService.addDirectory(tmpFolder).then((newDirId) => {
  //     tmpSettings.directoryId = newDirId;
  //     this.directoryDbService.setAll().then(() => {
  //       this.indexedDbService.addSettings(tmpSettings).then(() => {
  //         this.settingsDbService.setAll().then(() => {
  //           this.directories = this.directoryDbService.getAll();
  //           this.newAssessmentForm.patchValue({
  //             'directoryId': newDirId
  //           });
  //           this.cancelNewFolder();
  //         });
  //       });
  //     });
  //   });
  // }

  // initFolderForm() {
  //   return this.formBuilder.group({
  //     'folderName': ['', Validators.required],
  //     'companyName': [''],
  //     'facilityName': [''],
  //     'directoryId': [this.directory.id, Validators.required]
  //   });
  // }
}
