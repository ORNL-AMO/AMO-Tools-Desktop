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
  selectedTab: LossTab;
  @Input()
  saveDbToggle: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;

  showSlag: boolean = false;
  showAuxPower: boolean = false;
  showSystemEff: boolean = false;
  showFlueGas: boolean = false;
  showEnInput1: boolean = false;
  showEnInput2: boolean = false;
  showExGas: boolean = false;

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
    this.lossesService.lossesTab.subscribe(val => {
      this.selectedTab = this.lossesService.getTab(val);
    })
    this.checkDone();
    this.lossesService.updateTabs.subscribe(val => {
      this.checkDone();
      if (this.phast.losses) {
        this.getNumLosses(this.phast.losses)
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      if (this.phast.losses) {
        this.getNumLosses(this.phast.losses);
      }
      this.checkDone();
    }
  }

  checkDone() {
    this.chargeDone = this.lossesService.chargeDone;
    this.efficiencyDone = this.lossesService.efficiencyDone;
    this.enInput1Done = this.lossesService.enInput1Done;
    this.enInput2Done = this.lossesService.enInput2Done;
    this.flueGasDone = this.lossesService.flueGasDone;
  }

  tabChange(tab: LossTab) {
    this.lossesService.lossesTab.next(tab.step);
  }

  // setTabs() {
  //   if (this.settings.energySourceType == 'Electricity') {
  //     if (this.settings.furnaceType == 'Electric Arc Furnace (EAF)') {
  //       this.showSlag = true;
  //       this.lossesService.lossesTabs.push({
  //         tabName: 'Heat System Efficiency',
  //         step: 9,
  //         back: 8,
  //         next: 10,
  //         componentStr: 'heat-system-efficiency' 
  //       })
  //       this.showExGas = true;
  //       this.lossesService.lossesTabs.push({
  //         tabName: 'Exhaust Gas',
  //         step: 10,
  //         back: 9,
  //         next: 11,
  //         componentStr: 'exhaust-gas' 
  //       })
  //       this.showEnInput1 = true;
  //       this.lossesService.lossesTabs.push({
  //         tabName: 'Energy Input',
  //         step: 11,
  //         back: 10,
  //         lastStep: true,
  //         componentStr: 'energy-input' 
  //       })
  //     } 

  //     else if (this.settings.furnaceType != 'Custom Electrotechnology') {
  //       this.showAuxPower = true;
  //       this.lossesService.lossesTabs.push({
  //         tabName: 'Auxiliary Power',
  //         step: 9,
  //         back: 8,
  //         next: 10,
  //         componentStr: 'auxiliary-power' 
  //       })
  //       this.showEnInput2 = true;
  //       this.lossesService.lossesTabs.push({
  //         tabName: 'Energy Input',
  //         step: 10,
  //         back: 9,
  //         lastStep: true,
  //         componentStr: 'energy-input-exhaust-gas' 
  //       })
  //     } 

  //     else if (this.settings.furnaceType == 'Custom Electrotechnology') {
  //       this.showSystemEff = true;
  //       this.lossesService.lossesTabs.push({
  //         tabName: 'Heat System Efficiency',
  //         step: 9,
  //         back: 8,
  //         lastStep: true,
  //         componentStr: 'heat-system-efficiency' 
  //       })
  //     }
  //   } 

  //   else if (this.settings.energySourceType == 'Steam') {
  //     this.showSystemEff = true;
  //     this.lossesService.lossesTabs.push({
  //       tabName: 'Heat System Efficiency',
  //       step: 9,
  //       back: 8,
  //       lastStep: true,
  //       componentStr: 'heat-system-efficiency' 
  //     })
  //   } 

  //   else if (this.settings.energySourceType == 'Fuel') {
  //     this.showFlueGas = true;
  //     this.lossesService.lossesTabs.push({
  //       tabName: 'Flue Gas',
  //       step: 9,
  //       back: 8,
  //       lastStep: true,
  //       componentStr: 'flue-gas-losses' 
  //     })
  //   }
  //   this.lossTabs = this.lossesService.lossesTabs;
  //   this.lossesService.tabsSet = true;
  // }

  getNumLosses(losses: Losses) {
    if (losses.atmosphereLosses) {
      this.numAtmosphere = losses.atmosphereLosses.length;
    }
    if (losses.auxiliaryPowerLosses) {
      this.numAuxPower = losses.auxiliaryPowerLosses.length;
    }
    if (losses.chargeMaterials) {
      this.numCharge = losses.chargeMaterials.length;
    }
    if (losses.coolingLosses) {
      this.numCooling = losses.coolingLosses.length;
    }
    if (losses.extendedSurfaces) {
      this.numExtended = losses.extendedSurfaces.length;
    }
    if (losses.fixtureLosses) {
      this.numFixture = losses.fixtureLosses.length;
    }
    if (losses.leakageLosses) {
      this.numLeakage = losses.leakageLosses.length;
    }
    if (losses.openingLosses) {
      this.numOpening = losses.openingLosses.length;
    }
    if (losses.otherLosses) {
      this.numOther = losses.otherLosses.length;
    }
    if (losses.slagLosses) {
      this.numSlag = losses.slagLosses.length;
    }
    if (losses.wallLosses) {
      this.numWall = losses.wallLosses.length;
    }
  }
}
