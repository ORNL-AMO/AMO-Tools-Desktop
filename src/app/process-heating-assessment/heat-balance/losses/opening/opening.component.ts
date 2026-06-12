import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-opening',
  standalone: false,
  templateUrl: './opening.component.html',
  styleUrl: './opening.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpeningComponent {}
