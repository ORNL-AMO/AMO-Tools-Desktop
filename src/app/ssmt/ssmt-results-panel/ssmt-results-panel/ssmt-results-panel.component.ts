import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, inject, Signal } from '@angular/core';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { SSMT, SSMTInputs, SSMTResults, SsmtValid } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { SSMTOutput, SSMTLosses } from '../../../shared/models/steam/steam-outputs';
import { Subscription } from 'rxjs';
import { SsmtService } from '../../ssmt.service';
import { CalculateLossesService } from '../../calculate-losses.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { SteamService } from '../../../calculator/steam/steam.service';

@Component({
  selector: 'app-ssmt-results-panel',
  templateUrl: './ssmt-results-panel.component.html',
  styleUrls: ['./ssmt-results-panel.component.css'],
  standalone: false
})
export class SsmtResultsPanelComponent implements OnInit {
  private featureFlagService = inject(FeatureFlagService);
  showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;

  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  modificationIndex: number;
  @Input()
  inModifyConditions: boolean;
  @Input()
  inSetup: boolean;

  @Output('saveOutputCalculated')
  saveOutputCalculated = new EventEmitter<SSMT>();

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
  modelingError: boolean;

  currCurrency: string = "$";
  constructor(private ssmtService: SsmtService,
    private steamService: SteamService, private calculateLossesService: CalculateLossesService, private convertUnitsService: ConvertUnitsService) { }

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
    let baselineResultData: { inputData: SSMTInputs, outputData: SSMTOutput } = this.ssmtService.calculateBaselineModel(this.ssmt, this.settings);
    console.log('baseline result data', baselineResultData);
    if (baselineResultData.outputData && !baselineResultData.outputData.hasSteamModelerError) {
      this.modelingError = false;
      this.baselineInputs = baselineResultData.inputData;
      this.baselineOutput = baselineResultData.outputData;

      let baselineSSMTCopy: SSMT = JSON.parse(JSON.stringify(this.ssmt));
      this.baselineValid = this.ssmtService.checkValid(baselineSSMTCopy, this.settings).isValid;

      if (this.baselineValid) {
        this.baselineLosses = this.calculateLossesService.calculateLosses(this.baselineOutput, this.baselineInputs, this.settings, this.ssmt, true);
        if (!this.inSetup && this.ssmt.modifications && this.ssmt.modifications.length !== 0) {
          let modificationSsmtCopy: SSMT = JSON.parse(JSON.stringify(this.ssmt.modifications[this.modificationIndex].ssmt));
          this.modValid = this.ssmtService.checkValid(modificationSsmtCopy, this.settings).isValid;
          let modificationResults: SSMTResults = { inputData: undefined, outputData: this.steamService.getEmptyResults() }
          this.modificationInputs = modificationResults.inputData;
          this.modificationOutput = modificationResults.outputData;

          if (this.modValid) {
            modificationResults = this.ssmtService.calculateModificationModel(this.ssmt.modifications[this.modificationIndex].ssmt, this.settings, this.baselineOutput);
            this.modificationInputs = modificationResults.inputData;
            this.modificationOutput = modificationResults.outputData;

            if (this.modificationOutput.operationsOutput?.totalOperatingCost) {
              this.percentSavings = Number(Math.round(((((this.baselineOutput.operationsOutput.totalOperatingCost - this.modificationOutput.operationsOutput.totalOperatingCost) * 100) / this.baselineOutput.operationsOutput.totalOperatingCost) * 100) / 100).toFixed(0));
              this.annualSavings = this.baselineOutput.operationsOutput.totalOperatingCost - this.modificationOutput.operationsOutput.totalOperatingCost;
            } else {
              this.percentSavings = 0;
              this.annualSavings = 0;
            }
            this.modificationLosses = this.calculateLossesService.calculateLosses(this.modificationOutput, this.modificationInputs, this.settings, this.ssmt.modifications[this.modificationIndex].ssmt, true);
          }

        } else {
          this.modificationOutput = this.steamService.getEmptyResults();
          this.modificationLosses = this.steamService.getEmptyLosses();
        }
      } else {
        console.log('baseline model is not valid');
        this.modelingError = true;
        this.modificationOutput = this.steamService.getEmptyResults();
        this.modificationLosses = this.steamService.getEmptyLosses();
        this.baselineInputs = baselineResultData.inputData;
        this.baselineOutput = baselineResultData.outputData;
      }
    }
  }

}
