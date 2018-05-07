import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-explore-opportunities-form',
  templateUrl: './explore-opportunities-form.component.html',
  styleUrls: ['./explore-opportunities-form.component.css']
})
export class ExploreOpportunitiesFormComponent implements OnInit {
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit() {
  }

}
