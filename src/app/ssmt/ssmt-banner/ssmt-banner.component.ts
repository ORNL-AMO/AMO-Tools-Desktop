import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { SsmtService } from '../ssmt.service';
import { Subscription } from 'rxjs';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { SecurityAndPrivacyItemComponent } from '../../shared/security-and-privacy/security-and-privacy-item/security-and-privacy-item.component';
import { DashboardService } from '../../dashboard/dashboard.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { CoreService } from '../../core/core.service';
import { SSMT_SETUP_GATED_VIEWS, SsmtMainView } from '../routing/ssmt.routing';
import { isMainTabAllowed } from '../../shared/main-tab-routing/main-tab-routing';

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
    private dashboardService: DashboardService, private modalDialogService: ModalDialogService,
    private coreService: CoreService) { }

  ngOnInit() {
    this.mainTabSub = this.ssmtService.mainTab.subscribe(val => {
      this.mainTab = val;
    });
  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', { shouldCollapse: false });
  }

  showSecurityAndPrivacyModal() {
    // Collapse banner to prevent it from reopening the modal on mobile when dismissed
    this.bannerCollapsed = true;
    this.modalDialogService.openModal(
      SecurityAndPrivacyItemComponent,
      SecurityAndPrivacyItemComponent.getDialogConfig()
    );
  }

  canOpenMainTab(view: SsmtMainView): boolean {
    return isMainTabAllowed(SSMT_SETUP_GATED_VIEWS, view, this.assessment.ssmt.setupDone);
  }

  changeTab(str: SsmtMainView) {
    if (this.canOpenMainTab(str)) {
      this.ssmtService.goToMainTab(str);
    }
    this.collapseBanner();
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  back() {
    this.ssmtService.backMainTab();
  }

  continue() {
    this.ssmtService.continueMainTab();
  }

  openExportModal() {
    this.ssmtService.showExportModal.next(true);
  }

  openShareDataModal() {
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'assessment',
      itemName: this.assessment.name,
      itemData: this.assessment
    }
    this.emailMeasurDataService.emailItemType.next('STEAM');
    this.coreService.showShareDataModal.next(true);
  }
}
