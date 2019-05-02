import { Component, OnInit, Input } from '@angular/core';
import { OpportunitiesPaybackDetails } from '../../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-opportunity-payback-bar-chart',
  templateUrl: './opportunity-payback-bar-chart.component.html',
  styleUrls: ['./opportunity-payback-bar-chart.component.css']
})
export class OpportunityPaybackBarChartComponent implements OnInit {
  @Input()
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;
  constructor() { }

  ngOnInit() {
  }

}
