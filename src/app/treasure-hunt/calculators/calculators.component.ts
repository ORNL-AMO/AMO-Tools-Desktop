import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CalculatorsService } from './calculators.service';
import { Subscription } from 'rxjs';
import { TreasureHunt, AirLeakSurveyTreasureHunt, TreasureHuntOpportunity, OpportunitySheet, TankInsulationReductionTreasureHunt, Treasure } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { TreasureHuntService } from '../treasure-hunt.service';
import { ModalDirective } from 'ngx-bootstrap';
import { AirLeakTreasureHuntService } from '../treasure-hunt-calculator-services/air-leak-treasure-hunt.service';
import { OpportunityCardData, OpportunityCardsService } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import { StandaloneOpportunitySheetService } from '../treasure-hunt-calculator-services/standalone-opportunity-sheet.service';
import { TankInsulationTreasureHuntService } from '../treasure-hunt-calculator-services/tank-insulation-treasure-hunt.service';

@Component({
  selector: 'app-calculators',
  templateUrl: './calculators.component.html',
  styleUrls: ['./calculators.component.css']
})
export class CalculatorsComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('saveCalcModal', { static: false }) public saveCalcModal: ModalDirective;
  @ViewChild('opportunitySheetModal', { static: false }) public opportunitySheetModal: ModalDirective;

  selectedCalc: string;
  selectedCalcSubscription: Subscription;
  treasureHunt: TreasureHunt;
  treasureHuntSub: Subscription;

  calculatorOpportunitySheet: OpportunitySheet;
  mainTab: string;
  mainTabSub: Subscription;
  currentOpportunity: TreasureHuntOpportunity;
  standaloneOpportunitySheet: OpportunitySheet;

  constructor(private calculatorsService: CalculatorsService,
    private opportunityCardsService: OpportunityCardsService,
    private airLeakTreasureHuntService: AirLeakTreasureHuntService,
    private tankInsulationTreasureHuntService: TankInsulationTreasureHuntService,
    private standaloneOpportunitySheetService: StandaloneOpportunitySheetService,
    private treasureHuntService: TreasureHuntService) { }

  ngOnInit() {
    this.selectedCalcSubscription = this.calculatorsService.selectedCalc.subscribe(val => {
      this.selectedCalc = val;
    });
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
    });
    this.mainTabSub = this.treasureHuntService.mainTab.subscribe(val => {
      this.mainTab = val;
    });
  }
  ngOnDestroy() {
    this.selectedCalcSubscription.unsubscribe();
    this.treasureHuntSub.unsubscribe();
    this.calculatorsService.selectedCalc.next('none');
    this.mainTabSub.unsubscribe();
  }

  showSaveCalcModal() {
    this.saveCalcModal.show();
  }
  hideSaveCalcModal() {
    this.saveCalcModal.hide();
  }
  showOpportunitySheetModal() {
    this.calculatorOpportunitySheet = this.calculatorsService.calcOpportunitySheet;
    this.opportunitySheetModal.show();
  }
  hideOpportunitySheetModal() {
    this.opportunitySheetModal.hide();
  }

  saveItemOpportunitySheet(updatedOpportunitySheet: OpportunitySheet) {
    this.calculatorOpportunitySheet = updatedOpportunitySheet;
    this.calculatorsService.calcOpportunitySheet = updatedOpportunitySheet;
    this.hideOpportunitySheetModal();
    if (this.mainTab == 'find-treasure') {
      this.confirmSaveCalc();
    }
  }


  saveOpportunity(treasureHuntOpportunity: TreasureHuntOpportunity) {
    this.currentOpportunity = treasureHuntOpportunity;
    this.calculatorOpportunitySheet = this.calculatorsService.calcOpportunitySheet;
    if (this.mainTab == 'find-treasure' && this.selectedCalc != Treasure.opportunitySheet) {
      this.showOpportunitySheetModal();
    } else {
      this.showSaveCalcModal();
    }
  }

  confirmSaveCalc() {
    if (this.selectedCalc == Treasure.opportunitySheet) {
      this.standaloneOpportunitySheet.selected = true;
    } else {
      this.currentOpportunity.opportunitySheet = this.calculatorsService.calcOpportunitySheet;
      this.currentOpportunity.selected = true;
    }

    if (this.calculatorsService.isNewOpportunity == true) {
      this.saveTreasureHuntOpportunity();
    } else {
      this.updateTreasureHuntOpportunity();
    }
    this.finishSaveCalc();
  }

  initSaveCalc() {
    this.calculatorOpportunitySheet = this.calculatorsService.calcOpportunitySheet;
    if (this.mainTab == 'find-treasure' && this.selectedCalc != Treasure.opportunitySheet) {
      this.showOpportunitySheetModal();
    } else {
      this.showSaveCalcModal();
    }
  }

  finishSaveCalc() {
    this.hideSaveCalcModal();
    this.calculatorsService.selectedCalc.next('none');
  }


  saveTreasureHuntOpportunity() {
    let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
    if (this.selectedCalc === Treasure.airLeak) {
      let airLeakSurveyOpportunity = this.currentOpportunity as AirLeakSurveyTreasureHunt;
      treasureHunt = this.airLeakTreasureHuntService.saveTreasureHuntOpportunity(airLeakSurveyOpportunity, treasureHunt);
    } else if (this.selectedCalc === Treasure.tankInsulation) {
      let tankInsulationReductionTreasureHunt = this.currentOpportunity as TankInsulationReductionTreasureHunt;
      treasureHunt = this.tankInsulationTreasureHuntService.saveTreasureHuntOpportunity(tankInsulationReductionTreasureHunt, treasureHunt);
    } else if (this.selectedCalc === Treasure.opportunitySheet) {
      treasureHunt = this.standaloneOpportunitySheetService.saveTreasureHuntOpportunity(this.standaloneOpportunitySheet, treasureHunt);
    } 

    this.treasureHuntService.treasureHunt.next(treasureHunt);
  }

  cancelTreasureHuntOpportunity() {
    this.calculatorsService.calcOpportunitySheet = undefined
    if (this.selectedCalc === Treasure.airLeak) {
      this.airLeakTreasureHuntService.resetCalculatorInputs();
    } else if (this.selectedCalc === Treasure.tankInsulation) {
      this.tankInsulationTreasureHuntService.resetCalculatorInputs();
    }  else if (this.selectedCalc === Treasure.opportunitySheet) {
      this.calculatorsService.cancelOpportunitySheet();
    }
    

    this.calculatorsService.itemIndex = undefined;
    this.calculatorsService.selectedCalc.next('none');
  }

  updateTreasureHuntOpportunity() {
    let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
    let updatedCard: OpportunityCardData;
    if (this.selectedCalc === Treasure.airLeak) {
      let airLeakSurveyOpportunity = this.currentOpportunity as AirLeakSurveyTreasureHunt;
      treasureHunt.airLeakSurveys[this.calculatorsService.itemIndex] = airLeakSurveyOpportunity;
      updatedCard = this.opportunityCardsService.getAirLeakSurveyCardData(airLeakSurveyOpportunity, this.settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (this.selectedCalc === Treasure.tankInsulation) {
      let tankInsulationOpportunity = this.currentOpportunity as TankInsulationReductionTreasureHunt;
      treasureHunt.tankInsulationReductions[this.calculatorsService.itemIndex] = tankInsulationOpportunity;
      updatedCard = this.opportunityCardsService.getTankInsulationReductionCardData(tankInsulationOpportunity, this.settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (this.selectedCalc === Treasure.opportunitySheet) {
      treasureHunt.opportunitySheets[this.calculatorsService.itemIndex] = this.standaloneOpportunitySheet;
      updatedCard = this.opportunityCardsService.getOpportunitySheetCardData(this.standaloneOpportunitySheet, this.settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
   
    }
    
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    this.treasureHuntService.treasureHunt.next(treasureHunt);
  }

  saveStandaloneOpportunitySheet(opportunitySheet: OpportunitySheet) {
    this.standaloneOpportunitySheet = opportunitySheet;
    this.initSaveCalc();
  }


}
