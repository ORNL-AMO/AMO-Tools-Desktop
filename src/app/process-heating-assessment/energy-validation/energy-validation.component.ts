import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-energy-validation',
  standalone: false,
  templateUrl: './energy-validation.component.html',
  styleUrl: './energy-validation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'height: 100%; display: flex; flex-direction: column; overflow: hidden;' }
})
export class EnergyValidationComponent {}
