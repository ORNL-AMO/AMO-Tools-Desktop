import { Injectable } from '@angular/core';
import { SSMTLosses, SSMTOutput, TurbineOutput, SteamPropertiesOutput } from '../../shared/models/steam/steam-outputs';
import { SSMTInputs, TurbineInput } from '../../shared/models/steam/ssmt';
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
    //
    ssmtLosses.highPressureHeader = ssmtResults.highPressureSteamHeatLoss.heatLoss;
    if (inputData.turbineInput.condensingTurbine.useTurbine == true) {
      ssmtLosses.condensingturbineEfficiencyLoss = this.calculateTurbine(ssmtResults.condensingTurbine);
    }
    if (inputData.headerInput.numberOfHeaders > 1) {
      //header
      ssmtLosses.lowPressureHeader = ssmtResults.lowPressureSteamHeatLoss.heatLoss;
      //turbine
      if (inputData.turbineInput.highToLowTurbine.useTurbine == true) {
        ssmtLosses.highToLowTurbineEfficiencyLoss = this.calculateTurbine(ssmtResults.highPressureToLowPressureTurbine);
      }

      if (inputData.headerInput.numberOfHeaders == 3) {
        ssmtLosses.mediumPressureHeader = ssmtResults.mediumPressureSteamHeatLoss.heatLoss;
        if (inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
          ssmtLosses.highToMediumTurbineEfficiencyLoss = this.calculateTurbine(ssmtResults.highPressureToMediumPressureTurbine);
        }
        if (inputData.turbineInput.mediumToLowTurbine.useTurbine == true) {
          ssmtLosses.mediumToLowTurbineEfficiencyLoss = this.calculateTurbine(ssmtResults.mediumPressureToLowPressureTurbine);
        }
      }
    }



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
    let loss: number = turbineOutput.energyOut * (1 - turbineOutput.generatorEfficiency);
    return loss;
  }

  calculateCondensingLosses(turbineOutput: TurbineOutput, inputData: SSMTInputs, settings: Settings): number {
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
  }

  // calculateCondensateLoss():number{

  // }

  initLosses(): SSMTLosses {
    let losses: SSMTLosses = {
      stack: 0,
      blowdown: 0,
      highPressureHeader: 0,
      mediumPressureHeader: 0,
      lowPressureHeader: 0,
      condensingturbineEfficiencyLoss: 0,
      highToMediumTurbineEfficiencyLoss: 0,
      highToLowTurbineEfficiencyLoss: 0,
      mediumToLowTurbineEfficiencyLoss: 0,
      condensingLosses: 0,
      condensateLosses: 0
    }
    return losses;
  }
}
