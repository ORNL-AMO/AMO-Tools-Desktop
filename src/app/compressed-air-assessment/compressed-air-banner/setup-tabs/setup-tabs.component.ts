import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentValidation } from '../../compressed-air-assessment-validation/CompressedAirAssessmentValidation';
import { CompressedAirAssessmentValidationService } from '../../compressed-air-assessment-validation/compressed-air-assessment-validation.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CaRouteTree, SetupTabRoutes } from '../../routing/compressed-air-route-tree';

@Component({
  selector: 'app-setup-tabs',
  templateUrl: './setup-tabs.component.html',
  styleUrls: ['./setup-tabs.component.css'],
  standalone: false
})
export class SetupTabsComponent implements OnInit {

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

  validationSub: Subscription;
  validationStatus: CompressedAirAssessmentValidation;

  setupTab: SetupTabRoutes;
  routerSub: Subscription;
  constructor(private compressedAirAssessmentValidationService: CompressedAirAssessmentValidationService,
    private router: Router, private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.validationSub = this.compressedAirAssessmentValidationService.validationStatus.subscribe(val => {
      this.validationStatus = val;
      this.setTabStatus();
    });


    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setSetupTab();
      }
    });
    this.setSetupTab();
  }

  ngOnDestroy() {
    this.validationSub.unsubscribe();
    this.routerSub.unsubscribe();
  }

  setTabStatus() {
    let hasValidDayTypes: boolean = false;
    let hasValidSystemInformation: boolean = false;
    let hasValidCompressors: boolean = false;
    let hasValidSystemProfile: boolean = true;
    let hasValidEndUses: boolean = true;
    let canViewInventory: boolean = false;
    let canViewDayTypes: boolean = false;
    let canViewSystemProfile: boolean = false;
    let canViewEndUses: boolean = false;
    if (this.validationStatus) {
      hasValidSystemInformation = this.validationStatus.systemInformationValid;
      hasValidCompressors = this.validationStatus.compressorsValid;
      hasValidDayTypes = this.validationStatus.dayTypesValid;
      hasValidSystemProfile = this.validationStatus.profileSummaryValid;
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

  back() {
    const backTab = CaRouteTree[this.setupTab].back;
    if (backTab) {
      this.router.navigate(['baseline/'+backTab], { relativeTo: this.route });
    }
  }

  goToAssessment() {
    this.router.navigate(['assessment'], { relativeTo: this.route });
  }

  continue() {
    const nextTab = CaRouteTree[this.setupTab].next;
    if (nextTab) {
      this.router.navigate(['baseline/'+nextTab], { relativeTo: this.route });
    } else {
      //go to assessment
      this.goToAssessment();
    }
  }

  setSetupTab() {
    if (this.router.url.includes('system-basics')) {
      this.setupTab = 'system-basics';
    } else if (this.router.url.includes('system-information')) {
      this.setupTab = 'system-information';
    } else if (this.router.url.includes('inventory-setup')) {
      this.setupTab = 'inventory-setup';
    } else if (this.router.url.includes('day-types-setup')) {
      this.setupTab = 'day-types-setup';
    } else if (this.router.url.includes('system-profile-setup')) {
      this.setupTab = 'system-profile-setup';
    } else if (this.router.url.includes('end-uses')) {
      this.setupTab = 'end-uses';
    }
  }
}
