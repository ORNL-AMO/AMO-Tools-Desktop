import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { SsmtService } from '../ssmt.service';
import { Subscription } from 'rxjs';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';

@Component({
    selector: 'app-ssmt-banner',
    templateUrl: './ssmt-banner.component.html',
    styleUrls: ['./ssmt-banner.component.css'],
    standalone: false
})
export class SsmtBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  mainTab: string;
  mainTabSub: Subscription;
  bannerCollapsed: boolean = true;
  
  constructor(private ssmtService: SsmtService,
    private emailMeasurDataService: EmailMeasurDataService,
    private dashboardService: DashboardService,  private securityAndPrivacyService: SecurityAndPrivacyService) { }

  ngOnInit() {
    this.mainTabSub = this.ssmtService.mainTab.subscribe(val => {
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
    if (str === 'baseline' || str === 'calculators') {
      this.ssmtService.mainTab.next(str);
    } else if (this.assessment.ssmt.setupDone) {
      this.ssmtService.mainTab.next(str);
    }    
    this.collapseBanner();
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  back(){
    if (this.mainTab == 'calculators') {
      this.ssmtService.mainTab.next('sankey');
    } else if (this.mainTab == 'sankey') {
      this.ssmtService.mainTab.next('report');
    } else if (this.mainTab == 'report') {
      this.ssmtService.mainTab.next('diagram');
    } else if (this.mainTab == 'diagram') {
      this.ssmtService.mainTab.next('assessment');
    } else if (this.mainTab == 'assessment') {
      this.ssmtService.mainTab.next('baseline');
    }
  }

  continue() {
    if (this.mainTab == 'baseline') {
      this.ssmtService.mainTab.next('assessment');
    } else if (this.mainTab == 'assessment') {
      this.ssmtService.mainTab.next('diagram');
    } else if (this.mainTab == 'diagram') {
      this.ssmtService.mainTab.next('report');
    } else if (this.mainTab == 'report') {
      this.ssmtService.mainTab.next('sankey');
    } else if (this.mainTab == 'sankey') {
      this.ssmtService.mainTab.next('calculators');
    }
  }

  openExportModal(){
    this.ssmtService.showExportModal.next(true);
  }

  emailTreasureHuntData() {
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'assessment',
      itemName: this.assessment.name,
      itemData: this.assessment
    }
    this.emailMeasurDataService.emailItemType.next('STEAM');
    this.emailMeasurDataService.showEmailMeasurDataModal.next(true);
  }
}
