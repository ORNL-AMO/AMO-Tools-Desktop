import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { PlantIntakeDischargeTab, WaterAssessmentService, WaterSetupTabString, WaterUsingSystemTabString } from '../../water-assessment.service';
import { WaterAssessment } from '../../../shared/models/water-assessment';
import { WaterSystemComponentService } from '../../water-system-component.service';
import { WaterProcessComponentType } from '../../../../process-flow-types/shared-process-flow-types';

@Component({
  selector: 'app-setup-tabs',
  templateUrl: './setup-tabs.component.html',
  styleUrl: './setup-tabs.component.css'
})
export class SetupTabsComponent {

  setupTabSub: Subscription;
  setupTab: WaterSetupTabString;

  waterUsingSystemTabSub: Subscription;
  waterUsingSystemTab: WaterUsingSystemTabString;
  
  intakeSourceTabSub: Subscription;
  intakeSourceTab: PlantIntakeDischargeTab;

  dischargeOutletTabSub: Subscription;
  dischargeOutletTab: PlantIntakeDischargeTab;

  disabledSetupTabs: Array<string>;
  disableTabs: boolean;
  canContinue: boolean;

  systemBasicsClassStatus: Array<string> = [];
  intakeSourceClassStatus: Array<string> = [];
  dischargeOutletClassStatus: Array<string> = [];
  waterTreatmentClassStatus: Array<string> = [];
  waterUsingSystemClassStatus: Array<string> = [];
  wasteTreatmentClassStatus: Array<string> = [];
  
  systemBasicsBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  intakeSourceBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  dischargeOutletBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  waterTreatmentBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  waterUsingSystemBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  wasteTreatmentBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  waterAssessmentSub: Subscription;
  settingsSub: Subscription;
  settings: Settings;

  hasWaterTreatments: boolean;
  hasWasteWaterTreatments: boolean;
  constructor(private waterAssessmentService: WaterAssessmentService, 
    private waterSystemComponentService: WaterSystemComponentService,
  ) { }

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

    this.intakeSourceTabSub = this.waterAssessmentService.intakeSourceTab.subscribe(val => {
      this.intakeSourceTab = val;
    });

    this.dischargeOutletTabSub = this.waterAssessmentService.dischargeOutletTab.subscribe(val => {
      this.dischargeOutletTab = val;
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
    this.setWaterTreatmentStatus();
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
    let canTreatment = (tab === 'water-treatment' && this.hasWaterTreatments)
    let canWasteTreatment = (tab === 'waste-water-treatment' && this.hasWasteWaterTreatments)
    let canDisplayTab: boolean = (tab !== 'waste-water-treatment' && tab !== 'water-treatment') || canTreatment || canWasteTreatment;
    if (canDisplayTab) {
      // todo 7069 whatever event was causing this to be needed seems obsolete
      // this.waterSystemComponentService.setSelectedComponentOnTabChange(this.waterAssessmentService.waterAssessment.getValue(), tab as WaterProcessComponentType);
      this.waterAssessmentService.setupTab.next(tab);
    }
  }

  
  // * Intake Source Sub Tabs
  changeIntakeSourceTab(tab: PlantIntakeDischargeTab) {
      this.waterAssessmentService.intakeSourceTab.next(tab);
  }

  continueIntakeSourceTab() {
    if(this.intakeSourceTab == 'data') {
      this.changeIntakeSourceTab('added-energy');
    } 
  }

  backIntakeSourceTab() {
    if (this.intakeSourceTab == 'added-energy') {
      this.changeIntakeSourceTab('data');
    }
  }

  // * Discharge Outlet Sub Tabs
  changeDischargeOutletTab(tab: PlantIntakeDischargeTab) {
    this.waterAssessmentService.dischargeOutletTab.next(tab);
  }

  continueDischargeOutletTab() {
    if (this.dischargeOutletTab == 'data') {
      this.changeDischargeOutletTab('added-energy');
    }
  }

  backDischargeOutletTab() {
    if (this.dischargeOutletTab == 'added-energy') {
      this.changeDischargeOutletTab('data');
    }
  }


  // * Water Using System Sub Tabs
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

  setWaterTreatmentStatus() {
    if (this.setupTab == "water-treatment") {
      this.waterTreatmentClassStatus = ["active"];
    } else {
      this.waterTreatmentClassStatus = [];
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
