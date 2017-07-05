import { Component, OnInit, Input } from '@angular/core';
import { PsatOutputs } from '../../../shared/models/psat';
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
  constructor() { }

  ngOnInit() {
  }

}
