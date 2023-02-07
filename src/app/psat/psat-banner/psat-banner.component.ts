import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { Subscription } from 'rxjs';
import { PsatTabService } from '../psat-tab.service';
import { PsatService } from '../psat.service';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import { DashboardService } from '../../dashboard/dashboard.service';

@Component({
  selector: 'app-psat-banner',
  templateUrl: './psat-banner.component.html',
  styleUrls: ['./psat-banner.component.css']
})
export class PsatBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  bannerCollapsed: boolean = true;
  mainTab: string;
  mainTabSub: Subscription;
  constructor(private psatTabService: PsatTabService, 
    private dashboardService: DashboardService, private securityAndPrivacyService: SecurityAndPrivacyService) { }

  ngOnInit() {
    this.mainTabSub = this.psatTabService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  showSecurityAndPrivacyModal() {
    this.securityAndPrivacyService.modalOpen.next(true);
    this.securityAndPrivacyService.showSecurityAndPrivacyModal.next(true);
  }
  
  changeTab(str: string) {
    if (str == 'system-setup' || str == 'calculators') {
      this.psatTabService.mainTab.next(str);
    } else if (this.assessment.psat.setupDone) {
      this.psatTabService.mainTab.next(str);
    }
    this.collapseBanner();
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', {shouldCollapse: false});
  }

  back(){
    if (this.mainTab == 'calculators') {
      this.psatTabService.mainTab.next('sankey');
    } else if (this.mainTab == 'sankey') {
      this.psatTabService.mainTab.next('report');
    } else if (this.mainTab == 'report') {
      this.psatTabService.mainTab.next('diagram');
    } else if (this.mainTab == 'diagram') {
      this.psatTabService.mainTab.next('assessment');
    } else if (this.mainTab == 'assessment') {
      this.psatTabService.mainTab.next('system-setup');
    }
  }

  continue() {
    if (this.mainTab == 'system-setup') {
      this.psatTabService.mainTab.next('assessment');
    } else if (this.mainTab == 'assessment') {
      this.psatTabService.mainTab.next('diagram');
    } else if (this.mainTab == 'diagram') {
      this.psatTabService.mainTab.next('report');
    } else if (this.mainTab == 'report') {
      this.psatTabService.mainTab.next('sankey');
    } else if (this.mainTab == 'sankey') {
      this.psatTabService.mainTab.next('calculators');
    }
  }
}
