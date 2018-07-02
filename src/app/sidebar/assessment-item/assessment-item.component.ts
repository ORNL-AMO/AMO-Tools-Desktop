import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { Router } from '@angular/router';
import { AssessmentService } from '../../assessment/assessment.service';
@Component({
  selector: 'app-assessment-item',
  templateUrl: './assessment-item.component.html',
  styleUrls: ['./assessment-item.component.css']
})
export class AssessmentItemComponent implements OnInit {
  @Input()
  assessment: Assessment;
  constructor(private assessmentService: AssessmentService, private router: Router) { }

  ngOnInit() {
  }


  goToAssessment(assessment: Assessment) {
    this.assessmentService.tab = 'system-setup';
    if (assessment.type == 'PSAT') {
      if(assessment.psat.setupDone){
        this.assessmentService.tab = 'assessment';
      }
      this.router.navigateByUrl('/psat/' + assessment.id);
    } else if (assessment.type == 'PHAST') {
      if(this.assessment.phast.setupDone){
        this.assessmentService.tab = 'assessment';
      }
      this.router.navigateByUrl('/phast/' + assessment.id);
    }
  }
}
