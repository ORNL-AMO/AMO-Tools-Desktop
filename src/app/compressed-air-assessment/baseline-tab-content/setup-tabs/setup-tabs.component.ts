import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { InventoryService } from '../inventory-setup/inventory/inventory.service';
import { SystemInformationFormService } from '../system-information/system-information-form/system-information-form.service';
import { DayTypeService } from '../day-types-setup/day-types/day-type.service';


@Component({
    selector: 'app-setup-tabs',
    templateUrl: './setup-tabs.component.html',
    styleUrls: ['./setup-tabs.component.css'],
    standalone: false
})
export class SetupTabsComponent implements OnInit {


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
  compressedAirAssessmentSub: Subscription;
  settingsSub: Subscription;
  settings: Settings;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private dayTypeService: DayTypeService, private systemInformationFormService: SystemInformationFormService, private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.settingsSub = this.compressedAirAssessmentService.settings.subscribe(val => {
      this.settings = val;
      this.setTabStatus();
    });
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
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
    this.setSystemInformationStatus(hasValidSystemInformation);
    this.setInventoryStatus(hasValidCompressors, canViewInventory);
    this.setDayTypesStatus(hasValidDayTypes, canViewDayTypes);
    this.setSystemProfileStatus(hasValidSystemProfile, canViewSystemProfile);
    this.setEndUsesStatus(hasValidEndUses, canViewEndUses);

    // if ((hasValidDayTypes && hasValidSystemInformation && hasValidCompressors && hasValidSystemProfile && hasValidEndUses) || (this.setupTab == 'system-basics')) {
    //   this.canContinue = true;
    // } else {
    //   this.canContinue = false;
    // }

  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  setSystemInformationStatus(hasValidSystemInformation: boolean) {
    this.systemInformationClassStatus = [];
    if (!hasValidSystemInformation) {
      this.systemInformationClassStatus.push("missing-data");
    }
  }

  setInventoryStatus(hasValidCompressors: boolean, canViewInventory: boolean) {
    this.inventoryStatus = [];
    if (!canViewInventory) {
      this.inventoryStatus.push('disabled');
    }
    if (canViewInventory && !hasValidCompressors) {
      this.inventoryStatus.push("missing-data");
    }
  }

  setDayTypesStatus(hasValidDayTypes: boolean, canViewDayTypes: boolean) {
    this.dayTypesClassStatus = [];
    if (!canViewDayTypes) {
      this.dayTypesClassStatus.push("disabled");
    }
    if (canViewDayTypes && !hasValidDayTypes) {
      this.dayTypesClassStatus.push("missing-data");
    }
  }

  setSystemProfileStatus(hasValidSystemProfile: boolean, canViewSystemProfile: boolean) {
    this.systemProfileStatus = [];
    if (!canViewSystemProfile) {
      this.systemProfileStatus.push("disabled");
    }
    if (canViewSystemProfile && !hasValidSystemProfile) {
      this.systemProfileStatus.push('missing-data');
    }
  }

  setEndUsesStatus(hasValidEndUses: boolean, canViewEndUses: boolean) {
    this.endUsesStatus = [];
    if (!canViewEndUses) {
      this.endUsesStatus.push("disabled");
    }
    if (canViewEndUses && !hasValidEndUses) {
      this.endUsesStatus.push('missing-data');
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
