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

  //modifications: any[];
  selectedModification: any;
  isDropdownOpen: boolean = false;
  modificationsIndex: number = 0;
  baseline: boolean = true;
  modification: boolean = false;

  lossesTab: string = 'charge-material';
  addLossToggle: boolean = false;

  lossesStates: any = {
    wallLosses: {
      numLosses: 0,
      saved: true,
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
    if (!this.phast.modifications) {
      this.phast.modifications = new Array();
      this.phast.modifications.push({
        name: 'Modification 1',
        losses: this.phast.losses
      });
    }
    if (!this.selectedModification) {
      this.selectedModification = this.phast.modifications[this.modificationsIndex];
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
    this.phast.modifications.unshift({
      name: 'Modification ' + (this.phast.modifications.length + 1),
      losses: this.phast.losses
    })
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectModification(modification: any){
    this.selectedModification = this.phast.modifications.filter(mod => mod.name == modification.name);
    this.isDropdownOpen = false;
  }

  addLoss(){
    this.addLossToggle = !this.addLossToggle;
  }

}
