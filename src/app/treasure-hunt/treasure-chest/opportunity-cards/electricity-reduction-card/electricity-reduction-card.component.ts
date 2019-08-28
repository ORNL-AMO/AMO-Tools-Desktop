import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { ElectricityReductionTreasureHunt, TreasureHunt, OpportunitySheet } from '../../../../shared/models/treasure-hunt';
import { ElectricityReductionResults } from '../../../../shared/models/standalone';
import { ElectricityReductionService } from '../../../../calculator/utilities/electricity-reduction/electricity-reduction.service';

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
  @Output('emitDeleteItem')
  emitDeleteItem = new EventEmitter<string>();
  @Output('emitSaveTreasureHunt')
  emitSaveTreasureHunt = new EventEmitter<boolean>();
  @Input()
  displayCalculatorType: string;
  @Input()
  displayEnergyType: string;


  electricityReductionResults: ElectricityReductionResults;
  percentSavings: number;
  hideCard: boolean = false;
  constructor(private electricityReductionService: ElectricityReductionService) { }

  ngOnInit() {
    this.electricityReductionResults = this.electricityReductionService.getResults(this.settings, this.electricityReduction.baseline, this.electricityReduction.modification);
    this.percentSavings = (this.electricityReductionResults.annualCostSavings / this.treasureHunt.currentEnergyUsage.electricityCosts) * 100;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.displayCalculatorType || changes.displayEnergyType) {
      this.checkHideCard();
    }
  }

  checkHideCard() {
    if (this.displayEnergyType == 'Electricity' || this.displayEnergyType == 'All') {
      if (this.displayCalculatorType == 'All' || this.displayCalculatorType == 'Electricity Reduction') {
        this.hideCard = false;
      } else {
        this.hideCard = true;
      }
    } else {
      this.hideCard = true;
    }
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

  deletedItem() {
    let name: string = 'Electricity Replacement #' + (this.index + 1);
    if (this.electricityReduction.opportunitySheet && this.electricityReduction.opportunitySheet.name) {
      name = this.electricityReduction.opportunitySheet.name;
    }
    this.emitDeleteItem.emit(name);
  }
}
