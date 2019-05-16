import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ElectricityReductionTreasureHunt, TreasureHunt, OpportunitySheet } from '../../../shared/models/treasure-hunt';
import { ElectricityReductionResults } from '../../../shared/models/standalone';
import { ElectricityReductionService } from '../../../calculator/utilities/electricity-reduction/electricity-reduction.service';

@Component({
  selector: 'app-electricity-reduction-card',
  templateUrl: './electricity-reduction-card.component.html',
  styleUrls: ['./electricity-reduction-card.component.css']
})
export class ElectricityReductionCardComponent implements OnInit {
  @Input()
  electricityReduction: ElectricityReductionTreasureHunt;
  @Input()
  settings: Settings;
  @Input()
  index: number;
  @Output('emitEditOpportunitySheet')
  emitEditOpportunitySheet = new EventEmitter<OpportunitySheet>();
  @Output('emitEditElectricityReduction')
  emitEditElectricityReduction = new EventEmitter<ElectricityReductionTreasureHunt>();
  @Input()
  treasureHunt: TreasureHunt;
  @Output('emitDeleteLightingReplacement')
  emitDeleteLightingReplacement = new EventEmitter<string>();
  @Output('emitSaveTreasureHunt')
  emitSaveTreasureHunt = new EventEmitter<boolean>();

  electricityReductionResults: ElectricityReductionResults;
  percentSavings: number;
  constructor(private electricityReductionService: ElectricityReductionService) { }

  ngOnInit() {
    this.electricityReductionResults = this.electricityReductionService.getResults(this.settings, this.electricityReduction.baseline, this.electricityReduction.modification);
    this.percentSavings = (this.electricityReductionResults.annualCostSavings / this.treasureHunt.currentEnergyUsage.electricityCosts) * 100;
  }

  editOpportunitySheet() {
    this.emitEditOpportunitySheet.emit(this.electricityReduction.opportunitySheet);
  }

  editElectricityReduction() {
    this.emitEditElectricityReduction.emit(this.electricityReduction);
  }

  toggleSelected() {
    this.electricityReduction.selected = !this.electricityReduction.selected;
    this.emitSaveTreasureHunt.emit(true);
  }

  deleteLighting() {
    let name: string = 'Electricity Replacement #' + (this.index + 1);
    if (this.electricityReduction.opportunitySheet && this.electricityReduction.opportunitySheet.name) {
      name = this.electricityReduction.opportunitySheet.name;
    }
    this.emitDeleteLightingReplacement.emit(name);
  }
}
