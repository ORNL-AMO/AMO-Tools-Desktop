import { Component, OnInit, Input } from '@angular/core';
import { Notes } from '../../../shared/models/psat';
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

  constructor() { }

  ngOnInit() {
  }

}
