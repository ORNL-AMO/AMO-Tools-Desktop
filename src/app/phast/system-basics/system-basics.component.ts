import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { FormBuilder } from '@angular/forms';
import { SettingsService } from '../../settings/settings.service';

import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-system-basics',
  templateUrl: 'system-basics.component.html',
  styleUrls: ['system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  phast: Assessment;
  @Input()
  settings: Settings;
  settingsForm: any;
  constructor(private formBuilder: FormBuilder, private settingsService: SettingsService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settingsForm = this.settingsService.getSettingsForm();
    }else{
      this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    }
  }
}
