import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-extended-surface',
  standalone: false,
  templateUrl: './extended-surface.component.html',
  styleUrl: './extended-surface.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExtendedSurfaceComponent {}
