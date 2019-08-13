import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CompressedAirPressureReductionTreasureHunt, OpportunitySheet, TreasureHunt } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirPressureReductionResults } from '../../../shared/models/standalone';
import { CompressedAirPressureReductionService } from '../../../calculator/utilities/compressed-air-pressure-reduction/compressed-air-pressure-reduction.service';

@Component({
  selector: 'app-compressed-air-pressure-reduction-card',
  templateUrl: './compressed-air-pressure-reduction-card.component.html',
  styleUrls: ['./compressed-air-pressure-reduction-card.component.css']
})
export class CompressedAirPressureReductionCardComponent implements OnInit {
  @Input()
  compressedAirPressureReduction: CompressedAirPressureReductionTreasureHunt;
  @Input()
  settings: Settings;
  @Input()
  index: number;
  @Output('emitEditOpportunitySheet')
  emitEditOpportunitySheet = new EventEmitter<OpportunitySheet>();
  @Output('emitEditCompressedAirPressureReduction')
  emitEditCompressedAirPressureReduction = new EventEmitter<CompressedAirPressureReductionTreasureHunt>();
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

  compressedAirPressureReductionResults: CompressedAirPressureReductionResults;
  percentSavings: number;
  hideCard: boolean = false;
  constructor(private compressedAirPressureReductionService: CompressedAirPressureReductionService) { }

  ngOnInit() {

    this.compressedAirPressureReductionResults = this.compressedAirPressureReductionService.getResults(this.settings, this.compressedAirPressureReduction.baseline, this.compressedAirPressureReduction.modification);
    this.percentSavings = (this.compressedAirPressureReductionResults.annualCostSavings / this.treasureHunt.currentEnergyUsage.electricityCosts) * 100;

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.displayCalculatorType || changes.displayEnergyType) {
      this.checkHideCard();
    }
  }

  checkHideCard() {
    if (this.displayEnergyType == 'Electricity' || this.displayEnergyType == 'All') {
      if (this.displayCalculatorType == 'All' || this.displayCalculatorType == 'Compressed Air Pressure Reduction') {
        this.hideCard = false;
      } else {
        this.hideCard = true;
      }
    } else {
      this.hideCard = true;
    }
  }

  editOpportunitySheet() {
    this.emitEditOpportunitySheet.emit(this.compressedAirPressureReduction.opportunitySheet);
  }

  editCompressedAirPressureReduction() {
    this.emitEditCompressedAirPressureReduction.emit(this.compressedAirPressureReduction);
  }

  toggleSelected() {
    this.compressedAirPressureReduction.selected = !this.compressedAirPressureReduction.selected;
    this.emitSaveTreasureHunt.emit(true);
  }

  deletedItem() {
    let name: string = 'Compressed Air Pressure Reduction #' + (this.index + 1);
    if (this.compressedAirPressureReduction.opportunitySheet && this.compressedAirPressureReduction.opportunitySheet.name) {
      name = this.compressedAirPressureReduction.opportunitySheet.name;
    }
    this.emitDeleteItem.emit(name);
  }
}
