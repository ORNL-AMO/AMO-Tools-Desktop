import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { Modification } from '../../shared/models/phast/phast';
@Component({
  selector: 'app-help-panel',
  templateUrl: './help-panel.component.html',
  styleUrls: ['./help-panel.component.css']
})
export class HelpPanelComponent implements OnInit {
  @Input()
  currentTab:string;
  // @Input()
  // currentField: string;
  @Input()
  settings: Settings;
  @Input()
  psat: PSAT;
  @Input()
  inSetup: boolean;
  @Input()
  modification: Modification;
  
  tabSelect: string = 'help';

  constructor() { }

  ngOnInit() {
  }


  setTab(str: string){
    this.tabSelect = str;
  }
}
