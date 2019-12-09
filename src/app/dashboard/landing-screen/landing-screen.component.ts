import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-landing-screen',
  templateUrl: './landing-screen.component.html',
  styleUrls: ['./landing-screen.component.css']
})
export class LandingScreenComponent implements OnInit {

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
  }

  createAssessment(str?: string) {
    if (str) {
      this.dashboardService.newAssessmentType = str;
    }
    this.dashboardService.createAssessment.next(true);
  }
}
