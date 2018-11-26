import { Injectable } from '@angular/core';
import { SSMTOutput, SteamPropertiesOutput } from '../../shared/models/steam/steam-outputs';
import { SSMTInputs, BoilerInput, CondensingTurbine, PressureTurbine, OperationsInput, HeaderNotHighestPressure, HeaderWithHighestPressure } from '../../shared/models/steam/ssmt';
import { SteamService } from '../../calculator/steam/steam.service';
import { Settings } from '../../shared/models/settings';
import { BalanceTurbinesService } from './balance-turbines.service';
import { ModelerUtilitiesService } from './modeler-utilities.service';

@Injectable()
export class InitializePropertiesService {

  constructor(private steamService: SteamService, private modelerUtilitiesService: ModelerUtilitiesService, private balanceTurbinesService: BalanceTurbinesService) { }


  initializeSteamProperties(_ssmtOutputData: SSMTOutput, _inputData: SSMTInputs, _settings: Settings): SSMTOutput {
    if (!_ssmtOutputData) {
      _ssmtOutputData = this.initializeOutputDataObject();
    }
    //constants needed for this function
    //headers from UI
    let lowPressureHeaderInput: HeaderNotHighestPressure = _inputData.headerInput.lowPressure;
    let mediumPressureHeaderInput: HeaderNotHighestPressure = _inputData.headerInput.mediumPressure;
    let highPressureHeaderInput: HeaderWithHighestPressure = _inputData.headerInput.highPressure;
    let initialSteamUsageGuess: number = lowPressureHeaderInput.processSteamUsage + highPressureHeaderInput.processSteamUsage + mediumPressureHeaderInput.processSteamUsage;
    //intialize data constants
    _ssmtOutputData.steamToDeaerator = initialSteamUsageGuess * .1;
    _ssmtOutputData.lowPressurePRVneed = 0;
    _ssmtOutputData.lowPressureSteamVent = 0;

    _ssmtOutputData.mediumPressureSteamNeed = mediumPressureHeaderInput.processSteamUsage;
    _ssmtOutputData.lowPressureSteamNeed = _ssmtOutputData.steamToDeaerator + lowPressureHeaderInput.processSteamUsage;

    //1. Initialize Boiler
    _ssmtOutputData = this.initializeBoilerModel(_inputData.boilerInput, highPressureHeaderInput, _ssmtOutputData, _settings);
    //2. Initialize blowdown from boiler
    _ssmtOutputData = this.modelerUtilitiesService.setBlowdown(_ssmtOutputData);
    _ssmtOutputData.blowdownFlashLiquid = _ssmtOutputData.blowdown;
    //3. Initilize Blowdown Flash Tank (flash blowdown (unused steam/water) from boiler)
    //if is skipped in set properties in php for some reason?
    //if(_inputData.boilerInput.blowdownFlashed){
    _ssmtOutputData = this.modelerUtilitiesService.setBlowdownFlashTankModel(_ssmtOutputData, lowPressureHeaderInput.pressure, _settings);
    //}
    //4. initialize high/medium/low/return condensate properties
    //4a. high pressure condensate
    _ssmtOutputData = this.initializeHighPressureCondensateProperties(_ssmtOutputData);
    //4b. medium pressure condensate
    _ssmtOutputData = this.initializeMediumPressureCondensateProperties(mediumPressureHeaderInput, _ssmtOutputData, _settings);
    //4c. low pressure condensate
    _ssmtOutputData = this.initializeLowPressureCondensateProperties(lowPressureHeaderInput, _ssmtOutputData, _settings);
    //4d. return condensate
    _ssmtOutputData = this.initializeReturnCondensateProperties(lowPressureHeaderInput, mediumPressureHeaderInput, highPressureHeaderInput, _ssmtOutputData, _settings);

    //5. initialize handeling of return condensate
    //if flashing the return condensate
    if (highPressureHeaderInput.flashCondensateReturn) {
      //run return steam through flash tank
      //should we be using the intialized steam properties from previous step
      //or the header input data from the UI?
      _ssmtOutputData = this.initializeReturnSteamFlashTank(_inputData.boilerInput, lowPressureHeaderInput, mediumPressureHeaderInput, highPressureHeaderInput, _ssmtOutputData, _settings);
      //gas generated from flash tank (gas)
      _ssmtOutputData.condensateReturnVent = {
        pressure: _ssmtOutputData.condensateFlashTank.outletGasPressure,
        temperature: _ssmtOutputData.condensateFlashTank.outletGasTemperature,
        specificEnthalpy: _ssmtOutputData.condensateFlashTank.outletGasSpecificEnthalpy,
        specificEntropy: _ssmtOutputData.condensateFlashTank.outletGasSpecificEntropy,
        quality: _ssmtOutputData.condensateFlashTank.outletGasQuality,
        massFlow: _ssmtOutputData.condensateFlashTank.outletGasMassFlow,
        energyFlow: _ssmtOutputData.condensateFlashTank.outletGasEnergyFlow
      };
      //condensate after flashed (liquid)
      _ssmtOutputData.condensate = {
        pressure: _ssmtOutputData.condensateFlashTank.outletLiquidPressure,
        temperature: _ssmtOutputData.condensateFlashTank.outletLiquidTemperature,
        specificEnthalpy: _ssmtOutputData.condensateFlashTank.outletLiquidSpecificEnthalpy,
        specificEntropy: _ssmtOutputData.condensateFlashTank.outletLiquidSpecificEntropy,
        quality: _ssmtOutputData.condensateFlashTank.outletLiquidQuality,
        massFlow: _ssmtOutputData.condensateFlashTank.outletLiquidMassFlow,
        energyFlow: _ssmtOutputData.condensateFlashTank.outletLiquidEnergyFlow
      };
    } else {
      //didn't flash return steam, no adjustments to steam properties
      _ssmtOutputData.condensate = _ssmtOutputData.inititialReturnCondensate;
      _ssmtOutputData.condensateReturnVent = _ssmtOutputData.inititialReturnCondensate;
      //replaces setMassFlow(), double check this
      _ssmtOutputData.condensateReturnVent.energyFlow = 0;
      _ssmtOutputData.condensateReturnVent.massFlow = 0;
    }

    //6. initialize high/medium/low pressure header models
    _ssmtOutputData = this.initializeHighPressureHeader(highPressureHeaderInput, _ssmtOutputData, _settings);
    //7. set high and medium pressure steam properties that will go into turbines
    let highPressureSteam: SteamPropertiesOutput = {
      pressure: _ssmtOutputData.highPressureHeader.remainingSteam.pressure,
      temperature: _ssmtOutputData.highPressureHeader.remainingSteam.temperature,
      specificEnthalpy: _ssmtOutputData.highPressureHeader.remainingSteam.specificEnthalpy,
      specificEntropy: _ssmtOutputData.highPressureHeader.remainingSteam.specificEntropy,
      quality: _ssmtOutputData.highPressureHeader.remainingSteam.quality,
      massFlow: _ssmtOutputData.highPressureHeader.remainingSteam.massFlow,
      energyFlow: _ssmtOutputData.highPressureHeader.remainingSteam.energyFlow,
    }
    //medium pressure steam using lowPressureInput
    let mediumPressureSteam: SteamPropertiesOutput = this.steamService.steamProperties(
      {
        pressure: lowPressureHeaderInput.pressure,
        thermodynamicQuantity: 3,
        quantityValue: 1
      },
      _settings
    );

    //8. Initialize turbines
    //8a. condensing turbine
    _ssmtOutputData = this.initializeCondensingTurbineModel(_inputData.turbineInput.condensingTurbine, highPressureSteam, _ssmtOutputData, _settings);
    //8b. high pressure to low pressure turbine
    _ssmtOutputData = this.initializeHighPressureToLowPressureTurbine(_inputData.turbineInput.highToLowTurbine, highPressureSteam, lowPressureHeaderInput, _ssmtOutputData, _settings);
    //8c. high pressure to medium pressure turbine
    _ssmtOutputData = this.initializeHighPressureToMediumPressureTurbine(_inputData.turbineInput.highToMediumTurbine, highPressureSteam, mediumPressureHeaderInput, _ssmtOutputData, _settings);
    //8d. medium pressure to low pressure turbine
    _ssmtOutputData = this.initializeMediumPressureToLowPressureTurbine(_inputData.turbineInput.mediumToLowTurbine, mediumPressureSteam, lowPressureHeaderInput, _ssmtOutputData, _settings);
    //php has initialize turbines next?
    //uses turbine method to "setPowerOut", "setFlowRange", and "setPowerRange". May be unecessary given Turbine() setup
    //meaning Turbine() in C++ calculates those things already
    //8e. balance turbines
    _ssmtOutputData = this.balanceTurbinesService.balanceTurbines(_inputData.turbineInput, _ssmtOutputData)
    //9. calculate total power cost
    _ssmtOutputData = this.calculateTotalPowerCost(_inputData.operationsInput, _ssmtOutputData);
    //10. calculate make up water
    _ssmtOutputData = this.initializeMakeupWater(_inputData.operationsInput.makeUpWaterTemperature, _ssmtOutputData, _settings);
    //11. calculate feed water
    _ssmtOutputData = this.modelerUtilitiesService.setFeedwater(_ssmtOutputData);

    //php balances turbines twice.. not sure second one is necessary
    //_ssmtOutputData = this.balanceTurbinesService.balanceTurbines(_inputData.turbineInput, _ssmtOutputData);
    return _ssmtOutputData;
  }

