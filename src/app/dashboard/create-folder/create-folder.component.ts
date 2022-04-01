import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Directory, DirectoryDbRef } from '../../shared/models/directory';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
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
  styleUrls: ['./create-folder.component.css']
})
export class CreateFolderComponent implements OnInit {

  directory: Directory;
  settings: Settings;

  //  CREATE FOLDER MODAL
  @ViewChild('createModal', { static: false }) public createModal: ModalDirective;

  canAdd: boolean = true;
  newFolderForm: FormGroup;
  directories: Array<Directory>;

  constructor(
    private formBuilder: FormBuilder,
    private indexedDbService: IndexedDbService,
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

  createFolder() {
    if (this.canAdd) {
      this.canAdd = false;
      this.hideCreateModal();
      let newDir: DirectoryDbRef = {
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

      this.indexedDbService.addDirectory(newDir).then(newDirId => {
        this.directoryDbService.setAll().then(() => {
          this.settings.directoryId = newDirId;
          delete this.settings.id;
          this.indexedDbService.addSettings(this.settings).then(() => {
            this.settingsDbService.setAll().then(() => {
              this.canAdd = true;
              this.directory.subDirectory = this.directoryDbService.getSubDirectoriesById(this.directory.id);
              this.newFolderForm = this.initForm();
              this.dashboardService.updateDashboardData.next(true);
            });
          });
        });
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
}
