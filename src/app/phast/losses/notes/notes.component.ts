import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Notes } from '../../../shared/models/phast/phast';
import { LossTab } from '../../tabs';

@Component({
    selector: 'app-notes',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.css'],
    standalone: false
})
export class NotesComponent implements OnInit {
  @Input()
  notes: Notes;
  @Input()
  currentTab: LossTab;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit() {
  }


  save() {
    this.emitSave.emit(true);
  }
}
