import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../dashboard/dashboard.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { Assessment } from '../../shared/models/assessment';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import { WaterAssessmentService } from '../water-assessment.service';
import { Modification, WaterAssessment } from 'process-flow-lib';

@Component({
  selector: 'app-water-banner',
  standalone: false,
  templateUrl: './water-banner.component.html',
  styleUrl: './water-banner.component.css'
})
export class WaterBannerComponent {
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
  waterAssessmentSub: Subscription;
  bannerCollapsed: boolean = true;
  constructor(private waterAssessmentService: WaterAssessmentService,
    private emailMeasurDataService: EmailMeasurDataService,
    private dashboardService: DashboardService,  private securityAndPrivacyService: SecurityAndPrivacyService) { }

  ngOnInit(): void {
    this.mainTabSub = this.waterAssessmentService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.selectedModificationSub = this.waterAssessmentService.selectedModificationId.subscribe(selectedModificationId => {
      let waterAssessment: WaterAssessment = this.waterAssessmentService.waterAssessment.getValue();
      if (!selectedModificationId && this.secondaryAssessmentTab && this.secondaryAssessmentTab != 'modifications') {
        this.changeSecondaryAssessmentTab('modifications');
      }
      
      if (waterAssessment) {
        this.selectedModification = waterAssessment.modifications.find(modification => { return modification.modificationId == selectedModificationId });
      }
    });

    this.assessmentTabSub = this.waterAssessmentService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    });

    this.secondaryAssessmentTabSub = this.waterAssessmentService.secondaryAssessmentTab.subscribe(val => {
      this.secondaryAssessmentTab = val;
    });

    this.waterAssessmentSub = this.waterAssessmentService.waterAssessment.subscribe(val => {
      if (val) {
        this.isBaselineValid = false;
        // this.isBaselineValid = val.setupDone;
      }
    });
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  back(){
    // if (this.mainTab == 'calculators') {
    //   this.waterAssessmentService.mainTab.next('sankey');
    // } else if (this.mainTab == 'sankey') {
    //   this.waterAssessmentService.mainTab.next('report');
    // } else if (this.mainTab == 'report') {
    //   this.waterAssessmentService.mainTab.next('diagram');
    // } else if (this.mainTab == 'diagram') {
    //   this.waterAssessmentService.mainTab.next('assessment');
    // } else if (this.mainTab == 'assessment') {
    //   this.waterAssessmentService.mainTab.next('baseline');
    // }
  }

  continue() {
    // if (this.mainTab == 'baseline') {
    //   this.waterAssessmentService.mainTab.next('assessment');
    // } else if (this.mainTab == 'assessment') {
    //   this.waterAssessmentService.mainTab.next('diagram');
    // } else if (this.mainTab == 'diagram') {
    //   this.waterAssessmentService.mainTab.next('report');
    // } else if (this.mainTab == 'report') {
    //   this.waterAssessmentService.mainTab.next('sankey');
    // } else if (this.mainTab == 'sankey') {
    //   this.waterAssessmentService.mainTab.next('calculators');
    // }
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
    this.selectedModificationSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.secondaryAssessmentTabSub.unsubscribe();
    this.waterAssessmentSub.unsubscribe();
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', {shouldCollapse: false});
  }

  showSecurityAndPrivacyModal() {
    this.securityAndPrivacyService.modalOpen.next(true);
    this.securityAndPrivacyService.showSecurityAndPrivacyModal.next(true);
  }

  changeTab(str: string) {
    if (str == 'baseline' || str == 'diagram' || str == 'report') {
      this.waterAssessmentService.mainTab.next(str);
    }
    this.collapseBanner();
  }

  selectModification() {
    this.waterAssessmentService.showModificationListModal.next(true);
  }

  changeAssessmentTab(str: string) {
    this.waterAssessmentService.assessmentTab.next(str);
  }

  changeSecondaryAssessmentTab(str: string) {
    if (this.selectedModification) {
      this.waterAssessmentService.secondaryAssessmentTab.next(str);
    }
  }

  backAssessmentTab(){
    // if (this.selectedModification) {
    //   if (this.secondaryAssessmentTab == 'graphs') {
    //     this.waterAssessmentService.secondaryAssessmentTab.next('table');
    //   } else if (this.secondaryAssessmentTab == 'table') {
    //     this.waterAssessmentService.secondaryAssessmentTab.next('modifications');
    //   }
    // }
  }

  continueAssessmentTab() {
    // if (this.selectedModification) {
    //   if (this.secondaryAssessmentTab == 'modifications') {
    //     this.waterAssessmentService.secondaryAssessmentTab.next('table');
    //   } else if (this.secondaryAssessmentTab == 'table') {
    //     this.waterAssessmentService.secondaryAssessmentTab.next('graphs');
    //   }
    // }
  }

  openExportModal(){
    this.waterAssessmentService.showExportModal.next(true);
  }

  emailAssessmentData() {
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'assessment',
      itemName: this.assessment.name,
      itemData: this.assessment
    }
    this.emailMeasurDataService.emailItemType.next('Water');
    this.emailMeasurDataService.showEmailMeasurDataModal.next(true);
  }
}
