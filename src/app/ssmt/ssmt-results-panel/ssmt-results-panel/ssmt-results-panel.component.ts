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

  // baselineOutput: SSMTOutput;
  baselineInputs: SSMTInputs;
  baselineLosses: SSMTLosses;
  // modificationOutput: SSMTOutput;
  modificationInputs: SSMTInputs;
  modificationLosses: SSMTLosses;
  updateDataSub: Subscription;

  counter: any;
  showResults: boolean;
  percentSavings: number;
  annualSavings: number;
  modValid: boolean;
  baselineValid: boolean;
  constructor(private ssmtService: SsmtService, private calculateModelService: CalculateModelService, private calculateLossesService: CalculateLossesService, ) { }

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
    this.showResults = false;
    if (this.counter) {
      clearTimeout(this.counter);
    }

    let calculateModification: boolean = !this.ssmt.modifications[this.modificationIndex].ssmt.resultsCalculated;
    let calculateBaseline: boolean = !this.ssmt.resultsCalculated;
    if (calculateBaseline || calculateModification) {
      this.counter = setTimeout(() => {
        let resultData: { inputData: SSMTInputs, outputData: SSMTOutput };
        if (calculateBaseline) {
          resultData = this.calculateModelService.initDataAndRun(this.ssmt, this.settings, true, false);
          this.ssmt.outputData = resultData.outputData;
        }
        if (calculateModification || calculateBaseline) {
          resultData = this.calculateModelService.initDataAndRun(this.ssmt.modifications[this.modificationIndex].ssmt, this.settings, false, false, this.ssmt.outputData.operationsOutput.sitePowerDemand);
          this.ssmt.modifications[this.modificationIndex].ssmt.outputData = resultData.outputData;
        }
        this.getInputs();
        this.getSavings(this.ssmt.outputData.operationsOutput.totalOperatingCost, this.ssmt.modifications[this.modificationIndex].ssmt.outputData.operationsOutput.totalOperatingCost);
        this.getLosses();
        this.showResults = true;
        this.ssmt.resultsCalculated = true;
        this.ssmt.modifications[this.modificationIndex].ssmt.resultsCalculated = true;
        this.save();
        this.checkValid();
      }, 750);
    } else {
      this.getInputs();
      this.getLosses();
      this.getSavings(this.ssmt.outputData.operationsOutput.totalOperatingCost, this.ssmt.modifications[this.modificationIndex].ssmt.outputData.operationsOutput.totalOperatingCost);
      this.showResults = true;
      this.checkValid();
    }

  }

  checkValid() {
    if (this.ssmt.modifications[this.modificationIndex].ssmt.outputData && this.ssmt.modifications[this.modificationIndex].ssmt.outputData.boilerOutput) {
      this.modValid = true;
    } else {
      this.modValid = false;
    }
    if (this.ssmt.outputData.boilerOutput) {
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
    this.baselineLosses = this.calculateLossesService.calculateLosses(this.ssmt.outputData, this.baselineInputs, this.settings, this.ssmt);
    this.modificationLosses = this.calculateLossesService.calculateLosses(this.ssmt.modifications[this.modificationIndex].ssmt.outputData, this.modificationInputs, this.settings, this.ssmt.modifications[this.modificationIndex].ssmt);
  }

  getSavings(baselineCost: number, modificationCost: number) {
    this.percentSavings = Number(Math.round(((((baselineCost - modificationCost) * 100) / baselineCost) * 100) / 100).toFixed(0));
    this.annualSavings = baselineCost - modificationCost;
  }

  save() {
    this.ssmtService.saveSSMT.next(this.ssmt);
  }
}
