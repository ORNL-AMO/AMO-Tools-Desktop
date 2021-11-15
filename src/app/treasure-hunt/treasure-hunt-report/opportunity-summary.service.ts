import { Injectable } from '@angular/core';
import { OpportunitySheetService } from '../calculators/standalone-opportunity-sheet/opportunity-sheet.service';
import { OpportunityCost, OpportunitySummary, TreasureHunt, ElectricityReductionTreasureHunt, MotorDriveInputsTreasureHunt, ReplaceExistingMotorTreasureHunt, LightingReplacementTreasureHunt, NaturalGasReductionTreasureHunt, OpportunitySheetResults, OpportunitySheet, CompressedAirReductionTreasureHunt, WaterReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt, SteamReductionTreasureHunt, PipeInsulationReductionTreasureHunt, TankInsulationReductionTreasureHunt, AirLeakSurveyTreasureHunt, TreasureHuntOpportunity, TreasureHuntResults, OpportunitySheetResult, TreasureHuntOpportunityResults, Treasure, FlueGasTreasureHunt, WallLossTreasureHunt, LeakageLossTreasureHunt, WasteHeatTreasureHunt, OpeningLossTreasureHunt, HeatCascadingTreasureHunt, WaterHeatingTreasureHunt, AirHeatingTreasureHunt } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { processEquipmentOptions } from '../calculators/opportunity-sheet/general-details-form/processEquipmentOptions';
import { AirLeakTreasureHuntService } from '../treasure-hunt-calculator-services/air-leak-treasure-hunt.service';
import { TankInsulationTreasureHuntService } from '../treasure-hunt-calculator-services/tank-insulation-treasure-hunt.service';
import { LightingReplacementTreasureHuntService } from '../treasure-hunt-calculator-services/lighting-replacement-treasure-hunt.service';
import { ReplaceExistingTreasureHuntService } from '../treasure-hunt-calculator-services/replace-existing-treasure-hunt.service';
import { CaPressureReductionTreasureHuntService } from '../treasure-hunt-calculator-services/ca-pressure-reduction-treasure-hunt.service';
import { CaReductionTreasureHuntService } from '../treasure-hunt-calculator-services/ca-reduction-treasure-hunt.service';
import { ElectricityReductionTreasureHuntService } from '../treasure-hunt-calculator-services/electricity-reduction-treasure-hunt.service';
import { MotorDriveTreasureHuntService } from '../treasure-hunt-calculator-services/motor-drive-treasure-hunt.service';
import { NaturalGasReductionTreasureHuntService } from '../treasure-hunt-calculator-services/natural-gas-reduction-treasure-hunt.service';
import { PipeInsulationTreasureHuntService } from '../treasure-hunt-calculator-services/pipe-insulation-treasure-hunt.service';
import { SteamReductionTreasureHuntService } from '../treasure-hunt-calculator-services/steam-reduction-treasure-hunt.service';
import { WaterReductionTreasureHuntService } from '../treasure-hunt-calculator-services/water-reduction-treasure-hunt.service';
import { FlueGasTreasureHuntService } from '../treasure-hunt-calculator-services/flue-gas-treasure-hunt.service';
import { WallTreasureHuntService } from '../treasure-hunt-calculator-services/wall-treasure-hunt.service';
import { LeakageTreasureHuntService } from '../treasure-hunt-calculator-services/leakage-treasure-hunt.service';
import { WasteHeatTreasureHuntService } from '../treasure-hunt-calculator-services/waste-heat-treasure-hunt.service';
import { OpeningTreasureHuntService } from '../treasure-hunt-calculator-services/opening-treasure-hunt.service';
import { AirHeatingTreasureHuntService } from '../treasure-hunt-calculator-services/air-heating-treasure-hunt.service';
import { HeatCascadingTreasureHuntService } from '../treasure-hunt-calculator-services/heat-cascading-treasure-hunt.service';
import { WaterHeatingTreasureHuntService } from '../treasure-hunt-calculator-services/water-heating-treasure-hunt.service';

@Injectable()
export class OpportunitySummaryService {

