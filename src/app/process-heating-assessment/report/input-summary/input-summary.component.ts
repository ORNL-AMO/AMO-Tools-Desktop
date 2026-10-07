import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { InputSummaryResultsService, InputSummaryUI } from './input-summary-results.service';

@Component({
  selector: 'app-input-summary',
  standalone: false,
  templateUrl: './input-summary.component.html',
  styleUrls: ['./input-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputSummaryComponent {
  private readonly inputSummaryResultsService = inject(InputSummaryResultsService);

  readonly inputSummaryUI: Signal<InputSummaryUI | undefined> = this.inputSummaryResultsService.inputSummaryUI;
}
