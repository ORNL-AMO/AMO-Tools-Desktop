import { Component, OnInit, Input } from '@angular/core';
import { SSMT, SSMTInputs } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { SSMTOutput, SSMTLosses } from '../../../shared/models/steam/steam-outputs';
import { Subscription } from 'rxjs';
import { SsmtService } from '../../ssmt.service';
import { CalculateModelService } from '../../ssmt-calculations/calculate-model.service';
import { CalculateLossesService } from '../../ssmt-calculations/calculate-losses.service';

@Component({
  selector: 'app-ssmt-results-panel',
  templateUrl: './ssmt-results-panel.component.html',
  styleUrls: ['./ssmt-results-panel.component.css']
})
export class SsmtResultsPanelComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  modificationIndex: number;

  baselineOutput: SSMTOutput;
  baselineInputs: SSMTInputs;
  baselineLosses: SSMTLosses;
  modificationOutput: SSMTOutput;
  modificationInputs: SSMTInputs;
  modificationLosses: SSMTLosses;
  updateDataSub: Subscription;

  counter: any;
  showResults: boolean;
  percentSavings: number;
  annualSavings: number;
  constructor(private ssmtService: SsmtService, private calculateModelService: CalculateModelService, private calculateLossesService: CalculateLossesService) { }

  ngOnInit() {
    this.updateDataSub = this.ssmtService.updateData.subscribe(() => { this.getResults(); })
  }

  ngOnDestroy() {
    this.updateDataSub.unsubscribe();
  }

  getResults() {
    this.showResults = false;
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      // this.calculateModelService.initResults();
      // this.calculateModelService.initData(this.ssmt, this.settings, true);
      let resultData: { inputData: SSMTInputs, outputData: SSMTOutput } = this.calculateModelService.initDataAndRun(this.ssmt, this.settings, true, false);
      this.baselineOutput = resultData.outputData;
      this.baselineInputs = resultData.inputData;
      this.baselineLosses = this.calculateLossesService.calculateLosses(this.baselineOutput, this.baselineInputs, this.settings);
      // this.calculateModelService.initResults();
      // this.calculateModelService.initData(this.ssmt.modifications[this.modificationIndex].ssmt, this.settings, false, this.baselineOutput.sitePowerDemand);
      resultData = this.calculateModelService.initDataAndRun(this.ssmt.modifications[this.modificationIndex].ssmt, this.settings, false, false, this.baselineOutput.sitePowerDemand);
      this.modificationOutput = resultData.outputData;
      this.modificationInputs = resultData.inputData;
      this.modificationLosses = this.calculateLossesService.calculateLosses(this.modificationOutput, this.modificationInputs, this.settings);
      this.getSavings(this.baselineOutput.totalOperatingCost, this.modificationOutput.totalOperatingCost);
      this.showResults = true;
    }, 750)
  }


  getSavings(baselineCost: number, modificationCost: number) {
    this.percentSavings = Number(Math.round(((((baselineCost - modificationCost) * 100) / baselineCost) * 100) / 100).toFixed(0));
    this.annualSavings = baselineCost - modificationCost;
  }
}
