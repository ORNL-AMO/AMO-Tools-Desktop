import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { TreasureHuntService } from '../treasure-hunt.service';
import { Subscription } from 'rxjs';
import { CalculatorsService } from '../calculators/calculators.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { SecurityAndPrivacyItemComponent } from '../../shared/security-and-privacy/security-and-privacy-item/security-and-privacy-item.component';
import { DashboardService } from '../../dashboard/dashboard.service';
import { EmailMeasurDataService } from '../../shared/email-measur-data/email-measur-data.service';
import { CoreService } from '../../core/core.service';
import { TREASURE_HUNT_SETUP_GATED_VIEWS } from '../routing/treasure-hunt.routing';
import { isMainTabAllowed } from '../../shared/main-tab-routing/main-tab-routing';

@Component({
    selector: 'app-treasure-hunt-banner',
    templateUrl: './treasure-hunt-banner.component.html',
    styleUrls: ['./treasure-hunt-banner.component.css'],
    standalone: false
})
export class TreasureHuntBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  mainTabSub: Subscription;
  mainTab: string;

  subTab: string;
  subTabSub: Subscription;
  calculatorTabSub: Subscription;
  disableTabs: boolean = false;
  bannerCollapsed: boolean = true;
  constructor(private treasureHuntService: TreasureHuntService, 
    private emailMeasurDataService: EmailMeasurDataService,
    private dashboardService: DashboardService, private calculatorsService: CalculatorsService, 
    private modalDialogService: ModalDialogService, private coreService: CoreService) { }

  ngOnInit() {
    this.mainTabSub = this.treasureHuntService.mainTab.subscribe(val => {
      this.mainTab = val;
    });

    this.subTabSub = this.treasureHuntService.subTab.subscribe(val => {
      this.subTab = val;
    });

    this.calculatorTabSub = this.calculatorsService.selectedCalc.subscribe(val => {
      if (val == 'none') {
        this.disableTabs = false;
      } else {
        this.disableTabs = true;
      }
    });
  }

  ngOnDestroy() {
    this.subTabSub.unsubscribe();
    this.mainTabSub.unsubscribe();
    this.calculatorTabSub.unsubscribe();
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
    if (this.disableTabs == false) {
      if (isMainTabAllowed(TREASURE_HUNT_SETUP_GATED_VIEWS, str, this.assessment.treasureHunt.setupDone)) {
        this.treasureHuntService.goToMainTab(str);
      }
    }
    this.collapseBanner();
  }

  changeSubTab(str: string) {
    this.treasureHuntService.subTab.next(str)
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  } 

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', {shouldCollapse: false});
  }

  back() {
    if (this.mainTab != 'baseline') {
      this.treasureHuntService.backMainTab();
    } else {
      if (this.subTab == 'operation-costs') {
        this.treasureHuntService.subTab.next('settings');
      } else if (this.subTab == 'settings') {
        this.treasureHuntService.subTab.next('settings');
      }
    }
  }

  continue() {
    if (this.mainTab == 'baseline') {
      if (this.subTab == 'settings') {
        this.treasureHuntService.subTab.next('operation-costs');
      } else if (this.subTab == 'operation-costs') {
        this.treasureHuntService.continueMainTab();
      }
    } else {
      this.treasureHuntService.continueMainTab();
    }
  }

  openExportModal(){
    this.treasureHuntService.showExportModal.next(true);
  }

  openShareDataModal() {
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'assessment',
      itemName: this.assessment.name,
      itemData: this.assessment
    }
    this.emailMeasurDataService.emailItemType.next('TreasureHunt');
    this.coreService.showShareDataModal.next(true);
  }
}
