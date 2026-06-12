import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-flue-gas',
  standalone: false,
  templateUrl: './flue-gas.component.html',
  styleUrl: './flue-gas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlueGasComponent {}
