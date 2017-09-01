import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Directory, DirectoryDbRef } from '../../../shared/models/directory';
import { ModelService } from '../../../shared/model.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

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

  newFolder: any;
  constructor(private formBuilder: FormBuilder, private modelService: ModelService, private indexedDbService: IndexedDbService) { }

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
    this.hideCreateModal();
    let newDir: DirectoryDbRef = {
      name: this.newFolder.value.newFolderName,
      parentDirectoryId: this.directory.id,
      createdDate: new Date(),
      modifiedDate: new Date()
    }

    this.indexedDbService.addDirectory(newDir).then(newDirId => {
      this.indexedDbService.getChildrenDirectories(this.directory.id).then(childDirs => {
        this.directory.subDirectory = childDirs;
        this.newDirectory.emit(true);
      })
    })
  }

}
