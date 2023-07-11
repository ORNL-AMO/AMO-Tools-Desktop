import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { SsmtService } from '../ssmt.service';
import { SSMT } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { TurbineService } from '../turbine/turbine.service';
import { BoilerService } from '../boiler/boiler.service';
import { HeaderService } from '../header/header.service';
import { OperationsService } from '../operations/operations.service';

@Component({
  selector: 'app-ssmt-tabs',
  templateUrl: './ssmt-tabs.component.html',
  styleUrls: ['./ssmt-tabs.component.css']
})
export class SsmtTabsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  ssmt: SSMT;


  mainTab: string;
  mainTabSubscription: Subscription;
  stepTab: string;
  stepTabSubscription: Subscription;
  assessmentTab: string;
  assessmentTabSubscrption: Subscription;
  updateDataSubscription: Subscription;
  modelTab: string;
  modelTabSubscription: Subscription;

  settingsStatus: Array<string> = [];
  operationsTabStatus: Array<string> = [];
  boilerTabStatus: Array<string> = [];
  headerTabStatus: Array<string> = [];
  turbineTabStatus: Array<string> = [];

  modSubscription: Subscription;
  selectedModification: SSMT;
  settingsBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  operationsBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  boilerBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  headerBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  turbineBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  calcTab: string;
  calcTabSubscription: Subscription;

  tabsCollapsed: boolean = true;
  calcTabsCollapsed: boolean = true;

  constructor(private ssmtService: SsmtService, private compareService: CompareService, private cd: ChangeDetectorRef,
    private turbineService: TurbineService, private boilerService: BoilerService, private headerService: HeaderService,
    private operationsService: OperationsService) { }

  ngOnInit() {
    this.mainTabSubscription = this.ssmtService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.checkStepTabStatus();
    });
    this.stepTabSubscription = this.ssmtService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.checkStepTabStatus();
    });
    this.assessmentTabSubscrption = this.ssmtService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    });
    this.modelTabSubscription = this.ssmtService.steamModelTab.subscribe(val => {
      this.modelTab = val;
      this.checkStepTabStatus();
    });

    this.updateDataSubscription = this.ssmtService.updateData.subscribe(val => {
      this.checkStepTabStatus();
    });

    this.modSubscription = this.compareService.selectedModification.subscribe(val => {
      this.selectedModification = val;
      this.cd.detectChanges();
    });

    this.calcTabSubscription = this.ssmtService.calcTab.subscribe(val => {
      this.calcTab = val;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.assessmentTabSubscrption.unsubscribe();
    this.mainTabSubscription.unsubscribe();
    this.stepTabSubscription.unsubscribe();
    this.modelTabSubscription.unsubscribe();
    this.modSubscription.unsubscribe();
    this.updateDataSubscription.unsubscribe();
    this.calcTabSubscription.unsubscribe();
  }

  changeAssessmentTab(str: string) {
    this.ssmtService.assessmentTab.next(str);
    this.collapseTabs();
  }

  changeStepTab(str: string) {
    let boilerValid: boolean = this.boilerService.isBoilerValid(this.ssmt.boilerInput, this.settings);
    let headerValid: boolean = this.headerService.isHeaderValid(this.ssmt.headerInput, this.ssmt, this.settings, this.ssmt.boilerInput);
    let operationsValid: boolean = this.operationsService.getForm(this.ssmt, this.settings).valid;
    if (str === 'system-basics' || str === 'operations') {
      this.ssmtService.stepTab.next(str);
    }
    else if (str === 'boiler') {
      if (operationsValid) {
        this.ssmtService.stepTab.next(str);
      }
    } else if (str === 'header') {
      if (boilerValid && operationsValid) {
        this.ssmtService.stepTab.next(str);
      }
    } else if (str === 'turbine') {
      if (boilerValid && operationsValid && headerValid) {
        this.ssmtService.stepTab.next(str);
      }
    }
  }

  changeModelTab(str: string) {
    this.ssmtService.steamModelTab.next(str);
  }

  checkStepTabStatus() {
    this.checkOperationsStatus();
    this.checkSettingsStatus();
    this.checkBoilerStatus();
    this.checkHeaderStatus();
    this.checkTurbineStatus();
  }

  checkOperationsStatus() {
    let operationsValid: boolean = this.operationsService.getForm(this.ssmt, this.settings).valid;
    if (!operationsValid) {
      this.operationsTabStatus = ['missing-data'];
    } else if (this.stepTab === 'operations') {
      this.operationsTabStatus = ['success', 'active'];
    } else {
      this.operationsTabStatus = ['success'];
    }
  }

  checkSettingsStatus() {
    if (this.stepTab === 'system-basics') {
      this.settingsStatus = ['success', 'active'];
    } else {
      this.settingsStatus = ['success'];
    }
  }

  checkBoilerStatus() {
    let boilerValid: boolean = this.boilerService.isBoilerValid(this.ssmt.boilerInput, this.settings);
    let operationsValid: boolean = this.operationsService.getForm(this.ssmt, this.settings).valid;
    if (!operationsValid) {
      this.boilerTabStatus = ['disabled'];
    } else if (!boilerValid) {
      this.boilerTabStatus = ['missing-data'];
    } else {
      this.boilerTabStatus = ['success'];
    }

    if (this.stepTab === 'boiler') {
      this.boilerTabStatus.push('active');
    }
  }

  checkHeaderStatus() {
    let boilerValid: boolean = this.boilerService.isBoilerValid(this.ssmt.boilerInput, this.settings);
    let headerValid: boolean = this.headerService.isHeaderValid(this.ssmt.headerInput, this.ssmt, this.settings, this.ssmt.boilerInput);
    let operationsValid: boolean = this.operationsService.getForm(this.ssmt, this.settings).valid;
    if (!boilerValid || !operationsValid) {
      this.headerTabStatus = ['disabled'];
    } else if (!headerValid) {
      this.headerTabStatus = ['missing-data'];
    } else {
      this.headerTabStatus = ['success'];
    }

    if (this.stepTab === 'header') {
      this.headerTabStatus.push('active');
    }
  }

  checkTurbineStatus() {
    let boilerValid: boolean = this.boilerService.isBoilerValid(this.ssmt.boilerInput, this.settings);
    let headerValid: boolean = this.headerService.isHeaderValid(this.ssmt.headerInput, this.ssmt, this.settings, this.ssmt.boilerInput);
    let turbineValid: boolean = this.turbineService.isTurbineValid(this.ssmt.turbineInput, this.ssmt.headerInput, this.settings);
    let operationsValid: boolean = this.operationsService.getForm(this.ssmt, this.settings).valid;

    if (!boilerValid || !headerValid || !operationsValid) {
      this.turbineTabStatus = ['disabled'];
    } else if (!turbineValid) {
      this.turbineTabStatus = ['missing-data'];
    } else {
      this.turbineTabStatus = ['success'];
    }

    if (this.stepTab === 'turbine') {
      this.turbineTabStatus.push('active');
    }
  }

  selectModification() {
    this.ssmtService.openModificationSelectModal.next(true);
    this.collapseTabs();
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

  changeCalcTab(str: string) {
    this.ssmtService.calcTab.next(str);  
    this.collapseCalcTabs();
  }

  collapseTabs() {
    this.tabsCollapsed = !this.tabsCollapsed;
  }
  collapseCalcTabs() {
    this.calcTabsCollapsed = !this.calcTabsCollapsed;
  }

  continue() {
    this.ssmtService.continue();
  }

  back() {
    this.ssmtService.back();
  }

  getCanContinue() {
    if (this.stepTab === 'system-basics') {
      return true;
    } else if (this.stepTab === 'operations') {
      let isValid: boolean = this.operationsService.getForm(this.ssmt, this.settings).valid;
      if (isValid) {
        return true;
      } else {
        return false;
      }
    } else if (this.stepTab === 'boiler') {
      let isValid: boolean = this.boilerService.isBoilerValid(this.ssmt.boilerInput, this.settings);
      if (isValid) {
        return true;
      } else {
        return false;
      }
    } else if (this.stepTab === 'header') {
      let isValid: boolean = this.headerService.isHeaderValid(this.ssmt.headerInput, this.ssmt, this.settings, this.ssmt.boilerInput);
      if (isValid) {
        return true;
      } else {
        return false;
      }
    } else if (this.stepTab === 'turbine') {
      let isValid: boolean = this.turbineService.isTurbineValid(this.ssmt.turbineInput, this.ssmt.headerInput, this.settings);
      if (isValid) {
        return true;
      } else {
        return false;
      }
    }
  }

}
