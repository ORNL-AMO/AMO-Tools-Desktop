import { Component, OnInit, Input } from '@angular/core';
import { OpportunitiesPaybackDetails } from '../../../../shared/models/treasure-hunt';
@Component({
  selector: 'app-opportunity-payback-table',
  templateUrl: './opportunity-payback-table.component.html',
  styleUrls: ['./opportunity-payback-table.component.css']
})
export class OpportunityPaybackTableComponent implements OnInit {
  @Input()
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;

  constructor() { }

  ngOnInit() {
  }

}
