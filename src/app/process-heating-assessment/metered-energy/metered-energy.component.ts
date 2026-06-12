import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-metered-energy',
  standalone: false,
  templateUrl: './metered-energy.component.html',
  styleUrl: './metered-energy.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeteredEnergyComponent {}
