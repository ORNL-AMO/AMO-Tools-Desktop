import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { BASELINE_VIEW_LINKS, ViewLink } from '../../models/views';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { TabNavHelper } from '../../services/tab-nav-helper.service';

@Component({
  selector: 'app-baseline-tabs',
  standalone: false,
  templateUrl: './baseline-tabs.component.html',
  styleUrl: './baseline-tabs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaselineTabsComponent {
  private readonly uiService = inject(ProcessHeatingUiService);
  private readonly tabNavHelper = inject(TabNavHelper);

  readonly BASELINE_VIEW_LINKS = BASELINE_VIEW_LINKS;
  readonly childView: Signal<string> = this.uiService.childView;
  readonly canContinue: Signal<boolean> = this.uiService.canContinue;

  isLinkDisabled(link: ViewLink): boolean {
    return this.tabNavHelper.isLinkDisabled(link);
  }

  handleCanNavigate(event: MouseEvent, link: ViewLink): boolean {
    return this.tabNavHelper.handleCanNavigate(event, link);
  }

  continue() { this.uiService.continue(); }
  back() { this.uiService.back(); }
}
