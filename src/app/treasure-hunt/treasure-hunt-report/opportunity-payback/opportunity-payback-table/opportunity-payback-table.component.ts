import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { OpportunitiesPaybackDetails } from '../../../../shared/models/treasure-hunt';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-opportunity-payback-table',
    templateUrl: './opportunity-payback-table.component.html',
    styleUrls: ['./opportunity-payback-table.component.css'],
    standalone: false
})
export class OpportunityPaybackTableComponent implements OnInit {
  @Input()
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;
  @Input()
  settings: Settings;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor() { }

  ngOnInit() {
    
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
}
