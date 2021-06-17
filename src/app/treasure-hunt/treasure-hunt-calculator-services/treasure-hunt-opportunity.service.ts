import { Injectable } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { AirHeatingTreasureHunt, AirLeakSurveyTreasureHunt, CompressedAirPressureReductionTreasureHunt, CompressedAirReductionTreasureHunt, ElectricityReductionTreasureHunt, FlueGasTreasureHunt, HeatCascadingTreasureHunt, LeakageLossTreasureHunt, LightingReplacementTreasureHunt, MotorDriveInputsTreasureHunt, NaturalGasReductionTreasureHunt, OpeningLossTreasureHunt, OpportunitySheet, OpportunitySummary, PipeInsulationReductionTreasureHunt, ReplaceExistingMotorTreasureHunt, SteamReductionTreasureHunt, TankInsulationReductionTreasureHunt, Treasure, TreasureHunt, TreasureHuntOpportunity, WallLossTreasureHunt, WasteHeatTreasureHunt, WaterHeatingTreasureHunt, WaterReductionTreasureHunt } from '../../shared/models/treasure-hunt';
import { CalculatorsService } from '../calculators/calculators.service';
import { OpportunityCardData, OpportunityCardsService } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import { OpportunitySummaryService } from '../treasure-hunt-report/opportunity-summary.service';
import { TreasureHuntService } from '../treasure-hunt.service';
import { AirHeatingTreasureHuntService } from './air-heating-treasure-hunt.service';
import { AirLeakTreasureHuntService } from './air-leak-treasure-hunt.service';
import { CaPressureReductionTreasureHuntService } from './ca-pressure-reduction-treasure-hunt.service';
import { CaReductionTreasureHuntService } from './ca-reduction-treasure-hunt.service';
import { ElectricityReductionTreasureHuntService } from './electricity-reduction-treasure-hunt.service';
import { FlueGasTreasureHuntService } from './flue-gas-treasure-hunt.service';
import { HeatCascadingTreasureHuntService } from './heat-cascading-treasure-hunt.service';
import { LeakageTreasureHuntService } from './leakage-treasure-hunt.service';
import { LightingReplacementTreasureHuntService } from './lighting-replacement-treasure-hunt.service';
import { MotorDriveTreasureHuntService } from './motor-drive-treasure-hunt.service';
import { NaturalGasReductionTreasureHuntService } from './natural-gas-reduction-treasure-hunt.service';
import { OpeningTreasureHuntService } from './opening-treasure-hunt.service';
import { PipeInsulationTreasureHuntService } from './pipe-insulation-treasure-hunt.service';
import { ReplaceExistingTreasureHuntService } from './replace-existing-treasure-hunt.service';
import { StandaloneOpportunitySheetService } from './standalone-opportunity-sheet.service';
import { SteamReductionTreasureHuntService } from './steam-reduction-treasure-hunt.service';
import { TankInsulationTreasureHuntService } from './tank-insulation-treasure-hunt.service';
import { WallTreasureHuntService } from './wall-treasure-hunt.service';
import { WasteHeatTreasureHuntService } from './waste-heat-treasure-hunt.service';
import { WaterHeatingTreasureHuntService } from './water-heating-treasure-hunt.service';
import { WaterReductionTreasureHuntService } from './water-reduction-treasure-hunt.service';

@Injectable()
export class TreasureHuntOpportunityService {

  constructor(
    private opportunityCardsService: OpportunityCardsService,
    private opportunitySummaryService: OpportunitySummaryService,
    private airLeakTreasureHuntService: AirLeakTreasureHuntService,
    private tankInsulationTreasureHuntService: TankInsulationTreasureHuntService,
    private standaloneOpportunitySheetService: StandaloneOpportunitySheetService,
    private lightingReplacementTreasureHuntService: LightingReplacementTreasureHuntService,
    private replaceExistingTreasureService: ReplaceExistingTreasureHuntService,
    private motorDriveTreasureHuntService: MotorDriveTreasureHuntService,
    private naturalGasTreasureHuntService: NaturalGasReductionTreasureHuntService,
    private electricityReductionTreasureHuntService: ElectricityReductionTreasureHuntService,
    private compressedAirTreasureHuntService: CaReductionTreasureHuntService,
    private compressedAirPressureTreasureHuntService: CaPressureReductionTreasureHuntService,
    private waterReductionTreasureHuntService: WaterReductionTreasureHuntService,
    private steamReductionTreasureHuntService: SteamReductionTreasureHuntService,
    private pipeInsulationTreasureHuntService: PipeInsulationTreasureHuntService,
    private wallTreasureService: WallTreasureHuntService,
    private airHeatingTreasureHuntService: AirHeatingTreasureHuntService,
    private openingTreasureService: OpeningTreasureHuntService,
    private leakageTreasureHuntService: LeakageTreasureHuntService,
    private flueGasTreasureHuntService: FlueGasTreasureHuntService,
    private wasteHeatTreasureHuntService: WasteHeatTreasureHuntService,
    private heatCascadingTreasureHuntService: HeatCascadingTreasureHuntService,
    private waterHeatingTreasureHuntService: WaterHeatingTreasureHuntService,
    private treasureHuntService: TreasureHuntService,
    private calculatorsService: CalculatorsService
  ) { }

