import { Injectable } from '@angular/core';
import { BoilerOutput, PrvOutput, TurbineOutput, FlashTankOutput, DeaeratorOutput, SteamPropertiesOutput, HeaderOutputObj } from '../shared/models/steam';
import { BoilerInput, SSMTInputs, Header, TurbineInput, CondensingTurbine, PressureTurbine, OperationsInput } from '../shared/models/ssmt';

import * as _ from 'lodash';
import { SteamService } from '../calculator/steam/steam.service';
import { Settings } from '../shared/models/settings';


@Injectable()
export class SteamModelCalculationService {
  //models
  boilerModel: BoilerOutput;
  highPressureHeaderModel: HeaderOutputObj;

  prv1Model: PrvOutput;
  prv2Model: PrvOutput;
  condensingTurbineModel: TurbineOutput;
  highPressureToLowPressureTurbine: TurbineOutput;
  highPressureToMediumPressureTurbine: TurbineOutput;
  mediumPressureToLowPressureTurbine: TurbineOutput;
  blowdownFlashTankModel: FlashTankOutput;
  returnSteamFlashTankModel: FlashTankOutput;
  flashTank3Model: FlashTankOutput;
  flashTank4Model: FlashTankOutput;
  deaeratorModel: DeaeratorOutput;
  process1Model: number;
  process2Model: number;
  process3Model: number;
  makeupWaterModel: number;

  //constants
  steamToDeaerator: number;
  lowPressureSteamVent: number;
  lowPressurePRVneed: number;
  mediumPressureSteamNeed: number;
  lowPressureSteamNeed: number;
  blowdown: SteamPropertiesOutput;
  blowdownFlashLiquid: SteamPropertiesOutput;
  blowdownGasToLowPressure: SteamPropertiesOutput;

  initialHighPressureCondensate: SteamPropertiesOutput;
  highPressureSaturatedLiquidEnthalpy: number;

  intitialMediumPressureCondensate: SteamPropertiesOutput;
  mediumPressureSaturatedLiquidEnthalpy: number;

  initialLowPressureCondensate: SteamPropertiesOutput;
  lowPressureSaturatedLiquidEnthalpy: number;

  inititialReturnCondensate: SteamPropertiesOutput;
  condensateReturnVent: SteamPropertiesOutput;
  condensate: SteamPropertiesOutput;

  highPressureSteamGasToMediumPressure: SteamPropertiesOutput;
  mediumPressureSteamGasToLowPressure: SteamPropertiesOutput;

  turbineCondensateSteamCooled: SteamPropertiesOutput;

  siteTotalPowerCost: number;
  makeupWater: SteamPropertiesOutput;
  feedwater: SteamPropertiesOutput;
  constructor(private steamService: SteamService) { }

