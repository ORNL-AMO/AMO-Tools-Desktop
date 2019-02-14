import { Injectable } from '@angular/core';
import { BoilerService } from '../../calculator/steam/boiler/boiler.service';
import { SsmtService } from '../ssmt.service';
import { SSMTInputs } from '../../shared/models/steam/ssmt';
import { BoilerOutput, TurbineOutput } from '../../shared/models/steam/steam-outputs';
import { BoilerInput, TurbineInput } from '../../shared/models/steam/steam-inputs';
import { TurbineService } from '../../calculator/steam/turbine/turbine.service';

@Injectable()
export class SsmtDiagramTabService {

  constructor(private boilerCalculatorService: BoilerService, private ssmtService: SsmtService,
    private turbineService: TurbineService) { }

  setBoilerCalculator(inputData: SSMTInputs, boiler: BoilerOutput){
    let boilerInput: BoilerInput = {
      steamPressure: inputData.headerInput.highPressure.pressure,
      blowdownRate: inputData.boilerInput.blowdownRate,
      steamMassFlow: Number(Math.round(boiler.steamMassFlow).toFixed(2)),
      thermodynamicQuantity: 0, //temperature
      quantityValue: inputData.boilerInput.steamTemperature,
      combustionEfficiency: inputData.boilerInput.combustionEfficiency,
      deaeratorPressure: inputData.boilerInput.deaeratorPressure
    }
    this.boilerCalculatorService.boilerInput = boilerInput;
    this.ssmtService.calcTab.next('boiler');
  }

  setTurbine(turbine: TurbineOutput){
    let turbineInput: TurbineInput = {
        solveFor: 0,
        inletPressure: turbine.inletPressure,
        inletQuantity: 1,
        inletQuantityValue: turbine.inletSpecificEnthalpy,
        turbineProperty: 0, // massFlow
        isentropicEfficiency: turbine.isentropicEfficiency,
        generatorEfficiency: turbine.generatorEfficiency,
        massFlowOrPowerOut: turbine.massFlow,
        outletSteamPressure: turbine.outletPressure,
        outletQuantity: 0,
        outletQuantityValue: 0
    }
    this.turbineService.turbineInput = turbineInput;
    this.ssmtService.calcTab.next('turbine');
  }
}
