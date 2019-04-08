import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LightingReplacementTreasureHunt, OpportunitySheet } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-lighting-replacement-card',
  templateUrl: './lighting-replacement-card.component.html',
  styleUrls: ['./lighting-replacement-card.component.css']
})
export class LightingReplacementCardComponent implements OnInit {
  @Input()
  replacement: LightingReplacementTreasureHunt;
  @Input()
  settings: Settings;
  @Input()
  index: number;
  @Output('emitEditOpportunitySheet')
  emitEditOpportunitySheet = new EventEmitter<OpportunitySheet>();
  @Output('emitEditLighting')
  emitEditLighting = new EventEmitter<LightingReplacementTreasureHunt>();

  dropdownOpen: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  showDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  editOpportunitySheet() {
    this.emitEditOpportunitySheet.emit(this.replacement.opportunitySheet);
  }

  editLighting() {
    this.emitEditLighting.emit(this.replacement);
  }
}
