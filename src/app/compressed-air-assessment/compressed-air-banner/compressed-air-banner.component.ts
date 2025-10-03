import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../dashboard/dashboard.service';
import { Assessment } from '../../shared/models/assessment';
import { CompressedAirAssessment, Modification } from '../../shared/models/compressed-air-assessment';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { CoreService } from '../../core/core.service';

@Component({
  selector: 'app-compressed-air-banner',
  templateUrl: './compressed-air-banner.component.html',
  styleUrls: ['./compressed-air-banner.component.css'],
  standalone: false
})
export class CompressedAirBannerComponent implements OnInit {
  @Input({required: true})
  assessment: Assessment;

  isBaselineValid: boolean = false;
  selectedModificationSub: Subscription;
  selectedModification: Modification;
  compresssedAirAssessmentSub: Subscription;
  bannerCollapsed: boolean = true;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private emailMeasurDataService: EmailMeasurDataService,
    private dashboardService: DashboardService, private securityAndPrivacyService: SecurityAndPrivacyService,
    private coreService: CoreService) { }

  ngOnInit(): void {
    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      this.selectedModification = val;
    });

    this.compresssedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.isBaselineValid = val.setupDone;
      }
    });
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
}
