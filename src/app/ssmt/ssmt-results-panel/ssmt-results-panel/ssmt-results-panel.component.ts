import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { SSMT, SSMTInputs } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { SSMTOutput, SSMTLosses } from '../../../shared/models/steam/steam-outputs';
import { Subscription } from 'rxjs';
import { SsmtService } from '../../ssmt.service';
import { CalculateLossesService } from '../../calculate-losses.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

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
  currCurrency: string = "$";
  constructor(private ssmtService: SsmtService, private calculateLossesService: CalculateLossesService, private convertUnitsService: ConvertUnitsService) { }

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
    let resultData: { inputData: SSMTInputs, outputData: SSMTOutput } = this.ssmtService.calculateBaselineModel(this.ssmt, this.settings);

    this.baselineInputs = resultData.inputData;
    this.baselineOutput = resultData.outputData;
    //modification
    resultData = this.ssmtService.calculateModificationModel(this.ssmt.modifications[this.modificationIndex].ssmt, this.settings, this.baselineOutput);
    this.modificationInputs = resultData.inputData;
    this.modificationOutput = resultData.outputData;
    this.checkValid();
    if (this.modValid) {
      this.getSavings(this.baselineOutput.operationsOutput.totalOperatingCost, this.modificationOutput.operationsOutput.totalOperatingCost);
    }
    /*if (this.currCurrency != this.settings.currency) {
      this.baselineOutput.operationsOutput.boilerFuelCost = this.convertCurrency(this.baselineOutput.operationsOutput.boilerFuelCost);
      this.modificationOutput.operationsOutput.boilerFuelCost = this.convertCurrency(this.modificationOutput.operationsOutput.boilerFuelCost);
      this.baselineOutput.operationsOutput.powerGenerationCost = this.convertCurrency(this.baselineOutput.operationsOutput.powerGenerationCost);
      this.modificationOutput.operationsOutput.powerGenerationCost = this.convertCurrency(this.modificationOutput.operationsOutput.powerGenerationCost);
      this.baselineOutput.operationsOutput.makeupWaterCost = this.convertCurrency(this.baselineOutput.operationsOutput.makeupWaterCost);
      this.modificationOutput.operationsOutput.makeupWaterCost = this.convertCurrency(this.modificationOutput.operationsOutput.makeupWaterCost);
      this.baselineOutput.operationsOutput.makeupWaterCost = this.convertCurrency(this.baselineOutput.operationsOutput.makeupWaterCost);
      this.modificationOutput.operationsOutput.makeupWaterCost = this.convertCurrency(this.modificationOutput.operationsOutput.makeupWaterCost);
      this.baselineOutput.operationsOutput.totalOperatingCost = this.convertCurrency(this.baselineOutput.operationsOutput.totalOperatingCost);
      this.modificationOutput.operationsOutput.totalOperatingCost = this.convertCurrency(this.modificationOutput.operationsOutput.totalOperatingCost);
      this.annualSavings = this.convertCurrency(this.annualSavings);
    }*/
    this.getLosses();

  }

  convertCurrency(toConvert: number) {
    return this.convertUnitsService.convertValue(toConvert, this.currCurrency, this.settings.currency);
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

  getLosses() {
    this.baselineLosses = this.calculateLossesService.calculateLosses(this.baselineOutput, this.baselineInputs, this.settings, this.ssmt);
    this.modificationLosses = this.calculateLossesService.calculateLosses(this.modificationOutput, this.modificationInputs, this.settings, this.ssmt.modifications[this.modificationIndex].ssmt);
  }

  getSavings(baselineCost: number, modificationCost: number) {
    this.percentSavings = Number(Math.round(((((baselineCost - modificationCost) * 100) / baselineCost) * 100) / 100).toFixed(0));
    this.annualSavings = baselineCost - modificationCost;
  }
}
