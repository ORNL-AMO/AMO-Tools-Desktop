import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Router } from '@angular/router';
import { AssessmentService } from '../../assessment.service';
@Component({
  selector: 'app-assessment-list-item',
  templateUrl: './assessment-list-item.component.html',
  styleUrls: ['./assessment-list-item.component.css']
})
export class AssessmentListItemComponent implements OnInit {
  @Input()
  assessment: Assessment;
  constructor(private assessmentService: AssessmentService, private router: Router) { }

  ngOnInit() {
  }

  goToAssessment(assessment: Assessment){
    this.assessmentService.setWorkingAssessment(assessment);
    if(assessment.type == 'PSAT') {
      this.router.navigateByUrl('/psat');
    }else if(assessment.type == 'PHAST'){
      this.router.navigateByUrl('/phast');
    }
  }

}
