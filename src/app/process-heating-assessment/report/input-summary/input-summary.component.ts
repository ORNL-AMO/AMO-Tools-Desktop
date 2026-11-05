import { ChangeDetectionStrategy, Component, inject, signal, Signal } from '@angular/core';
import { ReportTableRow } from '../../../shared/report-builder/models/report-ui-models';
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
  readonly expandedCategories = signal<ReadonlySet<string>>(new Set());
  readonly copyTableStrings = signal<ReadonlyMap<string, string>>(new Map());

  toggleCategory(label: string): void {
    const next = new Set(this.expandedCategories());
    next.has(label) ? next.delete(label) : next.add(label);
    this.expandedCategories.set(next);
  }

  /** @returns true when any modification's value differs from baseline for the row */
  rowDiffers(row: ReportTableRow): boolean {
    return row.modifications.some(modification => modification.value !== row.baseline.value);
  }

  updateCopyTableString(label: string, table: HTMLElement): void {
    this.copyTableStrings.update(current => new Map(current).set(label, table.innerText));
  }
}
