import { Injectable } from '@angular/core';
import { SSMTLosses, SSMTOutput, TurbineOutput, SteamPropertiesOutput, FlashTankOutput, DeaeratorOutput, ProcessSteamUsage } from '../../shared/models/steam/steam-outputs';
import { SSMTInputs } from '../../shared/models/steam/ssmt';
import { SteamService } from '../../calculator/steam/steam.service';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Injectable()
export class CalculateLossesService {

  constructor(private steamService: SteamService, private convertUnitsService: ConvertUnitsService) { }

  calculateLosses(ssmtResults: SSMTOutput, inputData: SSMTInputs, settings: Settings): SSMTLosses {
    let ssmtLosses: SSMTLosses = this.initLosses();
    ssmtLosses.stack = this.calculateStack(ssmtResults);
    ssmtLosses.blowdown = this.calculateBlowdown(ssmtResults);
    ssmtLosses.deaeratorVentLoss = this.calculateDeaeratorVentLoss(ssmtResults.deaeratorOutput);
    ssmtLosses.highPressureProcessLoss = this.calculateProcessLoss(ssmtResults.highPressureProcessUsage, ssmtResults.highPressureCondensate);

    //
    ssmtLosses.highPressureHeader = ssmtResults.highPressureSteamHeatLoss.heatLoss;
    if (inputData.turbineInput.condensingTurbine.useTurbine == true) {
      ssmtLosses.condensingTurbineEfficiencyLoss = this.calculateTurbine(ssmtResults.condensingTurbine);
    }

    if (inputData.headerInput.highPressure.flashCondensateReturn == true) {
      ssmtLosses.condensateFlashTankLoss = this.calculateCondensateFlashTankLoss(ssmtResults.condensateFlashTank);
    }
    if (inputData.headerInput.numberOfHeaders > 1) {
      //low pressure vent
      ssmtLosses.lowPressureVentLoss = this.calculateLowPressureVentLoss(ssmtResults.ventedLowPressureSteam);
      //header
      ssmtLosses.lowPressureHeader = ssmtResults.lowPressureSteamHeatLoss.heatLoss;
      //process
      ssmtLosses.lowPressureProcessLoss = this.calculateProcessLoss(ssmtResults.lowPressureProcessUsage, ssmtResults.lowPressureCondensate);
      //turbine
      if (inputData.turbineInput.highToLowTurbine.useTurbine == true) {
        ssmtLosses.highToLowTurbineEfficiencyLoss = this.calculateTurbine(ssmtResults.highToLowPressureTurbine);
      }

      if (inputData.headerInput.numberOfHeaders == 3) {
        ssmtLosses.mediumPressureHeader = ssmtResults.mediumPressureSteamHeatLoss.heatLoss;
        if (inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
          ssmtLosses.highToMediumTurbineEfficiencyLoss = this.calculateTurbine(ssmtResults.highPressureToMediumPressureTurbine);
        }
        if (inputData.turbineInput.mediumToLowTurbine.useTurbine == true) {
          ssmtLosses.mediumToLowTurbineEfficiencyLoss = this.calculateTurbine(ssmtResults.mediumToLowPressureTurbine);
        }
        ssmtLosses.mediumPressureProcessLoss = this.calculateProcessLoss(ssmtResults.mediumPressureProcessUsage, ssmtResults.mediumPressureCondensate);
      }
    }
    ssmtLosses.condensateLosses = this.calculateCondensateLoss(ssmtResults, inputData);
    ssmtLosses.condensingLosses = this.calculateCondensingLosses(ssmtResults.condensingTurbine, inputData, settings);
    return ssmtLosses;
  }

  calculateStack(ssmtResults: SSMTOutput): number {
    let loss: number = ssmtResults.boilerOutput.fuelEnergy - ssmtResults.boilerOutput.boilerEnergy;
    return loss;
  }

  calculateBlowdown(ssmtResults: SSMTOutput): number {
    let loss: number = (ssmtResults.boilerOutput.blowdownSpecificEnthalpy - ssmtResults.boilerOutput.blowdownMassFlow) / 1000;
    return loss;
  }

  calculateTurbine(turbineOutput: TurbineOutput): number {
    let loss: number = turbineOutput.energyOut * (1 - turbineOutput.generatorEfficiency) /100;
    return loss;
  }

  calculateCondensingLosses(turbineOutput: TurbineOutput, inputData: SSMTInputs, settings: Settings): number {
    if (inputData.turbineInput.condensingTurbine.useTurbine == true) {
      let condenserPressure: number = this.convertUnitsService.value(inputData.turbineInput.condensingTurbine.condenserPressure).from(settings.steamVacuumPressure).to(settings.steamPressureMeasurement);
      let outletProperties: SteamPropertiesOutput = this.steamService.steamProperties(
        {
          pressure: condenserPressure,
          thermodynamicQuantity: 3,
          quantityValue: 0
        },
        settings
      );
      let loss: number = turbineOutput.massFlow * (turbineOutput.outletSpecificEnthalpy - outletProperties.specificEnthalpy);
      return loss;
    } else {
      return 0;
    }
  }

  calculateCondensateLoss(ssmtResults: SSMTOutput, inputData: SSMTInputs): number {
    let lowPressureCondensate: SteamPropertiesOutput = ssmtResults.highPressureCondensate;
    if (inputData.headerInput.numberOfHeaders > 1) {
      lowPressureCondensate = ssmtResults.lowPressureCondensate;
    }
    let loss: number = ((ssmtResults.returnCondensate.specificEnthalpy * ssmtResults.returnCondensate.massFlow) - (lowPressureCondensate.specificEnthalpy * lowPressureCondensate.massFlow)) / 1000;
    return loss;
  }

  calculateLowPressureVentLoss(lowPressureVentedSteam: SteamPropertiesOutput): number {
    if (lowPressureVentedSteam) {
      let loss: number = lowPressureVentedSteam.specificEnthalpy * lowPressureVentedSteam.massFlow;
      return loss;
    } else {
      return 0;
    }
  }

  calculateCondensateFlashTankLoss(condensateFlashTank: FlashTankOutput): number {
    let loss: number = condensateFlashTank.outletGasSpecificEnthalpy * condensateFlashTank.outletGasMassFlow;
    return loss;
  }

  calculateDeaeratorVentLoss(deaeratorOutput: DeaeratorOutput): number {
    let loss: number = deaeratorOutput.ventedSteamSpecificEnthalpy * deaeratorOutput.ventedSteamMassFlow;
    return loss;
  }

  calculateProcessLoss(processSteam: ProcessSteamUsage, condensate: SteamPropertiesOutput): number {
    let loss: number = (processSteam.energyFlow - (condensate.massFlow * condensate.specificEnthalpy) - processSteam.processUsage) / 1000;
    return loss;
  }

  initLosses(): SSMTLosses {
    let losses: SSMTLosses = {
      stack: 0,
      blowdown: 0,
      highPressureHeader: 0,
      mediumPressureHeader: 0,
      lowPressureHeader: 0,
      condensingTurbineEfficiencyLoss: 0,
      highToMediumTurbineEfficiencyLoss: 0,
      highToLowTurbineEfficiencyLoss: 0,
      mediumToLowTurbineEfficiencyLoss: 0,
      condensingLosses: 0,
      condensateLosses: 0,
      lowPressureVentLoss: 0,
      condensateFlashTankLoss: 0,
      deaeratorVentLoss: 0,
      highPressureProcessLoss: 0,
      mediumPressureProcessLoss: 0,
      lowPressureProcessLoss: 0
    }
    return losses;
  }
}
