import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Treasure, OpportunitySheet, TreasureHunt } from '../../shared/models/treasure-hunt';
import { OpportunitySheetService } from './standalone-opportunity-sheet/opportunity-sheet.service';
import { AirLeakTreasureHuntService } from '../treasure-hunt-calculator-services/air-leak-treasure-hunt.service';
import { OpportunityCardData, OpportunityCardsService } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import { Settings } from '../../shared/models/settings';
import { StandaloneOpportunitySheetService } from '../treasure-hunt-calculator-services/standalone-opportunity-sheet.service';
import { TankInsulationTreasureHuntService } from '../treasure-hunt-calculator-services/tank-insulation-treasure-hunt.service';

@Injectable()
export class CalculatorsService {

  selectedCalc: BehaviorSubject<string>;
  itemIndex: number;
  isNewOpportunity: boolean;
  calcOpportunitySheet: OpportunitySheet;
  constructor(
    private opportunityCardsService: OpportunityCardsService,
    private opportunitySheetService: OpportunitySheetService, 
    private airLeakTreasureHuntService: AirLeakTreasureHuntService,
    private tankInsulationTreasureHuntService: TankInsulationTreasureHuntService,
    private standaloneOpportunitySheetService: StandaloneOpportunitySheetService
    ) {
    this.selectedCalc = new BehaviorSubject<string>('none');
  }
  
  cancelOpportunitySheet() {
    this.opportunitySheetService.opportunitySheet = undefined;
  }

  displaySelectedCalculator(calculatorType: string) {
    this.calcOpportunitySheet = undefined;
    this.isNewOpportunity = true;

    if (calculatorType === Treasure.airLeak) {
      this.airLeakTreasureHuntService.initNewCalculator();
    } else if (calculatorType === Treasure.tankInsulation) {
      this.tankInsulationTreasureHuntService.initNewCalculator();
    } else if (calculatorType === Treasure.opportunitySheet) {
      this.opportunitySheetService.opportunitySheet = undefined;
    }
    this.selectedCalc.next(calculatorType);
  }

  copyOpportunity(opportunityCardData: OpportunityCardData, treasureHunt: TreasureHunt, settings: Settings): OpportunityCardData {
    if (opportunityCardData.opportunityType === Treasure.airLeak) {
      opportunityCardData.airLeakSurvey.opportunitySheet = this.updateCopyName(opportunityCardData.airLeakSurvey.opportunitySheet);
      this.airLeakTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.airLeakSurvey, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getAirLeakSurveyCardData(opportunityCardData.airLeakSurvey, settings, treasureHunt.airLeakSurveys.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.tankInsulation) {
      opportunityCardData.tankInsulationReduction.opportunitySheet = this.updateCopyName(opportunityCardData.tankInsulationReduction.opportunitySheet);
      this.tankInsulationTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.tankInsulationReduction, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getTankInsulationReductionCardData(opportunityCardData.tankInsulationReduction, settings, treasureHunt.tankInsulationReductions.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType == Treasure.opportunitySheet) {
      opportunityCardData.opportunitySheet = this.updateCopyName(opportunityCardData.opportunitySheet);
      this.standaloneOpportunitySheetService.saveTreasureHuntOpportunity(opportunityCardData.opportunitySheet, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getOpportunitySheetCardData(opportunityCardData.opportunitySheet, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);
    }

    return opportunityCardData;
  }

  editOpportunityFromCard(opportunityCardData: OpportunityCardData) {
    // oppcarddata.oppsheet appears to be the same as opportunutiyCardData.airLeakSurvey.oppsheet
    this.calcOpportunitySheet = opportunityCardData.opportunitySheet;
    this.isNewOpportunity = false;
    this.itemIndex = opportunityCardData.opportunityIndex;

    if (opportunityCardData.opportunityType === Treasure.airLeak) {
      this.airLeakTreasureHuntService.setCalculatorInputFromOpportunity(opportunityCardData.airLeakSurvey);
    } else if (opportunityCardData.opportunityType === Treasure.tankInsulation) {
      this.tankInsulationTreasureHuntService.setCalculatorInputFromOpportunity(opportunityCardData.tankInsulationReduction);
    } else if (opportunityCardData.opportunityType === Treasure.opportunitySheet) {
      this.opportunitySheetService.opportunitySheet = opportunityCardData.opportunitySheet;
    }

    this.selectedCalc.next(opportunityCardData.opportunityType);
  }

  saveOpportunityChanges(opportunityCardData: OpportunityCardData, treasureHunt: TreasureHunt, settings, updateSelectedState?: boolean): TreasureHunt {
    if (opportunityCardData.opportunityType === Treasure.airLeak) {
      opportunityCardData.airLeakSurvey.selected = opportunityCardData.selected;
      treasureHunt.airLeakSurveys[opportunityCardData.opportunityIndex] = opportunityCardData.airLeakSurvey;
      let updatedCard: OpportunityCardData = this.opportunityCardsService.getAirLeakSurveyCardData(opportunityCardData.airLeakSurvey, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);
      this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);

    } else if (opportunityCardData.opportunityType === Treasure.tankInsulation) {
      opportunityCardData.tankInsulationReduction.selected = opportunityCardData.selected;
      treasureHunt.tankInsulationReductions[opportunityCardData.opportunityIndex] = opportunityCardData.tankInsulationReduction;
      let updatedCard: OpportunityCardData = this.opportunityCardsService.getTankInsulationReductionCardData(opportunityCardData.tankInsulationReduction, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);
      this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);

    } else if (opportunityCardData.opportunityType === Treasure.opportunitySheet) {
      opportunityCardData.opportunitySheet.selected = opportunityCardData.selected;
      treasureHunt.opportunitySheets[opportunityCardData.opportunityIndex] = opportunityCardData.opportunitySheet;
      let updatedCard: OpportunityCardData = this.opportunityCardsService.getOpportunitySheetCardData(opportunityCardData.opportunitySheet, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);
      this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    }

    return treasureHunt;
  }

  deleteOpportunity(deleteOpportunity: OpportunityCardData, treasureHunt: TreasureHunt): TreasureHunt {
    if (deleteOpportunity.opportunityType === Treasure.airLeak) {
      treasureHunt = this.airLeakTreasureHuntService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt);
    } else if (deleteOpportunity.opportunityType === Treasure.tankInsulation) {
      this.tankInsulationTreasureHuntService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
    } else if (deleteOpportunity.opportunityType === Treasure.opportunitySheet) {
      this.standaloneOpportunitySheetService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
    }

    return treasureHunt;
  }

  updateCopyName(oppSheet: OpportunitySheet): OpportunitySheet {
    if (oppSheet) {
      oppSheet.name = oppSheet.name + ' (copy)';
      return oppSheet;
    } else { return }
  }

}