  constructor(private opportunitySheetService: OpportunitySheetService,
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
    private openingTreasureService: OpeningTreasureHuntService,
    private wallTreasureHuntService: WallTreasureHuntService,
    private airHeatingTreasureHuntService: AirHeatingTreasureHuntService,
    private flueGasTreasureHuntService: FlueGasTreasureHuntService,
    private leakageLossTreasureHuntService: LeakageTreasureHuntService,
    private wasteHeatTreasureHuntService: WasteHeatTreasureHuntService,
    private heatCascadingTreasureHuntService: HeatCascadingTreasureHuntService,
    private waterHeatingTreasureHuntService: WaterHeatingTreasureHuntService
    ) { }

  getOpportunitySummaries(treasureHunt: TreasureHunt, settings: Settings): Array<OpportunitySummary> {
    let opportunitySummaries: Array<OpportunitySummary> = new Array<OpportunitySummary>();
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.lightingReplacements, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.replaceExistingMotors, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.motorDrives, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.naturalGasReductions, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.electricityReductions, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.compressedAirReductions, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.compressedAirPressureReductions, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.waterReductions, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.steamReductions, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.pipeInsulationReductions, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.tankInsulationReductions, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.airLeakSurveys, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.wallLosses, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.flueGasLosses, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.airHeatingOpportunities, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.leakageLosses, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.wasteHeatReductions, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.openingLosses, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.heatCascadingOpportunities, opportunitySummaries, settings);
    opportunitySummaries = this.getTreasureHuntOpportunitySummaries(treasureHunt.waterHeatingOpportunities, opportunitySummaries, settings);
    //standalone opp sheets
    opportunitySummaries = this.getOpportunitySheetSummaries(treasureHunt.opportunitySheets, opportunitySummaries, settings);


