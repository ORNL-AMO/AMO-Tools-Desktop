import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Losses } from '../../../shared/models/phast';
import { Settings } from '../../../shared/models/settings';
@Component({
  selector: 'app-losses-tabs',
  templateUrl: './losses-tabs.component.html',
  styleUrls: ['./losses-tabs.component.css']
})
export class LossesTabsComponent implements OnInit {
  @Output('changeTab')
  changeTab = new EventEmitter<string>();
  @Input()
  lossesTab: string;
  @Input()
  losses: Losses;
  @Input()
  lossesStates: any;
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit() {
  }

  tabChange(str: string) {
    this.changeTab.emit(str);
  }
}