  initializeBoilerModel(boilerInput: BoilerInput, highPressureHeaderInput: HeaderWithHighestPressure, _ssmtOutputData: SSMTOutput, _settings: Settings): SSMTOutput {
    _ssmtOutputData.boilerOutput = this.steamService.boiler(
      {
        steamPressure: highPressureHeaderInput.pressure,
        blowdownRate: boilerInput.blowdownRate,
        steamMassFlow: 1,
        thermodynamicQuantity: 0,
        quantityValue: boilerInput.steamTemperature,
        combustionEfficiency: boilerInput.combustionEfficiency,
        deaeratorPressure: boilerInput.deaeratorPressure
      },
      _settings
    );
    return _ssmtOutputData;
  }

  initializeHighPressureCondensateProperties(_ssmtOutputData: SSMTOutput): SSMTOutput {
    //php has this as copy of blowdown
    _ssmtOutputData.initialHighPressureCondensate = _ssmtOutputData.blowdown;
    _ssmtOutputData.highPressureSaturatedLiquidEnthalpy = _ssmtOutputData.initialHighPressureCondensate.specificEnthalpy;
    return _ssmtOutputData;
  }

  initializeMediumPressureCondensateProperties(_mediumPressureHeaderInput: HeaderNotHighestPressure, _ssmtOutputData: SSMTOutput, _settings: Settings): SSMTOutput {
    //get the steam properties based off medium pressure header from UI
    _ssmtOutputData.intitialMediumPressureCondensate = this.steamService.steamProperties(
      {
        pressure: _mediumPressureHeaderInput.pressure,
        thermodynamicQuantity: 3,
        quantityValue: 0
      },
      _settings
    )
    _ssmtOutputData.mediumPressureSaturatedLiquidEnthalpy = _ssmtOutputData.intitialMediumPressureCondensate.specificEnthalpy;
    return _ssmtOutputData;
  }

