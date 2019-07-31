import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-help-and-results-panel',
  templateUrl: './help-and-results-panel.component.html',
  styleUrls: ['./help-and-results-panel.component.css']
})
export class HelpAndResultsPanelComponent implements OnInit {
  @Input()
  settings: Settings;

  tabSelect: string = 'help';
  constructor() { }

  ngOnInit() {
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

}
