import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { TurbineOutput, FlashTankOutput, HeaderOutput, PrvOutput, HeatLossOutput, DeaeratorOutput, BoilerOutput, SaturatedPropertiesOutput, SteamPropertiesOutput, SSMTOutput, ProcessSteamUsage, HeatExchangerOutput, SSMTOperationsOutput } from '../../shared/models/steam/steam-outputs';
import { OperationsInput, HeaderNotHighestPressure, HeaderWithHighestPressure, HeaderInput, BoilerInput, CondensingTurbine, PressureTurbine, TurbineInput, SSMTInputs } from '../../shared/models/steam/ssmt';

@Injectable()
export class ConvertSteamService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  //ENTROPY
  convertSteamSpecificEntropyOutput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from('kJkgK').to(settings.steamSpecificEntropyMeasurement);
  }
  convertSteamSpecificEntropyInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamSpecificEntropyMeasurement).to('kJkgK');
  }
  //ENTHALPY
  convertSteamSpecificEnthalpyOutput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement);
  }
  convertSteamSpecificEnthalpyInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamSpecificEnthalpyMeasurement).to('kJkg');
  }
  //PRESSURE
  convertSteamPressureInput(val: number, settings: Settings): number {
    let tmpPressure: number = this.convertUnitsService.value(val).from(settings.steamPressureMeasurement).to('MPaa');
    return tmpPressure;
  }
  convertSteamPressureOutput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from('MPaa').to(settings.steamPressureMeasurement);
  }
  //TEMPERATURE
  convertSteamTemperatureInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamTemperatureMeasurement).to('C') + 273.15;
  }
  convertSteamTemperatureOutput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val - 273.15).from('C').to(settings.steamTemperatureMeasurement);
  }
  //SPECIFIC VOLUME
  convertSteamSpecificVolumeMeasurementInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamSpecificVolumeMeasurement).to('m3kg');
  }
  convertSteamSpecificVolumeMeasurementOutput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from('m3kg').to(settings.steamSpecificVolumeMeasurement);
  }
  //MASS FLOW
  convertSteamMassFlowInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamMassFlowMeasurement).to('kg');
  }
  convertSteamMassFlowOutput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from('kg').to(settings.steamMassFlowMeasurement);
  }
  //Energy
  convertEnergyFlowInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamEnergyMeasurement).to('kJ');
  }
  convertEnergyFlowOutput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from('kJ').to(settings.steamEnergyMeasurement);
  }
  //POWER
  convertSteamPowerInput(val: number, settings: Settings): number {
    return this.convertUnitsService.value(val).from(settings.steamPowerMeasurement).to('kJh');
  }

  //convert turbine output
  convertTurbineOutput(turbineOutput: TurbineOutput, settings: Settings): TurbineOutput {
    if (turbineOutput) {
      //mass flow
      turbineOutput.massFlow = this.convertSteamMassFlowOutput(turbineOutput.massFlow, settings);
      //energy flow
      turbineOutput.outletEnergyFlow = this.convertEnergyFlowOutput(turbineOutput.outletEnergyFlow, settings);
      turbineOutput.inletEnergyFlow = this.convertEnergyFlowOutput(turbineOutput.inletEnergyFlow, settings);
      turbineOutput.energyOut = this.convertEnergyFlowOutput(turbineOutput.energyOut, settings);
      //power out (only power conversion)
      turbineOutput.powerOut = this.convertUnitsService.value(turbineOutput.powerOut).from('kJh').to(settings.steamPowerMeasurement);
      //outlet pressure
      turbineOutput.outletPressure = this.convertSteamPressureOutput(turbineOutput.outletPressure, settings);
      turbineOutput.inletPressure = this.convertSteamPressureOutput(turbineOutput.inletPressure, settings);
      turbineOutput.outletIdealPressure = this.convertSteamPressureOutput(turbineOutput.outletIdealPressure, settings);
      //specific enthalpy
      turbineOutput.outletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(turbineOutput.outletSpecificEnthalpy, settings);
      turbineOutput.inletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(turbineOutput.inletSpecificEnthalpy, settings);
      turbineOutput.outletIdealSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(turbineOutput.outletIdealSpecificEnthalpy, settings);
      //specific entropy
      turbineOutput.outletSpecificEntropy = this.convertSteamSpecificEntropyOutput(turbineOutput.outletSpecificEntropy, settings);
      turbineOutput.inletSpecificEntropy = this.convertSteamSpecificEntropyOutput(turbineOutput.inletSpecificEntropy, settings);
      turbineOutput.outletIdealSpecificEntropy = this.convertSteamSpecificEntropyOutput(turbineOutput.outletIdealSpecificEntropy, settings);
      //temperature
      turbineOutput.outletTemperature = this.convertSteamTemperatureOutput(turbineOutput.outletTemperature, settings);
      turbineOutput.inletTemperature = this.convertSteamTemperatureOutput(turbineOutput.inletTemperature, settings);
      turbineOutput.outletIdealTemperature = this.convertSteamTemperatureOutput(turbineOutput.outletIdealTemperature, settings);
    }
    return turbineOutput;
  }

  //convert flash tank output
  convertFlashTankOutput(flashTankOutput: FlashTankOutput, settings: Settings): FlashTankOutput {
    if (flashTankOutput) {
      //flow
      flashTankOutput.inletWaterMassFlow = this.convertSteamMassFlowOutput(flashTankOutput.inletWaterMassFlow, settings);
      flashTankOutput.outletGasMassFlow = this.convertSteamMassFlowOutput(flashTankOutput.outletGasMassFlow, settings);
      flashTankOutput.outletLiquidMassFlow = this.convertSteamMassFlowOutput(flashTankOutput.outletLiquidMassFlow, settings);
      //pressure
      flashTankOutput.inletWaterPressure = this.convertSteamPressureOutput(flashTankOutput.inletWaterPressure, settings);
      flashTankOutput.outletGasPressure = this.convertSteamPressureOutput(flashTankOutput.outletGasPressure, settings);
      flashTankOutput.outletLiquidPressure = this.convertSteamPressureOutput(flashTankOutput.outletLiquidPressure, settings);
      //enthalpy
      flashTankOutput.inletWaterSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(flashTankOutput.inletWaterSpecificEnthalpy, settings);
      flashTankOutput.outletGasSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(flashTankOutput.outletGasSpecificEnthalpy, settings);
      flashTankOutput.outletLiquidSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(flashTankOutput.outletLiquidSpecificEnthalpy, settings);
      //entropy
      flashTankOutput.inletWaterSpecificEntropy = this.convertSteamSpecificEntropyOutput(flashTankOutput.inletWaterSpecificEntropy, settings);
      flashTankOutput.outletGasSpecificEntropy = this.convertSteamSpecificEntropyOutput(flashTankOutput.outletGasSpecificEntropy, settings);
      flashTankOutput.outletLiquidSpecificEntropy = this.convertSteamSpecificEntropyOutput(flashTankOutput.outletLiquidSpecificEntropy, settings);
      //temp
      flashTankOutput.inletWaterTemperature = this.convertSteamTemperatureOutput(flashTankOutput.inletWaterTemperature, settings);
      flashTankOutput.outletGasTemperature = this.convertSteamTemperatureOutput(flashTankOutput.outletGasTemperature, settings);
      flashTankOutput.outletLiquidTemperature = this.convertSteamTemperatureOutput(flashTankOutput.outletLiquidTemperature, settings);
      //energy flow    
      flashTankOutput.inletWaterEnergyFlow = this.convertEnergyFlowOutput(flashTankOutput.inletWaterEnergyFlow, settings);
      flashTankOutput.outletGasEnergyFlow = this.convertEnergyFlowOutput(flashTankOutput.outletGasEnergyFlow, settings);
      flashTankOutput.outletLiquidEnergyFlow = this.convertEnergyFlowOutput(flashTankOutput.outletLiquidEnergyFlow, settings);
      if (flashTankOutput.outletGasMassFlow < 0) {
        flashTankOutput.outletGasMassFlow = 0;
        flashTankOutput.outletGasEnergyFlow = 0;
        flashTankOutput.outletLiquidEnergyFlow = flashTankOutput.inletWaterEnergyFlow;
        flashTankOutput.outletLiquidMassFlow = flashTankOutput.inletWaterMassFlow;
        flashTankOutput.outletLiquidPressure = flashTankOutput.inletWaterPressure;
        flashTankOutput.outletLiquidQuality = flashTankOutput.inletWaterQuality;
        flashTankOutput.outletLiquidSpecificEnthalpy = flashTankOutput.inletWaterSpecificEnthalpy;
        flashTankOutput.outletLiquidSpecificEntropy = flashTankOutput.inletWaterSpecificEntropy;
        flashTankOutput.outletLiquidTemperature = flashTankOutput.inletWaterTemperature;
      }
    }
    return flashTankOutput;
  }
  //convert header output
  convertHeaderOutput(headerOutput: HeaderOutput, settings: Settings): HeaderOutput {
    if (headerOutput) {
      //iterate each header object
      for (var key in headerOutput) {
        headerOutput[key] = this.convertSteamPropertiesOutput(headerOutput[key], settings);
      }
    }
    return headerOutput;
  }
  //convert steam properties
  convertSteamPropertiesOutput(steamPropertiesOutput: SteamPropertiesOutput, settings: Settings): SteamPropertiesOutput {
    if (steamPropertiesOutput) {
      //pressure
      steamPropertiesOutput.pressure = this.convertSteamPressureOutput(steamPropertiesOutput.pressure, settings);
      //specific volume
      steamPropertiesOutput.specificVolume = this.convertSteamSpecificVolumeMeasurementOutput(steamPropertiesOutput.specificVolume, settings);
      //temperature
      steamPropertiesOutput.temperature = this.convertSteamTemperatureOutput(steamPropertiesOutput.temperature, settings);
      //specific entropy
      steamPropertiesOutput.specificEntropy = this.convertSteamSpecificEntropyOutput(steamPropertiesOutput.specificEntropy, settings);
      //specific enthalpy
      steamPropertiesOutput.specificEnthalpy = this.convertSteamSpecificEnthalpyOutput(steamPropertiesOutput.specificEnthalpy, settings);
      //energy flow
      steamPropertiesOutput.energyFlow = this.convertEnergyFlowOutput(steamPropertiesOutput.energyFlow, settings);
      //mass flow
      steamPropertiesOutput.massFlow = this.convertSteamMassFlowOutput(steamPropertiesOutput.massFlow, settings);
    }
    return steamPropertiesOutput;
  }
  //convert saturated properties
  convertSaturatedPropertiesOutput(saturatedPropertiesOutput: SaturatedPropertiesOutput, settings: Settings): SaturatedPropertiesOutput {
    if (saturatedPropertiesOutput) {
      //entropy
      saturatedPropertiesOutput.gasEntropy = this.convertSteamSpecificEntropyOutput(saturatedPropertiesOutput.gasEntropy, settings);
      saturatedPropertiesOutput.liquidEntropy = this.convertSteamSpecificEntropyOutput(saturatedPropertiesOutput.liquidEntropy, settings);
      saturatedPropertiesOutput.evaporationEntropy = this.convertSteamSpecificEntropyOutput(saturatedPropertiesOutput.evaporationEntropy, settings);
      //enthalpy
      saturatedPropertiesOutput.evaporationEnthalpy = this.convertSteamSpecificEnthalpyOutput(saturatedPropertiesOutput.evaporationEnthalpy, settings);
      saturatedPropertiesOutput.gasEnthalpy = this.convertSteamSpecificEnthalpyOutput(saturatedPropertiesOutput.gasEnthalpy, settings);
      saturatedPropertiesOutput.liquidEnthalpy = this.convertSteamSpecificEnthalpyOutput(saturatedPropertiesOutput.liquidEnthalpy, settings);
      //pressure
      saturatedPropertiesOutput.saturatedPressure = this.convertSteamPressureOutput(saturatedPropertiesOutput.saturatedPressure, settings);
      //temperature
      saturatedPropertiesOutput.saturatedTemperature = this.convertSteamTemperatureOutput(saturatedPropertiesOutput.saturatedTemperature, settings);
      //volume
      saturatedPropertiesOutput.evaporationVolume = this.convertSteamSpecificVolumeMeasurementOutput(saturatedPropertiesOutput.evaporationVolume, settings);
      saturatedPropertiesOutput.gasVolume = this.convertSteamSpecificVolumeMeasurementOutput(saturatedPropertiesOutput.gasVolume, settings);
      saturatedPropertiesOutput.liquidVolume = this.convertSteamSpecificVolumeMeasurementOutput(saturatedPropertiesOutput.liquidVolume, settings);
    }
    return saturatedPropertiesOutput;
  }
  //convert deaerator
  convertDeaeratorOutput(deaeratorOutput: DeaeratorOutput, settings: Settings): DeaeratorOutput {
    if (deaeratorOutput) {
      //energy flow
      deaeratorOutput.feedwaterEnergyFlow = this.convertEnergyFlowOutput(deaeratorOutput.feedwaterEnergyFlow, settings);
      deaeratorOutput.inletSteamEnergyFlow = this.convertEnergyFlowOutput(deaeratorOutput.inletSteamEnergyFlow, settings);
      deaeratorOutput.inletWaterEnergyFlow = this.convertEnergyFlowOutput(deaeratorOutput.inletWaterEnergyFlow, settings);
      deaeratorOutput.ventedSteamEnergyFlow = this.convertEnergyFlowOutput(deaeratorOutput.ventedSteamEnergyFlow, settings);
      //mass flow
      deaeratorOutput.feedwaterMassFlow = this.convertSteamMassFlowOutput(deaeratorOutput.feedwaterMassFlow, settings);
      deaeratorOutput.inletSteamMassFlow = this.convertSteamMassFlowOutput(deaeratorOutput.inletSteamMassFlow, settings);
      deaeratorOutput.inletWaterMassFlow = this.convertSteamMassFlowOutput(deaeratorOutput.inletWaterMassFlow, settings);
      deaeratorOutput.ventedSteamMassFlow = this.convertSteamMassFlowOutput(deaeratorOutput.ventedSteamMassFlow, settings);
      //pressure
      deaeratorOutput.feedwaterPressure = this.convertSteamPressureOutput(deaeratorOutput.feedwaterPressure, settings);
      deaeratorOutput.inletSteamPressure = this.convertSteamPressureOutput(deaeratorOutput.inletSteamPressure, settings);
      deaeratorOutput.inletWaterPressure = this.convertSteamPressureOutput(deaeratorOutput.inletWaterPressure, settings);
      deaeratorOutput.ventedSteamPressure = this.convertSteamPressureOutput(deaeratorOutput.ventedSteamPressure, settings);
      //specific enthalpy
      deaeratorOutput.feedwaterSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(deaeratorOutput.feedwaterSpecificEnthalpy, settings);
      deaeratorOutput.inletSteamSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(deaeratorOutput.inletSteamSpecificEnthalpy, settings);
      deaeratorOutput.inletWaterSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(deaeratorOutput.inletWaterSpecificEnthalpy, settings);
      deaeratorOutput.ventedSteamSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(deaeratorOutput.ventedSteamSpecificEnthalpy, settings);
      //specific entropy
      deaeratorOutput.feedwaterSpecificEntropy = this.convertSteamSpecificEntropyOutput(deaeratorOutput.feedwaterSpecificEntropy, settings);
      deaeratorOutput.inletSteamSpecificEntropy = this.convertSteamSpecificEntropyOutput(deaeratorOutput.inletSteamSpecificEntropy, settings);
      deaeratorOutput.inletWaterSpecificEntropy = this.convertSteamSpecificEntropyOutput(deaeratorOutput.inletWaterSpecificEntropy, settings);
      deaeratorOutput.ventedSteamSpecificEntropy = this.convertSteamSpecificEntropyOutput(deaeratorOutput.ventedSteamSpecificEntropy, settings);
      //feedwater temp
      deaeratorOutput.feedwaterTemperature = this.convertSteamTemperatureOutput(deaeratorOutput.feedwaterTemperature, settings);
      deaeratorOutput.inletSteamTemperature = this.convertSteamTemperatureOutput(deaeratorOutput.inletSteamTemperature, settings);
      deaeratorOutput.inletWaterTemperature = this.convertSteamTemperatureOutput(deaeratorOutput.inletWaterTemperature, settings);
      deaeratorOutput.ventedSteamTemperature = this.convertSteamTemperatureOutput(deaeratorOutput.ventedSteamTemperature, settings);
    }
    return deaeratorOutput;
  }
  //convert boiler
  convertBoilerOutput(boilerOutput: BoilerOutput, settings: Settings): BoilerOutput {
    if (boilerOutput) {
      //pressure
      boilerOutput.steamPressure = this.convertSteamPressureOutput(boilerOutput.steamPressure, settings);
      boilerOutput.blowdownPressure = this.convertSteamPressureOutput(boilerOutput.blowdownPressure, settings);
      boilerOutput.feedwaterPressure = this.convertSteamPressureOutput(boilerOutput.feedwaterPressure, settings);
      //temp
      boilerOutput.steamTemperature = this.convertSteamTemperatureOutput(boilerOutput.steamTemperature, settings);
      boilerOutput.blowdownTemperature = this.convertSteamTemperatureOutput(boilerOutput.blowdownTemperature, settings);
      boilerOutput.feedwaterTemperature = this.convertSteamTemperatureOutput(boilerOutput.feedwaterTemperature, settings);
      //enthalpy
      boilerOutput.steamSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(boilerOutput.steamSpecificEnthalpy, settings);
      boilerOutput.blowdownSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(boilerOutput.blowdownSpecificEnthalpy, settings);
      boilerOutput.feedwaterSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(boilerOutput.feedwaterSpecificEnthalpy, settings);
      //entropy
      boilerOutput.steamSpecificEntropy = this.convertSteamSpecificEntropyOutput(boilerOutput.steamSpecificEntropy, settings);
      boilerOutput.blowdownSpecificEntropy = this.convertSteamSpecificEntropyOutput(boilerOutput.blowdownSpecificEntropy, settings);
      boilerOutput.feedwaterSpecificEntropy = this.convertSteamSpecificEntropyOutput(boilerOutput.feedwaterSpecificEntropy, settings);
      //massFlow
      boilerOutput.steamMassFlow = this.convertSteamMassFlowOutput(boilerOutput.steamMassFlow, settings);
      boilerOutput.blowdownMassFlow = this.convertSteamMassFlowOutput(boilerOutput.blowdownMassFlow, settings);
      boilerOutput.feedwaterMassFlow = this.convertSteamMassFlowOutput(boilerOutput.feedwaterMassFlow, settings);
      //energy
      boilerOutput.steamEnergyFlow = this.convertEnergyFlowOutput(boilerOutput.steamEnergyFlow, settings);
      boilerOutput.blowdownEnergyFlow = this.convertEnergyFlowOutput(boilerOutput.blowdownEnergyFlow, settings);
      boilerOutput.feedwaterEnergyFlow = this.convertEnergyFlowOutput(boilerOutput.feedwaterEnergyFlow, settings);
      boilerOutput.boilerEnergy = this.convertEnergyFlowOutput(boilerOutput.boilerEnergy, settings);
      boilerOutput.fuelEnergy = this.convertEnergyFlowOutput(boilerOutput.fuelEnergy, settings);
    }
    return boilerOutput;
  }
  //convert PRV
  convertPrvOutput(prvOutput: PrvOutput, settings: Settings): PrvOutput {
    if (prvOutput) {
      //flow
      prvOutput.inletMassFlow = this.convertSteamMassFlowOutput(prvOutput.inletMassFlow, settings);
      prvOutput.outletMassFlow = this.convertSteamMassFlowOutput(prvOutput.outletMassFlow, settings);
      prvOutput.feedwaterMassFlow = this.convertSteamMassFlowOutput(prvOutput.feedwaterMassFlow, settings);
      //pressure
      prvOutput.inletPressure = this.convertSteamPressureOutput(prvOutput.inletPressure, settings);
      prvOutput.outletPressure = this.convertSteamPressureOutput(prvOutput.outletPressure, settings);
      prvOutput.feedwaterPressure = this.convertSteamPressureOutput(prvOutput.feedwaterPressure, settings);
      //enthalpy
      prvOutput.inletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(prvOutput.inletSpecificEnthalpy, settings);
      prvOutput.outletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(prvOutput.outletSpecificEnthalpy, settings);
      prvOutput.feedwaterSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(prvOutput.feedwaterSpecificEnthalpy, settings);
      //entropy
      prvOutput.inletSpecificEntropy = this.convertSteamSpecificEntropyOutput(prvOutput.inletSpecificEntropy, settings);
      prvOutput.outletSpecificEntropy = this.convertSteamSpecificEntropyOutput(prvOutput.outletSpecificEntropy, settings);
      prvOutput.feedwaterSpecificEntropy = this.convertSteamSpecificEntropyOutput(prvOutput.feedwaterSpecificEntropy, settings);
      //temp
      prvOutput.inletTemperature = this.convertSteamTemperatureOutput(prvOutput.inletTemperature, settings);
      prvOutput.outletTemperature = this.convertSteamTemperatureOutput(prvOutput.outletTemperature, settings);
      prvOutput.feedwaterTemperature = this.convertSteamTemperatureOutput(prvOutput.feedwaterTemperature, settings);
      //energyFlow
      prvOutput.inletEnergyFlow = this.convertEnergyFlowOutput(prvOutput.inletEnergyFlow, settings);
      prvOutput.outletEnergyFlow = this.convertEnergyFlowOutput(prvOutput.outletEnergyFlow, settings);
      prvOutput.feedwaterEnergyFlow = this.convertEnergyFlowOutput(prvOutput.feedwaterEnergyFlow, settings);
    }
    return prvOutput;
  }

  //convert heat loss
  convertHeatLossOutput(heatLossOutput: HeatLossOutput, settings: Settings): HeatLossOutput {
    if (heatLossOutput) {
      //flow
      heatLossOutput.inletMassFlow = this.convertSteamMassFlowOutput(heatLossOutput.inletMassFlow, settings);
      heatLossOutput.outletMassFlow = this.convertSteamMassFlowOutput(heatLossOutput.outletMassFlow, settings);
      //pressure
      heatLossOutput.inletPressure = this.convertSteamPressureOutput(heatLossOutput.inletPressure, settings);
      heatLossOutput.outletPressure = this.convertSteamPressureOutput(heatLossOutput.outletPressure, settings);
      //enthalpy
      heatLossOutput.inletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(heatLossOutput.inletSpecificEnthalpy, settings);
      heatLossOutput.outletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(heatLossOutput.outletSpecificEnthalpy, settings);
      //entropy
      heatLossOutput.inletSpecificEntropy = this.convertSteamSpecificEntropyOutput(heatLossOutput.inletSpecificEntropy, settings);
      heatLossOutput.outletSpecificEntropy = this.convertSteamSpecificEntropyOutput(heatLossOutput.outletSpecificEntropy, settings);
      //temp
      heatLossOutput.inletTemperature = this.convertSteamTemperatureOutput(heatLossOutput.inletTemperature, settings);
      heatLossOutput.outletTemperature = this.convertSteamTemperatureOutput(heatLossOutput.outletTemperature, settings);
      //energy flow
      heatLossOutput.inletEnergyFlow = this.convertEnergyFlowOutput(heatLossOutput.inletEnergyFlow, settings);
      heatLossOutput.outletEnergyFlow = this.convertEnergyFlowOutput(heatLossOutput.outletEnergyFlow, settings);
      heatLossOutput.heatLoss = this.convertEnergyFlowOutput(heatLossOutput.heatLoss, settings);
    }
    return heatLossOutput;
  }

  //heat exchanger
  convertHeatExchangerOutput(heatExchangerOutput: HeatExchangerOutput, settings: Settings): HeatExchangerOutput {
    if (heatExchangerOutput) {
      heatExchangerOutput.hotOutletMassFlow = this.convertSteamMassFlowOutput(heatExchangerOutput.hotOutletMassFlow, settings);
      heatExchangerOutput.hotOutletEnergyFlow = this.convertEnergyFlowOutput(heatExchangerOutput.hotOutletEnergyFlow, settings);
      heatExchangerOutput.hotOutletTemperature = this.convertSteamTemperatureOutput(heatExchangerOutput.hotOutletTemperature, settings);
      heatExchangerOutput.hotOutletVolume = this.convertSteamSpecificVolumeMeasurementOutput(heatExchangerOutput.hotOutletVolume, settings);
      // heatExchangerOutput.hotOutletDensity: number 
      heatExchangerOutput.hotOutletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(heatExchangerOutput.hotOutletSpecificEnthalpy, settings)
      heatExchangerOutput.hotOutletSpecificEntropy = this.convertSteamSpecificEntropyOutput(heatExchangerOutput.hotOutletSpecificEntropy, settings);
      heatExchangerOutput.hotOutletPressure = this.convertSteamPressureOutput(heatExchangerOutput.hotOutletPressure, settings);
      heatExchangerOutput.coldOutletMassFlow = this.convertSteamMassFlowOutput(heatExchangerOutput.coldOutletMassFlow, settings);
      heatExchangerOutput.coldOutletEnergyFlow = this.convertEnergyFlowOutput(heatExchangerOutput.coldOutletEnergyFlow, settings);
      heatExchangerOutput.coldOutletTemperature = this.convertSteamTemperatureOutput(heatExchangerOutput.coldOutletTemperature, settings);
      heatExchangerOutput.coldOutletPressure = this.convertSteamPressureOutput(heatExchangerOutput.coldOutletPressure, settings);
      heatExchangerOutput.coldOutletVolume = this.convertSteamSpecificVolumeMeasurementOutput(heatExchangerOutput.coldOutletVolume, settings);
      // heatExchangerOutput.coldOutletDensity: number
      heatExchangerOutput.coldOutletSpecificEnthalpy = this.convertSteamSpecificEnthalpyOutput(heatExchangerOutput.coldOutletSpecificEnthalpy, settings);
      heatExchangerOutput.coldOutletSpecificEntropy = this.convertSteamSpecificEntropyOutput(heatExchangerOutput.coldOutletSpecificEntropy, settings);
    }
    return heatExchangerOutput;
  }


  //convert operations
  convertOperationsOutput(ssmtOperationsOutput: SSMTOperationsOutput, settings: Settings): SSMTOperationsOutput {
    ssmtOperationsOutput.powerGenerated = this.convertUnitsService.value(ssmtOperationsOutput.powerGenerated).from('kJh').to(settings.steamPowerMeasurement);
    ssmtOperationsOutput.boilerFuelUsage = this.convertEnergyFlowOutput(ssmtOperationsOutput.boilerFuelUsage, settings);
    ssmtOperationsOutput.sitePowerImport = this.convertUnitsService.value(ssmtOperationsOutput.sitePowerImport).from('kJh').to(settings.steamPowerMeasurement);
    ssmtOperationsOutput.sitePowerDemand = this.convertUnitsService.value(ssmtOperationsOutput.sitePowerDemand).from('kJh').to(settings.steamPowerMeasurement);
    ssmtOperationsOutput.makeupWaterVolumeFlow = this.convertUnitsService.value(ssmtOperationsOutput.makeupWaterVolumeFlow).from('m3/h').to(settings.steamVolumeFlowMeasurement);
    ssmtOperationsOutput.makeupWaterVolumeFlowAnnual = this.convertUnitsService.value(ssmtOperationsOutput.makeupWaterVolumeFlowAnnual).from('m3').to(settings.steamVolumeMeasurement);
    return ssmtOperationsOutput;
  }

  //convert process usage
  convertProcessUsageOutput(processUsageOutput: ProcessSteamUsage, settings: Settings): ProcessSteamUsage {
    if (processUsageOutput) {
      processUsageOutput.pressure = this.convertSteamPressureOutput(processUsageOutput.pressure, settings);
      processUsageOutput.temperature = this.convertSteamTemperatureOutput(processUsageOutput.temperature, settings);
      processUsageOutput.energyFlow = this.convertEnergyFlowOutput(processUsageOutput.energyFlow, settings);
      processUsageOutput.massFlow = this.convertSteamMassFlowOutput(processUsageOutput.massFlow, settings);
      processUsageOutput.processUsage = this.convertEnergyFlowOutput(processUsageOutput.processUsage, settings);
    }
    return processUsageOutput;
  }

  convertSsmtOutput(ssmtOutput: SSMTOutput, settings: Settings): SSMTOutput {
    ssmtOutput.boilerOutput = this.convertBoilerOutput(ssmtOutput.boilerOutput, settings);

    ssmtOutput.highPressureHeaderSteam = this.convertSteamPropertiesOutput(ssmtOutput.highPressureHeaderSteam, settings);
    ssmtOutput.highPressureSteamHeatLoss = this.convertHeatLossOutput(ssmtOutput.highPressureSteamHeatLoss, settings);

    ssmtOutput.mediumPressureToLowPressurePrv = this.convertPrvOutput(ssmtOutput.mediumPressureToLowPressurePrv, settings);
    ssmtOutput.highPressureToMediumPressurePrv = this.convertPrvOutput(ssmtOutput.highPressureToMediumPressurePrv, settings);

    ssmtOutput.highPressureToLowPressureTurbine = this.convertTurbineOutput(ssmtOutput.highPressureToLowPressureTurbine, settings);
    ssmtOutput.highPressureToLowPressureTurbineIdeal = this.convertTurbineOutput(ssmtOutput.highPressureToLowPressureTurbineIdeal, settings);
    // ssmtOutput.highPressureToLowPressureTurbine = this.updateTurbineWithIdealValues(ssmtOutput.highPressureToLowPressureTurbine, ssmtOutput.highPressureToLowPressureTurbineIdeal);

    ssmtOutput.highPressureToMediumPressureTurbine = this.convertTurbineOutput(ssmtOutput.highPressureToMediumPressureTurbine, settings);
    ssmtOutput.highPressureToMediumPressureTurbineIdeal = this.convertTurbineOutput(ssmtOutput.highPressureToMediumPressureTurbineIdeal, settings);
    // ssmtOutput.highPressureToMediumPressureTurbine = this.updateTurbineWithIdealValues(ssmtOutput.highPressureToMediumPressureTurbine, ssmtOutput.highPressureToMediumPressureTurbineIdeal);

    ssmtOutput.highPressureCondensateFlashTank = this.convertFlashTankOutput(ssmtOutput.highPressureCondensateFlashTank, settings);

    ssmtOutput.lowPressureHeaderSteam = this.convertSteamPropertiesOutput(ssmtOutput.lowPressureHeaderSteam, settings);
    ssmtOutput.lowPressureSteamHeatLoss = this.convertHeatLossOutput(ssmtOutput.lowPressureSteamHeatLoss, settings);

    ssmtOutput.mediumPressureToLowPressureTurbine = this.convertTurbineOutput(ssmtOutput.mediumPressureToLowPressureTurbine, settings);
    ssmtOutput.mediumPressureToLowPressureTurbineIdeal = this.convertTurbineOutput(ssmtOutput.mediumPressureToLowPressureTurbineIdeal, settings);
    // ssmtOutput.mediumPressureToLowPressureTurbine = this.updateTurbineWithIdealValues(ssmtOutput.mediumPressureToLowPressureTurbine, ssmtOutput.mediumPressureToLowPressureTurbineIdeal);

    ssmtOutput.mediumPressureCondensateFlashTank = this.convertFlashTankOutput(ssmtOutput.mediumPressureCondensateFlashTank, settings);

    ssmtOutput.mediumPressureHeaderSteam = this.convertSteamPropertiesOutput(ssmtOutput.mediumPressureHeaderSteam, settings);
    ssmtOutput.mediumPressureSteamHeatLoss = this.convertHeatLossOutput(ssmtOutput.mediumPressureSteamHeatLoss, settings);

    ssmtOutput.blowdownFlashTank = this.convertFlashTankOutput(ssmtOutput.blowdownFlashTank, settings);

    ssmtOutput.highPressureCondensate = this.convertSteamPropertiesOutput(ssmtOutput.highPressureCondensate, settings);
    ssmtOutput.lowPressureCondensate = this.convertSteamPropertiesOutput(ssmtOutput.lowPressureCondensate, settings);
    ssmtOutput.mediumPressureCondensate = this.convertSteamPropertiesOutput(ssmtOutput.mediumPressureCondensate, settings);
    ssmtOutput.combinedCondensate = this.convertSteamPropertiesOutput(ssmtOutput.combinedCondensate, settings);
    ssmtOutput.returnCondensate = this.convertSteamPropertiesOutput(ssmtOutput.returnCondensate, settings);
    ssmtOutput.condensateFlashTank = this.convertFlashTankOutput(ssmtOutput.condensateFlashTank, settings);

    ssmtOutput.makeupWater = this.convertSteamPropertiesOutput(ssmtOutput.makeupWater, settings);
    ssmtOutput.makeupWaterAndCondensate = this.convertSteamPropertiesOutput(ssmtOutput.makeupWaterAndCondensate, settings);

    ssmtOutput.condensingTurbine = this.convertTurbineOutput(ssmtOutput.condensingTurbine, settings);
    ssmtOutput.condensingTurbineIdeal = this.convertTurbineOutput(ssmtOutput.condensingTurbineIdeal, settings);
    // ssmtOutput.condensingTurbine = this.updateTurbineWithIdealValues(ssmtOutput.condensingTurbine, ssmtOutput.condensingTurbine);

    ssmtOutput.deaeratorOutput = this.convertDeaeratorOutput(ssmtOutput.deaeratorOutput, settings);

    ssmtOutput.highPressureProcessSteamUsage = this.convertProcessUsageOutput(ssmtOutput.highPressureProcessSteamUsage, settings);
    ssmtOutput.mediumPressureProcessSteamUsage = this.convertProcessUsageOutput(ssmtOutput.mediumPressureProcessSteamUsage, settings);
    ssmtOutput.lowPressureProcessSteamUsage = this.convertProcessUsageOutput(ssmtOutput.lowPressureProcessSteamUsage, settings);
    ssmtOutput.lowPressureVentedSteam = this.convertSteamPropertiesOutput(ssmtOutput.lowPressureVentedSteam, settings);
    ssmtOutput.heatExchanger = this.convertHeatExchangerOutput(ssmtOutput.heatExchanger, settings);
    ssmtOutput.operationsOutput = this.convertOperationsOutput(ssmtOutput.operationsOutput, settings);
    return ssmtOutput;
  }

  updateTurbineWithIdealValues(turbine: TurbineOutput, idealValues: TurbineOutput): TurbineOutput {
    turbine.outletIdealPressure = idealValues.outletPressure;
    turbine.outletIdealQuality = idealValues.outletQuality;
    turbine.outletIdealSpecificEnthalpy = idealValues.outletSpecificEnthalpy;
    turbine.outletIdealSpecificEntropy = idealValues.outletSpecificEntropy;
    turbine.outletIdealTemperature = idealValues.outletTemperature;
    turbine.outletIdealVolume = idealValues.outletVolume;
    return turbine;
  }

  convertInputData(inputData: SSMTInputs, settings: Settings): SSMTInputs {
    inputData.turbineInput = this.convertTurbineInputData(inputData.turbineInput, settings);
    inputData.boilerInput = this.convertBoilerInputData(inputData.boilerInput, settings);
    inputData.headerInput = this.convertHeaderInputData(inputData.headerInput, settings);
    inputData.operationsInput = this.convertOperationsData(inputData.operationsInput, settings);
    inputData.baselinePowerDemand = this.convertSteamPowerInput(inputData.baselinePowerDemand, settings);
    return inputData;
  }

  convertTurbineInputData(turbineInput: TurbineInput, settings: Settings): TurbineInput {
    if (turbineInput.condensingTurbine.useTurbine == true) {
      turbineInput.condensingTurbine = this.convertCondensingTurbine(turbineInput.condensingTurbine, settings);
    }
    if (turbineInput.highToLowTurbine.useTurbine == true) {
      turbineInput.highToLowTurbine = this.convertPressureTurbine(turbineInput.highToLowTurbine, settings);
    }
    if (turbineInput.highToMediumTurbine.useTurbine == true) {
      turbineInput.highToMediumTurbine = this.convertPressureTurbine(turbineInput.highToMediumTurbine, settings);
    }
    if (turbineInput.mediumToLowTurbine.useTurbine == true) {
      turbineInput.mediumToLowTurbine = this.convertPressureTurbine(turbineInput.mediumToLowTurbine, settings);
    }
    return turbineInput;
  }

  convertPressureTurbine(turbine: PressureTurbine, settings: Settings): PressureTurbine {
    //2 = balance header no conversion
    if (turbine.operationType == 0) {
      //steam flow (mass flow)
      turbine.operationValue1 = this.convertSteamMassFlowInput(turbine.operationValue1, settings);
    } else if (turbine.operationType == 1) {
      //power generation (power)
      turbine.operationValue1 = this.convertSteamPowerInput(turbine.operationValue1, settings);
    } else if (turbine.operationType == 3) {
      //power range (power)
      turbine.operationValue1 = this.convertSteamPowerInput(turbine.operationValue1, settings);
      turbine.operationValue2 = this.convertSteamPowerInput(turbine.operationValue2, settings);

    } else if (turbine.operationType == 4) {
      //flow range (mass flow)
      turbine.operationValue1 = this.convertSteamMassFlowInput(turbine.operationValue1, settings);
      turbine.operationValue2 = this.convertSteamMassFlowInput(turbine.operationValue2, settings);
    }
    return turbine;
  }

  convertCondensingTurbine(turbine: CondensingTurbine, settings: Settings): CondensingTurbine {
    turbine.condenserPressure = this.convertUnitsService.value(turbine.condenserPressure).from(settings.steamVacuumPressure).to('MPaa');
    if (turbine.operationType == 0) {
      //steam flow (mass flow)
      turbine.operationValue = this.convertSteamMassFlowInput(turbine.operationValue, settings);
    } else if (turbine.operationType == 1) {
      //power generation (power)
      turbine.operationValue = this.convertSteamPowerInput(turbine.operationValue, settings);
    }
    return turbine;
  }

  convertBoilerInputData(boilerInput: BoilerInput, settings: Settings): BoilerInput {
    boilerInput.steamTemperature = this.convertSteamTemperatureInput(boilerInput.steamTemperature, settings);
    boilerInput.deaeratorPressure = this.convertSteamPressureInput(boilerInput.deaeratorPressure, settings);
    boilerInput.approachTemperature = this.convertApproachTemperature(boilerInput.approachTemperature, settings);
    return boilerInput;
  }

  convertApproachTemperature(approachTemp: number, settings: Settings): number {
    if (approachTemp) {
      let approachTempUnit: string = 'R';
      if (settings.steamTemperatureMeasurement == 'C' || settings.steamTemperatureMeasurement == 'K') {
        approachTempUnit = 'K';
      }
      approachTemp = this.convertUnitsService.value(approachTemp).from(approachTempUnit).to('K');
    } else {
      approachTemp = null;
    }
    return approachTemp;
  }

  convertHeaderInputData(headerInput: HeaderInput, settings: Settings): HeaderInput {
    headerInput.highPressureHeader = this.convertWithHighPressureHeader(headerInput.highPressureHeader, settings);
    if (headerInput.numberOfHeaders > 1) {
      headerInput.lowPressureHeader = this.convertNotHighestPressureHeader(headerInput.lowPressureHeader, settings);
    }
    if (headerInput.numberOfHeaders == 3) {
      headerInput.mediumPressureHeader = this.convertNotHighestPressureHeader(headerInput.mediumPressureHeader, settings);
    }
    return headerInput;
  }

  convertWithHighPressureHeader(header: HeaderWithHighestPressure, settings: Settings): HeaderWithHighestPressure {
    header.pressure = this.convertSteamPressureInput(header.pressure, settings);
    header.processSteamUsage = this.convertSteamMassFlowInput(header.processSteamUsage, settings);
    header.condensateReturnTemperature = this.convertSteamTemperatureInput(header.condensateReturnTemperature, settings);
    return header;
  }

  convertNotHighestPressureHeader(header: HeaderNotHighestPressure, settings: Settings): HeaderNotHighestPressure {
    header.pressure = this.convertSteamPressureInput(header.pressure, settings);
    header.processSteamUsage = this.convertSteamMassFlowInput(header.processSteamUsage, settings);
    header.desuperheatSteamTemperature = this.convertSteamTemperatureInput(header.desuperheatSteamTemperature, settings);
    return header;
  }

  convertOperationsData(operationsInput: OperationsInput, settings: Settings): OperationsInput {
    operationsInput.makeUpWaterTemperature = this.convertSteamTemperatureInput(operationsInput.makeUpWaterTemperature, settings);
    operationsInput.sitePowerImport = this.convertSteamPowerInput(operationsInput.sitePowerImport, settings);
    //convert unit costs
    let electricityCostHelper: number = this.convertUnitsService.value(1).from('kW').to('kJh');
    operationsInput.electricityCosts = operationsInput.electricityCosts / electricityCostHelper;
    let volumeCostHelper: number = this.convertUnitsService.value(1).from(settings.steamVolumeMeasurement).to('m3');
    operationsInput.makeUpWaterCosts = operationsInput.makeUpWaterCosts / volumeCostHelper;
    let fuelCostHelper: number = this.convertUnitsService.value(1).from(settings.steamEnergyMeasurement).to('kJ');
    operationsInput.fuelCosts = operationsInput.fuelCosts / fuelCostHelper;
    return operationsInput;
  }
}
