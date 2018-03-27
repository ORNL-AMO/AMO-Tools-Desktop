import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { PHAST, Losses, Modification } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';

import * as _ from 'lodash';
import { ModalDirective } from 'ngx-bootstrap';
import { PhastService } from '../phast.service';
import { LossesService } from './losses.service';
import { LossTab } from '../tabs';
import { PhastCompareService } from '../phast-compare.service';

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
  @ViewChild('addModificationModal') public addModificationModal: ModalDirective;
  lossAdded: boolean;
  @Input()
  containerHeight: number;

  _modifications: Modification[];
  isDropdownOpen: boolean = false;
  baselineSelected: boolean = true;
  modificationSelected: boolean = false;
  modificationIndex: number = 0;
  selectedTab: LossTab;
  currentField: string = 'default';
  addLossToggle: boolean = false;
  isFirstChange: boolean = true;
  showNotes: boolean = false;
  editModification: Modification;
  showEditModification: boolean = false;

  isLossesSetup: boolean;
  showModal: boolean = false;

  isModalOpen: boolean = false;
  showAddBtn: boolean = true;
  toggleCalculate: boolean = false;
  modificationExists: boolean = false;
  lossesTabs: Array<LossTab>;
  constructor(private lossesService: LossesService, private toastyService: ToastyService,
    private toastyConfig: ToastyConfig, private phastCompareService: PhastCompareService ) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.position = 'bottom-right';
  }

  ngOnInit() {
    this.lossesTabs = this.lossesService.lossesTabs;
    this._modifications = new Array<Modification>();
    if (!this.phast.losses) {
      //initialize losses
      this.phast.losses = {};
    } else {
      this.phast.disableSetupDialog = true;
    }
    if (this.phast.modifications) {
      this._modifications = (JSON.parse(JSON.stringify(this.phast.modifications)));
      if (this._modifications.length != 0) {
        this.modificationExists = true;
      }
    }

    this.lossesService.lossesTab.subscribe(val => {
      this.changeField('default');     
      this.selectedTab = _.find(this.lossesTabs, (t) => {return val == t.step });
    })
    this.lossesService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    })

    if (!this.inSetup) {
      this.baselineSelected = false;
      this.modificationSelected = true;
    }

    if (this.modificationExists && this.inSetup) {
      let toastOptions: ToastOptions = {
        title: 'Baseline is locked since there are modifications in use. If you wish to change your baseline data, use the Assessment tab.',
        showClose: true,
        theme: 'default',
        timeout: 10000000
      }
      this.toastyService.warning(toastOptions);
    }
    this.phastCompareService.setCompareVals(this.phast, this.modificationIndex);
  }

  ngOnDestroy() {
    // this.lossesService.lossesTab.next('charge-material');
    this.toastyService.clearAll();
  }

  changeField($event) {
    this.currentField = $event;
  }
  
  saveModifications() {
    if (this._modifications) {
      this.phast.modifications = (JSON.parse(JSON.stringify(this._modifications)));
      this.phastCompareService.setCompareVals(this.phast, this.modificationIndex);
      this.saved.emit(true);
      this.showEditModification = false;
      this.editModification = null;
      this.toggleCalculate = !this.toggleCalculate;
      if (this._modifications.length != 0) {
        this.modificationExists = true;
      } else {
        this.modificationExists = false;
      }
    } else {
      this.modificationExists = false;
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
    this.addModificationModal.hide();
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
        this.phastCompareService.setCompareVals(this.phast, this.modificationIndex);
        this.saveModifications();
        return;
      } else {
        tmpIndex++;
      }
    });
    this.isDropdownOpen = false;
  }

  addLoss() {
    this.phast.disableSetupDialog = true;
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
    this.phast.disableSetupDialog = true;
  }

  lossesSetup() {
    this.saved.emit(true);
    this.isLossesSetup = true;
  }

  openModal() {
    this.isModalOpen = true;
    this.addModificationModal.show();
  }

  closeModal() {
    this.isModalOpen = false;
    this.addModificationModal.hide();
  }

  cancelEdit(){
    this.showEditModification = false;
  }
}