  initializeSteamProperties(inputData: SSMTInputs, settings: Settings) {
    //constants needed for this function
    //headers from UI
    let lowPressureHeaderInput: Header = inputData.headerInput[2];
    let mediumPressureHeaderInput: Header = inputData.headerInput[1];
    let highPressureHeaderInput: Header = inputData.headerInput[0];
    let initialSteamUsageGuess: number = lowPressureHeaderInput.processSteamUsage + highPressureHeaderInput.processSteamUsage + mediumPressureHeaderInput.processSteamUsage;
    //intialize data
    this.steamToDeaerator = initialSteamUsageGuess * .1;
    this.lowPressurePRVneed = 0;
    this.lowPressureSteamVent = 0;

    this.mediumPressureSteamNeed = mediumPressureHeaderInput.processSteamUsage;
    this.lowPressureSteamNeed = lowPressureHeaderInput.processSteamUsage;

    //1. Boiler
    this.initializeBoilerModel(inputData.boilerInput, highPressureHeaderInput, settings);
    //2. blowdown from boiler
    this.initializeBlowdown(highPressureHeaderInput, settings);
    //3. Blowdown Flash Tank (flash blowdown (unused steam/water) from boiler)
    this.initializeBlowdownFlashTankModel(highPressureHeaderInput, lowPressureHeaderInput, settings);

    //4. initialize high/medium/low/return condensate properties
    //4a. high pressure condensate
    this.initializeHighPressureCondensateProperties();
    //4b. medium pressure condensate
    this.initializeMediumPressureCondensateProperties(mediumPressureHeaderInput, settings);
    //4c. low pressure condensate
    this.initializeLowPressureCondensateProperties(lowPressureHeaderInput, settings);
    //4d. return condensate
    this.initializeReturnCondensateProperties(lowPressureHeaderInput, mediumPressureHeaderInput, highPressureHeaderInput, settings);

    //5. initialize handeling of return condensate
    //if flashing the return condensate
    if (highPressureHeaderInput.flashCondensateReturn) {
      //run return steam through flash tank
      //should we be using the intialized steam properties from previous step
      //or the header input data from the UI?
      this.initializeReturnSteamFlashTank(inputData.boilerInput, lowPressureHeaderInput, mediumPressureHeaderInput, highPressureHeaderInput, settings);
      //gas generated from flash tank (gas)
      this.condensateReturnVent = {
        pressure: this.returnSteamFlashTankModel.outletGasPressure,
        temperature: this.returnSteamFlashTankModel.outletGasTemperature,
        specificEnthalpy: this.returnSteamFlashTankModel.outletGasSpecificEnthalpy,
        specificEntropy: this.returnSteamFlashTankModel.outletGasSpecificEntropy,
        quality: this.returnSteamFlashTankModel.outletGasQuality,
        massFlow: this.returnSteamFlashTankModel.outletGasMassFlow,
        energyFlow: this.returnSteamFlashTankModel.outletGasEnergyFlow
      };
      //condensate after flashed (liquid)
      this.condensate = {
        pressure: this.returnSteamFlashTankModel.outletLiquidPressure,
        temperature: this.returnSteamFlashTankModel.outletLiquidTemperature,
        specificEnthalpy: this.returnSteamFlashTankModel.outletLiquidSpecificEnthalpy,
        specificEntropy: this.returnSteamFlashTankModel.outletLiquidSpecificEntropy,
        quality: this.returnSteamFlashTankModel.outletLiquidQuality,
        massFlow: this.returnSteamFlashTankModel.outletLiquidMassFlow,
        energyFlow: this.returnSteamFlashTankModel.outletLiquidEnergyFlow
      };
    } else {
      //didn't flash return steam, no adjustments to steam properties
      this.condensate = this.inititialReturnCondensate;
      this.condensateReturnVent = this.inititialReturnCondensate;
      //replaces setMassFlow(), double check this
      this.condensateReturnVent.energyFlow = 0;
      this.condensateReturnVent.massFlow = 0;
    }

    //6. initialize high/medium/low pressure header models
    this.initializeHighPressureHeader(highPressureHeaderInput, settings)
    //7. set high and medium pressure steam properties that will go into? turbines
    //use heat loss values here?
    let highPressureSteam: SteamPropertiesOutput = {
      pressure: this.highPressureHeaderModel.heatLoss.outletPressure,
      temperature: this.highPressureHeaderModel.heatLoss.outletTemperature,
      specificEnthalpy: this.highPressureHeaderModel.heatLoss.outletSpecificEnthalpy,
      specificEntropy: this.highPressureHeaderModel.heatLoss.outletSpecificEntropy,
      quality: this.highPressureHeaderModel.heatLoss.outletQuality,
      //  specificVolume: this.highPressureHeaderModel.heatLoss.outletPressure,
      massFlow: this.highPressureHeaderModel.heatLoss.outletMassFlow,
      energyFlow: this.highPressureHeaderModel.heatLoss.outletEnergyFlow,
    }
    //medium pressure steam using lowPressureInput?
    let mediumPressureSteam: SteamPropertiesOutput = this.steamService.steamProperties(
      {
        pressure: lowPressureHeaderInput.pressure,
        thermodynamicQuantity: 3,
        quantityValue: 1
      },
      settings
    );

    //8. Initialize turbines
    //8a. condensing turbine
    this.initializeCondensingTurbineModel(inputData.turbineInput.condensingTurbine, highPressureSteam, settings);
    //8b. high pressure to low pressure turbine
    this.initializeHighPressureToLowPressureTurbine(inputData.turbineInput.highToLowTurbine, highPressureSteam, lowPressureHeaderInput, settings);
    //8c. high pressure to medium pressure turbine
    this.initializeHighPressureToMediumPressureTurbine(inputData.turbineInput.highToMediumTurbine, highPressureSteam, mediumPressureHeaderInput, settings);
    //8d. medium pressure to low pressure turbine
    this.initializeMediumPressureToLowPressureTurbine(inputData.turbineInput.mediumToLowTurbine, mediumPressureSteam, lowPressureHeaderInput, settings);
    //php has initialize turbines next?
      //uses turbine method to "setPowerOut", "setFlowRange", and "setPowerRange". May be unecessary given Turbine() setup
    //8e. balance turbines
    //TODO: Balance turbines function

    //9. calculate total power cost
    this.calculateTotalPowerCost(inputData.operationsInput);
    //10. calculate make up water
    this.initializeMakeupWater(inputData.operationsInput.makeUpWaterTemperature, settings);
    //11. calculate feed water
    this.feedwater = {
      pressure: this.boilerModel.feedwaterPressure,
      temperature: this.boilerModel.feedwaterTemperature,
      specificEnthalpy: this.boilerModel.feedwaterSpecificEnthalpy,
      specificEntropy: this.boilerModel.feedwaterSpecificEntropy,
      quality: this.boilerModel.feedwaterQuality,
      //  specificVolume: this.highPressureHeaderModel.heatLoss.outletPressure,
      massFlow: this.boilerModel.feedwaterMassFlow,
      energyFlow: this.boilerModel.feedwaterEnergyFlow,
    }
  }

