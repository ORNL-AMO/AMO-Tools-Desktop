import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { WaterAssessmentService, WaterSetupTabString, WaterUsingSystemTabString } from '../../water-assessment.service';
import { WaterAssessment } from '../../../shared/models/water-assessment';

@Component({
  selector: 'app-setup-tabs',
  templateUrl: './setup-tabs.component.html',
  styleUrl: './setup-tabs.component.css'
})
export class SetupTabsComponent {

  setupTabSub: Subscription;
  waterUsingSystemTabSub: Subscription;
  setupTab: WaterSetupTabString;
  waterUsingSystemTab: WaterUsingSystemTabString;
  disabledSetupTabs: Array<string>;
  disableTabs: boolean;
  canContinue: boolean;

  systemBasicsClassStatus: Array<string> = [];
  intakeSourceClassStatus: Array<string> = [];
  dischargeOutletClassStatus: Array<string> = [];
  waterUsingSystemClassStatus: Array<string> = [];
  wasteTreatmentClassStatus: Array<string> = [];
  
  systemBasicsBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  intakeSourceBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  dischargeOutletBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  waterUsingSystemBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  wasteTreatmentBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  waterAssessmentSub: Subscription;
  settingsSub: Subscription;
  settings: Settings;

  hasWaterTreatments: boolean;
  hasWasteWaterTreatments: boolean;
  constructor(private waterAssessmentService: WaterAssessmentService) { }

  ngOnInit(): void {
    this.settingsSub = this.waterAssessmentService.settings.subscribe(val => {
      this.settings = val;
      this.disabledSetupTabs = [];
      this.setTabStatus();
    });
    this.setupTabSub = this.waterAssessmentService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.disabledSetupTabs = [];
      this.setTabStatus();
    });

    this.waterUsingSystemTabSub = this.waterAssessmentService.waterUsingSystemTab.subscribe(val => {
      this.waterUsingSystemTab = val;
    });

    this.waterAssessmentSub = this.waterAssessmentService.waterAssessment.subscribe(val => {
      this.disabledSetupTabs = [];
      this.setTabStatus();
    });
  }

  setTabStatus() {
    // let hasValidSystemBasics: boolean = false;
    let hasValidSystemBasics: boolean = true;
    // let canViewInventory: boolean = false;

    let waterAssessment: WaterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    if (waterAssessment && this.settings) {
      // hasValidSystemBasics = _____
      // canView_____
      this.hasWaterTreatments = this.waterAssessmentService.getHasWaterTreatments();
      this.hasWasteWaterTreatments = this.waterAssessmentService.getHasWasteWaterTreatments();
    }
    this.setSystemBasicsStatus();
    this.setIntakeSourceStatus();
    this.setDischargeOutletStatus();
    this.setWaterUsingSystemStatus();
    this.setWasteTreatmentStatus();

    if ((hasValidSystemBasics) || (this.setupTab == 'system-basics')) {
      this.canContinue = true;
    } else {
      this.canContinue = false;
    }

  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.waterAssessmentSub.unsubscribe();
    this.waterUsingSystemTabSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  changeSetupTab(tab: WaterSetupTabString) {
    let canDisplayTab: boolean = tab !== 'waste-water-treatment' || (tab === 'waste-water-treatment' && this.hasWasteWaterTreatments);
    if (canDisplayTab) {
      this.waterAssessmentService.setupTab.next(tab);
    }
  }

  changeWaterUsingSystemTab(tab: WaterUsingSystemTabString) {
    let canDisplayTab: boolean = tab !== 'water-treatment' || (tab === 'water-treatment' && this.hasWaterTreatments);
    if (canDisplayTab) {
      this.waterAssessmentService.waterUsingSystemTab.next(tab);
    }
  }

  continueWaterUsingSystemTab() {
    if(this.waterUsingSystemTab == 'system') {
      this.changeWaterUsingSystemTab('added-energy');
    } else if (this.waterUsingSystemTab == 'added-energy') {      
      this.changeWaterUsingSystemTab('water-treatment');
    }
  }

  backWaterUsingSystemTab() {
    if (this.waterUsingSystemTab == 'water-treatment') {      
      this.changeWaterUsingSystemTab('added-energy');
    } else if (this.waterUsingSystemTab == 'added-energy') {
      this.changeWaterUsingSystemTab('system');
    }
  }

  setSystemBasicsStatus() {
    if (this.setupTab == "system-basics") {
      this.systemBasicsClassStatus = ["active"];
    } else {
      this.systemBasicsClassStatus = [];
    }
  }

  setIntakeSourceStatus() {
    if (this.setupTab == "water-intake") {
      this.intakeSourceClassStatus = ["active"];
    } else {
      this.intakeSourceClassStatus = [];
    }
  }

  setDischargeOutletStatus() {
    if (this.setupTab == "water-discharge") {
      this.dischargeOutletClassStatus = ["active"];
    } else {
      this.dischargeOutletClassStatus = [];
    }
  }
  

  setWaterUsingSystemStatus() {
    if (this.setupTab == "water-using-system") {
      this.waterUsingSystemClassStatus = ["active"];
    } else {
      this.waterUsingSystemClassStatus = [];
    }
  }

  setWasteTreatmentStatus() {
    if (this.setupTab == "waste-water-treatment") {
      this.wasteTreatmentClassStatus = ["active"];
    } else {
      this.wasteTreatmentClassStatus = [];
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
    this.waterAssessmentService.continue();
  }

  back() {
    this.waterAssessmentService.back();
  }

}
