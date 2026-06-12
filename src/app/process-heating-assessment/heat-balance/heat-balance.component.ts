import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-heat-balance',
  standalone: false,
  templateUrl: './heat-balance.component.html',
  styleUrl: './heat-balance.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'height: 100%; display: flex; flex-direction: column; overflow: hidden;' }
})
export class HeatBalanceComponent {}
