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
  @ViewChild('addModificationModal') public addModificationModal: ModalDirective;
  @ViewChild('editModificationModal') public editModificationModal: ModalDirective;
  @ViewChild('changeModificationModal') public changeModificationModal: ModalDirective;
  @ViewChild('addNewModal') public addNewModal: ModalDirective;
  @ViewChild('deleteModal') public deleteModal: ModalDirective;
  @ViewChild('renameModal') public renameModal: ModalDirective;

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
  lossTabSubscription: Subscription;
  modalOpenSubscrition: Subscription;
  openModificationModalSubscription: Subscription;
  openNewModalSubscription: Subscription;
  openDeleteModalSubscription: Subscription;
  openRenameModalSubscription: Subscription;
  newModificationName: string;
  changeName: string;
  constructor(private lossesService: LossesService, private toastyService: ToastyService,
    private toastyConfig: ToastyConfig, private phastCompareService: PhastCompareService) {
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

    this.lossTabSubscription = this.lossesService.lossesTab.subscribe(val => {
      this.changeField('default');
      this.selectedTab = _.find(this.lossesTabs, (t) => { return val == t.step });
    })
    this.modalOpenSubscrition = this.lossesService.modalOpen.subscribe(val => {
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
    this.lossesService.updateTabs.next(true);

    this.openModificationModalSubscription = this.lossesService.openModificationModal.subscribe(val => {
      if (val) {
        this.selectModificationModal();
      }
    })
    this.openNewModalSubscription = this.lossesService.openNewModal.subscribe(val => {
      if (val) {
        this.newModification();
      }
    })

    this.openDeleteModalSubscription = this.lossesService.openDeleteModal.subscribe(val => {
      if (val) {
        this.deleteModificaiton();
      }
    })

    this.openRenameModalSubscription = this.lossesService.openRenameModal.subscribe(val => {
      if (val) {
        this.renameModification();
      }
    })

  }

  ngOnDestroy() {
    // this.lossesService.lossesTab.next('charge-material');
    this.toastyService.clearAll();
    this.phastCompareService.setNoModification();
    this.lossTabSubscription.unsubscribe();
    this.modalOpenSubscrition.unsubscribe();
    this.openModificationModalSubscription.unsubscribe();
    this.openNewModalSubscription.unsubscribe();
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

  saveNewMod(tmpModification: Modification) {
    this._modifications.unshift(tmpModification);
    this.modificationIndex = 0;
    this.modificationSelected = true;
    this.baselineSelected = false;
    this.saveModifications();
    this.closeNewModification();
  }

  deleteModification() {
    this._modifications.splice(this.modificationIndex, 1);
    this.modificationIndex = 0;
    this.showEditModification = false;
    this.editModification = null;
    this.saveModifications();
    this.closeDeleteModification();
  }

  toggleDropdown() {
    if (this.modificationSelected) {
      this.showEditModification = false;
      this.isDropdownOpen = !this.isDropdownOpen;
      this.showNotes = false;
      this.editModificationModal.show();
    }
  }

  hideEditModificaiton() {
    this.editModificationModal.hide();
  }

  selectModification(index: number) {
    this.modificationIndex = index;
    this.phastCompareService.setCompareVals(this.phast, this.modificationIndex);
    this.saveModifications();
    this.closeSelectModification();
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

  cancelEdit() {
    this.showEditModification = false;
  }


  selectModificationModal() {
    this.isModalOpen = true;
    this.changeModificationModal.show();
  }
  closeSelectModification() {
    this.isModalOpen = false;
    this.lossesService.openModificationModal.next(false);
    this.changeModificationModal.hide();
  }
  renameModification() {
    this.changeName = this._modifications[this.modificationIndex].phast.name;
    this.isModalOpen = true;
    this.renameModal.show();
  }
  updateName() {
    this._modifications[this.modificationIndex].phast.name = this.changeName;
    this.saveModifications();
    this.closeRenameModification();
  }
  closeRenameModification() {
    this.isModalOpen = false;
    this.lossesService.openRenameModal.next(false);
    this.renameModal.hide();
  }
  deleteModificaiton() {
    this.isModalOpen = true;
    this.deleteModal.show();
  }
  closeDeleteModification() {
    this.isModalOpen = false;
    this.lossesService.openDeleteModal.next(false);
    this.deleteModal.hide();
  }
  newModification() {
    this.isModalOpen = true;
    this.addNewModal.show();
  }
  closeNewModification() {
    this.isModalOpen = false;
    this.lossesService.openNewModal.next(false);
    this.addNewModal.hide();
  }


}
