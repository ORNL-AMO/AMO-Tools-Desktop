import { Component, OnInit, Input } from '@angular/core';
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
  constructor() { }

  ngOnInit() {
  }


  getDiff(num1: number, num2: number) {
    let diff = num1 - num2;
    if ((diff < .005) && (diff > -.005)) {
      return null;
    } else {
      return diff;
    }
  }
}
