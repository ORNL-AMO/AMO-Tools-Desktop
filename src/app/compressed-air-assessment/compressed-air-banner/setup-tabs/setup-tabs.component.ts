import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
  selector: 'app-setup-tabs',
  templateUrl: './setup-tabs.component.html',
  styleUrls: ['./setup-tabs.component.css']
})
export class SetupTabsComponent implements OnInit {

  setupTabSub: Subscription;
  setupTab: string;

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
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.setupTabSub = this.compressedAirAssessmentService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.setSystemBasicsStatus();
      this.setSystemInformationStatus();
      this.setDayTypesStatus();
      this.setEndUsesStatus();
      this.setInventoryStatus();
    });
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
  }

  changeSetupTab(str: string) {
    this.compressedAirAssessmentService.setupTab.next(str);
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

  setDayTypesStatus() {
    if (this.setupTab == "day-types") {
      this.dayTypesClassStatus = ["active"];
    } else {
      this.dayTypesClassStatus = [];
    }
  }

  setEndUsesStatus() {
    if (this.setupTab == "end-uses") {
      this.endUsesStatus = ["active"];
    } else {
      this.endUsesStatus = [];
    }
  }

  setInventoryStatus() {
    if (this.setupTab == "inventory-status") {
      this.inventoryStatus = ["active"];
    } else {
      this.inventoryStatus = [];
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
