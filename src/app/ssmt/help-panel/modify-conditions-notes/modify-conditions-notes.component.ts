import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Notes } from '../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-modify-conditions-notes',
  templateUrl: './modify-conditions-notes.component.html',
  styleUrls: ['./modify-conditions-notes.component.css']
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
    if (!this.notes) {
      this.notes = {
        operationsNotes: '',
        boilerNotes: '',
        headerNotes: '',
        turbineNotes: ''
      }
    }

  }

  save() {
    this.emitSave.emit(true);
  }

}
