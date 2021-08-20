import { Component, OnInit, Input, HostListener } from '@angular/core';
import { PsatOutputs, PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-explore-opportunities-results',
  templateUrl: './explore-opportunities-results.component.html',
  styleUrls: ['./explore-opportunities-results.component.css']
})
export class ExploreOpportunitiesResultsComponent implements OnInit {
  @Input()
  baselineResults: PsatOutputs;
  @Input()
  modificationResults: PsatOutputs;
  @Input()
  settings: Settings;
  @Input()
  psat: PSAT;
  @Input()
  exploreModIndex: number;
  @Input()
  percentSavings: number;
  @Input()
  annualSavings: number;
  @Input()
  modificationName: string;
  @Input()
  inSetup: boolean;


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.hideResults();
  }

  isWhatIfScenario: boolean;

  showResults: boolean = true;
  timeOut: any;
  constructor() { }

  ngOnInit() {
    if (!this.inSetup) {
      if (this.psat.modifications && this.psat.modifications.length > 0) {
        this.isWhatIfScenario = this.psat.modifications[this.exploreModIndex].psat.inputs.whatIfScenario;
      }
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

  hideResults() {
    this.showResults = false;
    if (this.timeOut) {
      clearTimeout(this.timeOut);
    }
    this.timeOut = setTimeout(() => {
      this.showResults = true;
    }, 100)
  }
}
