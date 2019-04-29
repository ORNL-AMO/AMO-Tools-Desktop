import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { TreasureHunt, LightingReplacementTreasureHunt, OpportunitySheet, ReplaceExistingMotorTreasureHunt, MotorDriveInputsTreasureHunt } from '../../shared/models/treasure-hunt';
import { Settings } from 'http2';
import { LightingReplacementService } from '../../calculator/lighting/lighting-replacement/lighting-replacement.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ReplaceExistingService } from '../../calculator/motors/replace-existing/replace-existing.service';
import { ReplaceExistingData, MotorDriveInputs } from '../../shared/models/calculators';
import { MotorDriveService } from '../../calculator/motors/motor-drive/motor-drive.service';

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
  selectedEditReplaceExistingMotor: ReplaceExistingMotorTreasureHunt;
  selectedEditOpportunitySheet: OpportunitySheet;
  selectedEditMotorDrive: MotorDriveInputsTreasureHunt;

  displayEnergyType: string = 'All';
  displayCalculatorType: string = 'All';
  helpTabSelect: string = 'results';

  deleteItemName: string;
  deleteItemIndex: number;
  itemType: string;
  opperatingHoursPerYear: number;
  constructor(
    private lightingReplacementService: LightingReplacementService,
    private replaceExistingService: ReplaceExistingService,
    private motorDriveService: MotorDriveService) { }

  ngOnInit() {
  }
  //utilities
  setCaclulatorType(str: string){
    this.displayCalculatorType = str;
  }
  setEnergyType(str: string) {
   this.displayEnergyType = str;
  }
  setHelpTab(str: string) {
    this.helpTabSelect = str;
  }
  selectCalc(str: string) {
    this.selectedCalc = str;
  }
  showOpportunitySheetModal() {
    this.opportunitySheetModal.show();
  }
  hideOpportunitySheetModal() {
    this.opportunitySheetModal.hide();
  }
  showSaveCalcModal() {
    this.saveCalcModal.show();
  }
  hideSaveCalcModal() {
    this.saveCalcModal.hide();
  }
  showDeleteItemModal() {
    this.deletedItemModal.show();
  }
  hideDeleteItemModal() {
    this.deletedItemModal.hide();
  }
  cancelEditCalc() {
    this.selectCalc('none');
    this.selectedEditIndex = undefined;
    this.selectedEditLightingReplacement = undefined;
    this.selectedEditOpportunitySheet = undefined;
  }
  showDeleteItem(name: string, index: number, type: string) {
    this.deleteItemIndex = index;
    this.itemType = type;
    this.deleteItemName = name;
    this.showDeleteItemModal();
  }
  save() {
    this.emitUpdateTreasureHunt.emit(this.treasureHunt);
  }

  deleteItem() {
    if (this.itemType == 'lightingReplacement') {
      this.treasureHunt.lightingReplacements.splice(this.deleteItemIndex, 1);
    } else if (this.itemType == 'opportunitySheet') {
      this.treasureHunt.opportunitySheets.splice(this.deleteItemIndex, 1);
    } else if (this.itemType == 'replaceExistingMotor') {
      this.treasureHunt.replaceExistingMotors.splice(this.deleteItemIndex, 1);
    } else if (this.itemType == 'motorDrive') {
      this.treasureHunt.motorDrives.splice(this.deleteItemIndex, 1);
    }
    this.save();
    this.hideDeleteItemModal();
  }

  cancelDelete() {
    this.hideDeleteItemModal();
    this.deleteItemIndex = undefined;
    this.itemType = undefined;
    this.deleteItemName = undefined;
  }

  saveEditCalc() {
    if (this.itemType == 'lightingReplacement') {
      this.saveLighting();
    } else if (this.itemType == 'replaceExistingMotor') {
      this.saveReplaceExistingMotor();
    } else if (this.itemType == 'motorDrive') {
      this.saveMotorDrive();
    }
  }

  //edit opportunities
  //opp sheet
  editStandaloneOpportunitySheet(opportunitySheet: OpportunitySheet, index: number) {
    this.selectedEditIndex = index;
    this.selectedEditOpportunitySheet = opportunitySheet;
    this.selectCalc('opportunity-sheet');
  }

  saveEditOpportunitySheet() {
    this.treasureHunt.opportunitySheets[this.selectedEditIndex] = this.selectedEditOpportunitySheet;
    this.save();
    this.selectedEditOpportunitySheet = undefined;
    this.selectedEditIndex = undefined;
    this.hideSaveCalcModal();
    this.selectCalc('none');
  }

  saveEditOpportunity(opportunitySheet: OpportunitySheet) {
    this.itemType = 'opportunitySheet';
    this.selectedEditOpportunitySheet = opportunitySheet;
    this.showSaveCalcModal();
  }
  //lighting replacement  
  editLighting(lightingReplacement: LightingReplacementTreasureHunt, index: number) {
    this.selectedEditIndex = index;
    this.selectedEditLightingReplacement = lightingReplacement;
    this.lightingReplacementService.baselineData = lightingReplacement.baseline;
    this.lightingReplacementService.modificationData = lightingReplacement.modifications;
    this.lightingReplacementService.baselineElectricityCost = lightingReplacement.baselineElectricityCost;
    this.lightingReplacementService.modificationElectricityCost = lightingReplacement.modificationElectricityCost;
    this.selectedEditOpportunitySheet = lightingReplacement.opportunitySheet;
    this.itemType = 'lightingReplacement';
    this.selectCalc('lighting-replacement');
  }

  saveEditLighting(updatedData: LightingReplacementTreasureHunt) {
    this.selectedEditLightingReplacement.baseline = updatedData.baseline;
    this.selectedEditLightingReplacement.modifications = updatedData.modifications;
    this.selectedEditLightingReplacement.baselineElectricityCost = updatedData.baselineElectricityCost;
    this.selectedEditLightingReplacement.modificationElectricityCost = updatedData.modificationElectricityCost;
    this.showSaveCalcModal();
  }

  saveLighting() {
    this.selectedEditLightingReplacement.opportunitySheet = this.selectedEditOpportunitySheet;
    this.treasureHunt.lightingReplacements[this.selectedEditIndex] = this.selectedEditLightingReplacement;
    this.save();
    this.selectedEditLightingReplacement = undefined;
    this.selectedEditOpportunitySheet = undefined;
    this.hideSaveCalcModal();
    this.selectCalc('none');
  }

  //replace existing motor
  editReplaceExistingMotor(replaceExistingMotor: ReplaceExistingMotorTreasureHunt, index: number) {
    this.selectedEditReplaceExistingMotor = replaceExistingMotor;
    this.replaceExistingService.replaceExistingData = replaceExistingMotor.replaceExistingData;
    this.selectedEditOpportunitySheet = replaceExistingMotor.opportunitySheet;
    this.itemType = 'replaceExistingMotor';
    this.selectedEditIndex = index;
    this.selectCalc('replace-existing');
  }

  saveEditReplaceExistingMotor(updateData: ReplaceExistingData) {
    this.selectedEditReplaceExistingMotor.replaceExistingData = updateData;
    this.showSaveCalcModal();
  }

  saveReplaceExistingMotor() {
    this.selectedEditReplaceExistingMotor.opportunitySheet = this.selectedEditOpportunitySheet;
    this.treasureHunt.replaceExistingMotors[this.selectedEditIndex] = this.selectedEditReplaceExistingMotor;
    this.save();
    this.selectedEditOpportunitySheet = undefined;
    this.selectedEditReplaceExistingMotor = undefined;
    this.selectedEditIndex = undefined;
    this.itemType = undefined;
    this.hideSaveCalcModal();
    this.selectCalc('none');
  }

  //motor drive
  editMotorDrive(motorDrive: MotorDriveInputsTreasureHunt, index: number) {
    this.selectedEditMotorDrive = motorDrive;
    this.motorDriveService.motorDriveData = motorDrive.motorDriveInputs;
    this.selectedEditOpportunitySheet = motorDrive.opportunitySheet;
    this.itemType = 'motorDrive';
    this.selectedEditIndex = index;
    this.selectCalc('motor-drive');
  }

  saveEditMotorDrive(updateData: MotorDriveInputs) {
    this.selectedEditMotorDrive.motorDriveInputs = updateData;
    this.showSaveCalcModal();
  }

  saveMotorDrive() {
    this.selectedEditMotorDrive.opportunitySheet = this.selectedEditOpportunitySheet;
    this.treasureHunt.motorDrives[this.selectedEditIndex] = this.selectedEditMotorDrive;
    this.save();
    this.selectedEditOpportunitySheet = undefined;
    this.selectedEditMotorDrive = undefined;
    this.selectedEditIndex = undefined;
    this.itemType = undefined;
    this.hideSaveCalcModal();
    this.selectCalc('none');
  }

  //item opportunity sheets
  saveItemOpportunitySheet(editedOpportunitySheet: OpportunitySheet) {
    this.selectedEditOpportunitySheet = editedOpportunitySheet;
    if (this.itemType == 'lightingReplacement') {
      this.treasureHunt.lightingReplacements[this.selectedEditIndex].opportunitySheet = this.selectedEditOpportunitySheet;
    } else if (this.itemType == 'replaceExistingMotor') {
      this.treasureHunt.replaceExistingMotors[this.selectedEditIndex].opportunitySheet = this.selectedEditOpportunitySheet;
    } else if (this.itemType == 'motorDrive') {
      this.treasureHunt.motorDrives[this.selectedEditIndex].opportunitySheet = this.selectedEditOpportunitySheet;
    }
    this.save();
    this.hideOpportunitySheetModal();
    this.selectedEditOpportunitySheet = undefined;
  }

  editItemOpportunitySheet(opportunitySheet: OpportunitySheet, index: number, type: string) {
    this.selectedEditIndex = index;
    this.selectedEditOpportunitySheet = opportunitySheet;
    this.itemType = type;
    this.showOpportunitySheetModal();
  }




}
