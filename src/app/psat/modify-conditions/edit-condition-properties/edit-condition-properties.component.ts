import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Modification } from '../../../shared/models/psat';
import { ModalDirective } from 'ng2-bootstrap';

@Component({
  selector: 'app-edit-condition-properties',
  templateUrl: './edit-condition-properties.component.html',
  styleUrls: ['./edit-condition-properties.component.css']
})
export class EditConditionPropertiesComponent implements OnInit {
  @Input()
  modification: Modification;
  @Output('deleteMod')
  deleteMod = new EventEmitter<boolean>();
  @Output('saveMod')
  saveMod = new EventEmitter<boolean>();
  @Output('cancelEdit')
  cancelEdit = new EventEmitter<boolean>();

  name: string;
  deleteConfirm: boolean = false;
  constructor() { }

  ngOnInit() {
    this.name = this.modification.psat.name;
  }

  saveModification() {
    this.modification.psat.name = this.name;
    this.saveMod.emit(true);
  }

  deleteModification() {
    this.deleteMod.emit(true);
  }

  showDeleteConfirm() {
    this.deleteConfirm = true;
  }

  cancelDelete(){
    this.deleteConfirm = false;
  }

  cancel() {
    this.cancelEdit.emit(true);
  }

}
