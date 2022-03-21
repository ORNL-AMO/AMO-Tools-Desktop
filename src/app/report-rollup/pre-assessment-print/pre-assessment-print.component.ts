import { Component, OnInit, Input } from '@angular/core';
import { Calculator } from '../../shared/models/calculators';
import { Settings } from '../../shared/models/settings';
import { PreAssessmentService, PreAssessmentResult } from '../../calculator/utilities/pre-assessment/pre-assessment.service';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

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
  @Input()
  resultUnit: string;

  valuePieData: Array<{ label: string, value: number }>;
  energyUsePieData: Array<{ label: string, value: number }>;
  //energyUnit: string;
  energyTextTemplate: string;
  costTextTemplate: string;
  constructor(private preAssessmentService: PreAssessmentService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit(): void {
    //this.energyUnit = this.resultUnit;
    let costResults: Array<PreAssessmentResult> = this.preAssessmentService.getResults(this.calculator.preAssessments, this.settings, 'energyCost', false);
    this.valuePieData = costResults.map(resultItem => { return { value: resultItem.energyCost, label: resultItem.name } })
    let energyResults: Array<PreAssessmentResult> = this.preAssessmentService.getResults(this.calculator.preAssessments, this.settings, 'value', false);
    this.energyUsePieData = energyResults.map(resultItem => { return { value: this.convertUnitsService.value(resultItem.value).from(this.settings.energyResultUnit).to(this.resultUnit), label: resultItem.name } })
  
    this.energyTextTemplate = '%{label}: %{value:.3r} ' + this.resultUnit;
    this.costTextTemplate = '%{label}: %{value:$.3r}';
  }

}
