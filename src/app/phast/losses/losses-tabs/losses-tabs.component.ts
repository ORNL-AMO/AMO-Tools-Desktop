import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { PHAST, Losses } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { PhastService } from '../../phast.service';
import { LossesService } from '../losses.service';
import { defaultTabs, LossTab } from '../../tabs';
import * as _ from 'lodash';
@Component({
  selector: 'app-losses-tabs',
  templateUrl: './losses-tabs.component.html',
  styleUrls: ['./losses-tabs.component.css']
})
export class LossesTabsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;

  selectedTab: LossTab;

  numCharge: number;
  numFixture: number;
  numWall: number;
  numCooling: number;
  numAtmosphere: number;
  numOpening: number;
  numLeakage: number;
  numExtended: number;
  numOther: number;
  numSlag: number;
  numExhaustGas: number;
  numAuxPower: number;

  chargeDone: boolean;
  efficiencyDone: boolean;
  enInput1Done: boolean;
  enInput2Done: boolean;
  flueGasDone: boolean;

  lossTabs: Array<LossTab>;
  constructor(private lossesService: LossesService) { }

  ngOnInit() {
    this.lossTabs = this.lossesService.lossesTabs;
    console.log(this.lossTabs);
    this.lossesService.lossesTab.subscribe(val => {
      this.selectedTab = this.lossesService.getTab(val);
    })
  }

  tabChange(tab: LossTab) {
    this.lossesService.lossesTab.next(tab.step);
  }
}
