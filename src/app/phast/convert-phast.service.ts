import { Injectable } from '@angular/core';
import { EnergyEquivalencyElectric, EnergyEquivalencyFuel } from '../shared/models/phast/energyEquivalency';
import { O2Enrichment } from '../shared/models/phast/o2Enrichment';
import { FlowCalculations } from '../shared/models/phast/flowCalculations';
import { ExhaustGasEAF } from '../shared/models/phast/losses/exhaustGasEAF';
import { PHAST, Losses } from '../shared/models/phast/phast';
import { FixtureLoss } from '../shared/models/phast/losses/fixtureLoss';
import { GasCoolingLoss, LiquidCoolingLoss, WaterCoolingLoss, CoolingLoss } from '../shared/models/phast/losses/coolingLoss';
import { GasChargeMaterial, LiquidChargeMaterial, SolidChargeMaterial, ChargeMaterial } from '../shared/models/phast/losses/chargeMaterial';
import { OpeningLoss, CircularOpeningLoss, QuadOpeningLoss } from '../shared/models/phast/losses/openingLoss';
import { WallLoss } from '../shared/models/phast/losses/wallLoss';
import { LeakageLoss } from '../shared/models/phast/losses/leakageLoss';
import { AtmosphereLoss } from '../shared/models/phast/losses/atmosphereLoss';
import { Slag } from '../shared/models/phast/losses/slag';
import { AuxiliaryPowerLoss } from '../shared/models/phast/losses/auxiliaryPowerLoss';
import { EnergyInputEAF } from '../shared/models/phast/losses/energyInputEAF';
import { FlueGasByMass, FlueGasByVolume, FlueGas } from '../shared/models/phast/losses/flueGas';
import { ExtendedSurface } from '../shared/models/phast/losses/extendedSurface';
import { OtherLoss } from '../shared/models/phast/losses/otherLoss';
import { EnergyInputExhaustGasLoss } from '../shared/models/phast/losses/energyInputExhaustGasLosses';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
@Injectable()
export class ConvertPhastService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertPhastLosses(losses: Losses, oldSettings: Settings, newSettings: Settings): Losses {
    let convertedLosses: Losses = JSON.parse(JSON.stringify(losses));
    if (convertedLosses.atmosphereLosses) {
      convertedLosses.atmosphereLosses.forEach(loss => {
        loss = this.convertAtmosphereLosses(loss, oldSettings, newSettings);
      })
    }
    if (convertedLosses.chargeMaterials) {
      convertedLosses.chargeMaterials.forEach(loss => {
        loss = this.convertChargeMaterial(loss, oldSettings, newSettings);
      })
    }
    if (convertedLosses.coolingLosses) {
      convertedLosses.coolingLosses.forEach(loss => {
        loss = this.convertCoolingLoss(loss, oldSettings, newSettings);
      })
    }
    if (convertedLosses.energyInputEAF) {
      convertedLosses.energyInputEAF.forEach(loss => {
        loss = this.convertEnergyInputEAF(loss, oldSettings, newSettings);
      })
    }
    if (convertedLosses.exhaustGasEAF) {
      convertedLosses.exhaustGasEAF.forEach(loss => {
        loss = this.convertExhaustGasEAF(loss, oldSettings, newSettings);
      })
    }
    if (convertedLosses.energyInputExhaustGasLoss) {
      convertedLosses.energyInputExhaustGasLoss.forEach(loss => {
        loss = this.convertEnergyInputExhaustGasLoss(loss, oldSettings, newSettings);
      })
    }
    if (convertedLosses.extendedSurfaces) {
      convertedLosses.extendedSurfaces.forEach(loss => {
        loss = this.convertExtendedSurface(loss, oldSettings, newSettings);
      })
    }
    if (convertedLosses.fixtureLosses) {
      convertedLosses.fixtureLosses.forEach(loss => {
        loss = this.convertFixtureLoss(loss, oldSettings, newSettings);
      })
    }
    if (convertedLosses.flueGasLosses) {
      convertedLosses.flueGasLosses.forEach(loss => {
        loss = this.convertFlueGas(loss, oldSettings, newSettings);
      })
    }
    if (convertedLosses.leakageLosses) {
      convertedLosses.leakageLosses.forEach(loss => {
        loss = this.convertLeakageLoss(loss, oldSettings, newSettings);
      })
    }
    if (convertedLosses.openingLosses) {
      convertedLosses.openingLosses.forEach(loss => {
        loss = this.convertOpeningLoss(loss, oldSettings, newSettings);
      })
    }
    if (convertedLosses.otherLosses) {
      convertedLosses.otherLosses.forEach(loss => {
        loss = this.convertOtherLoss(loss, oldSettings, newSettings);
      })
    }
    if (convertedLosses.slagLosses) {
      convertedLosses.slagLosses.forEach(loss => {
        loss = this.convertSlag(loss, oldSettings, newSettings);
      })
    }
    if (convertedLosses.wallLosses) {
      convertedLosses.wallLosses.forEach(loss => {
        loss = this.convertWallLoss(loss, oldSettings, newSettings);
      })
    }
    return convertedLosses;
  }
  //atmosphere
  convertAtmosphereLosses(loss: AtmosphereLoss, oldSettings: Settings, newSettings: Settings): AtmosphereLoss {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {
      loss.inletTemperature = this.convertUnitsService.value(loss.inletTemperature).from('C').to('F');
      loss.outletTemperature = this.convertUnitsService.value(loss.inletTemperature).from('C').to('F');
      loss.flowRate = this.convertUnitsService.value(loss.flowRate).from('m3/h').to('ft3/h')
      loss.specificHeat = this.convertUnitsService.value(loss.specificHeat).from('kJm3C').to('btuScfF');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {
      loss.inletTemperature = this.convertUnitsService.value(loss.inletTemperature).from('F').to('C');
      loss.outletTemperature = this.convertUnitsService.value(loss.inletTemperature).from('F').to('C');
      loss.flowRate = this.convertUnitsService.value(loss.flowRate).from('ft3/h').to('m3/h')
      loss.specificHeat = this.convertUnitsService.value(loss.specificHeat).from('btuScfF').to('kJm3C');
    }
    return loss;
  }
  //chargeMaterial
  convertChargeMaterial(loss: ChargeMaterial, oldSettings: Settings, newSettings: Settings): ChargeMaterial {
    if (loss.chargeMaterialType == 'Solid') {
      loss = this.convertSolidChargeMaterial(loss, oldSettings, newSettings);
    } else if (loss.chargeMaterialType == 'Gas') {
      loss = this.convertGasChargeMaterial(loss, oldSettings, newSettings);
    } else if (loss.chargeMaterialType == 'Liquid') {
      loss = this.convertLiquidChargeMaterial(loss, oldSettings, newSettings);
    }
    return loss;
  }
  //liquidChargeMaterial
  convertLiquidChargeMaterial(loss: LiquidChargeMaterial, oldSettings: Settings, newSettings: Settings): LiquidChargeMaterial {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {
      loss.vaporizingTemperature = this.convertUnitsService.value(loss.vaporizingTemperature).from('C').to('F');
      loss.latentHeat = this.convertUnitsService.value(loss.latentHeat).from('C').to('F');
      loss.initialTemperature = this.convertUnitsService.value(loss.initialTemperature).from('C').to('F');
      loss.dischargeTemperature = this.convertUnitsService.value(loss.dischargeTemperature).from('C').to('F');
      loss.chargeFeedRate = this.convertUnitsService.value(loss.chargeFeedRate).from('kg').to('lb')
      loss.reactionHeat = this.convertUnitsService.value(loss.reactionHeat).from('kJkg').to('btuLb');
      loss.additionalHeat = this.convertUnitsService.value(loss.additionalHeat).from('kJkg').to('btuLb');
      loss.specificHeatLiquid = this.convertUnitsService.value(loss.specificHeatLiquid).from('kJkgC').to('btulbF');
      loss.specificHeatVapor = this.convertUnitsService.value(loss.specificHeatVapor).from('kJkgC').to('btulbF');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {
      loss.vaporizingTemperature = this.convertUnitsService.value(loss.vaporizingTemperature).from('F').to('C');
      loss.latentHeat = this.convertUnitsService.value(loss.latentHeat).from('F').to('C');
      loss.initialTemperature = this.convertUnitsService.value(loss.initialTemperature).from('F').to('C');
      loss.dischargeTemperature = this.convertUnitsService.value(loss.dischargeTemperature).from('F').to('C');
      loss.chargeFeedRate = this.convertUnitsService.value(loss.chargeFeedRate).from('lb').to('kg')
      loss.reactionHeat = this.convertUnitsService.value(loss.reactionHeat).from('btuLb').to('kJkg');
      loss.additionalHeat = this.convertUnitsService.value(loss.additionalHeat).from('btuLb').to('kJkg');
      loss.specificHeatLiquid = this.convertUnitsService.value(loss.specificHeatLiquid).from('btulbF').to('kJkgC');
      loss.specificHeatVapor = this.convertUnitsService.value(loss.specificHeatVapor).from('btulbF').to('kJkgC');
    }
    return loss;
  }
  //solidChargeMaterial
  convertSolidChargeMaterial(loss: SolidChargeMaterial, oldSettings: Settings, newSettings: Settings): SolidChargeMaterial {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {
      loss.meltingPoint = this.convertUnitsService.value(loss.meltingPoint).from('C').to('F');
      loss.initialTemperature = this.convertUnitsService.value(loss.initialTemperature).from('C').to('F');
      loss.dischargeTemperature = this.convertUnitsService.value(loss.dischargeTemperature).from('C').to('F');
      loss.waterVaporDischargeTemperature = this.convertUnitsService.value(loss.waterVaporDischargeTemperature).from('C').to('F');
      loss.chargeFeedRate = this.convertUnitsService.value(loss.chargeFeedRate).from('kg').to('lb');
      loss.reactionHeat = this.convertUnitsService.value(loss.reactionHeat).from('kJkg').to('btuLb');
      loss.additionalHeat = this.convertUnitsService.value(loss.additionalHeat).from('kJkg').to('btuLb');
      loss.specificHeatLiquid = this.convertUnitsService.value(loss.specificHeatLiquid).from('kJkgC').to('btulbF');
      loss.specificHeatSolid = this.convertUnitsService.value(loss.specificHeatSolid).from('kJkgC').to('btulbF');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {
      loss.meltingPoint = this.convertUnitsService.value(loss.meltingPoint).from('F').to('C');
      loss.initialTemperature = this.convertUnitsService.value(loss.initialTemperature).from('F').to('C');
      loss.dischargeTemperature = this.convertUnitsService.value(loss.dischargeTemperature).from('F').to('C');
      loss.waterVaporDischargeTemperature = this.convertUnitsService.value(loss.waterVaporDischargeTemperature).from('F').to('C');
      loss.chargeFeedRate = this.convertUnitsService.value(loss.chargeFeedRate).from('lb').to('kg');
      loss.reactionHeat = this.convertUnitsService.value(loss.reactionHeat).from('btuLb').to('kJkg');
      loss.additionalHeat = this.convertUnitsService.value(loss.additionalHeat).from('btuLb').to('kJkg');
      loss.specificHeatLiquid = this.convertUnitsService.value(loss.specificHeatLiquid).from('btulbF').to('kJkgC');
      loss.specificHeatSolid = this.convertUnitsService.value(loss.specificHeatSolid).from('btulbF').to('kJkgC');
    }
    return loss;
  }
  //gasChargeMaterial
  convertGasChargeMaterial(loss: GasChargeMaterial, oldSettings: Settings, newSettings: Settings): GasChargeMaterial {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {
      loss.initialTemperature = this.convertUnitsService.value(loss.initialTemperature).from('C').to('F');
      loss.dischargeTemperature = this.convertUnitsService.value(loss.dischargeTemperature).from('C').to('F');
      loss.feedRate = this.convertUnitsService.value(loss.feedRate).from('kg').to('lb')
      loss.reactionHeat = this.convertUnitsService.value(loss.reactionHeat).from('kJkg').to('btuLb');
      loss.additionalHeat = this.convertUnitsService.value(loss.additionalHeat).from('kJkg').to('btuLb');
      loss.specificHeatVapor = this.convertUnitsService.value(loss.specificHeatVapor).from('kJkgC').to('btulbF');
      loss.specificHeatGas = this.convertUnitsService.value(loss.specificHeatGas).from('kJkgC').to('btulbF');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {
      loss.initialTemperature = this.convertUnitsService.value(loss.initialTemperature).from('F').to('C');
      loss.dischargeTemperature = this.convertUnitsService.value(loss.dischargeTemperature).from('F').to('C');
      loss.feedRate = this.convertUnitsService.value(loss.feedRate).from('lb').to('lb')
      loss.reactionHeat = this.convertUnitsService.value(loss.reactionHeat).from('btuLb').to('kJkg');
      loss.additionalHeat = this.convertUnitsService.value(loss.additionalHeat).from('btuLb').to('kJkg');
      loss.specificHeatVapor = this.convertUnitsService.value(loss.specificHeatVapor).from('btulbF').to('kJkgC');
      loss.specificHeatGas = this.convertUnitsService.value(loss.specificHeatGas).from('btulbF').to('kJkgC');
    }
    return loss;
  }
  //coolingLoss
  convertCoolingLoss(loss: CoolingLoss, oldSettings: Settings, newSettings: Settings): CoolingLoss {
    if (loss.coolingLossType == 'Gas') {
      loss = this.convertGasCoolingLoss(loss, oldSettings, newSettings);
    } else if (loss.coolingLossType == 'Liquid') {
      loss = this.convertLiquidCoolingLoss(loss, oldSettings, newSettings);
    }
    return loss;
  }
  //gasCoolingLoss
  convertGasCoolingLoss(loss: GasCoolingLoss, oldSettings: Settings, newSettings: Settings): GasCoolingLoss {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {
      loss.specificHeat = this.convertUnitsService.value(loss.specificHeat).from('kJkgC').to('btulbF');
      loss.flowRate = this.convertUnitsService.value(loss.flowRate).from('m3').to('ft3');
      loss.finalTemperature = this.convertUnitsService.value(loss.finalTemperature).from('C').to('F');
      loss.initialTemperature = this.convertUnitsService.value(loss.initialTemperature).from('C').to('F');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {
      loss.specificHeat = this.convertUnitsService.value(loss.specificHeat).from('btulbF').to('kJkgC');
      loss.flowRate = this.convertUnitsService.value(loss.flowRate).from('ft3').to('m3');
      loss.finalTemperature = this.convertUnitsService.value(loss.finalTemperature).from('F').to('C');
      loss.initialTemperature = this.convertUnitsService.value(loss.initialTemperature).from('F').to('C');
    }
    return loss;
  }
  //liquidCoolingLoss
  convertLiquidCoolingLoss(loss: LiquidCoolingLoss, oldSettings: Settings, newSettings: Settings): LiquidCoolingLoss {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {
      loss.specificHeat = this.convertUnitsService.value(loss.specificHeat).from('kJkgC').to('btulbF');
      loss.density = this.convertUnitsService.value(loss.density).from('kgNm3').to('lbscf');
      loss.flowRate = this.convertUnitsService.value(loss.flowRate).from('L').to('gal');
      loss.initialTemperature = this.convertUnitsService.value(loss.initialTemperature).from('C').to('F');
      loss.outletTemperature = this.convertUnitsService.value(loss.outletTemperature).from('C').to('F');
    } else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {
      loss.specificHeat = this.convertUnitsService.value(loss.specificHeat).from('btulbF').to('kJkgC');
      loss.density = this.convertUnitsService.value(loss.density).from('lbscf').to('kgNm3');
      loss.flowRate = this.convertUnitsService.value(loss.flowRate).from('gal').to('L');
      loss.initialTemperature = this.convertUnitsService.value(loss.initialTemperature).from('F').to('C');
      loss.outletTemperature = this.convertUnitsService.value(loss.outletTemperature).from('F').to('C');
    }
    return loss;
  }
  //energyInputEAF
  convertEnergyInputEAF(loss: EnergyInputEAF, oldSettings: Settings, newSettings: Settings): EnergyInputEAF {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {
      loss.naturalGasHeatInput = this.convertUnitsService.value(loss.naturalGasHeatInput).from('GJ').to('MMBTU');
      loss.otherFuels = this.convertUnitsService.value(loss.otherFuels).from('GJ').to('MMBTU');
      loss.coalCarbonInjection = this.convertUnitsService.value(loss.coalCarbonInjection).from('kg').to('lb');
      loss.coalHeatingValue = this.convertUnitsService.value(loss.coalHeatingValue).from('kJkg').to('btuLb');
      loss.electrodeHeatingValue = this.convertUnitsService.value(loss.electrodeHeatingValue).from('kJkg').to('btuLb');
      loss.electrodeUse = this.convertUnitsService.value(loss.electrodeUse).from('kg').to('lb');
    }
    else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {
      loss.naturalGasHeatInput = this.convertUnitsService.value(loss.naturalGasHeatInput).from('MMBTU').to('GJ');
      loss.otherFuels = this.convertUnitsService.value(loss.otherFuels).from('MMBTU').to('GJ');
      loss.coalCarbonInjection = this.convertUnitsService.value(loss.coalCarbonInjection).from('lb').to('kg');
      loss.coalHeatingValue = this.convertUnitsService.value(loss.coalHeatingValue).from('btuLb').to('kJkg');
      loss.electrodeHeatingValue = this.convertUnitsService.value(loss.electrodeHeatingValue).from('btuLb').to('kJkg');
      loss.electrodeUse = this.convertUnitsService.value(loss.electrodeUse).from('lb').to('kg');
    }
    return loss;
  }
  //exhaustGasEAF
  convertExhaustGasEAF(loss: ExhaustGasEAF, oldSettings: Settings, newSettings: Settings): ExhaustGasEAF {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {
      loss.offGasTemp = this.convertUnitsService.value(loss.offGasTemp).from('C').to('F');
      loss.vfr = this.convertUnitsService.value(loss.vfr).from('m3').to('ft3');
      loss.dustLoading = this.convertUnitsService.value(loss.dustLoading).from('kgNm3').to('lbscf');
    }
    else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {
      loss.offGasTemp = this.convertUnitsService.value(loss.offGasTemp).from('F').to('C');
      loss.vfr = this.convertUnitsService.value(loss.vfr).from('ft3').to('m3');
      loss.dustLoading = this.convertUnitsService.value(loss.dustLoading).from('lbscf').to('kgNm3');
    }
    return loss;
  }
  //energyInputExhaustGasLoss
  convertEnergyInputExhaustGasLoss(loss: EnergyInputExhaustGasLoss, oldSettings: Settings, newSettings: Settings): EnergyInputExhaustGasLoss {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {
      loss.combustionAirTemp = this.convertUnitsService.value(loss.combustionAirTemp).from('C').to('F');
      loss.exhaustGasTemp = this.convertUnitsService.value(loss.exhaustGasTemp).from('C').to('F');
      loss.totalHeatInput = this.convertUnitsService.value(loss.totalHeatInput).from('kJ').to('Btu');
    }
    else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {
      loss.combustionAirTemp = this.convertUnitsService.value(loss.combustionAirTemp).from('F').to('C');
      loss.exhaustGasTemp = this.convertUnitsService.value(loss.exhaustGasTemp).from('F').to('C');
      loss.totalHeatInput = this.convertUnitsService.value(loss.totalHeatInput).from('Btu').to('kJ');
    }
    return loss;
  }
  //extendedSurface
  convertExtendedSurface(loss: ExtendedSurface, oldSettings: Settings, newSettings: Settings): ExtendedSurface {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {
      loss.ambientTemperature = this.convertUnitsService.value(loss.ambientTemperature).from('C').to('F');
      loss.surfaceTemperature = this.convertUnitsService.value(loss.surfaceTemperature).from('C').to('F');
      loss.surfaceArea = this.convertUnitsService.value(loss.surfaceArea).from('m2').to('ft2');
    }
    else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {
      loss.ambientTemperature = this.convertUnitsService.value(loss.ambientTemperature).from('F').to('C');
      loss.surfaceTemperature = this.convertUnitsService.value(loss.surfaceTemperature).from('F').to('C');
      loss.surfaceArea = this.convertUnitsService.value(loss.surfaceArea).from('ft2').to('m2');
    }
    return loss;
  }
  //fixtureLoss
  convertFixtureLoss(loss: FixtureLoss, oldSettings: Settings, newSettings: Settings): FixtureLoss {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {
      loss.initialTemperature = this.convertUnitsService.value(loss.initialTemperature).from('C').to('F');
      loss.finalTemperature = this.convertUnitsService.value(loss.finalTemperature).from('C').to('F');
      loss.specificHeat = this.convertUnitsService.value(loss.specificHeat).from('kJkgC').to('btulbF');
      loss.feedRate = this.convertUnitsService.value(loss.feedRate).from('kg').to('lb');
    }
    else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {
      loss.initialTemperature = this.convertUnitsService.value(loss.initialTemperature).from('F').to('C');
      loss.finalTemperature = this.convertUnitsService.value(loss.finalTemperature).from('F').to('C');
      loss.specificHeat = this.convertUnitsService.value(loss.specificHeat).from('btulbF').to('kJkgC');
      loss.feedRate = this.convertUnitsService.value(loss.feedRate).from('lb').to('kg');
    }
    return loss;
  }
  //flueGas
  convertFlueGas(loss: FlueGas, oldSettings: Settings, newSettings: Settings): FlueGas {
    if (loss.flueGasType == 'By Mass') {
      loss = this.convertFlueGasByMass(loss, oldSettings, newSettings);
    } else if (loss.flueGasType == 'By Volume') {
      loss = this.convertFlueGasByVolume(loss, oldSettings, newSettings);
    }
    return loss;
  }

  //flueGasLossByMass
  convertFlueGasByMass(loss: FlueGasByMass, oldSettings: Settings, newSettings: Settings): FlueGasByMass {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {
      loss.combustionAirTemperature = this.convertUnitsService.value(loss.combustionAirTemperature).from('C').to('F');
      loss.flueGasTemperature = this.convertUnitsService.value(loss.flueGasTemperature).from('C').to('F');
      loss.ashDischargeTemperature = this.convertUnitsService.value(loss.ashDischargeTemperature).from('C').to('F');
      loss.fuelTemperature = this.convertUnitsService.value(loss.fuelTemperature).from('C').to('F');
    }
    else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {
      loss.combustionAirTemperature = this.convertUnitsService.value(loss.combustionAirTemperature).from('F').to('C');
      loss.flueGasTemperature = this.convertUnitsService.value(loss.flueGasTemperature).from('F').to('C');
      loss.ashDischargeTemperature = this.convertUnitsService.value(loss.ashDischargeTemperature).from('F').to('C');
      loss.fuelTemperature = this.convertUnitsService.value(loss.fuelTemperature).from('F').to('C');
    }
    return loss;
  }
  //flueGasByVolume
  convertFlueGasByVolume(loss: FlueGasByVolume, oldSettings: Settings, newSettings: Settings): FlueGasByVolume {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {
      loss.combustionAirTemperature = this.convertUnitsService.value(loss.combustionAirTemperature).from('C').to('F');
      loss.flueGasTemperature = this.convertUnitsService.value(loss.flueGasTemperature).from('C').to('F');
    }
    else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {
      loss.combustionAirTemperature = this.convertUnitsService.value(loss.combustionAirTemperature).from('F').to('C');
      loss.flueGasTemperature = this.convertUnitsService.value(loss.flueGasTemperature).from('F').to('C');
    }
    return loss;
  }
  //leakageLoss
  convertLeakageLoss(loss: LeakageLoss, oldSettings: Settings, newSettings: Settings): LeakageLoss {
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {
      loss.draftPressure = this.convertUnitsService.value(loss.draftPressure).from('Pa').to('inH2o')
      loss.openingArea = this.convertUnitsService.value(loss.openingArea).from('m2').to('ft2');
      loss.ambientTemperature = this.convertUnitsService.value(loss.ambientTemperature).from('C').to('F');
      loss.leakageGasTemperature = this.convertUnitsService.value(loss.leakageGasTemperature).from('C').to('F');
    }
    else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {
      loss.draftPressure = this.convertUnitsService.value(loss.draftPressure).from('inH2o').to('Pa')
      loss.openingArea = this.convertUnitsService.value(loss.openingArea).from('ft2').to('m2');
      loss.ambientTemperature = this.convertUnitsService.value(loss.ambientTemperature).from('F').to('C');
      loss.leakageGasTemperature = this.convertUnitsService.value(loss.leakageGasTemperature).from('F').to('C');
    }
    return loss;
  }
  //openingLoss
  convertOpeningLoss(loss: OpeningLoss, oldSettings: Settings, newSettings: Settings): OpeningLoss {
    // wallThickness
    // lengthOfOpening
    // heightOfOpening
    // insideTemp
    // ambientTemp
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {
      loss.ambientTemperature = this.convertUnitsService.value(loss.ambientTemperature).from('C').to('F');
      loss.insideTemperature = this.convertUnitsService.value(loss.insideTemperature).from('C').to('F');
      loss.thickness = this.convertUnitsService.value(loss.thickness).from('mm').to('in');
      loss.heightOfOpening = this.convertUnitsService.value(loss.heightOfOpening).from('mm').to('in');
      loss.lengthOfOpening = this.convertUnitsService.value(loss.lengthOfOpening).from('mm').to('in');
    }
    else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {

    }
    return loss;
  }
  //otherLoss
  convertOtherLoss(loss: OtherLoss, oldSettings: Settings, newSettings: Settings): OtherLoss {
    //heatLoss
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {

    }
    else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {

    }
    return loss;
  }
  //slag
  convertSlag(loss: Slag, oldSettings: Settings, newSettings: Settings): Slag {
    // weight
    // inletTemperature
    // outletTemperature
    // specificHeat
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {

    }
    else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {

    }
    return loss;
  }
  //wallLoss
  convertWallLoss(loss: WallLoss, oldSettings: Settings, newSettings: Settings): WallLoss {
    // avgSurfaceTemp
    // ambientTemp
    // windVelocity
    // surfaceArea
    if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings == 'Metric') {

    }
    else if (oldSettings.unitsOfMeasure == 'Metric' && newSettings == 'Imperial') {

    }
    return loss;
  }
}
