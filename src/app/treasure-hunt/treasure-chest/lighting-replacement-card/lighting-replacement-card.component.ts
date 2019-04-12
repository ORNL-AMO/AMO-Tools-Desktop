import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LightingReplacementTreasureHunt, OpportunitySheet, TreasureHunt } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { LightingReplacementResults } from '../../../shared/models/lighting';
import { LightingReplacementService } from '../../../calculator/lighting/lighting-replacement/lighting-replacement.service';

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
  @Input()
  treasureHunt: TreasureHunt;

  dropdownOpen: boolean = false;
  lightingReplacementResults: LightingReplacementResults;
  percentSavings: number;
  constructor(private lightingReplacementService: LightingReplacementService) { }

  ngOnInit() {
    this.lightingReplacementResults = this.lightingReplacementService.getResults(this.replacement);
    this.percentSavings = this.lightingReplacementResults.totalCostSavings / this.treasureHunt.currentEnergyUsage.electricityCosts;
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

  toggleSelected() {
    this.replacement.selected = !this.replacement.selected;
  }
}
