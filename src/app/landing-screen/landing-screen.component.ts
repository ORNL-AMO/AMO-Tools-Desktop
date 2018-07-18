import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { CalculatorService } from '../calculator/calculator.service';

@Component({
  selector: 'app-landing-screen',
  templateUrl: './landing-screen.component.html',
  styleUrls: ['./landing-screen.component.css']
})
export class LandingScreenComponent implements OnInit {
  @Output('hideLandingScreen')
  hideLandingScreen = new EventEmitter<boolean>();
  @Output('selectCalculator')
  selectCalculator = new EventEmitter<string>();
  @Input()
  directory: Directory;

  displayVideo: boolean = false;
  showCreateAssessment: boolean = false;
  createAssessmentType: string;
  constructor(private calculatorService: CalculatorService) { }

  ngOnInit() {
  }

  showVideo() {
    this.displayVideo = true;
  }

  hideScreen() {
    this.hideLandingScreen.emit(true);
  }

  chooseCalculator(str: string) {
    this.selectCalculator.emit(str);
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