    return opportunitySummaries;
  }

  getTreasureHuntOpportunitySummaries(opportunities: Array<TreasureHuntOpportunity>, opportunitySummaries: Array<OpportunitySummary>, settings: Settings): Array<OpportunitySummary> {
    if (opportunities) {
      opportunities.forEach(opportunity => {
        if (opportunity.selected) {
          let oppSummary: OpportunitySummary = this.getIndividualOpportunitySummary(opportunity, settings);
          opportunitySummaries.push(oppSummary);
        }
      });
    }
    return opportunitySummaries;
  }


  getOpportunityMetaData(opportunitySheet: OpportunitySheet): OpportunityMetaData {
    let teamData = {
      name: undefined,
      team: undefined,
      equipment: undefined,
      owner: undefined,
      utilityType: undefined,
      opportunityCost: undefined
    }
    if (opportunitySheet) {
      if (!opportunitySheet.name) {
        opportunitySheet.name = this.opportunitySheetService.defaultSheetName;
      }
      teamData.opportunityCost = opportunitySheet.opportunityCost;
      teamData.team = opportunitySheet.owner;
      teamData.name = opportunitySheet.name;
      teamData.owner = opportunitySheet.businessUnits;
      teamData.equipment = this.getEquipmentDisplay(opportunitySheet.equipment);
    }
    return teamData;
  }

  getNewOpportunitySummary(opportunityMetaData: OpportunityMetaData, results: TreasureHuntOpportunityResults, mixedIndividualResults?: Array<OpportunitySummary>): OpportunitySummary {
    let totalCost: number = this.opportunitySheetService.getOppSheetImplementationCost(opportunityMetaData.opportunityCost)
    let payback: number = totalCost / results.costSavings;
    if (opportunityMetaData.opportunityCost && opportunityMetaData.opportunityCost.additionalAnnualSavings) {
      payback = totalCost / (results.costSavings + opportunityMetaData.opportunityCost.additionalAnnualSavings.cost);
    }
    return {
      opportunityName: opportunityMetaData.name,
      utilityType: results.utilityType,
      costSavings: results.costSavings,
      totalCost: totalCost,
      payback: payback,
      opportunityCost: opportunityMetaData.opportunityCost,
      totalEnergySavings: results.energySavings,
      mixedIndividualResults: mixedIndividualResults,
      selected: true,
      baselineCost: results.baselineCost,
      modificationCost: results.modificationCost,
      team: opportunityMetaData.team,
      equipment: opportunityMetaData.equipment,
      owner: opportunityMetaData.owner
    }
  }

  
  getIndividualOpportunitySummary(thOpportunity: TreasureHuntOpportunity, settings: Settings): OpportunitySummary {
    let results: TreasureHuntOpportunityResults = this.getCalculatorTreasureHuntResults(thOpportunity, settings);
    let opportunityMetaData: OpportunityMetaData = this.getOpportunityMetaData(thOpportunity.opportunitySheet);
    let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(opportunityMetaData, results);
    return oppSummary;
  }
  
  getCalculatorTreasureHuntResults(treasureHuntOpportunity: TreasureHuntOpportunity, settings: Settings): TreasureHuntOpportunityResults {
    let treasureHuntOpportunityResults: TreasureHuntOpportunityResults; 
    if (treasureHuntOpportunity.opportunityType === Treasure.airLeak) {
      let airLeakSurveyOpportunity = treasureHuntOpportunity as AirLeakSurveyTreasureHunt;
      treasureHuntOpportunityResults = this.airLeakTreasureHuntService.getTreasureHuntOpportunityResults(airLeakSurveyOpportunity, settings);

    } else if (treasureHuntOpportunity.opportunityType === Treasure.tankInsulation) {
      let tankInsulationOpportunity = treasureHuntOpportunity as TankInsulationReductionTreasureHunt;
      treasureHuntOpportunityResults = this.tankInsulationTreasureHuntService.getTreasureHuntOpportunityResults(tankInsulationOpportunity, settings);

    } else if (treasureHuntOpportunity.opportunityType === Treasure.lightingReplacement) {
      let lightingReplacementOpportunity = treasureHuntOpportunity as LightingReplacementTreasureHunt;
      treasureHuntOpportunityResults = this.lightingTreasureHuntService.getTreasureHuntOpportunityResults(lightingReplacementOpportunity);

    } else if (treasureHuntOpportunity.opportunityType === Treasure.replaceExisting) {
      let replaceExistingMotorOpportunity = treasureHuntOpportunity as ReplaceExistingMotorTreasureHunt;
      treasureHuntOpportunityResults = this.replaceExistingTreasureService.getTreasureHuntOpportunityResults(replaceExistingMotorOpportunity, settings);

    } else if (treasureHuntOpportunity.opportunityType === Treasure.motorDrive) {
      let motorDriveOpportunity = treasureHuntOpportunity as MotorDriveInputsTreasureHunt;
      treasureHuntOpportunityResults = this.motorDriveTreasureHuntService.getTreasureHuntOpportunityResults(motorDriveOpportunity);

    } else if (treasureHuntOpportunity.opportunityType === Treasure.naturalGasReduction) {
      let naturalGasOpportunity = treasureHuntOpportunity as NaturalGasReductionTreasureHunt;
      treasureHuntOpportunityResults = this.naturalGasTreasureHuntService.getTreasureHuntOpportunityResults(naturalGasOpportunity, settings);

    } else if (treasureHuntOpportunity.opportunityType === Treasure.electricityReduction) {
      let electricityReductionOpportunity = treasureHuntOpportunity as ElectricityReductionTreasureHunt;
      treasureHuntOpportunityResults = this.electricityReductionTreasureHuntService.getTreasureHuntOpportunityResults(electricityReductionOpportunity, settings);

    } else if (treasureHuntOpportunity.opportunityType === Treasure.compressedAir) {
      let compressedAirOpportunity = treasureHuntOpportunity as CompressedAirReductionTreasureHunt;
      treasureHuntOpportunityResults = this.compressedAirTreasureHuntService.getTreasureHuntOpportunityResults(compressedAirOpportunity, settings);

    } else if (treasureHuntOpportunity.opportunityType === Treasure.compressedAirPressure) {
      let compressedAirPressureOpportunity = treasureHuntOpportunity as CompressedAirPressureReductionTreasureHunt;
      treasureHuntOpportunityResults = this.compressedAirPressureTreasureHuntService.getTreasureHuntOpportunityResults(compressedAirPressureOpportunity, settings);

    } else if (treasureHuntOpportunity.opportunityType === Treasure.waterReduction) {
      let waterReductionOpportunity = treasureHuntOpportunity as WaterReductionTreasureHunt;
      treasureHuntOpportunityResults = this.waterReductionTreasureHuntService.getTreasureHuntOpportunityResults(waterReductionOpportunity, settings);

    } else if (treasureHuntOpportunity.opportunityType === Treasure.steamReduction) {
      let steamReductionOpportunity = treasureHuntOpportunity as SteamReductionTreasureHunt;
      treasureHuntOpportunityResults = this.steamReductionTreasureHuntService.getTreasureHuntOpportunityResults(steamReductionOpportunity, settings);
    
    } else if (treasureHuntOpportunity.opportunityType === Treasure.pipeInsulation) {
      let pipeInsulationOpportunity = treasureHuntOpportunity as PipeInsulationReductionTreasureHunt;
      treasureHuntOpportunityResults = this.pipeInsulationTreasureHuntService.getTreasureHuntOpportunityResults(pipeInsulationOpportunity, settings);
   
    } else if (treasureHuntOpportunity.opportunityType === Treasure.wallLoss) {
      let wallLossOpportunity = treasureHuntOpportunity as WallLossTreasureHunt;
      treasureHuntOpportunityResults = this.wallTreasureHuntService.getTreasureHuntOpportunityResults(wallLossOpportunity, settings);
    
    } else if (treasureHuntOpportunity.opportunityType === Treasure.flueGas) {
      let flueGasOpportunity = treasureHuntOpportunity as FlueGasTreasureHunt;
      treasureHuntOpportunityResults = this.flueGasTreasureHuntService.getTreasureHuntOpportunityResults(flueGasOpportunity, settings);
    
    } else if (treasureHuntOpportunity.opportunityType === Treasure.leakageLoss) {
      let leakageLossOpportunity = treasureHuntOpportunity as LeakageLossTreasureHunt;
      treasureHuntOpportunityResults = this.leakageLossTreasureHuntService.getTreasureHuntOpportunityResults(leakageLossOpportunity, settings);
    
    } else if (treasureHuntOpportunity.opportunityType === Treasure.wasteHeat) {
      let wasteHeatOpportunity = treasureHuntOpportunity as WasteHeatTreasureHunt;
      treasureHuntOpportunityResults = this.wasteHeatTreasureHuntService.getTreasureHuntOpportunityResults(wasteHeatOpportunity, settings);
    
    } else if (treasureHuntOpportunity.opportunityType === Treasure.openingLoss) {
      let openingLossOpportunity = treasureHuntOpportunity as OpeningLossTreasureHunt;
      treasureHuntOpportunityResults = this.openingTreasureService.getTreasureHuntOpportunityResults(openingLossOpportunity, settings);
    
    } else if (treasureHuntOpportunity.opportunityType === Treasure.airHeating) {
      let airHeatingOpportunity = treasureHuntOpportunity as AirHeatingTreasureHunt;
      treasureHuntOpportunityResults = this.airHeatingTreasureHuntService.getTreasureHuntOpportunityResults(airHeatingOpportunity, settings);
    } else if (treasureHuntOpportunity.opportunityType === Treasure.heatCascading) {
      let heatCascadingOpportunity = treasureHuntOpportunity as HeatCascadingTreasureHunt;
      treasureHuntOpportunityResults = this.heatCascadingTreasureHuntService.getTreasureHuntOpportunityResults(heatCascadingOpportunity, settings);
    
    } else if (treasureHuntOpportunity.opportunityType === Treasure.waterHeating) {
      let waterHeatingOpportunity = treasureHuntOpportunity as WaterHeatingTreasureHunt;
      treasureHuntOpportunityResults = this.waterHeatingTreasureHuntService.getTreasureHuntOpportunityResults(waterHeatingOpportunity, settings);
    
    }

    if (!treasureHuntOpportunityResults) {
      treasureHuntOpportunityResults = {
        costSavings: undefined,
        energySavings: undefined,
        baselineCost: undefined,
        modificationCost: undefined,
        utilityType: '',
      }; 
    }
    
    return treasureHuntOpportunityResults;
  }

    //stand alone opp sheets
    getOpportunitySheetSummaries(opportunitySheets: Array<OpportunitySheet>, opportunitySummaries: Array<OpportunitySummary>, settings: Settings, getAllResults?: boolean): Array<OpportunitySummary> {
      if (opportunitySheets) {
        opportunitySheets.forEach(oppSheet => {
          if (oppSheet.selected || getAllResults) {
            let oppSummary: OpportunitySummary = this.getOpportunitySheetSummary(oppSheet, settings);
            if (oppSummary) {
              opportunitySummaries.push(oppSummary);
            }
          }
        });
      }
      return opportunitySummaries;
    }
  
    getOpportunitySheetSummary(oppSheet: OpportunitySheet, settings: Settings): OpportunitySummary {
      let mixedIndividualSummaries: Array<OpportunitySummary> = new Array<OpportunitySummary>();
      let oppSheetResults: OpportunitySheetResults = this.opportunitySheetService.getResults(oppSheet, settings);
      let numEnergyTypes: number = 0;
      let totalEnergySavings: number = 0;
      let energyTypeLabel: string;
      let opportunityMetaData: OpportunityMetaData = {
        name: oppSheet.name,
        team: oppSheet.owner,
        equipment: this.getEquipmentDisplay(oppSheet.equipment),
        owner: oppSheet.businessUnits,
        opportunityCost: oppSheet.opportunityCost
      }
      let treasureHuntOpportunityResults: TreasureHuntOpportunityResults;

      for (let key in oppSheetResults) {
        if (oppSheetResults[key].baselineItems != 0 || oppSheetResults[key].modificationItems != 0 && oppSheetResults[key].baselineItems != undefined) {
          numEnergyTypes = numEnergyTypes + 1;
        }
      }
      //electricity
      if (oppSheetResults.electricityResults.baselineItems != 0 || oppSheetResults.electricityResults.modificationItems != 0) {
        energyTypeLabel = 'Electricity';
        totalEnergySavings = totalEnergySavings + oppSheetResults.electricityResults.energySavings;
        treasureHuntOpportunityResults = this.setResultsFromOppSheet(oppSheetResults.electricityResults, energyTypeLabel);
        let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(opportunityMetaData, treasureHuntOpportunityResults);
        mixedIndividualSummaries.push(oppSummary);
      }
      //compressed air
      if (oppSheetResults.compressedAirResults.baselineItems != 0 || oppSheetResults.compressedAirResults.modificationItems != 0) {
        energyTypeLabel = 'Compressed Air';
        totalEnergySavings = totalEnergySavings + oppSheetResults.compressedAirResults.energySavings;
        treasureHuntOpportunityResults = this.setResultsFromOppSheet(oppSheetResults.compressedAirResults, energyTypeLabel);
        let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(opportunityMetaData, treasureHuntOpportunityResults);
        mixedIndividualSummaries.push(oppSummary);
      }
      //natural gas
      if (oppSheetResults.gasResults.baselineItems != 0 || oppSheetResults.gasResults.modificationItems != 0) {
        energyTypeLabel = 'Natural Gas';
        totalEnergySavings = totalEnergySavings + oppSheetResults.gasResults.energySavings;
        treasureHuntOpportunityResults = this.setResultsFromOppSheet(oppSheetResults.gasResults, energyTypeLabel);
        let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(opportunityMetaData, treasureHuntOpportunityResults);
        mixedIndividualSummaries.push(oppSummary);
      }
      //water
      if (oppSheetResults.waterResults.baselineItems != 0 || oppSheetResults.waterResults.modificationItems != 0) {
        energyTypeLabel = 'Water';
        totalEnergySavings = totalEnergySavings + oppSheetResults.waterResults.energySavings;
        treasureHuntOpportunityResults = this.setResultsFromOppSheet(oppSheetResults.waterResults, energyTypeLabel);
        let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(opportunityMetaData, treasureHuntOpportunityResults);
        mixedIndividualSummaries.push(oppSummary);
      }
      //waste water
      if (oppSheetResults.wasteWaterResults.baselineItems != 0 || oppSheetResults.wasteWaterResults.modificationItems != 0) {
        energyTypeLabel = 'Waste Water';
        totalEnergySavings = totalEnergySavings + oppSheetResults.wasteWaterResults.energySavings;
        treasureHuntOpportunityResults = this.setResultsFromOppSheet(oppSheetResults.wasteWaterResults, energyTypeLabel);
        let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(opportunityMetaData, treasureHuntOpportunityResults);
        mixedIndividualSummaries.push(oppSummary);
      }
      //steam
      if (oppSheetResults.steamResults.baselineItems != 0 || oppSheetResults.steamResults.modificationItems != 0) {
        energyTypeLabel = 'Steam';
        totalEnergySavings = totalEnergySavings + oppSheetResults.steamResults.energySavings;
        treasureHuntOpportunityResults = this.setResultsFromOppSheet(oppSheetResults.steamResults, energyTypeLabel);
        let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(opportunityMetaData, treasureHuntOpportunityResults);
        mixedIndividualSummaries.push(oppSummary);
      }
      //other fuel
      if (oppSheetResults.otherFuelResults.baselineItems != 0 || oppSheetResults.otherFuelResults.modificationItems != 0) {
        energyTypeLabel = 'Other Fuel';
        totalEnergySavings = totalEnergySavings + oppSheetResults.otherFuelResults.energySavings;
        treasureHuntOpportunityResults = this.setResultsFromOppSheet(oppSheetResults.otherFuelResults, energyTypeLabel);
        let oppSummary: OpportunitySummary = this.getNewOpportunitySummary(opportunityMetaData, treasureHuntOpportunityResults);
        mixedIndividualSummaries.push(oppSummary);
      }
      let oppSummary: OpportunitySummary;
      //if only one energy source in opp sheet
      if (numEnergyTypes == 1) {
        oppSummary = mixedIndividualSummaries[0];
      } else if (numEnergyTypes > 1) {
        treasureHuntOpportunityResults.utilityType = 'Mixed';
        treasureHuntOpportunityResults.costSavings = oppSheetResults.totalCostSavings;
        treasureHuntOpportunityResults.energySavings = oppSheetResults.totalEnergySavings;
        treasureHuntOpportunityResults.baselineCost = 0;
        treasureHuntOpportunityResults.modificationCost = 0;
        oppSummary = this.getNewOpportunitySummary(opportunityMetaData, treasureHuntOpportunityResults, mixedIndividualSummaries);
      } else {
        //no energy savings
        treasureHuntOpportunityResults.utilityType = 'None';
        treasureHuntOpportunityResults.costSavings = 0;
        treasureHuntOpportunityResults.energySavings = 0;
        treasureHuntOpportunityResults.baselineCost = 0;
        treasureHuntOpportunityResults.modificationCost = 0;
        opportunityMetaData.opportunityCost = undefined;
        oppSummary = this.getNewOpportunitySummary(opportunityMetaData, treasureHuntOpportunityResults);
      }
      return oppSummary;
    }

    setResultsFromOppSheet(sheetResults: OpportunitySheetResult, utilityType: string): TreasureHuntOpportunityResults {
      let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
        costSavings: 0,
        energySavings: 0,
        baselineCost: 0,
        modificationCost: 0,
        utilityType: '',
      }

      treasureHuntOpportunityResults.baselineCost = sheetResults.baselineEnergyCost;
      treasureHuntOpportunityResults.modificationCost = sheetResults.modificationEnergyCost;
      treasureHuntOpportunityResults.costSavings = sheetResults.energyCostSavings;
      treasureHuntOpportunityResults.energySavings = sheetResults.energySavings;
      treasureHuntOpportunityResults.utilityType = utilityType;

      return treasureHuntOpportunityResults;
    }

    
  getEquipmentDisplay(equipment): string {
    if (equipment) {
      let findEquipment = processEquipmentOptions.find(option => { return option.value == equipment });
      if (findEquipment) {
        return findEquipment.display;
      }
    }
    return
  }

}

export interface OpportunityMetaData {
    name: string,
    team: string,
    equipment: string,
    owner: string,
    opportunityCost: OpportunityCost
}
