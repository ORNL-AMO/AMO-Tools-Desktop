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
  baselineSelected: boolean = true;
  modificationSelected: boolean = false;
  selectedTab: LossTab;
  currentField: string = 'default';
  addLossToggle: boolean = false;
  showNotes: boolean = false;
  isLossesSetup: boolean;
  toggleCalculate: boolean = false;
  modificationExists: boolean = false;
  lossesTabs: Array<LossTab>;
  lossTabSubscription: Subscription;
  modalOpenSubscription: Subscription;
  isModalOpen: boolean = false;
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
    this.modalOpenSubscription = this.lossesService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    })
    this.lossesService.updateTabs.next(true);
    this.saveModifications(true);
  }


  ngOnDestroy() {
    this.toastyService.clearAll();
    if (this.lossTabSubscription) this.lossTabSubscription.unsubscribe();
    this.modalOpenSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.modificationIndex) {
      this.toggleCalculate = !this.toggleCalculate;
    }
  }

  changeField($event) {
    this.currentField = $event;
  }

  saveModifications(bool?: boolean) {
    if (this.phast.modifications[this.modificationIndex] && !bool) {
      if (this.phast.modifications[this.modificationIndex].exploreOpportunities) {
        this.phast.modifications[this.modificationIndex].exploreOpportunities = false;
      }
    }
    this.phastCompareService.setCompareVals(this.phast, this.modificationIndex, this.inSetup);
    this.saved.emit(true);
    this.toggleCalculate = !this.toggleCalculate;
    if (this.phast.modifications.length != 0) {
      this.modificationExists = true;
    } else {
      this.modificationExists = false;
    }
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

  hideSetupDialog() {
    this.saved.emit(true);
    this.phast.disableSetupDialog = true;
  }

  newModification() {
    this.lossesService.openNewModal.next(true);
  }
}
