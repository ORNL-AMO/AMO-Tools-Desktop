import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-charge-material',
  standalone: false,
  templateUrl: './charge-material.component.html',
  styleUrl: './charge-material.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChargeMaterialComponent {}
