import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CompressedAirAssessmentValidation } from '../../compressed-air-assessment-validation/CompressedAirAssessmentValidation';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentValidationService } from '../../compressed-air-assessment-validation/compressed-air-assessment-validation.service';

@Component({
  selector: 'app-baseline-footer-nav-buttons',
  templateUrl: './baseline-footer-nav-buttons.html',
  styleUrl: './baseline-footer-nav-buttons.css',
  standalone: false
})
export class BaselineFooterNavButtonsComponent {
  /**
   * Baseline Tabs:
   * - system-basics
   * - system-information
   * - inventory-setup
   * - day-types-setup
   * - system-profile-setup
   * - end-uses-setup
   *
   */


  setupTab: SetupTabRoutes;
  disableNext: boolean = false;

  validationStatus: CompressedAirAssessmentValidation;
  validationSub: Subscription;
  constructor(private router: Router,
    private compressedAirAssessmentValidationService: CompressedAirAssessmentValidationService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.validationSub = this.compressedAirAssessmentValidationService.validationStatus.subscribe(valStatus => {
      this.validationStatus = valStatus;
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setSetupTab();
      }
    });
    this.setSetupTab();
  }

  ngOnDestroy() {
    this.validationSub.unsubscribe();
  }

  next() {
    const nextTab = CaRouteTree[this.setupTab].next;
    if (nextTab) {
      this.router.navigate([nextTab], { relativeTo: this.route });
    } else {
      //go to assessment
      this.router.navigate(['../assessment'], { relativeTo: this.route });
    }
  }

  back() {
    const backTab = CaRouteTree[this.setupTab].back;
    if (backTab) {
      this.router.navigate([backTab], { relativeTo: this.route });
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

//TODO: Connect to routing
export type SetupTabRoutes = 'system-basics' | 'system-information' | 'inventory-setup' | 'day-types-setup' | 'system-profile-setup' | 'end-uses';

export const CaRouteTree = {
  "system-basics": {
    next: 'system-information',
    back: null
  },
  "system-information": {
    next: 'inventory-setup',
    back: 'system-basics'
  },
  "inventory-setup": {
    next: 'day-types-setup',
    back: 'system-information'
  },
  "day-types-setup": {
    next: 'system-profile-setup',
    back: 'inventory-setup'
  },
  "system-profile-setup": {
    next: 'end-uses',
    back: 'day-types-setup'
  },
  "end-uses": {
    next: null,
    back: 'system-profile-setup'
  }
}