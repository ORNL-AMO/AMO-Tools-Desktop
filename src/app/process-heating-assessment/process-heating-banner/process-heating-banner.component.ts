import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { DashboardService } from '../../dashboard/dashboard.service';
import { MAIN_VIEW_LINKS, MainView, ViewLink } from '../models/views';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { TabNavHelper } from '../services/tab-nav-helper.service';
import { toLegacyJustifiAssessment } from '../services/legacy-justifi-assessment.util';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { SecurityAndPrivacyItemComponent } from '../../shared/security-and-privacy/security-and-privacy-item/security-and-privacy-item.component';
import { ExportItemComponent } from '../../shared/import-export/export-item/export-item.component';
import { ShareDataDialogComponent } from '../../shared/share-data-dialog/share-data-dialog.component';

@Component({
  selector: 'app-process-heating-banner',
  standalone: false,
  templateUrl: './process-heating-banner.component.html',
  styleUrl: './process-heating-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessHeatingBannerComponent {
  private readonly uiService = inject(ProcessHeatingUiService);
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly dashboardService = inject(DashboardService);
  private readonly tabNavHelper = inject(TabNavHelper);
  private readonly modalDialogService = inject(ModalDialogService);

  readonly MAIN_VIEW_LINKS = MAIN_VIEW_LINKS;
  readonly assessment$: Observable<Assessment> = this.assessmentService.assessment$;
  readonly mainView: Signal<string> = this.uiService.mainView;
  readonly canContinue: Signal<boolean> = this.uiService.canContinue;
  readonly canGoBack: Signal<boolean> = this.uiService.canGoBack;
  readonly blockedReason: Signal<string | undefined> = this.uiService.blockedReason;
  bannerCollapsed = true;

  readonly furnaceSubtitle: Signal<string> = computed(() => {
    const settings = this.assessmentService.settingsSignal();
    if (!settings) {
      return '';
    }
    if (settings.energySourceType === 'Fuel') {
      return 'Fuel-fired';
    }
    if (settings.energySourceType === 'Steam') {
      return 'Steam-based';
    }
    return settings.furnaceType === 'Custom Electrotechnology' ? `${settings.furnaceType}: ${settings.customFurnaceName}` : settings.furnaceType;
  });

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', { shouldCollapse: false });
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event('resize'));
  }

  showSecurityAndPrivacyModal(): void {
    this.bannerCollapsed = true;
    this.modalDialogService.openModal(SecurityAndPrivacyItemComponent, SecurityAndPrivacyItemComponent.getDialogConfig());
  }

  openExportModal(): void {
    this.bannerCollapsed = true;
    this.modalDialogService.openModal(ExportItemComponent, {
      width: '600px',
      data: { inAssessment: true, assessment: this.assessmentService.assessmentValue },
    });
  }

  openShareDataModal(): void {
    this.bannerCollapsed = true;
    const assessment = this.assessmentService.assessmentValue;
    this.modalDialogService.openModal(ShareDataDialogComponent, {
      width: '600px',
      data: {
        measurItemAttachment: { itemType: 'assessment', itemName: assessment.name, itemData: assessment },
        justifiAssessment: toLegacyJustifiAssessment(assessment, this.uiService.canVisitView(MainView.REPORT)),
      },
    });
  }

  isLinkDisabled(link: ViewLink): boolean {
    return this.tabNavHelper.isLinkDisabled(link);
  }

  handleCanNavigate(event: MouseEvent, link: ViewLink): boolean {
    return this.tabNavHelper.handleCanNavigate(event, link);
  }

  next() { this.uiService.continue(); }
  back() { this.uiService.back(); }
}
