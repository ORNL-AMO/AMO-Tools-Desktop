import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Router } from '@angular/router';
import { AssessmentService } from '../../assessment.service';
@Component({
  selector: 'app-assessment-card',
  templateUrl: './assessment-card.component.html',
  styleUrls: ['./assessment-card.component.css']
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
      this.router.navigateByUrl('/psat/' + this.assessment.id);
    } else if (assessment.type == 'PHAST') {
      this.router.navigateByUrl('/phast/' + this.assessment.id);
    }
  }

  setDelete() {
    this.assessment.selected = this.isChecked;
  }
}
