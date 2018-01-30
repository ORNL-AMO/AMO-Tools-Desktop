import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { AssessmentService } from '../../assessment.service';
@Component({
  selector: 'app-assessment-card',
  templateUrl: './assessment-card.component.html',
  styleUrls: ['./assessment-card.component.css', '../assessment-grid-view.component.css']
})

export class AssessmentCardComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  isChecked: boolean;

  isFirstChange: boolean = true;
  constructor(private assessmentService: AssessmentService) { }


  ngOnInit() {
    if (this.isChecked) {
      this.assessment.selected = this.isChecked;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isChecked && !this.isFirstChange) {
      this.assessment.selected = this.isChecked;
    }
    else {
      this.isFirstChange = false;
    }
  }

  goToAssessment(assessment: Assessment) {
    this.assessmentService.goToAssessment(assessment);
  }

  setDelete() {
    this.assessment.selected = this.isChecked;
  }
}
