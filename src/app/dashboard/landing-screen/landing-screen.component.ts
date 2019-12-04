import { Component, OnInit } from '@angular/core';
import { AssessmentService } from '../../assessment/assessment.service';

@Component({
  selector: 'app-landing-screen',
  templateUrl: './landing-screen.component.html',
  styleUrls: ['./landing-screen.component.css']
})
export class LandingScreenComponent implements OnInit {

  showCreateAssessment: boolean = false;
  createAssessmentType: string;
  constructor(private assessmentService: AssessmentService) { }

  ngOnInit() {
  }

  hideScreen() {
    this.assessmentService.dashboardView.next('assessment-dashboard');
  }

  createAssessment(str?: string) {
    if (str) {
      this.createAssessmentType = str;
    }
    this.showCreateAssessment = true;
  }

  hideCreateAssessment() {
    this.showCreateAssessment = false;
  }
}