  initializeLowPressureCondensateProperties(_lowPressureHeaderInput: HeaderNotHighestPressure, _ssmtOutputData: SSMTOutput, _settings: Settings): SSMTOutput {
    //get the steam properties based off low pressure header from UI
    _ssmtOutputData.initialLowPressureCondensate = this.steamService.steamProperties(
      {
        pressure: _lowPressureHeaderInput.pressure,
        thermodynamicQuantity: 3,
        quantityValue: 0
      },
      _settings
    )
    _ssmtOutputData.lowPressureSaturatedLiquidEnthalpy = _ssmtOutputData.initialLowPressureCondensate.specificEnthalpy;
    return _ssmtOutputData;
  }

  initializeReturnCondensateProperties(_lowPressureHeaderInput: HeaderNotHighestPressure, _mediumPressureHeaderInput: HeaderNotHighestPressure, _highPressureHeaderInput: HeaderWithHighestPressure, _ssmtOutputData: SSMTOutput, _settings: Settings): SSMTOutput {
    //calculate the return condensate and mass flow..what php has
    _ssmtOutputData.inititialReturnCondensate = this.steamService.steamProperties(
      {
        pressure: _lowPressureHeaderInput.pressure,
        thermodynamicQuantity: 0,
        quantityValue: _highPressureHeaderInput.condensateReturnTemperature
      },
      _settings
    );
    _ssmtOutputData.inititialReturnCondensate.massFlow =
      _highPressureHeaderInput.processSteamUsage * _highPressureHeaderInput.condensationRecoveryRate +
      _mediumPressureHeaderInput.processSteamUsage * _mediumPressureHeaderInput.condensationRecoveryRate +
      _lowPressureHeaderInput.processSteamUsage * _lowPressureHeaderInput.condensationRecoveryRate;
    return _ssmtOutputData
  }

