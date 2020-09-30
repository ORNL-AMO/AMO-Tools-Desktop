import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LightingReplacementService } from '../../calculator/lighting/lighting-replacement/lighting-replacement.service';
import { LightingReplacementTreasureHunt, ReplaceExistingMotorTreasureHunt, MotorDriveInputsTreasureHunt, NaturalGasReductionTreasureHunt, ElectricityReductionTreasureHunt, CompressedAirReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt, WaterReductionTreasureHunt, OpportunitySheet, SteamReductionTreasureHunt, PipeInsulationReductionTreasureHunt, TankInsulationReductionTreasureHunt, AirLeakSurveyTreasureHunt } from '../../shared/models/treasure-hunt';
import { ReplaceExistingService } from '../../calculator/motors/replace-existing/replace-existing.service';
import { MotorDriveService } from '../../calculator/motors/motor-drive/motor-drive.service';
import { NaturalGasReductionService } from '../../calculator/utilities/natural-gas-reduction/natural-gas-reduction.service';
import { ElectricityReductionService } from '../../calculator/utilities/electricity-reduction/electricity-reduction.service';
import { WaterReductionService } from '../../calculator/utilities/water-reduction/water-reduction.service';
import { OpportunitySheetService } from './standalone-opportunity-sheet/opportunity-sheet.service';
import { PipeInsulationReductionService } from '../../calculator/steam/pipe-insulation-reduction/pipe-insulation-reduction.service';
import { CompressedAirReductionService } from '../../calculator/compressed-air/compressed-air-reduction/compressed-air-reduction.service';
import { CompressedAirPressureReductionService } from '../../calculator/compressed-air/compressed-air-pressure-reduction/compressed-air-pressure-reduction.service';
import { SteamReductionService } from '../../calculator/steam/steam-reduction/steam-reduction.service';
import { TankInsulationReductionService } from '../../calculator/steam/tank-insulation-reduction/tank-insulation-reduction.service';
import { AirLeakService } from '../../calculator/compressed-air/air-leak/air-leak.service';

@Injectable()
export class CalculatorsService {

  selectedCalc: BehaviorSubject<string>;
  itemIndex: number;
  isNewOpportunity: boolean;
  calcOpportunitySheet: OpportunitySheet;
  constructor(private lightingReplacementService: LightingReplacementService, private replaceExistingService: ReplaceExistingService,
    private motorDriveService: MotorDriveService, private naturalGasReductionService: NaturalGasReductionService, private electricityReductionService: ElectricityReductionService,
    private compressedAirReductionService: CompressedAirReductionService, private compressedAirPressureReductionService: CompressedAirPressureReductionService,
    private waterReductionService: WaterReductionService, private opportunitySheetService: OpportunitySheetService, private steamReductionService: SteamReductionService,
    private pipeInsulationReductionService: PipeInsulationReductionService, private tankInsulationReductionService: TankInsulationReductionService, private airLeakService: AirLeakService) {
    this.selectedCalc = new BehaviorSubject<string>('none');
  }
  cancelCalc() {
    this.itemIndex = undefined;
    this.selectedCalc.next('none');
  }

