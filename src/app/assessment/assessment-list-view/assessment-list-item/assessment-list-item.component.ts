import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
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
  @Input()
  isChecked: any;
  
  isSetup: boolean;
  isFirstChange: boolean = true;
  constructor(private assessmentService: AssessmentService, private router: Router) { }

  ngOnInit() {
    if (this.assessment.phast) {
      this.isSetup = this.assessment.phast.setupDone;
    } else if (this.assessment.psat) {
      this.isSetup = this.assessment.psat.setupDone;
    }
    if(this.isChecked){
      this.assessment.delete = this.isChecked;
    }
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.isChecked && !this.isFirstChange){
      this.assessment.delete = this.isChecked;
    }
    else{
      this.isFirstChange = false;
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

  setDelete(){
    this.assessment.delete = this.isChecked;
  }


}
