import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ViewLink } from '../../models/views';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { TabNavHelper } from '../../services/tab-nav-helper.service';

@Component({
  selector: 'app-heat-balance-loss-tabs',
  standalone: false,
  templateUrl: './heat-balance-loss-tabs.component.html',
  styleUrl: './heat-balance-loss-tabs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeatBalanceLossTabsComponent {
  private readonly uiService = inject(ProcessHeatingUiService);
  private readonly tabNavHelper = inject(TabNavHelper);

  readonly visibleHeatBalanceTabs: Signal<ViewLink[]> = this.uiService.visibleHeatBalanceTabs;
  readonly lossSubView: Signal<string> = this.uiService.lossSubView;
  readonly canContinue: Signal<boolean> = this.uiService.canContinue;
  readonly canGoBack: Signal<boolean> = this.uiService.canGoBack;

  isLinkDisabled(link: ViewLink): boolean {
    return this.tabNavHelper.isLinkDisabled(link);
  }

  handleCanNavigate(event: MouseEvent, link: ViewLink): boolean {
    return this.tabNavHelper.handleCanNavigate(event, link);
  }

  continue() { this.uiService.continue(); }
  back() { this.uiService.back(); }
}
