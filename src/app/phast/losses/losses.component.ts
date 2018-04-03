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
import { Subscription } from 'rxjs';

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
  @Input()
  containerHeight: number;
  @Input()
  modificationIndex: number;

  // _modifications: Modification[];
  isDropdownOpen: boolean = false;
  baselineSelected: boolean = true;
  modificationSelected: boolean = false;
  selectedTab: LossTab;
  currentField: string = 'default';
  addLossToggle: boolean = false;
  isFirstChange: boolean = true;
  showNotes: boolean = false;

  isLossesSetup: boolean;
  showModal: boolean = false;

  isModalOpen: boolean = false;
  showAddBtn: boolean = true;
  toggleCalculate: boolean = false;
  modificationExists: boolean = false;
  lossesTabs: Array<LossTab>;
  lossTabSubscription: Subscription;
  modalOpenSubscrition: Subscription;
  selectedModificationSubscription: Subscription;
  changeName: string;
  constructor(private lossesService: LossesService, private toastyService: ToastyService,
    private toastyConfig: ToastyConfig, private phastCompareService: PhastCompareService) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.position = 'bottom-right';
  }

  ngOnInit() {
    this.lossesTabs = this.lossesService.lossesTabs;
    // this._modifications = new Array<Modification>();
    if (!this.phast.losses) {
      //initialize losses
      this.phast.losses = {};
    } else {
      this.phast.disableSetupDialog = true;
    }
    // this.selectedModificationSubscription = this.phastCompareService.selectedModification.subscribe(mod => {
    //   if (this.phast.modifications) {
    //     this._modifications = (JSON.parse(JSON.stringify(this.phast.modifications)));
    //   }
    //   if (mod) {
    //     this.modificationIndex = _.findIndex(this._modifications, (val) => {
    //       return val.phast.name == mod.name
    //     })
    //     if (this.modificationIndex != undefined) {
    //       this.modificationExists = true;
    //     }
    //   } else {
    //     this.modificationExists = false;
    //   }
    // })

    this.lossTabSubscription = this.lossesService.lossesTab.subscribe(val => {
      this.changeField('default');
      this.selectedTab = _.find(this.lossesTabs, (t) => { return val == t.step });
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
    // this.phastCompareService.setCompareVals(this.phast, this.modificationIndex);
    this.lossesService.updateTabs.next(true);
  }


  ngOnDestroy() {
    // this.lossesService.lossesTab.next('charge-material');
    this.toastyService.clearAll();
    // this.phastCompareService.setNoModification();
    if (this.lossTabSubscription) this.lossTabSubscription.unsubscribe();
    if (this.selectedModificationSubscription) this.selectedModificationSubscription.unsubscribe();
    if (this.modalOpenSubscrition) this.modalOpenSubscrition.unsubscribe();
  }

  changeField($event) {
    this.currentField = $event;
  }

  saveModifications() {
    // if (this._modifications) {
    //   this.phast.modifications = (JSON.parse(JSON.stringify(this._modifications)));
    this.phastCompareService.setCompareVals(this.phast, this.modificationIndex);
    this.saved.emit(true);
    this.toggleCalculate = !this.toggleCalculate;
    if (this.phast.modifications.length != 0) {
      this.modificationExists = true;
    } else {
      this.modificationExists = false;
    }
    // } else {
    //   this.modificationExists = false;
    // }
  }

  // saveNewMod(tmpModification: Modification) {
  //   this._modifications.unshift(tmpModification);
  //   this.modificationIndex = 0;
  //   this.modificationSelected = true;
  //   this.baselineSelected = false;
  //   this.saveModifications();
  //   this.closeNewModification();
  // }

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

  // dispEditModification(modification: Modification) {
  //   this.editModification = modification;
  //   this.showEditModification = true;
  // }

  hideSetupDialog() {
    this.saved.emit(true);
    this.phast.disableSetupDialog = true;
  }

  lossesSetup() {
    this.saved.emit(true);
    this.isLossesSetup = true;
  }

  // cancelEdit() {
  //   this.showEditModification = false;
  // }

  newModification() {
    this.lossesService.openNewModal.next(true);
  }
}
