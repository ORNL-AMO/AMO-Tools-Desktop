import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-other',
  standalone: false,
  templateUrl: './other.component.html',
  styleUrl: './other.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OtherComponent {}
