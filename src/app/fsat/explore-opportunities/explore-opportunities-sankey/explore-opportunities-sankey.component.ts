import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FSAT } from '../../../shared/models/fans';


@Component({
  selector: 'app-explore-opportunities-sankey',
  templateUrl: './explore-opportunities-sankey.component.html',
  styleUrls: ['./explore-opportunities-sankey.component.css']
})
export class ExploreOpportunitiesSankeyComponent implements OnInit {
  @Input()
  baselineSankey: FSAT;
  @Input()
  modificationSankey: FSAT;
  @Input()
  settings: Settings;
  @Input()
  assessmentName: string;
  
  selectedView: string = 'Baseline';
  constructor() { }

  ngOnInit() {
  }

  switchSankey(toggle: string) {
    this.selectedView = toggle;
  }

}
