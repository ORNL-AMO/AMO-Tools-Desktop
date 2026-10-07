import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-results-data',
  standalone: false,
  template: `<div class="panel-container p-3"><h4>Result Data</h4><p class="text-muted">Not yet implemented.</p></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsDataComponent {}
