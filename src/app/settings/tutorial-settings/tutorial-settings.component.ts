import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-tutorial-settings',
  templateUrl: './tutorial-settings.component.html',
  styleUrls: ['./tutorial-settings.component.css']
})
export class TutorialSettingsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('saveTutorialChanges')
  saveTutorialChanges = new EventEmitter<boolean>();


  disableAllTutorials: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  toggleDisableAll() {
    this.disableAllTutorials = !this.disableAllTutorials;
    this.saveTutorialChanges.emit(true);
  }

  toggleLandingScreen() {
    this.settings.disableTutorial = !this.settings.disableTutorial;
    this.saveTutorialChanges.emit(true);
  }
  toggleDashboard() {
    this.settings.disableDashboardTutorial = !this.settings.disableDashboardTutorial;
    this.saveTutorialChanges.emit(true);
  }
  togglePumpSetup() {
    this.settings.disablePsatSetupTutorial = !this.settings.disablePsatSetupTutorial;
    this.saveTutorialChanges.emit(true);
  }
  togglePumpAssessment() {
    this.settings.disablePsatAssessmentTutorial = !this.settings.disablePsatAssessmentTutorial;
    this.saveTutorialChanges.emit(true);
  }
  togglePumpReport() {
    this.settings.disablePsatReportTutorial = !this.settings.disablePsatReportTutorial;
    this.saveTutorialChanges.emit(true);
  }
  togglePhastSetup() {
    this.settings.disablePhastSetupTutorial = !this.settings.disablePhastSetupTutorial;
    this.saveTutorialChanges.emit(true);
  }
  togglePhastAssessment() {
    this.settings.disablePhastAssessmentTutorial = !this.settings.disablePhastAssessmentTutorial;
    this.saveTutorialChanges.emit(true);
  }
  togglePhastReport() {
    this.settings.disablePhastReportTutorial = !this.settings.disablePhastReportTutorial;
    this.saveTutorialChanges.emit(true);
  }
  toggleFanSetup() {
    this.settings.disableFsatSetupTutorial = !this.settings.disableFsatSetupTutorial;
    this.saveTutorialChanges.emit(true);
  }
  toggleFanAssessment() {
    this.settings.disableFsatAssessmentTutorial = !this.settings.disableFsatAssessmentTutorial;
    this.saveTutorialChanges.emit(true);
  }
  toggleFanReport() {
    this.settings.disableFsatReportTutorial = !this.settings.disableFsatReportTutorial;
    this.saveTutorialChanges.emit(true);
  }


}
