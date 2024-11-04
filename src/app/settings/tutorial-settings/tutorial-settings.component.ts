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
    debugger;
    this.disableAllTutorials = (this.settings.disableTutorial &&
      this.settings.disableDashboardTutorial &&
      this.settings.disablePsatTutorial &&
      this.settings.disableFansTutorial &&
      this.settings.disablePhastTutorial &&
      this.settings.disableWasteWaterTutorial &&
      this.settings.disableSteamTutorial &&
      this.settings.disableMotorInventoryTutorial &&
      this.settings.disableTreasureHuntTutorial && 
      this.settings.disableDataExplorerTutorial && 
      this.settings.disableCompressedAirTutorial
    );
  }

  toggleDisableAll() {
    this.disableAllTutorials = !this.disableAllTutorials;
    this.settings.disableTutorial = this.disableAllTutorials;
    this.settings.disableDashboardTutorial = this.disableAllTutorials;
    this.settings.disablePsatTutorial = this.disableAllTutorials;
    this.settings.disableFansTutorial = this.disableAllTutorials;
    this.settings.disablePhastTutorial = this.disableAllTutorials;
    this.settings.disableWasteWaterTutorial = this.disableAllTutorials;
    this.settings.disableSteamTutorial = this.disableAllTutorials;
    this.settings.disableMotorInventoryTutorial = this.disableAllTutorials;
    this.settings.disableTreasureHuntTutorial = this.disableAllTutorials;
    this.settings.disableDataExplorerTutorial = this.disableAllTutorials;
    this.settings.disableCompressedAirTutorial = this.disableAllTutorials;
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

  togglePumps() {
    this.settings.disablePsatTutorial = !this.settings.disablePsatTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }

  toggleFans() {
    this.settings.disableFansTutorial = !this.settings.disableFansTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }

  togglePHAST() {
    this.settings.disablePhastTutorial = !this.settings.disablePhastTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  
  toggleWasteWater() {
    this.settings.disableWasteWaterTutorial = !this.settings.disableWasteWaterTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }

  toggleSteam() {
    this.settings.disableSteamTutorial = !this.settings.disableSteamTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }

  toggleMotorInventory() {
    this.settings.disableMotorInventoryTutorial = !this.settings.disableMotorInventoryTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }
  
  toggleTreasureHunt() {
    this.settings.disableTreasureHuntTutorial = !this.settings.disableTreasureHuntTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }

  toggleDataExplorer() {
    this.settings.disableDataExplorerTutorial = !this.settings.disableDataExplorerTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }

  toggleCompressedAir(){
    this.settings.disableCompressedAirTutorial = !this.settings.disableCompressedAirTutorial;
    this.checkDisableAll();
    this.saveTutorialChanges.emit(true);
  }


}
