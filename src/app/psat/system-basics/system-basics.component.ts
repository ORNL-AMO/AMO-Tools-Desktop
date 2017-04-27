import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
@Component({
  selector: 'app-system-basics',
  templateUrl: './system-basics.component.html',
  styleUrls: ['./system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  saveClicked: boolean;
  @Input()
  settings: Settings;
  @Input()
  isAssessmentSettings: boolean;

  settingsForm: any;
  isFirstChange: boolean = true;
  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.saveClicked && !this.isFirstChange) {
      this.saveChanges();
    } else {
      this.isFirstChange = false;
    }
  }

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
  }

  saveChanges() {
    let tmpSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    tmpSettings.assessmentId = this.assessment.id;
    tmpSettings.id = this.settings.id;
    if (this.isAssessmentSettings) {
      this.indexedDbService.putSettings(tmpSettings).then(
        results => {
          //get updated settings
          this.getSettingsForm();
        }
      )
    } else {
      this.indexedDbService.addSettings(tmpSettings).then(
        results => {
          this.isAssessmentSettings = true;
          //get updated settings
          this.getSettingsForm();
        }
      )
    }
  }

  getSettingsForm() {
    this.indexedDbService.getAssessmentSettings(this.assessment.id).then(
      results => {
        if (results.length != 0) {
          this.settings = results;
          this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
        }
      }
    )
  }
}
