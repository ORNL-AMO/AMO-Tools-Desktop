import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { FormGroup } from '@angular/forms';
import { SettingsService } from '../../settings/settings.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';

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
  @Output('updateSettings')
  updateSettings = new EventEmitter<boolean>();

  settingsForm: FormGroup;

  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
  }

  save(){
    let id: number = this.settings.id;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.settings.id = id;
    this.settings.assessmentId = this.assessment.id;
    this.indexedDbService.putSettings(this.settings).then(
      results => {
        this.settingsDbService.setAll().then(() => {
          //get updated settings
          this.updateSettings.emit(true);
        })
      }
    )
  }
}
