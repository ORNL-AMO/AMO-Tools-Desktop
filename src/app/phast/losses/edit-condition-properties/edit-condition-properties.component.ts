import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Modification } from '../../../shared/models/phast/phast';
import { ModalDirective } from 'ngx-bootstrap';

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
  @Input()
  modifications: Modification[];
  name: string;
  deleteConfirm: boolean = false;
  constructor() { }

  ngOnInit() {

  }
}
