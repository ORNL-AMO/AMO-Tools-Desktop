import { Injectable, inject } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import {
  ChargeMaterial,
  ChargeMaterialResult,
  GasChargeMaterial,
  LiquidChargeMaterial,
  SolidChargeMaterial,
  ThermicReactionType,
} from '../../../models/charge-material';
import { ProcessHeatingApiService } from '../../../../tools-suite-api/process-heating-api.service';

export interface ChargeMaterialResultEntry {
  material: ChargeMaterial;
  valid: boolean;
}

@Injectable()
export class ChargeMaterialResultsService {
  private readonly convertUnitsService = inject(ConvertUnitsService);
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
      inputs.initialTemperature = this.convertUnitsService.value(inputs.initialTemperature).from('C').to('F');
      inputs.dischargeTemperature = this.convertUnitsService.value(inputs.dischargeTemperature).from('C').to('F');
      inputs.feedRate = this.convertUnitsService.value(inputs.feedRate).from('kg').to('lb');
      inputs.reactionHeat = this.convertUnitsService.value(inputs.reactionHeat).from('kJkg').to('btuLb');
      inputs.additionalHeat = this.convertUnitsService.value(inputs.additionalHeat).from('kJ').to('Btu');
      inputs.specificHeatVapor = this.convertUnitsService.value(inputs.specificHeatVapor).from('kJkgC').to('btulbF');
      inputs.specificHeatGas = this.convertUnitsService.value(inputs.specificHeatGas).from('kJkgC').to('btulbF');
    }
    const netHeatLoss = this.convertResult(this.processHeatingApiService.gasLoadChargeMaterial(inputs), settings.energyResultUnit);
    return this.assembleResult(input, netHeatLoss, inputs.feedRate, inputs.reactionHeat, input.percentReacted, settings.energyResultUnit);
  }

  private liquidResult(input: LiquidChargeMaterial, settings: Settings): ChargeMaterialResult {
    const inputs = this.createInputCopy(input);
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.vaporizingTemperature = this.convertUnitsService.value(inputs.vaporizingTemperature).from('C').to('F');
      inputs.latentHeat = this.convertUnitsService.value(inputs.latentHeat).from('kJkg').to('btuLb');
      inputs.initialTemperature = this.convertUnitsService.value(inputs.initialTemperature).from('C').to('F');
      inputs.dischargeTemperature = this.convertUnitsService.value(inputs.dischargeTemperature).from('C').to('F');
      inputs.chargeFeedRate = this.convertUnitsService.value(inputs.chargeFeedRate).from('kg').to('lb');
      inputs.reactionHeat = this.convertUnitsService.value(inputs.reactionHeat).from('kJkg').to('btuLb');
      inputs.additionalHeat = this.convertUnitsService.value(inputs.additionalHeat).from('kJ').to('Btu');
      inputs.specificHeatLiquid = this.convertUnitsService.value(inputs.specificHeatLiquid).from('kJkgC').to('btulbF');
      inputs.specificHeatVapor = this.convertUnitsService.value(inputs.specificHeatVapor).from('kJkgC').to('btulbF');
    }
    const netHeatLoss = this.convertResult(this.processHeatingApiService.liquidLoadChargeMaterial(inputs), settings.energyResultUnit);
    return this.assembleResult(input, netHeatLoss, inputs.chargeFeedRate, inputs.reactionHeat, input.percentReacted, settings.energyResultUnit);
  }

  private solidResult(input: SolidChargeMaterial, settings: Settings): ChargeMaterialResult {
    const inputs = this.createInputCopy(input);
    if (settings.unitsOfMeasure === 'Metric') {
      inputs.meltingPoint = this.convertUnitsService.value(inputs.meltingPoint).from('C').to('F');
      inputs.initialTemperature = this.convertUnitsService.value(inputs.initialTemperature).from('C').to('F');
      inputs.dischargeTemperature = this.convertUnitsService.value(inputs.dischargeTemperature).from('C').to('F');
      inputs.waterVaporDischargeTemperature = this.convertUnitsService.value(inputs.waterVaporDischargeTemperature).from('C').to('F');
      inputs.chargeFeedRate = this.convertUnitsService.value(inputs.chargeFeedRate).from('kg').to('lb');
      inputs.reactionHeat = this.convertUnitsService.value(inputs.reactionHeat).from('kJkg').to('btuLb');
      inputs.additionalHeat = this.convertUnitsService.value(inputs.additionalHeat).from('kJ').to('Btu');
      inputs.specificHeatLiquid = this.convertUnitsService.value(inputs.specificHeatLiquid).from('kJkgC').to('btulbF');
      inputs.specificHeatSolid = this.convertUnitsService.value(inputs.specificHeatSolid).from('kJkgC').to('btulbF');
      inputs.latentHeat = this.convertUnitsService.value(inputs.latentHeat).from('kJkg').to('btuLb');
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
    const endoExoHeat = this.convertUnitsService.value(reactionFraction * feedRate * reactionHeat).from('Btu').to(energyResultUnit);
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
    return isNaN(value) ? 0 : this.convertUnitsService.value(value).from('Btu').to(toUnit);
  }
}
