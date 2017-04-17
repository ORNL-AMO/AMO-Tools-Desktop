import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import { Directory } from '../../../shared/models/directory';
import { ModelService } from '../../../shared/model.service';

@Component({
  selector: 'app-create-folder',
  templateUrl: './create-folder.component.html',
  styleUrls: ['./create-folder.component.css']
})
export class CreateFolderComponent implements OnInit {
  @Input()
  directory: Directory;

  newFolder: any;
  constructor(private formBuilder: FormBuilder, private modelService: ModelService) { }

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
    let newDir = this.modelService.getNewDirectory(this.newFolder.value.newFolderName);
    newDir.collapsed = true;
    //TODO: Logic for creating new folder
    if (this.directory.subDirectory) {
      this.directory.subDirectory.push(newDir);
    } else {
      this.directory.subDirectory = new Array();
      this.directory.subDirectory.push(newDir);
    }
  }

}
