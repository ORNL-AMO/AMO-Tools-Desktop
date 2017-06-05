import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { FormBuilder } from '@angular/forms';
import { SettingsService } from '../../settings/settings.service';

@Component({
  selector: 'app-system-basics',
  templateUrl: 'system-basics.component.html',
  styleUrls: ['system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  phast: Assessment;

  sourcesForm: any;
  settingsForm: any;

  constructor(private formBuilder: FormBuilder, private settingsService: SettingsService) { }

  ngOnInit() {
    this.sourcesForm = this.initForm();
    //this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
  }

  initForm() {
    return this.formBuilder.group({
      'heatSource': [''],
      'energySource': ['']
    })
  }
}
