import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Losses } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { PhastService } from '../../phast.service';
import { LossesService } from '../losses.service';
@Component({
  selector: 'app-losses-tabs',
  templateUrl: './losses-tabs.component.html',
  styleUrls: ['./losses-tabs.component.css']
})
export class LossesTabsComponent implements OnInit {
  lossesTab: string;
  // @Input()
  // losses: Losses;
  @Input()
  settings: Settings;
  constructor(private lossesService: LossesService) { }

  ngOnInit() {
    this.lossesService.lossesTab.subscribe(val => {
      this.lossesTab = val;
    })
  }

  tabChange(str: string) {
    this.lossesService.lossesTab.next(str);
  }
}
