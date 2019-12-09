import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing-screen',
  templateUrl: './landing-screen.component.html',
  styleUrls: ['./landing-screen.component.css']
})
export class LandingScreenComponent implements OnInit {

  showCreateAssessment: boolean = false;
  createAssessmentType: string;
  constructor() { }

  ngOnInit() {
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
