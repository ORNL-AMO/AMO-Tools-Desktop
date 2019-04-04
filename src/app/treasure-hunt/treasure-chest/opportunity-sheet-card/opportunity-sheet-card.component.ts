import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OpportunitySheet } from '../../../shared/models/treasure-hunt';

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

  dropdownOpen: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  showDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  editOpportunitySheet(){
    this.emitEditOpportunitySheet.emit(this.opportunitySheet);
  }
}
