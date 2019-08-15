import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
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
  @Output('saveOutputCalculated')
  saveOutputCalculated = new EventEmitter<SSMT>();
  @Input()
  inModifyConditions: boolean;

  baselineOutput: SSMTOutput;
  baselineInputs: SSMTInputs;
  baselineLosses: SSMTLosses;
  modificationOutput: SSMTOutput;
  modificationInputs: SSMTInputs;
  modificationLosses: SSMTLosses;
  updateDataSub: Subscription;

  showResults: boolean;
  percentSavings: number;
  annualSavings: number;
  modValid: boolean;
  baselineValid: boolean;
  constructor(private ssmtService: SsmtService, private calculateModelService: CalculateModelService, private calculateLossesService: CalculateLossesService) { }

  ngOnInit() {
    this.updateDataSub = this.ssmtService.updateData.subscribe(() => { this.getResults(); });
  }

  ngOnDestroy() {
    this.updateDataSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.modificationIndex && !changes.modificationIndex.firstChange) {
      this.getResults();
    }
  }

  getResults() {
    //baseline
    let resultData: { inputData: SSMTInputs, outputData: SSMTOutput } = this.calculateModelService.initDataAndRun(this.ssmt, this.settings, true, false, 0);
    this.baselineInputs = resultData.inputData;
    this.baselineOutput = resultData.outputData;
    //modification
    resultData = this.calculateModelService.initDataAndRun(this.ssmt.modifications[this.modificationIndex].ssmt, this.settings, false, false, this.baselineOutput.operationsOutput.sitePowerDemand);
    this.modificationInputs = resultData.inputData;
    this.modificationOutput = resultData.outputData;
    this.checkValid();
    if (this.modValid) {
      this.getSavings(this.baselineOutput.operationsOutput.totalOperatingCost, this.modificationOutput.operationsOutput.totalOperatingCost);
    }
    this.getLosses();

  }

  checkValid() {
    if (this.modificationOutput && this.modificationOutput.boilerOutput) {
      this.modValid = true;
    } else {
      this.modValid = false;
    }
    if (this.baselineOutput.boilerOutput) {
      this.baselineValid = true;
    } else {
      this.baselineValid = false;
    }
  }

  getInputs() {
    this.baselineInputs = this.calculateModelService.getInputDataFromSSMT(this.ssmt);
    this.modificationInputs = this.calculateModelService.getInputDataFromSSMT(this.ssmt.modifications[this.modificationIndex].ssmt);
  }

  getLosses() {
    this.baselineLosses = this.calculateLossesService.calculateLosses(this.baselineOutput, this.baselineInputs, this.settings, this.ssmt);
    this.modificationLosses = this.calculateLossesService.calculateLosses(this.modificationOutput, this.modificationInputs, this.settings, this.ssmt.modifications[this.modificationIndex].ssmt);
  }

  getSavings(baselineCost: number, modificationCost: number) {
    this.percentSavings = Number(Math.round(((((baselineCost - modificationCost) * 100) / baselineCost) * 100) / 100).toFixed(0));
    this.annualSavings = baselineCost - modificationCost;
  }
}
