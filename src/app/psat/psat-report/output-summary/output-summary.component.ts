import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PSAT, PsatOutputs } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { PsatService } from '../../psat.service';
import * as _ from 'lodash';
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
  @Input()
  inRollup: boolean;
  @Output('selectModification')
  selectModification = new EventEmitter<any>();
  @Input()
  assessment: Assessment;

  unit: string;
  titlePlacement: string;
  maxAnnualSavings: number = 0;
  selectedModificationIndex: number = 0;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.unit = '%';
    this.titlePlacement = 'top';
    this.psat.outputs = this.getResults(this.psat, this.settings);
    this.psat.outputs.percent_annual_savings = 0;
    if (this.psat.modifications) {
      this.psat.modifications.forEach(mod => {
        mod.psat.outputs = this.getResults(mod.psat, this.settings, true);
        mod.psat.outputs.percent_annual_savings = this.getSavingsPercentage(this.psat, mod.psat);
      })
      this.getMaxAnnualSavings();
    }
  }

  checkSavings(num: number) {
    return this.psat.outputs.annual_cost - num;
  }

  getSavingsPercentage(baseline: PSAT, modification: PSAT): number {
    let tmpSavingsPercent = Number(Math.round(((((baseline.outputs.annual_cost - modification.outputs.annual_cost) * 100) / baseline.outputs.annual_cost) * 100) / 100).toFixed(0));
    return tmpSavingsPercent;
  }

  getResults(psat: PSAT, settings: Settings, isModification?: boolean): PsatOutputs {
    if (psat.inputs.optimize_calculation) {
      return this.psatService.resultsOptimal(psat.inputs, settings);
    } else if (!isModification) {
      return this.psatService.resultsExisting(psat.inputs, settings);
    } else {
      return this.psatService.resultsModified(psat.inputs, settings, this.psat.outputs.pump_efficiency);
    }
  }

  getMaxAnnualSavings() {
    let minCost = _.minBy(this.psat.modifications, (mod) => { return mod.psat.outputs.annual_cost })
    if (minCost) {
      this.selectedModificationIndex = _.findIndex(this.psat.modifications, minCost);
      this.maxAnnualSavings = this.psat.outputs.annual_cost - minCost.psat.outputs.annual_cost;
    }
  }

  useModification() {
    this.selectModification.emit({ modIndex: this.selectedModificationIndex, type: 'PSAT', assessment: this.assessment })
  }

}
