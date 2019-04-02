import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-treasure-hunt-settings',
  templateUrl: './treasure-hunt-settings.component.html',
  styleUrls: ['./treasure-hunt-settings.component.css']
})
export class TreasureHuntSettingsComponent implements OnInit {
  @Input()
  settingsForm: FormGroup;

  @Output('startSavePolling')
  startSavePolling = new EventEmitter<boolean>();

  
  constructor() { }

  ngOnInit() {
  }

}
