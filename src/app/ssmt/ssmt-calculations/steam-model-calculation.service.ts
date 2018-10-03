import { Injectable } from '@angular/core';
import { BoilerOutput, PrvOutput, TurbineOutput, FlashTankOutput, DeaeratorOutput, SteamPropertiesOutput } from '../../shared/models/steam';
import { BoilerInput, SSMTInputs, Header, TurbineInput, CondensingTurbine, PressureTurbine, OperationsInput } from '../../shared/models/ssmt';

import * as _ from 'lodash';
import { SteamService } from '../../calculator/steam/steam.service';
import { Settings } from '../../shared/models/settings';
import { SSMTOutput, HeaderOutputObj } from '../../shared/models/steam-outputs';
import { BalanceTurbinesService } from './balance-turbines.service';


@Injectable()
export class SteamModelCalculationService {
  //idk what this is used for..
  energyUsageFixed: boolean;
  setSetEnergyUsageHP: number;
  //globals
  _settings: Settings;
  _inputData: SSMTInputs;
  //models
  ssmtOutputData: SSMTOutput;
  // boilerModel: BoilerOutput;
  // ssmtOutputData.highPressureHeader: HeaderOutputObj;

  // mediumToLowPressurePRV: PrvOutput;
  // prv2Model: PrvOutput;
  // ssmtOutputData.condensingTurbine: TurbineOutput;
  // ssmtOutputData.highPressureToLowPressureTurbine: TurbineOutput;
  // ssmtOutputData.highPressureToMediumPressureTurbine: TurbineOutput;
  // mediumPressureToLowPressureTurbineModel: TurbineOutput;
  // ssmtOutputData.blowdownFlashTank: FlashTankOutput;
  // ssmtOutputData.condensateFlashTank: FlashTankOutput;
  // flashTank3Model: FlashTankOutput;
  // flashTank4Model: FlashTankOutput;
  // deaeratorModel: DeaeratorOutput;
  // process1Model: number;
  // process2Model: number;
  // process3Model: number;
  // makeupWaterModel: number;

  //constants
  steamToDeaerator: number;
  lowPressureSteamVent: number;
  lowPressurePRVneed: number;
  mediumPressureSteamNeed: number;
  lowPressureSteamNeed: number;
  // blowdown: SteamPropertiesOutput;
  blowdownFlashLiquid: SteamPropertiesOutput;
  blowdownGasToLowPressure: SteamPropertiesOutput;

  initialHighPressureCondensate: SteamPropertiesOutput;
  finalHighPressureCondensate: SteamPropertiesOutput;
  highPressureSaturatedLiquidEnthalpy: number;

  intitialMediumPressureCondensate: SteamPropertiesOutput;
  finalMediumPressureCondensate: SteamPropertiesOutput;
  mediumPressureSaturatedLiquidEnthalpy: number;

  initialLowPressureCondensate: SteamPropertiesOutput;
  finalLowPressureCondensate: SteamPropertiesOutput;
  lowPressureSaturatedLiquidEnthalpy: number;

  inititialReturnCondensate: SteamPropertiesOutput;
  condensateReturnVent: SteamPropertiesOutput;
  condensate: SteamPropertiesOutput;

  highPressureSteamGasToMediumPressure: SteamPropertiesOutput;
  mediumPressureSteamGasToLowPressure: SteamPropertiesOutput;

  turbineCondensateSteamCooled: SteamPropertiesOutput;

  siteTotalPowerCost: number;
  // makeupWater: SteamPropertiesOutput;
  // feedwater: SteamPropertiesOutput;

  _additionalSteamFlow: number;
  _steamProduction: number;
  highPressureSteamUsage: number;
  mediumPressureSteamUsage: number;
  lowPressureSteamUsage: number;


  constructor(private steamService: SteamService, private balanceTurbinesService: BalanceTurbinesService) { }

  calculate(inputData: SSMTInputs, settings: Settings) {
    this._inputData = inputData;
    this._settings = settings;
    this.initializeSteamProperties();
    this._additionalSteamFlow = this.iterateModel();

  }

  iterateModel(): number {
    let additionalSteamFlow: number = this.steamToDeaerator;
    if (additionalSteamFlow == 0) {
      additionalSteamFlow = 1;
    }
    if (this._additionalSteamFlow) {
      additionalSteamFlow = this._additionalSteamFlow;
    }

    let adjustment: number = this.convergeAdjustment(additionalSteamFlow);

    return additionalSteamFlow;
  }

  convergeAdjustment(additionalSteamFlow: number): number {
    let requirement: number = .5;
    let adjustment: number = 1;
    let adjustmentLast: number = 0;
    let cc: number = 0;
    while (
      adjustment != 0 &&
      (Math.abs(adjustment - adjustmentLast / adjustment) > requirement) &&
      cc++ < 15 &&
      Math.abs(adjustment) != Math.abs(adjustmentLast)
    ) {
      adjustmentLast = adjustment;
      adjustment = this.runModel(additionalSteamFlow);
      if (isNaN(adjustment)) {
        break
      }
    }
    return adjustment;
  }