  saveTreasureHuntOpportunity(currentOpportunity: TreasureHuntOpportunity, selectedCalc: string, standaloneOppSheet: OpportunitySheet) {
    let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
    if (selectedCalc === Treasure.airLeak) {
      let airLeakSurveyOpportunity = currentOpportunity as AirLeakSurveyTreasureHunt;
      treasureHunt = this.airLeakTreasureHuntService.saveTreasureHuntOpportunity(airLeakSurveyOpportunity, treasureHunt);
    } else if (selectedCalc === Treasure.tankInsulation) {
      let tankInsulationReductionTreasureHunt = currentOpportunity as TankInsulationReductionTreasureHunt;
      treasureHunt = this.tankInsulationTreasureHuntService.saveTreasureHuntOpportunity(tankInsulationReductionTreasureHunt, treasureHunt);
    } else if (selectedCalc === Treasure.opportunitySheet && standaloneOppSheet) {
      treasureHunt = this.standaloneOpportunitySheetService.saveTreasureHuntOpportunity(standaloneOppSheet, treasureHunt);
    } else if (selectedCalc === Treasure.lightingReplacement) {
      let lightingReplacementTreasureHunt = currentOpportunity as LightingReplacementTreasureHunt;
      treasureHunt = this.lightingReplacementTreasureHuntService.saveTreasureHuntOpportunity(lightingReplacementTreasureHunt, treasureHunt);
    } else if (selectedCalc === Treasure.replaceExisting) {
      let replaceExisting = currentOpportunity as ReplaceExistingMotorTreasureHunt;
      treasureHunt = this.replaceExistingTreasureService.saveTreasureHuntOpportunity(replaceExisting, treasureHunt);
    } else if (selectedCalc === Treasure.motorDrive) {
      let motorDrive = currentOpportunity as MotorDriveInputsTreasureHunt;
      treasureHunt = this.motorDriveTreasureHuntService.saveTreasureHuntOpportunity(motorDrive, treasureHunt);
    }  else if (selectedCalc === Treasure.naturalGasReduction) {
      let naturalGasReduction = currentOpportunity as NaturalGasReductionTreasureHunt;
      treasureHunt = this.naturalGasTreasureHuntService.saveTreasureHuntOpportunity(naturalGasReduction, treasureHunt);
    }  else if (selectedCalc === Treasure.electricityReduction) {
      let electricityReduction = currentOpportunity as ElectricityReductionTreasureHunt;
      treasureHunt = this.electricityReductionTreasureHuntService.saveTreasureHuntOpportunity(electricityReduction, treasureHunt);
    }  else if (selectedCalc === Treasure.compressedAir) {
      let compressedAir = currentOpportunity as CompressedAirReductionTreasureHunt;
      treasureHunt = this.compressedAirTreasureHuntService.saveTreasureHuntOpportunity(compressedAir, treasureHunt);
    }  else if (selectedCalc === Treasure.compressedAirPressure) {
      let compressedAirPressure = currentOpportunity as CompressedAirPressureReductionTreasureHunt;
      treasureHunt = this.compressedAirPressureTreasureHuntService.saveTreasureHuntOpportunity(compressedAirPressure, treasureHunt);
    } else if (selectedCalc === Treasure.steamReduction) {
      let steamReduction = currentOpportunity as SteamReductionTreasureHunt;
      treasureHunt = this.steamReductionTreasureHuntService.saveTreasureHuntOpportunity(steamReduction, treasureHunt);
    } else if (selectedCalc === Treasure.waterReduction) {
      let waterReduction = currentOpportunity as WaterReductionTreasureHunt;
      treasureHunt = this.waterReductionTreasureHuntService.saveTreasureHuntOpportunity(waterReduction, treasureHunt);
    } else if (selectedCalc === Treasure.pipeInsulation) {
      let pipeInsulation = currentOpportunity as PipeInsulationReductionTreasureHunt;
      treasureHunt = this.pipeInsulationTreasureHuntService.saveTreasureHuntOpportunity(pipeInsulation, treasureHunt);
    } else if (selectedCalc === Treasure.wallLoss) {
      let wallLoss = currentOpportunity as WallLossTreasureHunt;
      treasureHunt = this.wallTreasureService.saveTreasureHuntOpportunity(wallLoss, treasureHunt);
    } else if (selectedCalc === Treasure.flueGas) {
      let flueGas = currentOpportunity as FlueGasTreasureHunt;
      treasureHunt = this.flueGasTreasureHuntService.saveTreasureHuntOpportunity(flueGas, treasureHunt);
    } else if (selectedCalc === Treasure.leakageLoss) {
      let leakageLoss = currentOpportunity as LeakageLossTreasureHunt;
      treasureHunt = this.leakageTreasureHuntService.saveTreasureHuntOpportunity(leakageLoss, treasureHunt);
    } else if (selectedCalc === Treasure.wasteHeat) {
      let wasteHeat = currentOpportunity as WasteHeatTreasureHunt;
      treasureHunt = this.wasteHeatTreasureHuntService.saveTreasureHuntOpportunity(wasteHeat, treasureHunt); 
    } else if (selectedCalc === Treasure.openingLoss) {
      let openingLoss = currentOpportunity as OpeningLossTreasureHunt;
      treasureHunt = this.openingTreasureService.saveTreasureHuntOpportunity(openingLoss, treasureHunt);
    } else if (selectedCalc === Treasure.airHeating) {
      let airHeating = currentOpportunity as AirHeatingTreasureHunt;
      treasureHunt = this.airHeatingTreasureHuntService.saveTreasureHuntOpportunity(airHeating, treasureHunt);
    } else if (selectedCalc === Treasure.heatCascading) {
      let heatCascading = currentOpportunity as HeatCascadingTreasureHunt;
      treasureHunt = this.heatCascadingTreasureHuntService.saveTreasureHuntOpportunity(heatCascading, treasureHunt);
    } else if (selectedCalc === Treasure.waterHeating) {
      let waterHeating = currentOpportunity as WaterHeatingTreasureHunt;
      treasureHunt = this.waterHeatingTreasureHuntService.saveTreasureHuntOpportunity(waterHeating, treasureHunt);
    } 

    this.treasureHuntService.treasureHunt.next(treasureHunt);
  }

