import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CompressedAirReductionTreasureHunt, OpportunitySheet, TreasureHunt } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirReductionResults } from '../../../shared/models/standalone';
import { CompressedAirReductionService } from '../../../calculator/utilities/compressed-air-reduction/compressed-air-reduction.service';

@Component({
  selector: 'app-compressed-air-reduction-card',
  templateUrl: './compressed-air-reduction-card.component.html',
  styleUrls: ['./compressed-air-reduction-card.component.css']
})
export class CompressedAirReductionCardComponent implements OnInit {
  @Input()
  compressedAirReduction: CompressedAirReductionTreasureHunt;
  @Input()
  settings: Settings;
  @Input()
  index: number;
  @Output('emitEditOpportunitySheet')
  emitEditOpportunitySheet = new EventEmitter<OpportunitySheet>();
  @Output('emitEditCompressedAirReduction')
  emitEditCompressedAirReduction = new EventEmitter<CompressedAirReductionTreasureHunt>();
  @Input()
  treasureHunt: TreasureHunt;
  @Output('emitDeleteItem')
  emitDeleteItem = new EventEmitter<string>();
  @Output('emitSaveTreasureHunt')
  emitSaveTreasureHunt = new EventEmitter<boolean>();

  compressedAirReductionResults: CompressedAirReductionResults;
  percentSavings: number;
  constructor(private compressedAirReductionService: CompressedAirReductionService) { }

  ngOnInit() {
    this.compressedAirReductionResults = this.compressedAirReductionService.getResults(this.settings, this.compressedAirReduction.baseline, this.compressedAirReduction.modification);
    this.percentSavings = (this.compressedAirReductionResults.annualCostSavings / this.treasureHunt.currentEnergyUsage.compressedAirCosts) * 100;
  }

  editOpportunitySheet() {
    this.emitEditOpportunitySheet.emit(this.compressedAirReduction.opportunitySheet);
  }

  editCompressedAirReduction() {
    this.emitEditCompressedAirReduction.emit(this.compressedAirReduction);
  }

  toggleSelected() {
    this.compressedAirReduction.selected = !this.compressedAirReduction.selected;
    this.emitSaveTreasureHunt.emit(true);
  }

  deletedItem() {
    let name: string = 'Compressed Air Reduction #' + (this.index + 1);
    if (this.compressedAirReduction.opportunitySheet && this.compressedAirReduction.opportunitySheet.name) {
      name = this.compressedAirReduction.opportunitySheet.name;
    }
    this.emitDeleteItem.emit(name);
  }
}
