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
  @Input()
  assessment: Assessment;

  isBaselineValid: boolean = false;
  mainTab: string;
  mainTabSub: Subscription;
  selectedModificationSub: Subscription;
  selectedModification: Modification;
  assessmentTab: string;
  assessmentTabSub: Subscription;
  secondaryAssessmentTabSub: Subscription;
  secondaryAssessmentTab: string;
  compresssedAirAssessmentSub: Subscription;
  bannerCollapsed: boolean = true;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private emailMeasurDataService: EmailMeasurDataService,
    private dashboardService: DashboardService, private securityAndPrivacyService: SecurityAndPrivacyService,
    private coreService: CoreService) { }

  ngOnInit(): void {
    this.mainTabSub = this.compressedAirAssessmentService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
      if (!val && this.secondaryAssessmentTab && this.secondaryAssessmentTab != 'modifications') {
        this.changeSecondaryAssessmentTab('modifications');
      }
      this.selectedModification = compressedAirAssessment.modifications.find(modification => { return modification.modificationId == val });
    });

    this.assessmentTabSub = this.compressedAirAssessmentService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    });
    this.secondaryAssessmentTabSub = this.compressedAirAssessmentService.secondaryAssessmentTab.subscribe(val => {
      this.secondaryAssessmentTab = val;
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

  back() {
    if (this.mainTab == 'calculators') {
      this.compressedAirAssessmentService.mainTab.next('sankey');
    } else if (this.mainTab == 'sankey') {
      this.compressedAirAssessmentService.mainTab.next('report');
    } else if (this.mainTab == 'report') {
      this.compressedAirAssessmentService.mainTab.next('diagram');
    } else if (this.mainTab == 'diagram') {
      this.compressedAirAssessmentService.mainTab.next('assessment');
    } else if (this.mainTab == 'assessment') {
      this.compressedAirAssessmentService.mainTab.next('baseline');
    }
  }

  continue() {
    if (this.mainTab == 'baseline') {
      this.compressedAirAssessmentService.mainTab.next('assessment');
    } else if (this.mainTab == 'assessment') {
      this.compressedAirAssessmentService.mainTab.next('diagram');
    } else if (this.mainTab == 'diagram') {
      this.compressedAirAssessmentService.mainTab.next('report');
    } else if (this.mainTab == 'report') {
      this.compressedAirAssessmentService.mainTab.next('sankey');
    } else if (this.mainTab == 'sankey') {
      this.compressedAirAssessmentService.mainTab.next('calculators');
    }
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
    this.selectedModificationSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.secondaryAssessmentTabSub.unsubscribe();
    this.compresssedAirAssessmentSub.unsubscribe();
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', { shouldCollapse: false });
  }

  showSecurityAndPrivacyModal() {
    this.securityAndPrivacyService.modalOpen.next(true);
    this.securityAndPrivacyService.showSecurityAndPrivacyModal.next(true);
  }

  changeTab(str: string) {
    if (str == 'baseline' || str == 'diagram' || str == 'sankey' || this.isBaselineValid) {
      this.compressedAirAssessmentService.mainTab.next(str);
    }
    this.collapseBanner();
  }

  selectModification() {
    this.compressedAirAssessmentService.showModificationListModal.next(true);
  }

  changeAssessmentTab(str: string) {
    this.compressedAirAssessmentService.assessmentTab.next(str);
  }

  changeSecondaryAssessmentTab(str: string) {
    if (this.selectedModification) {
      this.compressedAirAssessmentService.secondaryAssessmentTab.next(str);
    }
  }

  backAssessmentTab() {
    if (this.selectedModification) {
      if (this.secondaryAssessmentTab == 'graphs') {
        this.compressedAirAssessmentService.secondaryAssessmentTab.next('table');
      } else if (this.secondaryAssessmentTab == 'table') {
        this.compressedAirAssessmentService.secondaryAssessmentTab.next('modifications');
      }
    }
  }

  continueAssessmentTab() {
    if (this.selectedModification) {
      if (this.secondaryAssessmentTab == 'modifications') {
        this.compressedAirAssessmentService.secondaryAssessmentTab.next('table');
      } else if (this.secondaryAssessmentTab == 'table') {
        this.compressedAirAssessmentService.secondaryAssessmentTab.next('graphs');
      }
    }
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