  cancelTreasureHuntOpportunity(selectedCalc: string) {
    this.calculatorsService.calcOpportunitySheet = undefined

    if (selectedCalc === Treasure.airLeak) {
      this.airLeakTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.tankInsulation) {
      this.tankInsulationTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.opportunitySheet) {
      this.calculatorsService.cancelOpportunitySheet();
    } else if (selectedCalc === Treasure.lightingReplacement) {
      this.lightingReplacementTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.replaceExisting) {
      this.replaceExistingTreasureService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.motorDrive) {
      this.motorDriveTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.naturalGasReduction) {
      this.naturalGasTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.electricityReduction) {
      this.electricityReductionTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.compressedAir) {
      this.compressedAirTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.compressedAirPressure) {
      this.compressedAirPressureTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.waterReduction) {
      this.waterReductionTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.steamReduction) {
      this.steamReductionTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.pipeInsulation) {
      this.pipeInsulationTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.wallLoss) {
      this.wallTreasureService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.flueGas) {
      this.flueGasTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.leakageLoss) {
      this.leakageTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.wasteHeat) {
      this.wasteHeatTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.openingLoss) {
      this.openingTreasureService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.airHeating) {
      this.airHeatingTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.heatCascading) {
      this.heatCascadingTreasureHuntService.resetCalculatorInputs();
    } else if (selectedCalc === Treasure.waterHeating) {
      this.waterHeatingTreasureHuntService.resetCalculatorInputs();
    }       

    this.calculatorsService.itemIndex = undefined;
    this.calculatorsService.selectedCalc.next('none');
  }

