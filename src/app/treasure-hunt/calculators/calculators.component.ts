import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CalculatorsService } from './calculators.service';
import { Subscription } from 'rxjs';
import { TreasureHunt, TreasureHuntOpportunity, OpportunitySheet, Treasure } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { TreasureHuntService } from '../treasure-hunt.service';
import { ModalDirective } from 'ngx-bootstrap';
import { TreasureHuntOpportunityService } from '../treasure-hunt-calculator-services/treasure-hunt-opportunity.service';

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
    private treasureHuntOpportunityService: TreasureHuntOpportunityService,
     private treasureHuntService: TreasureHuntService
    ) { }

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
    if (this.mainTab == 'find-treasure' && this.selectedCalc !== Treasure.opportunitySheet) {
      this.showOpportunitySheetModal();
    } else {
      this.showSaveCalcModal();
    }
  }

  confirmSaveCalc() {
    if (this.selectedCalc === Treasure.opportunitySheet) {
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
    if (this.mainTab == 'find-treasure' && this.selectedCalc !== Treasure.opportunitySheet) {
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
    this.treasureHuntOpportunityService.saveTreasureHuntOpportunity(this.currentOpportunity, this.selectedCalc, this.standaloneOpportunitySheet)
  }

  cancelTreasureHuntOpportunity() {
    this.treasureHuntOpportunityService.cancelTreasureHuntOpportunity(this.selectedCalc);
  }

  updateTreasureHuntOpportunity() {
    this.treasureHuntOpportunityService.updateTreasureHuntOpportunity(this.currentOpportunity, this.selectedCalc, this.settings, this.standaloneOpportunitySheet);
  }

  saveStandaloneOpportunitySheet(opportunitySheet: OpportunitySheet) {
    this.standaloneOpportunitySheet = opportunitySheet;
    this.initSaveCalc();
  }


}
