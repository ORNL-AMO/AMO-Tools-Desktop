import { Component, OnInit, Input } from '@angular/core';
import { SSMT, SSMTInputs } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';
import { Subscription } from 'rxjs';
import { SsmtService } from '../../ssmt.service';
import { CalculateModelService } from '../../ssmt-calculations/calculate-model.service';

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
  modificationOutput: SSMTOutput;
  modificationInputs: SSMTInputs;
  updateDataSub: Subscription;

  counter: any;
  showResults: boolean;
  percentSavings: number;
  constructor(private ssmtService: SsmtService, private calculateModelService: CalculateModelService) { }

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
      this.calculateModelService.initResults();
      this.calculateModelService.initData(this.ssmt, this.settings, true);
      let resultData: { inputData: SSMTInputs, outputData: SSMTOutput } = this.calculateModelService.calculateModelRunner();
      this.baselineOutput = resultData.outputData;
      this.baselineInputs = resultData.inputData;
      this.calculateModelService.initResults();
      this.calculateModelService.initData(this.ssmt.modifications[this.modificationIndex].ssmt, this.settings, false, this.baselineOutput.sitePowerDemand);
      resultData = this.calculateModelService.calculateModelRunner();
      this.modificationOutput = resultData.outputData;
      this.modificationInputs = resultData.inputData;
      this.getPercentSavings(this.baselineOutput.totalOperatingCost, this.modificationOutput.totalOperatingCost);
      this.showResults = true;
    }, 750)
  }


  getPercentSavings(baselineCost: number, modificationCost: number) {
    this.percentSavings = Number(Math.round(((((baselineCost - modificationCost) * 100) / baselineCost) * 100) / 100).toFixed(0));
  }
}
