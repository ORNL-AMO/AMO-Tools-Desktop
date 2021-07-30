import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from '../../inventory/inventory.service';

@Component({
  selector: 'app-setup-tabs',
  templateUrl: './setup-tabs.component.html',
  styleUrls: ['./setup-tabs.component.css']
})
export class SetupTabsComponent implements OnInit {

  setupTabSub: Subscription;
  setupTab: string;
  disabledSetupTabs: Array<string>;
  disableTabs: boolean;

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

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.setupTabSub = this.compressedAirAssessmentService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.disabledSetupTabs = [];
      let canAdvanceSetupTabs = this.inventoryService.hasValidCompressors();
      this.setTabStatus(canAdvanceSetupTabs);
    });

    this.profileTabSub = this.compressedAirAssessmentService.profileTab.subscribe(val => {
      this.profileTab = val;
    });

    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.disabledSetupTabs = [];
      let canAdvanceSetupTabs = this.inventoryService.hasValidCompressors();
      this.setTabStatus(canAdvanceSetupTabs);
    });
  }

  setTabStatus(canAdvanceSetupTabs: boolean) {
    let hasValidDayTypes = canAdvanceSetupTabs && this.inventoryService.hasValidDayTypes();
    this.setSystemBasicsStatus();
    this.setSystemInformationStatus();
    this.setInventoryStatus(canAdvanceSetupTabs);
    this.setDayTypesStatus(canAdvanceSetupTabs);
    this.setSystemProfileStatus(hasValidDayTypes);
    this.setEndUsesStatus(hasValidDayTypes);
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.profileTabSub.unsubscribe();
    this.compressedAirAssessmentSub.unsubscribe();
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

  setSystemInformationStatus() {
    if (this.setupTab == "system-information") {
      this.systemInformationClassStatus = ["active"];
    } else {
      this.systemInformationClassStatus = [];
    }
  }

  setInventoryStatus(canAdvanceSetupTabs: boolean) {
    if (this.setupTab == "inventory" && canAdvanceSetupTabs) {
      this.inventoryStatus = ["active"];
    } else if (!canAdvanceSetupTabs) {
      this.inventoryStatus = ["missing-data"];
    } else {
      this.inventoryStatus = [];
    }
  }

  setDayTypesStatus(canAdvanceSetupTabs: boolean) {
    if (!canAdvanceSetupTabs) {
      this.dayTypesClassStatus = ["disabled"];
      this.disabledSetupTabs.push('day-types');
    } else if (this.setupTab == "day-types") {
      this.dayTypesClassStatus = ["active"];
    } else {
      this.dayTypesClassStatus = [];
    }
  }

  setEndUsesStatus(canAdvanceSetupTabs: boolean) {
    if (!canAdvanceSetupTabs) {
      this.endUsesStatus = ["disabled"];
      this.disabledSetupTabs.push('end-uses');
    } else if (this.setupTab == "end-uses") {
      this.endUsesStatus = ["active"];
    } else {
      this.endUsesStatus = [];
    }
  }

  setSystemProfileStatus(canAdvanceSetupTabs: boolean){
    if (!canAdvanceSetupTabs) {
      this.systemProfileStatus = ["disabled"];
      this.disabledSetupTabs.push('system-profile');
    } else if (this.setupTab == "system-profile") {
      this.systemProfileStatus = ["active"];
    } else {
      this.systemProfileStatus = [];
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

}
