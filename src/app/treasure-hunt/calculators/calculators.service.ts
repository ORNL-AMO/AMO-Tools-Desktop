import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Treasure, OpportunitySheet, TreasureHunt } from '../../shared/models/treasure-hunt';
import { OpportunitySheetService } from './standalone-opportunity-sheet/opportunity-sheet.service';
import { AirLeakTreasureHuntService } from '../treasure-hunt-calculator-services/air-leak-treasure-hunt.service';
import { OpportunityCardData, OpportunityCardsService } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import { Settings } from '../../shared/models/settings';
import { StandaloneOpportunitySheetService } from '../treasure-hunt-calculator-services/standalone-opportunity-sheet.service';
import { TankInsulationTreasureHuntService } from '../treasure-hunt-calculator-services/tank-insulation-treasure-hunt.service';
import { LightingReplacementTreasureHuntService } from '../treasure-hunt-calculator-services/lighting-replacement-treasure-hunt.service';
import { ReplaceExistingTreasureHuntService } from '../treasure-hunt-calculator-services/replace-existing-treasure-hunt.service';
import { MotorDriveTreasureHuntService } from '../treasure-hunt-calculator-services/motor-drive-treasure-hunt.service';
import { NaturalGasReductionTreasureHuntService } from '../treasure-hunt-calculator-services/natural-gas-reduction-treasure-hunt.service';
import { ElectricityReductionTreasureHuntService } from '../treasure-hunt-calculator-services/electricity-reduction-treasure-hunt.service';
import { CaReductionTreasureHuntService } from '../treasure-hunt-calculator-services/ca-reduction-treasure-hunt.service';
import { CaPressureReductionTreasureHuntService } from '../treasure-hunt-calculator-services/ca-pressure-reduction-treasure-hunt.service';
import { WaterReductionTreasureHuntService } from '../treasure-hunt-calculator-services/water-reduction-treasure-hunt.service';
import { SteamReductionTreasureHuntService } from '../treasure-hunt-calculator-services/steam-reduction-treasure-hunt.service';
import { PipeInsulationTreasureHuntService } from '../treasure-hunt-calculator-services/pipe-insulation-treasure-hunt.service';
import { WallTreasureHuntService } from '../treasure-hunt-calculator-services/wall-treasure-hunt.service';

@Injectable()
export class CalculatorsService {

  selectedCalc: BehaviorSubject<string>;
  itemIndex: number;
  isNewOpportunity: boolean;
  calcOpportunitySheet: OpportunitySheet;
  constructor(
    private opportunityCardsService: OpportunityCardsService,
    private opportunitySheetService: OpportunitySheetService, 
    private airLeakTreasureHuntService: AirLeakTreasureHuntService,
    private tankInsulationTreasureHuntService: TankInsulationTreasureHuntService,
    private lightingTreasureHuntService: LightingReplacementTreasureHuntService,
    private replaceExistingTreasureService: ReplaceExistingTreasureHuntService,
    private motorDriveTreasureHuntService: MotorDriveTreasureHuntService,
    private naturalGasTreasureHuntService: NaturalGasReductionTreasureHuntService,
    private electricityReductionTreasureHuntService: ElectricityReductionTreasureHuntService,
    private compressedAirTreasureHuntService: CaReductionTreasureHuntService,
    private compressedAirPressureTreasureHuntService: CaPressureReductionTreasureHuntService,
    private waterReductionTreasureHuntService: WaterReductionTreasureHuntService,
    private steamReductionTreasureHuntService: SteamReductionTreasureHuntService,
    private pipeInsulationTreasureHuntService: PipeInsulationTreasureHuntService,
    private standaloneOpportunitySheetService: StandaloneOpportunitySheetService,
    private wallLossTreasureHuntService: WallTreasureHuntService
    ) {
    this.selectedCalc = new BehaviorSubject<string>('none');
  }
  
  cancelOpportunitySheet() {
    this.opportunitySheetService.opportunitySheet = undefined;
  }

