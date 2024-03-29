import { Injectable } from '@angular/core';
import { ExhaustGasEAF } from '../shared/models/phast/losses/exhaustGasEAF';
import { Losses, PHAST, PhastCo2SavingsData, PhastResults } from '../shared/models/phast/phast';
import { FixtureLoss } from '../shared/models/phast/losses/fixtureLoss';
import { GasCoolingLoss, LiquidCoolingLoss, CoolingLoss } from '../shared/models/phast/losses/coolingLoss';
import { GasChargeMaterial, LiquidChargeMaterial, SolidChargeMaterial, ChargeMaterial } from '../shared/models/phast/losses/chargeMaterial';
import { OpeningLoss } from '../shared/models/phast/losses/openingLoss';
import { WallLoss } from '../shared/models/phast/losses/wallLoss';
import { LeakageLoss } from '../shared/models/phast/losses/leakageLoss';
import { AtmosphereLoss } from '../shared/models/phast/losses/atmosphereLoss';
import { Slag } from '../shared/models/phast/losses/slag';
import { EnergyInputEAF } from '../shared/models/phast/losses/energyInputEAF';
import { FlueGasByMass, FlueGasByVolume, FlueGas } from '../shared/models/phast/losses/flueGas';
import { ExtendedSurface } from '../shared/models/phast/losses/extendedSurface';
import { OtherLoss } from '../shared/models/phast/losses/otherLoss';
import { EnergyInputExhaustGasLoss } from '../shared/models/phast/losses/energyInputExhaustGasLosses';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
import { DesignedEnergy } from '../shared/models/phast/designedEnergy';
import { MeteredEnergy } from '../shared/models/phast/meteredEnergy';
import { OperatingCosts } from '../shared/models/operations';
import { Co2SavingsData } from '../calculator/utilities/co2-savings/co2-savings.service';

