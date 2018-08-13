import { Component, OnInit } from '@angular/core';
import { AssessmentService } from '../assessment/assessment.service';

@Component({
  selector: 'app-tutorials',
  templateUrl: './tutorials.component.html',
  styleUrls: ['./tutorials.component.css']
})
export class TutorialsComponent implements OnInit {

  constructor(private assessmentService: AssessmentService) { }

  ngOnInit() {
  }

  viewOpeningTutorial() {
    this.assessmentService.tutorialShown = false;
    this.assessmentService.openingTutorial.next('landing-screen');
  }


  viewPsatTutorial() {
    this.assessmentService.tutorialShown = false;
    this.assessmentService.openingTutorial.next('psat-tutorial');
  }
}
