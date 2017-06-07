import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-phast-settings',
  templateUrl: './phast-settings.component.html',
  styleUrls: ['./phast-settings.component.css']
})
export class PhastSettingsComponent implements OnInit {
  @Input()
  settingsForm: any;
  @Output('startSavePolling')
  startSavePolling = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit() {
  }

  startPolling() {
    this.startSavePolling.emit(true);
  }

}
