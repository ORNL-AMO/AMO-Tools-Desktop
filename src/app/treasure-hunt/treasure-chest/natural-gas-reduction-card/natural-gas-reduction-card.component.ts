import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NaturalGasReductionTreasureHunt, OpportunitySheet, TreasureHunt } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { NaturalGasReductionResults } from '../../../shared/models/standalone';
import { NaturalGasReductionService } from '../../../calculator/utilities/natural-gas-reduction/natural-gas-reduction.service';

@Component({
  selector: 'app-natural-gas-reduction-card',
  templateUrl: './natural-gas-reduction-card.component.html',
  styleUrls: ['./natural-gas-reduction-card.component.css']
})
export class NaturalGasReductionCardComponent implements OnInit {
  @Input()
  naturalGasReduction: NaturalGasReductionTreasureHunt;
  @Input()
  settings: Settings;
  @Input()
  index: number;
  @Output('emitEditOpportunitySheet')
  emitEditOpportunitySheet = new EventEmitter<OpportunitySheet>();
  @Output('emitEditNaturalGasReduction')
  emitEditNaturalGasReduction = new EventEmitter<NaturalGasReductionTreasureHunt>();
  @Input()
  treasureHunt: TreasureHunt;
  @Output('emitDeleteLightingReplacement')
  emitDeleteLightingReplacement = new EventEmitter<string>();
  @Output('emitSaveTreasureHunt')
  emitSaveTreasureHunt = new EventEmitter<boolean>();


  naturalGasReductionResults: NaturalGasReductionResults;
  percentSavings: number;
  constructor(private naturalGasReductionService: NaturalGasReductionService) { }

  ngOnInit() {
    this.naturalGasReductionResults = this.naturalGasReductionService.getResults(this.settings, this.naturalGasReduction.baseline, this.naturalGasReduction.modification);
    this.percentSavings = (this.naturalGasReductionResults.annualEnergySavings / this.treasureHunt.currentEnergyUsage.naturalGasCosts) * 100;
  }

  editOpportunitySheet() {
    this.emitEditOpportunitySheet.emit(this.naturalGasReduction.opportunitySheet);
  }

  editNaturalGasReduction() {
    this.emitEditNaturalGasReduction.emit(this.naturalGasReduction);
  }

  toggleSelected() {
    this.naturalGasReduction.selected = !this.naturalGasReduction.selected;
    this.emitSaveTreasureHunt.emit(true);
  }

  deleteLighting() {
    let name: string = 'Natural Gas Replacement #' + (this.index + 1);
    if (this.naturalGasReduction.opportunitySheet && this.naturalGasReduction.opportunitySheet.name) {
      name = this.naturalGasReduction.opportunitySheet.name;
    }
    this.emitDeleteLightingReplacement.emit(name);
  }
}
