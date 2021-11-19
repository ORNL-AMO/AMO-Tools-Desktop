import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Calculator } from '../../../shared/models/calculators';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { PreAssessmentService, PreAssessmentResult } from '../../../calculator/utilities/pre-assessment/pre-assessment.service';

@Component({
  selector: 'app-pre-assessment-table',
  templateUrl: './pre-assessment-table.component.html',
  styleUrls: ['./pre-assessment-table.component.css']
})
export class PreAssessmentTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  calculator: Calculator;

  tableData: Array<{ name: string, type: string, energyUse: number, energyCost: number, percentEnergy: number, percentCost: number, color: string }>;

  constructor(private preAssessmentService: PreAssessmentService) { }

  ngOnInit() {
    let costResults: Array<PreAssessmentResult> = this.preAssessmentService.getResults(this.calculator.preAssessments, this.settings, 'energyCost', false);
    let energyResults: Array<PreAssessmentResult> = this.preAssessmentService.getResults(this.calculator.preAssessments, this.settings, 'value', false);
    this.tableData = new Array();
    let resultIndex: number = 0;
    let getColorIndex: number = costResults.length -1;
    costResults.forEach(result => {
      this.tableData.push({
        name: costResults[resultIndex].name,
        type: costResults[resultIndex].type,
        energyUse: energyResults[resultIndex].value,
        energyCost: energyResults[resultIndex].energyCost,
        percentEnergy: energyResults[resultIndex].percent / 100,
        percentCost: costResults[resultIndex].percent / 100,
        color: graphColors[getColorIndex]
      });
      resultIndex++;
      getColorIndex --;
    });
  }

}
