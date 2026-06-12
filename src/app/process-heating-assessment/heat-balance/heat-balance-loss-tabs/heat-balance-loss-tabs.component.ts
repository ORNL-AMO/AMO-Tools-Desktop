import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { HEAT_BALANCE_VIEW_LINKS, ViewLink } from '../../models/views';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';

@Component({
  selector: 'app-heat-balance-loss-tabs',
  standalone: false,
  templateUrl: './heat-balance-loss-tabs.component.html',
  styleUrl: './heat-balance-loss-tabs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeatBalanceLossTabsComponent {
  private readonly uiService = inject(ProcessHeatingUiService);

  readonly HEAT_BALANCE_VIEW_LINKS = HEAT_BALANCE_VIEW_LINKS;
  readonly lossSubView: Signal<string> = this.uiService.lossSubView;
  readonly canContinue: Signal<boolean> = this.uiService.canContinue;
  readonly canGoBack: Signal<boolean> = this.uiService.canGoBack;

  isLinkDisabled(_link: ViewLink): boolean {
    return false; // pathway gating added in Step 2
  }

  handleCanNavigate(event: MouseEvent, link: ViewLink): boolean {
    if (this.isLinkDisabled(link)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    return true;
  }

  continue() { this.uiService.continue(); }
  back() { this.uiService.back(); }
}
