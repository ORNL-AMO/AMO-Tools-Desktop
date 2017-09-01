import { Component, OnInit, Input } from '@angular/core';
import { Notes } from '../../../shared/models/phast/phast';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
  @Input()
  notes: Notes;
  @Input()
  currentTab: string;
  constructor() { }

  ngOnInit() {
  }

}
