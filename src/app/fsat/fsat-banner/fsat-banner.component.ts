import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { FsatService } from '../fsat.service';
import { Subscription } from 'rxjs';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { SecurityAndPrivacyItemComponent } from '../../shared/security-and-privacy/security-and-privacy-item/security-and-privacy-item.component';
import { DashboardService } from '../../dashboard/dashboard.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { CoreService } from '../../core/core.service';

@Component({
  selector: 'app-fsat-banner',
  templateUrl: './fsat-banner.component.html',
  styleUrls: ['./fsat-banner.component.css'],
  standalone: false
})
export class FsatBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  mainTab: string;
  mainTabSubscription: Subscription;
  bannerCollapsed: boolean = true;
  constructor(private fsatService: FsatService,
    private emailMeasurDataService: EmailMeasurDataService,
    private dashboardService: DashboardService, private modalDialogService: ModalDialogService,
    private coreService: CoreService) { }

  ngOnInit() {
    this.mainTabSubscription = this.fsatService.mainTab.subscribe(val => {
      this.mainTab = val;
    });
  }

  ngOnDestroy() {
    this.mainTabSubscription.unsubscribe();
  }

  changeTab(str: string) {
    if (str === 'baseline' || str === 'calculators') {
      this.fsatService.goToMainTab(str);
    } else if (this.assessment.fsat.setupDone) {
      this.fsatService.goToMainTab(str);
    }
    this.collapseBanner();
  }

  showSecurityAndPrivacyModal() {
    // Collapse banner to prevent it from reopening the modal on mobile when dismissed
    this.bannerCollapsed = true;
    this.modalDialogService.openModal(
      SecurityAndPrivacyItemComponent,
      SecurityAndPrivacyItemComponent.getDialogConfig()
    );
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', { shouldCollapse: false });
  }

  back() {
    if (this.mainTab == 'calculators') {
      this.fsatService.goToMainTab('sankey');
    } else if (this.mainTab == 'sankey') {
      this.fsatService.goToMainTab('report');
    } else if (this.mainTab == 'report') {
      this.fsatService.goToMainTab('diagram');
    } else if (this.mainTab == 'diagram') {
      this.fsatService.goToMainTab('assessment');
    } else if (this.mainTab == 'assessment') {
      this.fsatService.goToMainTab('baseline');
    }
  }

  continue() {
    if (this.mainTab == 'baseline') {
      this.fsatService.goToMainTab('assessment');
    } else if (this.mainTab == 'assessment') {
      this.fsatService.goToMainTab('diagram');
    } else if (this.mainTab == 'diagram') {
      this.fsatService.goToMainTab('report');
    } else if (this.mainTab == 'report') {
      this.fsatService.goToMainTab('sankey');
    } else if (this.mainTab == 'sankey') {
      this.fsatService.goToMainTab('calculators');
    }
  }

  openExportModal() {
    this.fsatService.showExportModal.next(true);
  }

  openShareDataModal() {
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'assessment',
      itemName: this.assessment.name,
      itemData: this.assessment
    }
    this.emailMeasurDataService.emailItemType.next('FSAT');
    this.coreService.showShareDataModal.next(true);
  }
}
