import { Injectable } from '@angular/core';
import { TurbineOutput, HeaderOutputObj, FlashTankOutput } from '../../shared/models/steam/steam-outputs';
import { SteamService } from '../../calculator/steam/steam.service';
import { SSMTInputs } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Injectable()
export class TurbineCalculationsService {


  condensingTurbine: TurbineOutput;
  highPressureToMediumPressureTurbine: TurbineOutput;
  highToLowPressureTurbine: TurbineOutput;
  mediumToLowPressureTurbine: TurbineOutput;

  inputData: SSMTInputs;
  settings: Settings;
  highPressureHeader: HeaderOutputObj;
  mediumPressureHeader: HeaderOutputObj;
  highPressureCondensateFlashTank: FlashTankOutput;
  constructor(private steamService: SteamService, private convertUnitsService: ConvertUnitsService) { }

  // {
  //     value: 0,
  //     display: 'Steam Flow'
  // },
  // {
  //     value: 1,
  //     display: 'Power Generation'
  // },
  // {
  //     value: 2,
  //     display: 'Balance Header'
  // },
  // {
  //     value: 3,
  //     display: 'Power Range'
  // },
  // {
  //     value: 4,
  //     display: 'Flow Range'
  // }

  setData(
    data: {
      condensingTurbine: TurbineOutput,
      highPressureToMediumPressureTurbine: TurbineOutput,
      highToLowPressureTurbine: TurbineOutput,
      mediumToLowPressureTurbine: TurbineOutput,
      inputData: SSMTInputs,
      settings: Settings,
      highPressureHeader: HeaderOutputObj,
      mediumPressureHeader: HeaderOutputObj,
      highPressureCondensateFlashTank: FlashTankOutput
    }
  ) {

  }

  calculateHighToLowPressureMassFlow(availableMassFlow: number): number{
    //steam flow
    if(this.inputData.turbineInput.highToLowTurbine.operationType == 0){
      //mass flow of turbine
      this.inputData.turbineInput.highToLowTurbine.operationValue1;
    }
    //power generation
    else if(this.inputData.turbineInput.highToLowTurbine.operationType == 1){

    }
    //balance header
    else if(this.inputData.turbineInput.highToLowTurbine.operationType == 2){
      //any
      return availableMassFlow;
    }
    //power range
    else if(this.inputData.turbineInput.highToLowTurbine.operationType == 3){
      //
    }
    //flow range
    else if(this.inputData.turbineInput.highToLowTurbine.operationType == 4){
      //min need =
      this.inputData.turbineInput.highToLowTurbine.operationValue1;
      //max need = 
      this.inputData.turbineInput.highToLowTurbine.operationValue2;
    }
  }

  calculateHighToMediumPressureMassFlow(availableMassFlow: number): number{
    //steam flow
    if(this.inputData.turbineInput.highToMediumTurbine.operationType == 0){
      //mass flow of turbine
      this.inputData.turbineInput.highToMediumTurbine.operationValue1;
    }
    //power generation
    else if(this.inputData.turbineInput.highToMediumTurbine.operationType == 1){

    }
    //balance header
    else if(this.inputData.turbineInput.highToMediumTurbine.operationType == 2){
      //any
      return availableMassFlow;
    }
    //power range
    else if(this.inputData.turbineInput.highToMediumTurbine.operationType == 3){
      //
    }
    //flow range
    else if(this.inputData.turbineInput.highToMediumTurbine.operationType == 4){
      //min need =
      this.inputData.turbineInput.highToMediumTurbine.operationValue1;
      //max need = 
      this.inputData.turbineInput.highToMediumTurbine.operationValue2;
    }
  }

  calculateMediumToLowPressureMassFlow(availableMassFlow: number): number{
    //steam flow
    if(this.inputData.turbineInput.mediumToLowTurbine.operationType == 0){
      //mass flow of turbine
      if(availableMassFlow < this.inputData.turbineInput.mediumToLowTurbine.operationValue1){
        //add additional massFlow to HP to MP turbine
        
      }else{
        return this.inputData.turbineInput.mediumToLowTurbine.operationValue1;
      }
    }
    //power generation
    else if(this.inputData.turbineInput.mediumToLowTurbine.operationType == 1){

    }
    //balance header
    else if(this.inputData.turbineInput.mediumToLowTurbine.operationType == 2){
      //any
      return availableMassFlow;
    }
    //power range
    else if(this.inputData.turbineInput.mediumToLowTurbine.operationType == 3){
      //
    }
    //flow range
    else if(this.inputData.turbineInput.mediumToLowTurbine.operationType == 4){
      if(availableMassFlow < this.inputData.turbineInput.mediumToLowTurbine.operationValue1){
        //min need
        //add additional massFlow to HP to MP turbine

      }else if(availableMassFlow > this.inputData.turbineInput.mediumToLowTurbine.operationValue2){
        //max need
      }
      

    }
  }



