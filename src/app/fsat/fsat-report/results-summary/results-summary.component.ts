import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { FSAT, FsatOutput } from '../../../shared/models/fans';
import { FsatService } from '../../fsat.service';

@Component({
  selector: 'app-results-summary',
  templateUrl: './results-summary.component.html',
  styleUrls: ['./results-summary.component.css']
})
export class ResultsSummaryComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;
  @Input()
  inRollup: boolean;
  @Output('selectModification')
  selectModification = new EventEmitter<any>();
  @Input()
  assessment: Assessment;

  baselineResults: FsatOutput;
  modificationResults: Array<FsatOutput>;
  constructor(private fsatService: FsatService) { }

  ngOnInit() {
    this.modificationResults = new Array<FsatOutput>();
    this.getResults();
  }

  getResults() {
    this.baselineResults = this.fsatService.getResults(this.fsat, 'existing', this.settings);
    if (this.fsat.modifications && this.fsat.modifications.length != 0) {
      this.fsat.modifications.forEach(mod => {
        mod.fsat.fanSetup.fanEfficiency = this.baselineResults.fanEfficiency;
        let modResultType: string = 'modified';
        if (mod.fsat.fanMotor.optimize) {
          modResultType = 'optimal';
        }
        let modResult: FsatOutput = this.fsatService.getResults(mod.fsat, modResultType, this.settings);
        modResult.percentSavings = this.fsatService.getSavingsPercentage(this.baselineResults.annualCost, modResult.annualCost);
        modResult.energySavings = this.baselineResults.annualEnergy - modResult.annualEnergy;
        modResult.annualSavings = this.baselineResults.annualCost - modResult.annualCost;
        this.modificationResults.push(modResult);
      })
    }
  }

}
