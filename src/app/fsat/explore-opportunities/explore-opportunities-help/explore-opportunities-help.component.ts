import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-explore-opportunities-help',
  templateUrl: './explore-opportunities-help.component.html',
  styleUrls: ['./explore-opportunities-help.component.css']
})
export class ExploreOpportunitiesHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
