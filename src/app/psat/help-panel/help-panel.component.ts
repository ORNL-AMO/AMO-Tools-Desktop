import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
@Component({
  selector: 'app-help-panel',
  templateUrl: './help-panel.component.html',
  styleUrls: ['./help-panel.component.css']
})
export class HelpPanelComponent implements OnInit {
  @Input()
  currentTab:number;
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  @Input()
  psat: PSAT;
  constructor() { }

  ngOnInit() {
  }

}
