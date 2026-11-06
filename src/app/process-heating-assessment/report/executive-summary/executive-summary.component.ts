import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, Signal, viewChild } from '@angular/core';
import { InvalidModification, ProcessHeatingValidityService } from '../../services/process-heating-validity.service';
import { ExecutiveSummaryResultsService, ExecutiveSummaryUI } from './executive-summary-results.service';

@Component({
  selector: 'app-executive-summary',
  standalone: false,
  templateUrl: './executive-summary.component.html',
  styleUrls: ['./executive-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutiveSummaryComponent {
  private readonly executiveSummaryResultsService = inject(ExecutiveSummaryResultsService);

  readonly executiveSummaryUI: Signal<ExecutiveSummaryUI | undefined> = this.executiveSummaryResultsService.executiveSummaryUI;
  readonly invalidModifications: Signal<InvalidModification[]> = inject(ProcessHeatingValidityService).invalidModifications;
  /** Keyed by modification id so each column header shows only its own errors. */
  readonly invalidModificationsById: Signal<Map<string, InvalidModification>> = computed(() =>
    new Map(this.invalidModifications().map(modification => [modification.id, modification]))
  );
  private readonly copyTable = viewChild<ElementRef<HTMLTableElement>>('copyTable');
  copyTableString: string;

  updateCopyTableString(): void {
    this.copyTableString = this.copyTable()?.nativeElement.innerText;
  }
}
