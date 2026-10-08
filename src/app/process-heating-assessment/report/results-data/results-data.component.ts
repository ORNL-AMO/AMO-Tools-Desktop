import { ChangeDetectionStrategy, Component, ElementRef, inject, Signal, viewChild } from '@angular/core';
import { ResultsDataResultsService, ResultsDataUI } from './results-data-results.service';

@Component({
  selector: 'app-results-data',
  standalone: false,
  templateUrl: './results-data.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsDataComponent {
  private readonly resultsDataResultsService = inject(ResultsDataResultsService);

  readonly resultsDataUI: Signal<ResultsDataUI | undefined> = this.resultsDataResultsService.resultsDataUI;
  private readonly copyTable = viewChild<ElementRef<HTMLTableElement>>('copyTable');
  copyTableString: string;

  updateCopyTableString(): void {
    this.copyTableString = this.copyTable()?.nativeElement.innerText;
  }
}
