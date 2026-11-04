import { Component, computed, inject, Signal } from '@angular/core';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-assessment.service';
import { map, Observable } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { ROUTE_TOKENS } from '../constants/process-cooling-routes';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';
import { MAIN_VIEW_LINKS, MainView, ViewLink } from '../models/views';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { SecurityAndPrivacyItemComponent } from '../../shared/security-and-privacy/security-and-privacy-item/security-and-privacy-item.component';
import { ExportItemComponent } from '../../shared/import-export/export-item/export-item.component';
import { EmailMeasurDataItemComponent } from '../../shared/email-measur-data/email-measur-data-item/email-measur-data-item.component';
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
  private readonly modalDialogService = inject(ModalDialogService);

  readonly ROUTE_TOKENS = ROUTE_TOKENS;
  readonly MAIN_VIEW_LINKS = MAIN_VIEW_LINKS;
  readonly MainView = MainView; 
  readonly assessment$: Observable<Assessment> = this.processCoolingService.assessment$;

  mainView: Signal<string> = this.processCoolingUiService.mainView;
  readonly currentMainLink: Signal<ViewLink | undefined> = computed(() => MAIN_VIEW_LINKS.find(link => link.view === this.mainView()));
  bannerCollapsed: boolean = true;
  readonly canContinue: Signal<boolean> = this.processCoolingUiService.canContinueMainTab;
  readonly canGoBack: Signal<boolean> = this.processCoolingUiService.canGoBackMainTab;

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', {shouldCollapse: false});
  }

  showSecurityAndPrivacyModal() {
    this.modalDialogService.openModal(
      SecurityAndPrivacyItemComponent,
      SecurityAndPrivacyItemComponent.getDialogConfig()
    );
  }

  openExportModal() {
    this.modalDialogService.openModal(
      ExportItemComponent,
      {
        width: 'min(600px, 95vw)',
        data: {
          inAssessment: true,
          assessment: this.processCoolingService.assessmentValue
        }
      }
    );
  }

  emailAssessment() {
    const assessment = this.processCoolingService.assessmentValue;
    this.modalDialogService.openModal(
      EmailMeasurDataItemComponent,
      {
        width: 'min(800px, 95vw)',
        data: {
          measurItemAttachment: {
            itemType: 'assessment',
            itemName: assessment.name,
            itemData: assessment
          }
        }
      }
    );
  }

  
  continue() {
    this.processCoolingUiService.continueMainTab();
  }

  back() {
    this.processCoolingUiService.backMainTab();
  }


  isLinkDisabled(link: ViewLink): boolean {
    return !this.processCoolingUiService.canVisitView(link.view);
  }

  handleCanNavigate(event: MouseEvent, link: ViewLink): boolean {
    if (this.isLinkDisabled(link)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    } else {
      return true;
    }
  }

  selectSmallScreenLink(event: MouseEvent, link: ViewLink) {
    if (this.handleCanNavigate(event, link)) {
      this.collapseBanner();
    }
  }
}

