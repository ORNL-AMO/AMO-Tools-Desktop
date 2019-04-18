import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { TreasureHunt, LightingReplacementTreasureHunt, OpportunitySheet } from '../../shared/models/treasure-hunt';
import { Settings } from 'http2';
import { LightingReplacementService } from '../../calculator/lighting/lighting-replacement/lighting-replacement.service';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-treasure-chest',
  templateUrl: './treasure-chest.component.html',
  styleUrls: ['./treasure-chest.component.css']
})
export class TreasureChestComponent implements OnInit {
  @Input()
  treasureHunt: TreasureHunt;
  @Input()
  settings: Settings;
  @Output('emitUpdateTreasureHunt')
  emitUpdateTreasureHunt = new EventEmitter<TreasureHunt>();

  @ViewChild('saveCalcModal') public saveCalcModal: ModalDirective;
  @ViewChild('opportunitySheetModal') public opportunitySheetModal: ModalDirective;
  @ViewChild('deletedItemModal') public deletedItemModal: ModalDirective;


  selectedCalc: string = 'none';
  selectedEditIndex: number;
  selectedEditLightingReplacement: LightingReplacementTreasureHunt;
  selectedEditOpportunitySheet: OpportunitySheet;
  isSaveLighting: boolean;
  tabSelect: string = 'all';
  helpTabSelect: string = 'results';

  deleteItemName: string;
  deleteItemIndex: number;
  deleteItemType: string;
  constructor(private lightingReplacementService: LightingReplacementService) { }

  ngOnInit() {
  }


  setTab(str: string) {
    this.tabSelect = str;
  }

  setHelpTab(str: string) {
    this.helpTabSelect = str;
  }

  selectCalc(str: string) {
    this.selectedCalc = str;
  }

  cancelEditCalc() {
    this.selectCalc('none');
    this.selectedEditIndex = undefined;
    this.selectedEditLightingReplacement = undefined;
    this.selectedEditOpportunitySheet = undefined;
  }


  editLighting(lightingReplacement: LightingReplacementTreasureHunt, index: number) {
    this.selectedEditIndex = index;
    this.selectedEditLightingReplacement = lightingReplacement;
    this.lightingReplacementService.baselineData = lightingReplacement.baseline;
    this.lightingReplacementService.modificationData = lightingReplacement.modifications;
    this.lightingReplacementService.baselineElectricityCost = lightingReplacement.baselineElectricityCost;
    this.lightingReplacementService.modificationElectricityCost = lightingReplacement.modificationElectricityCost;
    this.selectedEditOpportunitySheet = lightingReplacement.opportunitySheet;
    this.selectCalc('lighting-replacement');
  }

  saveEditLighting(updatedData: LightingReplacementTreasureHunt) {
    this.selectedEditLightingReplacement.baseline = updatedData.baseline;
    this.selectedEditLightingReplacement.modifications = updatedData.modifications;
    this.selectedEditLightingReplacement.baselineElectricityCost = updatedData.baselineElectricityCost;
    this.selectedEditLightingReplacement.modificationElectricityCost = updatedData.modificationElectricityCost;
    this.isSaveLighting = true;
    this.saveCalcModal.show();
  }

  saveLighting() {
    this.selectedEditLightingReplacement.opportunitySheet = this.selectedEditOpportunitySheet;
    this.treasureHunt.lightingReplacements[this.selectedEditIndex] = this.selectedEditLightingReplacement;
    this.save();
    this.selectedEditLightingReplacement = undefined;
    this.selectedEditOpportunitySheet = undefined;
    this.saveCalcModal.hide();
    this.selectCalc('none');
  }

  showOpportunitySheetModal() {
    this.opportunitySheetModal.show();
  }

  hideOpportunitySheetModal() {
    this.opportunitySheetModal.hide();
  }

  saveOpportunitySheet(editedOpportunitySheet: OpportunitySheet) {
    this.selectedEditOpportunitySheet = editedOpportunitySheet;
    if (this.selectedCalc == 'none') {
      this.saveLightingReplacementOpportunitySheet();
    }
    this.hideOpportunitySheetModal();

  }

  closeSaveCalcModal() {
    this.saveCalcModal.hide();
  }

  editLightingReplacementOpportunitySheet(opportunitySheet: OpportunitySheet, index: number) {
    this.selectedEditIndex = index;
    this.selectedEditOpportunitySheet = opportunitySheet;
    this.opportunitySheetModal.show();
  }

  saveLightingReplacementOpportunitySheet() {
    this.treasureHunt.lightingReplacements[this.selectedEditIndex].opportunitySheet = this.selectedEditOpportunitySheet;
    this.save();
    this.selectedEditLightingReplacement = undefined;
    this.selectedEditOpportunitySheet = undefined;
  }

  editStandaloneOpportunitySheet(opportunitySheet: OpportunitySheet, index: number) {

    this.selectedEditIndex = index;
    this.selectedEditOpportunitySheet = opportunitySheet;
    this.selectCalc('opportunity-sheet');
  }

  saveEditOpportunity(opportunitySheet: OpportunitySheet) {
    this.isSaveLighting = false;
    this.selectedEditOpportunitySheet = opportunitySheet;
    this.saveCalcModal.show();
  }

  saveEditOpportunitySheet() {
    this.treasureHunt.opportunitySheets[this.selectedEditIndex] = this.selectedEditOpportunitySheet;
    this.save();
    this.selectedEditOpportunitySheet = undefined;
    this.selectedEditIndex = undefined;
    this.saveCalcModal.hide();
    this.selectCalc('none');
  }

  showDeleteLightingModal(name: string, index: number) {
    this.deleteItemIndex = index;
    this.deleteItemType = 'lightingReplacement';
    this.deleteItemName = name;
    this.deletedItemModal.show();
  }

  save() {
    this.emitUpdateTreasureHunt.emit(this.treasureHunt);
  }

  deleteItem() {
    if (this.deleteItemType == 'lightingReplacement') {
      this.treasureHunt.lightingReplacements.splice(this.deleteItemIndex, 1);
    }
    this.save();
    this.deletedItemModal.hide();
  }

  cancelDelete() {
    this.deletedItemModal.hide();
    this.deleteItemIndex = undefined;
    this.deleteItemType = undefined;
    this.deleteItemName = undefined;
  }

  showCreateCopyModal(){
    
  }


}
