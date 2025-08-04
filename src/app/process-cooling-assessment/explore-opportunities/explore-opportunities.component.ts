import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-explore-opportunities',
  standalone: false,
  templateUrl: './explore-opportunities.component.html',
  styleUrl: './explore-opportunities.component.css'
})
export class ExploreOpportunitiesComponent {
  smallScreenTab: string = 'details';

  setSmallScreenTab(tab:string) {
    this.smallScreenTab = tab;
  }

}