  initializeReturnSteamFlashTank(_boilerInput: BoilerInput, _lowPressureHeaderInput: HeaderNotHighestPressure, _mediumPressureHeaderInput: HeaderNotHighestPressure, _highPressureHeaderInput: HeaderWithHighestPressure, _ssmtOutputData: SSMTOutput, _settings: Settings): SSMTOutput {
    _ssmtOutputData.condensateFlashTank = this.steamService.flashTank(
      {
        inletWaterPressure: _lowPressureHeaderInput.pressure,
        quantityValue: _highPressureHeaderInput.condensateReturnTemperature,
        thermodynamicQuantity: 0,
        inletWaterMassFlow:
          _highPressureHeaderInput.processSteamUsage * _highPressureHeaderInput.condensationRecoveryRate +
          _mediumPressureHeaderInput.processSteamUsage * _mediumPressureHeaderInput.condensationRecoveryRate +
          _lowPressureHeaderInput.processSteamUsage * _lowPressureHeaderInput.condensationRecoveryRate
        ,
        tankPressure: _boilerInput.deaeratorPressure
      },
      _settings
    );
    return _ssmtOutputData;
  }

  initializeHighPressureHeader(highPressureHeaderInput: HeaderWithHighestPressure, _ssmtOutputData: SSMTOutput, _settings: Settings): SSMTOutput {
    //get header calculation results   
    //I DON"T THINK THIS IS CORRECT...
    //are we still using the header input when we get to this step?
    _ssmtOutputData.highPressureHeader = this.steamService.header(
      {
        headerPressure: highPressureHeaderInput.pressure,
        inlets: [{
          pressure: highPressureHeaderInput.pressure,
          thermodynamicQuantity: 1,
          quantityValue: _ssmtOutputData.boilerOutput.steamSpecificEnthalpy,
          massFlow: _ssmtOutputData.boilerOutput.steamMassFlow
        }
        ]
      },
      _settings
    ).header;
    _ssmtOutputData.highPressureHeader = this.modelerUtilitiesService.setHeatLoss(_ssmtOutputData.highPressureHeader, highPressureHeaderInput.heatLoss, _settings);
    return _ssmtOutputData
  }


