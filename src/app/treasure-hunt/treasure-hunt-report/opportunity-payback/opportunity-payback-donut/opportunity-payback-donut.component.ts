import { Component, OnInit, Input } from '@angular/core';
import { OpportunitiesPaybackDetails } from '../../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-opportunity-payback-donut',
  templateUrl: './opportunity-payback-donut.component.html',
  styleUrls: ['./opportunity-payback-donut.component.css']
})
export class OpportunityPaybackDonutComponent implements OnInit {
  @Input()
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;
  constructor() { }

  ngOnInit() {
  }

}