  runModel(additionalSteamFlow: number, steamProduction?: number): number {
    //1a. Estimate steam production
    if (steamProduction) {
      this._steamProduction = steamProduction;
    } else {
      this._steamProduction = this.highPressureSteamUsage + this.mediumPressureSteamUsage + this.lowPressureSteamUsage + additionalSteamFlow + this.ssmtOutputData.condensingTurbine.massFlow;
    }

    //1b. Adjust boiler model steam production, feedwater and blowdown massflows
    this.ssmtOutputData.boilerOutput = this.updateBoilerModel(this.ssmtOutputData.boilerOutput, this._steamProduction);
    this.setBlowdown(this.ssmtOutputData.boilerOutput);
    this.setFeedwater(this.ssmtOutputData.boilerOutput);

    //1c. Model
    if (this._inputData.boilerInput.blowdownFlashed) {
      //use the ssmtOutputData.highPressureHeader here?
      //TODO: add lowPressureHeaderModel
      this.setBlowdownFlashTankModel(this._inputData.headerInput[2].pressure);
      this.blowdownGasToLowPressure = {
        pressure: this.ssmtOutputData.blowdownFlashTank.outletGasPressure,
        temperature: this.ssmtOutputData.blowdownFlashTank.outletGasTemperature,
        specificEnthalpy: this.ssmtOutputData.blowdownFlashTank.outletGasSpecificEnthalpy,
        specificEntropy: this.ssmtOutputData.blowdownFlashTank.outletGasSpecificEntropy,
        quality: this.ssmtOutputData.blowdownFlashTank.outletGasQuality,
        massFlow: this.ssmtOutputData.blowdownFlashTank.outletGasMassFlow,
        energyFlow: this.ssmtOutputData.blowdownFlashTank.outletGasEnergyFlow,
      }
      this.blowdownFlashLiquid = {
        pressure: this.ssmtOutputData.blowdownFlashTank.outletLiquidPressure,
        temperature: this.ssmtOutputData.blowdownFlashTank.outletLiquidTemperature,
        specificEnthalpy: this.ssmtOutputData.blowdownFlashTank.outletLiquidSpecificEnthalpy,
        specificEntropy: this.ssmtOutputData.blowdownFlashTank.outletLiquidSpecificEntropy,
        quality: this.ssmtOutputData.blowdownFlashTank.outletLiquidQuality,
        massFlow: this.ssmtOutputData.blowdownFlashTank.outletLiquidMassFlow,
        energyFlow: this.ssmtOutputData.blowdownFlashTank.outletLiquidEnergyFlow
      }
    }

    //2. High Pressure Header
    //2a. model
    this.ssmtOutputData.highPressureHeader = this.steamService.header(
      {
        headerPressure: this._inputData.headerInput[0].pressure,
        inlets: [{
          pressure: this.ssmtOutputData.boilerOutput.steamPressure,
          thermodynamicQuantity: 1,
          quantityValue: this.ssmtOutputData.boilerOutput.steamSpecificEnthalpy,
          massFlow: this.ssmtOutputData.boilerOutput.steamMassFlow
        }
        ]
      },
      this._settings
    ).header;
    this.ssmtOutputData.highPressureHeader = this.setHeatLoss(this.ssmtOutputData.highPressureHeader, this._inputData.headerInput[0].heatLoss);
    //2b. "remove HP process steam usages"
    //no idea what the fixed usage stuff is..
    // if (this.energyUsageFixed) {
    //   this.highPressureSteamUsage = this.setSetEnergyUsageHP * 100 / (this.ssmtOutputData.highPressureHeader.re.outletSpecificEnthalpy - this.highPressureSaturatedLiquidEnthalpy);
    // }
    this.ssmtOutputData.highPressureHeader.remainingSteam.massFlow = this.ssmtOutputData.highPressureHeader.remainingSteam.massFlow - this.highPressureSteamUsage;
    this.ssmtOutputData.highPressureHeader.massFlow = this.ssmtOutputData.highPressureHeader.remainingSteam.massFlow;
    //2c. Evaluate turbine steam usage
    this.ssmtOutputData = this.balanceTurbinesService.balanceTurbines(this._inputData.turbineInput, this.ssmtOutputData, this.mediumPressureSteamNeed, this.lowPressureSteamNeed);
    this.ssmtOutputData.highPressureHeader.remainingSteam.massFlow = this.ssmtOutputData.highPressureHeader.remainingSteam.massFlow - this.ssmtOutputData.condensingTurbine.massFlow;
    this.ssmtOutputData.highPressureHeader.remainingSteam.massFlow = this.ssmtOutputData.highPressureHeader.remainingSteam.massFlow - this.ssmtOutputData.highPressureToLowPressureTurbine.massFlow;
    this.ssmtOutputData.highPressureHeader.remainingSteam.massFlow = this.ssmtOutputData.highPressureHeader.remainingSteam.massFlow - this.ssmtOutputData.highPressureToMediumPressureTurbine.massFlow;
    this.ssmtOutputData.highPressureHeader.massFlow = this.ssmtOutputData.highPressureHeader.remainingSteam.massFlow;
    this.ssmtOutputData.highPressureHeaderSteam = this.ssmtOutputData.highPressureHeader.remainingSteam;
    this.ssmtOutputData.highPressureHeaderSteam.massFlow = this.highPressureSteamUsage;
    //2d. Process Condensate
    this.initialHighPressureCondensate.massFlow = this.highPressureSteamUsage * (this._inputData.headerInput[0].condensationRecoveryRate / 100);
    this.finalHighPressureCondensate = this.initialHighPressureCondensate;

    if (this._inputData.headerInput[0].flashCondensateReturn) {
      //flash medium header input pressure or medium header input model pressure?
      this.ssmtOutputData.condensateFlashTank = this.steamService.flashTank(
        {
          inletWaterPressure: this.finalHighPressureCondensate.pressure,
          quantityValue: this.finalHighPressureCondensate.specificEnthalpy,
          thermodynamicQuantity: 1,
          inletWaterMassFlow: this.finalHighPressureCondensate.massFlow,
          tankPressure: this._inputData.headerInput[1].pressure
        },
        this._settings
      );
      this.highPressureSteamGasToMediumPressure = {
        pressure: this.ssmtOutputData.condensateFlashTank.outletGasPressure,
        temperature: this.ssmtOutputData.condensateFlashTank.outletGasTemperature,
        specificEnthalpy: this.ssmtOutputData.condensateFlashTank.outletGasSpecificEnthalpy,
        specificEntropy: this.ssmtOutputData.condensateFlashTank.outletGasSpecificEntropy,
        quality: this.ssmtOutputData.condensateFlashTank.outletGasQuality,
        massFlow: this.ssmtOutputData.condensateFlashTank.outletGasMassFlow,
        energyFlow: this.ssmtOutputData.condensateFlashTank.outletGasEnergyFlow
      }
      this.finalHighPressureCondensate = {
        pressure: this.ssmtOutputData.condensateFlashTank.outletLiquidPressure,
        temperature: this.ssmtOutputData.condensateFlashTank.outletLiquidTemperature,
        specificEnthalpy: this.ssmtOutputData.condensateFlashTank.outletLiquidSpecificEnthalpy,
        specificEntropy: this.ssmtOutputData.condensateFlashTank.outletLiquidSpecificEntropy,
        quality: this.ssmtOutputData.condensateFlashTank.outletLiquidQuality,
        massFlow: this.ssmtOutputData.condensateFlashTank.outletLiquidMassFlow,
        energyFlow: this.ssmtOutputData.condensateFlashTank.outletLiquidEnergyFlow
      }
    }
    //2e. High pressure to medium pressure header reducing value
    if (this._inputData.headerInput[1].desuperheatSteamIntoNextHighest) {
      //medium pressure input?
      this.ssmtOutputData.highPressureToMediumPressurePrv = this.steamService.prvWithDesuperheating(
        {
          inletPressure: this.ssmtOutputData.highPressureHeader.remainingSteam.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: this.ssmtOutputData.highPressureHeader.remainingSteam.specificEnthalpy,
          inletMassFlow: this.ssmtOutputData.highPressureHeader.remainingSteam.massFlow,
          outletPressure: this._inputData.headerInput[1].pressure,
          feedwaterPressure: this.ssmtOutputData.feedwater.pressure,
          feedwaterThermodynamicQuantity: 1,//1 is enthalpy
          feedwaterQuantityValue: this.ssmtOutputData.feedwater.specificEnthalpy,
          desuperheatingTemp: this._inputData.headerInput[1].desuperheatSteamTemperature
        },
        this._settings
      );
    } else {
      //medium pressure input?
      this.ssmtOutputData.highPressureToMediumPressurePrv = this.steamService.prvWithoutDesuperheating(
        {
          inletPressure: this.ssmtOutputData.highPressureHeader.remainingSteam.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: this.ssmtOutputData.highPressureHeader.remainingSteam.specificEnthalpy,
          inletMassFlow: this.ssmtOutputData.highPressureHeader.remainingSteam.massFlow,
          outletPressure: this._inputData.headerInput[1].pressure,
          feedwaterPressure: undefined,
          feedwaterThermodynamicQuantity: undefined,
          feedwaterQuantityValue: undefined,
          desuperheatingTemp: undefined
        },
        this._settings
      );
    }

    //3. Medium Pressure Header
    //3a. Set up Medium Pressure Header
    this.ssmtOutputData.mediumPressureHeader = this.steamService.header(
      {
        headerPressure: this._inputData.headerInput[1].pressure,
        inlets: [{
          pressure: this.ssmtOutputData.highPressureToMediumPressurePrv.outletPressure,
          thermodynamicQuantity: 1,
          quantityValue: this.ssmtOutputData.highPressureToMediumPressurePrv.outletSpecificEnthalpy,
          massFlow: this.ssmtOutputData.highPressureToMediumPressurePrv.outletMassFlow
        },
        {
          pressure: this.highPressureSteamGasToMediumPressure.pressure,
          thermodynamicQuantity: 1,
          quantityValue: this.highPressureSteamGasToMediumPressure.specificEnthalpy,
          massFlow: this.highPressureSteamGasToMediumPressure.massFlow
        },
        {
          pressure: this.ssmtOutputData.highPressureToMediumPressureTurbine.outletPressure,
          thermodynamicQuantity: 1,
          quantityValue: this.ssmtOutputData.highPressureToMediumPressureTurbine.outletSpecificEnthalpy,
          massFlow: this.ssmtOutputData.highPressureToMediumPressureTurbine.massFlow
        }
        ]
      },
      this._settings
    ).header;
    this.ssmtOutputData.mediumPressureHeader = this.setHeatLoss(this.ssmtOutputData.mediumPressureHeader, this._inputData.headerInput[1].heatLoss);
    //3b. "remove MP process steam usages"
    //no idea what the fixed usage stuff is..
    // if (this.energyUsageFixed) {
    //   this.highPressureSteamUsage = this.setSetEnergyUsageHP * 100 / (this.ssmtOutputData.mediumPressureHeader.re.outletSpecificEnthalpy - this.highPressureSaturatedLiquidEnthalpy);
    // }
    this.ssmtOutputData.mediumPressureHeader.remainingSteam.massFlow = this.ssmtOutputData.mediumPressureHeader.remainingSteam.massFlow - this.mediumPressureSteamUsage;
    this.ssmtOutputData.mediumPressureHeader.massFlow = this.ssmtOutputData.mediumPressureHeader.remainingSteam.massFlow;
    //3c.set inlet steam
    this.ssmtOutputData.mediumPressureToLowPressureTurbine.inletEnergyFlow = this.ssmtOutputData.mediumPressureHeader.remainingSteam.energyFlow;
    this.ssmtOutputData.mediumPressureToLowPressureTurbine.inletPressure = this.ssmtOutputData.mediumPressureHeader.remainingSteam.pressure;
    this.ssmtOutputData.mediumPressureToLowPressureTurbine.inletQuality = this.ssmtOutputData.mediumPressureHeader.remainingSteam.quality;
    this.ssmtOutputData.mediumPressureToLowPressureTurbine.inletSpecificEnthalpy = this.ssmtOutputData.mediumPressureHeader.remainingSteam.specificEnthalpy;
    this.ssmtOutputData.mediumPressureToLowPressureTurbine.inletSpecificEntropy = this.ssmtOutputData.mediumPressureHeader.remainingSteam.specificEntropy;
    this.ssmtOutputData.mediumPressureToLowPressureTurbine.inletTemperature = this.ssmtOutputData.mediumPressureHeader.remainingSteam.temperature;
    this.ssmtOutputData = this.balanceTurbinesService.balanceTurbines(this._inputData.turbineInput, this.ssmtOutputData, this.mediumPressureSteamNeed, this.lowPressureSteamNeed);
    //update medium pressure header remaining steam after balancing
    this.ssmtOutputData.mediumPressureHeader.remainingSteam.massFlow = this.ssmtOutputData.mediumPressureHeader.remainingSteam.massFlow - this.ssmtOutputData.mediumPressureToLowPressureTurbine.massFlow;
    this.mediumPressureSteamNeed = this.mediumPressureSteamUsage + this.ssmtOutputData.mediumPressureToLowPressureTurbine.massFlow - this.highPressureSteamGasToMediumPressure.massFlow;

    if (this.ssmtOutputData.mediumPressureToLowPressurePrv.inletMassFlow) {
      this.mediumPressureSteamNeed = this.mediumPressureSteamNeed + this.ssmtOutputData.mediumPressureToLowPressurePrv.inletMassFlow;
    }
    this.ssmtOutputData.mediumPressureHeaderSteam = this.ssmtOutputData.mediumPressureHeader.remainingSteam;
    this.ssmtOutputData.mediumPressureHeaderSteam.massFlow = this.mediumPressureSteamUsage;

    //3d. Process Condensate
    this.intitialMediumPressureCondensate.massFlow = this.mediumPressureSteamUsage * (this._inputData.headerInput[1].condensationRecoveryRate / 100);
    let mixHighPressureLowPressure: HeaderOutputObj = this.steamService.header(
      {
        headerPressure: this._inputData.headerInput[1].pressure,
        inlets: [{
          pressure: this.finalHighPressureCondensate.pressure,
          thermodynamicQuantity: 1,
          quantityValue: this.finalHighPressureCondensate.specificEnthalpy,
          massFlow: this.finalHighPressureCondensate.massFlow
        },
        {
          pressure: this.intitialMediumPressureCondensate.pressure,
          thermodynamicQuantity: 1,
          quantityValue: this.intitialMediumPressureCondensate.specificEnthalpy,
          massFlow: this.intitialMediumPressureCondensate.massFlow
        }
        ]
      },
      this._settings
    ).header;
    let mediumPressureCondensateMixed: SteamPropertiesOutput = mixHighPressureLowPressure;
    this.finalMediumPressureCondensate = mediumPressureCondensateMixed;
    if (this._inputData.headerInput[1].flashCondensateIntoHeader) {
      this.ssmtOutputData.mediumPressureCondesnateFlashTank = this.steamService.flashTank(
        {
          inletWaterPressure: this.finalMediumPressureCondensate.pressure,
          quantityValue: this.finalMediumPressureCondensate.specificEnthalpy,
          thermodynamicQuantity: 1,
          inletWaterMassFlow: this.finalMediumPressureCondensate.massFlow,
          tankPressure: this._inputData.headerInput[2].pressure
        },
        this._settings
      );
      this.mediumPressureSteamGasToLowPressure = {
        pressure: this.ssmtOutputData.mediumPressureCondesnateFlashTank.outletGasPressure,
        temperature: this.ssmtOutputData.mediumPressureCondesnateFlashTank.outletGasTemperature,
        specificEnthalpy: this.ssmtOutputData.mediumPressureCondesnateFlashTank.outletGasSpecificEnthalpy,
        specificEntropy: this.ssmtOutputData.mediumPressureCondesnateFlashTank.outletGasSpecificEntropy,
        quality: this.ssmtOutputData.mediumPressureCondesnateFlashTank.outletGasQuality,
        massFlow: this.ssmtOutputData.mediumPressureCondesnateFlashTank.outletGasMassFlow,
        energyFlow: this.ssmtOutputData.mediumPressureCondesnateFlashTank.outletGasEnergyFlow
      }
      this.finalHighPressureCondensate = {
        pressure: this.ssmtOutputData.mediumPressureCondesnateFlashTank.outletLiquidPressure,
        temperature: this.ssmtOutputData.mediumPressureCondesnateFlashTank.outletLiquidTemperature,
        specificEnthalpy: this.ssmtOutputData.mediumPressureCondesnateFlashTank.outletLiquidSpecificEnthalpy,
        specificEntropy: this.ssmtOutputData.mediumPressureCondesnateFlashTank.outletLiquidSpecificEntropy,
        quality: this.ssmtOutputData.mediumPressureCondesnateFlashTank.outletLiquidQuality,
        massFlow: this.ssmtOutputData.mediumPressureCondesnateFlashTank.outletLiquidMassFlow,
        energyFlow: this.ssmtOutputData.mediumPressureCondesnateFlashTank.outletLiquidEnergyFlow
      }
    }
    //3e. Medium Pressure to Low Pressure reducing value
    if (this._inputData.headerInput[2].desuperheatSteamIntoNextHighest) {
      this.ssmtOutputData.mediumPressureToLowPressurePrv = this.steamService.prvWithDesuperheating(
        {
          inletPressure: this.ssmtOutputData.mediumPressureHeader.remainingSteam.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: this.ssmtOutputData.mediumPressureHeader.remainingSteam.specificEnthalpy,
          inletMassFlow: this.ssmtOutputData.mediumPressureHeader.remainingSteam.massFlow,
          outletPressure: this._inputData.headerInput[2].pressure,
          feedwaterPressure: this.ssmtOutputData.feedwater.pressure,
          feedwaterThermodynamicQuantity: 1,//1 is enthalpy
          feedwaterQuantityValue: this.ssmtOutputData.feedwater.specificEnthalpy,
          desuperheatingTemp: this._inputData.headerInput[2].desuperheatSteamTemperature
        },
        this._settings
      );
    } else {
      this.ssmtOutputData.mediumPressureToLowPressurePrv = this.steamService.prvWithoutDesuperheating(
        {
          inletPressure: this.ssmtOutputData.mediumPressureHeader.remainingSteam.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: this.ssmtOutputData.mediumPressureHeader.remainingSteam.specificEnthalpy,
          inletMassFlow: this.ssmtOutputData.mediumPressureHeader.remainingSteam.massFlow,
          outletPressure: this._inputData.headerInput[2].pressure,
          feedwaterPressure: undefined,
          feedwaterThermodynamicQuantity: undefined,
          feedwaterQuantityValue: undefined,
          desuperheatingTemp: undefined
        },
        this._settings
      );
    }
    //4. Low Pressure Header
    //4a. Setup low pressure header
    this.ssmtOutputData.lowPressureHeader = this.steamService.header(
      {
        headerPressure: this._inputData.headerInput[2].pressure,
        inlets: [{
          pressure: this.ssmtOutputData.mediumPressureToLowPressurePrv.outletPressure,
          thermodynamicQuantity: 1,
          quantityValue: this.ssmtOutputData.mediumPressureToLowPressurePrv.outletSpecificEnthalpy,
          massFlow: this.ssmtOutputData.mediumPressureToLowPressurePrv.outletMassFlow
        },
        {
          pressure: this.mediumPressureSteamGasToLowPressure.pressure,
          thermodynamicQuantity: 1,
          quantityValue: this.mediumPressureSteamGasToLowPressure.specificEnthalpy,
          massFlow: this.mediumPressureSteamGasToLowPressure.massFlow
        },
        {
          pressure: this.blowdownGasToLowPressure.pressure,
          thermodynamicQuantity: 1,
          quantityValue: this.blowdownGasToLowPressure.specificEnthalpy,
          massFlow: this.blowdownGasToLowPressure.massFlow
        },
        {
          pressure: this.ssmtOutputData.highPressureToLowPressureTurbine.outletPressure,
          thermodynamicQuantity: 1,
          quantityValue: this.ssmtOutputData.highPressureToLowPressureTurbine.outletSpecificEnthalpy,
          massFlow: this.ssmtOutputData.highPressureToLowPressureTurbine.massFlow
        },
        {
          pressure: this.ssmtOutputData.mediumPressureToLowPressureTurbine.outletPressure,
          thermodynamicQuantity: 1,
          quantityValue: this.ssmtOutputData.mediumPressureToLowPressureTurbine.outletSpecificEnthalpy,
          massFlow: this.ssmtOutputData.mediumPressureToLowPressureTurbine.massFlow
        }
        ]
      },
      this._settings
    ).header;
    this.ssmtOutputData.lowPressureHeader = this.setHeatLoss(this.ssmtOutputData.lowPressureHeader, this._inputData.headerInput[2].heatLoss);
    this.ssmtOutputData.lowPressureHeader.remainingSteam.massFlow = this.ssmtOutputData.lowPressureHeader.remainingSteam.massFlow - this.lowPressureSteamVent;
    //4b. Remove Low Pressure Process Steam Usages
    //no idea what the fixed usage stuff is..
    // if (this.energyUsageFixed) {
    //   this.highPressureSteamUsage = this.setSetEnergyUsageHP * 100 / (this.ssmtOutputData.mediumPressureHeader.re.outletSpecificEnthalpy - this.highPressureSaturatedLiquidEnthalpy);
    // }
    this.ssmtOutputData.lowPressureHeader.remainingSteam.massFlow = this.ssmtOutputData.lowPressureHeader.remainingSteam.massFlow - this.lowPressureSteamUsage;
    this.ssmtOutputData.lowPressureHeader.massFlow = this.ssmtOutputData.lowPressureHeader.remainingSteam.massFlow;

    this.ssmtOutputData.lowPressureHeaderSteam = this.ssmtOutputData.lowPressureHeader.remainingSteam;
    this.ssmtOutputData.lowPressureHeaderSteam.massFlow = this.lowPressureSteamUsage;

    //4c. process condensate
    this.initialLowPressureCondensate.massFlow = this.lowPressureSteamUsage * (this._inputData.headerInput[2].condensationRecoveryRate / 100)
    this.finalLowPressureCondensate = this.steamService.header(
      {
        headerPressure: this._inputData.headerInput[2].pressure,
        inlets: [
          {
            pressure: this.finalMediumPressureCondensate.pressure,
            thermodynamicQuantity: 1,
            quantityValue: this.finalMediumPressureCondensate.specificEnthalpy,
            massFlow: this.finalMediumPressureCondensate.massFlow
          },
          {
            pressure: this.initialLowPressureCondensate.pressure,
            thermodynamicQuantity: 1,
            quantityValue: this.initialLowPressureCondensate.specificEnthalpy,
            massFlow: this.initialLowPressureCondensate.massFlow
          },
        ]
      }
      , this._settings).header;

    this.inititialReturnCondensate.massFlow = this.finalLowPressureCondensate.massFlow;
    if (this._inputData.headerInput[0].flashCondensateReturn) {
      this.ssmtOutputData.condensateFlashTank = this.steamService.flashTank({
        inletWaterPressure: this.inititialReturnCondensate.pressure,
        quantityValue: this.inititialReturnCondensate.specificEnthalpy,
        thermodynamicQuantity: 1,
        inletWaterMassFlow: this.inititialReturnCondensate.massFlow,
        tankPressure: this._inputData.boilerInput.deaeratorPressure
      },
        this._settings)
      //gas generated from flash tank (gas)
      this.condensateReturnVent = {
        pressure: this.ssmtOutputData.condensateFlashTank.outletGasPressure,
        temperature: this.ssmtOutputData.condensateFlashTank.outletGasTemperature,
        specificEnthalpy: this.ssmtOutputData.condensateFlashTank.outletGasSpecificEnthalpy,
        specificEntropy: this.ssmtOutputData.condensateFlashTank.outletGasSpecificEntropy,
        quality: this.ssmtOutputData.condensateFlashTank.outletGasQuality,
        massFlow: this.ssmtOutputData.condensateFlashTank.outletGasMassFlow,
        energyFlow: this.ssmtOutputData.condensateFlashTank.outletGasEnergyFlow
      };
      //condensate after flashed (liquid)
      this.condensate = {
        pressure: this.ssmtOutputData.condensateFlashTank.outletLiquidPressure,
        temperature: this.ssmtOutputData.condensateFlashTank.outletLiquidTemperature,
        specificEnthalpy: this.ssmtOutputData.condensateFlashTank.outletLiquidSpecificEnthalpy,
        specificEntropy: this.ssmtOutputData.condensateFlashTank.outletLiquidSpecificEntropy,
        quality: this.ssmtOutputData.condensateFlashTank.outletLiquidQuality,
        massFlow: this.ssmtOutputData.condensateFlashTank.outletLiquidMassFlow,
        energyFlow: this.ssmtOutputData.condensateFlashTank.outletLiquidEnergyFlow
      };
    } else {
      this.condensate.massFlow = this.ssmtOutputData.condensingTurbine.massFlow;
    }

    //return daSteamDifference prvSteamRequirement
    return
  }

