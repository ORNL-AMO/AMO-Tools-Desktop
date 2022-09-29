import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
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
    this.baselineInputs = baselineResultData.inputData;
    this.baselineOutput = baselineResultData.outputData;

    let baselineSSMTCopy: SSMT = JSON.parse(JSON.stringify(this.ssmt));
    this.baselineValid = this.ssmtService.checkValid(baselineSSMTCopy, this.settings).isValid;
    
    if (this.baselineValid) {
      this.baselineLosses = this.calculateLossesService.calculateLosses(this.baselineOutput, this.baselineInputs, this.settings, this.ssmt);
      let modificationSsmtCopy: SSMT = JSON.parse(JSON.stringify(this.ssmt.modifications[this.modificationIndex].ssmt));
      this.modValid = this.ssmtService.checkValid(modificationSsmtCopy, this.settings).isValid;
      let modificationResults: SSMTResults = { inputData: undefined, outputData: this.steamService.getEmptyResults() }
      this.modificationInputs = modificationResults.inputData;
      this.modificationOutput = modificationResults.outputData;

      if (this.modValid) {
        modificationResults = this.ssmtService.calculateModificationModel(this.ssmt.modifications[this.modificationIndex].ssmt, this.settings, this.baselineOutput);
        this.modificationInputs = modificationResults.inputData;
        this.modificationOutput = modificationResults.outputData;
        
        this.percentSavings = Number(Math.round(((((this.baselineOutput.operationsOutput.totalOperatingCost - this.modificationOutput.operationsOutput.totalOperatingCost) * 100) / this.baselineOutput.operationsOutput.totalOperatingCost) * 100) / 100).toFixed(0));
        this.annualSavings = this.baselineOutput.operationsOutput.totalOperatingCost - this.modificationOutput.operationsOutput.totalOperatingCost;
        this.modificationLosses = this.calculateLossesService.calculateLosses(this.modificationOutput, this.modificationInputs, this.settings, this.ssmt.modifications[this.modificationIndex].ssmt);
      }
    }
  }

}
