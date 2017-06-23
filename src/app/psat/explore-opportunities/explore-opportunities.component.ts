import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-explore-opportunities',
  templateUrl: './explore-opportunities.component.html',
  styleUrls: ['./explore-opportunities.component.css']
})
export class ExploreOpportunitiesComponent implements OnInit {

  showOption1: string;
  showOption2: string;
  showOption3: string;
  
  showHours1: string;
  showHours2: string;
  showHours3: string;
  constructor() { }

  ngOnInit() {
  }

}