  initializeBoilerModel(boilerInput: BoilerInput, highPressureHeaderInput: Header, settings: Settings) {
    this.boilerModel = this.steamService.boiler(
      {
        steamPressure: highPressureHeaderInput.pressure,
        blowdownRate: boilerInput.blowdownRate,
        steamMassFlow: 1,
        thermodynamicQuantity: 0,
        quantityValue: boilerInput.steamTemperature,
        combustionEfficiency: boilerInput.combustionEfficiency,
        deaeratorPressure: boilerInput.deaeratorPressure
      },
      settings
    );
  }

  initializeBlowdown(highPressureHeaderInput: Header, settings: Settings) {
    //im not sure this is correct but it's what the php has
    this.blowdown = this.steamService.steamProperties(
      {
        pressure: highPressureHeaderInput.pressure,
        thermodynamicQuantity: 3,
        quantityValue: 0
      },
      settings
    )
    //may be this: using the boilerModel outputs
    // this.blowdown = {
    //   pressure: this.boilerModel.blowdownPressure,
    //   temperature: this.boilerModel.blowdownTemperature,
    //   specificEnthalpy: this.boilerModel.blowdownSpecificEnthalpy,
    //   specificEntropy: this.boilerModel.blowdownSpecificEntropy,
    //   quality: this.boilerModel.blowdownQuality,
    //   //  specificVolume: this.highPressureHeaderModel.heatLoss.outletPressure,
    //   massFlow: this.boilerModel.blowdownMassFlow,
    //   energyFlow: this.boilerModel.blowdownEnergyFlow,
    // }
    this.blowdownFlashLiquid = this.blowdown;
  }

  initializeBlowdownFlashTankModel(highPressureHeaderInput: Header, lowPressureHeaderInput: Header, settings: Settings) {
    //is the inletWaterMassFlow correct, does it come from the boiler?
    this.blowdownFlashTankModel = this.steamService.flashTank(
      {
        inletWaterPressure: highPressureHeaderInput.pressure,
        thermodynamicQuantity: 3,
        quantityValue: 0,
        inletWaterMassFlow: this.boilerModel.blowdownMassFlow,
        tankPressure: lowPressureHeaderInput.pressure
      },
      settings
    )
  }

  initializeHighPressureCondensateProperties() {
    //php has this as copy of blowdown
    this.initialHighPressureCondensate = this.blowdown;
    this.highPressureSaturatedLiquidEnthalpy = this.initialHighPressureCondensate.specificEnthalpy;
  }

  initializeMediumPressureCondensateProperties(mediumPressureHeaderInput: Header, settings: Settings) {
    //get the steam properties based off medium pressure header from UI
    this.intitialMediumPressureCondensate = this.steamService.steamProperties(
      {
        pressure: mediumPressureHeaderInput.pressure,
        thermodynamicQuantity: 3,
        quantityValue: 0
      },
      settings
    )
    this.mediumPressureSaturatedLiquidEnthalpy = this.intitialMediumPressureCondensate.specificEnthalpy;
  }

  initializeLowPressureCondensateProperties(lowPressureHeaderInput: Header, settings: Settings) {
    //get the steam properties based off low pressure header from UI
    this.initialLowPressureCondensate = this.steamService.steamProperties(
      {
        pressure: lowPressureHeaderInput.pressure,
        thermodynamicQuantity: 3,
        quantityValue: 0
      },
      settings
    )
    this.lowPressureSaturatedLiquidEnthalpy = this.initialLowPressureCondensate.specificEnthalpy;
  }

