import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CalculatorsService } from './calculators.service';
import { Subscription } from 'rxjs';
import { TreasureHunt, TreasureHuntOpportunity, OpportunitySheet, Treasure, AssessmentOpportunity } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { TreasureHuntService } from '../treasure-hunt.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
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
  customOpportunity: OpportunitySheet | AssessmentOpportunity;

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

  showOpportunitySheetModal() {
    this.calculatorOpportunitySheet = this.calculatorsService.calcOpportunitySheet;
    this.opportunitySheetModal.show();
  }
  hideOpportunitySheetModal() {
    this.opportunitySheetModal.hide();
  }

  hideSaveCalcModal() {
    this.saveCalcModal.hide();
  }

  saveItemOpportunitySheet(updatedOpportunitySheet: OpportunitySheet) {
    this.calculatorOpportunitySheet = updatedOpportunitySheet;
    this.calculatorsService.calcOpportunitySheet = updatedOpportunitySheet;
    this.hideOpportunitySheetModal();
    this.confirmSaveCalc();
  }

  saveCustomOpportunity(customOpportunity: OpportunitySheet | AssessmentOpportunity) {
    this.customOpportunity = customOpportunity;
    this.calculatorOpportunitySheet = this.calculatorsService.calcOpportunitySheet;
    this.confirmSaveCalc();
  }

  saveOpportunity(treasureHuntOpportunity: TreasureHuntOpportunity) {
    this.currentOpportunity = treasureHuntOpportunity;
    this.calculatorOpportunitySheet = this.calculatorsService.calcOpportunitySheet;
    if (this.mainTab == 'find-treasure') {
      this.showOpportunitySheetModal();
    } else {
      this.saveCalcModal.show();
    }
  }

  cancelTreasureHuntOpportunity() {
    this.treasureHuntOpportunityService.cancelTreasureHuntOpportunity(this.selectedCalc);
  }

  confirmSaveCalc() {
    if (this.selectedCalc === Treasure.opportunitySheet || this.selectedCalc === Treasure.assessmentOpportunity) {
      this.customOpportunity.selected = true;
    } else {
      this.currentOpportunity.opportunitySheet = this.calculatorsService.calcOpportunitySheet;
      this.currentOpportunity.selected = true;
    }
    if (this.calculatorsService.isNewOpportunity == true) {
      this.treasureHuntOpportunityService.saveTreasureHuntOpportunity(this.currentOpportunity, this.selectedCalc, this.customOpportunity)
    } else {
      this.treasureHuntOpportunityService.updateTreasureHuntOpportunity(this.currentOpportunity, this.selectedCalc, this.settings, this.customOpportunity);
    }
    this.saveCalcModal.hide(); 
    this.calculatorsService.selectedCalc.next('none');
  }

}
