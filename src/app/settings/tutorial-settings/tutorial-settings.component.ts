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
    this.checkDisableAll();
  }

  checkDisableAll() {
    this.disableAllTutorials = (this.settings.disableTutorial && this.settings.disableDashboardTutorial && this.settings.disablePsatSetupTutorial && this.settings.disablePsatAssessmentTutorial && this.settings.disablePsatReportTutorial && this.settings.disablePhastSetupTutorial && this.settings.disablePhastAssessmentTutorial && this.settings.disablePhastReportTutorial && this.settings.disableFsatSetupTutorial && this.settings.disableFsatAssessmentTutorial && this.settings.disableFsatReportTutorial);
    console.log(this.disableAllTutorials);
  }

  toggleDisableAll() {
    this.disableAllTutorials = !this.disableAllTutorials;
    this.settings.disableTutorial = this.disableAllTutorials;
    this.settings.disableDashboardTutorial = this.disableAllTutorials;
    this.settings.disablePsatSetupTutorial = this.disableAllTutorials;
    this.settings.disablePsatAssessmentTutorial = this.disableAllTutorials;
    this.settings.disablePsatReportTutorial = this.disableAllTutorials;
    this.settings.disablePhastSetupTutorial = this.disableAllTutorials;
    this.settings.disablePhastAssessmentTutorial = this.disableAllTutorials;
    this.settings.disablePhastReportTutorial = this.disableAllTutorials;
    this.settings.disableFsatSetupTutorial = this.disableAllTutorials;
    this.settings.disableFsatAssessmentTutorial = this.disableAllTutorials;
    this.settings.disableFsatReportTutorial = this.disableAllTutorials;
    this.saveTutorialChanges.emit(true);
  }

  toggleLandingScreen() {
    this.settings.disableTutorial = !this.settings.disableTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  toggleDashboard() {
    this.settings.disableDashboardTutorial = !this.settings.disableDashboardTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  togglePumpSetup() {
    this.settings.disablePsatSetupTutorial = !this.settings.disablePsatSetupTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  togglePumpAssessment() {
    this.settings.disablePsatAssessmentTutorial = !this.settings.disablePsatAssessmentTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  togglePumpReport() {
    this.settings.disablePsatReportTutorial = !this.settings.disablePsatReportTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  togglePhastSetup() {
    this.settings.disablePhastSetupTutorial = !this.settings.disablePhastSetupTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  togglePhastAssessment() {
    this.settings.disablePhastAssessmentTutorial = !this.settings.disablePhastAssessmentTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  togglePhastReport() {
    this.settings.disablePhastReportTutorial = !this.settings.disablePhastReportTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  toggleFanSetup() {
    this.settings.disableFsatSetupTutorial = !this.settings.disableFsatSetupTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  toggleFanAssessment() {
    this.settings.disableFsatAssessmentTutorial = !this.settings.disableFsatAssessmentTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  toggleFanReport() {
    this.settings.disableFsatReportTutorial = !this.settings.disableFsatReportTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }


}
