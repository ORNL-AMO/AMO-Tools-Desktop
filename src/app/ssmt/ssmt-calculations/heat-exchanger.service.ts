import { Injectable } from '@angular/core';
import { SteamService } from '../../calculator/steam/steam.service';
import { HeatExchangerOutput, SteamPropertiesOutput } from '../../shared/models/steam/steam-outputs';
import { HeatExchangerInput } from '../../shared/models/steam/steam-inputs';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Injectable()
export class HeatExchangerService {

  constructor(private steamService: SteamService, private convertUnitsService: ConvertUnitsService) { }

  heatExchange(approachTemp: number, heatExchangerInput: HeatExchangerInput, settings: Settings): HeatExchangerOutput {
    let maxTempDiff: number = heatExchangerInput.hotInletTemperature - heatExchangerInput.coldInletTemperature;
    if (maxTempDiff < 0 || maxTempDiff < approachTemp) {
      return {
        hotOutletMassFlow: heatExchangerInput.hotInletMassFlow,
        hotOutletEnergyFlow: heatExchangerInput.hotInletEnergyFlow,
        hotOutletTemperature: heatExchangerInput.hotInletTemperature,
        hotOutletPressure: heatExchangerInput.hotInletPressure,
        hotOutletQuality: heatExchangerInput.hotInletQuality,
        hotOutletSpecificVolume: heatExchangerInput.hotInletSpecificVolume,
        hotOutletDensity: heatExchangerInput.hotInletDensity,
        hotOutletSpecificEnthalpy: heatExchangerInput.hotInletSpecificEnthalpy,
        hotOutletSpecificEntropy: heatExchangerInput.hotInletSpecificEntropy,
        coldOutletMassFlow: heatExchangerInput.coldInletMassFlow,
        coldOutletEnergyFlow: heatExchangerInput.coldInletEnergyFlow,
        coldOutletTemperature: heatExchangerInput.coldInletTemperature,
        coldOutletPressure: heatExchangerInput.coldInletPressure,
        coldOutletQuality: heatExchangerInput.coldInletQuality,
        coldOutletSpecificVolume: heatExchangerInput.coldInletSpecificVolume,
        coldOutletDensity: heatExchangerInput.coldInletDensity,
        coldOutletSpecificEnthalpy: heatExchangerInput.coldInletSpecificEnthalpy,
        coldOutletSpecificEntropy: heatExchangerInput.coldInletSpecificEntropy
      };
    }

    let hotOutletTest: SteamPropertiesOutput = this.steamService.steamProperties(
      {
        pressure: heatExchangerInput.hotInletPressure,
        thermodynamicQuantity: 0,
        quantityValue: heatExchangerInput.coldInletTemperature + approachTemp,
      },
      settings);

    hotOutletTest.massFlow = heatExchangerInput.hotInletMassFlow;
    hotOutletTest.energyFlow = this.calculateEnergy(hotOutletTest.massFlow, hotOutletTest.specificEnthalpy, settings);
    let heatExchanged: number = heatExchangerInput.hotInletEnergyFlow - hotOutletTest.energyFlow;

    let coldOutletTest: SteamPropertiesOutput = this.steamService.steamProperties(
      {
        pressure: heatExchangerInput.coldInletPressure,
        thermodynamicQuantity: 1,
        quantityValue: this.calculateSpecificEnthalpy(heatExchangerInput.coldInletEnergyFlow + heatExchanged, heatExchangerInput.coldInletMassFlow, settings)
      },
      settings
    );
    coldOutletTest.massFlow = heatExchangerInput.coldInletMassFlow;
    coldOutletTest.energyFlow = this.calculateEnergy(coldOutletTest.massFlow, coldOutletTest.specificEnthalpy, settings);

    if ((hotOutletTest.temperature - heatExchangerInput.coldInletTemperature) > approachTemp) {
      coldOutletTest = this.steamService.steamProperties(
        {
          pressure: heatExchangerInput.coldInletPressure,
          thermodynamicQuantity: 0,
          quantityValue: (heatExchangerInput.hotInletTemperature - approachTemp),
        },
        settings
      );

      coldOutletTest.massFlow = heatExchangerInput.coldInletMassFlow;
      coldOutletTest.energyFlow = this.calculateEnergy(coldOutletTest.massFlow, coldOutletTest.specificEnthalpy, settings);

      heatExchanged = heatExchangerInput.hotInletEnergyFlow - hotOutletTest.energyFlow;

      hotOutletTest = this.steamService.steamProperties(
        {
          pressure: heatExchangerInput.hotInletPressure,
          thermodynamicQuantity: 1,
          quantityValue: this.calculateSpecificEnthalpy(heatExchangerInput.hotInletEnergyFlow - heatExchanged, heatExchangerInput.hotInletMassFlow, settings)
        },
        settings);

      hotOutletTest.massFlow = heatExchangerInput.hotInletMassFlow;
      hotOutletTest.energyFlow = this.calculateEnergy(hotOutletTest.massFlow, hotOutletTest.specificEnthalpy, settings);
    }

    let results: HeatExchangerOutput = {
      hotOutletMassFlow: hotOutletTest.massFlow,
      hotOutletEnergyFlow: hotOutletTest.energyFlow,
      hotOutletTemperature: hotOutletTest.temperature,
      hotOutletPressure: hotOutletTest.pressure,
      hotOutletQuality: hotOutletTest.quality,
      hotOutletSpecificVolume: hotOutletTest.specificVolume,
      hotOutletDensity: 1 / hotOutletTest.specificVolume,
      hotOutletSpecificEnthalpy: hotOutletTest.specificEnthalpy,
      hotOutletSpecificEntropy: hotOutletTest.specificEntropy,
      coldOutletMassFlow: coldOutletTest.massFlow,
      coldOutletEnergyFlow: coldOutletTest.energyFlow,
      coldOutletTemperature: coldOutletTest.temperature,
      coldOutletPressure: coldOutletTest.pressure,
      coldOutletQuality: coldOutletTest.quality,
      coldOutletSpecificVolume: coldOutletTest.specificVolume,
      coldOutletDensity: 1 / coldOutletTest.specificVolume,
      coldOutletSpecificEnthalpy: coldOutletTest.specificEnthalpy,
      coldOutletSpecificEntropy: coldOutletTest.specificEntropy
    }
    return results;
  }

  calculateEnergy(massFlow: number, specificEnthalpy: number, settings: Settings): number {
    let convertedMassFlow: number = this.convertUnitsService.value(massFlow).from(settings.steamMassFlowMeasurement).to('tonne');
    let convertedEnthalpy: number = this.convertUnitsService.value(specificEnthalpy).from(settings.steamSpecificEnthalpyMeasurement).to('kJkg');
    let energy: number = convertedMassFlow * convertedEnthalpy;
    energy = this.convertUnitsService.value(energy).from('MJ').to(settings.steamEnergyMeasurement);
    return energy;
  }

  calculateSpecificEnthalpy(energy: number, massFlow: number, settings: Settings): number {
    let convertedEnergy: number = this.convertUnitsService.value(energy).from(settings.steamEnergyMeasurement).to('MMBtu');
    let convertedMassFlow: number = this.convertUnitsService.value(massFlow).from(settings.steamMassFlowMeasurement).to('klb');
    let enthalpy: number = convertedEnergy / convertedMassFlow * 1000;
    let convertedEnthalpy: number = this.convertUnitsService.value(enthalpy).from('btuLb').to(settings.steamSpecificEnthalpyMeasurement);
    return convertedEnthalpy;
  }
}
