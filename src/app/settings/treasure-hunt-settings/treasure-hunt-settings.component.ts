import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-treasure-hunt-settings',
  templateUrl: './treasure-hunt-settings.component.html',
  styleUrls: ['./treasure-hunt-settings.component.css']
})
export class TreasureHuntSettingsComponent implements OnInit {
  @Input()
  settingsForm: UntypedFormGroup;

  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();

  
  constructor() { }

  ngOnInit() {
  }


  save(){
    this.emitSave.emit(true);
  }
}