  //lighting replacement
  addNewLighting() {
    this.calcOpportunitySheet = undefined;
    this.isNewOpportunity = true;
    this.lightingReplacementService.baselineData = undefined;
    this.lightingReplacementService.modificationData = undefined;
    this.lightingReplacementService.baselineElectricityCost = undefined;
    this.lightingReplacementService.modificationElectricityCost = undefined;
    this.selectedCalc.next('lighting-replacement');
  }
  editLightingReplacementItem(lightingReplacementTreasureHunt: LightingReplacementTreasureHunt, index: number) {
    this.calcOpportunitySheet = lightingReplacementTreasureHunt.opportunitySheet;
    this.isNewOpportunity = false;
    this.lightingReplacementService.baselineData = lightingReplacementTreasureHunt.baseline;
    this.lightingReplacementService.modificationData = lightingReplacementTreasureHunt.modifications;
    this.lightingReplacementService.baselineElectricityCost = lightingReplacementTreasureHunt.baselineElectricityCost;
    this.lightingReplacementService.modificationElectricityCost = lightingReplacementTreasureHunt.modificationElectricityCost;
    this.itemIndex = index;
    this.selectedCalc.next('lighting-replacement');
  }
  cancelLightingCalc() {
    this.calcOpportunitySheet = undefined;
    this.lightingReplacementService.baselineData = undefined;
    this.lightingReplacementService.modificationData = undefined;
    this.lightingReplacementService.baselineElectricityCost = undefined;
    this.lightingReplacementService.modificationElectricityCost = undefined;
    this.cancelCalc();
  }
  //opportunitySheet
  addNewOpportunitySheet() {
    this.isNewOpportunity = true;
    this.opportunitySheetService.opportunitySheet = undefined;
    this.selectedCalc.next('opportunity-sheet');
  }
  editOpportunitySheetItem(opportunitySheet: OpportunitySheet, index: number) {
    this.isNewOpportunity = false;
    this.opportunitySheetService.opportunitySheet = opportunitySheet;
    this.itemIndex = index;
    this.selectedCalc.next('opportunity-sheet');
  }
  cancelOpportunitySheet() {
    this.opportunitySheetService.opportunitySheet = undefined;
    this.cancelCalc();
  }

