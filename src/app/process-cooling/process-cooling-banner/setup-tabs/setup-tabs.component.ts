import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProcessCoolingAssessment } from '../../../shared/models/process-cooling-assessment';
import { Settings } from '../../../shared/models/settings';
import { ProcessCoolingService, ProcessCoolingSetupTabString } from '../../process-cooling.service';

@Component({
  selector: 'app-setup-tabs',
  standalone: false,
  templateUrl: './setup-tabs.component.html',
  styleUrl: './setup-tabs.component.css'
})
export class SetupTabsComponent {

  setupTabSub: Subscription;
  setupTab: ProcessCoolingSetupTabString;
  disabledSetupTabs: Array<ProcessCoolingSetupTabString>;
  disableTabs: boolean;
  canContinue: boolean;
  assessmentSettingsClassStatus: Array<string> = [];
  assessmentSettingsBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  systemInformationClassStatus: Array<string> = [];
  systemInformationBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  inventoryStatus: Array<string> = [];
  inventoryBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  processCoolingAssessmentSub: Subscription;
  settingsSub: Subscription;
  settings: Settings;
  constructor(private processCoolingAssessmentService: ProcessCoolingService) { }

  ngOnInit(): void {
    this.settingsSub = this.processCoolingAssessmentService.settings.subscribe(val => {
      this.settings = val;
      this.disabledSetupTabs = [];
      this.setTabStatus();
    });


    this.setupTabSub = this.processCoolingAssessmentService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.disabledSetupTabs = [];
      this.setTabStatus();
    });

    this.processCoolingAssessmentSub = this.processCoolingAssessmentService.processCooling.subscribe(val => {
      this.disabledSetupTabs = [];
      this.setTabStatus();
    });
  }

  setTabStatus() {
    let hasValidSystemBasics: boolean = false;
    let hasValidInventory: boolean = false;
    let canViewInventory: boolean = false;


    let processCoolingAssessment: ProcessCoolingAssessment = this.processCoolingAssessmentService.processCooling.getValue();
    if (processCoolingAssessment && this.settings) {
      canViewInventory = hasValidSystemBasics;
    }
    this.setSystemBasicsStatus();
    this.setInventoryStatus(hasValidInventory, canViewInventory);


    if ((hasValidInventory || hasValidSystemBasics) || (this.setupTab == 'assessment-settings')) {
      this.canContinue = true;
    } else {
      this.canContinue = false;
    }

  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.processCoolingAssessmentSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  changeSetupTab(str: ProcessCoolingSetupTabString) {
    if (!this.disabledSetupTabs.includes(str)) {
      this.processCoolingAssessmentService.setupTab.next(str);
    }
  }

  setSystemBasicsStatus() {
    if (this.setupTab == "assessment-settings") {
      this.assessmentSettingsClassStatus = ["active"];
    } else {
      this.assessmentSettingsClassStatus = [];
    }
  }

    setInventoryStatus(hasValidCompressors: boolean, canViewInventory: boolean) {
    this.inventoryStatus = [];
    if (!canViewInventory) {
      this.inventoryStatus.push('disabled');
      this.disabledSetupTabs.push('inventory')
    }
    if (canViewInventory && !hasValidCompressors) {
      this.inventoryStatus.push("missing-data");
    }
    if (this.setupTab == "inventory") {
      this.inventoryStatus.push("active");
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
    this.processCoolingAssessmentService.continue();
  }

  back() {
    this.processCoolingAssessmentService.back();
  }

}
