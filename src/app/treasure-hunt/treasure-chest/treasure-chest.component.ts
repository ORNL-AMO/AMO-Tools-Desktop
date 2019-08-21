import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { TreasureHunt, LightingReplacementTreasureHunt, OpportunitySheet, ReplaceExistingMotorTreasureHunt, MotorDriveInputsTreasureHunt, NaturalGasReductionTreasureHunt, ElectricityReductionTreasureHunt, CompressedAirReductionTreasureHunt, ImportExportOpportunities, WaterReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt } from '../../shared/models/treasure-hunt';
import { Settings } from 'http2';
import { LightingReplacementService } from '../../calculator/lighting/lighting-replacement/lighting-replacement.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ReplaceExistingService } from '../../calculator/motors/replace-existing/replace-existing.service';
import { ReplaceExistingData, MotorDriveInputs } from '../../shared/models/calculators';
import { MotorDriveService } from '../../calculator/motors/motor-drive/motor-drive.service';
import { NaturalGasReductionService } from '../../calculator/utilities/natural-gas-reduction/natural-gas-reduction.service';
import { ElectricityReductionService } from '../../calculator/utilities/electricity-reduction/electricity-reduction.service';
import { CompressedAirReductionService } from '../../calculator/utilities/compressed-air-reduction/compressed-air-reduction.service';
import { TreasureHuntService } from '../treasure-hunt.service';
import { WaterReductionService } from '../../calculator/utilities/water-reduction/water-reduction.service';
import { CompressedAirPressureReductionService } from '../../calculator/utilities/compressed-air-pressure-reduction/compressed-air-pressure-reduction.service';

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
  @Input()
  containerHeight: number;

  @ViewChild('saveCalcModal') public saveCalcModal: ModalDirective;
  @ViewChild('opportunitySheetModal') public opportunitySheetModal: ModalDirective;
  @ViewChild('deletedItemModal') public deletedItemModal: ModalDirective;
  // @ViewChild('importExportModal') public importExportModal: ModalDirective;

  selectedCalc: string = 'none';
  selectedEditIndex: number;
  selectedEditLightingReplacement: LightingReplacementTreasureHunt;
  selectedEditReplaceExistingMotor: ReplaceExistingMotorTreasureHunt;
  selectedEditOpportunitySheet: OpportunitySheet;
  selectedEditMotorDrive: MotorDriveInputsTreasureHunt;
  selectedEditNaturalGasReduction: NaturalGasReductionTreasureHunt;
  selectedEditElectricityReduction: ElectricityReductionTreasureHunt;
  selectedEditCompressedAirReduction: CompressedAirReductionTreasureHunt;
  selectedEditCompressedAirPressureReduction: CompressedAirPressureReductionTreasureHunt;
  selectedEditWaterReduction: WaterReductionTreasureHunt;

  displayEnergyType: string = 'All';
  displayCalculatorType: string = 'All';
  helpTabSelect: string = 'results';

  deleteItemName: string;
  deleteItemIndex: number;
  itemType: string;
  opperatingHoursPerYear: number;
  showImportExportModal: boolean = false;
  constructor(
    private lightingReplacementService: LightingReplacementService,
    private replaceExistingService: ReplaceExistingService,
    private motorDriveService: MotorDriveService,
    private naturalGasReductionService: NaturalGasReductionService,
    private electricityReductionService: ElectricityReductionService,
    private compressedAirReductionService: CompressedAirReductionService,
    private compressedAirPressureReductionService: CompressedAirPressureReductionService,
    private treasureHuntService: TreasureHuntService,
    private waterReductionService: WaterReductionService) { }

  ngOnInit() {
  }
  //utilities
  setCaclulatorType(str: string) {
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
    this.selectedEditReplaceExistingMotor = undefined;
    this.selectedEditMotorDrive = undefined;
    this.selectedEditNaturalGasReduction = undefined;
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
    } else if (this.itemType == 'naturalGasReduction') {
      this.treasureHunt.naturalGasReductions.splice(this.deleteItemIndex, 1);
    } else if (this.itemType == 'electricityReduction') {
      this.treasureHunt.electricityReductions.splice(this.deleteItemIndex, 1);
    } else if (this.itemType == 'compressedAirReduction') {
      this.treasureHunt.compressedAirReductions.splice(this.deleteItemIndex, 1);
    } else if (this.itemType == 'waterReduction') {
      this.treasureHunt.waterReductions.splice(this.deleteItemIndex, 1);
    } else if (this.itemType == 'compressedAirPressureReduction') {
      this.treasureHunt.compressedAirPressureReductions.splice(this.deleteItemIndex, 1);
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
    } else if (this.itemType == 'naturalGasReduction') {
      this.saveNaturalGasReduction();
    } else if (this.itemType == 'electricityReduction') {
      this.saveElectricityReduction();
    } else if (this.itemType == 'compressedAirReduction') {
      this.saveCompressedAirReduction();
    } else if (this.itemType == 'waterReduction') {
      this.saveWaterReduction();
    } else if (this.itemType == 'compressedAirPressureReduction') {
      this.saveCompressedAirPressureReduction();
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
    } else if (this.itemType == 'naturalGasReduction') {
      this.treasureHunt.naturalGasReductions[this.selectedEditIndex].opportunitySheet = this.selectedEditOpportunitySheet;
    } else if (this.itemType == 'compressedAirReduction') {
      this.treasureHunt.compressedAirReductions[this.selectedEditIndex].opportunitySheet = this.selectedEditOpportunitySheet;
    } else if (this.itemType == 'electricityReduction') {
      this.treasureHunt.electricityReductions[this.selectedEditIndex].opportunitySheet = this.selectedEditOpportunitySheet;
    } else if (this.itemType == 'waterReduction') {
      this.treasureHunt.waterReductions[this.selectedEditIndex].opportunitySheet = this.selectedEditOpportunitySheet;
    } else if (this.itemType == 'compressedAirPressureReduction') {
      this.treasureHunt.compressedAirPressureReductions[this.selectedEditIndex].opportunitySheet = this.selectedEditOpportunitySheet;
    }
    this.save();
    this.hideOpportunitySheetModal();
  }

  editItemOpportunitySheet(opportunitySheet: OpportunitySheet, index: number, type: string) {
    this.selectedEditIndex = index;
    this.selectedEditOpportunitySheet = opportunitySheet;
    this.itemType = type;
    this.showOpportunitySheetModal();
  }

  //natural gas reduction 
  editNaturalGasReduction(ngReduction: NaturalGasReductionTreasureHunt, index: number) {
    this.selectedEditIndex = index;
    this.selectedEditNaturalGasReduction = ngReduction;
    this.naturalGasReductionService.baselineData = ngReduction.baseline;
    this.naturalGasReductionService.modificationData = ngReduction.modification;
    this.selectedEditOpportunitySheet = ngReduction.opportunitySheet;
    this.itemType = 'naturalGasReduction';
    this.selectCalc('natural-gas-reduction');
  }

  saveEditNaturalGasReduction(updatedData: NaturalGasReductionTreasureHunt) {
    this.selectedEditNaturalGasReduction.baseline = updatedData.baseline;
    this.selectedEditNaturalGasReduction.modification = updatedData.modification;
    this.showSaveCalcModal();
  }

  saveNaturalGasReduction() {
    this.selectedEditNaturalGasReduction.opportunitySheet = this.selectedEditOpportunitySheet;
    this.treasureHunt.naturalGasReductions[this.selectedEditIndex] = this.selectedEditNaturalGasReduction;
    this.save();
    this.selectedEditNaturalGasReduction = undefined;
    this.selectedEditOpportunitySheet = undefined;
    this.hideSaveCalcModal();
    this.selectCalc('none');
  }

  //electricity reduction 
  editElectricityReduction(electricityReduction: ElectricityReductionTreasureHunt, index: number) {
    this.selectedEditIndex = index;
    this.selectedEditElectricityReduction = electricityReduction;
    this.electricityReductionService.baselineData = electricityReduction.baseline;
    this.electricityReductionService.modificationData = electricityReduction.modification;
    this.selectedEditOpportunitySheet = electricityReduction.opportunitySheet;
    this.itemType = 'electricityReduction';
    this.selectCalc('electricity-reduction');
  }

  saveEditElectricityReduction(updatedData: ElectricityReductionTreasureHunt) {
    this.selectedEditElectricityReduction.baseline = updatedData.baseline;
    this.selectedEditElectricityReduction.modification = updatedData.modification;
    this.showSaveCalcModal();
  }

  saveElectricityReduction() {
    this.selectedEditElectricityReduction.opportunitySheet = this.selectedEditOpportunitySheet;
    this.treasureHunt.electricityReductions[this.selectedEditIndex] = this.selectedEditElectricityReduction;
    this.save();
    this.selectedEditElectricityReduction = undefined;
    this.selectedEditOpportunitySheet = undefined;
    this.hideSaveCalcModal();
    this.selectCalc('none');
  }

  //compressed air reduction 
  editCompressedAirReduction(compressedairReduction: CompressedAirReductionTreasureHunt, index: number) {
    this.selectedEditIndex = index;
    this.selectedEditCompressedAirReduction = compressedairReduction;
    this.compressedAirReductionService.baselineData = compressedairReduction.baseline;
    this.compressedAirReductionService.modificationData = compressedairReduction.modification;
    this.selectedEditOpportunitySheet = compressedairReduction.opportunitySheet;
    this.itemType = 'compressedAirReduction';
    this.selectCalc('compressed-air-reduction');
  }

  saveEditCompressedAirReduction(updatedData: CompressedAirReductionTreasureHunt) {
    this.selectedEditCompressedAirReduction.baseline = updatedData.baseline;
    this.selectedEditCompressedAirReduction.modification = updatedData.modification;
    this.showSaveCalcModal();
  }

  saveCompressedAirReduction() {
    this.selectedEditCompressedAirReduction.opportunitySheet = this.selectedEditOpportunitySheet;
    this.treasureHunt.compressedAirReductions[this.selectedEditIndex] = this.selectedEditCompressedAirReduction;
    this.save();
    this.selectedEditCompressedAirReduction = undefined;
    this.selectedEditOpportunitySheet = undefined;
    this.hideSaveCalcModal();
    this.selectCalc('none');
  }


  //compressed air pressure reduction 
  editCompressedAirPressureReduction(compressedAirPressureReduction: CompressedAirPressureReductionTreasureHunt, index: number) {
    this.selectedEditIndex = index;
    this.selectedEditCompressedAirPressureReduction = compressedAirPressureReduction;
    this.compressedAirPressureReductionService.baselineData = compressedAirPressureReduction.baseline;
    this.compressedAirPressureReductionService.modificationData = compressedAirPressureReduction.modification;
    this.selectedEditOpportunitySheet = compressedAirPressureReduction.opportunitySheet;
    this.itemType = 'compressedAirPressureReduction';
    this.selectCalc('compressed-air-pressure-reduction');
  }

  saveEditCompressedAirPressureReduction(updatedData: CompressedAirPressureReductionTreasureHunt) {
    this.selectedEditCompressedAirPressureReduction.baseline = updatedData.baseline;
    this.selectedEditCompressedAirPressureReduction.modification = updatedData.modification;
    this.showSaveCalcModal();
  }

  saveCompressedAirPressureReduction() {
    this.selectedEditCompressedAirPressureReduction.opportunitySheet = this.selectedEditOpportunitySheet;
    this.treasureHunt.compressedAirPressureReductions[this.selectedEditIndex] = this.selectedEditCompressedAirPressureReduction;
    this.save();
    this.selectedEditCompressedAirPressureReduction = undefined;
    this.selectedEditOpportunitySheet = undefined;
    this.hideSaveCalcModal();
    this.selectCalc('none');
  }

  //water reduction
  editWaterReduction(waterReduction: WaterReductionTreasureHunt, index: number) {
    this.selectedEditIndex = index;
    this.selectedEditWaterReduction = waterReduction;
    this.waterReductionService.baselineData = waterReduction.baseline;
    this.waterReductionService.modificationData = waterReduction.modification;
    this.selectedEditOpportunitySheet = waterReduction.opportunitySheet;
    this.itemType = 'waterReduction';
    this.selectCalc('water-reduction');
  }

  saveEditWaterReduction(updatedData: WaterReductionTreasureHunt) {
    this.selectedEditWaterReduction.baseline = updatedData.baseline;
    this.selectedEditWaterReduction.modification = updatedData.modification;
    this.showSaveCalcModal();
  }

  saveWaterReduction() {
    this.selectedEditWaterReduction.opportunitySheet = this.selectedEditOpportunitySheet;
    this.treasureHunt.waterReductions[this.selectedEditIndex] = this.selectedEditWaterReduction;
    this.save();
    this.selectedEditWaterReduction = undefined;
    this.selectedEditOpportunitySheet = undefined;
    this.hideSaveCalcModal();
    this.selectCalc('none');
  }

  openImportExportModal() {
    this.showImportExportModal = true;
  }

  closeImportExportModal() {
    this.showImportExportModal = false;
  }

  importData(data: ImportExportOpportunities) {
    if (data.compressedAirReductions) {
      if (this.treasureHunt.compressedAirReductions == undefined) {
        this.treasureHunt.compressedAirReductions = new Array();
      }
      this.treasureHunt.compressedAirReductions = this.treasureHunt.compressedAirReductions.concat(data.compressedAirReductions);
    }
    if (data.opportunitySheets) {
      if (this.treasureHunt.opportunitySheets == undefined) {
        this.treasureHunt.opportunitySheets = new Array();
      }
      this.treasureHunt.opportunitySheets = this.treasureHunt.opportunitySheets.concat(data.opportunitySheets);
    }
    if (data.replaceExistingMotors) {
      if (this.treasureHunt.replaceExistingMotors == undefined) {
        this.treasureHunt.replaceExistingMotors = new Array();
      }
      this.treasureHunt.replaceExistingMotors = this.treasureHunt.replaceExistingMotors.concat(data.replaceExistingMotors);
    }
    if (data.motorDrives) {
      if (this.treasureHunt.motorDrives == undefined) {
        this.treasureHunt.motorDrives = new Array();
      }
      this.treasureHunt.motorDrives = this.treasureHunt.motorDrives.concat(data.motorDrives);
    }
    if (data.naturalGasReductions) {
      if (this.treasureHunt.naturalGasReductions == undefined) {
        this.treasureHunt.naturalGasReductions = new Array();
      }
      this.treasureHunt.naturalGasReductions = this.treasureHunt.naturalGasReductions.concat(data.naturalGasReductions);
    }
    if (data.electricityReductions) {
      if (this.treasureHunt.electricityReductions == undefined) {
        this.treasureHunt.electricityReductions = new Array();
      }
      this.treasureHunt.electricityReductions = this.treasureHunt.electricityReductions.concat(data.electricityReductions);
    }
    if (data.lightingReplacements) {
      if (this.treasureHunt.lightingReplacements == undefined) {
        this.treasureHunt.lightingReplacements = new Array();
      }
      this.treasureHunt.lightingReplacements = this.treasureHunt.lightingReplacements.concat(data.lightingReplacements);
    }
    if (data.waterReductions) {
      if (this.treasureHunt.waterReductions == undefined) {
        this.treasureHunt.waterReductions = new Array();
      }
      this.treasureHunt.waterReductions = this.treasureHunt.waterReductions.concat(data.waterReductions);
    }
    if (data.compressedAirPressureReductions) {
      if (this.treasureHunt.compressedAirPressureReductions == undefined) {
        this.treasureHunt.compressedAirPressureReductions = new Array();
      }
      this.treasureHunt.compressedAirPressureReductions = this.treasureHunt.compressedAirPressureReductions.concat(data.compressedAirPressureReductions);
    }
    this.save();
    this.treasureHuntService.updateMenuOptions.next(true);
  }
}
