import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { TreasureHunt, OpportunitySheet } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { OpportunityCardsService, OpportunityCardData } from './opportunity-cards.service';
import { CalculatorsService } from '../../calculators/calculators.service';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-opportunity-cards',
  templateUrl: './opportunity-cards.component.html',
  styleUrls: ['./opportunity-cards.component.css']
})
export class OpportunityCardsComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('deletedItemModal') public deletedItemModal: ModalDirective;
  @ViewChild('opportunitySheetModal') public opportunitySheetModal: ModalDirective;

  opportunityCardsData: Array<OpportunityCardData>;
  treasureHuntSub: Subscription;
  treasureHunt: TreasureHunt;
  deleteOpportunity: OpportunityCardData;
  editOpportunitySheetCardData: OpportunityCardData;
  constructor(private opportunityCardsService: OpportunityCardsService, private calculatorsService: CalculatorsService, private treasureHuntService: TreasureHuntService) { }

  ngOnInit() {
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
      this.opportunityCardsData = this.opportunityCardsService.getOpportunityCardsData(this.treasureHunt, this.settings);
    });
  }

  ngOnDestroy() {
    this.treasureHuntSub.unsubscribe();
  }

  editOpportunity(opportunityCard: OpportunityCardData) {
    if (opportunityCard.opportunityType == 'lighting-replacement') {
      this.calculatorsService.editLightingReplacementItem(opportunityCard.lightingReplacement, opportunityCard.opportunityIndex);
    } else if (opportunityCard.opportunityType == 'opportunity-sheet') {
      this.calculatorsService.editOpportunitySheetItem(opportunityCard.opportunitySheet, opportunityCard.opportunityIndex);
    } else if (opportunityCard.opportunityType == 'replace-existing') {
      this.calculatorsService.editReplaceExistingMotorsItem(opportunityCard.replaceExistingMotor, opportunityCard.opportunityIndex);
    } else if (opportunityCard.opportunityType == 'motor-drive') {
      this.calculatorsService.editMotorDrivesItem(opportunityCard.motorDrive, opportunityCard.opportunityIndex);
    } else if (opportunityCard.opportunityType == 'natural-gas-reduction') {
      this.calculatorsService.editNaturalGasReductionsItem(opportunityCard.naturalGasReduction, opportunityCard.opportunityIndex);
    } else if (opportunityCard.opportunityType == 'electricity-reduction') {
      this.calculatorsService.editElectricityReductionsItem(opportunityCard.electricityReduction, opportunityCard.opportunityIndex);
    } else if (opportunityCard.opportunityType == 'compressed-air-reduction') {
      this.calculatorsService.editCompressedAirReductionsItem(opportunityCard.compressedAirReduction, opportunityCard.opportunityIndex);
    } else if (opportunityCard.opportunityType == 'compressed-air-pressure-reduction') {
      this.calculatorsService.editCompressedAirPressureReductionsItem(opportunityCard.compressedAirPressureReduction, opportunityCard.opportunityIndex);
    } else if (opportunityCard.opportunityType == 'water-reduction') {
      this.calculatorsService.editWaterReductionsItem(opportunityCard.waterReduction, opportunityCard.opportunityIndex);
    }
  }

  //delete
  setDeleteItem(cardItem: OpportunityCardData) {
    this.deleteOpportunity = cardItem;
    this.showDeleteItemModal();
  }
  showDeleteItemModal() {
    this.deletedItemModal.show();
  }
  hideDeleteItemModal() {
    this.deleteOpportunity = undefined;
    this.deletedItemModal.hide();
  }
  deleteItem() {
    if (this.deleteOpportunity.opportunityType == 'lighting-replacement') {
      this.treasureHuntService.deleteLightingReplacementTreasureHuntItem(this.deleteOpportunity.opportunityIndex);
    } else if (this.deleteOpportunity.opportunityType == 'opportunity-sheet') {
      this.treasureHuntService.deleteOpportunitySheetItem(this.deleteOpportunity.opportunityIndex);
    } else if (this.deleteOpportunity.opportunityType == 'replace-existing') {
      this.treasureHuntService.deleteReplaceExistingMotorsItem(this.deleteOpportunity.opportunityIndex);
    } else if (this.deleteOpportunity.opportunityType == 'motor-drive') {
      this.treasureHuntService.deleteMotorDrivesItem(this.deleteOpportunity.opportunityIndex);
    } else if (this.deleteOpportunity.opportunityType == 'natural-gas-reduction') {
      this.treasureHuntService.deleteNaturalGasReductionsItem(this.deleteOpportunity.opportunityIndex);
    } else if (this.deleteOpportunity.opportunityType == 'electricity-reduction') {
      this.treasureHuntService.deleteElectricityReductionsItem(this.deleteOpportunity.opportunityIndex);
    } else if (this.deleteOpportunity.opportunityType == 'compressed-air-reduction') {
      this.treasureHuntService.deleteCompressedAirReductionsItem(this.deleteOpportunity.opportunityIndex);
    } else if (this.deleteOpportunity.opportunityType == 'compressed-air-pressure-reduction') {
      this.treasureHuntService.deleteCompressedAirPressureReductionsItem(this.deleteOpportunity.opportunityIndex);
    } else if (this.deleteOpportunity.opportunityType == 'water-reduction') {
      this.treasureHuntService.deleteWaterReductionsItem(this.deleteOpportunity.opportunityIndex);
    }
    this.hideDeleteItemModal();
  }

  editOpportunitySheet(cardData: OpportunityCardData) {
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

  saveItemOpportunitySheet(updatedOpportunitySheet: OpportunitySheet) {
    if (this.editOpportunitySheetCardData.opportunityType == 'lighting-replacement') {
      this.editOpportunitySheetCardData.lightingReplacement.opportunitySheet = updatedOpportunitySheet;
      this.treasureHuntService.editLightingReplacementTreasureHuntItem(this.editOpportunitySheetCardData.lightingReplacement, this.editOpportunitySheetCardData.opportunityIndex);

    } else if (this.editOpportunitySheetCardData.opportunityType == 'replace-existing') {
      this.editOpportunitySheetCardData.replaceExistingMotor.opportunitySheet = updatedOpportunitySheet;
      this.treasureHuntService.editReplaceExistingMotorsItem(this.editOpportunitySheetCardData.replaceExistingMotor, this.editOpportunitySheetCardData.opportunityIndex);

    } else if (this.editOpportunitySheetCardData.opportunityType == 'motor-drive') {
      this.editOpportunitySheetCardData.motorDrive.opportunitySheet = updatedOpportunitySheet;
      this.treasureHuntService.editMotorDrivesItem(this.editOpportunitySheetCardData.motorDrive, this.editOpportunitySheetCardData.opportunityIndex);

    } else if (this.editOpportunitySheetCardData.opportunityType == 'natural-gas-reduction') {
      this.editOpportunitySheetCardData.naturalGasReduction.opportunitySheet = updatedOpportunitySheet;
      this.treasureHuntService.editNaturalGasReductionsItem(this.editOpportunitySheetCardData.naturalGasReduction, this.editOpportunitySheetCardData.opportunityIndex);

    } else if (this.editOpportunitySheetCardData.opportunityType == 'electricity-reduction') {
      this.editOpportunitySheetCardData.electricityReduction.opportunitySheet = updatedOpportunitySheet;
      this.treasureHuntService.editElectricityReductionsItem(this.editOpportunitySheetCardData.electricityReduction, this.editOpportunitySheetCardData.opportunityIndex);

    } else if (this.editOpportunitySheetCardData.opportunityType == 'compressed-air-reduction') {
      this.editOpportunitySheetCardData.compressedAirReduction.opportunitySheet = updatedOpportunitySheet;
      this.treasureHuntService.editCompressedAirReductionsItem(this.editOpportunitySheetCardData.compressedAirReduction, this.editOpportunitySheetCardData.opportunityIndex);

    } else if (this.editOpportunitySheetCardData.opportunityType == 'compressed-air-pressure-reduction') {
      this.editOpportunitySheetCardData.compressedAirPressureReduction.opportunitySheet = updatedOpportunitySheet;
      this.treasureHuntService.editCompressedAirPressureReductionsItem(this.editOpportunitySheetCardData.compressedAirPressureReduction, this.editOpportunitySheetCardData.opportunityIndex);

    } else if (this.editOpportunitySheetCardData.opportunityType == 'water-reduction') {
      this.editOpportunitySheetCardData.waterReduction.opportunitySheet = updatedOpportunitySheet;
      this.treasureHuntService.editWaterReductionsItem(this.editOpportunitySheetCardData.waterReduction, this.editOpportunitySheetCardData.opportunityIndex);
    }
    this.hideOpportunitySheetModal();
  }

  toggleSelected(cardData: OpportunityCardData) {
    cardData.selected = !cardData.selected;
    if (cardData.opportunityType == 'lighting-replacement') {
      cardData.lightingReplacement.selected = !cardData.lightingReplacement.selected;
      this.treasureHuntService.editLightingReplacementTreasureHuntItem(cardData.lightingReplacement, cardData.opportunityIndex);

    } else if (cardData.opportunityType == 'replace-existing') {
      cardData.replaceExistingMotor.selected = !cardData.replaceExistingMotor.selected;
      this.treasureHuntService.editReplaceExistingMotorsItem(cardData.replaceExistingMotor, cardData.opportunityIndex);

    } else if (cardData.opportunityType == 'motor-drive') {
      cardData.motorDrive.selected = !cardData.motorDrive.selected;
      this.treasureHuntService.editMotorDrivesItem(cardData.motorDrive, cardData.opportunityIndex);

    } else if (cardData.opportunityType == 'natural-gas-reduction') {
      cardData.naturalGasReduction.selected = !cardData.naturalGasReduction.selected;
      this.treasureHuntService.editNaturalGasReductionsItem(cardData.naturalGasReduction, cardData.opportunityIndex);

    } else if (cardData.opportunityType == 'electricity-reduction') {
      cardData.electricityReduction.selected = !cardData.electricityReduction.selected;
      this.treasureHuntService.editElectricityReductionsItem(cardData.electricityReduction, cardData.opportunityIndex);

    } else if (cardData.opportunityType == 'compressed-air-reduction') {
      cardData.compressedAirReduction.selected = !cardData.compressedAirReduction.selected;
      this.treasureHuntService.editCompressedAirReductionsItem(cardData.compressedAirReduction, cardData.opportunityIndex);

    } else if (cardData.opportunityType == 'compressed-air-pressure-reduction') {
      cardData.compressedAirPressureReduction.selected = !cardData.compressedAirPressureReduction.selected;
      this.treasureHuntService.editCompressedAirPressureReductionsItem(cardData.compressedAirPressureReduction, cardData.opportunityIndex);

    } else if (cardData.opportunityType == 'water-reduction') {
      cardData.waterReduction.selected = !cardData.waterReduction.selected;
      this.treasureHuntService.editWaterReductionsItem(cardData.waterReduction, cardData.opportunityIndex);
    }
  }
}
