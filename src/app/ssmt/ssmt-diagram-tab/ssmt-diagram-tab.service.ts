import { Injectable } from '@angular/core';
import { BoilerService } from '../../calculator/steam/boiler/boiler.service';
import { SsmtService } from '../ssmt.service';
import { SSMTInputs } from '../../shared/models/steam/ssmt';
import { BoilerOutput, TurbineOutput, PrvOutput, DeaeratorOutput, FlashTankOutput } from '../../shared/models/steam/steam-outputs';
import { BoilerInput, TurbineInput, PrvInput, DeaeratorInput, FlashTankInput } from '../../shared/models/steam/steam-inputs';
import { TurbineService } from '../../calculator/steam/turbine/turbine.service';
import { PrvService } from '../../calculator/steam/prv/prv.service';
import { DeaeratorService } from '../../calculator/steam/deaerator/deaerator.service';
import { FlashTankService } from '../../calculator/steam/flash-tank/flash-tank.service';

@Injectable()
export class SsmtDiagramTabService {

  constructor(private boilerCalculatorService: BoilerService, private ssmtService: SsmtService,
    private turbineService: TurbineService, private prvService: PrvService, private deaeratorService: DeaeratorService,
    private flashTankService: FlashTankService) { }

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
        inletQuantityValue: Number(Math.round(turbine.inletSpecificEnthalpy).toFixed(2)),
        turbineProperty: 0, // massFlow
        isentropicEfficiency: turbine.isentropicEfficiency,
        generatorEfficiency: turbine.generatorEfficiency,
        massFlowOrPowerOut: Number(Math.round(turbine.massFlow).toFixed(2)),
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
      quantityValue: Number(Math.round(prv.inletSpecificEnthalpy).toFixed(2)),
      inletMassFlow: Number(Math.round(prv.inletMassFlow).toFixed(2)),
      outletPressure: prv.outletPressure,
      feedwaterPressure: prv.feedwaterPressure,
      feedwaterThermodynamicQuantity: 1,
      feedwaterQuantityValue: Number(Math.round(prv.feedwaterSpecificEnthalpy).toFixed(2)),
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
      feedwaterMassFlow: Number(Math.round(deaerator.feedwaterMassFlow).toFixed(2)),
      waterPressure:  Number(Math.round(deaerator.inletWaterPressure).toFixed(2)),
      waterThermodynamicQuantity: 1,
      waterQuantityValue: Number(Math.round(deaerator.inletWaterSpecificEnthalpy).toFixed(2)),
      steamPressure:  Number(Math.round(deaerator.inletSteamPressure).toFixed(2)),
      steamThermodynamicQuantity: 1,
      steamQuantityValue: Number(Math.round(deaerator.inletSteamSpecificEnthalpy).toFixed(2))
    }
    this.deaeratorService.deaeratorInput = deaeratorInput;
    this.ssmtService.calcTab.next('deaerator');
    this.ssmtService.mainTab.next('calculators');
  }

  setFlashTankCalculator(flashTank: FlashTankOutput){
    let flashTankInput: FlashTankInput = {
      inletWaterPressure: flashTank.inletWaterPressure,
      thermodynamicQuantity: 1, //1 is ENTHALPY
      quantityValue: Number(Math.round(flashTank.inletWaterSpecificEnthalpy).toFixed(2)),
      inletWaterMassFlow: Number(Math.round(flashTank.inletWaterMassFlow).toFixed(2)),
      tankPressure: flashTank.outletGasPressure
    }
    this.flashTankService.flashTankInput = flashTankInput;
    this.ssmtService.calcTab.next('flash-tank');
    this.ssmtService.mainTab.next('calculators');
  }
}
