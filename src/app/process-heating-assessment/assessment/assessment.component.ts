import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-assessment',
  standalone: false,
  template: `<router-outlet></router-outlet>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssessmentComponent {}