  //replace existing
  addNewReplaceExistingMotor() {
    this.calcOpportunitySheet = undefined;
    this.replaceExistingService.replaceExistingData = undefined;
    this.isNewOpportunity = true;
    this.selectedCalc.next('replace-existing');
  }
  editReplaceExistingMotorsItem(replaceExistingMotorsTreasureHunt: ReplaceExistingMotorTreasureHunt, index: number) {
    this.calcOpportunitySheet = replaceExistingMotorsTreasureHunt.opportunitySheet;
    this.isNewOpportunity = false;
    this.replaceExistingService.replaceExistingData = replaceExistingMotorsTreasureHunt.replaceExistingData;
    this.itemIndex = index;
    this.selectedCalc.next('replace-existing');
  }
  cancelReplaceExistingMotors() {
    this.calcOpportunitySheet = undefined;
    this.replaceExistingService.replaceExistingData = undefined;
    this.cancelCalc();
  }
  //motor drive
  addNewMotorDrive() {
    this.calcOpportunitySheet = undefined;
    this.motorDriveService.motorDriveData = undefined;
    this.isNewOpportunity = true;
    this.selectedCalc.next('motor-drive');
  }
  editMotorDrivesItem(motorDriveTreasureHunt: MotorDriveInputsTreasureHunt, index: number) {
    this.calcOpportunitySheet = motorDriveTreasureHunt.opportunitySheet;
    this.itemIndex = index;
    this.isNewOpportunity = false;
    this.motorDriveService.motorDriveData = motorDriveTreasureHunt.motorDriveInputs;
    this.selectedCalc.next('motor-drive');
  }
  cancelMotorDrive() {
    this.calcOpportunitySheet = undefined;
    this.motorDriveService.motorDriveData = undefined;
    this.cancelCalc();
  }
  //natural gas reduction
  addNewNaturalGasReduction() {
    this.calcOpportunitySheet = undefined;
    this.isNewOpportunity = true;
    this.naturalGasReductionService.baselineData = undefined;
    this.naturalGasReductionService.modificationData = undefined;
    this.selectedCalc.next('natural-gas-reduction');
  }
  editNaturalGasReductionsItem(naturalGasReductionTreasureHunt: NaturalGasReductionTreasureHunt, index: number) {
    this.calcOpportunitySheet = naturalGasReductionTreasureHunt.opportunitySheet;
    this.itemIndex = index;
    this.isNewOpportunity = false;
    this.naturalGasReductionService.baselineData = naturalGasReductionTreasureHunt.baseline;
    this.naturalGasReductionService.modificationData = naturalGasReductionTreasureHunt.modification;
    this.selectedCalc.next('natural-gas-reduction');
  }
  cancelNaturalGasReduction() {
    this.calcOpportunitySheet = undefined;
    this.naturalGasReductionService.baselineData = undefined;
    this.naturalGasReductionService.modificationData = undefined;
    this.cancelCalc();
  }
  //edit electricity
  addNewElectricityReduction() {
    this.calcOpportunitySheet = undefined;
    this.isNewOpportunity = true;
    this.electricityReductionService.baselineData = undefined;
    this.electricityReductionService.modificationData = undefined;
    this.selectedCalc.next('electricity-reduction');
  }
  editElectricityReductionsItem(electricityReduction: ElectricityReductionTreasureHunt, index: number) {
    this.calcOpportunitySheet = electricityReduction.opportunitySheet;
    this.isNewOpportunity = false;
    this.electricityReductionService.baselineData = electricityReduction.baseline;
    this.electricityReductionService.modificationData = electricityReduction.modification;
    this.itemIndex = index;
    this.selectedCalc.next('electricity-reduction');
  }
  cancelElectricityReduction() {
    this.calcOpportunitySheet = undefined;
    this.electricityReductionService.baselineData = undefined;
    this.electricityReductionService.modificationData = undefined;
    this.cancelCalc();
  }
  //compressed air reduction
  addNewCompressedAirReduction() {
    this.calcOpportunitySheet = undefined;
    this.compressedAirReductionService.baselineData = undefined;
    this.compressedAirReductionService.modificationData = undefined;
    this.isNewOpportunity = true;
    this.selectedCalc.next('compressed-air-reduction');
  }
  editCompressedAirReductionsItem(compressedAirReduction: CompressedAirReductionTreasureHunt, index: number) {
    this.calcOpportunitySheet = compressedAirReduction.opportunitySheet;
    this.compressedAirReductionService.baselineData = compressedAirReduction.baseline;
    this.compressedAirReductionService.modificationData = compressedAirReduction.modification;
    this.itemIndex = index;
    this.isNewOpportunity = false;
    this.selectedCalc.next('compressed-air-reduction');
  }
  cancelCompressedAirReduction() {
    this.calcOpportunitySheet = undefined;
    this.compressedAirReductionService.baselineData = undefined;
    this.compressedAirReductionService.modificationData = undefined;
    this.cancelCalc();
  }
  //compressed air pressure
  addNewCompressedAirPressureReductions() {
    this.calcOpportunitySheet = undefined;
    this.compressedAirPressureReductionService.baselineData = undefined;
    this.compressedAirPressureReductionService.modificationData = undefined;
    this.isNewOpportunity = true;
    this.selectedCalc.next('compressed-air-pressure-reduction');
  }
  editCompressedAirPressureReductionsItem(compressedAirPressureReduction: CompressedAirPressureReductionTreasureHunt, index: number) {
    this.calcOpportunitySheet = compressedAirPressureReduction.opportunitySheet;
    this.compressedAirPressureReductionService.baselineData = compressedAirPressureReduction.baseline;
    this.compressedAirPressureReductionService.modificationData = compressedAirPressureReduction.modification;
    this.itemIndex = index;
    this.isNewOpportunity = false;
    this.selectedCalc.next('compressed-air-pressure-reduction');
  }
  cancelCompressedAirPressureReduction() {
    this.calcOpportunitySheet = undefined;
    this.compressedAirPressureReductionService.baselineData = undefined;
    this.compressedAirPressureReductionService.modificationData = undefined;
    this.cancelCalc();
  }
  //water reductions
  addNewWaterReduction() {
    this.calcOpportunitySheet = undefined;
    this.waterReductionService.baselineData = undefined;
    this.waterReductionService.modificationData = undefined;
    this.isNewOpportunity = true;
    this.selectedCalc.next('water-reduction');
  }
  editWaterReductionsItem(waterReduction: WaterReductionTreasureHunt, index: number) {
    this.calcOpportunitySheet = waterReduction.opportunitySheet;
    this.isNewOpportunity = false;
    this.itemIndex = index;
    this.waterReductionService.baselineData = waterReduction.baseline;
    this.waterReductionService.modificationData = waterReduction.modification;
    this.selectedCalc.next('water-reduction');
  }
  cancelWaterReduction() {
    this.calcOpportunitySheet = undefined;
    this.waterReductionService.baselineData = undefined;
    this.waterReductionService.modificationData = undefined;
    this.cancelCalc();
  }

