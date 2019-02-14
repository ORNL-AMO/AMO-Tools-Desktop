import { Injectable } from '@angular/core';
import { BoilerService } from '../../calculator/steam/boiler/boiler.service';
import { SsmtService } from '../ssmt.service';
import { SSMTInputs } from '../../shared/models/steam/ssmt';
import { BoilerOutput, TurbineOutput, PrvOutput, DeaeratorOutput } from '../../shared/models/steam/steam-outputs';
import { BoilerInput, TurbineInput, PrvInput, DeaeratorInput } from '../../shared/models/steam/steam-inputs';
import { TurbineService } from '../../calculator/steam/turbine/turbine.service';
import { PrvService } from '../../calculator/steam/prv/prv.service';
import { DeaeratorService } from '../../calculator/steam/deaerator/deaerator.service';

@Injectable()
export class SsmtDiagramTabService {

  constructor(private boilerCalculatorService: BoilerService, private ssmtService: SsmtService,
    private turbineService: TurbineService, private prvService: PrvService, private deaeratorService: DeaeratorService) { }

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
    this.ssmtService.mainTab.next('calculators');
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
    this.ssmtService.mainTab.next('calculators');
  }

  setPRV(prv: PrvOutput){
    let prvInput: PrvInput = {
      inletPressure: prv.inletPressure,
      thermodynamicQuantity: 1,//1 is enthalpy
      quantityValue: prv.inletSpecificEnthalpy,
      inletMassFlow: prv.inletMassFlow,
      outletPressure: prv.outletPressure,
      feedwaterPressure: prv.feedwaterPressure,
      feedwaterThermodynamicQuantity: 1,
      feedwaterQuantityValue: prv.feedwaterSpecificEnthalpy,
      desuperheatingTemp: prv.outletTemperature
    }
    this.prvService.prvInput = prvInput;
    if(prv.feedwaterMassFlow){
      this.prvService.isSuperHeating = true;
    }else{
      this.prvService.isSuperHeating = false;
    }
    this.ssmtService.calcTab.next('prv');
    this.ssmtService.mainTab.next('calculators');
  }

  setDeaeratorCalculator(deaerator: DeaeratorOutput, inputData: SSMTInputs){
    let deaeratorInput: DeaeratorInput = {
      deaeratorPressure: inputData.boilerInput.deaeratorPressure,
      ventRate: inputData.boilerInput.deaeratorVentRate,
      feedwaterMassFlow: deaerator.feedwaterMassFlow,
      waterPressure: deaerator.inletWaterPressure,
      waterThermodynamicQuantity: 1,
      waterQuantityValue: deaerator.inletWaterSpecificEnthalpy,
      steamPressure: deaerator.inletSteamPressure,
      steamThermodynamicQuantity: 1,
      steamQuantityValue: deaerator.inletSteamSpecificEnthalpy
    }
    this.deaeratorService.deaeratorInput = deaeratorInput;
    this.ssmtService.calcTab.next('deaerator');
    this.ssmtService.mainTab.next('calculators');
  }
}
