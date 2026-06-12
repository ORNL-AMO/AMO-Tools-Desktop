import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-gas-leakage',
  standalone: false,
  templateUrl: './gas-leakage.component.html',
  styleUrl: './gas-leakage.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GasLeakageComponent {}
