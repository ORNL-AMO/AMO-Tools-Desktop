import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Directory, DirectoryDbRef } from '../../../shared/models/directory';
import { ModelService } from '../../../shared/model.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Settings } from '../../../shared/models/settings';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';


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
  @Input()
  directorySettings: Settings;

  canAdd: boolean = true;
  newFolder: any;
  constructor(private formBuilder: FormBuilder, private modelService: ModelService, private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService) { }

  ngOnInit() {
    this.newFolder = this.initForm();
  }

  initForm() {
    return this.formBuilder.group({
      'newFolderName': ['', Validators.required]
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
        name: this.newFolder.controls.newFolderName.value,
        parentDirectoryId: this.directory.id,
        createdDate: new Date(),
        modifiedDate: new Date()
      }

      this.indexedDbService.addDirectory(newDir).then(newDirId => {
        this.directoryDbService.setAll().then(() => {
          this.directorySettings.directoryId = newDirId;
          delete this.directorySettings.id;
          this.indexedDbService.addSettings(this.directorySettings).then(() => { this.settingsDbService.setAll() });
          this.canAdd = true;
          this.directory.subDirectory = this.directoryDbService.getSubDirectoriesById(this.directory.id);
          this.newDirectory.emit(true);
        })
      })
    }
  }

}
