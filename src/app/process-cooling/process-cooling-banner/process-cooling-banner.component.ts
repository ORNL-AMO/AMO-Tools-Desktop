import { Component, Input, WritableSignal } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { DashboardService } from '../../dashboard/dashboard.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { SecurityAndPrivacyService } from '../../shared/security-and-privacy/security-and-privacy.service';
import { ProcessCoolingAssessmentService } from '../process-cooling-assessment.service';
import { ProcessCoolingMainTabString, ProcessCoolingUiService } from '../process-cooling-ui.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  mainTab: WritableSignal<ProcessCoolingMainTabString>;
  bannerCollapsed: boolean = true;
  constructor(
    private processCoolingService: ProcessCoolingAssessmentService,
    private processCoolingUiService: ProcessCoolingUiService,
    private emailMeasurDataService: EmailMeasurDataService,
    private dashboardService: DashboardService,  private securityAndPrivacyService: SecurityAndPrivacyService) { 
    this.processCoolingService.processCooling
      .pipe(takeUntilDestroyed())
      .subscribe(val => {
        if (val) {
          this.isBaselineValid = val.setupDone;
        }
      });
    }

  ngOnInit(): void {
    this.mainTab = this.processCoolingUiService.mainTabSignal;
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  back(){
    if (this.mainTab() == 'report') {
      this.mainTab.set('assessment');
    } else if (this.mainTab() == 'assessment') {
      this.mainTab.set('baseline');
    }
  }

  continue() {
    if (this.mainTab() == 'baseline') {
      this.mainTab.set('assessment');
    } else if (this.mainTab() == 'assessment') {
      this.mainTab.set('report');
    }
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
      this.mainTab.set(str);
    }
    this.collapseBanner();
  }

  selectModification() {
    this.processCoolingUiService.showModificationListModalSignal.set(true);
  }
  
  openExportModal(){
    this.processCoolingUiService.showExportModalSignal.set(true);
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

