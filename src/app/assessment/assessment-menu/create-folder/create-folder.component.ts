import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import { Directory } from '../../../shared/models/directory';
@Component({
  selector: 'app-create-folder',
  templateUrl: './create-folder.component.html',
  styleUrls: ['./create-folder.component.css']
})
export class CreateFolderComponent implements OnInit {
  @Input()
  directory: Directory;

  newFolder: any;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.newFolder = this.initForm();
  }

  initForm(){
    return this.formBuilder.group({
      'newFolderName': ['', Validators.required]
    });
  }

  //  CREATE FOLDER MODAL
  @ViewChild('createModal') public createModal: ModalDirective;
  showCreateModal(){
    this.createModal.show();
  }

  hideCreateModal(){
    this.createModal.hide();
  }

  createFolder(){
    this.hideCreateModal();

    //TODO: Logic for creating new folder
  }

}
