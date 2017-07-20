import { Component, OnInit, Input } from '@angular/core';
import { PSAT, PsatOutputs } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { PsatService } from '../../psat.service';
@Component({
  selector: 'app-output-summary',
  templateUrl: './output-summary.component.html',
  styleUrls: ['./output-summary.component.css']
})
export class OutputSummaryComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;

  unit: string;
  titlePlacement: string;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.unit = '%';
    this.titlePlacement = 'top';
    this.psat.outputs = this.getResults(this.psat, this.settings);
    this.psat.outputs.percent_annual_savings = 0;
    if(this.psat.modifications){
      this.psat.modifications.forEach(mod => {
        mod.psat.outputs = this.getResults(mod.psat, this.settings);
        mod.psat.outputs.percent_annual_savings = this.getSavingsPercentage(this.psat, mod.psat);
      })
    }
  }

  checkSavings(num: number) {
    return this.psat.outputs.annual_cost - num;
  }

  getSavingsPercentage(baseline: PSAT, modification: PSAT): number {
    let tmpSavingsPercent = Number(Math.round(((((baseline.outputs.annual_cost - modification.outputs.annual_cost) * 100) / baseline.outputs.annual_cost) * 100) / 100).toFixed(0));
    return tmpSavingsPercent;
  }

  getResults(psat: PSAT, settings: Settings) : PsatOutputs{
    if (psat.inputs.optimize_calculation) {
      return this.psatService.resultsOptimal(psat.inputs, settings);
    } else {
      return this.psatService.resultsExisting(psat.inputs, settings);
    }
  }

}
