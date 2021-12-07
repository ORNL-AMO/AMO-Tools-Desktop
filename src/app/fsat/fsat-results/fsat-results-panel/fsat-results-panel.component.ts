import { Component, OnInit, Input, HostListener, SimpleChanges } from '@angular/core';
import { FSAT, FsatOutput, ExploreOpportunitiesResults } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { FsatService } from '../../fsat.service';
import { Subscription } from 'rxjs';

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
  @Input()
  inSetup: boolean;
  

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.hideResults();
  }
  fsatResults: ExploreOpportunitiesResults;
  co2EmissionsSavings: number = 0;
  annualSavings: number = 0;
  percentSavings: number = 0;
  isWhatIfScenario: boolean;

  baselineResults: FsatOutput;
  modificationResults: FsatOutput;
  modificationName: string;
  showModification: boolean;
  updateDataSub: Subscription;
  showResults: boolean = true;
  timeOut: any;
  constructor(private fsatService: FsatService) { }

  ngOnInit() {
    this.updateDataSub = this.fsatService.updateData.subscribe(() => { this.getResults(); });
    if (this.fsat.modifications && this.fsat.modifications.length > 0) {
      this.isWhatIfScenario = this.fsat.modifications[this.modificationIndex].fsat.whatIfScenario;
    }
  }

  ngOnDestroy() {
    this.updateDataSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.modificationIndex && !changes.modificationIndex.firstChange) {
      this.getResults();
    }
  }
  getDiff(num1: number, num2: number) {
    let diff = num1 - num2;
    if ((diff < .005) && (diff > -.005)) {
      return null;
    } else {
      return diff;
    }
  }

  getResults() {
    let fsatResults: ExploreOpportunitiesResults;
    this.fsat.valid = this.fsatService.checkValid(this.fsat, true, this.settings);
    this.baselineResults = this.fsatService.getResults(this.fsat, true, this.settings);
    debugger;
       if (!this.inSetup && this.fsat.modifications && this.fsat.modifications.length !== 0) {
      this.showModification = true;
      this.modificationName = this.fsat.modifications[this.modificationIndex].fsat.name;
      this.fsat.modifications[this.modificationIndex].fsat.valid = this.fsatService.checkValid(this.fsat.modifications[this.modificationIndex].fsat, false, this.settings);
      this.modificationResults = this.fsatService.getResults(this.fsat.modifications[this.modificationIndex].fsat, false, this.settings);
      debugger;
      this.modificationResults.energySavings = this.baselineResults.annualEnergy - this.modificationResults.annualEnergy;
      this.modificationResults.annualSavings = this.baselineResults.annualCost - this.modificationResults.annualCost;
      this.modificationResults.percentSavings = this.fsatService.getSavingsPercentage(this.baselineResults.annualCost, this.modificationResults.annualCost);
    } else {
      this.modificationResults = this.fsatService.getEmptyResults();
    }
    this.co2EmissionsSavings = fsatResults.co2EmissionsSavings;
    this.baselineResults = fsatResults.baselineResults;
    this.modificationResults = fsatResults.modificationResults;
    this.annualSavings = fsatResults.annualSavings;
    this.percentSavings = fsatResults.percentSavings;
}



  hideResults() {
    this.showResults = false;
    if (this.timeOut) {
      clearTimeout(this.timeOut);
    }
    this.timeOut = setTimeout(() => {
      this.showResults = true;
    }, 100);
  }
}
