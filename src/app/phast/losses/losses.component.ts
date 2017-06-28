import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { PHAST, Losses, Modification } from '../../shared/models/phast';
import { Settings } from '../../shared/models/settings';
import * as _ from 'lodash';
import { ModalDirective } from 'ngx-bootstrap';

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
  @Input()
  settings: Settings;

  lossAdded: boolean;

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
  editModification: Modification;
  showEditModification: boolean = false;
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
    },
    flueGasLosses: {
      numLosses: 0,
      saved: true
    },
    slagLosses: {
      numLosses: 0,
      saved: true
    },
    auxiliaryPowerLosses: {
      numLosses: 0,
      saved: true
    },
    energyInput: {
      numLosses: 0,
      saved: true
    }
  }

  showSetupDialog: boolean;
  isLossesSetup: boolean;
  constructor() { }

  ngOnInit() {
    this._modifications = new Array<Modification>();
    if (!this.phast.losses) {
      //initialize losses
      this.phast.losses = {};
      //show setup dialog div
      this.showSetupDialog = true;
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
    this.lossesStates.flueGasLosses.saved = true;
    this.lossesStates.slagLosses.saved = true;
    this.lossesStates.auxiliaryPowerLosses.saved = true;
  }

  changeField($event) {
    this.currentField = $event;
  }
  saveModifications() {
    if (this._modifications) {
      this.phast.modifications = (JSON.parse(JSON.stringify(this._modifications)));
      this.saved.emit(true);
      this.showEditModification = false;
      this.editModification = null;
    }
  }

  addModification() {
    let tmpModification: Modification = {
      phast: {
        losses: {},
        name: ''
      },
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
        extendedNotes: '',
        slagNotes: '',
        auxiliaryPowerNotes: ''
      }
    }
    tmpModification.phast.losses = (JSON.parse(JSON.stringify(this.phast.losses)));
    tmpModification.phast.name = 'Modification ' + (this._modifications.length + 1);
    this._modifications.unshift(tmpModification);
    this.modificationIndex = this._modifications.length - 1;
    this.modificationSelected = true;
    this.baselineSelected = false;
  }

  deleteModification() {
    this.modificationIndex = 0;
    _.remove(this._modifications, (mod) => {
      return mod.phast.name == this.editModification.phast.name;
    });
    this.showEditModification = false;
    this.editModification = null;
    this.saveModifications();
  }

  toggleDropdown() {
    this.showEditModification = false;
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
    this.lossAdded = true;
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

  dispEditModification(modification: Modification) {
    this.editModification = modification;
    this.showEditModification = true;
  }

  hideSetupDialog() {
    this.saved.emit(true);
    this.showSetupDialog = false;
  }

  lossesSetup() {
    this.saved.emit(true);
    this.isLossesSetup = true;
  }
}
