import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-wall-losses',
  standalone: false,
  templateUrl: './wall-losses.component.html',
  styleUrl: './wall-losses.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WallLossesComponent {}
