import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
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
    // let newDir = this.modelService.getNewDirectory(this.newFolder.value.newFolderName);
    // newDir.collapsed = true;
    // newDir.parentDirectoryId = this.directory.id;
    let newDir: DirectoryDbRef = {
      name: this.newFolder.value.newFolderName,
      parentDirectoryId: this.directory.id,
      createdDate: new Date(),
      modifiedDate: new Date()
    }

    this.indexedDbService.addDirectory(newDir).then(newDirId => {
      this.indexedDbService.getDirectory(newDirId).then(newDirDb => {
        this.indexedDbService.getDirectory(this.directory.id).then(workingDirRef => {
          if (workingDirRef.subDirectoryIds) {
            workingDirRef.subDirectoryIds.push(newDirDb);
          } else {
            workingDirRef.subDirectoyIds = new Array();
            workingDirRef.subDirectoryIds.push(newDirDb);
          }
          this.indexedDbService.putDirectory(this.directory).then(results => {
            console.log(results);
          });
        });
      })
    })
  }

}
