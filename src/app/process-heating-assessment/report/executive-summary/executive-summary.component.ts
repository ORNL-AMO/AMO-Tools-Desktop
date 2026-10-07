import { ChangeDetectionStrategy, Component, ElementRef, inject, Signal, viewChild } from '@angular/core';
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
  private readonly copyTable = viewChild<ElementRef<HTMLTableElement>>('copyTable');
  copyTableString: string;

  updateCopyTableString(): void {
    this.copyTableString = this.copyTable()?.nativeElement.innerText;
  }
}
