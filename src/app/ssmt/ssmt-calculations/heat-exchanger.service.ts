import { Injectable } from '@angular/core';
import { SteamService } from '../../calculator/steam/steam.service';
import { HeatExchangerOutput, SteamPropertiesOutput } from '../../shared/models/steam/steam-outputs';
import { HeatExchangerInput } from '../../shared/models/steam/steam-inputs';
import { Settings } from '../../shared/models/settings';
import { ConvertSteamService } from '../../calculator/steam/convert-steam.service';

@Injectable()
export class HeatExchangerService {

  constructor(private steamService: SteamService, private convertSteamService: ConvertSteamService) { }

  heatExchange(approachTemp: number, heatExchangerInput: HeatExchangerInput, settings: Settings): HeatExchangerOutput {
    let maxTempDiff: number = heatExchangerInput.hotInletTemperature - heatExchangerInput.coldInletTemperature;
    if (maxTempDiff < 0 || maxTempDiff < approachTemp) {
      return {
        hotOutletMassFlow: heatExchangerInput.hotInletMassFlow,
        hotOutletEnergyFlow: heatExchangerInput.hotInletEnergyFlow,
        hotOutletTemperature: heatExchangerInput.hotInletTemperature,
        hotOutletPressure: heatExchangerInput.hotInletPressure,
        hotOutletQuality: heatExchangerInput.hotInletQuality,
        hotOutletVolume: heatExchangerInput.hotInletSpecificVolume,
        hotOutletDensity: heatExchangerInput.hotInletDensity,
        hotOutletSpecificEnthalpy: heatExchangerInput.hotInletSpecificEnthalpy,
        hotOutletSpecificEntropy: heatExchangerInput.hotInletSpecificEntropy,
        coldOutletMassFlow: heatExchangerInput.coldInletMassFlow,
        coldOutletEnergyFlow: heatExchangerInput.coldInletEnergyFlow,
        coldOutletTemperature: heatExchangerInput.coldInletTemperature,
        coldOutletPressure: heatExchangerInput.coldInletPressure,
        coldOutletQuality: heatExchangerInput.coldInletQuality,
        coldOutletVolume: heatExchangerInput.coldInletSpecificVolume,
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
    hotOutletTest.energyFlow = this.calculateEnergyFlow(hotOutletTest.massFlow, hotOutletTest.specificEnthalpy, settings);
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
    coldOutletTest.energyFlow = this.calculateEnergyFlow(coldOutletTest.massFlow, coldOutletTest.specificEnthalpy, settings);

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
      coldOutletTest.energyFlow = this.calculateEnergyFlow(coldOutletTest.massFlow, coldOutletTest.specificEnthalpy, settings);

      heatExchanged = heatExchangerInput.hotInletEnergyFlow - hotOutletTest.energyFlow;

      hotOutletTest = this.steamService.steamProperties(
        {
          pressure: heatExchangerInput.hotInletPressure,
          thermodynamicQuantity: 1,
          quantityValue: this.calculateSpecificEnthalpy(heatExchangerInput.hotInletEnergyFlow - heatExchanged, heatExchangerInput.hotInletMassFlow, settings)
        },
        settings);

      hotOutletTest.massFlow = heatExchangerInput.hotInletMassFlow;
      hotOutletTest.energyFlow = this.calculateEnergyFlow(hotOutletTest.massFlow, hotOutletTest.specificEnthalpy, settings);
    }

    let results: HeatExchangerOutput = {
      hotOutletMassFlow: hotOutletTest.massFlow,
      hotOutletEnergyFlow: hotOutletTest.energyFlow,
      hotOutletTemperature: hotOutletTest.temperature,
      hotOutletPressure: hotOutletTest.pressure,
      hotOutletQuality: hotOutletTest.quality,
      hotOutletVolume: hotOutletTest.specificVolume,
      hotOutletDensity: 1 / hotOutletTest.specificVolume,
      hotOutletSpecificEnthalpy: hotOutletTest.specificEnthalpy,
      hotOutletSpecificEntropy: hotOutletTest.specificEntropy,
      coldOutletMassFlow: coldOutletTest.massFlow,
      coldOutletEnergyFlow: coldOutletTest.energyFlow,
      coldOutletTemperature: coldOutletTest.temperature,
      coldOutletPressure: coldOutletTest.pressure,
      coldOutletQuality: coldOutletTest.quality,
      coldOutletVolume: coldOutletTest.specificVolume,
      coldOutletDensity: 1 / coldOutletTest.specificVolume,
      coldOutletSpecificEnthalpy: coldOutletTest.specificEnthalpy,
      coldOutletSpecificEntropy: coldOutletTest.specificEntropy
    }
    return results;
  }

  calculateEnergyFlow(massFlow: number, specificEnthalpy: number, settings: Settings): number {
    let convertedMassFlow: number = this.convertSteamService.convertSteamMassFlowInput(massFlow, settings);
    let convertedEnthalpy: number = this.convertSteamService.convertSteamSpecificEnthalpyInput(specificEnthalpy, settings);
    let energyFlow: number = convertedMassFlow * convertedEnthalpy;
    energyFlow = this.convertSteamService.convertEnergyFlowOutput(energyFlow, settings);
    return energyFlow;
  }

  calculateSpecificEnthalpy(energyFlow: number, massFlow: number, settings: Settings): number {
    let convertedEnergyFlow: number = this.convertSteamService.convertEnergyFlowInput(energyFlow, settings);
    let convertedMassFlow: number = this.convertSteamService.convertSteamMassFlowInput(massFlow, settings);
    let enthalpy: number = convertedEnergyFlow / convertedMassFlow;
    let convertedEnthalpy: number = this.convertSteamService.convertSteamSpecificEnthalpyOutput(enthalpy, settings);
    return convertedEnthalpy;
  }
}
