import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../dashboard/dashboard.service';
import { Assessment } from '../../shared/models/assessment';
import { Modification } from '../../shared/models/compressed-air-assessment';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { CoreService } from '../../core/core.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-compressed-air-banner',
  templateUrl: './compressed-air-banner.component.html',
  styleUrls: ['./compressed-air-banner.component.css'],
  standalone: false
})
export class CompressedAirBannerComponent implements OnInit {
  @Input({ required: true })
  assessment: Assessment;

  isBaselineValid: boolean = false;
  selectedModificationSub: Subscription;
  selectedModification: Modification;
  compresssedAirAssessmentSub: Subscription;
  bannerCollapsed: boolean = true;

  mainTab: 'baseline' | 'assessment' | 'calculators';
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private emailMeasurDataService: EmailMeasurDataService,
    private dashboardService: DashboardService, private securityAndPrivacyService: SecurityAndPrivacyService,
    private coreService: CoreService,
    private router: Router) { }

  ngOnInit(): void {
    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      this.selectedModification = val;
    });

    this.compresssedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.isBaselineValid = val.setupDone;
      }
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setMainTab();
      }
    });
    this.setMainTab();
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  ngOnDestroy() {
    this.selectedModificationSub.unsubscribe();
    this.compresssedAirAssessmentSub.unsubscribe();
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', { shouldCollapse: false });
  }

  showSecurityAndPrivacyModal() {
    this.securityAndPrivacyService.modalOpen.next(true);
    this.securityAndPrivacyService.showSecurityAndPrivacyModal.next(true);
  }


  selectModification() {
    this.compressedAirAssessmentService.showModificationListModal.next(true);
  }



  openExportModal() {
    this.compressedAirAssessmentService.showExportModal.next(true);
  }

  openShareDataModal() {
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'assessment',
      itemName: this.assessment.name,
      itemData: this.assessment
    }
    this.emailMeasurDataService.emailItemType.next('CompressedAir');
    this.coreService.showShareDataModal.next(true);
  }

  setMainTab(){
    if(this.router.url.includes('baseline')){
      this.mainTab = 'baseline';
    } else if(this.router.url.includes('assessment')){
      this.mainTab = 'assessment';
    } else if(this.router.url.includes('calculators')){
      this.mainTab = 'calculators';
    }
  }
}
