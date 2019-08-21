import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { WaterReductionTreasureHunt, OpportunitySheet, TreasureHunt } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { WaterReductionResults } from '../../../shared/models/standalone';
import { WaterReductionService } from '../../../calculator/utilities/water-reduction/water-reduction.service';

@Component({
  selector: 'app-water-reduction-card',
  templateUrl: './water-reduction-card.component.html',
  styleUrls: ['./water-reduction-card.component.css']
})
export class WaterReductionCardComponent implements OnInit {
  @Input()
  waterReduction: WaterReductionTreasureHunt;
  @Input()
  settings: Settings;
  @Input()
  index: number;
  @Output('emitEditOpportunitySheet')
  emitEditOpportunitySheet = new EventEmitter<OpportunitySheet>();
  @Output('emitEditWaterReduction')
  emitEditWaterReduction = new EventEmitter<WaterReductionTreasureHunt>();
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

  waterReductionResults: WaterReductionResults;
  percentSavings: number;
  hideCard: boolean = false;
  energyType: string = 'Water';
  constructor(private waterReductionService: WaterReductionService) { }

  ngOnInit() {

    this.waterReductionResults = this.waterReductionService.getResults(this.settings, this.waterReduction.baseline, this.waterReduction.modification);
    let utilityCost: number = this.treasureHunt.currentEnergyUsage.waterCosts;
    //electricity utility
    if (this.waterReduction.baseline[0].isWastewater == true) {
      this.energyType = 'Waste Water';
      utilityCost = this.treasureHunt.currentEnergyUsage.wasteWaterCosts;
    }
    this.percentSavings = (this.waterReductionResults.annualCostSavings / utilityCost) * 100;

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.displayCalculatorType || changes.displayEnergyType) {
      this.checkHideCard();
    }
  }

  checkHideCard() {
    if (this.displayEnergyType == this.energyType || this.displayEnergyType == 'All') {
      if (this.displayCalculatorType == 'All' || this.displayCalculatorType == 'Water Reduction') {
        this.hideCard = false;
      } else {
        this.hideCard = true;
      }
    } else {
      this.hideCard = true;
    }
  }

  editOpportunitySheet() {
    this.emitEditOpportunitySheet.emit(this.waterReduction.opportunitySheet);
  }

  editWaterReduction() {
    this.emitEditWaterReduction.emit(this.waterReduction);
  }

  toggleSelected() {
    this.waterReduction.selected = !this.waterReduction.selected;
    this.emitSaveTreasureHunt.emit(true);
  }

  deletedItem() {
    let name: string = 'Water Reduction #' + (this.index + 1);
    if (this.waterReduction.opportunitySheet && this.waterReduction.opportunitySheet.name) {
      name = this.waterReduction.opportunitySheet.name;
    }
    this.emitDeleteItem.emit(name);
  }
}
