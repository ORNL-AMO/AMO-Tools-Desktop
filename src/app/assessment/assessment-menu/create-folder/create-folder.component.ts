import { Component, OnInit, ViewChild, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Directory, DirectoryDbRef } from '../../../shared/models/directory';
import { ModelService } from '../../../shared/model.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Settings } from '../../../shared/models/settings';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-create-folder',
  templateUrl: './create-folder.component.html',
  styleUrls: ['./create-folder.component.css']
})
export class CreateFolderComponent implements OnInit {
  @Input()
  directory: Directory;
  @Output('newDirectory')
  newDirectory = new EventEmitter<boolean>();

  canAdd: boolean = true;
  newFolderForm: FormGroup;

  directories: Array<Directory>;


  directorySettings: Settings;

  constructor(private formBuilder: FormBuilder, private modelService: ModelService, private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService) { }

  ngOnInit() {
    this.newFolderForm = this.initForm();
    this.directories = this.directoryDbService.getAll();
    this.directorySettings = this.settingsDbService.getByDirectoryId(this.directory.id);
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.directory && !changes.directory.firstChange){
      this.directorySettings = this.settingsDbService.getByDirectoryId(this.directory.id);
      this.newFolderForm = this.initForm();
    }
  }

  initForm() {
    return this.formBuilder.group({
      'newFolderName': ['', Validators.required],
      'companyName': [''],
      'facilityName': [''],
      'directoryId': [this.directory.id, Validators.required]
    });
  }

  //  CREATE FOLDER MODAL
  @ViewChild('createModal') public createModal: ModalDirective;
  showCreateModal() {
    this.createModal.show();
  }

  hideCreateModal() {
    this.createModal.hide();
  }

  createFolder() {
    if (this.canAdd) {
      this.canAdd = false;
      this.hideCreateModal();
      let newDir: DirectoryDbRef = {
        name: this.newFolderForm.controls.newFolderName.value,
        parentDirectoryId: this.directory.id,
        createdDate: new Date(),
        modifiedDate: new Date()
      }

      if (this.newFolderForm.controls.companyName.value || this.newFolderForm.controls.facilityName.value) {
        delete this.directorySettings.facilityInfo;
        this.directorySettings.facilityInfo = {
          companyName: this.newFolderForm.controls.companyName.value,
          facilityName: this.newFolderForm.controls.facilityName.value,
          date: new Date().toLocaleDateString()
        }
      }

      this.indexedDbService.addDirectory(newDir).then(newDirId => {
        this.directoryDbService.setAll().then(() => {
          this.directorySettings.directoryId = newDirId;
          delete this.directorySettings.id;
          this.indexedDbService.addSettings(this.directorySettings).then(() => {
            this.settingsDbService.setAll().then(() => {
              this.canAdd = true;
              this.directory.subDirectory = this.directoryDbService.getSubDirectoriesById(this.directory.id);
              this.newFolderForm = this.initForm();
              this.newDirectory.emit(true);
            })
          });
        })
      })
    }
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

}
