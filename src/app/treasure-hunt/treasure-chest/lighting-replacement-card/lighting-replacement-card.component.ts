import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
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
  @Output('emitDeleteItem')
  emitDeleteItem = new EventEmitter<string>();
  @Output('emitSaveTreasureHunt')
  emitSaveTreasureHunt = new EventEmitter<boolean>();
  @Input()
  displayCalculatorType: string;
  @Input()
  displayEnergyType: string;

  lightingReplacementResults: LightingReplacementResults;
  percentSavings: number;
  hideCard: boolean = false;
  constructor(private lightingReplacementService: LightingReplacementService) { }

  ngOnInit() {
    this.lightingReplacementResults = this.lightingReplacementService.getResults(this.replacement);
    this.percentSavings = (this.lightingReplacementResults.totalCostSavings / this.treasureHunt.currentEnergyUsage.electricityCosts) * 100;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.displayCalculatorType || changes.displayEnergyType) {
      this.checkHideCard();
    }
  }

  checkHideCard() {
    if (this.displayEnergyType == 'Electricity' || this.displayEnergyType == 'All') {
      if (this.displayCalculatorType == 'All' || this.displayCalculatorType == 'Lighting Replacement') {
        this.hideCard = false;
      } else {
        this.hideCard = true;
      }
    } else {
      this.hideCard = true;
    }
  }

  editOpportunitySheet() {
    this.emitEditOpportunitySheet.emit(this.replacement.opportunitySheet);
  }

  editLighting() {
    this.emitEditLighting.emit(this.replacement);
  }

  toggleSelected() {
    this.replacement.selected = !this.replacement.selected;
    this.emitSaveTreasureHunt.emit(true);
  }

  deleteItem() {
    let name: string = 'Lighting Replacement #' + (this.index + 1);
    if (this.replacement.opportunitySheet && this.replacement.opportunitySheet.name) {
      name = this.replacement.opportunitySheet.name;
    }
    this.emitDeleteItem.emit(name);
  }
}
