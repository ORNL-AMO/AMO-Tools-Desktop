import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { AssessmentService } from '../../assessment.service';
@Component({
    selector: 'app-assessment-item',
    templateUrl: './assessment-item.component.html',
    styleUrls: ['./assessment-item.component.css'],
    standalone: false
})
export class AssessmentItemComponent implements OnInit {
  @Input()
  assessment: Assessment;
  constructor(private assessmentService: AssessmentService) { }

  ngOnInit() {
  }


  goToAssessment(assessment: Assessment) {
    this.assessmentService.goToAssessment(assessment);
  }
}
