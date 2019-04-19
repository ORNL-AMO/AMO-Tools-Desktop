import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OpportunitySheet, OpportunitySheetResults, TreasureHunt } from '../../../shared/models/treasure-hunt';
import { OpportunitySheetService } from '../../standalone-opportunity-sheet/opportunity-sheet.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-opportunity-sheet-card',
  templateUrl: './opportunity-sheet-card.component.html',
  styleUrls: ['./opportunity-sheet-card.component.css']
})
export class OpportunitySheetCardComponent implements OnInit {
  @Input()
  opportunitySheet: OpportunitySheet;
  @Output('emitEditOpportunitySheet')
  emitEditOpportunitySheet = new EventEmitter<OpportunitySheet>();
  @Input()
  settings: Settings;
  @Input()
  treasureHunt: TreasureHunt;
  @Output('emitSaveTreasureHunt')
  emitSaveTreasureHunt = new EventEmitter<boolean>();
  @Output('emitDeleteOpportunity')
  emitDeleteOpportunity = new EventEmitter<string>();
  @Input()
  index: number;

  dropdownOpen: boolean = false;
  opportunityResults: OpportunitySheetResults;
  percentSavings: number;
  constructor(private opportunitySheetService: OpportunitySheetService) { }

  ngOnInit() {
    this.opportunityResults = this.opportunitySheetService.getResults(this.opportunitySheet, this.settings);
    this.percentSavings = (this.opportunityResults.totalCostSavings / (this.treasureHunt.currentEnergyUsage.electricityCosts + this.treasureHunt.currentEnergyUsage.naturalGasCosts + this.treasureHunt.currentEnergyUsage.otherFuelCosts)) * 100;
  }

  editOpportunitySheet() {
    this.emitEditOpportunitySheet.emit(this.opportunitySheet);
  }

  toggleSelected() {
    this.opportunitySheet.selected = !this.opportunitySheet.selected;
    this.emitSaveTreasureHunt.emit(true);
  }

  deleteOpportunitySheet() {
    let name: string = 'Opportunity Sheet #' + (this.index + 1)
    if (this.opportunitySheet.name) {
      name = this.opportunitySheet.name;
    }
    this.emitDeleteOpportunity.emit(name);
  }
}
