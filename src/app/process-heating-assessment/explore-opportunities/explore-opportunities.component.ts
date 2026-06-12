import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-explore-opportunities',
  standalone: false,
  templateUrl: './explore-opportunities.component.html',
  styleUrl: './explore-opportunities.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExploreOpportunitiesComponent {}
