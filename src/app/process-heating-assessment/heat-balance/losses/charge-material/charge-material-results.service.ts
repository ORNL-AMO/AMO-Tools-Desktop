import { Injectable, inject } from '@angular/core';
import { ConvertValue } from '../../../../shared/convert-units/ConvertValue';
import { Settings } from '../../../../shared/models/settings';
import {
  ChargeMaterial,
  ChargeMaterialResult,
  GasChargeMaterial,
  LiquidChargeMaterial,
  SolidChargeMaterial,
  ThermicReactionType,
} from '../../../../shared/models/phast/losses/chargeMaterial';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';

export interface ChargeMaterialResultEntry {
  material: ChargeMaterial;
  valid: boolean;
}

@Injectable()
export class ChargeMaterialResultsService {
  private readonly processHeatingApiService = inject(ProcessHeatingApiService);

  getResults(entries: ChargeMaterialResultEntry[], settings: Settings): ChargeMaterialResult[] {
    return entries.map(entry => {
      if (!entry.valid) return {};
      switch (entry.material.chargeMaterialType) {
        case 'Gas': return this.gasResult(entry.material.gasChargeMaterial, settings);
        case 'Liquid': return this.liquidResult(entry.material.liquidChargeMaterial, settings);
        case 'Solid': return this.solidResult(entry.material.solidChargeMaterial, settings);
        default: return {};
      }
    });
  }

  private gasResult(input: GasChargeMaterial, settings: Settings): ChargeMaterialResult {
    const inputs = this.createInputCopy(input);
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.initialTemperature = new ConvertValue(inputs.initialTemperature, 'C', 'F').convertedValue;
      inputs.dischargeTemperature = new ConvertValue(inputs.dischargeTemperature, 'C', 'F').convertedValue;
      inputs.feedRate = new ConvertValue(inputs.feedRate, 'kg', 'lb').convertedValue;
      inputs.reactionHeat = new ConvertValue(inputs.reactionHeat, 'kJkg', 'btuLb').convertedValue;
      inputs.additionalHeat = new ConvertValue(inputs.additionalHeat, 'kJ', 'Btu').convertedValue;
      inputs.specificHeatVapor = new ConvertValue(inputs.specificHeatVapor, 'kJkgC', 'btulbF').convertedValue;
      inputs.specificHeatGas = new ConvertValue(inputs.specificHeatGas, 'kJkgC', 'btulbF').convertedValue;
    }
    const netHeatLoss = this.convertResult(this.processHeatingApiService.gasLoadChargeMaterial(inputs), settings.energyResultUnit);
    return this.assembleResult(input, netHeatLoss, inputs.feedRate, inputs.reactionHeat, input.percentReacted, settings.energyResultUnit);
  }

  private liquidResult(input: LiquidChargeMaterial, settings: Settings): ChargeMaterialResult {
    const inputs = this.createInputCopy(input);
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.vaporizingTemperature = new ConvertValue(inputs.vaporizingTemperature, 'C', 'F').convertedValue;
      inputs.latentHeat = new ConvertValue(inputs.latentHeat, 'kJkg', 'btuLb').convertedValue;
      inputs.initialTemperature = new ConvertValue(inputs.initialTemperature, 'C', 'F').convertedValue;
      inputs.dischargeTemperature = new ConvertValue(inputs.dischargeTemperature, 'C', 'F').convertedValue;
      inputs.chargeFeedRate = new ConvertValue(inputs.chargeFeedRate, 'kg', 'lb').convertedValue;
      inputs.reactionHeat = new ConvertValue(inputs.reactionHeat, 'kJkg', 'btuLb').convertedValue;
      inputs.additionalHeat = new ConvertValue(inputs.additionalHeat, 'kJ', 'Btu').convertedValue;
      inputs.specificHeatLiquid = new ConvertValue(inputs.specificHeatLiquid, 'kJkgC', 'btulbF').convertedValue;
      inputs.specificHeatVapor = new ConvertValue(inputs.specificHeatVapor, 'kJkgC', 'btulbF').convertedValue;
    }
    const netHeatLoss = this.convertResult(this.processHeatingApiService.liquidLoadChargeMaterial(inputs), settings.energyResultUnit);
    return this.assembleResult(input, netHeatLoss, inputs.chargeFeedRate, inputs.reactionHeat, input.percentReacted, settings.energyResultUnit);
  }

  private solidResult(input: SolidChargeMaterial, settings: Settings): ChargeMaterialResult {
    const inputs = this.createInputCopy(input);
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.meltingPoint = new ConvertValue(inputs.meltingPoint, 'C', 'F').convertedValue;
      inputs.initialTemperature = new ConvertValue(inputs.initialTemperature, 'C', 'F').convertedValue;
      inputs.dischargeTemperature = new ConvertValue(inputs.dischargeTemperature, 'C', 'F').convertedValue;
      inputs.waterVaporDischargeTemperature = new ConvertValue(inputs.waterVaporDischargeTemperature, 'C', 'F').convertedValue;
      inputs.chargeFeedRate = new ConvertValue(inputs.chargeFeedRate, 'kg', 'lb').convertedValue;
      inputs.reactionHeat = new ConvertValue(inputs.reactionHeat, 'kJkg', 'btuLb').convertedValue;
      inputs.additionalHeat = new ConvertValue(inputs.additionalHeat, 'kJ', 'Btu').convertedValue;
      inputs.specificHeatLiquid = new ConvertValue(inputs.specificHeatLiquid, 'kJkgC', 'btulbF').convertedValue;
      inputs.specificHeatSolid = new ConvertValue(inputs.specificHeatSolid, 'kJkgC', 'btulbF').convertedValue;
      inputs.latentHeat = new ConvertValue(inputs.latentHeat, 'kJkg', 'btuLb').convertedValue;
    }
    const netHeatLoss = this.convertResult(this.processHeatingApiService.solidLoadChargeMaterial(inputs), settings.energyResultUnit);
    const waterContentFactor = 1 - (inputs.waterContentCharged ?? 0) / 100;
    return this.assembleResult(input, netHeatLoss, inputs.chargeFeedRate, inputs.reactionHeat * waterContentFactor, input.chargeReacted, settings.energyResultUnit);
  }

  private assembleResult(
    input: GasChargeMaterial | LiquidChargeMaterial | SolidChargeMaterial,
    netHeatLoss: number,
    feedRate: number,
    reactionHeat: number,
    percentReacted: number,
    energyResultUnit: string,
  ): ChargeMaterialResult {
    const isEndothermic = input.thermicReactionType === ThermicReactionType.Endothermic;
    const reactionFraction = isEndothermic ? percentReacted / 100 : -percentReacted / 100;
    const endoExoHeat = new ConvertValue(reactionFraction * feedRate * reactionHeat, 'Btu', energyResultUnit).convertedValue;
    const grossHeatLoss = isEndothermic ? netHeatLoss : netHeatLoss + endoExoHeat;
    return {
      netHeatLoss: isEndothermic ? netHeatLoss - endoExoHeat : netHeatLoss,
      endoExoHeat,
      heatRequired: grossHeatLoss,
    };
  }

  private createInputCopy<T>(input: T): T {
    return input ? JSON.parse(JSON.stringify(input)) : input;
  }

  private convertResult(value: number, toUnit: string): number {
    return isNaN(value) ? 0 : new ConvertValue(value, 'Btu', toUnit).convertedValue;
  }
}
