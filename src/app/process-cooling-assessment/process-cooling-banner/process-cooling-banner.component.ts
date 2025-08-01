import { Component, inject, Signal } from '@angular/core';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-asessment.service';
import { map, Observable } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { ROUTE_TOKENS } from '../process-cooling-assessment.module';
import { MAIN_VIEW_LINKS, MainView, ProcessCoolingUiService } from '../services/process-cooling-ui.service';
import { DashboardService } from '../../dashboard/dashboard.service';

@Component({
  selector: 'app-process-cooling-banner',
  standalone: false,
  templateUrl: './process-cooling-banner.component.html',
  styleUrl: './process-cooling-banner.component.css'
})
export class ProcessCoolingBannerComponent {
  private readonly processCoolingService = inject(ProcessCoolingAssessmentService);
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  private readonly dashboardService = inject(DashboardService);
  
  readonly ROUTE_TOKENS = ROUTE_TOKENS;
  readonly MAIN_VIEW_LINKS = MAIN_VIEW_LINKS;
  readonly MainView = MainView; 
  readonly assessment$: Observable<Assessment> = this.processCoolingService.assessment$;
  readonly isBaselineValid$: Observable<boolean> = this.processCoolingService.isBaselineValid$;
  readonly isButtonDisabled$: Observable<boolean> = this.assessment$.pipe(
    map(assessment => !assessment.processCooling.setupDone || this.mainView() === 'baseline')
  );

  mainView: Signal<string> = this.processCoolingUiService.mainView;
  bannerCollapsed: boolean = true;

  ngOnInit(): void {
  }

  collapseBanner() {
    // this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', {shouldCollapse: false});
  }

  showSecurityAndPrivacyModal() {
    // this.securityAndPrivacyService.modalOpen.next(true);
    // this.securityAndPrivacyService.showSecurityAndPrivacyModal.next(true);
  }

  changeTab() {
    // if (str == 'baseline' || str == 'diagram' || this.isBaselineValid) {
    //   this.mainTab.set(str);
    // }
    // this.collapseBanner();
  }

  selectModification() {
    // this.processCoolingUiService.showModificationListModalSignal.set(true);
  }
  
  openExportModal(){
    // this.processCoolingUiService.showExportModalSignal.set(true);
  }

  emailAssessment() {
    // this.emailMeasurDataService.measurItemAttachment = {
    //   itemType: 'assessment',
    //   itemName: this.assessment.name,
    //   itemData: this.assessment
    // }
    // this.emailMeasurDataService.emailItemType.next('ProcessCooling');
    // this.emailMeasurDataService.showEmailMeasurDataModal.next(true);
  }

  
  next() {
    this.processCoolingUiService.continue();
  }

  back() {
    this.processCoolingUiService.back();
  }

  get canContinue(): boolean {
    return this.processCoolingUiService.canContinue();
  }

  get canGoBack(): boolean {
    return this.processCoolingUiService.canGoBack();
  }
}

