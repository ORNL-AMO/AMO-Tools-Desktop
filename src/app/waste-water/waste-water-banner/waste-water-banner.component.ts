import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../dashboard/dashboard.service';
import { Assessment } from '../../shared/models/assessment';
import { WasteWaterData } from '../../shared/models/waste-water';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import { WasteWaterService } from '../waste-water.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';

@Component({
  selector: 'app-waste-water-banner',
  templateUrl: './waste-water-banner.component.html',
  styleUrls: ['./waste-water-banner.component.css']
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
    private dashboardService: DashboardService, private securityAndPrivacyService: SecurityAndPrivacyService) { }

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
    this.securityAndPrivacyService.modalOpen.next(true);
    this.securityAndPrivacyService.showSecurityAndPrivacyModal.next(true);
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', {shouldCollapse: false});
  }

  changeTab(str: string) {
    if (str == 'system-setup' || this.isBaselineValid) {
      this.wasteWaterService.mainTab.next(str);
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

  back(){
    if (this.mainTab == 'calculators') {
      this.wasteWaterService.mainTab.next('report');
    } else if (this.mainTab == 'report') {
      this.wasteWaterService.mainTab.next('diagram');
    } else if (this.mainTab == 'diagram') {
      this.wasteWaterService.mainTab.next('analysis');
    } else if (this.mainTab == 'analysis') {
      this.wasteWaterService.mainTab.next('assessment');
    } else if (this.mainTab == 'assessment') {
      this.wasteWaterService.mainTab.next('system-setup');
    }
  }

  continue() {
    if (this.mainTab == 'system-setup') {
      this.wasteWaterService.mainTab.next('assessment');
    } else if (this.mainTab == 'assessment') {
      this.wasteWaterService.mainTab.next('analysis');
    } else if (this.mainTab == 'analysis') {
      this.wasteWaterService.mainTab.next('diagram');
    } else if (this.mainTab == 'diagram') {
      this.wasteWaterService.mainTab.next('report');
    } else if (this.mainTab == 'report') {
      this.wasteWaterService.mainTab.next('calculators');
    }
  }

  collapseTabs() {
    this.tabsCollapsed = !this.tabsCollapsed;
  }

  openExportModal(){
    this.wasteWaterService.showExportModal.next(true);
  }

  emailTreasureHuntData() {
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'assessment',
      itemName: this.assessment.name,
      itemData: this.assessment
    }
    this.emailMeasurDataService.emailItemType.next('WasteWater');
    this.emailMeasurDataService.showEmailMeasurDataModal.next(true);
  }
}
