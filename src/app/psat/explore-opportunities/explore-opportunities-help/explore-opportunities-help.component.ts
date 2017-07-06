import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-explore-opportunities-help',
  templateUrl: './explore-opportunities-help.component.html',
  styleUrls: ['./explore-opportunities-help.component.css']
})
export class ExploreOpportunitiesHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }
}
