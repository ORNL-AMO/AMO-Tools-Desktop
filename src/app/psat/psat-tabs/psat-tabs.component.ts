import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PsatService } from '../psat.service';
import { PSAT } from '../../shared/models/psat';
import { Subscription } from 'rxjs';
import { CompareService } from '../compare.service';
import { Settings } from '../../shared/models/settings';
import { PsatTabService } from '../psat-tab.service';
import { PsatWarningService, PumpFluidWarnings, MotorWarnings, FieldDataWarnings, OperationsWarnings } from '../psat-warning.service';
import { UntypedFormGroup } from '@angular/forms';
import { PumpFluidService } from '../pump-fluid/pump-fluid.service';
import { MotorService } from '../motor/motor.service';
import { FieldDataService } from '../field-data/field-data.service';
import { PumpOperationsService } from '../pump-operations/pump-operations.service';

@Component({
  selector: 'app-psat-tabs',
  templateUrl: './psat-tabs.component.html',
  styleUrls: ['./psat-tabs.component.css']
})
export class PsatTabsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  psat: PSAT;

  operationsTabStatus: Array<string> = [];
  settingsClassStatus: Array<string> = [];
  pumpFluidClassStatus: Array<string> = [];
  motorClassStatus: Array<string> = [];
  fieldDataClassStatus: Array<string> = [];
  operationsBadge: { display: boolean, hover: boolean } = { display: false, hover: false }
  pumpFluidBadge: { display: boolean, hover: boolean } = { display: false, hover: false }
  motorBadge: { display: boolean, hover: boolean } = { display: false, hover: false }
  fieldDataBadge: { display: boolean, hover: boolean } = { display: false, hover: false }

  stepTab: String;
  currentTab: string;
  calcTab: string;
  mainTab: string;
  modSubscription: Subscription;
  selectedModification: PSAT;
  secondarySub: Subscription;
  calcSub: Subscription;
  mainSub: Subscription;
  getResultsSub: Subscription;
  stepTabSub: Subscription;
  tabsCollapsed: boolean = true;
  calcTabsCollapsed: boolean = true;

  constructor(private psatService: PsatService, private psatWarningService: PsatWarningService, private psatTabService: PsatTabService, private compareService: CompareService, private cd: ChangeDetectorRef,
    private pumpFluidService: PumpFluidService, private motorService: MotorService, private fieldDataService: FieldDataService, private pumpOperationsService: PumpOperationsService) { }

  ngOnInit() {
    this.secondarySub = this.psatTabService.secondaryTab.subscribe(val => {
      this.currentTab = val;
    })
    this.calcSub = this.psatTabService.calcTab.subscribe(val => {
      this.calcTab = val;
    })
    this.mainSub = this.psatTabService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
    this.modSubscription = this.compareService.selectedModification.subscribe(val => {
      this.selectedModification = val;
      this.cd.detectChanges();
    })

    this.getResultsSub = this.psatService.getResults.subscribe(val => {
      this.checkSettingsStatus();
      this.checkOperationsStatus()
      this.checkPumpFluidStatus();
      this.checkMotorStatus();
      this.checkFieldDataSatus();
    })
    this.stepTabSub = this.psatTabService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.checkSettingsStatus();
      this.checkOperationsStatus()
      this.checkPumpFluidStatus();
      this.checkMotorStatus();
      this.checkFieldDataSatus();
    })
  }

  ngOnDestroy() {
    this.secondarySub.unsubscribe();
    this.calcSub.unsubscribe();
    this.mainSub.unsubscribe();
    this.modSubscription.unsubscribe();
  }

  changeTab(str: string) {
    this.psatTabService.secondaryTab.next(str);
    this.collapseTabs();
  }

  changeCalcTab(str: string) {
    this.psatTabService.calcTab.next(str);
    this.collapseCalcTabs();
  }

  selectModification() {
    this.compareService.openModificationModal.next(true);
    this.collapseTabs();
  }

  checkPumpFluidInvalid(): boolean {
    let tmpForm: UntypedFormGroup = this.pumpFluidService.getFormFromObj(this.psat.inputs);
    return tmpForm.invalid;
  }

  checkMotorInvalid() {
    let tmpForm: UntypedFormGroup = this.motorService.getFormFromObj(this.psat.inputs);
    return tmpForm.invalid;
  }

  checkFieldDataInvalid(): boolean {
    let tmpForm: UntypedFormGroup = this.fieldDataService.getFormFromObj(this.psat.inputs, true, this.psat.inputs.whatIfScenario);
    return tmpForm.invalid;
  }
 
  checkOperationsInvalid(): boolean {
    let tmpForm: UntypedFormGroup = this.pumpOperationsService.getFormFromObj(this.psat.inputs);
    return tmpForm.invalid;
  }

  changeSubTab(str: string) { 
    if (str == 'motor') {
      let tmpBool = this.checkPumpFluidInvalid();
      if (!tmpBool == true) {
        this.psatTabService.stepTab.next(str);
      }
    } else if (str == 'field-data') {
      let tmpBool = this.checkMotorInvalid();
      if (!tmpBool == true) {
        this.psatTabService.stepTab.next(str);
      }
    } else {
      this.psatTabService.stepTab.next(str);
    }
  }

  checkSettingsStatus() {
    if (this.stepTab == 'system-basics') {
      this.settingsClassStatus = ['active', 'success'];
    } else {
      this.settingsClassStatus = ['success'];
    }
  }

  
  checkOperationsStatus() {
    let operationsInvalid: boolean = this.checkOperationsInvalid();
    let operationsWarnings: OperationsWarnings = this.psatWarningService.checkPumpOperations(this.psat, this.settings, true);
    let checkWarnings: boolean = this.psatWarningService.checkWarningsExist(operationsWarnings);
    if (operationsInvalid) {
      this.operationsTabStatus = ['missing-data'];
    } else if (checkWarnings) {
      this.operationsTabStatus = ['input-error'];
    } else {
      this.operationsTabStatus = ['success'];
    }
    if (this.stepTab == 'operations') {
      this.operationsTabStatus.push('active');
    }
  }

  checkPumpFluidStatus() {
    let pumpFluidInvalid: boolean = this.checkPumpFluidInvalid();
    let pumpFluidWarnings: PumpFluidWarnings = this.psatWarningService.checkPumpFluidWarnings(this.psat, this.settings);
    let checkWarnings: boolean = this.psatWarningService.checkWarningsExist(pumpFluidWarnings);
    if (pumpFluidInvalid) {
      this.pumpFluidClassStatus = ['missing-data'];
    } else if (checkWarnings) {
      this.pumpFluidClassStatus = ['input-error'];
    } else {
      this.pumpFluidClassStatus = ['success'];
    }
    if (this.stepTab == 'pump-fluid') {
      this.pumpFluidClassStatus.push('active');
    }
  }

  checkMotorStatus() {
    let pumpFluidInvalid: boolean = this.checkPumpFluidInvalid();
    let motorInvalid: boolean = this.checkMotorInvalid();
    let isMod: boolean;
    if (this.psat.modifications !== undefined && this.psat.modifications !== null) {
      isMod = false;
    }
    else {
      isMod = true;
    }
    let motorWarnings: MotorWarnings = this.psatWarningService.checkMotorWarnings(this.psat, this.settings, isMod);
    let checkWarnings: boolean = this.psatWarningService.checkWarningsExist(motorWarnings);
    if (pumpFluidInvalid) {
      this.motorClassStatus = ['disabled'];
    } else if (motorInvalid) {
      this.motorClassStatus = ['missing-data'];
    } else if (checkWarnings) {
      this.motorClassStatus = ['input-error'];
    } else {
      this.motorClassStatus = ['success'];
    }
    if (this.stepTab == 'motor') {
      this.motorClassStatus.push('active');
    }
  }

  checkFieldDataSatus() {
    let pumpFluidInvalid: boolean = this.checkPumpFluidInvalid();
    let motorInvalid: boolean = this.checkMotorInvalid();
    let fieldDataInvalid: boolean = this.checkFieldDataInvalid();
    let fieldDataWarnings: FieldDataWarnings = this.psatWarningService.checkFieldData(this.psat, this.settings, true);
    let checkWarnings: boolean = this.psatWarningService.checkWarningsExist(fieldDataWarnings);
    if (pumpFluidInvalid || motorInvalid) {
      this.fieldDataClassStatus = ['disabled'];
    } else if (fieldDataInvalid) {
      this.fieldDataClassStatus = ['missing-data'];
    } else if (checkWarnings) {
      this.fieldDataClassStatus = ['input-error'];
    } else {
      this.fieldDataClassStatus = ['success'];
    }
    if (this.stepTab == 'field-data') {
      this.fieldDataClassStatus.push('active');
    }
  }

  showTooltip(badge: { display: boolean, hover: boolean }) {
    badge.hover = true;
    setTimeout(() => {
      this.checkHover(badge);
    }, 1000);
  }

  hideTooltip(badge: { display: boolean, hover: boolean }) {
    badge.hover = false;
    badge.display = false;
  }

  checkHover(badge: { display: boolean, hover: boolean }) {
    if (badge.hover) {
      badge.display = true;
    } else {
      badge.display = false;
    }
  }

  continue() {
    this.psatTabService.continue();
  }

  back() {
    this.psatTabService.back();
  }

  getCanContinue() {
    if (this.stepTab == 'system-basics') {
      return true;
    }
    else if (this.stepTab == 'pump-fluid') {
      let tmpForm: UntypedFormGroup = this.pumpFluidService.getFormFromObj(this.psat.inputs);
      return tmpForm.valid;
    } else if (this.stepTab == 'motor') {
      let tmpForm: UntypedFormGroup = this.motorService.getFormFromObj(this.psat.inputs);
      return tmpForm.valid;
    } else if (this.stepTab == 'field-data') {
      let tmpForm: UntypedFormGroup = this.fieldDataService.getFormFromObj(this.psat.inputs, true, this.psat.inputs.whatIfScenario);
      return tmpForm.valid;
    }
  }

  collapseTabs() {
    this.tabsCollapsed = !this.tabsCollapsed;
  }
  collapseCalcTabs() {
    this.calcTabsCollapsed = !this.calcTabsCollapsed;
  }
}
