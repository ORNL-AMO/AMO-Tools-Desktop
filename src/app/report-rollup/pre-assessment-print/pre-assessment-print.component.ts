import { Component, OnInit, Input } from '@angular/core';
import { Calculator } from '../../shared/models/calculators';
import { Settings } from '../../shared/models/settings';
import { PreAssessmentService, PreAssessmentResult } from '../../calculator/utilities/pre-assessment/pre-assessment.service';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';

@Component({
  selector: 'app-pre-assessment-print',
  templateUrl: './pre-assessment-print.component.html',
  styleUrls: ['./pre-assessment-print.component.css']
})
export class PreAssessmentPrintComponent implements OnInit {
  @Input()
  calculator: Calculator;
  @Input()
  settings: Settings;

  valuePieData: Array<{ label: string, value: number }>;
  energyUsePieData: Array<{ label: string, value: number }>;
  energyUnit: string;
  energyTextTemplate: string;
  costTextTemplate: string;
  constructor(private preAssessmentService: PreAssessmentService) { }

  ngOnInit(): void {
    this.energyUnit = this.settings.energyResultUnit;
    let costResults: Array<PreAssessmentResult> = this.preAssessmentService.getResults(this.calculator.preAssessments, this.settings, 'energyCost', false);
    this.valuePieData = costResults.map(resultItem => { return { value: resultItem.energyCost, label: resultItem.name } })
    let energyResults: Array<PreAssessmentResult> = this.preAssessmentService.getResults(this.calculator.preAssessments, this.settings, 'value', false);
    this.energyUsePieData = energyResults.map(resultItem => { return { value: resultItem.value, label: resultItem.name } })
  
    this.energyTextTemplate = '%{label}: %{value:.3r} ' + this.energyUnit;
    this.costTextTemplate = '%{label}: %{value:$.3r}';
  }

}
