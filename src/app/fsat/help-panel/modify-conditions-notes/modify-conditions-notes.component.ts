import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Notes } from '../../../shared/models/fans';

@Component({
    selector: 'app-modify-conditions-notes',
    templateUrl: './modify-conditions-notes.component.html',
    styleUrls: ['./modify-conditions-notes.component.css'],
    standalone: false
})
export class ModifyConditionsNotesComponent implements OnInit {
  @Input()
  notes: Notes;
  @Input()
  currentTab: string;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  
  constructor() { }

  ngOnInit() {
  }

  save() {
    this.emitSave.emit(true);
  }

}
