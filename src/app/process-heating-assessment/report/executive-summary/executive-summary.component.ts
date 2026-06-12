import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-executive-summary',
  standalone: false,
  template: `<div class="panel-container p-3"><h4>Executive Summary</h4><p class="text-muted">Placeholder — implemented in Step 16.</p></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutiveSummaryComponent {}
