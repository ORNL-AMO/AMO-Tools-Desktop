import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-slag',
  standalone: false,
  templateUrl: './slag.component.html',
  styleUrl: './slag.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlagComponent {}
