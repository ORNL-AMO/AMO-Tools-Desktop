import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { PHAST, Losses, Modification } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';

import * as _ from 'lodash';
import { ModalDirective } from 'ngx-bootstrap';
import { PhastService } from '../phast.service';
import { LossesService } from './losses.service';
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
  @Input()
  inSetup: boolean;

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

  showSetupDialog: boolean;
  isLossesSetup: boolean;

  isModalOpen: boolean = false;
  showAddBtn: boolean = true;
  toggleCalculate: boolean = false;
  constructor(private lossesService: LossesService) { }

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

    this.lossesService.lossesTab.subscribe(val => {
      this.changeField('default');
      this.lossesTab = val;
      if (this.lossesTab == 'heat-system-efficiency'
        || this.lossesTab == 'atmosphere-losses'
        || this.lossesTab == 'exhaust-gas'
        || this.lossesTab == 'heat-system-efficiency'
        || this.lossesTab == 'flue-gas-losses'
        || this.lossesTab == 'energy-input'
        || this.lossesTab == 'energy-input-exhaust-gas'
      ) {
        this.showAddBtn = false;
      } else {

        this.showAddBtn = true;
      }
    })
    this.lossesService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    })
  }

  ngOnDestroy() {
    // this.lossesService.lossesTab.next('charge-material');
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
      this.toggleCalculate = !this.toggleCalculate;
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
        auxiliaryPowerNotes: '',
        exhaustGasNotes: '',
        energyInputExhaustGasNotes: '',
        operationsNotes: ''
      }
    }
    tmpModification.phast.losses = (JSON.parse(JSON.stringify(this.phast.losses)));
    tmpModification.phast.name = 'Modification ' + (this._modifications.length + 1);
    tmpModification.phast.operatingCosts = (JSON.parse(JSON.stringify(this.phast.operatingCosts)));
    tmpModification.phast.operatingHours = (JSON.parse(JSON.stringify(this.phast.operatingHours)));
    tmpModification.phast.systemEfficiency = (JSON.parse(JSON.stringify(this.phast.systemEfficiency)));
    this._modifications.unshift(tmpModification);
    this.modificationIndex = this._modifications.length - 1;
    this.modificationSelected = true;
    this.baselineSelected = false;
    this.saveModifications();
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
    if (this.modificationSelected) {
      this.showEditModification = false;
      this.isDropdownOpen = !this.isDropdownOpen;
      this.showNotes = false;
    }
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
    if (this.baselineSelected) {
      this.lossAdded = true;
      this.addLossToggle = !this.addLossToggle;
    }
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

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
