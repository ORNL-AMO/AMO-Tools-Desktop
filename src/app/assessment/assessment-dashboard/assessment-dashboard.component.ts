import { Component, OnInit, Input } from '@angular/core';
import { MockAssessments } from '../../shared/mocks/mock-assessment';
import { Directory } from '../../shared/models/directory';

@Component({
  selector: 'app-assessment-dashboard',
  templateUrl: './assessment-dashboard.component.html',
  styleUrls: ['./assessment-dashboard.component.css']
})
export class AssessmentDashboardComponent implements OnInit {
  @Input()
  directory: Directory;

  view: string = 'grid';

  constructor() { }

  ngOnInit() {
  }

  changeView($event){
    this.view = $event;
  }

}
