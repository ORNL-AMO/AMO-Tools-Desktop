import { Component, OnInit } from '@angular/core';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentService } from '../assessment.service';
import { DashboardService } from '../dashboard.service';
import { Settings } from '../../shared/models/settings';
import { AssessmentSettingsComponent } from '../../settings/assessment-settings/assessment-settings.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-landing-screen',
  templateUrl: './landing-screen.component.html',
  styleUrls: ['./landing-screen.component.css']
})
export class LandingScreenComponent implements OnInit {

  constructor(private dashboardService: DashboardService, private settingsDbService: SettingsDbService,
    private assessmentService: AssessmentService) { }

  ngOnInit() {
    if (!environment.production)
    {
      let settings : Settings = this.settingsDbService.globalSettings;
      if (!settings.disableTutorial)
      {
        settings.disableTutorial = true;
        settings.disableDashboardTutorial = true;
        settings.disablePsatTutorial = true;
        settings.disableFansTutorial = true;
        settings.disablePhastTutorial = true;
        settings.disableWasteWaterTutorial = true;
        settings.disableSteamTutorial = true;
        settings.disableMotorInventoryTutorial = true;
        settings.disableTreasureHuntTutorial = false;
        settings.disableDataExplorerTutorial = true;
        settings.disableCompressedAirTutorial = true;
        this.settingsDbService.globalSettings = settings;
        console.log('Running in development mode - turned off tutorials');
      }
    }
    if(!this.settingsDbService.globalSettings.disableTutorial){
      this.assessmentService.showTutorial.next('landing-screen');
    }


  }

  createAssessment(str?: string) {
    if (str) {
      this.dashboardService.newAssessmentType = str;
    }
    this.dashboardService.createAssessment.next(true);
  }

  showCreateInventory(inventoryType: string) {
    this.dashboardService.showCreateInventory.next(inventoryType);
  }
}
