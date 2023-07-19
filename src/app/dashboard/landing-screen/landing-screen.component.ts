import { Component, OnInit } from '@angular/core';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentService } from '../assessment.service';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-landing-screen',
  templateUrl: './landing-screen.component.html',
  styleUrls: ['./landing-screen.component.css']
})
export class LandingScreenComponent implements OnInit {

  constructor(private dashboardService: DashboardService, private settingsDbService: SettingsDbService,
    private assessmentService: AssessmentService) { }

  ngOnInit() {
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
