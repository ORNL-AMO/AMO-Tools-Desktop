import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../dashboard/dashboard.service';
import { Assessment } from '../../shared/models/assessment';
import { WasteWaterData } from '../../shared/models/waste-water';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { SecurityAndPrivacyItemComponent } from '../../shared/security-and-privacy/security-and-privacy-item/security-and-privacy-item.component';
import { WasteWaterService } from '../waste-water.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { CoreService } from '../../core/core.service';
import { SETUP_GATED_TABS } from '../routing/waste-water.routing';

@Component({
  selector: 'app-waste-water-banner',
  templateUrl: './waste-water-banner.component.html',
  styleUrls: ['./waste-water-banner.component.css'],
  standalone: false
})
export class WasteWaterBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;
  mainTab: string;
  mainTabSub: Subscription;
  wasteWaterSub: Subscription;
  assessmentTabSub: Subscription;
  assessmentTab: string;
  isBaselineValid: boolean;
  selectedModificationIdSub: Subscription;
  selectedModification: WasteWaterData;

  bannerCollapsed: boolean = true;
  tabsCollapsed: boolean = true;

  constructor(private wasteWaterService: WasteWaterService,
    private emailMeasurDataService: EmailMeasurDataService,
    private dashboardService: DashboardService, private modalDialogService: ModalDialogService,
    private coreService: CoreService) { }

  ngOnInit(): void {
    this.wasteWaterSub = this.wasteWaterService.wasteWater.subscribe(val => {
      if (val.baselineData.valid) {
        this.isBaselineValid = val.baselineData.valid.isValid;
      }
    });

    this.mainTabSub = this.wasteWaterService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.assessmentTabSub = this.wasteWaterService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    });

    this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(() => {
      this.selectedModification = this.wasteWaterService.getModificationFromId();
    });
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
    this.wasteWaterSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.selectedModificationIdSub.unsubscribe();
  }

  showSecurityAndPrivacyModal() {
    // Collapse banner to prevent it from reopening the modal on mobile when dismissed
    this.bannerCollapsed = true;
    this.modalDialogService.openModal(
      SecurityAndPrivacyItemComponent,
      SecurityAndPrivacyItemComponent.getDialogConfig()
    );
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', { shouldCollapse: false });
  }

  changeTab(str: string) {
    if (!SETUP_GATED_TABS.includes(str) || this.isBaselineValid) {
      this.wasteWaterService.goToMainTab(str);
    }
    this.collapseBanner();
  }

  changeAssessmentTab(str: string) {
    this.wasteWaterService.assessmentTab.next(str);
    this.collapseTabs();
  }

  selectModification() {
    this.wasteWaterService.showModificationListModal.next(true);
    this.collapseTabs();
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  back() {
    this.wasteWaterService.backMainTab();
  }

  continue() {
    this.wasteWaterService.continueMainTab();
  }

  collapseTabs() {
    this.tabsCollapsed = !this.tabsCollapsed;
  }

  openExportModal() {
    this.wasteWaterService.showExportModal.next(true);
  }

  openShareDataModal() {
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'assessment',
      itemName: this.assessment.name,
      itemData: this.assessment
    }
    this.emailMeasurDataService.emailItemType.next('WasteWater');
    this.coreService.showShareDataModal.next(true);
  }
}
