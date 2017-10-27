import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
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
  constructor(private lossesService: LossesService) { }

  ngOnInit() {
    this.lossesService.lossesTab.subscribe(val => {
      this.lossesTab = val;
    })

    this.setTabs()

    // this.lossesService.baseline.subscribe(val => {
    //   if (val) {
    //     if (val.losses) {
    //       this.getNumLosses(val.losses);
    //     }
    //   }
    // })

    // this.lossesService.chargeDone.subscribe(val => {
    //   if (val != null) {
    //     this.chargeDone = val;
    //   }
    // });
    // this.lossesService.efficiencyDone.subscribe(val => {
    //   if (val != null) {
    //     this.efficiencyDone = val;
    //   }
    // });
    // this.lossesService.enInput1Done.subscribe(val => {
    //   if (val != null) {
    //     this.enInput1Done = val;
    //   }
    // });
    // this.lossesService.enInput2Done.subscribe(val => {
    //   if (val != null) {
    //     this.enInput2Done = val;
    //   }
    // });
    // this.lossesService.flueGasDone.subscribe(val => {
    //   if (val != null) {
    //     this.flueGasDone = val;
    //   }
    // });
  }

  ngOnDestroy() {
  }

  ngAfterContentInit() {
    this.lossesService.baseline.subscribe(val => {
      if (val) {
        if (val.losses) {
          this.getNumLosses(val.losses);
        }
      }
    })

    this.lossesService.chargeDone.subscribe(val => {
      if (val != null) {
        this.chargeDone = val;
      }
    });
    this.lossesService.efficiencyDone.subscribe(val => {
      if (val != null) {
        this.efficiencyDone = val;
      }
    });
    this.lossesService.enInput1Done.subscribe(val => {
      if (val != null) {
        this.enInput1Done = val;
      }
    });
    this.lossesService.enInput2Done.subscribe(val => {
      if (val != null) {
        this.enInput2Done = val;
      }
    });
    this.lossesService.flueGasDone.subscribe(val => {
      if (val != null) {
        this.flueGasDone = val;
      }
    });


  }


  tabChange(str: string) {
    this.lossesService.lossesTab.next(str);
  }

  setTabs() {
    if (this.settings.energySourceType == 'Electricity') {
      if (this.settings.furnaceType == 'Electric Arc Furnace (EAF)') {
        this.showSlag = true;
        this.showExGas = true;
        this.showEnInput1 = true;
      } else if (this.settings.furnaceType != 'Custom Electrotechnology') {
        this.showAuxPower = true;
        this.showEnInput2 = true;
      } else if (this.settings.furnaceType == 'Custom Electrotechnology') {
        this.showSystemEff = true;
      }
    } else if (this.settings.energySourceType == 'Steam') {
      this.showSystemEff = true;
    } else if (this.settings.energySourceType == 'Fuel') {
      this.showFlueGas = true;
    }
  }

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
