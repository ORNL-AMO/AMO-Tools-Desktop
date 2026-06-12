import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';

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
  readonly mainView: Signal<string> = this.uiService.mainView;
  readonly childView: Signal<string> = this.uiService.childView;
}
