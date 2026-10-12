import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { Subscription } from 'rxjs';
import { PsatTabService } from '../psat-tab.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { SecurityAndPrivacyItemComponent } from '../../shared/security-and-privacy/security-and-privacy-item/security-and-privacy-item.component';
import { DashboardService } from '../../dashboard/dashboard.service';
import { IntegrationStateService } from '../../shared/connected-inventory/integration-state.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { CoreService } from '../../core/core.service';

@Component({
  selector: 'app-psat-banner',
  templateUrl: './psat-banner.component.html',
  styleUrls: ['./psat-banner.component.css'],
  standalone: false
})
export class PsatBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  bannerCollapsed: boolean = true;
  mainTab: string;
  mainTabSub: Subscription;
  connectedInventoryDataSub: Subscription;
  showConnectedItemIcon: boolean;

  constructor(private psatTabService: PsatTabService,
    private integrationStateService: IntegrationStateService,
    private emailMeasurDataService: EmailMeasurDataService,
    private dashboardService: DashboardService, private modalDialogService: ModalDialogService,
    private coreService: CoreService) { }

  ngOnInit() {
    this.mainTabSub = this.psatTabService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.connectedInventoryDataSub = this.integrationStateService.connectedInventoryData.subscribe(connectedInventoryData => {
      this.showConnectedItemIcon = connectedInventoryData.connectedItem !== undefined;
    });

  }

  ngOnDestroy() {
    this.connectedInventoryDataSub.unsubscribe();
    this.mainTabSub.unsubscribe();
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  showSecurityAndPrivacyModal() {
    // Collapse banner to prevent it from reopening the modal on mobile when dismissed
    this.bannerCollapsed = true;
    this.modalDialogService.openModal(
      SecurityAndPrivacyItemComponent,
      SecurityAndPrivacyItemComponent.getDialogConfig()
    );
  }

  changeTab(str: string) {
    if (str == 'baseline' || str == 'calculators') {
      this.psatTabService.goToMainTab(str);
    } else if (this.assessment.psat.setupDone) {
      this.psatTabService.goToMainTab(str);
    }
    this.collapseBanner();
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', { shouldCollapse: false });
  }

  back() {
    this.psatTabService.backMainTab();
  }

  continue() {
    this.psatTabService.continueMainTab();
  }

  openExportModal() {
    this.psatTabService.showExportModal.next(true);
  }

  openShareDataModal() {
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'assessment',
      itemName: this.assessment.name,
      itemData: this.assessment
    }
    this.emailMeasurDataService.emailItemType.next('PSAT');
    this.coreService.showShareDataModal.next(true);
  }
}
