import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { FSAT, FsatOutput } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { FsatService } from '../../fsat.service';

@Component({
  selector: 'app-fsat-results-panel',
  templateUrl: './fsat-results-panel.component.html',
  styleUrls: ['./fsat-results-panel.component.css']
})
export class FsatResultsPanelComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;
  @Input()
  modificationIndex: number;

  baselineResults: FsatOutput;
  modificationResults: FsatOutput;
  modificationName: string;
  constructor(private fsatService: FsatService) { }

  ngOnInit() {
    this.getResults();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fsat && !changes.fsat.firstChange) {
      this.getResults();
    }
  }

  getResults() {
    if (this.fsat.modifications && this.fsat.modifications.length != 0) {
      this.baselineResults = this.fsatService.getResults(this.fsat, 'existing');
      this.fsat.modifications[this.modificationIndex].fsat.fanSetup.fanEfficiency = this.baselineResults.fanEfficiency;
      this.modificationName = this.fsat.modifications[this.modificationIndex].fsat.name;
      let modResultType: string = 'modified';
      if(this.fsat.modifications[this.modificationIndex].fsat.fanMotor.optimize){
        modResultType = 'optimal';
      }
      this.modificationResults = this.fsatService.getResults(this.fsat.modifications[this.modificationIndex].fsat, modResultType);
      this.modificationResults.energySavings = this.baselineResults.annualEnergy - this.modificationResults.annualEnergy;
      this.modificationResults.annualSavings = this.baselineResults.annualCost - this.modificationResults.annualCost;
      this.modificationResults.percentSavings = this.fsatService.getSavingsPercentage(this.baselineResults.annualCost, this.modificationResults.annualCost);
    }
  }
}
