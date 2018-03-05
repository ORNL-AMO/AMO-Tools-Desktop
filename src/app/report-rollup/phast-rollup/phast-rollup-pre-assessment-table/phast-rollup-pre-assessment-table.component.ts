import { Component, OnInit, Input } from '@angular/core';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { Settings } from '../../../shared/models/settings';
import { Calculator } from '../../../shared/models/calculators';
import { PreAssessmentService } from '../../../calculator/furnaces/pre-assessment/pre-assessment.service';
import { PreAssessment } from '../../../calculator/furnaces/pre-assessment/pre-assessment';

@Component({
  selector: 'app-phast-rollup-pre-assessment-table',
  templateUrl: './phast-rollup-pre-assessment-table.component.html',
  styleUrls: ['./phast-rollup-pre-assessment-table.component.css']
})
export class PhastRollupPreAssessmentTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  @Input()
  calculators: Array<Calculator>;
  @Input()
  preAssessments: Array<PreAssessment>;

  percentages: Array<string>;


  constructor(private preAssessmentService: PreAssessmentService) { }

  ngOnInit() {
    this.getData();
  }

  getData() {

    if (this.calculators) {
      if (this.calculators[0].preAssessments) {
        this.preAssessments = this.calculators[0].preAssessments;
      }
    }
    this.percentages = new Array<string>();
    if (this.preAssessments) {
      let tmpArray = new Array<{ name: string, percent: number, value: number, color: string }>();
      tmpArray = this.preAssessmentService.getResults(this.preAssessments, this.settings.unitsOfMeasure);
      for (let i = 0; i < tmpArray.length; i++) {
        this.percentages.push(tmpArray[i].percent.toFixed(2) + "%");
      }
    }
    else {
      // console.log("NO PRE ASSESSMENTS");
    }
  }
}
