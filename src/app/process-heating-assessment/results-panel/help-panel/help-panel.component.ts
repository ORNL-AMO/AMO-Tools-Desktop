import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';
import { ROUTE_TOKENS } from '../../constants/process-heating-routes';

@Component({
  selector: 'app-process-heating-help-panel',
  standalone: false,
  templateUrl: './help-panel.component.html',
  styleUrl: './help-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpPanelComponent {
  private readonly uiService = inject(ProcessHeatingUiService);

  readonly ROUTE_TOKENS = ROUTE_TOKENS;
  readonly childView: Signal<string> = this.uiService.childView;
  readonly lossSubView: Signal<string> = this.uiService.lossSubView;
}