  initializeSteamProperties() {
    //constants needed for this function
    //headers from UI
    let lowPressureHeaderInput: Header = this._inputData.headerInput[2];
    let mediumPressureHeaderInput: Header = this._inputData.headerInput[1];
    let highPressureHeaderInput: Header = this._inputData.headerInput[0];
    let initialSteamUsageGuess: number = lowPressureHeaderInput.processSteamUsage + highPressureHeaderInput.processSteamUsage + mediumPressureHeaderInput.processSteamUsage;
    //intialize data
    this.steamToDeaerator = initialSteamUsageGuess * .1;
    this.lowPressurePRVneed = 0;
    this.lowPressureSteamVent = 0;

    this.mediumPressureSteamNeed = mediumPressureHeaderInput.processSteamUsage;
    this.lowPressureSteamNeed = lowPressureHeaderInput.processSteamUsage;

    //1. Boiler
    this.initializeBoilerModel(this._inputData.boilerInput, highPressureHeaderInput);
    //2. blowdown from boiler
    this.setBlowdown(this.ssmtOutputData.boilerOutput);
    this.blowdownFlashLiquid = this.ssmtOutputData.blowdown;
    //3. Blowdown Flash Tank (flash blowdown (unused steam/water) from boiler)
    //if is skipped in set properties in php for some reason?
    //if(this._inputData.boilerInput.blowdownFlashed){
    this.setBlowdownFlashTankModel(lowPressureHeaderInput.pressure);
    //}
    //4. initialize high/medium/low/return condensate properties
    //4a. high pressure condensate
    this.initializeHighPressureCondensateProperties();
    //4b. medium pressure condensate
    this.initializeMediumPressureCondensateProperties(mediumPressureHeaderInput);
    //4c. low pressure condensate
    this.initializeLowPressureCondensateProperties(lowPressureHeaderInput);
    //4d. return condensate
    this.initializeReturnCondensateProperties(lowPressureHeaderInput, mediumPressureHeaderInput, highPressureHeaderInput);

    //5. initialize handeling of return condensate
    //if flashing the return condensate
    if (highPressureHeaderInput.flashCondensateReturn) {
      //run return steam through flash tank
      //should we be using the intialized steam properties from previous step
      //or the header input data from the UI?
      this.initializeReturnSteamFlashTank(this._inputData.boilerInput, lowPressureHeaderInput, mediumPressureHeaderInput, highPressureHeaderInput);
      //gas generated from flash tank (gas)
      this.condensateReturnVent = {
        pressure: this.ssmtOutputData.condensateFlashTank.outletGasPressure,
        temperature: this.ssmtOutputData.condensateFlashTank.outletGasTemperature,
        specificEnthalpy: this.ssmtOutputData.condensateFlashTank.outletGasSpecificEnthalpy,
        specificEntropy: this.ssmtOutputData.condensateFlashTank.outletGasSpecificEntropy,
        quality: this.ssmtOutputData.condensateFlashTank.outletGasQuality,
        massFlow: this.ssmtOutputData.condensateFlashTank.outletGasMassFlow,
        energyFlow: this.ssmtOutputData.condensateFlashTank.outletGasEnergyFlow
      };
      //condensate after flashed (liquid)
      this.condensate = {
        pressure: this.ssmtOutputData.condensateFlashTank.outletLiquidPressure,
        temperature: this.ssmtOutputData.condensateFlashTank.outletLiquidTemperature,
        specificEnthalpy: this.ssmtOutputData.condensateFlashTank.outletLiquidSpecificEnthalpy,
        specificEntropy: this.ssmtOutputData.condensateFlashTank.outletLiquidSpecificEntropy,
        quality: this.ssmtOutputData.condensateFlashTank.outletLiquidQuality,
        massFlow: this.ssmtOutputData.condensateFlashTank.outletLiquidMassFlow,
        energyFlow: this.ssmtOutputData.condensateFlashTank.outletLiquidEnergyFlow
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
    this.initializeHighPressureHeader(highPressureHeaderInput)
    //7. set high and medium pressure steam properties that will go into? turbines
    //use heat loss values here?
    let highPressureSteam: SteamPropertiesOutput = {
      pressure: this.ssmtOutputData.highPressureHeader.remainingSteam.pressure,
      temperature: this.ssmtOutputData.highPressureHeader.remainingSteam.temperature,
      specificEnthalpy: this.ssmtOutputData.highPressureHeader.remainingSteam.specificEnthalpy,
      specificEntropy: this.ssmtOutputData.highPressureHeader.remainingSteam.specificEntropy,
      quality: this.ssmtOutputData.highPressureHeader.remainingSteam.quality,
      massFlow: this.ssmtOutputData.highPressureHeader.remainingSteam.massFlow,
      energyFlow: this.ssmtOutputData.highPressureHeader.remainingSteam.energyFlow,
    }
    //medium pressure steam using lowPressureInput?
    let mediumPressureSteam: SteamPropertiesOutput = this.steamService.steamProperties(
      {
        pressure: lowPressureHeaderInput.pressure,
        thermodynamicQuantity: 3,
        quantityValue: 1
      },
      this._settings
    );

    //8. Initialize turbines
    //8a. condensing turbine
    this.initializeCondensingTurbineModel(this._inputData.turbineInput.condensingTurbine, highPressureSteam);
    //8b. high pressure to low pressure turbine
    this.initializeHighPressureToLowPressureTurbine(this._inputData.turbineInput.highToLowTurbine, highPressureSteam, lowPressureHeaderInput);
    //8c. high pressure to medium pressure turbine
    this.initializeHighPressureToMediumPressureTurbine(this._inputData.turbineInput.highToMediumTurbine, highPressureSteam, mediumPressureHeaderInput);
    //8d. medium pressure to low pressure turbine
    this.initializeMediumPressureToLowPressureTurbine(this._inputData.turbineInput.mediumToLowTurbine, mediumPressureSteam, lowPressureHeaderInput);
    //php has initialize turbines next?
    //uses turbine method to "setPowerOut", "setFlowRange", and "setPowerRange". May be unecessary given Turbine() setup
    //8e. balance turbines
    //TODO: Balance turbines function

    //9. calculate total power cost
    this.calculateTotalPowerCost(this._inputData.operationsInput);
    //10. calculate make up water
    this.initializeMakeupWater(this._inputData.operationsInput.makeUpWaterTemperature);
    //11. calculate feed water
    this.setFeedwater(this.ssmtOutputData.boilerOutput);

    this.ssmtOutputData = this.balanceTurbinesService.balanceTurbines(this._inputData.turbineInput, this.ssmtOutputData, this.mediumPressureSteamNeed, this.lowPressureSteamNeed);
  }

  initializeBoilerModel(boilerInput: BoilerInput, highPressureHeaderInput: Header) {
    this.ssmtOutputData.boilerOutput = this.steamService.boiler(
      {
        steamPressure: highPressureHeaderInput.pressure,
        blowdownRate: boilerInput.blowdownRate,
        steamMassFlow: 1,
        thermodynamicQuantity: 0,
        quantityValue: boilerInput.steamTemperature,
        combustionEfficiency: boilerInput.combustionEfficiency,
        deaeratorPressure: boilerInput.deaeratorPressure
      },
      this._settings
    );
  }

  setBlowdown(boilerOutput: BoilerOutput) {
    //im not sure this is correct but it's what the php has
    // this.blowdown = this.steamService.steamProperties(
    //   {
    //     pressure: highPressureHeaderInput.pressure,
    //     thermodynamicQuantity: 3,
    //     quantityValue: 0
    //   },
    //   this._settings
    // )
    //may be this: using the boilerModel outputs
    this.ssmtOutputData.blowdown = {
      pressure: boilerOutput.blowdownPressure,
      temperature: boilerOutput.blowdownTemperature,
      specificEnthalpy: boilerOutput.blowdownSpecificEnthalpy,
      specificEntropy: boilerOutput.blowdownSpecificEntropy,
      quality: boilerOutput.blowdownQuality,
      massFlow: boilerOutput.blowdownMassFlow,
      energyFlow: boilerOutput.blowdownEnergyFlow,
    }
  }

  setFeedwater(boilerOutput: BoilerOutput) {
    this.ssmtOutputData.feedwater = {
      pressure: boilerOutput.feedwaterPressure,
      temperature: boilerOutput.feedwaterTemperature,
      specificEnthalpy: boilerOutput.feedwaterSpecificEnthalpy,
      specificEntropy: boilerOutput.feedwaterSpecificEntropy,
      quality: boilerOutput.feedwaterQuality,
      massFlow: boilerOutput.feedwaterMassFlow,
      energyFlow: boilerOutput.feedwaterEnergyFlow,
    }
  }

  setBlowdownFlashTankModel(tankPressure: number) {
    //tankPressure = lowHeaderPressure
    this.ssmtOutputData.blowdownFlashTank = this.steamService.flashTank(
      {
        inletWaterPressure: this.ssmtOutputData.blowdown.pressure,
        thermodynamicQuantity: 3,
        quantityValue: this.ssmtOutputData.blowdown.quality,
        inletWaterMassFlow: this.ssmtOutputData.blowdown.massFlow,
        tankPressure: tankPressure
      },
      this._settings
    )
    //previous versions initial pass through
    // this.ssmtOutputData.blowdownFlashTank = this.steamService.flashTank(
    //   {
    //     inletWaterPressure: highPressureHeaderInput.pressure,
    //     thermodynamicQuantity: 3,
    //     quantityValue: 0,
    //     inletWaterMassFlow: this.ssmtOutputData.boilerOutput.blowdownMassFlow,
    //     tankPressure: lowPressureHeaderInput.pressure
    //   },
    //   this._settings
    // )
  }

  initializeHighPressureCondensateProperties() {
    //php has this as copy of blowdown
    this.initialHighPressureCondensate = this.ssmtOutputData.blowdown;
    this.highPressureSaturatedLiquidEnthalpy = this.initialHighPressureCondensate.specificEnthalpy;
  }

  initializeMediumPressureCondensateProperties(mediumPressureHeaderInput: Header) {
    //get the steam properties based off medium pressure header from UI
    this.intitialMediumPressureCondensate = this.steamService.steamProperties(
      {
        pressure: mediumPressureHeaderInput.pressure,
        thermodynamicQuantity: 3,
        quantityValue: 0
      },
      this._settings
    )
    this.mediumPressureSaturatedLiquidEnthalpy = this.intitialMediumPressureCondensate.specificEnthalpy;
  }

  initializeLowPressureCondensateProperties(lowPressureHeaderInput: Header) {
    //get the steam properties based off low pressure header from UI
    this.initialLowPressureCondensate = this.steamService.steamProperties(
      {
        pressure: lowPressureHeaderInput.pressure,
        thermodynamicQuantity: 3,
        quantityValue: 0
      },
      this._settings
    )
    this.lowPressureSaturatedLiquidEnthalpy = this.initialLowPressureCondensate.specificEnthalpy;
  }

  initializeReturnCondensateProperties(lowPressureHeaderInput: Header, mediumPressureHeaderInput: Header, highPressureHeaderInput: Header) {
    //calculate the return condensate and mass flow..what php has
    this.inititialReturnCondensate = this.steamService.steamProperties(
      {
        pressure: lowPressureHeaderInput.pressure,
        thermodynamicQuantity: 0,
        quantityValue: highPressureHeaderInput.condensateReturnTemperature
      },
      this._settings
    );
    this.inititialReturnCondensate.massFlow =
      highPressureHeaderInput.processSteamUsage * highPressureHeaderInput.condensationRecoveryRate +
      mediumPressureHeaderInput.processSteamUsage * mediumPressureHeaderInput.condensationRecoveryRate +
      lowPressureHeaderInput.processSteamUsage * lowPressureHeaderInput.condensationRecoveryRate;
  }

  initializeReturnSteamFlashTank(boilerInput: BoilerInput, lowPressureHeaderInput: Header, mediumPressureHeaderInput: Header, highPressureHeaderInput: Header) {
    this.ssmtOutputData.condensateFlashTank = this.steamService.flashTank(
      {
        inletWaterPressure: lowPressureHeaderInput.pressure,
        quantityValue: highPressureHeaderInput.condensateReturnTemperature,
        thermodynamicQuantity: 0,
        inletWaterMassFlow:
          highPressureHeaderInput.processSteamUsage * highPressureHeaderInput.condensationRecoveryRate +
          mediumPressureHeaderInput.processSteamUsage * mediumPressureHeaderInput.condensationRecoveryRate +
          lowPressureHeaderInput.processSteamUsage * lowPressureHeaderInput.condensationRecoveryRate
        ,
        tankPressure: boilerInput.deaeratorPressure
      },
      this._settings
    );
  }

  initializeHighPressureHeader(highPressureHeaderInput: Header) {
    //get header calculation results   
    //I DON"T THINK THIS IS CORRECT...
    //are we still using the header input when we get to this step?
    this.ssmtOutputData.highPressureHeader = this.steamService.header(
      {
        headerPressure: highPressureHeaderInput.pressure,
        inlets: [{
          pressure: highPressureHeaderInput.pressure,
          thermodynamicQuantity: 1,
          quantityValue: this.ssmtOutputData.boilerOutput.steamSpecificEnthalpy,
          massFlow: this.ssmtOutputData.boilerOutput.steamMassFlow
        }
        ]
      },
      this._settings
    ).header;
    this.ssmtOutputData.highPressureHeader = this.setHeatLoss(this.ssmtOutputData.highPressureHeader, this._inputData.headerInput[0].heatLoss);
  }

  setHeatLoss(header: HeaderOutputObj, heatLossPercent: number): HeaderOutputObj {
    let tmpHeatLoss = this.steamService.heatLoss(
      {
        inletPressure: header.pressure,
        thermodynamicQuantity: 1,
        quantityValue: header.specificEnthalpy,
        inletMassFlow: header.massFlow,
        percentHeatLoss: heatLossPercent
      },
      this._settings
    );
    header.remainingSteam = {
      pressure: tmpHeatLoss.outletPressure,
      temperature: tmpHeatLoss.outletTemperature,
      specificEnthalpy: tmpHeatLoss.outletSpecificEnthalpy,
      specificEntropy: tmpHeatLoss.outletSpecificEntropy,
      quality: tmpHeatLoss.outletQuality,
      massFlow: tmpHeatLoss.outletMassFlow,
      energyFlow: tmpHeatLoss.outletEnergyFlow,
    }
    header.finalHeaderSteam = {
      pressure: tmpHeatLoss.outletPressure,
      temperature: tmpHeatLoss.outletTemperature,
      specificEnthalpy: tmpHeatLoss.outletSpecificEnthalpy,
      specificEntropy: tmpHeatLoss.outletSpecificEntropy,
      quality: tmpHeatLoss.outletQuality,
      massFlow: tmpHeatLoss.outletMassFlow,
      energyFlow: tmpHeatLoss.outletEnergyFlow,
    }
    return header;
  }

  initializeCondensingTurbineModel(condensingTurbine: CondensingTurbine, highPressureSteam: SteamPropertiesOutput) {
    // solve for = (outlet properties = 0, isentropicEfficiency = 1) - unknown to solve for
    //inlet quantity and quantity value.. All are available, just picked temperature
    //i think if we solve for outlet properties (pretty sure what we want to do here)
    //then outletQuantity and outletQuantityValue doesn't matter otherwise idk what to put there..
    this.ssmtOutputData.condensingTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: highPressureSteam.pressure,
        inletQuantity: 1,
        inletQuantityValue: highPressureSteam.specificEnthalpy,
        turbineProperty: condensingTurbine.operationType,
        isentropicEfficiency: condensingTurbine.isentropicEfficiency,
        generatorEfficiency: condensingTurbine.generationEfficiency,
        massFlowOrPowerOut: condensingTurbine.operationValue,
        outletSteamPressure: condensingTurbine.condenserPressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this._settings
    )
    //2. set properties for steam cooled by condensing turbine
    //energyFlow = energyOut ?
    this.turbineCondensateSteamCooled = {
      pressure: this.ssmtOutputData.condensingTurbine.outletPressure,
      temperature: this.ssmtOutputData.condensingTurbine.outletTemperature,
      specificEnthalpy: this.ssmtOutputData.condensingTurbine.outletSpecificEnthalpy,
      specificEntropy: this.ssmtOutputData.condensingTurbine.outletSpecificEntropy,
      quality: this.ssmtOutputData.condensingTurbine.outletQuality,
      massFlow: this.ssmtOutputData.condensingTurbine.massFlow,
      energyFlow: this.ssmtOutputData.condensingTurbine.energyOut
    }
    //3. calculate massflow or power out properties if using turbine?
    //I think we can skip this step since it's fully calculated in Turbine() call
    if (condensingTurbine.useTurbine) {

    }
  }

  initializeHighPressureToLowPressureTurbine(highToLowPressureTurbine: PressureTurbine, highPressureSteam: SteamPropertiesOutput, lowPressureHeaderInput: Header) {
    //TODO: highToLowPressureTurbine.operationType to set turbine property and corresponding
    //massFlowOrPowerOutValue.. 
    //operationType options: "Steam Flow", "Power Generation", "Balance Header", "Power Range", "Flow Range"
    //turbine() options: Mass Flow or Power Out.. not sure how those correspond
    let massFlowOrPowerOutValue: number = 0;
    this.ssmtOutputData.highPressureToLowPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: highPressureSteam.pressure,
        inletQuantity: 1,
        inletQuantityValue: highPressureSteam.specificEnthalpy,
        turbineProperty: highToLowPressureTurbine.operationType,
        isentropicEfficiency: highToLowPressureTurbine.isentropicEfficiency,
        generatorEfficiency: highToLowPressureTurbine.generationEfficiency,
        massFlowOrPowerOut: massFlowOrPowerOutValue,
        outletSteamPressure: lowPressureHeaderInput.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this._settings
    )
  }

