import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { OpportunitySheet, OpportunitySheetResults, TreasureHunt, TreasureHuntResults } from '../../../shared/models/treasure-hunt';
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
  @Input()
  displayCalculatorType: string;
  @Input()
  displayEnergyType: string;
  @Input()
  treasureHuntResults: TreasureHuntResults;

  dropdownOpen: boolean = false;
  opportunityResults: OpportunitySheetResults;
  percentSavings: number;
  hideCard: boolean = false;
  energyTypes: Array<string>;
  totalBaselineCost: number;

  percentCompressedAirSavings: number = 0;
  percentElectricitySavings: number = 0;
  percentNaturalGasSavings: number = 0;
  percentOtherFuelSavings: number = 0;
  percentSteamSavings: number = 0;
  percentWaterSavings: number = 0;
  percentWasteWaterSavings: number = 0;
  constructor(private opportunitySheetService: OpportunitySheetService) { }

  ngOnInit() {
    this.opportunityResults = this.opportunitySheetService.getResults(this.opportunitySheet, this.settings);
    this.setPercentSavings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.displayCalculatorType || changes.displayEnergyType) && this.opportunityResults != undefined) {
      this.setEnergyTypes();
      this.checkHideCard();
    }
  }

  setPercentSavings() {
    if (this.opportunityResults.compressedAirResults.energyCostSavings != 0) {
      this.percentCompressedAirSavings = (this.opportunityResults.compressedAirResults.energyCostSavings / this.treasureHunt.currentEnergyUsage.compressedAirCosts) * 100;
    }
    if (this.opportunityResults.electricityResults.energyCostSavings != 0) {
      this.percentElectricitySavings = (this.opportunityResults.electricityResults.energyCostSavings / this.treasureHunt.currentEnergyUsage.electricityCosts) * 100;
    }
    if (this.opportunityResults.gasResults.energyCostSavings != 0) {
      this.percentNaturalGasSavings = (this.opportunityResults.gasResults.energyCostSavings / this.treasureHunt.currentEnergyUsage.naturalGasCosts) * 100;
    }
    if (this.opportunityResults.otherFuelResults.energyCostSavings != 0) {
      this.percentOtherFuelSavings = (this.opportunityResults.otherFuelResults.energyCostSavings / this.treasureHunt.currentEnergyUsage.otherFuelCosts) * 100;
    }
    if (this.opportunityResults.steamResults.energyCostSavings != 0) {
      this.percentSteamSavings = (this.opportunityResults.steamResults.energyCostSavings / this.treasureHunt.currentEnergyUsage.steamCosts) * 100;
    }
    if (this.opportunityResults.waterResults.energyCostSavings != 0) {
      this.percentWaterSavings = (this.opportunityResults.waterResults.energyCostSavings / this.treasureHunt.currentEnergyUsage.waterCosts) * 100;
    }
    if (this.opportunityResults.wasteWaterResults.energyCostSavings != 0) {
      this.percentWasteWaterSavings = (this.opportunityResults.wasteWaterResults.energyCostSavings / this.treasureHunt.currentEnergyUsage.wasteWaterCosts) * 100;
    }
  }

  setEnergyTypes() {
    this.energyTypes = new Array<string>();
    if (this.opportunityResults.compressedAirResults.baselineEnergyUse != 0) {
      this.energyTypes.push('Compressed Air');
    }
    if (this.opportunityResults.electricityResults.baselineEnergyUse != 0) {
      this.energyTypes.push('Electricity');
    }
    if (this.opportunityResults.gasResults.baselineEnergyUse != 0) {
      this.energyTypes.push('Natural Gas');
    }
    if (this.opportunityResults.otherFuelResults.baselineEnergyUse != 0) {
      this.energyTypes.push('Other Fuel');
    }
    if (this.opportunityResults.steamResults.baselineEnergyUse != 0) {
      this.energyTypes.push('Steam');
    }
    if (this.opportunityResults.waterResults.baselineEnergyUse != 0) {
      this.energyTypes.push('Water');
    }
    if (this.opportunityResults.wasteWaterResults.baselineEnergyUse != 0) {
      this.energyTypes.push('Waste Water');
    }

  }

  checkEnergyTypes(): boolean {
    this.energyTypes.forEach(type => {
      if (type == this.displayEnergyType) {
        return true;
      }
    })
    return false;
  }


  checkHideCard() {
    let isEnergyType: boolean = this.checkEnergyTypes();
    if (isEnergyType || this.displayEnergyType == 'All') {
      if (this.displayCalculatorType == 'All' || this.displayCalculatorType == 'Other') {
        this.hideCard = false;
      } else {
        this.hideCard = true;
      }
    } else {
      this.hideCard = true;
    }
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