  displaySelectedCalculator(calculatorType: string) {
    this.calcOpportunitySheet = undefined;
    this.isNewOpportunity = true;

    if (calculatorType === Treasure.airLeak) {
      this.airLeakTreasureHuntService.initNewCalculator();
    } else if (calculatorType === Treasure.tankInsulation) {
      this.tankInsulationTreasureHuntService.initNewCalculator();
    } else if (calculatorType === Treasure.opportunitySheet) {
      this.opportunitySheetService.opportunitySheet = undefined;
    } else if (calculatorType === Treasure.lightingReplacement) {
      this.lightingTreasureHuntService.initNewCalculator();
    } else if (calculatorType === Treasure.replaceExisting) {
      this.replaceExistingTreasureService.initNewCalculator();
    } else if (calculatorType === Treasure.motorDrive) {
      this.motorDriveTreasureHuntService.initNewCalculator();
    } else if (calculatorType === Treasure.naturalGasReduction) {
      this.naturalGasTreasureHuntService.initNewCalculator();
    } else if (calculatorType === Treasure.electricityReduction) {
      this.electricityReductionTreasureHuntService.initNewCalculator();
    } else if (calculatorType === Treasure.compressedAir) {
      this.compressedAirTreasureHuntService.initNewCalculator();
    } else if (calculatorType === Treasure.compressedAirPressure) {
      this.compressedAirPressureTreasureHuntService.initNewCalculator();
    } else if (calculatorType === Treasure.waterReduction) {
      this.waterReductionTreasureHuntService.initNewCalculator();
    } else if (calculatorType === Treasure.steamReduction) {
      this.steamReductionTreasureHuntService.initNewCalculator();
    } else if (calculatorType === Treasure.pipeInsulation) {
      this.pipeInsulationTreasureHuntService.initNewCalculator();
    } else if (calculatorType === Treasure.wallLoss) {
      this.wallLossTreasureHuntService.initNewCalculator();
    }  
    this.selectedCalc.next(calculatorType);
  }

