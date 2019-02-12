import { Component, OnInit } from '@angular/core';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-explore-opportunities-help',
  templateUrl: './explore-opportunities-help.component.html',
  styleUrls: ['./explore-opportunities-help.component.css']
})
export class ExploreOpportunitiesHelpComponent implements OnInit {

  currentField: string;
  currentTab: string;

  currentTabSubscription: Subscription;
  currentFieldSubscription: Subscription;
  constructor(private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit() {
    this.currentTabSubscription = this.exploreOpportunitiesService.currentTab.subscribe(val => {
      this.currentTab = val;
    })
    this.currentFieldSubscription = this.exploreOpportunitiesService.currentField.subscribe(val => {
      this.currentField = val;
    })
  }

  ngOnDestroy(){
    this.currentFieldSubscription.unsubscribe();
    this.currentTabSubscription.unsubscribe();
  }

}