  initializeReturnCondensateProperties(lowPressureHeaderInput: Header, mediumPressureHeaderInput: Header, highPressureHeaderInput: Header, settings: Settings) {
    //calculate the return condensate and mass flow..what php has
    this.inititialReturnCondensate = this.steamService.steamProperties(
      {
        pressure: lowPressureHeaderInput.pressure,
        thermodynamicQuantity: 0,
        quantityValue: highPressureHeaderInput.condensateReturnTemperature
      },
      settings
    );
    this.inititialReturnCondensate.massFlow =
      highPressureHeaderInput.processSteamUsage + highPressureHeaderInput.condensationRecoveryRate +
      mediumPressureHeaderInput.processSteamUsage + mediumPressureHeaderInput.condensationRecoveryRate +
      lowPressureHeaderInput.processSteamUsage + lowPressureHeaderInput.condensationRecoveryRate;
  }

  initializeReturnSteamFlashTank(boilerInput: BoilerInput, lowPressureHeaderInput: Header, mediumPressureHeaderInput: Header, highPressureHeaderInput: Header, settings: Settings) {
    this.returnSteamFlashTankModel = this.steamService.flashTank(
      {
        inletWaterPressure: lowPressureHeaderInput.pressure,
        quantityValue: highPressureHeaderInput.condensateReturnTemperature,
        thermodynamicQuantity: 0,
        inletWaterMassFlow:
          highPressureHeaderInput.processSteamUsage + highPressureHeaderInput.condensationRecoveryRate +
          mediumPressureHeaderInput.processSteamUsage + mediumPressureHeaderInput.condensationRecoveryRate +
          lowPressureHeaderInput.processSteamUsage + lowPressureHeaderInput.condensationRecoveryRate
        ,
        tankPressure: boilerInput.deaeratorPressure
      },
      settings
    );
  }

  initializeHighPressureHeader(highPressureHeaderInput: Header, settings: Settings) {
    //get header calculation results   
    //I DON"T THINK THIS IS CORRECT...
    //are we still using the header input when we get to this step?
    this.highPressureHeaderModel = this.steamService.header(
      {
        headerPressure: highPressureHeaderInput.pressure,
        inlets: [{
          pressure: highPressureHeaderInput.pressure,
          thermodynamicQuantity: this.boilerModel.steamTemperature,
          quantityValue: 0,
          massFlow: this.boilerModel.steamMassFlow
        }
        ]
      },
      settings
    ).header;

    //This may be correct but dependent on above calculation so may be incorrect from that
    this.highPressureHeaderModel.heatLoss = this.steamService.heatLoss(
      {
        inletPressure: this.highPressureHeaderModel.pressure,
        thermodynamicQuantity: 0,
        quantityValue: this.highPressureHeaderModel.temperature,
        inletMassFlow: this.highPressureHeaderModel.massFlow,
        percentHeatLoss: highPressureHeaderInput.heatLoss
      },
      settings
    );
  }

