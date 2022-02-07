import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
    this.disableAllTutorials = (this.settings.disableTutorial &&
      this.settings.disableDashboardTutorial &&
      // this.settings.disablePsatSetupTutorial &&
      // this.settings.disablePsatAssessmentTutorial &&
      // this.settings.disablePsatReportTutorial &&
      this.settings.disablePsatTutorial &&
      this.settings.disablePhastSetupTutorial &&
      this.settings.disablePhastAssessmentTutorial &&
      this.settings.disablePhastReportTutorial &&
      this.settings.disableFsatSetupTutorial &&
      this.settings.disableFsatAssessmentTutorial &&
      this.settings.disableFsatReportTutorial &&
      this.settings.disableSsmtAssessmentTutorial &&
      this.settings.disableSsmtDiagramTutorial &&
      this.settings.disableSsmtSystemSetupTutorial &&
      this.settings.disableSsmtReportTutorial &&
      this.settings.disableTreasureHuntFindTreasureTutorial &&
      this.settings.disableTreasureHuntReportTutorial &&
      this.settings.disableTreasureHuntSetupTutorial &&
      this.settings.disableTreasureHuntTreasureChestTutorial
    );
  }

  toggleDisableAll() {
    this.disableAllTutorials = !this.disableAllTutorials;
    this.settings.disableTutorial = this.disableAllTutorials;
    this.settings.disableDashboardTutorial = this.disableAllTutorials;
    this.settings.disablePsatTutorial = !this.disableAllTutorials;
    // this.settings.disablePsatSetupTutorial = this.disableAllTutorials;
    // this.settings.disablePsatAssessmentTutorial = this.disableAllTutorials;
    // this.settings.disablePsatReportTutorial = this.disableAllTutorials;
    this.settings.disablePhastSetupTutorial = this.disableAllTutorials;
    this.settings.disablePhastAssessmentTutorial = this.disableAllTutorials;
    this.settings.disablePhastReportTutorial = this.disableAllTutorials;
    this.settings.disableFsatSetupTutorial = this.disableAllTutorials;
    this.settings.disableFsatAssessmentTutorial = this.disableAllTutorials;
    this.settings.disableFsatReportTutorial = this.disableAllTutorials;

    this.settings.disableSsmtAssessmentTutorial = this.disableAllTutorials;
    this.settings.disableSsmtDiagramTutorial = this.disableAllTutorials;
    this.settings.disableSsmtSystemSetupTutorial = this.disableAllTutorials;
    this.settings.disableSsmtReportTutorial = this.disableAllTutorials;

    this.settings.disableTreasureHuntFindTreasureTutorial = this.disableAllTutorials;
    this.settings.disableTreasureHuntReportTutorial = this.disableAllTutorials;
    this.settings.disableTreasureHuntSetupTutorial = this.disableAllTutorials;
    this.settings.disableTreasureHuntTreasureChestTutorial = this.disableAllTutorials;
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
  // togglePumpSetup() {
  //   this.settings.disablePsatSetupTutorial = !this.settings.disablePsatSetupTutorial;
  //   this.checkDisableAll();
  //   this.saveTutorialChanges.emit(true);
  // }
  // togglePumpAssessment() {
  //   this.settings.disablePsatAssessmentTutorial = !this.settings.disablePsatAssessmentTutorial;
  //   this.checkDisableAll();
  //   this.saveTutorialChanges.emit(true);
  // }
  // togglePumpReport() {
  //   this.settings.disablePsatReportTutorial = !this.settings.disablePsatReportTutorial;
  //   this.checkDisableAll();
  //   this.saveTutorialChanges.emit(true);
  // }
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

  toggleSsmtSystemSetup() {
    this.settings.disableSsmtSystemSetupTutorial = !this.settings.disableSsmtSystemSetupTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  toggleSsmtAssessment() {
    this.settings.disableSsmtAssessmentTutorial = !this.settings.disableSsmtAssessmentTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  toggleSsmtReport() {
    this.settings.disableSsmtReportTutorial = !this.settings.disableSsmtReportTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  toggleSsmtDiagram() {
    this.settings.disableSsmtDiagramTutorial = !this.settings.disableSsmtDiagramTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }

  toggleTreasureHuntFindTreasure() {
    this.settings.disableTreasureHuntFindTreasureTutorial = !this.settings.disableTreasureHuntFindTreasureTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  toggleTreasureHuntReport() {
    this.settings.disableTreasureHuntReportTutorial = !this.settings.disableTreasureHuntReportTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  toggleTreasureHuntSetup() {
    this.settings.disableTreasureHuntSetupTutorial = !this.settings.disableTreasureHuntSetupTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  toggleTreasureHuntTreasureChest() {
    this.settings.disableTreasureHuntTreasureChestTutorial = !this.settings.disableTreasureHuntTreasureChestTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }


}
