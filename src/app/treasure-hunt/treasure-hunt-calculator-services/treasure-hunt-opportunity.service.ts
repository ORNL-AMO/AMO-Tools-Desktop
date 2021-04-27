import { Injectable } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { AirLeakSurveyTreasureHunt, CompressedAirPressureReductionTreasureHunt, CompressedAirReductionTreasureHunt, ElectricityReductionTreasureHunt, LightingReplacementTreasureHunt, MotorDriveInputsTreasureHunt, NaturalGasReductionTreasureHunt, OpportunitySheet, PipeInsulationReductionTreasureHunt, ReplaceExistingMotorTreasureHunt, SteamReductionTreasureHunt, TankInsulationReductionTreasureHunt, Treasure, TreasureHunt, TreasureHuntOpportunity, WaterReductionTreasureHunt } from '../../shared/models/treasure-hunt';
import { CalculatorsService } from '../calculators/calculators.service';
import { OpportunityCardData, OpportunityCardsService } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import { TreasureHuntService } from '../treasure-hunt.service';
import { AirLeakTreasureHuntService } from './air-leak-treasure-hunt.service';
import { CaPressureReductionTreasureHuntService } from './ca-pressure-reduction-treasure-hunt.service';
import { CaReductionTreasureHuntService } from './ca-reduction-treasure-hunt.service';
import { ElectricityReductionTreasureHuntService } from './electricity-reduction-treasure-hunt.service';
import { LightingReplacementTreasureHuntService } from './lighting-replacement-treasure-hunt.service';
import { MotorDriveTreasureHuntService } from './motor-drive-treasure-hunt.service';
import { NaturalGasReductionTreasureHuntService } from './natural-gas-reduction-treasure-hunt.service';
import { PipeInsulationTreasureHuntService } from './pipe-insulation-treasure-hunt.service';
import { ReplaceExistingTreasureHuntService } from './replace-existing-treasure-hunt.service';
import { StandaloneOpportunitySheetService } from './standalone-opportunity-sheet.service';
import { SteamReductionTreasureHuntService } from './steam-reduction-treasure-hunt.service';
import { TankInsulationTreasureHuntService } from './tank-insulation-treasure-hunt.service';
import { WaterReductionTreasureHuntService } from './water-reduction-treasure-hunt.service';

@Injectable()
export class TreasureHuntOpportunityService {

  constructor(
    private opportunityCardsService: OpportunityCardsService,
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
      updatedCard = this.opportunityCardsService.getAirLeakSurveyCardData(airLeakSurveyOpportunity, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.tankInsulation) {
      let tankInsulationOpportunity = currentOpportunity as TankInsulationReductionTreasureHunt;
      treasureHunt.tankInsulationReductions[this.calculatorsService.itemIndex] = tankInsulationOpportunity;
      updatedCard = this.opportunityCardsService.getTankInsulationReductionCardData(tankInsulationOpportunity, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.opportunitySheet && standaloneOpportunitySheet) {
      treasureHunt.opportunitySheets[this.calculatorsService.itemIndex] = standaloneOpportunitySheet;
      updatedCard = this.opportunityCardsService.getOpportunitySheetCardData(standaloneOpportunitySheet, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
   
    } else if (selectedCalc === Treasure.lightingReplacement) {
      let lightingReplacementOpportunity = currentOpportunity as LightingReplacementTreasureHunt;
      treasureHunt.lightingReplacements[this.calculatorsService.itemIndex] = lightingReplacementOpportunity;
      updatedCard = this.opportunityCardsService.getLightingReplacementCardData(lightingReplacementOpportunity, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage, settings,);
    
    } else if (selectedCalc === Treasure.replaceExisting) {
      let replaceExistingMotorOpportunity = currentOpportunity as ReplaceExistingMotorTreasureHunt;
      treasureHunt.replaceExistingMotors[this.calculatorsService.itemIndex] = replaceExistingMotorOpportunity;
      updatedCard = this.opportunityCardsService.getReplaceExistingCardData(replaceExistingMotorOpportunity, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage, settings);
    
    } else if (selectedCalc === Treasure.motorDrive) {
      let motorDriveOpportunity = currentOpportunity as MotorDriveInputsTreasureHunt;
      treasureHunt.motorDrives[this.calculatorsService.itemIndex] = motorDriveOpportunity;
      updatedCard = this.opportunityCardsService.getMotorDriveCard(motorDriveOpportunity, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage, settings);
    
    } else if (selectedCalc === Treasure.naturalGasReduction) {
      let naturalGasReductionOpportunity = currentOpportunity as NaturalGasReductionTreasureHunt;
      treasureHunt.naturalGasReductions[this.calculatorsService.itemIndex] = naturalGasReductionOpportunity;
      updatedCard = this.opportunityCardsService.getNaturalGasReductionCard(naturalGasReductionOpportunity, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage, settings);
    
    } else if (selectedCalc === Treasure.electricityReduction) {
      let electricityReductionOpportunity = currentOpportunity as ElectricityReductionTreasureHunt;
      treasureHunt.electricityReductions[this.calculatorsService.itemIndex] = electricityReductionOpportunity;
      updatedCard = this.opportunityCardsService.getElectricityReductionCard(electricityReductionOpportunity, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.compressedAir) {
      let compressedAirOpportunity = currentOpportunity as CompressedAirReductionTreasureHunt;
      treasureHunt.compressedAirReductions[this.calculatorsService.itemIndex] = compressedAirOpportunity;
      updatedCard = this.opportunityCardsService.getCompressedAirReductionCardData(compressedAirOpportunity, settings, treasureHunt.currentEnergyUsage, this.calculatorsService.itemIndex);
    
    } else if (selectedCalc === Treasure.compressedAirPressure) {
      let compressedAirPressureOpportunity = currentOpportunity as CompressedAirPressureReductionTreasureHunt;
      treasureHunt.compressedAirPressureReductions[this.calculatorsService.itemIndex] = compressedAirPressureOpportunity;
      updatedCard = this.opportunityCardsService.getCompressedAirPressureReductionCardData(compressedAirPressureOpportunity, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.waterReduction) {
      let waterReductionOpportunity = currentOpportunity as WaterReductionTreasureHunt;
      treasureHunt.waterReductions[this.calculatorsService.itemIndex] = waterReductionOpportunity;
      updatedCard = this.opportunityCardsService.getWaterReductionCardData(waterReductionOpportunity, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.steamReduction) {
      let steamReductionOpportunity = currentOpportunity as SteamReductionTreasureHunt;
      treasureHunt.steamReductions[this.calculatorsService.itemIndex] = steamReductionOpportunity;
      updatedCard = this.opportunityCardsService.getSteamReductionCardData(steamReductionOpportunity, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    } else if (selectedCalc === Treasure.pipeInsulation) {
      let pipeInsulationOpportunity = currentOpportunity as PipeInsulationReductionTreasureHunt;
      treasureHunt.pipeInsulationReductions[this.calculatorsService.itemIndex] = pipeInsulationOpportunity;
      updatedCard = this.opportunityCardsService.getPipeInsulationReductionCardData(pipeInsulationOpportunity, settings, this.calculatorsService.itemIndex, treasureHunt.currentEnergyUsage);
    
    }
    
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    this.treasureHuntService.treasureHunt.next(treasureHunt);
  }
  
}
