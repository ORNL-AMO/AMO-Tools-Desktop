import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from "@angular/forms";

@Component({
  selector: 'app-steam-settings',
  templateUrl: './steam-settings.component.html',
  styleUrls: ['./steam-settings.component.css']
})
export class SteamSettingsComponent implements OnInit {
  @Input()
  settingsForm: FormGroup;

  @Output('startSavePolling')
  startSavePolling = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
    // this.startSavePolling.emit(false);
  }

  save() {
    this.startSavePolling.emit(true);
  }

}
