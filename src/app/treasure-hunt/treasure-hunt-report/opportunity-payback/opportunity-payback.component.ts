import { Component, OnInit, Input } from '@angular/core';
import { OpportunitiesPaybackDetails } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-opportunity-payback',
    templateUrl: './opportunity-payback.component.html',
    styleUrls: ['./opportunity-payback.component.css'],
    standalone: false
})
export class OpportunityPaybackComponent implements OnInit {
  @Input()
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;
  @Input()
  showPrint: boolean;
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }

}