@Injectable()
export class ConvertPhastService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertVal(val: number, from: string, to: string) {
    if (val !== undefined) {
      val = this.convertUnitsService.value(val).from(from).to(to);
      val = this.roundVal(val, 4);
    }
    return val;
  }
  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  convertDesignedEnergy(designedEnergy: DesignedEnergy, oldSettings: Settings, newSettings: Settings) {
    if (designedEnergy.steam || designedEnergy.fuel) {
      designedEnergy.zones.forEach(zone => {
        if (designedEnergy.fuel) {
          if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
            zone.designedEnergyFuel.totalBurnerCapacity = this.convertVal(zone.designedEnergyFuel.totalBurnerCapacity, 'GJ', 'MMBtu');
          } else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
            zone.designedEnergyFuel.totalBurnerCapacity = this.convertVal(zone.designedEnergyFuel.totalBurnerCapacity, 'MMBtu', 'GJ');
          }
        }

        if (designedEnergy.steam) {
          if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
            zone.designedEnergySteam.totalHeat = this.convertVal(zone.designedEnergySteam.totalHeat, 'kJkg', 'btuLb');
            zone.designedEnergySteam.steamFlow = this.convertVal(zone.designedEnergySteam.steamFlow, 'kg', 'lb');
          } else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
            zone.designedEnergySteam.totalHeat = this.convertVal(zone.designedEnergySteam.totalHeat, 'btuLb', 'kJkg');
            zone.designedEnergySteam.steamFlow = this.convertVal(zone.designedEnergySteam.steamFlow, 'lb', 'kg');
          }
        }
      });
    }
    return designedEnergy;
  }

  convertMeteredEnergy(meteredEnergy: MeteredEnergy, oldSettings: Settings, newSettings: Settings) {
    if (meteredEnergy.meteredEnergyFuel) {
      if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
        meteredEnergy.meteredEnergyFuel.heatingValue = this.convertVal(meteredEnergy.meteredEnergyFuel.heatingValue, 'kJkg', 'btuLb');
        meteredEnergy.meteredEnergyFuel.fuelEnergy = this.convertVal(meteredEnergy.meteredEnergyFuel.fuelEnergy, 'kJ', 'Btu');
        meteredEnergy.meteredEnergyFuel.fuelFlowRateInput = this.convertVal(meteredEnergy.meteredEnergyFuel.fuelFlowRateInput, 'm3', 'ft3');
      } else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
        meteredEnergy.meteredEnergyFuel.heatingValue = this.convertVal(meteredEnergy.meteredEnergyFuel.heatingValue, 'btuLb', 'kJkg');
        meteredEnergy.meteredEnergyFuel.fuelEnergy = this.convertVal(meteredEnergy.meteredEnergyFuel.fuelEnergy, 'Btu', 'kJ');
        meteredEnergy.meteredEnergyFuel.fuelFlowRateInput = this.convertVal(meteredEnergy.meteredEnergyFuel.fuelFlowRateInput, 'ft3', 'm3');
      }
    }
    if (meteredEnergy.meteredEnergySteam) {
      if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
        meteredEnergy.meteredEnergySteam.totalHeatSteam = this.convertVal(meteredEnergy.meteredEnergySteam.totalHeatSteam, 'kJkg', 'btuLb');
        meteredEnergy.meteredEnergySteam.flowRate = this.convertVal(meteredEnergy.meteredEnergySteam.flowRate, 'kg', 'lb');
      } else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
        meteredEnergy.meteredEnergySteam.totalHeatSteam = this.convertVal(meteredEnergy.meteredEnergySteam.totalHeatSteam, 'btuLb', 'kJkg');
        meteredEnergy.meteredEnergySteam.flowRate = this.convertVal(meteredEnergy.meteredEnergySteam.flowRate, 'lb', 'kg');
      }
    }
    return meteredEnergy;
  }

  convertPhastLosses(losses: Losses, oldSettings: Settings, newSettings: Settings): Losses {
    let convertedLosses: Losses = JSON.parse(JSON.stringify(losses));
    if (convertedLosses.atmosphereLosses) {
      convertedLosses.atmosphereLosses.forEach(loss => {
        loss = this.convertAtmosphereLosses(loss, oldSettings, newSettings);
      });

    }
    if (convertedLosses.chargeMaterials) {
      convertedLosses.chargeMaterials.forEach(loss => {
        loss = this.convertChargeMaterial(loss, oldSettings, newSettings);
      });
    }
    if (convertedLosses.coolingLosses) {
      convertedLosses.coolingLosses.forEach(loss => {
        loss = this.convertCoolingLoss(loss, oldSettings, newSettings);
      });
    }
    if (convertedLosses.energyInputEAF) {
      convertedLosses.energyInputEAF.forEach(loss => {
        loss = this.convertEnergyInputEAF(loss, oldSettings, newSettings);
      });
    }
    if (convertedLosses.exhaustGasEAF) {
      convertedLosses.exhaustGasEAF.forEach(loss => {
        loss = this.convertExhaustGasEAF(loss, oldSettings, newSettings);
      });
    }
    if (convertedLosses.energyInputExhaustGasLoss) {
      convertedLosses.energyInputExhaustGasLoss.forEach(loss => {
        loss = this.convertEnergyInputExhaustGasLoss(loss, oldSettings, newSettings);
      });
    }
    if (convertedLosses.extendedSurfaces) {
      convertedLosses.extendedSurfaces.forEach(loss => {
        loss = this.convertExtendedSurface(loss, oldSettings, newSettings);
      });
    }
    if (convertedLosses.fixtureLosses) {
      convertedLosses.fixtureLosses.forEach(loss => {
        loss = this.convertFixtureLoss(loss, oldSettings, newSettings);
      });
    }
    if (convertedLosses.flueGasLosses) {
      convertedLosses.flueGasLosses.forEach(loss => {
        loss = this.convertFlueGas(loss, oldSettings, newSettings);
      });
    }
    if (convertedLosses.leakageLosses) {
      convertedLosses.leakageLosses.forEach(loss => {
        loss = this.convertLeakageLoss(loss, oldSettings, newSettings);
      });
    }
    if (convertedLosses.openingLosses) {
      convertedLosses.openingLosses.forEach(loss => {
        loss = this.convertOpeningLoss(loss, oldSettings, newSettings);
      });
    }
    if (convertedLosses.otherLosses) {
      convertedLosses.otherLosses.forEach(loss => {
        loss = this.convertOtherLoss(loss, oldSettings, newSettings);
      });
    }
    if (convertedLosses.slagLosses) {
      convertedLosses.slagLosses.forEach(loss => {
        loss = this.convertSlag(loss, oldSettings, newSettings);
      });
    }
    if (convertedLosses.wallLosses) {
      convertedLosses.wallLosses.forEach(loss => {
        loss = this.convertWallLoss(loss, oldSettings, newSettings);
      });
    }
    return convertedLosses;
  }
  //atmosphere
  convertAtmosphereLosses(loss: AtmosphereLoss, oldSettings: Settings, newSettings: Settings): AtmosphereLoss {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.inletTemperature = this.convertVal(loss.inletTemperature, 'C', 'F');
      loss.outletTemperature = this.convertVal(loss.outletTemperature, 'C', 'F');
      loss.flowRate = this.convertVal(loss.flowRate, 'm3/h', 'ft3/h');
      loss.specificHeat = this.convertVal(loss.specificHeat, 'kJm3C', 'btuScfF');
    } else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.inletTemperature = this.convertVal(loss.inletTemperature, 'F', 'C');
      loss.outletTemperature = this.convertVal(loss.outletTemperature, 'F', 'C');
      loss.flowRate = this.convertVal(loss.flowRate, 'ft3/h', 'm3/h');
      loss.specificHeat = this.convertVal(loss.specificHeat, 'btuScfF', 'kJm3C');
    }
    return loss;
  }
  //chargeMaterial
  convertChargeMaterial(loss: ChargeMaterial, oldSettings: Settings, newSettings: Settings): ChargeMaterial {
    if (loss.chargeMaterialType === 'Solid') {
      loss.solidChargeMaterial = this.convertSolidChargeMaterial(loss.solidChargeMaterial, oldSettings, newSettings);
    } else if (loss.chargeMaterialType === 'Gas') {
      loss.gasChargeMaterial = this.convertGasChargeMaterial(loss.gasChargeMaterial, oldSettings, newSettings);
    } else if (loss.chargeMaterialType === 'Liquid') {
      loss.liquidChargeMaterial = this.convertLiquidChargeMaterial(loss.liquidChargeMaterial, oldSettings, newSettings);
    }
    return loss;
  }
  //liquidChargeMaterial
  convertLiquidChargeMaterial(loss: LiquidChargeMaterial, oldSettings: Settings, newSettings: Settings): LiquidChargeMaterial {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.vaporizingTemperature = this.convertVal(loss.vaporizingTemperature, 'C', 'F');
      loss.latentHeat = this.convertVal(loss.latentHeat, 'kJkg', 'btuLb');
      loss.initialTemperature = this.convertVal(loss.initialTemperature, 'C', 'F');
      loss.dischargeTemperature = this.convertVal(loss.dischargeTemperature, 'C', 'F');
      loss.chargeFeedRate = this.convertVal(loss.chargeFeedRate, 'kg', 'lb');
      loss.reactionHeat = this.convertVal(loss.reactionHeat, 'kJkg', 'btuLb');
      loss.additionalHeat = this.convertVal(loss.additionalHeat, 'kJ', 'Btu');
      loss.specificHeatLiquid = this.convertVal(loss.specificHeatLiquid, 'kJkgC', 'btulbF');
      loss.specificHeatVapor = this.convertVal(loss.specificHeatVapor, 'kJkgC', 'btulbF');
    } else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.vaporizingTemperature = this.convertVal(loss.vaporizingTemperature, 'F', 'C');
      loss.latentHeat = this.convertVal(loss.latentHeat, 'btuLb', 'kJkg');
      loss.initialTemperature = this.convertVal(loss.initialTemperature, 'F', 'C');
      loss.dischargeTemperature = this.convertVal(loss.dischargeTemperature, 'F', 'C');
      loss.chargeFeedRate = this.convertVal(loss.chargeFeedRate, 'lb', 'kg');
      loss.reactionHeat = this.convertVal(loss.reactionHeat, 'btuLb', 'kJkg');
      loss.additionalHeat = this.convertVal(loss.additionalHeat, 'Btu', 'kJ');
      loss.specificHeatLiquid = this.convertVal(loss.specificHeatLiquid, 'btulbF', 'kJkgC');
      loss.specificHeatVapor = this.convertVal(loss.specificHeatVapor, 'btulbF', 'kJkgC');
    }
    return loss;
  }
  //solidChargeMaterial
  convertSolidChargeMaterial(loss: SolidChargeMaterial, oldSettings: Settings, newSettings: Settings): SolidChargeMaterial {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.meltingPoint = this.convertVal(loss.meltingPoint, 'C', 'F');
      loss.initialTemperature = this.convertVal(loss.initialTemperature, 'C', 'F');
      loss.dischargeTemperature = this.convertVal(loss.dischargeTemperature, 'C', 'F');
      loss.waterVaporDischargeTemperature = this.convertVal(loss.waterVaporDischargeTemperature, 'C', 'F');
      loss.chargeFeedRate = this.convertVal(loss.chargeFeedRate, 'kg', 'lb');
      loss.reactionHeat = this.convertVal(loss.reactionHeat, 'kJkg', 'btuLb');
      loss.additionalHeat = this.convertVal(loss.additionalHeat, 'kJ', 'Btu');
      loss.specificHeatLiquid = this.convertVal(loss.specificHeatLiquid, 'kJkgC', 'btulbF');
      loss.specificHeatSolid = this.convertVal(loss.specificHeatSolid, 'kJkgC', 'btulbF');
      loss.latentHeat = this.convertVal(loss.latentHeat, 'kJkg', 'btuLb');
    } else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.meltingPoint = this.convertVal(loss.meltingPoint, 'F', 'C');
      loss.initialTemperature = this.convertVal(loss.initialTemperature, 'F', 'C');
      loss.dischargeTemperature = this.convertVal(loss.dischargeTemperature, 'F', 'C');
      loss.waterVaporDischargeTemperature = this.convertVal(loss.waterVaporDischargeTemperature, 'F', 'C');
      loss.chargeFeedRate = this.convertVal(loss.chargeFeedRate, 'lb', 'kg');
      loss.reactionHeat = this.convertVal(loss.reactionHeat, 'btuLb', 'kJkg');
      loss.additionalHeat = this.convertVal(loss.additionalHeat, 'Btu', 'kJ');
      loss.specificHeatLiquid = this.convertVal(loss.specificHeatLiquid, 'btulbF', 'kJkgC');
      loss.specificHeatSolid = this.convertVal(loss.specificHeatSolid, 'btulbF', 'kJkgC');
      loss.latentHeat = this.convertVal(loss.latentHeat, 'btuLb', 'kJkg');
    }
    return loss;
  }
  //gasChargeMaterial
  convertGasChargeMaterial(loss: GasChargeMaterial, oldSettings: Settings, newSettings: Settings): GasChargeMaterial {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.initialTemperature = this.convertVal(loss.initialTemperature, 'C', 'F');
      loss.dischargeTemperature = this.convertVal(loss.dischargeTemperature, 'C', 'F');
      loss.feedRate = this.convertVal(loss.feedRate, 'kg', 'lb');
      loss.reactionHeat = this.convertVal(loss.reactionHeat, 'kJkg', 'btuLb');
      loss.additionalHeat = this.convertVal(loss.additionalHeat, 'kJ', 'Btu');
      loss.specificHeatVapor = this.convertVal(loss.specificHeatVapor, 'kJkgC', 'btulbF');
      loss.specificHeatGas = this.convertVal(loss.specificHeatGas, 'kJkgC', 'btulbF');
    } else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.initialTemperature = this.convertVal(loss.initialTemperature, 'F', 'C');
      loss.dischargeTemperature = this.convertVal(loss.dischargeTemperature, 'F', 'C');
      loss.feedRate = this.convertVal(loss.feedRate, 'lb', 'kg');
      loss.reactionHeat = this.convertVal(loss.reactionHeat, 'btuLb', 'kJkg');
      loss.additionalHeat = this.convertVal(loss.additionalHeat, 'Btu', 'kJ');
      loss.specificHeatVapor = this.convertVal(loss.specificHeatVapor, 'btulbF', 'kJkgC');
      loss.specificHeatGas = this.convertVal(loss.specificHeatGas, 'btulbF', 'kJkgC');
    }
    return loss;
  }
  //coolingLoss
  convertCoolingLoss(loss: CoolingLoss, oldSettings: Settings, newSettings: Settings): CoolingLoss {
    if (loss.coolingLossType === 'Gas') {
      loss.gasCoolingLoss = this.convertGasCoolingLoss(loss.gasCoolingLoss, oldSettings, newSettings);
    } else if (loss.coolingLossType === 'Liquid') {
      loss.liquidCoolingLoss = this.convertLiquidCoolingLoss(loss.liquidCoolingLoss, oldSettings, newSettings);
    }
    return loss;
  }
  //gasCoolingLoss
  convertGasCoolingLoss(loss: GasCoolingLoss, oldSettings: Settings, newSettings: Settings): GasCoolingLoss {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.specificHeat = this.convertVal(loss.specificHeat, 'kJkgC', 'btulbF');
      loss.flowRate = this.convertVal(loss.flowRate, 'm3', 'ft3');
      loss.finalTemperature = this.convertVal(loss.finalTemperature, 'C', 'F');
      loss.initialTemperature = this.convertVal(loss.initialTemperature, 'C', 'F');
      loss.gasDensity = this.convertVal(loss.gasDensity, 'kgNm3', 'lbscf');
    } else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.specificHeat = this.convertVal(loss.specificHeat, 'btulbF', 'kJkgC');
      loss.flowRate = this.convertVal(loss.flowRate, 'ft3', 'm3');
      loss.finalTemperature = this.convertVal(loss.finalTemperature, 'F', 'C');
      loss.initialTemperature = this.convertVal(loss.initialTemperature, 'F', 'C');
      loss.gasDensity = this.convertVal(loss.gasDensity, 'lbscf', 'kgNm3');
    }
    return loss;
  }
  //liquidCoolingLoss
  convertLiquidCoolingLoss(loss: LiquidCoolingLoss, oldSettings: Settings, newSettings: Settings): LiquidCoolingLoss {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.specificHeat = this.convertVal(loss.specificHeat, 'kJkgC', 'btulbF');
      loss.density = this.convertVal(loss.density, 'kgL', 'lbgal');
      loss.flowRate = this.convertVal(loss.flowRate, 'L', 'gal');
      loss.initialTemperature = this.convertVal(loss.initialTemperature, 'C', 'F');
      loss.outletTemperature = this.convertVal(loss.outletTemperature, 'C', 'F');
    } else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.specificHeat = this.convertVal(loss.specificHeat, 'btulbF', 'kJkgC');
      loss.density = this.convertVal(loss.density, 'lbgal', 'kgL');
      loss.flowRate = this.convertVal(loss.flowRate, 'gal', 'L');
      loss.initialTemperature = this.convertVal(loss.initialTemperature, 'F', 'C');
      loss.outletTemperature = this.convertVal(loss.outletTemperature, 'F', 'C');
    }
    return loss;
  }
  //energyInputEAF
  convertEnergyInputEAF(loss: EnergyInputEAF, oldSettings: Settings, newSettings: Settings): EnergyInputEAF {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.naturalGasHeatInput = this.convertVal(loss.naturalGasHeatInput, 'GJ', 'MMBtu');
      loss.otherFuels = this.convertVal(loss.otherFuels, 'GJ', 'MMBtu');
      loss.coalCarbonInjection = this.convertVal(loss.coalCarbonInjection, 'kg', 'lb');
      loss.coalHeatingValue = this.convertVal(loss.coalHeatingValue, 'kJkg', 'btuLb');
      loss.electrodeHeatingValue = this.convertVal(loss.electrodeHeatingValue, 'kJkg', 'btuLb');
      loss.electrodeUse = this.convertVal(loss.electrodeUse, 'kg', 'lb');
      loss.flowRateInput = this.convertVal(loss.flowRateInput, 'm3', 'ft3');
    }
    else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.naturalGasHeatInput = this.convertVal(loss.naturalGasHeatInput, 'MMBtu', 'GJ');
      loss.otherFuels = this.convertVal(loss.otherFuels, 'MMBtu', 'GJ');
      loss.coalCarbonInjection = this.convertVal(loss.coalCarbonInjection, 'lb', 'kg');
      loss.coalHeatingValue = this.convertVal(loss.coalHeatingValue, 'btuLb', 'kJkg');
      loss.electrodeHeatingValue = this.convertVal(loss.electrodeHeatingValue, 'btuLb', 'kJkg');
      loss.electrodeUse = this.convertVal(loss.electrodeUse, 'lb', 'kg');
      loss.flowRateInput = this.convertVal(loss.flowRateInput, 'ft3', 'm3');
    }
    return loss;
  }
  //exhaustGasEAF
  convertExhaustGasEAF(loss: ExhaustGasEAF, oldSettings: Settings, newSettings: Settings): ExhaustGasEAF {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.offGasTemp = this.convertVal(loss.offGasTemp, 'C', 'F');
      loss.vfr = this.convertVal(loss.vfr, 'm3', 'ft3');
      loss.dustLoading = this.convertVal(loss.dustLoading, 'kgNm3', 'lbscf');
    }
    else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.offGasTemp = this.convertVal(loss.offGasTemp, 'F', 'C');
      loss.vfr = this.convertVal(loss.vfr, 'ft3', 'm3');
      loss.dustLoading = this.convertVal(loss.dustLoading, 'lbscf', 'kgNm3');
    }
    return loss;
  }

  convertEAFEnergyUsed(results: PhastResults, settings: Settings) {
    let phastResults: PhastResults = JSON.parse(JSON.stringify(results));
    if (settings.unitsOfMeasure == 'Imperial') {
      phastResults.annualEAFResults.naturalGasUsed = this.convertUnitsService.value(phastResults.annualEAFResults.naturalGasUsed).from('MMBtu').to('kWh');
      phastResults.annualEAFResults.coalCarbonUsed = this.convertUnitsService.value(phastResults.annualEAFResults.coalCarbonUsed).from('MMBtu').to('kWh');
      phastResults.annualEAFResults.electrodeEnergyUsed = this.convertUnitsService.value(phastResults.annualEAFResults.electrodeEnergyUsed).from('MMBtu').to('kWh');
      phastResults.annualEAFResults.otherFuelUsed = this.convertUnitsService.value(phastResults.annualEAFResults.otherFuelUsed).from('MMBtu').to('kWh');

    } else {
      phastResults.annualEAFResults.naturalGasUsed = this.convertUnitsService.value(phastResults.annualEAFResults.naturalGasUsed).from('GJ').to('kWh');
      phastResults.annualEAFResults.coalCarbonUsed = this.convertUnitsService.value(phastResults.annualEAFResults.coalCarbonUsed).from('GJ').to('kWh');
      phastResults.annualEAFResults.electrodeEnergyUsed = this.convertUnitsService.value(phastResults.annualEAFResults.electrodeEnergyUsed).from('GJ').to('kWh');
      phastResults.annualEAFResults.otherFuelUsed = this.convertUnitsService.value(phastResults.annualEAFResults.otherFuelUsed).from('GJ').to('kWh');
    }

    return phastResults;
  }
  //energyInputExhaustGasLoss
  convertEnergyInputExhaustGasLoss(loss: EnergyInputExhaustGasLoss, oldSettings: Settings, newSettings: Settings): EnergyInputExhaustGasLoss {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.combustionAirTemp = this.convertVal(loss.combustionAirTemp, 'C', 'F');
      loss.exhaustGasTemp = this.convertVal(loss.exhaustGasTemp, 'C', 'F');
      loss.totalHeatInput = this.convertVal(loss.totalHeatInput, 'kJ', 'Btu');
    }
    else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.combustionAirTemp = this.convertVal(loss.combustionAirTemp, 'F', 'C');
      loss.exhaustGasTemp = this.convertVal(loss.exhaustGasTemp, 'F', 'C');
      loss.totalHeatInput = this.convertVal(loss.totalHeatInput, 'Btu', 'kJ');
    }
    return loss;
  }
  //extendedSurface
  convertExtendedSurface(loss: ExtendedSurface, oldSettings: Settings, newSettings: Settings): ExtendedSurface {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.ambientTemperature = this.convertVal(loss.ambientTemperature, 'C', 'F');
      loss.surfaceTemperature = this.convertVal(loss.surfaceTemperature, 'C', 'F');
      loss.surfaceArea = this.convertVal(loss.surfaceArea, 'm2', 'ft2');
    }
    else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.ambientTemperature = this.convertVal(loss.ambientTemperature, 'F', 'C');
      loss.surfaceTemperature = this.convertVal(loss.surfaceTemperature, 'F', 'C');
      loss.surfaceArea = this.convertVal(loss.surfaceArea, 'ft2', 'm2');
    }
    return loss;
  }
  //fixtureLoss
  convertFixtureLoss(loss: FixtureLoss, oldSettings: Settings, newSettings: Settings): FixtureLoss {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.initialTemperature = this.convertVal(loss.initialTemperature, 'C', 'F');
      loss.finalTemperature = this.convertVal(loss.finalTemperature, 'C', 'F');
      loss.specificHeat = this.convertVal(loss.specificHeat, 'kJkgC', 'btulbF');
      loss.feedRate = this.convertVal(loss.feedRate, 'kg', 'lb');
    }
    else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.initialTemperature = this.convertVal(loss.initialTemperature, 'F', 'C');
      loss.finalTemperature = this.convertVal(loss.finalTemperature, 'F', 'C');
      loss.specificHeat = this.convertVal(loss.specificHeat, 'btulbF', 'kJkgC');
      loss.feedRate = this.convertVal(loss.feedRate, 'lb', 'kg');
    }
    return loss;
  }
  //flueGas
  convertFlueGas(loss: FlueGas, oldSettings: Settings, newSettings: Settings): FlueGas {
    if (loss.flueGasType === 'By Mass') {
      loss.flueGasByMass = this.convertFlueGasByMass(loss.flueGasByMass, oldSettings, newSettings);
    } else if (loss.flueGasType === 'By Volume') {
      loss.flueGasByVolume = this.convertFlueGasByVolume(loss.flueGasByVolume, oldSettings, newSettings);
    }
    return loss;
  }

  //flueGasLossByMass
  convertFlueGasByMass(loss: FlueGasByMass, oldSettings: Settings, newSettings: Settings): FlueGasByMass {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.combustionAirTemperature = this.convertVal(loss.combustionAirTemperature, 'C', 'F');
      loss.flueGasTemperature = this.convertVal(loss.flueGasTemperature, 'C', 'F');
      loss.ambientAirTemp = this.convertVal(loss.ambientAirTemp, 'C', 'F');
      loss.ashDischargeTemperature = this.convertVal(loss.ashDischargeTemperature, 'C', 'F');
      loss.fuelTemperature = this.convertVal(loss.fuelTemperature, 'C', 'F');
    }
    else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.combustionAirTemperature = this.convertVal(loss.combustionAirTemperature, 'F', 'C');
      loss.flueGasTemperature = this.convertVal(loss.flueGasTemperature, 'F', 'C');
      loss.ambientAirTemp = this.convertVal(loss.ambientAirTemp, 'F', 'C');
      loss.ashDischargeTemperature = this.convertVal(loss.ashDischargeTemperature, 'F', 'C');
      loss.fuelTemperature = this.convertVal(loss.fuelTemperature, 'F', 'C');
    }
    return loss;
  }
  //flueGasByVolume
  convertFlueGasByVolume(loss: FlueGasByVolume, oldSettings: Settings, newSettings: Settings): FlueGasByVolume {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.combustionAirTemperature = this.convertVal(loss.combustionAirTemperature, 'C', 'F');
      loss.flueGasTemperature = this.convertVal(loss.flueGasTemperature, 'C', 'F');
      loss.ambientAirTemp = this.convertVal(loss.ambientAirTemp, 'C', 'F');
      loss.fuelTemperature = this.convertVal(loss.fuelTemperature, 'C', 'F');
    }
    else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.combustionAirTemperature = this.convertVal(loss.combustionAirTemperature, 'F', 'C');
      loss.flueGasTemperature = this.convertVal(loss.flueGasTemperature, 'F', 'C');
      loss.ambientAirTemp = this.convertVal(loss.ambientAirTemp, 'F', 'C');
      loss.fuelTemperature = this.convertVal(loss.fuelTemperature, 'F', 'C');
    }
    return loss;
  }
  //leakageLoss
  convertLeakageLoss(loss: LeakageLoss, oldSettings: Settings, newSettings: Settings): LeakageLoss {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.draftPressure = this.convertVal(loss.draftPressure, 'Pa', 'inH2o');
      loss.openingArea = this.convertVal(loss.openingArea, 'm2', 'ft2');
      loss.ambientTemperature = this.convertVal(loss.ambientTemperature, 'C', 'F');
      loss.leakageGasTemperature = this.convertVal(loss.leakageGasTemperature, 'C', 'F');
    }
    else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.draftPressure = this.convertVal(loss.draftPressure, 'inH2o', 'Pa');
      loss.openingArea = this.convertVal(loss.openingArea, 'ft2', 'm2');
      loss.ambientTemperature = this.convertVal(loss.ambientTemperature, 'F', 'C');
      loss.leakageGasTemperature = this.convertVal(loss.leakageGasTemperature, 'F', 'C');
    }
    return loss;
  }
  //openingLoss
  convertOpeningLoss(loss: OpeningLoss, oldSettings: Settings, newSettings: Settings): OpeningLoss {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.ambientTemperature = this.convertVal(loss.ambientTemperature, 'C', 'F');
      loss.insideTemperature = this.convertVal(loss.insideTemperature, 'C', 'F');
      loss.thickness = this.convertVal(loss.thickness, 'mm', 'in');
      loss.heightOfOpening = this.convertVal(loss.heightOfOpening, 'mm', 'in');
      loss.lengthOfOpening = this.convertVal(loss.lengthOfOpening, 'mm', 'in');
    }
    else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.ambientTemperature = this.convertVal(loss.ambientTemperature, 'F', 'C');
      loss.insideTemperature = this.convertVal(loss.insideTemperature, 'F', 'C');
      loss.thickness = this.convertVal(loss.thickness, 'in', 'mm');
      loss.heightOfOpening = this.convertVal(loss.heightOfOpening, 'in', 'mm');
      loss.lengthOfOpening = this.convertVal(loss.lengthOfOpening, 'in', 'mm');
    }
    return loss;
  }
  //otherLoss
  convertOtherLoss(loss: OtherLoss, oldSettings: Settings, newSettings: Settings): OtherLoss {
    //heatLoss
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.heatLoss = this.convertVal(loss.heatLoss, 'kJ', 'Btu');
    }
    else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.heatLoss = this.convertVal(loss.heatLoss, 'Btu', 'kJ');
    }
    return loss;
  }
  //slag
  convertSlag(loss: Slag, oldSettings: Settings, newSettings: Settings): Slag {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.weight = this.convertVal(loss.weight, 'kg', 'lb');
      loss.inletTemperature = this.convertVal(loss.inletTemperature, 'C', 'F');
      loss.outletTemperature = this.convertVal(loss.outletTemperature, 'C', 'F');
      loss.specificHeat = this.convertVal(loss.specificHeat, 'kJkgC', 'btulbF');
    }
    else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.weight = this.convertVal(loss.weight, 'lb', 'kg');
      loss.inletTemperature = this.convertVal(loss.inletTemperature, 'F', 'C');
      loss.outletTemperature = this.convertVal(loss.outletTemperature, 'F', 'C');
      loss.specificHeat = this.convertVal(loss.specificHeat, 'btulbF', 'kJkgC');
    }
    return loss;
  }
  //wallLoss
  convertWallLoss(loss: WallLoss, oldSettings: Settings, newSettings: Settings): WallLoss {
    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      loss.ambientTemperature = this.convertVal(loss.ambientTemperature, 'C', 'F');
      loss.surfaceTemperature = this.convertVal(loss.surfaceTemperature, 'C', 'F');
      loss.windVelocity = this.convertVal(loss.windVelocity, 'km/h', 'mph');
      loss.surfaceArea = this.convertVal(loss.surfaceArea, 'm2', 'ft2');
    }
    else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
      loss.ambientTemperature = this.convertVal(loss.ambientTemperature, 'F', 'C');
      loss.surfaceTemperature = this.convertVal(loss.surfaceTemperature, 'F', 'C');
      loss.windVelocity = this.convertVal(loss.windVelocity, 'mph', 'km/h');
      loss.surfaceArea = this.convertVal(loss.surfaceArea, 'ft2', 'm2');
    }
    return loss;
  }

  //operating costs
  convertOperatingCosts(operatingCosts: OperatingCosts, oldSettings: Settings, newSettings: Settings): OperatingCosts {
    //electricity always kWh
    let conversionHelper: number = this.convertUnitsService.value(1).from(oldSettings.energyResultUnit).to(newSettings.energyResultUnit);
    operatingCosts.fuelCost = this.roundVal(operatingCosts.fuelCost / conversionHelper, 3);
    operatingCosts.steamCost = this.roundVal(operatingCosts.steamCost / conversionHelper, 3);

    if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
      operatingCosts.coalCarbonCost = this.convertVal(operatingCosts.coalCarbonCost, 'kg', 'lb');
      operatingCosts.electrodeCost = this.convertVal(operatingCosts.electrodeCost, 'kg', 'lb');
      operatingCosts.otherFuelCost = this.convertVal(operatingCosts.otherFuelCost, 'GJ', 'MMBtu');
    } else if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') { 
      operatingCosts.coalCarbonCost = this.convertVal(operatingCosts.coalCarbonCost, 'lb', 'kg');
      operatingCosts.electrodeCost = this.convertVal(operatingCosts.electrodeCost, 'lb', 'kg');
      operatingCosts.otherFuelCost = this.convertVal(operatingCosts.otherFuelCost, 'MMBtu', 'GJ');
    }
    
    return operatingCosts;
  }

  convertCO2SavingsData(co2SavingsData: PhastCo2SavingsData, oldSettings: Settings, newSettings: Settings): PhastCo2SavingsData {
    let oldFuelUnit: string = 'MMBtu'; 
    let newFuelUnit: string = 'GJ';
    if (oldSettings.unitsOfMeasure !== 'Imperial') {
      oldFuelUnit = 'GJ';
      newFuelUnit = 'MMBtu';
    } 

    co2SavingsData.totalFuelEmissionOutputRate = this.convertUnitsService.convertInvertedEnergy(co2SavingsData.totalFuelEmissionOutputRate, oldFuelUnit, newFuelUnit);
     
    if (oldSettings.energySourceType === 'Electricity') {
      let conversionHelper: number = this.convertUnitsService.value(1).from(oldSettings.energyResultUnit).to(newSettings.energyResultUnit);
      co2SavingsData.totalEmissionOutputRate = co2SavingsData.totalEmissionOutputRate / conversionHelper;
      co2SavingsData.totalEmissionOutputRate = this.roundVal(co2SavingsData.totalEmissionOutputRate, 2);

      if (oldSettings.furnaceType === 'Electric Arc Furnace (EAF)') {
        co2SavingsData.totalCoalEmissionOutputRate = this.convertUnitsService.convertInvertedEnergy(co2SavingsData.totalCoalEmissionOutputRate, oldFuelUnit, newFuelUnit);
        co2SavingsData.totalNaturalGasEmissionOutputRate = this.convertUnitsService.convertInvertedEnergy(co2SavingsData.totalNaturalGasEmissionOutputRate, oldFuelUnit, newFuelUnit);
        co2SavingsData.totalOtherEmissionOutputRate = this.convertUnitsService.convertInvertedEnergy(co2SavingsData.totalOtherEmissionOutputRate, oldFuelUnit, newFuelUnit);
      }
    }
    return co2SavingsData;
  }
  
  convertExistingData(phast: PHAST, oldSettings: Settings, settings: Settings): PHAST {
    phast.losses = this.convertPhastLosses(phast.losses, oldSettings, settings);
    if (phast.meteredEnergy) {
      phast.meteredEnergy = this.convertMeteredEnergy(phast.meteredEnergy, oldSettings, settings);
    }
    if (phast.designedEnergy) {
      phast.designedEnergy = this.convertDesignedEnergy(phast.designedEnergy, oldSettings, settings);
    }
    phast.operatingCosts = this.convertOperatingCosts(phast.operatingCosts, oldSettings, settings);
    phast.co2SavingsData = this.convertCO2SavingsData(phast.co2SavingsData, oldSettings, settings);
    if (phast.modifications) {
      phast.modifications.forEach(mod => {
        if (mod.phast.losses) {
          mod.phast.losses = this.convertPhastLosses(mod.phast.losses, oldSettings, settings);
        }
        if (mod.phast.meteredEnergy) {
          mod.phast.meteredEnergy = this.convertMeteredEnergy(mod.phast.meteredEnergy, oldSettings, settings);
        }
        if (mod.phast.designedEnergy) {
          mod.phast.designedEnergy = this.convertDesignedEnergy(mod.phast.designedEnergy, oldSettings, settings);
        }
        mod.phast.operatingCosts = this.convertOperatingCosts(mod.phast.operatingCosts, oldSettings, settings);
        mod.phast.co2SavingsData = this.convertCO2SavingsData(mod.phast.co2SavingsData, oldSettings, settings);
      });
    }
    
    return phast;
  }
}
