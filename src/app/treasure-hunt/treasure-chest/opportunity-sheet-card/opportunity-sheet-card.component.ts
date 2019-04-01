import { Component, OnInit, Input } from '@angular/core';
import { OpportunitySheet } from '../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-opportunity-sheet-card',
  templateUrl: './opportunity-sheet-card.component.html',
  styleUrls: ['./opportunity-sheet-card.component.css']
})
export class OpportunitySheetCardComponent implements OnInit {
  @Input()
  opportunitySheet: OpportunitySheet;

  dropdownOpen: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  showDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
}
