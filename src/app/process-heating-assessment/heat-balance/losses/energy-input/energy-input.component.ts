import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-energy-input',
  standalone: false,
  templateUrl: './energy-input.component.html',
  styleUrl: './energy-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnergyInputComponent {}
