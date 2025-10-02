import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { DayTypeService } from '../../day-types/day-type.service';
import { InventoryService } from '../../inventory/inventory.service';
import { SystemInformationFormService } from '../../system-information/system-information-form.service';

@Component({
    selector: 'app-setup-tabs',
    templateUrl: './setup-tabs.component.html',
    styleUrls: ['./setup-tabs.component.css'],
    standalone: false
})
export class SetupTabsComponent implements OnInit {

  setupTabSub: Subscription;
  setupTab: string;
  disabledSetupTabs: Array<string>;
  disableTabs: boolean;
  canContinue: boolean;

  systemBasicsClassStatus: Array<string> = [];
  systemBasicsBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  systemInformationClassStatus: Array<string> = [];
  systemInformationBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  dayTypesClassStatus: Array<string> = [];
  dayTypesBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  endUsesStatus: Array<string> = [];
  endUsesBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  inventoryStatus: Array<string> = [];
  inventoryBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  systemProfileStatus: Array<string> = [];
  systemProfileBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  profileTab: string;
  profileTabSub: Subscription;
  compressedAirAssessmentSub: Subscription;
  settingsSub: Subscription;
  settings: Settings;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private dayTypeService: DayTypeService, private systemInformationFormService: SystemInformationFormService, private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.settingsSub = this.compressedAirAssessmentService.settings.subscribe(val => {
      this.settings = val;
      this.disabledSetupTabs = [];
      this.setTabStatus();
    });
    this.setupTabSub = this.compressedAirAssessmentService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.disabledSetupTabs = [];
      this.setTabStatus();
    });

    this.profileTabSub = this.compressedAirAssessmentService.profileTab.subscribe(val => {
      this.profileTab = val;
    });

    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.disabledSetupTabs = [];
      this.setTabStatus();
    });
  }

  setTabStatus() {
    let hasValidDayTypes: boolean = false;
    let hasValidSystemInformation: boolean = false;
    let hasValidCompressors: boolean = false;
    // TODO when validation in
    let hasValidSystemProfile: boolean = true;
    let hasValidEndUses: boolean = true;

    let canViewInventory: boolean = false;
    let canViewDayTypes: boolean = false;
    let canViewSystemProfile: boolean = false;
    let canViewEndUses: boolean = false;

    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (compressedAirAssessment && this.settings) {
      hasValidSystemInformation = this.systemInformationFormService.getFormFromObj(compressedAirAssessment.systemInformation, this.settings).valid;
      hasValidCompressors = this.inventoryService.hasValidCompressors(compressedAirAssessment);
      hasValidDayTypes = this.dayTypeService.hasValidDayTypes(compressedAirAssessment.compressedAirDayTypes);
      hasValidSystemProfile = this.compressedAirAssessmentService.hasValidProfileSummaryData().isValid;
      canViewInventory = hasValidSystemInformation;
      canViewDayTypes = hasValidSystemInformation && hasValidCompressors;
      canViewSystemProfile = canViewDayTypes && hasValidDayTypes;
      canViewEndUses = canViewSystemProfile && hasValidSystemProfile;

    }
    this.setSystemBasicsStatus();
    this.setSystemInformationStatus(hasValidSystemInformation);
    this.setInventoryStatus(hasValidCompressors, canViewInventory);
    this.setDayTypesStatus(hasValidDayTypes, canViewDayTypes);
    this.setSystemProfileStatus(hasValidSystemProfile, canViewSystemProfile);
    this.setEndUsesStatus(hasValidEndUses, canViewEndUses);

    if ((hasValidDayTypes && hasValidSystemInformation && hasValidCompressors && hasValidSystemProfile && hasValidEndUses) || (this.setupTab == 'system-basics')) {
      this.canContinue = true;
    } else {
      this.canContinue = false;
    }

  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.profileTabSub.unsubscribe();
    this.compressedAirAssessmentSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  changeSetupTab(str: string) {
    if (!this.disabledSetupTabs.includes(str)) {
      this.compressedAirAssessmentService.setupTab.next(str);
    }
  }

  setSystemBasicsStatus() {
    if (this.setupTab == "system-basics") {
      this.systemBasicsClassStatus = ["active"];
    } else {
      this.systemBasicsClassStatus = [];
    }
  }

  setSystemInformationStatus(hasValidSystemInformation: boolean) {
    this.systemInformationClassStatus = [];
    if (!hasValidSystemInformation) {
      this.systemInformationClassStatus.push("missing-data");
    }
    if (this.setupTab == "system-information") {
      this.systemInformationClassStatus.push("active");
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

  setDayTypesStatus(hasValidDayTypes: boolean, canViewDayTypes: boolean) {
    this.dayTypesClassStatus = [];
    if (!canViewDayTypes) {
      this.dayTypesClassStatus.push("disabled");
      this.disabledSetupTabs.push('day-types');
    }
    if (canViewDayTypes && !hasValidDayTypes) {
      this.dayTypesClassStatus.push("missing-data");
    }
    if (this.setupTab == "day-types") {
      this.dayTypesClassStatus.push("active");
    }
  }

  setSystemProfileStatus(hasValidSystemProfile: boolean, canViewSystemProfile: boolean) {
    this.systemProfileStatus = [];
    if (!canViewSystemProfile) {
      this.systemProfileStatus.push("disabled");
      this.disabledSetupTabs.push('system-profile');
    }
    if (canViewSystemProfile && !hasValidSystemProfile) {
      this.systemProfileStatus.push('missing-data');
    }
    if (this.setupTab == "system-profile") {
      this.systemProfileStatus.push("active");
    }
  }

  setEndUsesStatus(hasValidEndUses: boolean, canViewEndUses: boolean) {
    this.endUsesStatus = [];
    if (!canViewEndUses) {
      this.endUsesStatus.push("disabled");
      this.disabledSetupTabs.push('end-uses');
    }
    if (canViewEndUses && !hasValidEndUses) {
      this.endUsesStatus.push('missing-data');
    }

    if (this.setupTab == "end-uses") {
      this.endUsesStatus.push("active");
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

  changeProfileTab(str: string) {
    this.compressedAirAssessmentService.profileTab.next(str);
  }

  continue() {
    this.compressedAirAssessmentService.continue();
  }

  back() {
    this.compressedAirAssessmentService.back();
  }

  continueProfileTab() {
    if(this.profileTab == 'setup') {
      this.changeProfileTab('summary');
    } else if (this.profileTab == 'summary') {      
      this.changeProfileTab('graphs');
    } else if (this.profileTab == 'graphs') {
      this.changeProfileTab('annual-summary');
    } else if (this.profileTab == 'annual-summary') {
      this.changeProfileTab('compressor-summary');
    } 
  }

  backProfileTab() {
    if(this.profileTab == 'compressor-summary') {
      this.changeProfileTab('annual-summary');
    } else if (this.profileTab == 'annual-summary') {      
      this.changeProfileTab('graphs');
    } else if (this.profileTab == 'graphs') {
      this.changeProfileTab('summary');
    } else if (this.profileTab == 'summary') {
      this.changeProfileTab('setup');
    } 
  }

}
