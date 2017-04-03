import { Component, OnInit, Input } from '@angular/core';
import { PHAST, Losses } from '../../shared/models/phast';
@Component({
  selector: 'app-losses',
  templateUrl: 'losses.component.html',
  styleUrls: ['losses.component.css']
})
export class LossesComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  saveClicked: boolean;

  modifications: any[];
  selectedModification: any;
  isDropdownOpen: boolean = false;

  lossesTab: string = 'charge-material';
  lossesStates: any = {
    wallLosses: {
      numLosses: 0,
      saved: true
    },
    chargeMaterial: {
      numLosses: 0,
      saved: true
    },
    atmosphereLosses: {
      numLosses: 0,
      saved: true
    },
    openingLosses: {
      numLosses: 0,
      saved: true
    },
    coolingLosses: {
      numLosses: 0,
      saved: true
    },
    fixtureLosses: {
      numLosses: 0,
      saved: true
    },
    leakageLosses: {
      numLosses: 0,
      saved: true
    },
    surfaceLosses: {
      numLosses: 0,
      saved: true
    },
    otherLosses: {
      numLosses: 0,
      saved: true
    }
  }
  constructor() { }

  ngOnInit() {
    if (!this.phast.losses) {
      this.phast.losses = new Array<Losses>();
    }
    if (!this.modifications) {
      this.modifications = [{
        name: 'Modification 1',
        phast: this.phast
      }];
    }
    if (!this.selectedModification) {
      this.selectedModification = this.modifications[0];
    }
  }

  changeTab($event) {
    this.lossesTab = $event;
    this.lossesStates.chargeMaterial.saved = true;
    this.lossesStates.wallLosses.saved = true;
    this.lossesStates.atmosphereLosses.saved = true;
    this.lossesStates.openingLosses.saved = true;
    this.lossesStates.coolingLosses.saved = true;
    this.lossesStates.fixtureLosses.saved = true;
  }

  addModification() {
    this.modifications.unshift({
    name: 'Modification ' + (this.modifications.length+1),
      phast: this.phast
    })
  }

  toggleDropdown(){
    this.isDropdownOpen = !this.isDropdownOpen;
  }

}
