import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-fsat-settings',
  templateUrl: './fsat-settings.component.html',
  styleUrls: ['./fsat-settings.component.css']
})
export class FsatSettingsComponent implements OnInit {
  @Input()
  settingsForm: FormGroup;
  @Output('save')
  save = new EventEmitter<boolean>();

  fanTypes: Array<string> = [
    'Type 1',
    'Type 2',
    'Type 3'
  ]

  conditions: Array<string> = [
    'User Defined',
    'Condition 2',
    'Condition 3'
  ]
  constructor() { }

  ngOnInit() {
  }

  emitSave() {
    this.save.emit(true);
  }

}
