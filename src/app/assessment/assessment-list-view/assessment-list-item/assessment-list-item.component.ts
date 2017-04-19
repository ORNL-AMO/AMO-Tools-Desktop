import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Router } from '@angular/router';
import { AssessmentService } from '../../assessment.service';
import { PsatService } from '../../../psat/psat.service';
@Component({
  selector: 'app-assessment-list-item',
  templateUrl: './assessment-list-item.component.html',
  styleUrls: ['./assessment-list-item.component.css']
})
export class AssessmentListItemComponent implements OnInit {
  @Input()
  assessment: Assessment;
  isSetup: boolean;
  constructor(private assessmentService: AssessmentService, private router: Router) { }

  ngOnInit() {
    if (this.assessment.phast) {
      this.isSetup = this.assessment.phast.setupDone;
    } else if (this.assessment.psat) {
      this.isSetup = this.assessment.psat.setupDone;
    }
  }

  goToAssessment(assessment: Assessment, str?: string) {
    this.assessmentService.tab = str;
    if (assessment.type == 'PSAT') {
      this.router.navigateByUrl('/psat/' + this.assessment.id);
    } else if (assessment.type == 'PHAST') {
      this.router.navigateByUrl('/phast/' + this.assessment.id);
    }
  }

}
