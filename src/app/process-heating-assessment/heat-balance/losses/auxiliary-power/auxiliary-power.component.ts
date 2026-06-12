import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-auxiliary-power',
  standalone: false,
  templateUrl: './auxiliary-power.component.html',
  styleUrl: './auxiliary-power.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuxiliaryPowerComponent {}
