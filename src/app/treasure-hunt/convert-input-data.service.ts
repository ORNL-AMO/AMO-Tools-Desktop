import { Injectable } from '@angular/core';
import { TreasureHunt, OpportunitySheet, EnergyUseItem, EnergyUsage, HeatCascadingTreasureHunt,  } from '../shared/models/treasure-hunt';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
import { AirLeakTreasureHuntService } from './treasure-hunt-calculator-services/air-leak-treasure-hunt.service';
import { CaPressureReductionTreasureHuntService } from './treasure-hunt-calculator-services/ca-pressure-reduction-treasure-hunt.service';
import { CaReductionTreasureHuntService } from './treasure-hunt-calculator-services/ca-reduction-treasure-hunt.service';
import { ElectricityReductionTreasureHuntService } from './treasure-hunt-calculator-services/electricity-reduction-treasure-hunt.service';
import { FlueGasTreasureHuntService } from './treasure-hunt-calculator-services/flue-gas-treasure-hunt.service';
import { MotorDriveTreasureHuntService } from './treasure-hunt-calculator-services/motor-drive-treasure-hunt.service';
import { NaturalGasReductionTreasureHuntService } from './treasure-hunt-calculator-services/natural-gas-reduction-treasure-hunt.service';
import { ReplaceExistingTreasureHuntService } from './treasure-hunt-calculator-services/replace-existing-treasure-hunt.service';
import { SteamReductionTreasureHuntService } from './treasure-hunt-calculator-services/steam-reduction-treasure-hunt.service';
import { TankInsulationTreasureHuntService } from './treasure-hunt-calculator-services/tank-insulation-treasure-hunt.service';
import { WallTreasureHuntService } from './treasure-hunt-calculator-services/wall-treasure-hunt.service';
import { WaterReductionTreasureHuntService } from './treasure-hunt-calculator-services/water-reduction-treasure-hunt.service';
import { LeakageTreasureHuntService } from './treasure-hunt-calculator-services/leakage-treasure-hunt.service';
import { WasteHeatTreasureHuntService } from './treasure-hunt-calculator-services/waste-heat-treasure-hunt.service';
import { OpeningTreasureHuntService } from './treasure-hunt-calculator-services/opening-treasure-hunt.service';
import { HeatCascadingTreasureHuntService } from './treasure-hunt-calculator-services/heat-cascading-treasure-hunt.service';
import { WaterHeatingTreasureHuntService } from './treasure-hunt-calculator-services/water-heating-treasure-hunt.service';

@Injectable()
export class ConvertInputDataService {

  constructor(private convertUnitsService: ConvertUnitsService,
    private airLeakTreasureService: AirLeakTreasureHuntService,
    private tankInsulationTreasureHuntService: TankInsulationTreasureHuntService,
    private replaceExistingTreasureService: ReplaceExistingTreasureHuntService,
    private motorDriveTreasureHuntService: MotorDriveTreasureHuntService,
    private naturalGasTreasureHuntService: NaturalGasReductionTreasureHuntService,
    private electricityReductionTreasureHuntService: ElectricityReductionTreasureHuntService,
    private compressedAirTreasureHuntService: CaReductionTreasureHuntService,
    private compressedAirPressureTreasureHuntService: CaPressureReductionTreasureHuntService,
    private waterReductionTreasureHuntService: WaterReductionTreasureHuntService,
    private steamReductionTreasureHuntService: SteamReductionTreasureHuntService,
    private wasteHeatTreasureHuntService: WasteHeatTreasureHuntService,
    private wallTreasureService: WallTreasureHuntService,
    private openingTreasureService: OpeningTreasureHuntService,
    private flueGasTreasureHuntService: FlueGasTreasureHuntService,
    private leakageTreasureHuntService: LeakageTreasureHuntService,
    private heatCascadingTreasureHuntService: HeatCascadingTreasureHuntService,
    private waterHeatingTreasureHuntService: WaterHeatingTreasureHuntService
    ) { }

  convertTreasureHuntInputData(treasureHunt: TreasureHunt, oldSettings: Settings, newSettings: Settings): TreasureHunt {
    //no conversion for lighting needed..
    if (treasureHunt.opportunitySheets != undefined) {
      treasureHunt.opportunitySheets = this.convertOpportunitySheets(treasureHunt.opportunitySheets, oldSettings, newSettings);
    }
    if (treasureHunt.replaceExistingMotors != undefined) {
      treasureHunt.replaceExistingMotors = this.replaceExistingTreasureService.convertReplaceExistingMotors(treasureHunt.replaceExistingMotors, oldSettings, newSettings);
    }
    if (treasureHunt.motorDrives != undefined) {
      treasureHunt.motorDrives = this.motorDriveTreasureHuntService.convertMotorDrives(treasureHunt.motorDrives, oldSettings, newSettings);
    }
    if (treasureHunt.naturalGasReductions != undefined) {
      treasureHunt.naturalGasReductions = this.naturalGasTreasureHuntService.convertNaturalGasReductions(treasureHunt.naturalGasReductions, oldSettings, newSettings);
    }
    if (treasureHunt.electricityReductions != undefined) {
      treasureHunt.electricityReductions = this.electricityReductionTreasureHuntService.convertElectricityReductions(treasureHunt.electricityReductions, oldSettings, newSettings);
    }
    if (treasureHunt.compressedAirReductions != undefined) {
      treasureHunt.compressedAirReductions = this.compressedAirTreasureHuntService.convertCompressedAirReductions(treasureHunt.compressedAirReductions, oldSettings, newSettings);
    }
    if (treasureHunt.compressedAirPressureReductions != undefined) {
      treasureHunt.compressedAirPressureReductions = this.compressedAirPressureTreasureHuntService.convertCompressedAirPressureReductions(treasureHunt.compressedAirPressureReductions, oldSettings, newSettings);
    }
    if (treasureHunt.waterReductions != undefined) {
      treasureHunt.waterReductions = this.waterReductionTreasureHuntService.convertWaterReductions(treasureHunt.waterReductions, oldSettings, newSettings);
    }
    if (treasureHunt.steamReductions != undefined) {
      treasureHunt.steamReductions = this.steamReductionTreasureHuntService.convertSteamReductions(treasureHunt.steamReductions, oldSettings, newSettings);
    }
    if (treasureHunt.tankInsulationReductions != undefined) {
      treasureHunt.tankInsulationReductions = this.tankInsulationTreasureHuntService.convertTankInsulationReductions(treasureHunt.tankInsulationReductions, oldSettings, newSettings);
    }
    if (treasureHunt.flueGasLosses != undefined) {
      treasureHunt.flueGasLosses = this.flueGasTreasureHuntService.convertFlueGasLosses(treasureHunt.flueGasLosses, oldSettings, newSettings);
    }
    if (treasureHunt.wallLosses != undefined) {
      treasureHunt.wallLosses = this.wallTreasureService.convertWallLosses(treasureHunt.wallLosses, oldSettings, newSettings);
    }
    if (treasureHunt.wasteHeatReductions != undefined) {
      treasureHunt.wasteHeatReductions = this.wasteHeatTreasureHuntService.convertWasteHeatReductions(treasureHunt.wasteHeatReductions, oldSettings, newSettings);
    }
    if (treasureHunt.openingLosses != undefined) {
      treasureHunt.openingLosses = this.openingTreasureService.convertOpeningLosses(treasureHunt.openingLosses, oldSettings, newSettings);
    }
    if (treasureHunt.airLeakSurveys != undefined) {
      treasureHunt.airLeakSurveys = this.airLeakTreasureService.convertAirLeakSurveys(treasureHunt.airLeakSurveys, oldSettings, newSettings);
    }
    if (treasureHunt.leakageLosses != undefined) {
      treasureHunt.leakageLosses = this.leakageTreasureHuntService.convertLeakageLosses(treasureHunt.leakageLosses, oldSettings, newSettings);
    }
    if (treasureHunt.heatCascadingOpportunities != undefined) {
      treasureHunt.heatCascadingOpportunities = this.heatCascadingTreasureHuntService.convertHeatCascadingOpportunities(treasureHunt.heatCascadingOpportunities, oldSettings, newSettings);
    }
    if (treasureHunt.waterHeatingOpportunities != undefined) {
      treasureHunt.waterHeatingOpportunities = this.waterHeatingTreasureHuntService.convertWaterHeatingOpportunities(treasureHunt.waterHeatingOpportunities, oldSettings, newSettings);
    }
    if (treasureHunt.currentEnergyUsage != undefined) {
      treasureHunt.currentEnergyUsage = this.convertCurrentEnergyUsage(treasureHunt.currentEnergyUsage, oldSettings, newSettings);
    }
    return treasureHunt;
  }


  convertOpportunitySheets(opportunitySheets: Array<OpportunitySheet>, oldSettings: Settings, newSettings: Settings): Array<OpportunitySheet> {
    opportunitySheets.forEach(sheet => {
      sheet.baselineEnergyUseItems.forEach(item => {
        item = this.convertEnergyUseItem(item, oldSettings, newSettings);
      });
      sheet.modificationEnergyUseItems.forEach(item => {
        item = this.convertEnergyUseItem(item, oldSettings, newSettings);
      });
    })
    return opportunitySheets;
  }

  convertEnergyUseItem(energyUseItem: EnergyUseItem, oldSettings: Settings, newSettings: Settings): EnergyUseItem {
    if (energyUseItem.type == 'Gas' || energyUseItem.type == 'Other Fuel') {
      //imperial: MMBtu, metric: MJ
      energyUseItem.amount = this.convertUnitsService.convertMMBtuAndGJValue(energyUseItem.amount, oldSettings, newSettings);
    } else if (energyUseItem.type == 'Water' || energyUseItem.type == 'WWT') {
      //imperial: gal, metric: L 
      energyUseItem.amount = this.convertUnitsService.convertGalAndLiterValue(energyUseItem.amount, oldSettings, newSettings);
    } else if (energyUseItem.type == 'Compressed Air') {
      //imperial: SCF, metric: m3
      energyUseItem.amount = this.convertUnitsService.convertFt3AndM3Value(energyUseItem.amount, oldSettings, newSettings);
    } else if (energyUseItem.type == 'Steam') {
      //imperial: klb, metric: tonne
      energyUseItem.amount = this.convertUnitsService.convertKlbAndTonneValue(energyUseItem.amount, oldSettings, newSettings);
    }
    return energyUseItem;
  }


  convertCurrentEnergyUsage(currentEnergyUsage: EnergyUsage, oldSettings: Settings, newSettings: Settings): EnergyUsage {
    //imperial: MMBtu/yr, metric: GJ/yr
    currentEnergyUsage.naturalGasUsage = this.convertUnitsService.convertMMBtuAndGJValue(currentEnergyUsage.naturalGasUsage, oldSettings, newSettings);
    //imperial: MMBtu/yr, metric: GJ/yr
    currentEnergyUsage.otherFuelUsage = this.convertUnitsService.convertMMBtuAndGJValue(currentEnergyUsage.otherFuelUsage, oldSettings, newSettings);
    //imperial: kgal/yr, metric: L/yr
    currentEnergyUsage.waterUsage = this.convertUnitsService.convertKGalAndLiterValue(currentEnergyUsage.waterUsage, oldSettings, newSettings);
    //imperial: kgal/yr, metric: L/yr
    currentEnergyUsage.wasteWaterUsage = this.convertUnitsService.convertKGalAndLiterValue(currentEnergyUsage.wasteWaterUsage, oldSettings, newSettings);
    //imperial: kSCF/yr , metric: m3/yr
    currentEnergyUsage.compressedAirUsage = this.convertUnitsService.convertKSCFAndM3Value(currentEnergyUsage.compressedAirUsage, oldSettings, newSettings);
    //imperial: klb/yr, metric: tonne/yr
    currentEnergyUsage.steamUsage = this.convertUnitsService.convertKlbAndTonneValue(currentEnergyUsage.steamUsage, oldSettings, newSettings);
    return currentEnergyUsage;
  }

}
