import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SettingsService } from '../../settings/settings.service';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-system-basics',
  templateUrl: './system-basics.component.html',
  styleUrls: ['./system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();


  settingsForm: FormGroup; 
  constructor(private settingsService: SettingsService) { }


  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
  }


  save(){
    this.emitSave.emit(true);
  }
}
