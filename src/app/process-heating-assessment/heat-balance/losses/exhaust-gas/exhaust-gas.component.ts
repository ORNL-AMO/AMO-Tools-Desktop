import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-exhaust-gas',
  standalone: false,
  templateUrl: './exhaust-gas.component.html',
  styleUrl: './exhaust-gas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExhaustGasComponent {}
