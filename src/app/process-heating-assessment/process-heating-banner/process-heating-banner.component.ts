import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { DashboardService } from '../../dashboard/dashboard.service';
import { MAIN_VIEW_LINKS, ViewLink } from '../models/views';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';

@Component({
  selector: 'app-process-heating-banner',
  standalone: false,
  templateUrl: './process-heating-banner.component.html',
  styleUrl: './process-heating-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessHeatingBannerComponent {
  private readonly uiService = inject(ProcessHeatingUiService);
  private readonly dashboardService = inject(DashboardService);

  readonly MAIN_VIEW_LINKS = MAIN_VIEW_LINKS;
  readonly mainView: Signal<string> = this.uiService.mainView;
  readonly canContinue: Signal<boolean> = this.uiService.canContinue;
  readonly canGoBack: Signal<boolean> = this.uiService.canGoBack;
  bannerCollapsed = true;

  navigateHome() {
    this.dashboardService.navigateWithSidebarOptions('/landing-screen', { shouldCollapse: false });
  }

  collapseBanner() {
    this.bannerCollapsed = !this.bannerCollapsed;
    window.dispatchEvent(new Event('resize'));
  }

  isLinkDisabled(link: ViewLink): boolean {
    return !this.uiService.canVisitView(link.view);
  }

  handleCanNavigate(event: MouseEvent, link: ViewLink): boolean {
    if (this.isLinkDisabled(link)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    return true;
  }

  next() { this.uiService.continue(); }
  back() { this.uiService.back(); }
}
