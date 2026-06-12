import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { ROUTE_TOKENS } from '../constants/process-heating-routes';

@Component({
  selector: 'app-baseline',
  standalone: false,
  templateUrl: './baseline.component.html',
  styleUrl: './baseline.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'height: 100%; display: flex; flex-direction: column; overflow: hidden;' }
})
export class BaselineComponent {
  private readonly uiService = inject(ProcessHeatingUiService);

  smallScreenPanelTab: string = 'help';
  isModalOpen: boolean = false;
  readonly ROUTE_TOKENS = ROUTE_TOKENS;

  readonly showResultsPanel: Signal<boolean> = this.uiService.showResultsPanel;
}
  