  updateTreasureHuntOpportunity(currentOpportunity: TreasureHuntOpportunity, selectedCalc: string, settings: Settings, standaloneOpportunitySheet: OpportunitySheet) {
    let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
    let updatedCard: OpportunityCardData;
    if (selectedCalc === Treasure.airLeak) {
      let airLeakSurveyOpportunity = currentOpportunity as AirLeakSurveyTreasureHunt;
      treasureHunt.airLeakSurveys[this.calculatorsService.itemIndex] = airLeakSurveyOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(airLeakSurveyOpportunity, settings);
      updatedCard = this.airLeakTreasureHuntService.getAirLeakSurveyCardData(airLeakSurveyOpportunity, opportunitySummary, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.tankInsulation) {
      let tankInsulationOpportunity = currentOpportunity as TankInsulationReductionTreasureHunt;
      treasureHunt.tankInsulationReductions[this.calculatorsService.itemIndex] = tankInsulationOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(tankInsulationOpportunity, settings);
      updatedCard = this.tankInsulationTreasureHuntService.getTankInsulationReductionCardData(tankInsulationOpportunity, opportunitySummary, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.opportunitySheet && standaloneOpportunitySheet) {
      treasureHunt.opportunitySheets[this.calculatorsService.itemIndex] = standaloneOpportunitySheet;
      updatedCard = this.opportunityCardsService.getOpportunitySheetCardData(standaloneOpportunitySheet, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
   
    } else if (selectedCalc === Treasure.lightingReplacement) {
      let lightingReplacementOpportunity = currentOpportunity as LightingReplacementTreasureHunt;
      treasureHunt.lightingReplacements[this.calculatorsService.itemIndex] = lightingReplacementOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(lightingReplacementOpportunity, settings);
      updatedCard = this.lightingReplacementTreasureHuntService.getLightingReplacementCardData(lightingReplacementOpportunity, opportunitySummary, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage, settings,);
    
    } else if (selectedCalc === Treasure.replaceExisting) {
      let replaceExistingMotorOpportunity = currentOpportunity as ReplaceExistingMotorTreasureHunt;
      treasureHunt.replaceExistingMotors[this.calculatorsService.itemIndex] = replaceExistingMotorOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(replaceExistingMotorOpportunity, settings);
      updatedCard = this.replaceExistingTreasureService.getReplaceExistingCardData(replaceExistingMotorOpportunity, opportunitySummary, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage, settings);
    
    } else if (selectedCalc === Treasure.motorDrive) {
      let motorDriveOpportunity = currentOpportunity as MotorDriveInputsTreasureHunt;
      treasureHunt.motorDrives[this.calculatorsService.itemIndex] = motorDriveOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(motorDriveOpportunity, settings);
      updatedCard = this.motorDriveTreasureHuntService.getMotorDriveCard(motorDriveOpportunity, opportunitySummary, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage, settings);
    
    } else if (selectedCalc === Treasure.naturalGasReduction) {
      let naturalGasReductionOpportunity = currentOpportunity as NaturalGasReductionTreasureHunt;
      treasureHunt.naturalGasReductions[this.calculatorsService.itemIndex] = naturalGasReductionOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(naturalGasReductionOpportunity, settings);
      updatedCard = this.naturalGasTreasureHuntService.getNaturalGasReductionCard(naturalGasReductionOpportunity, opportunitySummary, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage, settings);
    
    } else if (selectedCalc === Treasure.electricityReduction) {
      let electricityReductionOpportunity = currentOpportunity as ElectricityReductionTreasureHunt;
      treasureHunt.electricityReductions[this.calculatorsService.itemIndex] = electricityReductionOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(electricityReductionOpportunity, settings);
      updatedCard = this.electricityReductionTreasureHuntService.getElectricityReductionCard(electricityReductionOpportunity, opportunitySummary, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.compressedAir) {
      let compressedAirOpportunity = currentOpportunity as CompressedAirReductionTreasureHunt;
      treasureHunt.compressedAirReductions[this.calculatorsService.itemIndex] = compressedAirOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(compressedAirOpportunity, settings);
      updatedCard = this.compressedAirTreasureHuntService.getCompressedAirReductionCardData(compressedAirOpportunity, opportunitySummary, settings, treasureHunt.currentEnergyUsage, this.calculatorsService.itemIndex);
    
    } else if (selectedCalc === Treasure.compressedAirPressure) {
      let compressedAirPressureOpportunity = currentOpportunity as CompressedAirPressureReductionTreasureHunt;
      treasureHunt.compressedAirPressureReductions[this.calculatorsService.itemIndex] = compressedAirPressureOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(compressedAirPressureOpportunity, settings);
      updatedCard = this.compressedAirPressureTreasureHuntService.getCompressedAirPressureReductionCardData(compressedAirPressureOpportunity, opportunitySummary, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.waterReduction) {
      let waterReductionOpportunity = currentOpportunity as WaterReductionTreasureHunt;
      treasureHunt.waterReductions[this.calculatorsService.itemIndex] = waterReductionOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(waterReductionOpportunity, settings);
      updatedCard = this.waterReductionTreasureHuntService.getWaterReductionCardData(waterReductionOpportunity, opportunitySummary, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.steamReduction) {
      let steamReductionOpportunity = currentOpportunity as SteamReductionTreasureHunt;
      treasureHunt.steamReductions[this.calculatorsService.itemIndex] = steamReductionOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(steamReductionOpportunity, settings);
      updatedCard = this.steamReductionTreasureHuntService.getSteamReductionCardData(steamReductionOpportunity, opportunitySummary, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.pipeInsulation) {
      let pipeInsulationOpportunity = currentOpportunity as PipeInsulationReductionTreasureHunt;
      treasureHunt.pipeInsulationReductions[this.calculatorsService.itemIndex] = pipeInsulationOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(pipeInsulationOpportunity, settings);
      updatedCard = this.pipeInsulationTreasureHuntService.getPipeInsulationReductionCardData(pipeInsulationOpportunity, opportunitySummary, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.wallLoss) {
      let wallLossOpportunity = currentOpportunity as WallLossTreasureHunt;
      treasureHunt.wallLosses[this.calculatorsService.itemIndex] = wallLossOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(wallLossOpportunity, settings);
      updatedCard = this.wallTreasureService.getWallLossCardData(wallLossOpportunity, opportunitySummary, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.flueGas) {
      let flueGasOpportunity = currentOpportunity as FlueGasTreasureHunt;
      treasureHunt.flueGasLosses[this.calculatorsService.itemIndex] = flueGasOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(flueGasOpportunity, settings);
      updatedCard = this.flueGasTreasureHuntService.getFlueGasCardData(flueGasOpportunity, opportunitySummary, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.leakageLoss) {
      let leakageLossOpportunity = currentOpportunity as LeakageLossTreasureHunt;
      treasureHunt.leakageLosses[this.calculatorsService.itemIndex] = leakageLossOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(leakageLossOpportunity, settings);
      updatedCard = this.leakageTreasureHuntService.getLeakageLossCardData(leakageLossOpportunity, opportunitySummary, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.wasteHeat) {
      let wasteHeatOpportunity = currentOpportunity as WasteHeatTreasureHunt;
      treasureHunt.wasteHeatReductions[this.calculatorsService.itemIndex] = wasteHeatOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(wasteHeatOpportunity, settings);
      updatedCard = this.wasteHeatTreasureHuntService.getWasteHeatCardData(wasteHeatOpportunity, opportunitySummary, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.openingLoss) {
      let openingLossOpportunity = currentOpportunity as OpeningLossTreasureHunt;
      treasureHunt.openingLosses[this.calculatorsService.itemIndex] = openingLossOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(openingLossOpportunity, settings);
      updatedCard = this.openingTreasureService.getOpeningLossCardData(openingLossOpportunity, opportunitySummary, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.airHeating) {
      let airHeatingOpportunity = currentOpportunity as AirHeatingTreasureHunt;
      treasureHunt.airHeatingOpportunities[this.calculatorsService.itemIndex] = airHeatingOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(airHeatingOpportunity, settings);
      updatedCard = this.airHeatingTreasureHuntService.getAirHeatingOpportunityCardData(airHeatingOpportunity, opportunitySummary, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.heatCascading) {
      let heatCascadingOpportunity = currentOpportunity as HeatCascadingTreasureHunt;
      treasureHunt.heatCascadingOpportunities[this.calculatorsService.itemIndex] = heatCascadingOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(heatCascadingOpportunity, settings);
      updatedCard = this.heatCascadingTreasureHuntService.getHeatCascadingOpportunityCardData(heatCascadingOpportunity, opportunitySummary, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.waterHeating) {
      let waterHeatingOpportunity = currentOpportunity as WaterHeatingTreasureHunt;
      treasureHunt.waterHeatingOpportunities[this.calculatorsService.itemIndex] = waterHeatingOpportunity;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(waterHeatingOpportunity, settings);
      updatedCard = this.waterHeatingTreasureHuntService.getWaterHeatingOpportunityCardData(waterHeatingOpportunity, opportunitySummary, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    }
    
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    this.treasureHuntService.treasureHunt.next(treasureHunt);
  }
  
}
