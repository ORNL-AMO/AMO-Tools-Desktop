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

@Component({
  selector: 'app-opportunity-cards',
  templateUrl: './opportunity-cards.component.html',
  styleUrls: ['./opportunity-cards.component.css']
})
export class OpportunityCardsComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('deletedOpportunityModal', { static: false }) public deletedOpportunityModal: ModalDirective;
  @ViewChild('opportunitySheetModal', { static: false }) public opportunitySheetModal: ModalDirective;

  opportunityCardsData: Array<OpportunityCardData>;
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
    private treasureChestMenuService: TreasureChestMenuService) { }

  ngOnInit() {
    this.updateOpportunityCardsSub = this.opportunityCardsService.updateOpportunityCards.subscribe(val => {
      if (val == true) {
        this.treasureHunt = this.treasureHuntService.treasureHunt.getValue();
        this.opportunityCardsData = this.opportunityCardsService.getOpportunityCardsData(this.treasureHunt, this.settings);
        this.opportunityCardsService.opportunityCards.next(this.opportunityCardsData);
        this.opportunityCardsService.updateOpportunityCards.next(false);
      }
    });
    this.updatedOpportunityCardSub = this.opportunityCardsService.updatedOpportunityCard.subscribe(val => {
      if (val) {
        this.opportunityCardsData[this.modifyDataIndex] = val;
        this.updateAllIndexes();
        this.opportunityCardsService.updatedOpportunityCard.next(undefined);
        this.updateOpportunityCardsData();
      }
    });
    this.selectAllSub = this.treasureChestMenuService.selectAll.subscribe(val => {
      if (val == true) {
        this.selectAll();
      }
    });
    this.sortBySub = this.treasureChestMenuService.sortBy.subscribe(val => {
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

  updateOpportunityCardsData() {
    this.opportunityCardsService.opportunityCards.next(this.opportunityCardsData);
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
    this.opportunityCardsData.splice(this.modifyDataIndex, 1);
    this.updateOpportunityIndexesAfterDelete();
    let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
    treasureHunt = this.calculatorsService.deleteOpportunity(this.deleteOpportunityCard, treasureHunt);

    this.treasureHuntService.treasureHunt.next(treasureHunt);
    this.hideDeleteOpportunityModal();
    this.updateOpportunityCardsData();
  }

  updateOpportunityIndexesAfterDelete() {
    this.opportunityCardsData.forEach(card => {
      if (card.opportunityType == this.deleteOpportunityCard.opportunityType && card.opportunityIndex > this.deleteOpportunityCard.opportunityIndex) {
        card.opportunityIndex = card.opportunityIndex - 1;
      }
    })
    this.updateAllIndexes();
  }

  updateAllIndexes() {
    let index: number = 0;
    this.opportunityCardsData.forEach(card => {
      card.index = index;
      index++;
    })
  }

  editOpportunitySheet(cardData: OpportunityCardData) {
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
    this.opportunityCardsData[this.modifyDataIndex] = this.editOpportunitySheetCardData;
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
    this.opportunityCardsData.forEach(card => {
      if (card.selected == false) {
        card.selected = true;
        this.toggleSelected(card);
      }
    })
  }

  deselectAll() {
    this.opportunityCardsData.forEach(card => {
      if (card.selected == true) {
        card.selected = false;
        this.toggleSelected(card);
      }
    });
  }

  createCopy(cardData: OpportunityCardData) {
    let newOpportunityCard: OpportunityCardData = JSON.parse(JSON.stringify(cardData));
    let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
    newOpportunityCard = this.calculatorsService.copyOpportunity(newOpportunityCard, treasureHunt, this.settings);
    this.opportunityCardsData.push(newOpportunityCard);
    this.treasureHuntService.treasureHunt.next(treasureHunt);
    this.updateAllIndexes();
    this.updateOpportunityCardsData();
  }

}
