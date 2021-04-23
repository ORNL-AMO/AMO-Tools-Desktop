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
  systemProfileStatus: Array<string> = [];
  systemProfileBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  profileTab: string;
  profileTabSub: Subscription;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.setupTabSub = this.compressedAirAssessmentService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.setSystemBasicsStatus();
      this.setSystemInformationStatus();
      this.setDayTypesStatus();
      this.setEndUsesStatus();
      this.setInventoryStatus();
      this.setSystemProfileStatus();
    });

    this.profileTabSub = this.compressedAirAssessmentService.profileTab.subscribe(val => {
      this.profileTab = val;
    });
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.profileTabSub.unsubscribe();
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
    if (this.setupTab == "inventory") {
      this.inventoryStatus = ["active"];
    } else {
      this.inventoryStatus = [];
    }
  }

  setSystemProfileStatus(){
    if (this.setupTab == "system-profile") {
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
