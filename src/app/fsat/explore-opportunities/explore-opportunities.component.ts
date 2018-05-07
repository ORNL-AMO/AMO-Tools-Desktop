import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-explore-opportunities',
  templateUrl: './explore-opportunities.component.html',
  styleUrls: ['./explore-opportunities.component.css']
})
export class ExploreOpportunitiesComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;
  @Input()
  containerHeight: number;
  @Input()
  modificationIndex: number;
  @Input()
  modificationExists: boolean;
  @Output('saved')
  saved = new EventEmitter<boolean>();

  tabSelect: string = 'results';
  currentField: string;
  constructor() { }

  ngOnInit() {
  }
  setTab(str: string) {
    this.tabSelect = str;
  }

  focusField($event) {
    this.currentField = $event;
  }
}