  copyOpportunity(opportunityCardData: OpportunityCardData, treasureHunt: TreasureHunt, settings: Settings): OpportunityCardData {
    if (opportunityCardData.opportunityType === Treasure.airLeak) {
      opportunityCardData.airLeakSurvey.opportunitySheet = this.updateCopyName(opportunityCardData.airLeakSurvey.opportunitySheet);
      this.airLeakTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.airLeakSurvey, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getAirLeakSurveyCardData(opportunityCardData.airLeakSurvey, settings, treasureHunt.airLeakSurveys.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.tankInsulation) {
      opportunityCardData.tankInsulationReduction.opportunitySheet = this.updateCopyName(opportunityCardData.tankInsulationReduction.opportunitySheet);
      this.tankInsulationTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.tankInsulationReduction, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getTankInsulationReductionCardData(opportunityCardData.tankInsulationReduction, settings, treasureHunt.tankInsulationReductions.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType == Treasure.opportunitySheet) {
      opportunityCardData.opportunitySheet = this.updateCopyName(opportunityCardData.opportunitySheet);
      this.standaloneOpportunitySheetService.saveTreasureHuntOpportunity(opportunityCardData.opportunitySheet, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getOpportunitySheetCardData(opportunityCardData.opportunitySheet, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.lightingReplacement) {
      opportunityCardData.lightingReplacement.opportunitySheet = this.updateCopyName(opportunityCardData.lightingReplacement.opportunitySheet);
      this.lightingTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.lightingReplacement, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getLightingReplacementCardData(opportunityCardData.lightingReplacement, treasureHunt.lightingReplacements.length - 1, treasureHunt.currentEnergyUsage, settings);
    
    } else if (opportunityCardData.opportunityType === Treasure.replaceExisting) {
      opportunityCardData.replaceExistingMotor.opportunitySheet = this.updateCopyName(opportunityCardData.replaceExistingMotor.opportunitySheet);
      this.replaceExistingTreasureService.saveTreasureHuntOpportunity(opportunityCardData.replaceExistingMotor, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getReplaceExistingCardData(opportunityCardData.replaceExistingMotor, treasureHunt.replaceExistingMotors.length - 1, treasureHunt.currentEnergyUsage, settings);
    
    } else if (opportunityCardData.opportunityType === Treasure.motorDrive) {
      opportunityCardData.motorDrive.opportunitySheet = this.updateCopyName(opportunityCardData.motorDrive.opportunitySheet);
      this.motorDriveTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.motorDrive, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getMotorDriveCard(opportunityCardData.motorDrive, treasureHunt.motorDrives.length - 1, treasureHunt.currentEnergyUsage, settings);
    
    } else if (opportunityCardData.opportunityType === Treasure.naturalGasReduction) {
      opportunityCardData.naturalGasReduction.opportunitySheet = this.updateCopyName(opportunityCardData.naturalGasReduction.opportunitySheet);
      this.naturalGasTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.naturalGasReduction, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getNaturalGasReductionCard(opportunityCardData.naturalGasReduction, treasureHunt.naturalGasReductions.length - 1, treasureHunt.currentEnergyUsage, settings);
    
    } else if (opportunityCardData.opportunityType === Treasure.electricityReduction) {
      opportunityCardData.electricityReduction.opportunitySheet = this.updateCopyName(opportunityCardData.electricityReduction.opportunitySheet);
      this.electricityReductionTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.electricityReduction, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getElectricityReductionCard(opportunityCardData.electricityReduction, settings, treasureHunt.electricityReductions.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.compressedAir) {
      opportunityCardData.compressedAirReduction.opportunitySheet = this.updateCopyName(opportunityCardData.compressedAirReduction.opportunitySheet);
      this.compressedAirTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.compressedAirReduction, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getCompressedAirReductionCardData(opportunityCardData.compressedAirReduction, settings, treasureHunt.currentEnergyUsage, treasureHunt.compressedAirReductions.length - 1, );
    
    } else if (opportunityCardData.opportunityType === Treasure.compressedAirPressure) {
      opportunityCardData.compressedAirPressureReduction.opportunitySheet = this.updateCopyName(opportunityCardData.compressedAirPressureReduction.opportunitySheet);
      this.compressedAirPressureTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.compressedAirPressureReduction, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getCompressedAirPressureReductionCardData(opportunityCardData.compressedAirPressureReduction, settings, treasureHunt.compressedAirPressureReductions.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.waterReduction) {
      opportunityCardData.waterReduction.opportunitySheet = this.updateCopyName(opportunityCardData.waterReduction.opportunitySheet);
      this.waterReductionTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.waterReduction, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getWaterReductionCardData(opportunityCardData.waterReduction, settings, treasureHunt.waterReductions.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.steamReduction) {
      opportunityCardData.steamReduction.opportunitySheet = this.updateCopyName(opportunityCardData.steamReduction.opportunitySheet);
      this.steamReductionTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.steamReduction, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getSteamReductionCardData(opportunityCardData.steamReduction, settings, treasureHunt.steamReductions.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.pipeInsulation) {
      opportunityCardData.pipeInsulationReduction.opportunitySheet = this.updateCopyName(opportunityCardData.pipeInsulationReduction.opportunitySheet);
      this.pipeInsulationTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.pipeInsulationReduction, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getPipeInsulationReductionCardData(opportunityCardData.pipeInsulationReduction, settings, treasureHunt.pipeInsulationReductions.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.wallLoss) {
      opportunityCardData.wallLoss.opportunitySheet = this.updateCopyName(opportunityCardData.wallLoss.opportunitySheet);
      this.wallLossTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.wallLoss, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getWallLossCardData(opportunityCardData.wallLoss, settings, treasureHunt.wallLosses.length - 1, treasureHunt.currentEnergyUsage);
    
    }

    return opportunityCardData;
  }

  editOpportunityFromCard(opportunityCardData: OpportunityCardData) {
    this.calcOpportunitySheet = opportunityCardData.opportunitySheet;
    this.isNewOpportunity = false;
    this.itemIndex = opportunityCardData.opportunityIndex;

    if (opportunityCardData.opportunityType === Treasure.airLeak) {
      this.airLeakTreasureHuntService.setCalculatorInputFromOpportunity(opportunityCardData.airLeakSurvey);
    } else if (opportunityCardData.opportunityType === Treasure.tankInsulation) {
      this.tankInsulationTreasureHuntService.setCalculatorInputFromOpportunity(opportunityCardData.tankInsulationReduction);
    } else if (opportunityCardData.opportunityType === Treasure.opportunitySheet) {
      this.opportunitySheetService.opportunitySheet = opportunityCardData.opportunitySheet;
    } else if (opportunityCardData.opportunityType === Treasure.lightingReplacement) {
      this.lightingTreasureHuntService.setCalculatorInputFromOpportunity(opportunityCardData.lightingReplacement);
    } else if (opportunityCardData.opportunityType === Treasure.replaceExisting) {
      this.replaceExistingTreasureService.setCalculatorInputFromOpportunity(opportunityCardData.replaceExistingMotor);
    } else if (opportunityCardData.opportunityType === Treasure.motorDrive) {
      this.motorDriveTreasureHuntService.setCalculatorInputFromOpportunity(opportunityCardData.motorDrive);
    } else if (opportunityCardData.opportunityType === Treasure.naturalGasReduction) {
      this.naturalGasTreasureHuntService.setCalculatorInputFromOpportunity(opportunityCardData.naturalGasReduction);
    } else if (opportunityCardData.opportunityType === Treasure.electricityReduction) {
      this.electricityReductionTreasureHuntService.setCalculatorInputFromOpportunity(opportunityCardData.electricityReduction);
    } else if (opportunityCardData.opportunityType === Treasure.compressedAir) {
      this.compressedAirTreasureHuntService.setCalculatorInputFromOpportunity(opportunityCardData.compressedAirReduction);
    } else if (opportunityCardData.opportunityType === Treasure.compressedAirPressure) {
      this.compressedAirPressureTreasureHuntService.setCalculatorInputFromOpportunity(opportunityCardData.compressedAirPressureReduction);
    } else if (opportunityCardData.opportunityType === Treasure.waterReduction) {
      this.waterReductionTreasureHuntService.setCalculatorInputFromOpportunity(opportunityCardData.waterReduction);
    } else if (opportunityCardData.opportunityType === Treasure.steamReduction) {
      this.steamReductionTreasureHuntService.setCalculatorInputFromOpportunity(opportunityCardData.steamReduction);
    } else if (opportunityCardData.opportunityType === Treasure.pipeInsulation) {
      this.pipeInsulationTreasureHuntService.setCalculatorInputFromOpportunity(opportunityCardData.pipeInsulationReduction);
    } else if (opportunityCardData.opportunityType === Treasure.wallLoss) {
      this.wallLossTreasureHuntService.setCalculatorInputFromOpportunity(opportunityCardData.wallLoss);
    } 

    this.selectedCalc.next(opportunityCardData.opportunityType);
  }

  saveOpportunityChanges(opportunityCardData: OpportunityCardData, treasureHunt: TreasureHunt, settings, updateSelectedState?: boolean): TreasureHunt {
    let updatedCard: OpportunityCardData;
    if (opportunityCardData.opportunityType === Treasure.airLeak) {
      opportunityCardData.airLeakSurvey.selected = opportunityCardData.selected;
      treasureHunt.airLeakSurveys[opportunityCardData.opportunityIndex] = opportunityCardData.airLeakSurvey;
      updatedCard = this.opportunityCardsService.getAirLeakSurveyCardData(opportunityCardData.airLeakSurvey, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);

    } else if (opportunityCardData.opportunityType === Treasure.tankInsulation) {
      opportunityCardData.tankInsulationReduction.selected = opportunityCardData.selected;
      treasureHunt.tankInsulationReductions[opportunityCardData.opportunityIndex] = opportunityCardData.tankInsulationReduction;
      updatedCard = this.opportunityCardsService.getTankInsulationReductionCardData(opportunityCardData.tankInsulationReduction, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);

    } else if (opportunityCardData.opportunityType === Treasure.opportunitySheet) {
      opportunityCardData.opportunitySheet.selected = opportunityCardData.selected;
      treasureHunt.opportunitySheets[opportunityCardData.opportunityIndex] = opportunityCardData.opportunitySheet;
      updatedCard = this.opportunityCardsService.getOpportunitySheetCardData(opportunityCardData.opportunitySheet, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);

    } else if (opportunityCardData.opportunityType === Treasure.lightingReplacement) {
      opportunityCardData.lightingReplacement.selected = opportunityCardData.selected;
      treasureHunt.lightingReplacements[opportunityCardData.opportunityIndex] = opportunityCardData.lightingReplacement;
      updatedCard = this.opportunityCardsService.getLightingReplacementCardData(opportunityCardData.lightingReplacement, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage, settings);

    } else if (opportunityCardData.opportunityType === Treasure.replaceExisting) {
      opportunityCardData.replaceExistingMotor.selected = opportunityCardData.selected;
      treasureHunt.replaceExistingMotors[opportunityCardData.opportunityIndex] = opportunityCardData.replaceExistingMotor;
      updatedCard = this.opportunityCardsService.getReplaceExistingCardData(opportunityCardData.replaceExistingMotor, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage, settings);

    } else if (opportunityCardData.opportunityType === Treasure.motorDrive) {
      opportunityCardData.motorDrive.selected = opportunityCardData.selected;
      treasureHunt.motorDrives[opportunityCardData.opportunityIndex] = opportunityCardData.motorDrive;
      updatedCard = this.opportunityCardsService.getMotorDriveCard(opportunityCardData.motorDrive, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage, settings);

    } else if (opportunityCardData.opportunityType === Treasure.naturalGasReduction) {
      opportunityCardData.naturalGasReduction.selected = opportunityCardData.selected;
      treasureHunt.naturalGasReductions[opportunityCardData.opportunityIndex] = opportunityCardData.naturalGasReduction;
      updatedCard = this.opportunityCardsService.getNaturalGasReductionCard(opportunityCardData.naturalGasReduction, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage, settings);

    } else if (opportunityCardData.opportunityType === Treasure.electricityReduction) {
      opportunityCardData.electricityReduction.selected = opportunityCardData.selected;
      treasureHunt.electricityReductions[opportunityCardData.opportunityIndex] = opportunityCardData.electricityReduction;
      updatedCard = this.opportunityCardsService.getElectricityReductionCard(opportunityCardData.electricityReduction, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);

    } else if (opportunityCardData.opportunityType === Treasure.compressedAir) {
      opportunityCardData.compressedAirReduction.selected = opportunityCardData.selected;
      treasureHunt.compressedAirReductions[opportunityCardData.opportunityIndex] = opportunityCardData.compressedAirReduction;
      updatedCard = this.opportunityCardsService.getCompressedAirReductionCardData(opportunityCardData.compressedAirReduction, settings, treasureHunt.currentEnergyUsage, opportunityCardData.opportunityIndex);

    } else if (opportunityCardData.opportunityType === Treasure.compressedAirPressure) {
      opportunityCardData.compressedAirPressureReduction.selected = opportunityCardData.selected;
      treasureHunt.compressedAirPressureReductions[opportunityCardData.opportunityIndex] = opportunityCardData.compressedAirPressureReduction;
      updatedCard = this.opportunityCardsService.getCompressedAirPressureReductionCardData(opportunityCardData.compressedAirPressureReduction, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);

    } else if (opportunityCardData.opportunityType === Treasure.waterReduction) {
      opportunityCardData.waterReduction.selected = opportunityCardData.selected;
      treasureHunt.waterReductions[opportunityCardData.opportunityIndex] = opportunityCardData.waterReduction;
      updatedCard = this.opportunityCardsService.getWaterReductionCardData(opportunityCardData.waterReduction, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);

    } else if (opportunityCardData.opportunityType === Treasure.steamReduction) {
      opportunityCardData.steamReduction.selected = opportunityCardData.selected;
      treasureHunt.steamReductions[opportunityCardData.opportunityIndex] = opportunityCardData.steamReduction;
      updatedCard = this.opportunityCardsService.getSteamReductionCardData(opportunityCardData.steamReduction, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);

    } else if (opportunityCardData.opportunityType === Treasure.pipeInsulation) {
      opportunityCardData.pipeInsulationReduction.selected = opportunityCardData.selected;
      treasureHunt.pipeInsulationReductions[opportunityCardData.opportunityIndex] = opportunityCardData.pipeInsulationReduction;
      updatedCard = this.opportunityCardsService.getPipeInsulationReductionCardData(opportunityCardData.pipeInsulationReduction, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);
      
    } else if (opportunityCardData.opportunityType === Treasure.wallLoss) {
      opportunityCardData.wallLoss.selected = opportunityCardData.selected;
      treasureHunt.wallLosses[opportunityCardData.opportunityIndex] = opportunityCardData.wallLoss;
      updatedCard = this.opportunityCardsService.getWallLossCardData(opportunityCardData.wallLoss, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);
      
    }
    
    
    this.opportunityCardsService.updatedOpportunityCard.next(updatedCard);
    return treasureHunt;
  }

  deleteOpportunity(deleteOpportunity: OpportunityCardData, treasureHunt: TreasureHunt): TreasureHunt {
    if (deleteOpportunity.opportunityType === Treasure.airLeak) {
      treasureHunt = this.airLeakTreasureHuntService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt);
    } else if (deleteOpportunity.opportunityType === Treasure.tankInsulation) {
      this.tankInsulationTreasureHuntService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
    } else if (deleteOpportunity.opportunityType === Treasure.opportunitySheet) {
      this.standaloneOpportunitySheetService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
    } else if (deleteOpportunity.opportunityType === Treasure.lightingReplacement) {
      this.lightingTreasureHuntService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
    } else if (deleteOpportunity.opportunityType === Treasure.replaceExisting) {
      this.replaceExistingTreasureService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
    } else if (deleteOpportunity.opportunityType === Treasure.motorDrive) {
      this.motorDriveTreasureHuntService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
    } else if (deleteOpportunity.opportunityType === Treasure.naturalGasReduction) {
      this.naturalGasTreasureHuntService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
    } else if (deleteOpportunity.opportunityType === Treasure.electricityReduction) {
      this.electricityReductionTreasureHuntService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
    } else if (deleteOpportunity.opportunityType === Treasure.compressedAir) {
      this.compressedAirTreasureHuntService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
    } else if (deleteOpportunity.opportunityType === Treasure.compressedAirPressure) {
      this.compressedAirPressureTreasureHuntService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
    } else if (deleteOpportunity.opportunityType === Treasure.waterReduction) {
      this.waterReductionTreasureHuntService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
    } else if (deleteOpportunity.opportunityType === Treasure.steamReduction) {
      this.steamReductionTreasureHuntService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
    } else if (deleteOpportunity.opportunityType === Treasure.pipeInsulation) {
      this.pipeInsulationTreasureHuntService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
    } else if (deleteOpportunity.opportunityType === Treasure.wallLoss) {
      this.wallLossTreasureHuntService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
    } 

    return treasureHunt;
  }

  updateCopyName(oppSheet: OpportunitySheet): OpportunitySheet {
    if (oppSheet) {
      oppSheet.name = oppSheet.name + ' (copy)';
      return oppSheet;
    } else { return }
  }

}
