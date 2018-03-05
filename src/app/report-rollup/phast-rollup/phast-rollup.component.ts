import { Component, OnInit, Input } from '@angular/core';
import { PhastResultsData } from '../report-rollup.service';
import { Settings } from '../../shared/models/settings';
import { Calculator } from '../../shared/models/calculators';
import { PreAssessment } from '../../calculator/furnaces/pre-assessment/pre-assessment';
@Component({
  selector: 'app-phast-rollup',
  templateUrl: './phast-rollup.component.html',
  styleUrls: ['./phast-rollup.component.css']
})
export class PhastRollupComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phastResults: Array<PhastResultsData>;
  @Input()
  calculators: Array<Calculator>;

  preAssessments: Array<PreAssessment>;
  showPreAssessment: boolean = true;
  // calculator: Calculator;

  constructor() { }

  ngOnInit() {
    if (typeof this.calculators === 'undefined') {
      console.log("typeof this.calculators === 'undefined'");
      this.showPreAssessment = false;

    }
    if (!this.calculators) {
      console.log("CALCULATORS == FALSE");
      this.showPreAssessment = false;
    }
    else {
      console.log("CALCULATORS == true");
      // console.log("this.calculators.length = " + this.calculators.length);
      // if (typeof this.calculators[0].preAssessments === 'undefined') {

      if (!this.calculators[0]) {
        console.log("CALCULATORS[0] == FALSE");
        this.showPreAssessment = false;
      }
      else {
        if (!this.calculators[0].preAssessments) {
          console.log("PreASSESSMENTS == FALSE");
          this.showPreAssessment = false;
        }
        else {
          console.log("PreASESSMENTS == true");
          this.showPreAssessment = true;
        }
      }


    }

    // console.log("phast-rollup component, showPreAssessment = " + this.showPreAssessment);
  }
}