  initializeCondensingTurbineModel(condensingTurbine: CondensingTurbine, highPressureSteam: SteamPropertiesOutput, settings: Settings) {
    // solve for = (outlet properties = 0, isentropicEfficiency = 1) - unknown to solve for
    //inlet quantity and quantity value.. All are available, just picked temperature
    //i think if we solve for outlet properties (pretty sure what we want to do here)
    //then outletQuantity and outletQuantityValue doesn't matter otherwise idk what to put there..
    this.condensingTurbineModel = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: highPressureSteam.pressure,
        inletQuantity: highPressureSteam.temperature,
        inletQuantityValue: 0,
        turbineProperty: condensingTurbine.operationType,
        isentropicEfficiency: condensingTurbine.isentropicEfficiency,
        generatorEfficiency: condensingTurbine.generationEfficiency,
        massFlowOrPowerOut: condensingTurbine.operationValue,
        outletSteamPressure: condensingTurbine.condenserPressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      settings
    )
    //2. set properties for steam cooled by condensing turbine
    //energyFlow = energyOut ?
    this.turbineCondensateSteamCooled = {
      pressure: this.condensingTurbineModel.outletPressure,
      temperature: this.condensingTurbineModel.outletTemperature,
      specificEnthalpy: this.condensingTurbineModel.outletSpecificEnthalpy,
      specificEntropy: this.condensingTurbineModel.outletSpecificEntropy,
      quality: this.condensingTurbineModel.outletQuality,
      massFlow: this.condensingTurbineModel.massFlow,
      energyFlow: this.condensingTurbineModel.energyOut
    }
    //3. calculate massflow or power out properties if using turbine?
    //I think we can skip this step since it's fully calculated in Turbine() call
    if (condensingTurbine.useTurbine) {

    }
  }

  initializeHighPressureToLowPressureTurbine(highToLowPressureTurbine: PressureTurbine, highPressureSteam: SteamPropertiesOutput, lowPressureHeaderInput: Header, settings: Settings) {
    //TODO: highToLowPressureTurbine.operationType to set turbine property and corresponding
    //massFlowOrPowerOutValue.. 
    //operationType options: "Steam Flow", "Power Generation", "Balance Header", "Power Range", "Flow Range"
    //turbine() options: Mass Flow or Power Out.. not sure how those correspond
    let massFlowOrPowerOutValue: number = 0;
    this.highPressureToLowPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: highPressureSteam.pressure,
        inletQuantity: highPressureSteam.temperature,
        inletQuantityValue: 0,
        turbineProperty: highToLowPressureTurbine.operationType,
        isentropicEfficiency: highToLowPressureTurbine.isentropicEfficiency,
        generatorEfficiency: highToLowPressureTurbine.generationEfficiency,
        massFlowOrPowerOut: massFlowOrPowerOutValue,
        outletSteamPressure: lowPressureHeaderInput.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      settings
    )
  }

  initializeHighPressureToMediumPressureTurbine(highToMediumPressureTurbine: PressureTurbine, highPressureSteam: SteamPropertiesOutput, mediumPressureHeaderInput: Header, settings: Settings) {
    //TODO: highToMediumPressureTurbine.operationType to set turbine property and corresponding
    //massFlowOrPowerOutValue.. 
    //operationType options: "Steam Flow", "Power Generation", "Balance Header", "Power Range", "Flow Range"
    //turbine() options: Mass Flow or Power Out.. not sure how those correspond
    let massFlowOrPowerOutValue: number = 0;
    this.highPressureToMediumPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: highPressureSteam.pressure,
        inletQuantity: highPressureSteam.temperature,
        inletQuantityValue: 0,
        turbineProperty: highToMediumPressureTurbine.operationType,
        isentropicEfficiency: highToMediumPressureTurbine.isentropicEfficiency,
        generatorEfficiency: highToMediumPressureTurbine.generationEfficiency,
        massFlowOrPowerOut: massFlowOrPowerOutValue,
        outletSteamPressure: mediumPressureHeaderInput.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      settings
    )
  }

  initializeMediumPressureToLowPressureTurbine(mediumToLowPressureTurbine: PressureTurbine, mediumPressureSteam: SteamPropertiesOutput, lowPressureHeaderInput: Header, settings: Settings) {
    //TODO: mediumToLowPressureTurbine.operationType to set turbine property and corresponding
    //massFlowOrPowerOutValue.. 
    //operationType options: "Steam Flow", "Power Generation", "Balance Header", "Power Range", "Flow Range"
    //turbine() options: Mass Flow or Power Out.. not sure how those correspond
    let massFlowOrPowerOutValue: number = 0;
    this.highPressureToMediumPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: mediumPressureSteam.pressure,
        inletQuantity: mediumPressureSteam.temperature,
        inletQuantityValue: 0,
        turbineProperty: mediumToLowPressureTurbine.operationType,
        isentropicEfficiency: mediumToLowPressureTurbine.isentropicEfficiency,
        generatorEfficiency: mediumToLowPressureTurbine.generationEfficiency,
        massFlowOrPowerOut: massFlowOrPowerOutValue,
        outletSteamPressure: lowPressureHeaderInput.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      settings
    )
  }

  calculateTotalPowerCost(operationsInput: OperationsInput){
    //cost = electricityCosts or makeupWaterCosts or fuelCosts? 
    this.siteTotalPowerCost = operationsInput.sitePowerImport * operationsInput.operatingHoursPerYear * operationsInput.electricityCosts;
  }

  initializeMakeupWater(makeupWaterTemp: number, settings: Settings){
    this.makeupWater = this.steamService.steamProperties(
      {
        thermodynamicQuantity: 0, //temperature
        quantityValue: makeupWaterTemp,
        pressure: 0.101325 //atmospherice pressure
      },
      settings
    )
  }

}
