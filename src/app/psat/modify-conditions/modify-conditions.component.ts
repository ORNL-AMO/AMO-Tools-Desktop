import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { AssessmentService } from '../../assessment/assessment.service';

@Component({
  selector: 'app-modify-conditions',
  templateUrl: './modify-conditions.component.html',
  styleUrls: ['./modify-conditions.component.css']
})
export class ModifyConditionsComponent implements OnInit {
  @Input()
  baseline: PSAT;
  adjustments: PSAT[];

  constructor(private assessmentService: AssessmentService) { }

  ngOnInit() {
    if(!this.baseline.adjustments){
      this.baseline.adjustments = new Array();
    }
  }

  addAdjustment(){
    if(this.baseline.adjustments.length < 4){
      let newAdjustment = this.assessmentService.getWorkingAssessment();
      this.baseline.adjustments.push({psat:newAdjustment.psat, name: 'Adjustment '+(this.baseline.adjustments.length+1)});
    }
  }

}