  initializeHighPressureToMediumPressureTurbine(highToMediumPressureTurbine: PressureTurbine, highPressureSteam: SteamPropertiesOutput, mediumPressureHeaderInput: Header) {
    //TODO: highToMediumPressureTurbine.operationType to set turbine property and corresponding
    //massFlowOrPowerOutValue.. 
    //operationType options: "Steam Flow", "Power Generation", "Balance Header", "Power Range", "Flow Range"
    //turbine() options: Mass Flow or Power Out.. not sure how those correspond
    let massFlowOrPowerOutValue: number = 0;
    this.ssmtOutputData.highPressureToMediumPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: highPressureSteam.pressure,
        inletQuantity: 1,
        inletQuantityValue: highPressureSteam.specificEnthalpy,
        turbineProperty: highToMediumPressureTurbine.operationType,
        isentropicEfficiency: highToMediumPressureTurbine.isentropicEfficiency,
        generatorEfficiency: highToMediumPressureTurbine.generationEfficiency,
        massFlowOrPowerOut: massFlowOrPowerOutValue,
        outletSteamPressure: mediumPressureHeaderInput.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this._settings
    )
  }

  initializeMediumPressureToLowPressureTurbine(mediumToLowPressureTurbine: PressureTurbine, mediumPressureSteam: SteamPropertiesOutput, lowPressureHeaderInput: Header) {
    //TODO: mediumToLowPressureTurbine.operationType to set turbine property and corresponding
    //massFlowOrPowerOutValue.. 
    //operationType options: "Steam Flow", "Power Generation", "Balance Header", "Power Range", "Flow Range"
    //turbine() options: Mass Flow or Power Out.. not sure how those correspond
    let massFlowOrPowerOutValue: number = 0;
    this.ssmtOutputData.mediumPressureToLowPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: mediumPressureSteam.pressure,
        inletQuantity: 1,
        inletQuantityValue: mediumPressureSteam.specificEnthalpy,
        turbineProperty: mediumToLowPressureTurbine.operationType,
        isentropicEfficiency: mediumToLowPressureTurbine.isentropicEfficiency,
        generatorEfficiency: mediumToLowPressureTurbine.generationEfficiency,
        massFlowOrPowerOut: massFlowOrPowerOutValue,
        outletSteamPressure: lowPressureHeaderInput.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this._settings
    )
  }

  calculateTotalPowerCost(operationsInput: OperationsInput) {
    //cost = electricityCosts or makeupWaterCosts or fuelCosts? 
    this.siteTotalPowerCost = operationsInput.sitePowerImport * operationsInput.operatingHoursPerYear * operationsInput.electricityCosts;
  }

  initializeMakeupWater(makeupWaterTemp: number) {
    this.ssmtOutputData.makeupWater = this.steamService.steamProperties(
      {
        thermodynamicQuantity: 0, //temperature
        quantityValue: makeupWaterTemp,
        pressure: 0.101325 //atmospherice pressure
      },
      this._settings
    )
  }



  updateBoilerModel(currentBoilerModel: BoilerOutput, newMassFlow: number) {
    //I used the input data where there wasn't corresponding data in the BoilerOutput
    //use enthalpy
    return this.steamService.boiler({
      deaeratorPressure: this._inputData.boilerInput.deaeratorPressure,
      combustionEfficiency: this._inputData.boilerInput.combustionEfficiency,
      blowdownRate: this._inputData.boilerInput.blowdownRate,
      steamPressure: currentBoilerModel.steamPressure,
      thermodynamicQuantity: 1, //enthalpy
      quantityValue: currentBoilerModel.steamSpecificEnthalpy,
      steamMassFlow: newMassFlow
    },
      this._settings)
  }
}
