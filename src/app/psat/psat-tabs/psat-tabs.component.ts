import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PsatService } from '../psat.service';
import { PSAT } from '../../shared/models/psat';
import { Subscription } from 'rxjs';
import { CompareService } from '../compare.service';
import { Settings } from '../../shared/models/settings';
import { PsatTabService } from '../psat-tab.service';
import { PsatWarningService, PumpFluidWarnings, MotorWarnings, FieldDataWarnings } from '../psat-warning.service';
import { FormGroup } from '@angular/forms';
import { PumpFluidService } from '../pump-fluid/pump-fluid.service';
import { MotorService } from '../motor/motor.service';
import { FieldDataService } from '../field-data/field-data.service';
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

  settingsClassStatus: Array<string> = [];
  pumpFluidClassStatus: Array<string> = [];
  motorClassStatus: Array<string> = [];
  fieldDataClassStatus: Array<string> = [];
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

  constructor(private psatService: PsatService, private psatWarningService: PsatWarningService, private psatTabService: PsatTabService, private compareService: CompareService, private cd: ChangeDetectorRef,
    private pumpFluidService: PumpFluidService, private motorService: MotorService, private fieldDataService: FieldDataService) { }

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
      this.checkPumpFluidStatus();
      this.checkMotorStatus();
      this.checkFieldDataSatus();
    })
    this.stepTabSub = this.psatTabService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.checkSettingsStatus();
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
  }

  changeCalcTab(str: string) {
    this.psatTabService.calcTab.next(str);
  }

  selectModification() {
    this.compareService.openModificationModal.next(true);
  }

  checkPumpFluidInvalid(): boolean {
    let tmpForm: FormGroup = this.pumpFluidService.getFormFromObj(this.psat.inputs);
    return tmpForm.invalid;
  }

  checkMotorInvalid() {
    let tmpForm: FormGroup = this.motorService.getFormFromObj(this.psat.inputs);
    return tmpForm.invalid;
  }

  checkFieldDataInvalid(): boolean {
    let tmpForm: FormGroup = this.fieldDataService.getFormFromObj(this.psat.inputs, true, this.psat.whatIfScenario);
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
}
