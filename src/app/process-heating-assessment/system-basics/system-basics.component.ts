import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-system-basics',
  standalone: false,
  templateUrl: './system-basics.component.html',
  styleUrl: './system-basics.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemBasicsComponent {}
