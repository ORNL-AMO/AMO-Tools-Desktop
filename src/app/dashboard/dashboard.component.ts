import { Component, OnInit } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { MockAssessments } from '../shared/mocks/mock-assessment';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  allDirectories: Directory = MockAssessments;
  workingDirectory: Directory = MockAssessments;

  constructor() { }

  ngOnInit() {
  }

  changeWorkingDirectory($event){
    this.workingDirectory = $event;
  }
}
