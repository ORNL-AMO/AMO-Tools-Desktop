import { Injectable } from '@angular/core';
import { SSMTLosses, SSMTOutput, TurbineOutput, SteamPropertiesOutput, FlashTankOutput, DeaeratorOutput, ProcessSteamUsage, BoilerOutput } from '../../shared/models/steam/steam-outputs';
import { SSMTInputs, SSMT } from '../../shared/models/steam/ssmt';
import { SteamService } from '../../calculator/steam/steam.service';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { BoilerService } from '../boiler/boiler.service';
import { HeaderService } from '../header/header.service';
import { TurbineService } from '../turbine/turbine.service';
import { OperationsService } from '../operations/operations.service';

@Injectable()
export class CalculateLossesService {

  constructor(private steamService: SteamService, private convertUnitsService: ConvertUnitsService,
    private boilerService: BoilerService, private headerService: HeaderService, private turbineService: TurbineService,
    private operationsService: OperationsService) { }

  calculateLosses(ssmtResults: SSMTOutput, inputData: SSMTInputs, settings: Settings, ssmt: SSMT): SSMTLosses {
    let inputCpy: SSMTInputs = JSON.parse(JSON.stringify(inputData));
    let resultsCpy: SSMTOutput = JSON.parse(JSON.stringify(ssmtResults));
    let ssmtCpy: SSMT = JSON.parse(JSON.stringify(ssmt));
    let ssmtLosses: SSMTLosses = this.initLosses();
    let boilerValid: boolean = this.boilerService.isBoilerValid(ssmtCpy.boilerInput, settings);
    let headerValid: boolean = this.headerService.isHeaderValid(ssmtCpy.headerInput, settings, ssmtCpy.boilerInput);
    let turbineValid: boolean = this.turbineService.isTurbineValid(ssmtCpy.turbineInput, ssmtCpy.headerInput, settings);
    let operationsValid: boolean = this.operationsService.getForm(ssmtCpy, settings).valid;

    if (boilerValid && headerValid && turbineValid && operationsValid) {
      ssmtLosses.stack = this.calculateStack(resultsCpy);
      ssmtLosses.blowdown = this.calculateBlowdown(resultsCpy.boilerOutput, settings);
      ssmtLosses.deaeratorVentLoss = this.calculateDeaeratorVentLoss(resultsCpy.deaeratorOutput, settings);
      ssmtLosses.highPressureProcessLoss = this.calculateProcessLoss(resultsCpy.highPressureProcessUsage, resultsCpy.highPressureCondensate, settings);
      ssmtLosses.highPressureProcessUsage = resultsCpy.highPressureProcessUsage.processUsage;
      //
      ssmtLosses.highPressureHeader = resultsCpy.highPressureSteamHeatLoss.heatLoss;
      if (inputCpy.turbineInput.condensingTurbine.useTurbine === true) {
        ssmtLosses.condensingTurbineUsefulEnergy = this.calculateTurbineUsefulEnergy(resultsCpy.condensingTurbine);
        ssmtLosses.condensingTurbineEfficiencyLoss = this.calculateTurbineLoss(resultsCpy.condensingTurbine);

      }

      if (inputCpy.headerInput.highPressure.flashCondensateReturn === true) {
        ssmtLosses.condensateFlashTankLoss = this.calculateCondensateFlashTankLoss(resultsCpy.condensateFlashTank);
      }
      if (inputCpy.headerInput.numberOfHeaders > 1) {
        //low pressure vent
        ssmtLosses.lowPressureVentLoss = this.calculateLowPressureVentLoss(resultsCpy.ventedLowPressureSteam, settings);
        //header
        ssmtLosses.lowPressureHeader = resultsCpy.lowPressureSteamHeatLoss.heatLoss;
        //process
        ssmtLosses.lowPressureProcessUsage = resultsCpy.lowPressureProcessUsage.processUsage;
        ssmtLosses.lowPressureProcessLoss = this.calculateProcessLoss(resultsCpy.lowPressureProcessUsage, resultsCpy.lowPressureCondensate, settings);
        //turbine
        if (inputCpy.turbineInput.highToLowTurbine.useTurbine === true) {
          ssmtLosses.highToLowTurbineUsefulEnergy = this.calculateTurbineUsefulEnergy(resultsCpy.highToLowPressureTurbine);
          ssmtLosses.highToLowTurbineEfficiencyLoss = this.calculateTurbineLoss(resultsCpy.highToLowPressureTurbine);
        }

        if (inputCpy.headerInput.numberOfHeaders === 3) {
          ssmtLosses.mediumPressureProcessUsage = resultsCpy.mediumPressureProcessUsage.processUsage;
          ssmtLosses.mediumPressureHeader = resultsCpy.mediumPressureSteamHeatLoss.heatLoss;
          if (inputCpy.turbineInput.highToMediumTurbine.useTurbine === true) {
            ssmtLosses.highToMediumTurbineUsefulEnergy = this.calculateTurbineUsefulEnergy(resultsCpy.highPressureToMediumPressureTurbine);
            ssmtLosses.highToMediumTurbineEfficiencyLoss = this.calculateTurbineLoss(resultsCpy.highPressureToMediumPressureTurbine);
          }
          if (inputCpy.turbineInput.mediumToLowTurbine.useTurbine === true) {
            ssmtLosses.mediumToLowTurbineUsefulEnergy = this.calculateTurbineUsefulEnergy(resultsCpy.mediumToLowPressureTurbine);
            ssmtLosses.mediumToLowTurbineEfficiencyLoss = this.calculateTurbineLoss(resultsCpy.mediumToLowPressureTurbine);
          }
          ssmtLosses.mediumPressureProcessLoss = this.calculateProcessLoss(resultsCpy.mediumPressureProcessUsage, resultsCpy.mediumPressureCondensate, settings);
        }
      }
      ssmtLosses.condensateLosses = this.calculateCondensateLoss(resultsCpy, settings);
      ssmtLosses.condensingLosses = this.calculateCondensingLosses(resultsCpy.condensingTurbine, inputCpy, settings);

      ssmtLosses.fuelEnergy = resultsCpy.boilerOutput.fuelEnergy;
      ssmtLosses.makeupWaterEnergy = this.calculateMakeupWaterEnergy(resultsCpy.makeupWater, settings);
      ssmtLosses.allProcessUsageUsefulEnergy = this.calculateUsefulProcessUsage(resultsCpy, inputCpy.headerInput.numberOfHeaders);
      ssmtLosses.totalProcessLosses = this.calculateTotalProcessLoss(ssmtLosses);
      ssmtLosses.totalVentLosses = this.calculateTotalVentLoss(ssmtLosses);
      ssmtLosses.totalOtherLosses = this.calculateTotalOtherLosses(ssmtLosses);
      ssmtLosses.totalTurbineLosses = this.calculateTotalTurbineLosses(ssmtLosses);
    }
    return ssmtLosses;
  }

