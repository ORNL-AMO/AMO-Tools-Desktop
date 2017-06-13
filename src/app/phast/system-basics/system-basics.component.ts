import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { SettingsService } from '../../settings/settings.service';

import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ModalDirective } from 'ng2-bootstrap';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-system-basics',
  templateUrl: 'system-basics.component.html',
  styleUrls: ['system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  saveClicked: boolean;
  @Input()
  isAssessmentSettings: boolean;
  @Output('updateSettings')
  updateSettings = new EventEmitter<boolean>();
  @Input()
  assessment: Assessment;

  settingsForm: any;
  unitChange: boolean = false;

  isFirstChange: boolean = true;
  counter: any;
  newSettings: Settings;
  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.saveClicked && !this.isFirstChange) {
      this.saveChanges();
    } else {
      this.isFirstChange = false;
    }
  }

  saveChanges() {
    this.newSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    //TODO: Check data when we have dependent units
    // if (
    //   this.settings.currency != this.newSettings.currency ||
    //   this.settings.distanceMeasurement != this.newSettings.distanceMeasurement ||
    //   this.settings.flowMeasurement != this.newSettings.flowMeasurement ||
    //   this.settings.language != this.newSettings.language ||
    //   this.settings.powerMeasurement != this.newSettings.powerMeasurement ||
    //   this.settings.pressureMeasurement != this.newSettings.pressureMeasurement ||
    //   this.settings.unitsOfMeasure != this.newSettings.unitsOfMeasure
    // ) {
    //   if (this.psat.inputs.flow_rate || this.psat.inputs.head || this.psat.inputs.motor_rated_power) {
    //     this.showSettingsModal();
    //   } else {
    //     this.updateData(false);
    //   }
    // }
    this.updateData();
  }

  updateData() {
    this.newSettings.assessmentId = this.assessment.id;
    //assessment has existing settings
    if (this.isAssessmentSettings) {
      this.newSettings.id = this.settings.id;
      this.indexedDbService.putSettings(this.newSettings).then(
        results => {
          //get updated settings
          this.updateSettings.emit(true);
        }
      )
    }
    //create settings for assessment
    else {
      this.newSettings.createdDate = new Date();
      this.newSettings.modifiedDate = new Date();
      this.indexedDbService.addSettings(this.newSettings).then(
        results => {
          this.isAssessmentSettings = true;
          //get updated settings
          this.updateSettings.emit(true);
        }
      )
    }
  }

  startSavePolling() {
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.saveChanges()
    }, 3500)
  }
}
