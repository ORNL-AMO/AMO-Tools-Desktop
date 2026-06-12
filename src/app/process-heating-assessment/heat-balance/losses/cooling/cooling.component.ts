import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cooling',
  standalone: false,
  templateUrl: './cooling.component.html',
  styleUrl: './cooling.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoolingComponent {}
