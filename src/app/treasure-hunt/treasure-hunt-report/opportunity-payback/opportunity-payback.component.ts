import { Component, OnInit, Input } from '@angular/core';
import { OpportunitiesPaybackDetails } from '../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-opportunity-payback',
  templateUrl: './opportunity-payback.component.html',
  styleUrls: ['./opportunity-payback.component.css']
})
export class OpportunityPaybackComponent implements OnInit {
  @Input()
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;

  constructor() { }

  ngOnInit() {
  }

}
