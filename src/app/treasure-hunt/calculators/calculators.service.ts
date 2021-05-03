import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Treasure, OpportunitySheet, TreasureHunt, OpportunitySummary } from '../../shared/models/treasure-hunt';
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
import { FlueGasTreasureHuntService } from '../treasure-hunt-calculator-services/flue-gas-treasure-hunt.service';
import { WallTreasureHuntService } from '../treasure-hunt-calculator-services/wall-treasure-hunt.service';
import { OpportunitySummaryService } from '../treasure-hunt-report/opportunity-summary.service';

@Injectable()
export class CalculatorsService {

  selectedCalc: BehaviorSubject<string>;
  itemIndex: number;
  isNewOpportunity: boolean;
  calcOpportunitySheet: OpportunitySheet;
  constructor(
    private opportunityCardsService: OpportunityCardsService,
    private opportunitySummaryService: OpportunitySummaryService,
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
    private wallLossTreasureHuntService: WallTreasureHuntService,
    private flueGasTreasureHuntService: FlueGasTreasureHuntService
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
    } else if (calculatorType === Treasure.flueGas) {
      this.flueGasTreasureHuntService.initNewCalculator();
    } 
    this.selectedCalc.next(calculatorType);
  }

  copyOpportunity(opportunityCardData: OpportunityCardData, treasureHunt: TreasureHunt, settings: Settings): OpportunityCardData {
    if (opportunityCardData.opportunityType === Treasure.airLeak) {
      opportunityCardData.airLeakSurvey.opportunitySheet = this.updateCopyName(opportunityCardData.airLeakSurvey.opportunitySheet);
      this.airLeakTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.airLeakSurvey, treasureHunt);
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.airLeakSurvey, settings);
      opportunityCardData = this.airLeakTreasureHuntService.getAirLeakSurveyCardData(opportunityCardData.airLeakSurvey, opportunitySummary, settings, treasureHunt.airLeakSurveys.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.tankInsulation) {
      opportunityCardData.tankInsulationReduction.opportunitySheet = this.updateCopyName(opportunityCardData.tankInsulationReduction.opportunitySheet);
      this.tankInsulationTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.tankInsulationReduction, treasureHunt);
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.tankInsulationReduction, settings);
      opportunityCardData = this.tankInsulationTreasureHuntService.getTankInsulationReductionCardData(opportunityCardData.tankInsulationReduction, opportunitySummary, settings, treasureHunt.tankInsulationReductions.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType == Treasure.opportunitySheet) {
      opportunityCardData.opportunitySheet = this.updateCopyName(opportunityCardData.opportunitySheet);
      this.standaloneOpportunitySheetService.saveTreasureHuntOpportunity(opportunityCardData.opportunitySheet, treasureHunt);
      opportunityCardData = this.opportunityCardsService.getOpportunitySheetCardData(opportunityCardData.opportunitySheet, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.lightingReplacement) {
      opportunityCardData.lightingReplacement.opportunitySheet = this.updateCopyName(opportunityCardData.lightingReplacement.opportunitySheet);
      this.lightingTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.lightingReplacement, treasureHunt);
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.lightingReplacement, settings);
      opportunityCardData = this.lightingTreasureHuntService.getLightingReplacementCardData(opportunityCardData.lightingReplacement, opportunitySummary, treasureHunt.lightingReplacements.length - 1, treasureHunt.currentEnergyUsage, settings);
    
    } else if (opportunityCardData.opportunityType === Treasure.replaceExisting) {
      opportunityCardData.replaceExistingMotor.opportunitySheet = this.updateCopyName(opportunityCardData.replaceExistingMotor.opportunitySheet);
      this.replaceExistingTreasureService.saveTreasureHuntOpportunity(opportunityCardData.replaceExistingMotor, treasureHunt);
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.replaceExistingMotor, settings);
      opportunityCardData = this.replaceExistingTreasureService.getReplaceExistingCardData(opportunityCardData.replaceExistingMotor, opportunitySummary, treasureHunt.replaceExistingMotors.length - 1, treasureHunt.currentEnergyUsage, settings);
    
    } else if (opportunityCardData.opportunityType === Treasure.motorDrive) {
      opportunityCardData.motorDrive.opportunitySheet = this.updateCopyName(opportunityCardData.motorDrive.opportunitySheet);
      this.motorDriveTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.motorDrive, treasureHunt);
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.motorDrive, settings);
      opportunityCardData = this.motorDriveTreasureHuntService.getMotorDriveCard(opportunityCardData.motorDrive, opportunitySummary, treasureHunt.motorDrives.length - 1, treasureHunt.currentEnergyUsage, settings);
    
    } else if (opportunityCardData.opportunityType === Treasure.naturalGasReduction) {
      opportunityCardData.naturalGasReduction.opportunitySheet = this.updateCopyName(opportunityCardData.naturalGasReduction.opportunitySheet);
      this.naturalGasTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.naturalGasReduction, treasureHunt);
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.naturalGasReduction, settings);
      opportunityCardData = this.naturalGasTreasureHuntService.getNaturalGasReductionCard(opportunityCardData.naturalGasReduction, opportunitySummary, treasureHunt.naturalGasReductions.length - 1, treasureHunt.currentEnergyUsage, settings);
    
    } else if (opportunityCardData.opportunityType === Treasure.electricityReduction) {
      opportunityCardData.electricityReduction.opportunitySheet = this.updateCopyName(opportunityCardData.electricityReduction.opportunitySheet);
      this.electricityReductionTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.electricityReduction, treasureHunt);
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.electricityReduction, settings);
      opportunityCardData = this.electricityReductionTreasureHuntService.getElectricityReductionCard(opportunityCardData.electricityReduction, opportunitySummary, settings, treasureHunt.electricityReductions.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.compressedAir) {
      opportunityCardData.compressedAirReduction.opportunitySheet = this.updateCopyName(opportunityCardData.compressedAirReduction.opportunitySheet);
      this.compressedAirTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.compressedAirReduction, treasureHunt);
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.compressedAirReduction, settings);
      opportunityCardData = this.compressedAirTreasureHuntService.getCompressedAirReductionCardData(opportunityCardData.compressedAirReduction, opportunitySummary, settings, treasureHunt.currentEnergyUsage, treasureHunt.compressedAirReductions.length - 1, );
    
    } else if (opportunityCardData.opportunityType === Treasure.compressedAirPressure) {
      opportunityCardData.compressedAirPressureReduction.opportunitySheet = this.updateCopyName(opportunityCardData.compressedAirPressureReduction.opportunitySheet);
      this.compressedAirPressureTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.compressedAirPressureReduction, treasureHunt);
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.compressedAirPressureReduction, settings);
      opportunityCardData = this.compressedAirPressureTreasureHuntService.getCompressedAirPressureReductionCardData(opportunityCardData.compressedAirPressureReduction, opportunitySummary, settings, treasureHunt.compressedAirPressureReductions.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.waterReduction) {
      opportunityCardData.waterReduction.opportunitySheet = this.updateCopyName(opportunityCardData.waterReduction.opportunitySheet);
      this.waterReductionTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.waterReduction, treasureHunt);
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.waterReduction, settings);
      opportunityCardData = this.waterReductionTreasureHuntService.getWaterReductionCardData(opportunityCardData.waterReduction, opportunitySummary, settings, treasureHunt.waterReductions.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.steamReduction) {
      opportunityCardData.steamReduction.opportunitySheet = this.updateCopyName(opportunityCardData.steamReduction.opportunitySheet);
      this.steamReductionTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.steamReduction, treasureHunt);
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.steamReduction, settings);
      opportunityCardData = this.steamReductionTreasureHuntService.getSteamReductionCardData(opportunityCardData.steamReduction, opportunitySummary, settings, treasureHunt.steamReductions.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.pipeInsulation) {
      opportunityCardData.pipeInsulationReduction.opportunitySheet = this.updateCopyName(opportunityCardData.pipeInsulationReduction.opportunitySheet);
      this.pipeInsulationTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.pipeInsulationReduction, treasureHunt);
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.pipeInsulationReduction, settings);
      opportunityCardData = this.pipeInsulationTreasureHuntService.getPipeInsulationReductionCardData(opportunityCardData.pipeInsulationReduction, opportunitySummary, settings, treasureHunt.pipeInsulationReductions.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.wallLoss) {
      opportunityCardData.wallLoss.opportunitySheet = this.updateCopyName(opportunityCardData.wallLoss.opportunitySheet);
      this.wallLossTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.wallLoss, treasureHunt);
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.wallLoss, settings);
      opportunityCardData = this.wallLossTreasureHuntService.getWallLossCardData(opportunityCardData.wallLoss, opportunitySummary, settings, treasureHunt.wallLosses.length - 1, treasureHunt.currentEnergyUsage);
    
    } else if (opportunityCardData.opportunityType === Treasure.flueGas) {
      opportunityCardData.flueGas.opportunitySheet = this.updateCopyName(opportunityCardData.flueGas.opportunitySheet);
      this.flueGasTreasureHuntService.saveTreasureHuntOpportunity(opportunityCardData.flueGas, treasureHunt);
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.flueGas, settings);
      opportunityCardData = this.flueGasTreasureHuntService.getFlueGasCardData(opportunityCardData.flueGas, opportunitySummary, settings, treasureHunt.flueGasLosses.length - 1, treasureHunt.currentEnergyUsage);
    
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
    } else if (opportunityCardData.opportunityType === Treasure.flueGas) {
      this.flueGasTreasureHuntService.setCalculatorInputFromOpportunity(opportunityCardData.flueGas);
    }  

    this.selectedCalc.next(opportunityCardData.opportunityType);
  }

  saveOpportunityChanges(opportunityCardData: OpportunityCardData, treasureHunt: TreasureHunt, settings, updateSelectedState?: boolean): TreasureHunt {
    let updatedCard: OpportunityCardData;
    if (opportunityCardData.opportunityType === Treasure.airLeak) {
      opportunityCardData.airLeakSurvey.selected = opportunityCardData.selected;
      treasureHunt.airLeakSurveys[opportunityCardData.opportunityIndex] = opportunityCardData.airLeakSurvey;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.airLeakSurvey, settings);
      updatedCard = this.airLeakTreasureHuntService.getAirLeakSurveyCardData(opportunityCardData.airLeakSurvey, opportunitySummary, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);

    } else if (opportunityCardData.opportunityType === Treasure.tankInsulation) {
      opportunityCardData.tankInsulationReduction.selected = opportunityCardData.selected;
      treasureHunt.tankInsulationReductions[opportunityCardData.opportunityIndex] = opportunityCardData.tankInsulationReduction;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.tankInsulationReduction, settings);
      updatedCard = this.tankInsulationTreasureHuntService.getTankInsulationReductionCardData(opportunityCardData.tankInsulationReduction, opportunitySummary, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);

    } else if (opportunityCardData.opportunityType === Treasure.opportunitySheet) {
      opportunityCardData.opportunitySheet.selected = opportunityCardData.selected;
      treasureHunt.opportunitySheets[opportunityCardData.opportunityIndex] = opportunityCardData.opportunitySheet;
      updatedCard = this.opportunityCardsService.getOpportunitySheetCardData(opportunityCardData.opportunitySheet, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);

    } else if (opportunityCardData.opportunityType === Treasure.lightingReplacement) {
      opportunityCardData.lightingReplacement.selected = opportunityCardData.selected;
      treasureHunt.lightingReplacements[opportunityCardData.opportunityIndex] = opportunityCardData.lightingReplacement;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.lightingReplacement, settings);
      updatedCard = this.lightingTreasureHuntService.getLightingReplacementCardData(opportunityCardData.lightingReplacement, opportunitySummary, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage, settings);

    } else if (opportunityCardData.opportunityType === Treasure.replaceExisting) {
      opportunityCardData.replaceExistingMotor.selected = opportunityCardData.selected;
      treasureHunt.replaceExistingMotors[opportunityCardData.opportunityIndex] = opportunityCardData.replaceExistingMotor;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.replaceExistingMotor, settings);
      updatedCard = this.replaceExistingTreasureService.getReplaceExistingCardData(opportunityCardData.replaceExistingMotor, opportunitySummary, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage, settings);

    } else if (opportunityCardData.opportunityType === Treasure.motorDrive) {
      opportunityCardData.motorDrive.selected = opportunityCardData.selected;
      treasureHunt.motorDrives[opportunityCardData.opportunityIndex] = opportunityCardData.motorDrive;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.motorDrive, settings);
      updatedCard = this.motorDriveTreasureHuntService.getMotorDriveCard(opportunityCardData.motorDrive, opportunitySummary, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage, settings);

    } else if (opportunityCardData.opportunityType === Treasure.naturalGasReduction) {
      opportunityCardData.naturalGasReduction.selected = opportunityCardData.selected;
      treasureHunt.naturalGasReductions[opportunityCardData.opportunityIndex] = opportunityCardData.naturalGasReduction;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.naturalGasReduction, settings);
      updatedCard = this.naturalGasTreasureHuntService.getNaturalGasReductionCard(opportunityCardData.naturalGasReduction, opportunitySummary, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage, settings);

    } else if (opportunityCardData.opportunityType === Treasure.electricityReduction) {
      opportunityCardData.electricityReduction.selected = opportunityCardData.selected;
      treasureHunt.electricityReductions[opportunityCardData.opportunityIndex] = opportunityCardData.electricityReduction;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.electricityReduction, settings);
      updatedCard = this.electricityReductionTreasureHuntService.getElectricityReductionCard(opportunityCardData.electricityReduction, opportunitySummary, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);

    } else if (opportunityCardData.opportunityType === Treasure.compressedAir) {
      opportunityCardData.compressedAirReduction.selected = opportunityCardData.selected;
      treasureHunt.compressedAirReductions[opportunityCardData.opportunityIndex] = opportunityCardData.compressedAirReduction;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.compressedAirReduction, settings);
      updatedCard = this.compressedAirTreasureHuntService.getCompressedAirReductionCardData(opportunityCardData.compressedAirReduction, opportunitySummary, settings, treasureHunt.currentEnergyUsage, opportunityCardData.opportunityIndex);

    } else if (opportunityCardData.opportunityType === Treasure.compressedAirPressure) {
      opportunityCardData.compressedAirPressureReduction.selected = opportunityCardData.selected;
      treasureHunt.compressedAirPressureReductions[opportunityCardData.opportunityIndex] = opportunityCardData.compressedAirPressureReduction;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.compressedAirPressureReduction, settings);
      updatedCard = this.compressedAirPressureTreasureHuntService.getCompressedAirPressureReductionCardData(opportunityCardData.compressedAirPressureReduction, opportunitySummary, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);

    } else if (opportunityCardData.opportunityType === Treasure.waterReduction) {
      opportunityCardData.waterReduction.selected = opportunityCardData.selected;
      treasureHunt.waterReductions[opportunityCardData.opportunityIndex] = opportunityCardData.waterReduction;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.waterReduction, settings);
      updatedCard = this.waterReductionTreasureHuntService.getWaterReductionCardData(opportunityCardData.waterReduction, opportunitySummary, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);

    } else if (opportunityCardData.opportunityType === Treasure.steamReduction) {
      opportunityCardData.steamReduction.selected = opportunityCardData.selected;
      treasureHunt.steamReductions[opportunityCardData.opportunityIndex] = opportunityCardData.steamReduction;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.steamReduction, settings);
      updatedCard = this.steamReductionTreasureHuntService.getSteamReductionCardData(opportunityCardData.steamReduction, opportunitySummary, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);

    } else if (opportunityCardData.opportunityType === Treasure.pipeInsulation) {
      opportunityCardData.pipeInsulationReduction.selected = opportunityCardData.selected;
      treasureHunt.pipeInsulationReductions[opportunityCardData.opportunityIndex] = opportunityCardData.pipeInsulationReduction;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.pipeInsulationReduction, settings);
      updatedCard = this.pipeInsulationTreasureHuntService.getPipeInsulationReductionCardData(opportunityCardData.pipeInsulationReduction, opportunitySummary, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);
      
    } else if (opportunityCardData.opportunityType === Treasure.wallLoss) {
      opportunityCardData.wallLoss.selected = opportunityCardData.selected;
      treasureHunt.wallLosses[opportunityCardData.opportunityIndex] = opportunityCardData.wallLoss;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.wallLoss, settings);
      updatedCard = this.wallLossTreasureHuntService.getWallLossCardData(opportunityCardData.wallLoss, opportunitySummary, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);
   
    } else if (opportunityCardData.opportunityType === Treasure.flueGas) {
      opportunityCardData.flueGas.selected = opportunityCardData.selected;
      treasureHunt.flueGasLosses[opportunityCardData.opportunityIndex] = opportunityCardData.flueGas;
      let opportunitySummary: OpportunitySummary = this.opportunitySummaryService.getIndividualOpportunitySummary(opportunityCardData.flueGas, settings);
      updatedCard = this.flueGasTreasureHuntService.getFlueGasCardData(opportunityCardData.flueGas, opportunitySummary, settings, opportunityCardData.opportunityIndex, treasureHunt.currentEnergyUsage);
      
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
    } else if (deleteOpportunity.opportunityType === Treasure.flueGas) {
      this.flueGasTreasureHuntService.deleteOpportunity(deleteOpportunity.opportunityIndex, treasureHunt)
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
