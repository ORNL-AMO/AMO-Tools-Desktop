import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { PhastService } from '../phast.service';
import { Settings } from '../../shared/models/settings';
import { Subscription } from 'rxjs';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
@Component({
    selector: 'app-phast-banner',
    templateUrl: './phast-banner.component.html',
    styleUrls: ['./phast-banner.component.css'],
    standalone: false
})
export class PhastBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;

  mainTab: string;
  mainTabSub: Subscription;
  bannerCollapsed: boolean = true;
  constructor(private phastService: PhastService,
    private emailMeasurDataService: EmailMeasurDataService,
    private dashboardService: DashboardService,  private securityAndPrivacyService: SecurityAndPrivacyService) { }

  ngOnInit() {
    this.mainTabSub = this.phastService.mainTab.subscribe(val => {
      this.mainTab = val;
    });
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', {shouldCollapse: false});
  }

  showSecurityAndPrivacyModal() {
    this.securityAndPrivacyService.modalOpen.next(true);
    this.securityAndPrivacyService.showSecurityAndPrivacyModal.next(true);
  }

  changeTab(str: string) {
    if (str === 'system-setup' || str === 'calculators') {
      this.phastService.mainTab.next(str);
    } else if (this.assessment.phast.setupDone) {
      this.phastService.mainTab.next(str);
    }
    this.collapseBanner();
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  back(){
    if (this.mainTab == 'calculators') {
      this.phastService.mainTab.next('sankey');
    } else if (this.mainTab == 'sankey') {
      this.phastService.mainTab.next('report');
    } else if (this.mainTab == 'report') {
      this.phastService.mainTab.next('diagram');
    } else if (this.mainTab == 'diagram') {
      this.phastService.mainTab.next('assessment');
    } else if (this.mainTab == 'assessment') {
      this.phastService.mainTab.next('system-setup');
    }
  }

  continue() {
    if (this.mainTab == 'system-setup') {
      this.phastService.mainTab.next('assessment');
    } else if (this.mainTab == 'assessment') {
      this.phastService.mainTab.next('diagram');
    } else if (this.mainTab == 'diagram') {
      this.phastService.mainTab.next('report');
    } else if (this.mainTab == 'report') {
      this.phastService.mainTab.next('sankey');
    } else if (this.mainTab == 'sankey') {
      this.phastService.mainTab.next('calculators');
    }
  }

  openExportModal(){
    this.phastService.showExportModal.next(true);
  }

  emailTreasureHuntData() {
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'assessment',
      itemName: this.assessment.name,
      itemData: this.assessment
    }
    this.emailMeasurDataService.emailItemType.next('PHAST');
    this.emailMeasurDataService.showEmailMeasurDataModal.next(true);
  }
}
