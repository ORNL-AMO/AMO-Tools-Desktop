import { Component, OnInit, Input } from '@angular/core';
import { OpportunitySheetResults, OpportunitySheet } from '../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-opportunity-sheet-results',
  templateUrl: './opportunity-sheet-results.component.html',
  styleUrls: ['./opportunity-sheet-results.component.css']
})
export class OpportunitySheetResultsComponent implements OnInit {
  @Input()
  opportunitySheetResults: OpportunitySheetResults;
  @Input()
  opportunitySheet: OpportunitySheet;
  constructor() { }

  ngOnInit() {
  }
}
