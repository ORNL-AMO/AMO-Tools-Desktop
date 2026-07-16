import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { TreasureHunt, OpportunitySheet } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { OpportunityCardsService, OpportunityCardData } from './opportunity-cards.service';
import { CalculatorsService } from '../../calculators/calculators.service';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { TreasureChestMenuService } from '../treasure-chest-menu/treasure-chest-menu.service';
import { SortCardsData } from './sort-cards-by.pipe';
import { AssessmentIntegrationService } from '../../../shared/assessment-integration/assessment-integration.service';

@Component({
    selector: 'app-opportunity-cards',
    templateUrl: './opportunity-cards.component.html',
    styleUrls: ['./opportunity-cards.component.css'],
    standalone: false
})
export class OpportunityCardsComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('deletedOpportunityModal', { static: false }) public deletedOpportunityModal: ModalDirective;
  @ViewChild('opportunitySheetModal', { static: false }) public opportunitySheetModal: ModalDirective;

  opportunityCardList: Array<OpportunityCardData>;
  treasureHuntSub: Subscription;
  treasureHunt: TreasureHunt;
  deleteOpportunityCard: OpportunityCardData;
  editOpportunitySheetCardData: OpportunityCardData;
  modifyDataIndex: number;
  updatedOpportunityCardSub: Subscription;
  selectAllSub: Subscription;
  sortBySub: Subscription;
  sortByVal: SortCardsData;
  updateOpportunityCardsSub: Subscription;
  deselectAllSub: Subscription;
  constructor(private opportunityCardsService: OpportunityCardsService, private calculatorsService: CalculatorsService, private treasureHuntService: TreasureHuntService,
    private treasureChestMenuService: TreasureChestMenuService,
    private assessmentIntegrationService: AssessmentIntegrationService) { }

  ngOnInit() {
    this.updateOpportunityCardsSub = this.opportunityCardsService.updateOpportunityCards.subscribe(async val => {
      if (val == true) {
        this.treasureHunt = this.treasureHuntService.treasureHunt.getValue();
        this.opportunityCardList = this.opportunityCardsService.getOpportunityCardsData(this.treasureHunt, this.settings);
        await this.opportunityCardsService.checkAssessmentOpportunityStaleness(this.opportunityCardList, this.settings);
        this.opportunityCardList = Array.from(this.opportunityCardList);
        this.opportunityCardsService.opportunityCards.next(this.opportunityCardList);
        this.opportunityCardsService.updateOpportunityCards.next(false);
      }
    });
    this.updatedOpportunityCardSub = this.opportunityCardsService.updatedOpportunityCard.subscribe(updatedOpportunityCard => {
      if (updatedOpportunityCard) {
        // must create new array ref to rerender pipe
        let opportunityCardList: OpportunityCardData[] = Array.from(this.opportunityCardList);
        opportunityCardList[this.modifyDataIndex] = updatedOpportunityCard;
        this.opportunityCardList = opportunityCardList;
        this.updateAllIndexes();
        this.opportunityCardsService.updatedOpportunityCard.next(undefined);
        this.updateopportunityCardList();
      }
    });
    this.selectAllSub = this.treasureChestMenuService.selectAll.subscribe(val => {
      if (val == true) {
        this.selectAll();
      }
    });
    this.sortBySub = this.treasureChestMenuService.sortBy.subscribe(val => {
      // Trigger pipe input change from new input ref
      this.opportunityCardList = Array.from(this.opportunityCardList);
      this.sortByVal = val;
    });
    this.deselectAllSub = this.treasureChestMenuService.deselectAll.subscribe(val => {
      if (val == true) {
        this.deselectAll();
      }
    });

  }

  ngOnDestroy() {
    this.updatedOpportunityCardSub.unsubscribe();
    this.selectAllSub.unsubscribe();
    this.deselectAllSub.unsubscribe();
    this.sortBySub.unsubscribe();
    this.updateOpportunityCardsSub.unsubscribe();
    this.opportunityCardsService.updateOpportunityCards.next(true);
    this.opportunityCardsService.updatedOpportunityCard.next(undefined);
  }

  updateopportunityCardList() {
    this.opportunityCardsService.opportunityCards.next(this.opportunityCardList);
  }

  editOpportunity(opportunityCard: OpportunityCardData) {
    this.modifyDataIndex = opportunityCard.index;
    this.calculatorsService.editOpportunityFromCard(opportunityCard);
  }

  //delete
  setDeleteOpportunity(cardOpportunity: OpportunityCardData) {
    this.modifyDataIndex = cardOpportunity.index;
    this.deleteOpportunityCard = cardOpportunity;
    this.showDeleteOpportunityModal();
  }
  showDeleteOpportunityModal() {
    this.deletedOpportunityModal.show();
  }
  hideDeleteOpportunityModal() {
    this.deleteOpportunityCard = undefined;
    this.deletedOpportunityModal.hide();
  }

  deleteOpportunity() {
    this.opportunityCardList.splice(this.modifyDataIndex, 1);
        // must create new array ref to rerender pipe
    let updatedOpportunityCards: OpportunityCardData[] = Array.from(this.opportunityCardList);
    this.opportunityCardList = updatedOpportunityCards;
    this.updateOpportunityIndexesAfterDelete();
    let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
    treasureHunt = this.calculatorsService.deleteOpportunity(this.deleteOpportunityCard, treasureHunt);

    this.treasureHuntService.treasureHunt.next(treasureHunt);
    this.hideDeleteOpportunityModal();
    this.updateopportunityCardList();
  }

  updateOpportunityIndexesAfterDelete() {
    this.opportunityCardList.forEach(card => {
      if (card.opportunityType == this.deleteOpportunityCard.opportunityType && card.opportunityIndex > this.deleteOpportunityCard.opportunityIndex) {
        card.opportunityIndex = card.opportunityIndex - 1;
      }
    })
    this.updateAllIndexes();
  }

  updateAllIndexes() {
    let index: number = 0;
    this.opportunityCardList.forEach(card => {
      card.index = index;
      index++;
    })
  }

  editOpportunitySheet(cardData: OpportunityCardData) {
    this.modifyDataIndex = cardData.index;
    this.editOpportunitySheetCardData = cardData;
    this.showOpportunitySheetModal();
  }

  editAssessmentOpportunity(cardData: OpportunityCardData) {
    this.modifyDataIndex = cardData.index;
    this.editOpportunitySheetCardData = cardData;
    this.showOpportunitySheetModal();
  }

  showOpportunitySheetModal() {
    this.opportunitySheetModal.show();
  }
  hideOpportunitySheetModal() {
    this.opportunitySheetModal.hide();
    this.editOpportunitySheetCardData = undefined;
  }

  saveOpportunitySheet(updatedOpportunitySheet: OpportunitySheet) {
    this.editOpportunitySheetCardData.opportunitySheet = updatedOpportunitySheet;
    this.opportunityCardList[this.modifyDataIndex] = this.editOpportunitySheetCardData;
    this.saveOpportunityChanges(this.editOpportunitySheetCardData);
    this.hideOpportunitySheetModal();
  }

  saveOpportunityChanges(opportunityCardData: OpportunityCardData) {
    let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
    treasureHunt = this.calculatorsService.saveOpportunityChanges(opportunityCardData, treasureHunt, this.settings);
    this.treasureHuntService.treasureHunt.next(treasureHunt);
  }

  toggleSelected(cardData: OpportunityCardData) {
    this.modifyDataIndex = cardData.index;
    this.saveOpportunityChanges(cardData);
  }


  selectAll() {
    this.opportunityCardList.forEach(card => {
      if (card.selected == false) {
        card.selected = true;
        this.toggleSelected(card);
      }
    })
  }

  deselectAll() {
    this.opportunityCardList.forEach(card => {
      if (card.selected == true) {
        card.selected = false;
        this.toggleSelected(card);
      }
    });
  }

  async syncAssessmentOpportunity(cardData: OpportunityCardData) {
    const existingData = cardData.assessmentOpportunity.existingIntegrationData;
    const integratedAssessment = await this.assessmentIntegrationService.setIntegratedAssessment(
      existingData.assessmentId, existingData.assessmentType, this.settings
    );
    if (!integratedAssessment?.assessment || !integratedAssessment.energyOptions) {
      return;
    }
    existingData.energyOptions.baseline = integratedAssessment.energyOptions.baseline;
    if (integratedAssessment.hasModifications && existingData.energyOptions.modifications?.length > 0) {
      integratedAssessment.energyOptions.modifications.forEach(modification => {
        const existingMod = existingData.energyOptions.modifications.find(
          m => m.modificationId === modification.modificationId
        );
        if (existingMod) {
          existingMod.annualEnergy = modification.annualEnergy;
          existingMod.co2EmissionsOutput = modification.co2EmissionsOutput;
          existingMod.annualCost = modification.annualCost;
          existingMod.name = modification.name;
        }
      });
    }
    cardData.hasStaleAssessmentData = false;
    this.opportunityCardList = Array.from(this.opportunityCardList);
    this.saveOpportunityChanges(cardData);
  }

  createCopy(cardData: OpportunityCardData) {
    let newOpportunityCard: OpportunityCardData = JSON.parse(JSON.stringify(cardData));
    let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
    newOpportunityCard = this.calculatorsService.copyOpportunity(newOpportunityCard, treasureHunt, this.settings);
    let opportunityCardList: OpportunityCardData[] = Array.from(this.opportunityCardList);
    opportunityCardList.push(newOpportunityCard);
    this.opportunityCardList = opportunityCardList;
    this.treasureHuntService.treasureHunt.next(treasureHunt);
    this.updateAllIndexes();
    this.updateopportunityCardList();
  }

}
