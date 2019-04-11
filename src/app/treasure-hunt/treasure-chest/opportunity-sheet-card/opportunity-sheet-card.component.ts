import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OpportunitySheet, OpportunitySheetResults } from '../../../shared/models/treasure-hunt';
import { OpportunitySheetService } from '../../standalone-opportunity-sheet/opportunity-sheet.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-opportunity-sheet-card',
  templateUrl: './opportunity-sheet-card.component.html',
  styleUrls: ['./opportunity-sheet-card.component.css']
})
export class OpportunitySheetCardComponent implements OnInit {
  @Input()
  opportunitySheet: OpportunitySheet;
  @Output('emitEditOpportunitySheet')
  emitEditOpportunitySheet = new EventEmitter<OpportunitySheet>();
  @Input()
  settings: Settings;

  dropdownOpen: boolean = false;
  opportunityResults: OpportunitySheetResults;
  constructor(private opportunitySheetService: OpportunitySheetService) { }

  ngOnInit() {
    this.opportunityResults = this.opportunitySheetService.getResults(this.opportunitySheet, this.settings);
  }

  showDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  editOpportunitySheet(){
    this.emitEditOpportunitySheet.emit(this.opportunitySheet);
  }
}
