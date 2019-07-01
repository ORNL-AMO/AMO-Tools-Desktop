import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { Fan203Inputs } from '../../../../shared/models/fans';

@Component({
  selector: 'app-help-and-results-panel',
  templateUrl: './help-and-results-panel.component.html',
  styleUrls: ['./help-and-results-panel.component.css']
})
export class HelpAndResultsPanelComponent implements OnInit {
  @Input()
  settings: Settings;
  // @Input()
  // inputs: Fan203Inputs;

  tabSelect: string = 'results';
  constructor() { }

  ngOnInit() {
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

}
