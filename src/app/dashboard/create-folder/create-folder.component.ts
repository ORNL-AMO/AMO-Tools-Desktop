import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Directory, DirectoryDbRef } from '../../shared/models/directory';
 
import { Settings } from '../../shared/models/settings';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import * as _ from 'lodash';
import { DirectoryDashboardService } from '../directory-dashboard/directory-dashboard.service';
import { DashboardService } from '../dashboard.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-create-folder',
    templateUrl: './create-folder.component.html',
    styleUrls: ['./create-folder.component.css'],
    standalone: false
})
export class CreateFolderComponent implements OnInit {

  directory: Directory;
  settings: Settings;

  //  CREATE FOLDER MODAL
  @ViewChild('createModal', { static: false }) public createModal: ModalDirective;

  canAdd: boolean = true;
  newFolderForm: UntypedFormGroup;
  directories: Array<Directory>;

  constructor(
    private formBuilder: UntypedFormBuilder,
      
    private settingsDbService: SettingsDbService,
    private directoryDbService: DirectoryDbService,
    private directoryDashboardService: DirectoryDashboardService,
    private dashboardService: DashboardService) { }

  ngOnInit() {
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.setDirectories();
    this.directory = this.directoryDbService.getById(directoryId);
    this.settings = this.settingsDbService.getByDirectoryId(directoryId);
    this.newFolderForm = this.initForm();
  }

  ngAfterViewInit() {
    this.showCreateModal();
  }

  async setDirectories() {
    this.directories = await firstValueFrom(this.directoryDbService.getAllDirectories());
  }

  initForm() {
    return this.formBuilder.group({
      'newFolderName': ['', Validators.required],
      'companyName': [''],
      'facilityName': [''],
      'directoryId': [this.directory.id, Validators.required]
    });
  }

  showCreateModal() {
    this.createModal.show();
  }

  hideCreateModal() {
    this.createModal.hide();
    this.directoryDashboardService.createFolder.next(false);
  }

  async createFolder() {
    if (this.canAdd) {
      this.canAdd = false;
      this.hideCreateModal();
      let newDir: Directory = {
        name: this.newFolderForm.controls.newFolderName.value,
        parentDirectoryId: this.newFolderForm.controls.directoryId.value,
        createdDate: new Date(),
        modifiedDate: new Date()
      };

      if (this.newFolderForm.controls.companyName.value || this.newFolderForm.controls.facilityName.value) {
        delete this.settings.facilityInfo;
        this.settings.facilityInfo = {
          companyName: this.newFolderForm.controls.companyName.value,
          facilityName: this.newFolderForm.controls.facilityName.value,
          date: new Date().toLocaleDateString()
        };
      }

      let addedDirectory: Directory = await firstValueFrom(this.directoryDbService.addWithObservable(newDir));
      let allDirectories: Directory[] = await firstValueFrom(this.directoryDbService.getAllDirectories());
      this.directoryDbService.setAll(allDirectories);
  
      this.settings.directoryId = addedDirectory.id;
      delete this.settings.id;
      await firstValueFrom(this.settingsDbService.addWithObservable(this.settings));
      let allSettings: Settings[] =  await firstValueFrom(this.settingsDbService.getAllSettings());
      this.settingsDbService.setAll(allSettings);

      this.canAdd = true;
      this.directory.subDirectory = this.directoryDbService.getSubDirectoriesById(this.directory.id);
      this.newFolderForm = this.initForm();
      this.dashboardService.updateDashboardData.next(true);
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
}
