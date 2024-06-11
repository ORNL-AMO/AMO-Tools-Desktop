import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { WaterAssessmentService } from '../../water-assessment.service';
import { WaterAssessment } from '../../../shared/models/water-assessment';

@Component({
  selector: 'app-setup-tabs',
  templateUrl: './setup-tabs.component.html',
  styleUrl: './setup-tabs.component.css'
})
export class SetupTabsComponent {

  setupTabSub: Subscription;
  setupTab: string;
  disabledSetupTabs: Array<string>;
  disableTabs: boolean;
  canContinue: boolean;

  systemBasicsClassStatus: Array<string> = [];
  systemBasicsBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  waterAssessmentSub: Subscription;
  settingsSub: Subscription;
  settings: Settings;
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

    }
    this.setSystemBasicsStatus();

    if ((hasValidSystemBasics) || (this.setupTab == 'system-basics')) {
      this.canContinue = true;
    } else {
      this.canContinue = false;
    }

  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.waterAssessmentSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  changeSetupTab(str: string) {
    if (!this.disabledSetupTabs.includes(str)) {
      this.waterAssessmentService.setupTab.next(str);
    }
  }

  setSystemBasicsStatus() {
    if (this.setupTab == "system-basics") {
      this.systemBasicsClassStatus = ["active"];
    } else {
      this.systemBasicsClassStatus = [];
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
