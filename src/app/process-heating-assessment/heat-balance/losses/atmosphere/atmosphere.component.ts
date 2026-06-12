import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-atmosphere',
  standalone: false,
  templateUrl: './atmosphere.component.html',
  styleUrl: './atmosphere.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AtmosphereComponent {}
