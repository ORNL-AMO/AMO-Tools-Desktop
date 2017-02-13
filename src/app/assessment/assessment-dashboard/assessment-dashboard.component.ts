import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-assessment-dashboard',
  templateUrl: './assessment-dashboard.component.html',
  styleUrls: ['./assessment-dashboard.component.css']
})
export class AssessmentDashboardComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  createAssessment(str: any){
    debugger
    this.router.navigateByUrl(str);
  }
}