  //
  calculateHighToMediumPressureSteamTurbine() {
    let turbineProperty: number = 0; //0: massFlow, 1: powerOut
    //massFlow = (flow from current header) - (process steam usage in connected header)
    let massFlowOrPowerOut: number = this.highPressureHeader.massFlow - this.inputData.headerInput.highPressure.processSteamUsage;
    if (this.inputData.headerInput.numberOfHeaders == 3 && this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
      massFlowOrPowerOut = massFlowOrPowerOut - this.highToLowPressureTurbine.massFlow;
    }
    if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
      massFlowOrPowerOut = massFlowOrPowerOut - this.condensingTurbine.massFlow;
    }
    //mass flow can be adjusted depending on operation type of the turbine
    //Still need to work out: powerOut: 1 and powerRange: 3.
    //Working: balanceTurbine: 2, fixedFlow: 0, flowRange: 4
    if (this.inputData.turbineInput.highToMediumTurbine.operationType != 2) {
      if (this.inputData.turbineInput.highToMediumTurbine.operationType == 1 || this.inputData.turbineInput.highToMediumTurbine.operationType == 3) {
        turbineProperty = 1; //powerOut
      }
      if (this.inputData.turbineInput.highToMediumTurbine.operationType == 1 || this.inputData.turbineInput.highToMediumTurbine.operationType == 0) {
        massFlowOrPowerOut = this.inputData.turbineInput.highToMediumTurbine.operationValue1;
      } else if (this.inputData.turbineInput.highToMediumTurbine.operationType == 3) {
        massFlowOrPowerOut = this.inputData.turbineInput.highToMediumTurbine.operationValue2;
      }
      else if (this.inputData.turbineInput.highToMediumTurbine.operationType == 4) {
        if (massFlowOrPowerOut < this.inputData.turbineInput.highToMediumTurbine.operationValue1) {
          massFlowOrPowerOut = this.inputData.turbineInput.highToMediumTurbine.operationValue1;
        } else if (massFlowOrPowerOut > this.inputData.turbineInput.highToMediumTurbine.operationValue2) {
          massFlowOrPowerOut = this.inputData.turbineInput.highToMediumTurbine.operationValue2;
        }
      }
    }