  //steam reductions
  addNewSteamReduction() {
    this.calcOpportunitySheet = undefined;
    this.steamReductionService.baselineData = undefined;
    this.steamReductionService.modificationData = undefined;
    this.isNewOpportunity = true;
    this.selectedCalc.next('steam-reduction');
  }
  editSteamReductionsItem(steamReduction: SteamReductionTreasureHunt, index: number) {
    this.calcOpportunitySheet = steamReduction.opportunitySheet;
    this.isNewOpportunity = false;
    this.itemIndex = index;
    this.steamReductionService.baselineData = steamReduction.baseline;
    this.steamReductionService.modificationData = steamReduction.modification;
    this.selectedCalc.next('steam-reduction');
  }
  cancelSteamReduction() {
    this.calcOpportunitySheet = undefined;
    this.steamReductionService.baselineData = undefined;
    this.steamReductionService.modificationData = undefined;
    this.cancelCalc();
  }

  //pipe insulation reduction
  addNewPipeInsulationReduction() {
    this.calcOpportunitySheet = undefined;
    this.pipeInsulationReductionService.baselineData = undefined;
    this.pipeInsulationReductionService.modificationData = undefined;
    this.isNewOpportunity = true;
    this.selectedCalc.next('pipe-insulation-reduction');
  }
  editPipeInsulationReductionsItem(pipeInsulationReduction: PipeInsulationReductionTreasureHunt, index: number) {
    this.calcOpportunitySheet = pipeInsulationReduction.opportunitySheet;
    this.isNewOpportunity = false;
    this.itemIndex = index;
    this.pipeInsulationReductionService.baselineData = pipeInsulationReduction.baseline;
    this.pipeInsulationReductionService.modificationData = pipeInsulationReduction.modification;
    this.selectedCalc.next('pipe-insulation-reduction');
  }
  cancelPipeInsulationReduction() {
    this.calcOpportunitySheet = undefined;
    this.pipeInsulationReductionService.baselineData = undefined;
    this.pipeInsulationReductionService.modificationData = undefined;
    this.cancelCalc();
  }

  //tank insulation reduction
  addNewTankInsulationReduction() {
    this.calcOpportunitySheet = undefined;
    this.tankInsulationReductionService.baselineData = undefined;
    this.tankInsulationReductionService.modificationData = undefined;
    this.isNewOpportunity = true;
    this.selectedCalc.next('tank-insulation-reduction');
  }
  editTankInsulationReductionsItem(tankInsulationReduction: TankInsulationReductionTreasureHunt, index: number) {
    this.calcOpportunitySheet = tankInsulationReduction.opportunitySheet;
    this.isNewOpportunity = false;
    this.itemIndex = index;
    this.tankInsulationReductionService.baselineData = tankInsulationReduction.baseline;
    this.tankInsulationReductionService.modificationData = tankInsulationReduction.modification;
    this.selectedCalc.next('tank-insulation-reduction');
  }
  cancelTankInsulationReduction() {
    this.calcOpportunitySheet = undefined;
    this.tankInsulationReductionService.baselineData = undefined;
    this.tankInsulationReductionService.modificationData = undefined;
    this.cancelCalc();
  }

  //tank insulation reduction
  addNewAirLeakSurvey() {
    this.calcOpportunitySheet = undefined;
    this.airLeakService.airLeakInput.next(undefined);
    this.isNewOpportunity = true;
    this.selectedCalc.next('air-leak-survey');
  }
  editAirLeakSurveyItem(airLeakSurvey: AirLeakSurveyTreasureHunt, index: number) {
    this.calcOpportunitySheet = airLeakSurvey.opportunitySheet;
    this.isNewOpportunity = false;
    this.itemIndex = index;
    this.airLeakService.airLeakInput.next(airLeakSurvey.airLeakSurveyInput);
    this.selectedCalc.next('air-leak-survey');
  }
  cancelAirLeakSurvey() {
    this.calcOpportunitySheet = undefined;
    this.airLeakService.airLeakInput.next(undefined);
    this.cancelCalc();
  }
}
