import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { OpportunitiesPaybackDetails } from '../../../../shared/models/treasure-hunt';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-opportunity-payback-table',
  templateUrl: './opportunity-payback-table.component.html',
  styleUrls: ['./opportunity-payback-table.component.css']
})
export class OpportunityPaybackTableComponent implements OnInit {
  @Input()
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;
  @Input()
  settings: Settings;
  @Input()
  exportToPPT: boolean;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;

  constructor() { }

  ngOnInit() {
    
  }

}
