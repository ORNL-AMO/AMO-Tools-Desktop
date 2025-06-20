import { Component, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../dashboard/dashboard.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import { ProcessCoolingMainTabString, ProcessCoolingService } from '../process-cooling.service';

@Component({
  selector: 'app-process-cooling-banner',
  standalone: false,
  templateUrl: './process-cooling-banner.component.html',
  styleUrl: './process-cooling-banner.component.css'
})
export class ProcessCoolingBannerComponent {
  @Input()
  assessment: Assessment;

  isBaselineValid: boolean = false;
  mainTab: ProcessCoolingMainTabString;
  mainTabSub: Subscription;
  compresssedAirAssessmentSub: Subscription;
  bannerCollapsed: boolean = true;
  constructor(private processCoolingService: ProcessCoolingService,
    private emailMeasurDataService: EmailMeasurDataService,
    private dashboardService: DashboardService,  private securityAndPrivacyService: SecurityAndPrivacyService) { }

  ngOnInit(): void {
    this.mainTabSub = this.processCoolingService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.compresssedAirAssessmentSub = this.processCoolingService.processCooling.subscribe(val => {
      if (val) {
        this.isBaselineValid = val.setupDone;
      }
    });
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  back(){
    if (this.mainTab == 'report') {
      this.processCoolingService.mainTab.next('assessment');
    } else if (this.mainTab == 'assessment') {
      this.processCoolingService.mainTab.next('baseline');
    }
  }

  continue() {
    if (this.mainTab == 'baseline') {
      this.processCoolingService.mainTab.next('assessment');
    } else if (this.mainTab == 'assessment') {
      this.processCoolingService.mainTab.next('report');
    }
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
    this.compresssedAirAssessmentSub.unsubscribe();
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', {shouldCollapse: false});
  }

  showSecurityAndPrivacyModal() {
    this.securityAndPrivacyService.modalOpen.next(true);
    this.securityAndPrivacyService.showSecurityAndPrivacyModal.next(true);
  }

  changeTab(str: ProcessCoolingMainTabString) {
    if (str == 'baseline' || str == 'diagram' || this.isBaselineValid) {
      this.processCoolingService.mainTab.next(str);
    }
    this.collapseBanner();
  }

  selectModification() {
    this.processCoolingService.showModificationListModal.next(true);
  }
  
  openExportModal(){
    this.processCoolingService.showExportModal.next(true);
  }

  emailAssessment() {
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'assessment',
      itemName: this.assessment.name,
      itemData: this.assessment
    }
    this.emailMeasurDataService.emailItemType.next('ProcessCooling');
    this.emailMeasurDataService.showEmailMeasurDataModal.next(true);
  }
}

