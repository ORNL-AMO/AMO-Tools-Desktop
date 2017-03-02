import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-assessment-report',
  templateUrl: './assessment-report.component.html',
  styleUrls: ['./assessment-report.component.css']
})
export class AssessmentReportComponent implements OnInit {

  constructor(private location: Location) { }

  ngOnInit() {
  }

  closeAssessment(){
    this.location.back();
  }

}
