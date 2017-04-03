import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PHAST, Losses, Modification } from '../../shared/models/phast';
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

  selectedModification: Modification;
  _modifications: Modification[];
  isDropdownOpen: boolean = false;
  baseline: boolean = true;
  modification: boolean = false;

  lossesTab: string = 'charge-material';
  addLossToggle: boolean = false;
  isFirstChange: boolean = true;
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.saveClicked && !this.isFirstChange) {
      if (this._modifications) {
        console.log('save');
        this.phast.modifications = this._modifications;
      }
    }
    this.isFirstChange = false;
  }
  ngOnInit() {
    this._modifications = new Array();
    if (!this.phast.losses) {
      this.phast.losses = new Array<Losses>();
    }
    if (!this.phast.modifications) {
      //this._modifications = new Array();
      this.addModification();
    } else {
      this._modifications = (JSON.parse(JSON.stringify(this.phast.modifications)));
    }
    if (!this.selectedModification) {
      this.selectedModification = this._modifications[0];
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
    this._modifications.unshift({
      name: 'Modification ' + (this._modifications.length + 1),
      losses: (JSON.parse(JSON.stringify(this.phast.losses)))
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectModification(modification: any) {
    this.selectedModification = modification;
    this.isDropdownOpen = false;
  }

  addLoss() {
    this.addLossToggle = !this.addLossToggle;
  }

}
