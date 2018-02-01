import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Router } from '@angular/router';
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
  constructor(private assessmentService: AssessmentService, private router: Router) { }


  ngOnInit() {
     if(this.isChecked){
      this.assessment.selected = this.isChecked;
    }
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.isChecked && !this.isFirstChange){
      this.assessment.selected = this.isChecked;
    }
    else{
      this.isFirstChange = false;
    }
  }

  goToAssessment(assessment: Assessment) {
    this.assessmentService.tab = 'system-setup';
    if (assessment.type == 'PSAT') {
      if(assessment.psat.setupDone){
        this.assessmentService.tab = 'assessment';
      }
      this.router.navigateByUrl('/psat/' + assessment.id);
    } else if (assessment.type == 'PHAST') {
      if(assessment.phast.setupDone){
        this.assessmentService.tab = 'assessment';
      }
      this.router.navigateByUrl('/phast/' + assessment.id);
    }
  }

  setDelete() {
    this.assessment.selected = this.isChecked;
  }
}
