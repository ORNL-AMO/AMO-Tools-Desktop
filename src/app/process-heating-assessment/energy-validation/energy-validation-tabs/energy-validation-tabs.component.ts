import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ENERGY_VALIDATION_VIEW_LINKS, ViewLink } from '../../models/views';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { TabNavHelper } from '../../services/tab-nav-helper.service';

@Component({
  selector: 'app-energy-validation-tabs',
  standalone: false,
  templateUrl: './energy-validation-tabs.component.html',
  styleUrl: './energy-validation-tabs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnergyValidationTabsComponent {
  private readonly uiService = inject(ProcessHeatingUiService);
  private readonly tabNavHelper = inject(TabNavHelper);

  readonly ENERGY_VALIDATION_VIEW_LINKS = ENERGY_VALIDATION_VIEW_LINKS;
  readonly canContinue: Signal<boolean> = this.uiService.canContinue;
  readonly canGoBack: Signal<boolean> = this.uiService.canGoBack;

  isTabInvalid(link: ViewLink): boolean {
    return this.tabNavHelper.isTabInvalid(link);
  }

  invalidTabLabel(link: ViewLink): string | null {
    return this.tabNavHelper.invalidTabLabel(link);
  }

  continue() { this.uiService.continue(); }
  back() { this.uiService.back(); }
}
