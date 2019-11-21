import { Component, OnInit, Input } from '@angular/core';
import { AssessmentService } from '../assessment/assessment.service';

@Component({
  selector: 'app-landing-screen',
  templateUrl: './landing-screen.component.html',
  styleUrls: ['./landing-screen.component.css']
})
export class LandingScreenComponent implements OnInit {

  displayVideo: boolean = false;
  showCreateAssessment: boolean = false;
  createAssessmentType: string;
  constructor(private assessmentService: AssessmentService) { }

  ngOnInit() {
  }

  showVideo() {
    this.displayVideo = true;
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