  initializeCondensingTurbineModel(_condensingTurbine: CondensingTurbine, _highPressureSteam: SteamPropertiesOutput, _ssmtOutputData: SSMTOutput, _settings: Settings): SSMTOutput {
    // solve for = (outlet properties = 0, isentropicEfficiency = 1) - unknown to solve for
    //inlet quantity and quantity value.. All are available, just picked temperature
    //i think if we solve for outlet properties (pretty sure what we want to do here)
    //then outletQuantity and outletQuantityValue doesn't matter otherwise idk what to put there..
    _ssmtOutputData.condensingTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: _highPressureSteam.pressure,
        inletQuantity: 1,
        inletQuantityValue: _highPressureSteam.specificEnthalpy,
        turbineProperty: _condensingTurbine.operationType,
        isentropicEfficiency: _condensingTurbine.isentropicEfficiency,
        generatorEfficiency: _condensingTurbine.generationEfficiency,
        massFlowOrPowerOut: _condensingTurbine.operationValue,
        outletSteamPressure: _condensingTurbine.condenserPressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      _settings
    )
    //2. set properties for steam cooled by condensing turbine
    //energyFlow = energyOut ?
    _ssmtOutputData.turbineCondensateSteamCooled = {
      pressure: _ssmtOutputData.condensingTurbine.outletPressure,
      temperature: _ssmtOutputData.condensingTurbine.outletTemperature,
      specificEnthalpy: _ssmtOutputData.condensingTurbine.outletSpecificEnthalpy,
      specificEntropy: _ssmtOutputData.condensingTurbine.outletSpecificEntropy,
      quality: _ssmtOutputData.condensingTurbine.outletQuality,
      massFlow: _ssmtOutputData.condensingTurbine.massFlow,
      energyFlow: _ssmtOutputData.condensingTurbine.energyOut
    }
    //3. calculate massflow or power out properties if using turbine?
    //I think we can skip this step since it's fully calculated in Turbine() call
    if (_condensingTurbine.useTurbine) {

    }
    return _ssmtOutputData;
  }

  initializeHighPressureToLowPressureTurbine(_highToLowPressureTurbine: PressureTurbine, _highPressureSteam: SteamPropertiesOutput, _lowPressureHeaderInput: HeaderNotHighestPressure, _ssmtOutputData: SSMTOutput, _settings: Settings): SSMTOutput {
    //TODO: highToLowPressureTurbine.operationType to set turbine property and corresponding
    //massFlowOrPowerOutValue.. 
    //operationType options: "Steam Flow", "Power Generation", "Balance Header", "Power Range", "Flow Range"
    //turbine() options: Mass Flow or Power Out.. not sure how those correspond
    let massFlowOrPowerOutValue: number = 0;
    _ssmtOutputData.highPressureToLowPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: _highPressureSteam.pressure,
        inletQuantity: 1,
        inletQuantityValue: _highPressureSteam.specificEnthalpy,
        turbineProperty: _highToLowPressureTurbine.operationType,
        isentropicEfficiency: _highToLowPressureTurbine.isentropicEfficiency,
        generatorEfficiency: _highToLowPressureTurbine.generationEfficiency,
        massFlowOrPowerOut: massFlowOrPowerOutValue,
        outletSteamPressure: _lowPressureHeaderInput.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      _settings
    )
    return _ssmtOutputData;
  }

  initializeHighPressureToMediumPressureTurbine(_highToMediumPressureTurbine: PressureTurbine, _highPressureSteam: SteamPropertiesOutput, _mediumPressureHeaderInput: HeaderNotHighestPressure, _ssmtOutputData: SSMTOutput, _settings: Settings): SSMTOutput {
    //TODO: highToMediumPressureTurbine.operationType to set turbine property and corresponding
    //massFlowOrPowerOutValue.. 
    //operationType options: "Steam Flow", "Power Generation", "Balance Header", "Power Range", "Flow Range"
    //turbine() options: Mass Flow or Power Out.. not sure how those correspond
    let massFlowOrPowerOutValue: number = 0;
    _ssmtOutputData.highPressureToMediumPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: _highPressureSteam.pressure,
        inletQuantity: 1,
        inletQuantityValue: _highPressureSteam.specificEnthalpy,
        turbineProperty: _highToMediumPressureTurbine.operationType,
        isentropicEfficiency: _highToMediumPressureTurbine.isentropicEfficiency,
        generatorEfficiency: _highToMediumPressureTurbine.generationEfficiency,
        massFlowOrPowerOut: massFlowOrPowerOutValue,
        outletSteamPressure: _mediumPressureHeaderInput.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      _settings
    )
    return _ssmtOutputData;
  }

  initializeMediumPressureToLowPressureTurbine(_mediumToLowPressureTurbine: PressureTurbine, _mediumPressureSteam: SteamPropertiesOutput, _lowPressureHeaderInput: HeaderNotHighestPressure, _ssmtOutputData: SSMTOutput, _settings: Settings): SSMTOutput {
    //TODO: mediumToLowPressureTurbine.operationType to set turbine property and corresponding
    //massFlowOrPowerOutValue.. 
    //operationType options: "Steam Flow", "Power Generation", "Balance Header", "Power Range", "Flow Range"
    //turbine() options: Mass Flow or Power Out.. not sure how those correspond
    let massFlowOrPowerOutValue: number = 0;
    _ssmtOutputData.mediumPressureToLowPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: _mediumPressureSteam.pressure,
        inletQuantity: 1,
        inletQuantityValue: _mediumPressureSteam.specificEnthalpy,
        turbineProperty: _mediumToLowPressureTurbine.operationType,
        isentropicEfficiency: _mediumToLowPressureTurbine.isentropicEfficiency,
        generatorEfficiency: _mediumToLowPressureTurbine.generationEfficiency,
        massFlowOrPowerOut: massFlowOrPowerOutValue,
        outletSteamPressure: _lowPressureHeaderInput.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      _settings
    )
    return _ssmtOutputData;
  }

  calculateTotalPowerCost(_operationsInput: OperationsInput, _ssmtOutputData: SSMTOutput): SSMTOutput {
    //cost = electricityCosts or makeupWaterCosts or fuelCosts? 
    _ssmtOutputData.siteTotalPowerCost = _operationsInput.sitePowerImport * _operationsInput.operatingHoursPerYear * _operationsInput.electricityCosts;
    return _ssmtOutputData;
  }

  initializeMakeupWater(_makeupWaterTemp: number, _ssmtOutputData: SSMTOutput, _settings: Settings): SSMTOutput {
    _ssmtOutputData.makeupWater = this.steamService.steamProperties(
      {
        thermodynamicQuantity: 0, //temperature
        quantityValue: _makeupWaterTemp,
        pressure: 0.101325 //atmospherice pressure
      },
      _settings
    )
    return _ssmtOutputData;
  }


  initializeOutputDataObject(): SSMTOutput {
    return {
      //1 always
      operationsOutput: undefined,
      boilerOutput: undefined,
      deaeratorOutput: undefined,
      feedwater: undefined,
      highPressureHeader: undefined,
      highPressureHeaderSteam: undefined,
      blowdown: undefined,
      condensate: undefined,
      makeupWater: undefined,
      makeupWaterAndCondensate: undefined,
      highPressureProcessSteamUsage: undefined,
      //Optional
      //0-4
      condensingTurbine: undefined,
      highPressureToMediumPressureTurbine: undefined,
      highPressureToLowPressureTurbine: undefined,
      mediumPressureToLowPressureTurbine: undefined,
      //additional headers
      mediumPressureHeader: undefined,
      mediumPressureHeaderSteam: undefined,
      lowPressureHeaderSteam: undefined,
      lowPressureHeader: undefined,
      //0-2 PRV
      highPressureToMediumPressurePrv: undefined,
      mediumPressureToLowPressurePrv: undefined,
      //0-4 flash tanks
      blowdownFlashTank: undefined,
      condensateFlashTank: undefined,
      highPressureCondensateFlashTank: undefined,
      mediumPressureCondensateFlashTank: undefined,
      //TODO: Heat Exchange
      //heatExchange?: HeatExchange
      //vented steam
      ventedSteam: undefined,


      //additions may not be needed for results but used for calculations
      steamToDeaerator: undefined,
      lowPressurePRVneed: undefined,
      lowPressureSteamVent: undefined,

      mediumPressureSteamNeed: undefined,
      lowPressureSteamNeed: undefined,
      blowdownFlashLiquid: undefined,
      blowdownGasToLowPressure: undefined,
      condensateReturnVent: undefined,
      inititialReturnCondensate: undefined,
      initialHighPressureCondensate: undefined,
      highPressureSaturatedLiquidEnthalpy: undefined,
      intitialMediumPressureCondensate: undefined,
      mediumPressureSaturatedLiquidEnthalpy: undefined,
      initialLowPressureCondensate: undefined,
      lowPressureSaturatedLiquidEnthalpy: undefined,
      highPressureToLowPressureTurbineFlow: undefined,
      highPressureToMediumPressureTurbineFlow: undefined,
      mediumPressureToLowPressureTurbineModelFlow: undefined,
      mediumPressureSteamRemaining: undefined,
      turbineCondensateSteamCooled: undefined,
      siteTotalPowerCost: undefined,

      finalHighPressureCondensate: undefined,
      finalMediumPressureCondensate: undefined,
      finalLowPressureCondensate: undefined,
      highPressureSteamGasToMediumPressure: undefined,
      mediumPressureSteamGasToLowPressure: undefined
    }
  }
}