    this.highPressureToMediumPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.highPressureHeader.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.highPressureHeader.specificEnthalpy,
        turbineProperty: turbineProperty,
        isentropicEfficiency: this.inputData.turbineInput.highToMediumTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.highToMediumTurbine.generationEfficiency,
        massFlowOrPowerOut: massFlowOrPowerOut,
        outletSteamPressure: this.inputData.headerInput.mediumPressure.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this.settings
    );
  }

  calculateHighToLowSteamTurbine() {
    let turbineProperty: number = 0; //0: massFlow, 1: powerOut
    let massFlowOrPowerOut: number = this.highPressureHeader.massFlow - this.inputData.headerInput.highPressure.processSteamUsage;
    if (this.inputData.headerInput.numberOfHeaders == 3) {
      massFlowOrPowerOut = massFlowOrPowerOut - this.inputData.headerInput.mediumPressure.processSteamUsage;
      if (this.inputData.headerInput.mediumPressure.flashCondensateIntoHeader == true) {
        massFlowOrPowerOut = massFlowOrPowerOut + this.highPressureCondensateFlashTank.outletGasMassFlow;
      }
    }
    if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
      massFlowOrPowerOut = massFlowOrPowerOut - this.condensingTurbine.massFlow;
    }
    //mass flow can be adjusted depending on operation type of the turbine
    //Still need to work out: powerOut: 1 and powerRange: 3.
    //Working: balanceTurbine: 2, fixedFlow: 0, flowRange: 4
    if (this.inputData.turbineInput.highToLowTurbine.operationType != 2) {
      if (this.inputData.turbineInput.highToLowTurbine.operationType == 1 || this.inputData.turbineInput.highToLowTurbine.operationType == 3) {
        turbineProperty = 1; //powerOut
      }
      if (this.inputData.turbineInput.highToLowTurbine.operationType == 1 || this.inputData.turbineInput.highToLowTurbine.operationType == 0) {
        massFlowOrPowerOut = this.inputData.turbineInput.highToLowTurbine.operationValue1;
      } else if (this.inputData.turbineInput.highToLowTurbine.operationType == 3) {
        massFlowOrPowerOut = this.inputData.turbineInput.highToLowTurbine.operationValue2;
      }
      else if (this.inputData.turbineInput.highToLowTurbine.operationType == 4) {
        if (massFlowOrPowerOut < this.inputData.turbineInput.highToLowTurbine.operationValue1) {
          massFlowOrPowerOut = this.inputData.turbineInput.highToLowTurbine.operationValue1;
        } else if (massFlowOrPowerOut > this.inputData.turbineInput.highToLowTurbine.operationValue2) {
          massFlowOrPowerOut = this.inputData.turbineInput.highToLowTurbine.operationValue2;
        }
      }
    }

    this.highToLowPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.highPressureHeader.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.highPressureHeader.specificEnthalpy,
        turbineProperty: turbineProperty,
        isentropicEfficiency: this.inputData.turbineInput.highToLowTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.highToLowTurbine.generationEfficiency,
        massFlowOrPowerOut: massFlowOrPowerOut,
        outletSteamPressure: this.inputData.headerInput.lowPressure.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this.settings
    );
  }


  calculateMediumToLowSteamTurbine() {
    let turbineProperty: number = 0; //massFlow
    //0: massFlow, 1: powerOut
    //massFlow = (flow from current header) - (process steam usage in connected header)
    let massFlowOrPowerOut: number = this.mediumPressureHeader.massFlow - this.inputData.headerInput.mediumPressure.processSteamUsage;
    //mass flow can be adjusted depending on operation type of the turbine
    //Still need to work out: powerOut: 1 and powerRange: 3.
    //Working: balanceTurbine: 2, fixedFlow: 0, flowRange: 4
    if (this.inputData.turbineInput.mediumToLowTurbine.operationType != 2) {
      if (this.inputData.turbineInput.mediumToLowTurbine.operationType == 1 || this.inputData.turbineInput.mediumToLowTurbine.operationType == 3) {
        turbineProperty = 1; //powerOut
      }
      if (this.inputData.turbineInput.mediumToLowTurbine.operationType == 1 || this.inputData.turbineInput.mediumToLowTurbine.operationType == 0) {
        massFlowOrPowerOut = this.inputData.turbineInput.mediumToLowTurbine.operationValue1;
      } else if (this.inputData.turbineInput.mediumToLowTurbine.operationType == 3) {
        massFlowOrPowerOut = this.inputData.turbineInput.mediumToLowTurbine.operationValue2;
      }
      else if (this.inputData.turbineInput.mediumToLowTurbine.operationType == 4) {
        if (massFlowOrPowerOut < this.inputData.turbineInput.mediumToLowTurbine.operationValue1) {
          massFlowOrPowerOut = this.inputData.turbineInput.mediumToLowTurbine.operationValue1;
        } else if (massFlowOrPowerOut > this.inputData.turbineInput.mediumToLowTurbine.operationValue2) {
          massFlowOrPowerOut = this.inputData.turbineInput.mediumToLowTurbine.operationValue2;
        }
      }
    }

    this.mediumToLowPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.mediumPressureHeader.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.mediumPressureHeader.specificEnthalpy,
        turbineProperty: turbineProperty,
        isentropicEfficiency: this.inputData.turbineInput.mediumToLowTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.mediumToLowTurbine.generationEfficiency,
        massFlowOrPowerOut: massFlowOrPowerOut,
        outletSteamPressure: this.inputData.headerInput.lowPressure.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this.settings
    );
  }




  //Cacluate header first then this.
  calculateCondensingTurbine() {
    //convert condenser pressure (absolute -> gauge), (will convert before sending to the suite c++)
    let condenserPressure: number = this.convertUnitsService.value(this.inputData.turbineInput.condensingTurbine.condenserPressure).from(this.settings.steamVacuumPressure).to(this.settings.steamPressureMeasurement);
    this.condensingTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.highPressureHeader.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.highPressureHeader.specificEnthalpy,
        turbineProperty: this.inputData.turbineInput.condensingTurbine.operationType,
        isentropicEfficiency: this.inputData.turbineInput.condensingTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.condensingTurbine.generationEfficiency,
        massFlowOrPowerOut: this.inputData.turbineInput.condensingTurbine.operationValue,
        outletSteamPressure: condenserPressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this.settings
    )
  }
}
