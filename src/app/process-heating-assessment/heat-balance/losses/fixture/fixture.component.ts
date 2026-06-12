import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-fixture',
  standalone: false,
  templateUrl: './fixture.component.html',
  styleUrl: './fixture.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FixtureComponent {}
