import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-facility-info',
  standalone: false,
  template: `<div class="panel-container p-3"><h4>Facility Info</h4><p class="text-muted">Placeholder — implemented in Step 16.</p></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FacilityInfoComponent {}
