import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { PSAT } from '../../shared/models/psat';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ModalDirective } from 'ng2-bootstrap';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
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
  @Output('updateSettings')
  updateSettings = new EventEmitter<boolean>();
  @Input()
  psat: PSAT;

  unitChange: boolean = false;

  settingsForm: any;
  isFirstChange: boolean = true;

  newSettings: Settings;

  @ViewChild('settingsModal') public settingsModal: ModalDirective;

  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

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


  setUnits() {
    this.unitChange = !this.unitChange;
  }

  saveChanges() {
    this.newSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (
      this.settings.currency != this.newSettings.currency ||
      this.settings.distanceMeasurement != this.newSettings.distanceMeasurement ||
      this.settings.flowMeasurement != this.newSettings.flowMeasurement ||
      this.settings.language != this.newSettings.language ||
      this.settings.powerMeasurement != this.newSettings.powerMeasurement ||
      this.settings.pressureMeasurement != this.newSettings.pressureMeasurement ||
      this.settings.unitsOfMeasure != this.newSettings.unitsOfMeasure
    ) {
      if (this.psat.inputs.flow_rate || this.psat.inputs.head) {
        this.showSettingsModal();
      }else{
        this.updateData(false);
      }
    }
  }

  updateData(bool: boolean) {
    //convert if true
    if (bool == true) {
      if (this.psat.inputs.flow_rate) {
        this.psat.inputs.flow_rate = this.convertUnitsService.value(this.psat.inputs.flow_rate).from(this.settings.flowMeasurement).to(this.newSettings.flowMeasurement);
      }
      if (this.psat.inputs.head) {
        this.psat.inputs.head = this.convertUnitsService.value(this.psat.inputs.head).from(this.settings.distanceMeasurement).to(this.newSettings.distanceMeasurement);
      }
    }
    this.newSettings.assessmentId = this.assessment.id;
    //assessment has existing settings
    if (this.isAssessmentSettings) {
      this.newSettings.id = this.settings.id;
      this.indexedDbService.putSettings(this.newSettings).then(
        results => {
          //get updated settings
          this.updateSettings.emit(bool);
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
          this.updateSettings.emit(bool);
        }
      )
    }
    this.hideSettingsModal();
  }

  showSettingsModal() {
    this.settingsModal.show();
  }

  hideSettingsModal() {
    this.settingsModal.hide();
  }

  getSettingsForm() {
    this.indexedDbService.getAssessmentSettings(this.assessment.id).then(
      results => {
        if (results.length != 0) {
          this.settings = results[0];
          this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
        }
      }
    )
  }
}
