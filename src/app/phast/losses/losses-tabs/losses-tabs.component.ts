import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { LossesService } from '../losses.service';
import { LossTab } from '../../tabs';
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
  @Input()
  inSetup: boolean;
  
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
    // console.log(this.lossTabs);
    this.lossesService.lossesTab.subscribe(val => {
      this.selectedTab = this.lossesService.getTab(val);
    });
  }

  tabChange(tab: LossTab) {
    this.lossesService.lossesTab.next(tab.step);
  }

  tabNext(){
    this.lossesService.lossesTab.next(this.selectedTab.step + 1);
    console.log(this.selectedTab.step);
  }

  tabBack(){
    this.lossesService.lossesTab.next(this.selectedTab.step - 1);
  }
}
