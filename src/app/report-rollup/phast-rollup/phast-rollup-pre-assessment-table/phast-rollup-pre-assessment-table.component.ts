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
  @Input()
  ind: number;

  graphColors: Array<string>;
  data: Array<{name: string, percent: number, color: string}>;

  constructor(private preAssessmentService: PreAssessmentService) { }

  ngOnInit() {

    this.graphColors = graphColors;
    this.getData();
  }

  getData() {

    if (this.calculators) {
      if (this.calculators[this.ind].preAssessments) {
        this.preAssessments = this.calculators[this.ind].preAssessments;
      }
    }
    this.data = new Array<{name: string, percent: number, color: string}>();
    if (this.preAssessments) {
      let tmpArray = new Array<{ name: string, percent: number, value: number, color: string }>();
      tmpArray = this.preAssessmentService.getResults(this.preAssessments, this.settings.unitsOfMeasure);
      for (let i = tmpArray.length - 1; i >= 0; i--) {
        this.data.unshift({
          name: tmpArray[i].name,
          percent: Math.round(tmpArray[i].percent * 100) / 100,
          color: this.graphColors[(tmpArray.length - 1) - i]
        });
      }
    }
  }
}
