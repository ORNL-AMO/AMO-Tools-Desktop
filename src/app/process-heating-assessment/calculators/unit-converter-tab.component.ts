import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-unit-converter-tab',
  standalone: false,
  template: `<app-unit-converter [inAssessment]="true"></app-unit-converter>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block; width: 100%;' },
})
export class UnitConverterTabComponent {}
