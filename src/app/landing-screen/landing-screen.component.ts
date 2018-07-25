import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { CalculatorService } from '../calculator/calculator.service';
import { AssessmentService } from '../assessment/assessment.service';

@Component({
  selector: 'app-landing-screen',
  templateUrl: './landing-screen.component.html',
  styleUrls: ['./landing-screen.component.css']
})
export class LandingScreenComponent implements OnInit {
  @Input()
  directory: Directory;

  displayVideo: boolean = false;
  showCreateAssessment: boolean = false;
  createAssessmentType: string;
  constructor(private calculatorService: CalculatorService, private assessmentService: AssessmentService) { }

  ngOnInit() {
  }

  showVideo() {
    this.displayVideo = true;
  }

  hideScreen() {
    this.assessmentService.dashboardView.next('assessment-dashboard');
  }

  chooseCalculator(str: string) {
    this.assessmentService.dashboardView.next('calculator');
    this.calculatorService.selectedToolType.next(str);
  }

  createAssessment(str?: string){
    if(str){
      this.createAssessmentType = str;
    }
    this.showCreateAssessment = true;
  }

  hideCreateAssessment(){
    this.showCreateAssessment = false;
  }
}
