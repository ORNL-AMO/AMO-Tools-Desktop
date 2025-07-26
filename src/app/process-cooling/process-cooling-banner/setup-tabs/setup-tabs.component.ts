import { Component, computed, Signal, WritableSignal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProcessCoolingAssessment } from '../../../shared/models/process-cooling-assessment';
import { Settings } from '../../../shared/models/settings';
import { ChillerInventoryService } from '../../chiller-inventory/chiller-inventory.service';
import { ProcessCoolingSetupTabString, ProcessCoolingUiService } from '../../process-cooling-ui.service';
import { ProcessCoolingAssessmentService } from '../../process-cooling-assessment.service';
import { get } from 'lodash';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-setup-tabs',
  standalone: false,
  templateUrl: './setup-tabs.component.html',
  styleUrl: './setup-tabs.component.css'
})
export class SetupTabsComponent {

  setupTab: WritableSignal<ProcessCoolingSetupTabString>;
  assessmentSettingsClassStatus: Signal<Array<string>> = computed(() => {
    return this.setupTab() === 'assessment-settings' ? ['active'] : [];
  });
  systemInformationClassStatus: Signal<Array<string>> = computed(() => {
    return this.setupTab() === 'system-information' ? ['active'] : [];
  });
  inventoryClassStatus: Signal<Array<string>> = computed(() => {
    // todo 'disabled' if cannot view inventory
    // todo 'missing-data' when inventory invalid and canView

    return this.setupTab() === 'inventory' ? ['active'] : [];
  });

  canContinue: Signal<boolean> = computed(() => {
    return this.getCanContinue();
  });

  disabledSetupTabs: Array<ProcessCoolingSetupTabString>;
  disableTabs: boolean;
  assessmentSettingsBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  systemInformationBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  inventoryBadge: { display: boolean, hover: boolean } = { display: false, hover: false };
  settings: Settings;

  constructor(
    private processCoolingUiService: ProcessCoolingUiService,
    private processCoolingAssessmentService: ProcessCoolingAssessmentService,
    private inventoryService: ChillerInventoryService) {

    this.setupTab = this.processCoolingUiService.setupTabSignal;
    this.processCoolingAssessmentService.settings
      .pipe(takeUntilDestroyed())
      .subscribe(val => {
        this.settings = val;
        this.disabledSetupTabs = [];
        this.getCanContinue();
      });

    this.processCoolingAssessmentService.processCooling
      .pipe(takeUntilDestroyed())
      .subscribe(val => {
        this.disabledSetupTabs = [];
        this.getCanContinue();
      });

  }

  ngOnInit(): void {}

  // todo breakout validity state as signal
  getCanContinue(): boolean {
    let hasValidInventory: boolean = this.inventoryService.hasValidChillers(this.processCoolingAssessmentService.processCooling.getValue());
    let hasValidSystemInformation: boolean = true;
    let canViewInventory: boolean = true;

    let processCoolingAssessment: ProcessCoolingAssessment = this.processCoolingAssessmentService.processCooling.getValue();
    if (processCoolingAssessment && this.settings) {
      canViewInventory = hasValidSystemInformation;
    }
    if ((hasValidInventory || hasValidSystemInformation) || (this.setupTab() == 'assessment-settings')) {
      return true;
    } else {
      return false;
    }
  }

  changeSetupTab(str: ProcessCoolingSetupTabString) {
    if (!this.disabledSetupTabs.includes(str)) {
      this.setupTab.set(str);
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
    this.processCoolingUiService.continue();
  }

  back() {
    this.processCoolingUiService.back();
  }

}