  calculateStack(ssmtResults: SSMTOutput): number {
    let loss: number = ssmtResults.boilerOutput.fuelEnergy - ssmtResults.boilerOutput.boilerEnergy;
    return loss;
  }

  calculateBlowdown(boilerOutput: BoilerOutput, settings: Settings): number {
    let energy: number = this.calculateEnergy(boilerOutput.blowdownMassFlow, boilerOutput.blowdownSpecificEnthalpy, settings);
    energy = this.convertUnitsService.value(energy).from('MJ').to(settings.steamEnergyMeasurement);
    return energy;
  }

  calculateTurbineUsefulEnergy(turbineOutput: TurbineOutput): number {
    let loss: number = turbineOutput.energyOut * turbineOutput.generatorEfficiency / 100;
    return loss;
  }

  calculateTurbineLoss(turbineOutput: TurbineOutput): number {
    let loss: number = turbineOutput.energyOut * (1 - turbineOutput.generatorEfficiency / 100);
    return loss;
  }

  calculateCondensingLosses(turbineOutput: TurbineOutput, inputData: SSMTInputs, settings: Settings): number {
    if (inputData.turbineInput.condensingTurbine.useTurbine === true) {
      let condenserPressure: number = this.convertUnitsService.value(inputData.turbineInput.condensingTurbine.condenserPressure).from(settings.steamVacuumPressure).to(settings.steamPressureMeasurement);
      let outletProperties: SteamPropertiesOutput = this.steamService.steamProperties(
        {
          pressure: condenserPressure,
          thermodynamicQuantity: 3,
          quantityValue: 0
        },
        settings
      );
      let loss: number = this.calculateEnergy(turbineOutput.massFlow, (turbineOutput.outletSpecificEnthalpy - outletProperties.specificEnthalpy), settings);
      loss = this.convertUnitsService.value(loss).from('MJ').to(settings.steamEnergyMeasurement);
      return loss;
    } else {
      return 0;
    }
  }

  calculateCondensateLoss(ssmtResults: SSMTOutput, settings: Settings): number {
    let combinedCondensateEnergy: number = this.calculateEnergy(ssmtResults.combinedCondensate.massFlow, ssmtResults.combinedCondensate.specificEnthalpy, settings);
    let returnCondensateEnergy: number = this.calculateEnergy(ssmtResults.returnCondensate.massFlow, ssmtResults.returnCondensate.specificEnthalpy, settings);
    let loss: number = combinedCondensateEnergy - returnCondensateEnergy;
    loss = this.convertUnitsService.value(loss).from('MJ').to(settings.steamEnergyMeasurement);
    return loss;
  }

