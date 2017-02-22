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
    this.baseline.adjustments = new Array<PSAT>();
  }

  addAdjustment(){
    debugger
    if(this.baseline.adjustments.length < 4){
      let newAdjustment = this.assessmentService.getNewPsat();
      this.baseline.adjustments.push(newAdjustment);
    }
  }

}
