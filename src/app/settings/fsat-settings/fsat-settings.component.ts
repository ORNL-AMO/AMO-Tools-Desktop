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

  fanCurveTypes: Array<string> = [
    'Fan Total Pressure',
    'Fan Static Pressure',
    'Static Pressure Rise'
  ]

  conditions: Array<string> = [
    'Base Case Fan',
    'Optimized Fan',
    'User Defined'
  ]
  constructor() { }

  ngOnInit() {
  }

  emitSave() {
    this.save.emit(true);
  }

}