  calculateLowPressureVentLoss(lowPressureVentedSteam: SteamPropertiesOutput, settings: Settings): number {
    if (lowPressureVentedSteam) {
      let loss: number = this.calculateEnergy(lowPressureVentedSteam.massFlow, lowPressureVentedSteam.specificEnthalpy, settings);
      return loss;
    } else {
      return 0;
    }
  }

  calculateCondensateFlashTankLoss(condensateFlashTank: FlashTankOutput): number {
    let loss: number = condensateFlashTank.outletGasSpecificEnthalpy * condensateFlashTank.outletGasMassFlow;
    return loss;
  }

  calculateDeaeratorVentLoss(deaeratorOutput: DeaeratorOutput, settings: Settings): number {
    let loss: number = this.calculateEnergy(deaeratorOutput.ventedSteamMassFlow, deaeratorOutput.ventedSteamSpecificEnthalpy, settings);
    loss = this.convertUnitsService.value(loss).from('MJ').to(settings.steamEnergyMeasurement);

    return loss;
  }

  calculateProcessLoss(processSteam: ProcessSteamUsage, condensate: SteamPropertiesOutput, settings): number {
    let energy: number = this.calculateEnergy(condensate.massFlow, condensate.specificEnthalpy, settings);
    energy = this.convertUnitsService.value(energy).from('MJ').to(settings.steamEnergyMeasurement);
    let loss: number = (processSteam.energyFlow - (energy) - processSteam.processUsage);
    return loss;
  }

  calculateMakeupWaterEnergy(makeupWater: SteamPropertiesOutput, settings: Settings): number {
    let energy: number = this.calculateEnergy(makeupWater.massFlow, makeupWater.specificEnthalpy, settings);
    energy = this.convertUnitsService.value(energy).from('MJ').to(settings.steamEnergyMeasurement);

    return energy;
  }

  calculateEnergy(massFlow: number, specificEnthalpy: number, settings: Settings): number {
    let convertedMassFlow: number = this.convertUnitsService.value(massFlow).from(settings.steamMassFlowMeasurement).to('tonne');
    let convertedEnthalpy: number = this.convertUnitsService.value(specificEnthalpy).from(settings.steamSpecificEnthalpyMeasurement).to('kJkg');
    let energy: number = convertedMassFlow * convertedEnthalpy;
    return energy;
  }

  calculateUsefulProcessUsage(outputData: SSMTOutput, numberOfHeaders: number): number {
    let usefulProcessUsage: number = outputData.highPressureProcessUsage.processUsage;
    if (numberOfHeaders > 1) {
      usefulProcessUsage = usefulProcessUsage + outputData.lowPressureProcessUsage.processUsage;

      if (numberOfHeaders === 3) {
        usefulProcessUsage = usefulProcessUsage + outputData.mediumPressureProcessUsage.processUsage;
      }
    }
    return usefulProcessUsage;
  }

  calculateTotalVentLoss(ssmtLosses: SSMTLosses): number {
    let loss: number = ssmtLosses.deaeratorVentLoss + ssmtLosses.lowPressureVentLoss + ssmtLosses.condensateFlashTankLoss;
    return loss;
  }

  calculateTotalProcessLoss(ssmtLosses: SSMTLosses): number {
    let loss: number = ssmtLosses.lowPressureProcessLoss + ssmtLosses.mediumPressureProcessLoss + ssmtLosses.highPressureProcessLoss;
    return loss;
  }

  calculateTotalTurbineLosses(ssmtLosses: SSMTLosses): number {
    let loss: number = ssmtLosses.highToLowTurbineEfficiencyLoss + ssmtLosses.condensingTurbineEfficiencyLoss + ssmtLosses.mediumToLowTurbineEfficiencyLoss + ssmtLosses.highToMediumTurbineEfficiencyLoss;
    return loss;
  }

  calculateTotalOtherLosses(ssmtLosses: SSMTLosses): number {
    let loss: number = ssmtLosses.lowPressureHeader + ssmtLosses.mediumPressureHeader + ssmtLosses.highPressureHeader + ssmtLosses.blowdown + ssmtLosses.condensateLosses;
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
      lowPressureProcessLoss: 0,
      fuelEnergy: 0,
      makeupWaterEnergy: 0,
      condensingTurbineUsefulEnergy: 0,
      highToMediumTurbineUsefulEnergy: 0,
      highToLowTurbineUsefulEnergy: 0,
      mediumToLowTurbineUsefulEnergy: 0,
      highPressureProcessUsage: 0,
      mediumPressureProcessUsage: 0,
      lowPressureProcessUsage: 0,

      allProcessUsageUsefulEnergy: 0,
      totalProcessLosses: 0,
      totalVentLosses: 0,
      totalTurbineLosses: 0,
      totalOtherLosses: 0
    };
    return losses;
  }
}
