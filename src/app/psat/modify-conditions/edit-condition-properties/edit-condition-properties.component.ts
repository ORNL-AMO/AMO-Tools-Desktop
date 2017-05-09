import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Modification } from '../../../shared/models/psat';

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

  name: string;
  constructor() { }

  ngOnInit() {
    this.name = this.modification.psat.name;
    console.log(this.name);
  }

  saveModification(){
    this.modification.psat.name = this.name;
    this.saveMod.emit(true);
  }

  deleteModification(){
    this.deleteMod.emit(true);
  }

}
