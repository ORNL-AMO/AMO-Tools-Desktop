import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CalculatorsService } from './calculators.service';
import { Subscription } from 'rxjs';
import { TreasureHunt, LightingReplacementTreasureHunt, WaterReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt, CompressedAirReductionTreasureHunt, ElectricityReductionTreasureHunt, NaturalGasReductionTreasureHunt, MotorDriveInputsTreasureHunt, ReplaceExistingMotorTreasureHunt, OpportunitySheet, SteamReductionTreasureHunt } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { TreasureHuntService } from '../treasure-hunt.service';
import { ModalDirective } from 'ngx-bootstrap';

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

  lightingReplacementTreasureHunt: LightingReplacementTreasureHunt;
  replaceExistingMotorsTreasureHunt: ReplaceExistingMotorTreasureHunt;
  motorDriveTreasureHunt: MotorDriveInputsTreasureHunt;
  naturalGasReductionTreasureHunt: NaturalGasReductionTreasureHunt;
  electricityReduction: ElectricityReductionTreasureHunt;
  compressedAirReduction: CompressedAirReductionTreasureHunt;
  compressedAirPressureReduction: CompressedAirPressureReductionTreasureHunt;
  waterReduction: WaterReductionTreasureHunt;
  standaloneOpportunitySheet: OpportunitySheet;
  steamReduction: SteamReductionTreasureHunt;

  selectedCalc: string;
  selectedCalcSubscription: Subscription;
  treasureHunt: TreasureHunt;
  treasureHuntSub: Subscription;

  calculatorOpportunitySheet: OpportunitySheet;
  mainTab: string;
  mainTabSub: Subscription;
  constructor(private calculatorsService: CalculatorsService, private treasureHuntService: TreasureHuntService) { }

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

  confirmSaveCalc() {
    if (this.selectedCalc == 'lighting-replacement') {
      this.confirmSaveLighting();
    } else if (this.selectedCalc == 'replace-existing') {
      this.confirmSaveReplaceExisting();
    } else if (this.selectedCalc == 'motor-drive') {
      this.confirmSaveMotorDrive();
    } else if (this.selectedCalc == 'natural-gas-reduction') {
      this.confirmSaveNaturalGasReduction();
    } else if (this.selectedCalc == 'electricity-reduction') {
      this.confirmSaveElectricityReduction();
    } else if (this.selectedCalc == 'compressed-air-reduction') {
      this.confirmCompressedAirReduction();
    } else if (this.selectedCalc == 'compressed-air-pressure-reduction') {
      this.confirmCompressedAirPressureReduction();
    } else if (this.selectedCalc == 'water-reduction') {
      this.confirmSaveWaterReduction();
    } else if (this.selectedCalc == 'opportunity-sheet') {
      this.confirmSaveStandaloneOpportunitySheet();
    } else if (this.selectedCalc == 'steam-reduction') {
      this.confirmSaveSteamReduction();
    }
  }
  initSaveCalc() {
    this.calculatorOpportunitySheet = this.calculatorsService.calcOpportunitySheet;
    if (this.mainTab == 'find-treasure') {
      this.showOpportunitySheetModal();
    } else {
      this.showSaveCalcModal();
    }
  }
  finishSaveCalc() {
    this.hideSaveCalcModal();
    this.calculatorsService.selectedCalc.next('none');
  }

  //lighting
  cancelEditLighting() {
    this.calculatorsService.cancelLightingCalc();
  }
  saveLighting(lightingReplacementTreasureHunt: LightingReplacementTreasureHunt) {
    this.lightingReplacementTreasureHunt = lightingReplacementTreasureHunt;
    this.initSaveCalc();
  }
  confirmSaveLighting() {
    this.lightingReplacementTreasureHunt.opportunitySheet = this.calculatorOpportunitySheet;
    this.lightingReplacementTreasureHunt.selected = true;
    if (this.calculatorsService.isNewOpportunity == true) {
      this.treasureHuntService.addNewLightingReplacementTreasureHuntItem(this.lightingReplacementTreasureHunt);
    } else {
      this.treasureHuntService.editLightingReplacementTreasureHuntItem(this.lightingReplacementTreasureHunt, this.calculatorsService.itemIndex);
    }
    this.finishSaveCalc();
  }

  //replace existing
  cancelReplaceExisting() {
    this.calculatorsService.cancelReplaceExistingMotors();
  }
  saveReplaceExisting(replaceExistingTreasureHunt: ReplaceExistingMotorTreasureHunt) {
    this.replaceExistingMotorsTreasureHunt = replaceExistingTreasureHunt;
    this.initSaveCalc();
  }
  confirmSaveReplaceExisting() {
    this.replaceExistingMotorsTreasureHunt.opportunitySheet = this.calculatorOpportunitySheet;
    this.replaceExistingMotorsTreasureHunt.selected = true;
    if (this.calculatorsService.isNewOpportunity == true) {
      this.treasureHuntService.addNewReplaceExistingMotorsItem(this.replaceExistingMotorsTreasureHunt);
    } else {
      this.treasureHuntService.editReplaceExistingMotorsItem(this.replaceExistingMotorsTreasureHunt, this.calculatorsService.itemIndex, this.settings);
    }
    this.finishSaveCalc();
  }

  //motor drive
  cancelMotorDrive() {
    this.calculatorsService.cancelMotorDrive();
  }
  saveMotorDrive(motorDriveTreasureHunt: MotorDriveInputsTreasureHunt) {
    this.motorDriveTreasureHunt = motorDriveTreasureHunt;
    this.initSaveCalc();
  }
  confirmSaveMotorDrive() {
    this.motorDriveTreasureHunt.opportunitySheet = this.calculatorOpportunitySheet;
    this.motorDriveTreasureHunt.selected = true;
    if (this.calculatorsService.isNewOpportunity == true) {
      this.treasureHuntService.addNewMotorDrivesItem(this.motorDriveTreasureHunt);
    } else {
      this.treasureHuntService.editMotorDrivesItem(this.motorDriveTreasureHunt, this.calculatorsService.itemIndex);
    }
    this.finishSaveCalc();
  }

  //natural gas reduction
  cancelNaturalGasReduction() {
    this.calculatorsService.cancelNaturalGasReduction();
  }
  saveNaturalGasReduction(naturalGasReductionTreasureHunt: NaturalGasReductionTreasureHunt) {
    this.naturalGasReductionTreasureHunt = naturalGasReductionTreasureHunt;
    this.initSaveCalc();
  }
  confirmSaveNaturalGasReduction() {
    this.naturalGasReductionTreasureHunt.opportunitySheet = this.calculatorOpportunitySheet;
    this.naturalGasReductionTreasureHunt.selected = true;
    if (this.calculatorsService.isNewOpportunity == true) {
      this.treasureHuntService.addNewNaturalGasReductionsItem(this.naturalGasReductionTreasureHunt);
    } else {
      this.treasureHuntService.editNaturalGasReductionsItem(this.naturalGasReductionTreasureHunt, this.calculatorsService.itemIndex, this.settings);
    }
    this.finishSaveCalc();
  }

  //electricity reduction
  cancelElectricityReduction() {
    this.calculatorsService.cancelElectricityReduction();
  }
  saveElectricityReduction(electricityReduction: ElectricityReductionTreasureHunt) {
    this.electricityReduction = electricityReduction;
    this.initSaveCalc();
  }
  confirmSaveElectricityReduction() {
    this.electricityReduction.opportunitySheet = this.calculatorOpportunitySheet;
    this.electricityReduction.selected = true;
    if (this.calculatorsService.isNewOpportunity == true) {
      this.treasureHuntService.addNewElectricityReductionsItem(this.electricityReduction);
    } else {
      this.treasureHuntService.editElectricityReductionsItem(this.electricityReduction, this.calculatorsService.itemIndex, this.settings);
    }
    this.finishSaveCalc();
  }

  //compressed air reduction
  cancelCompressedAirReduction() {
    this.calculatorsService.cancelCompressedAirReduction();
  }
  saveCompressedAirReduction(compressedAirReduction: CompressedAirReductionTreasureHunt) {
    this.compressedAirReduction = compressedAirReduction;
    this.initSaveCalc();
  }
  confirmCompressedAirReduction() {
    this.compressedAirReduction.opportunitySheet = this.calculatorOpportunitySheet;
    this.compressedAirReduction.selected = true;
    if (this.calculatorsService.isNewOpportunity == true) {
      this.treasureHuntService.addNewCompressedAirReductionsItem(this.compressedAirReduction);
    } else {
      this.treasureHuntService.editCompressedAirReductionsItem(this.compressedAirReduction, this.calculatorsService.itemIndex, this.settings);
    }
    this.finishSaveCalc();
  }

  //compressed air pressure reduction
  cancelCompressedAirPressureReduction() {
    this.calculatorsService.cancelCompressedAirPressureReduction();
  }
  saveCompressedAirPressureReduction(compressedAirPressureReduction: CompressedAirPressureReductionTreasureHunt) {
    this.compressedAirPressureReduction = compressedAirPressureReduction;
    this.initSaveCalc();
  }
  confirmCompressedAirPressureReduction() {
    this.compressedAirPressureReduction.opportunitySheet = this.calculatorOpportunitySheet;
    this.compressedAirPressureReduction.selected = true;
    if (this.calculatorsService.isNewOpportunity == true) {
      this.treasureHuntService.addNewCompressedAirPressureReductionsItem(this.compressedAirPressureReduction);
    } else {
      this.treasureHuntService.editCompressedAirPressureReductionsItem(this.compressedAirPressureReduction, this.calculatorsService.itemIndex, this.settings);
    }
    this.finishSaveCalc();
  }

  //water reduction
  cancelWaterReduction() {
    this.calculatorsService.cancelWaterReduction();
  }
  saveWaterReduction(waterReduction: WaterReductionTreasureHunt) {
    this.waterReduction = waterReduction;
    this.initSaveCalc();
  }
  confirmSaveWaterReduction() {
    this.waterReduction.opportunitySheet = this.calculatorsService.calcOpportunitySheet;
    this.waterReduction.selected = true;
    if (this.calculatorsService.isNewOpportunity == true) {
      this.treasureHuntService.addNewWaterReductionsItem(this.waterReduction);
    } else {
      this.treasureHuntService.editWaterReductionsItem(this.waterReduction, this.calculatorsService.itemIndex, this.settings);
    }
    this.finishSaveCalc();
  }

  //steam reduction
  cancelSteamReduction() {
    this.calculatorsService.cancelSteamReduction();
  }
  saveSteamReduction(steamReduction: SteamReductionTreasureHunt) {
    this.steamReduction = steamReduction;
    this.initSaveCalc();
  }
  confirmSaveSteamReduction() {
    this.steamReduction.opportunitySheet = this.calculatorsService.calcOpportunitySheet;
    this.steamReduction.selected = true;
    if (this.calculatorsService.isNewOpportunity == true) {
      this.treasureHuntService.addNewSteamReductionItem(this.steamReduction);
    } else {
      this.treasureHuntService.editSteamReductionItem(this.steamReduction, this.calculatorsService.itemIndex, this.settings);
    }
    this.finishSaveCalc();
  }


  //stand alone opportunity sheet
  cancelStandaloneOpportunitySheet() {
    this.calculatorsService.cancelOpportunitySheet();
  }
  saveStandaloneOpportunitySheet(opportunitySheet: OpportunitySheet) {
    this.standaloneOpportunitySheet = opportunitySheet;
    this.initSaveCalc();
  }
  confirmSaveStandaloneOpportunitySheet() {
    this.standaloneOpportunitySheet.selected = true;
    if (this.calculatorsService.isNewOpportunity == true) {
      this.treasureHuntService.addNewOpportunitySheetsItem(this.standaloneOpportunitySheet);
    } else {
      this.treasureHuntService.editOpportunitySheetItem(this.standaloneOpportunitySheet, this.calculatorsService.itemIndex, this.settings);
    }
    this.finishSaveCalc();
  }
}
