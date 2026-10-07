import { ChangeDetectionStrategy, Component, ElementRef, inject, Signal, viewChild } from '@angular/core';
import { EnergySummaryResultsService, EnergySummaryUI } from './energy-summary-results.service';

@Component({
  selector: 'app-energy-summary',
  standalone: false,
  templateUrl: './energy-summary.component.html',
  styleUrls: ['./energy-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnergySummaryComponent {
  private readonly energySummaryResultsService = inject(EnergySummaryResultsService);

  readonly energySummaryUI: Signal<EnergySummaryUI | undefined> = this.energySummaryResultsService.energySummaryUI;
  private readonly sourcesTable = viewChild<ElementRef<HTMLTableElement>>('sourcesTable');
  private readonly comparisonTable = viewChild<ElementRef<HTMLTableElement>>('comparisonTable');
  sourcesTableString: string;
  comparisonTableString: string;

  updateSourcesTableString(): void {
    this.sourcesTableString = this.sourcesTable()?.nativeElement.innerText;
  }

  updateComparisonTableString(): void {
    this.comparisonTableString = this.comparisonTable()?.nativeElement.innerText;
  }
}
