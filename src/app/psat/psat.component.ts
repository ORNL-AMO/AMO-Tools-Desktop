import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../assessment/assessment.service';

@Component({
  selector: 'app-psat',
  templateUrl: './psat.component.html',
  styleUrls: ['./psat.component.css']
})
export class PsatComponent implements OnInit {
  assessment: Assessment;

  panelView: string = 'help-panel';
  isPanelOpen: boolean = true;
  currentTab: number = 1;

  constructor(private location: Location, private assessmentService: AssessmentService) { }

  ngOnInit() {
    this.assessment = this.assessmentService.getWorkingAssessment();
  }

  changeTab($event){
    this.currentTab = $event;
  }

  toggleOpenPanel($event){
    if(!this.isPanelOpen) {
      this.panelView = $event;
      this.isPanelOpen = true;
    }else if(this.isPanelOpen && $event != this.panelView){
      this.panelView = $event;
    }else{
      this.isPanelOpen = false;
    }
  }

  continue(){
    this.save();
    this.currentTab++;
  }

  close(){
    this.location.back();
  }

  goBack(){
    this.currentTab--;
  }

  save(){
    //TODO: Logic for saving assessment
  }

  exportData(){
    //TODO: Logic for saving assessment
  }
}
