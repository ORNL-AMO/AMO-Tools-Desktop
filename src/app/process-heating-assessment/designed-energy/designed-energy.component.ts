import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-designed-energy',
  standalone: false,
  templateUrl: './designed-energy.component.html',
  styleUrl: './designed-energy.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesignedEnergyComponent {}
