import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
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
  @Output('saved')
  saved = new EventEmitter<boolean>();

  _modifications: Modification[];
  isDropdownOpen: boolean = false;
  baselineSelected: boolean = true;
  modificationSelected: boolean = false;
  modificationIndex: number = 0;
  lossesTab: string = 'charge-material';
  currentField: string = 'default';
  addLossToggle: boolean = false;
  isFirstChange: boolean = true;
  showNotes: boolean = false;
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
    this._modifications = new Array<Modification>();
    if (!this.phast.losses) {
      this.phast.losses = new Array<Losses>();
    }
    if (this.phast.modifications) {
      this._modifications = (JSON.parse(JSON.stringify(this.phast.modifications)));
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

  changeField($event) {
    this.currentField = $event;
  }


  saveModifications() {
    if (this._modifications) {
      this.phast.modifications = (JSON.parse(JSON.stringify(this._modifications)));
      console.log('saveModifications');
      this.saved.emit(true);
    }
  }

  addModification() {
    this._modifications.unshift({
      name: 'Modification ' + (this._modifications.length + 1),
      losses: (JSON.parse(JSON.stringify(this.phast.losses))),
      notes: {
        chargeNotes: '',
        wallNotes: '',
        atmosphereNotes: '',
        fixtureNotes: '',
        openingNotes: '',
        coolingNotes: '',
        flueGasNotes: '',
        otherNotes: '',
        leakageNotes: '',
        extendedNotes: ''
      }
    });
    this.modificationIndex = this._modifications.length - 1;
    this.modificationSelected = true;
    this.baselineSelected = false;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.showNotes = false;
  }

  selectModification(modification: Modification) {
    let tmpIndex = 0;
    this._modifications.forEach(mod => {
      if (mod == modification) {
        this.modificationIndex = tmpIndex;
        return;
      } else {
        tmpIndex++;
      }
    });
    this.isDropdownOpen = false;
  }

  addLoss() {
    this.addLossToggle = !this.addLossToggle;
  }

  toggleNotes() {
    this.showNotes = !this.showNotes;
    this.isDropdownOpen = false;
  }

  togglePanel(bool: boolean) {
    if (bool == this.baselineSelected) {
      this.baselineSelected = true;
      this.modificationSelected = false;
    }
    else if (bool == this.modificationSelected) {
      this.modificationSelected = true;
      this.baselineSelected = false;
    }
  }

}
