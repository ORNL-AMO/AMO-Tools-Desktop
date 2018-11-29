import { Injectable } from '@angular/core';
import { SteamService } from '../../calculator/steam/steam.service';
import { BoilerOutput, SteamPropertiesOutput, HeaderOutputObj, HeatLossOutput, PrvOutput, TurbineOutput, FlashTankOutput, DeaeratorOutput } from '../../shared/models/steam/steam-outputs';
import { Settings } from '../../shared/models/settings';
import { SSMTInputs, SSMT, HeaderInput, HeaderNotHighestPressure } from '../../shared/models/steam/ssmt';
import { HeaderInputObj } from '../../shared/models/steam/steam-inputs';

@Injectable()
export class CalculateModelService {
  settings: Settings;
  inputData: SSMTInputs;

  boiler: BoilerOutput;
  blowdown: SteamPropertiesOutput;
  boilerFeedwater: SteamPropertiesOutput;
  deaeratorFeedwater: SteamPropertiesOutput;

  highPressureHeader: HeaderOutputObj;
  highToMediumPressurePRV: PrvOutput;
  highPressureToMediumPressureTurbine: TurbineOutput;
  highPressureFlashTank: FlashTankOutput;
  highPressureCondensate: SteamPropertiesOutput;

  mediumPressureHeader: HeaderOutputObj;
  lowPressurePRV: PrvOutput;
  mediumPressureCondensate: SteamPropertiesOutput;

  highToLowPressureTurbine: TurbineOutput;
  mediumToLowPressureTurbine: TurbineOutput;
  mediumPressureFlashTank: FlashTankOutput;
  blowdownFlashTank: FlashTankOutput;

  lowPressureHeader: HeaderOutputObj;
  lowPressureCondensate: SteamPropertiesOutput;

  condensateFlashTank: FlashTankOutput;
  returnCondensate: SteamPropertiesOutput;
  makeupWater: SteamPropertiesOutput;
  makeupWaterAndCondensateHeader: HeaderOutputObj;
  condensingTurbine: TurbineOutput;
  deaerator: DeaeratorOutput;

  steamToDeaerator: number;
  additionalSteamFlow: number;
  constructor(private steamService: SteamService) { }

  getInputDataFromSSMT(_ssmt: SSMT): SSMTInputs {
    let inputData: SSMTInputs = {
      operationsInput: {
        sitePowerImport: _ssmt.generalSteamOperations.sitePowerImport,
        makeUpWaterTemperature: _ssmt.generalSteamOperations.makeUpWaterTemperature,
        operatingHoursPerYear: _ssmt.operatingHours.hoursPerYear,
        fuelCosts: _ssmt.operatingCosts.fuelCost,
        electricityCosts: _ssmt.operatingCosts.electricityCost,
        makeUpWaterCosts: _ssmt.operatingCosts.makeUpWaterCost,
      },
      boilerInput: _ssmt.boilerInput,
      headerInput: _ssmt.headerInput,
      turbineInput: _ssmt.turbineInput
    }
    return inputData;
  }

  iterateModel(_ssmt: SSMT, _settings: Settings): number {
    this.inputData = this.getInputDataFromSSMT(_ssmt);
    this.settings = _settings;
    let additionalSteamFlow: number = this.steamToDeaerator;
    if (additionalSteamFlow == 0 || !additionalSteamFlow) {
      additionalSteamFlow = 1;
    }
    if (this.additionalSteamFlow) {
      additionalSteamFlow = this.additionalSteamFlow;
    }
    let adjustment: number = this.convergeAdjustment(additionalSteamFlow, .01);
    let cc: number = 0;
    while (Math.abs(adjustment) > 1e-5 && cc++ < 50) {
      adjustment = this.convergeAdjustment(additionalSteamFlow);
      let y1, y2, yNew, x1, x2, xNew: number;
      let lastSlope: number;
      switch (cc) {
        case 1: {
          y1 = additionalSteamFlow;
          x1 = adjustment;
          break;
        }
        case 2: {
          y2 = additionalSteamFlow;
          x2 = adjustment;
          break;
        }
        default: {
          //set new test point
          yNew = additionalSteamFlow;
          xNew = adjustment;
          //select closest old test point
          let y1Diff: number = Math.abs(y1 - yNew);
          let y2Diff: number = Math.abs(y2 - yNew);
          if (y1Diff < y2Diff) {
            y2 = yNew;
            x2 = xNew;
          } else {
            y2 = y1;
            x2 = x1;
            y1 = yNew;
            x1 = xNew;
          }
          break;
        }
      }

      //use linear interpolation to determin new adjustment
      if (y1 && y2) {
        if (x2 == x1) {
          additionalSteamFlow = additionalSteamFlow + adjustment;
          adjustment == this.convergeAdjustment(additionalSteamFlow);
          break;
        }
        let slope: number = (y2 - y1) / (x2 - x1);
        let yIntercept: number = y2 - (x2 * slope);

        if (
          (cc > 10 && (cc % 5) == 0) ||
          (lastSlope && (slope == 0 || lastSlope / slope < 0))
        ) {
          additionalSteamFlow = additionalSteamFlow + adjustment;
        } else {
          additionalSteamFlow = yIntercept;
        }
        lastSlope = slope;
      } else {
        additionalSteamFlow = additionalSteamFlow + adjustment;
      }
      if (isNaN(adjustment)) {
        break;
      }
    }
    //php has a check warnings function and then convergeAdjustment if warnings exist here..
    //if(this.checkWarnings() > 0) adjustment = this.convergeAdjustment(additionalSteamFlow)
    return additionalSteamFlow;
  }

  convergeAdjustment(additionalSteamFlow: number, requiredVal?: number): number {
    let requirement: number = .5;
    if (requiredVal) {
      requirement = requiredVal;
    }
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
      adjustment = this.calculateModel(additionalSteamFlow);
      if (isNaN(adjustment)) {
        break
      }
    }
    return adjustment;
  }

  calculateModel(massFlow: number): number {
    console.log(massFlow);
    //1. Calculate Boiler
    //1a. Model Boiler
    this.calculateBoiler(massFlow);
    //1b. Set Blowdown Properties
    this.setBoilerBlowdown();
    //1c. Set Feedwater Properties
    this.setBoilerFeedwater();

    //2. Calculate High Pressure Header
    //2a. Model High Pressure Header
    this.calculateHighPressureHeader();
    //2b. Calculate Heat Loss for Remaining Steam in High Pressure Header
    this.calculateHeatLossForHighPressureHeader();
    //2c. Calculate High Pressure Condensate
    this.calculateHighPressureCondensate();

    //3. Calculate Steam to Medium Pressure Values
    /* Checks done in medium pressure header calculation
    if (this.inputData.headerInput.numberOfHeaders == 3) {
      //3a. Calculate High to Medium PRV
      this.calculateHighToMediumPRV();
       if (this.inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
         //3b. Calculate High to Medium Steam Turbine
         this.calculateHighToMediumPressureSteamTurbine();
       }
    }
    //3c. Calculate High Pressure Flash Tank
    //if 2 headers, low pressure header flash condensate into header == true
    //if 3 headers, medium pressure header flash condensate into header == true
    if (this.inputData.headerInput.numberOfHeaders == 2 && this.inputData.headerInput.lowPressure.flashCondensateIntoHeader == true ||
      this.inputData.headerInput.numberOfHeaders == 3 && this.inputData.headerInput.mediumPressure.flashCondensateIntoHeader == true) {
      this.calculateHighPressureFlashTank();
      ();
    }*/

    //4. Calculate Medium Pressure Header
    //if medium pressure header exists
    if (this.inputData.headerInput.numberOfHeaders == 3) {
      //4a. Model Medium Pressure Header
      this.calculateMediumPressureHeader();
      //4b. Calculate Heat Loss for Remain Steam in Medium Pressure Header
      this.calculateHeatLossForMediumPressureHeader();
      //4c. Calculate Medium Pressure Condensate
      this.calculateMediumPressureCondensate();
    }
    /*
    //5. Calculate Steam to Low Pressure Values
    if (this.inputData.headerInput.numberOfHeaders > 1) {
      //if using high to low turbine
      if (this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
        //5a. Calculate High to Low Steam Turbine
        this.calculateHighToLowSteamTurbine();
      }
      //if medium pressure header exists
      if (this.inputData.headerInput.numberOfHeaders == 3) {
        //5b. Calculate Medium to Low PRV
        this.calculateLowPressurePRV();
        //if using medium to low turbine
        if (this.inputData.turbineInput.mediumToLowTurbine.useTurbine == true) {
          //5c. Calculate Medium to Low Steam Turbine
          this.calculateMediumToLowSteamTurbine();
        }
        //if flash condensate from medium pressure header into low pressure header
        if (this.inputData.headerInput.lowPressure.flashCondensateIntoHeader == true) {
          //5d. Calculate Medium Pressure Flash Tank
          this.calculateMediumPressureFlashTank();
        }
      }
    }

    //if flashing blowdown from boiler
    if (this.inputData.boilerInput.blowdownFlashed == true) {
      //5e. Calculate Blowdown Flash Tank
      this.calculateBlowdownFlashTank();
    }*/

    //6. Calculate Low Pressure Header
    if (this.inputData.headerInput.numberOfHeaders > 1) {
      //6a. Model Low Pressure Header
      this.calculateLowPressureHeader();
      //6b. Calculate Heat Loss for Remaining Steam in Low Pressure Header
      this.calculateHeatLossForLowPressureHeader();
      //6c. Calculate Low Pressure Condensate
      this.calculateLowPressureCondensate();
    }
    /*
        //7. Calculate Makeup Water and Condensate Details
        if (this.inputData.headerInput.highPressure.flashCondensateReturn == true) {
          //7a. Flash Condensate Return
          this.flashCondensateReturn();
        }
    
        //7b. Calculate Return Condensate
        this.calculateReturnCondensate();
        //7c. Calculate Makeup Water Properties
        this.calculateMakeupWater();
    
        //if preheating makeup water
        if (this.inputData.boilerInput.preheatMakeupWater == true) {
          //7d. Run Heat Exchanger
          this.runHeatExchanger();
        }
    
        //if using condensing turbine
        if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
          //7e. Calculate Condensing turbine
          this.calculateCondensingTurbine();
        }*/

    //7d. Calculate Makeup Water and Condensate Header
    this.calculateMakeupWaterAndCondensateHeader();

    //8. Calculate Deaerator
    this.calculateDearator();

    let daSteamDifference: number = this.deaerator.inletSteamMassFlow - this.steamToDeaerator;
    return daSteamDifference;
  }


  //1a. Calculate Boiler
  calculateBoiler(_massFlow: number) {
    this.boiler = this.steamService.boiler(
      {
        steamPressure: this.inputData.headerInput.highPressure.pressure,
        blowdownRate: this.inputData.boilerInput.blowdownRate,
        steamMassFlow: _massFlow,
        thermodynamicQuantity: 0, //temperature
        quantityValue: this.inputData.boilerInput.steamTemperature,
        combustionEfficiency: this.inputData.boilerInput.combustionEfficiency,
        deaeratorPressure: this.inputData.boilerInput.deaeratorPressure
      },
      this.settings
    )
  }

  //1b. Set Boiler Blowdown
  setBoilerBlowdown() {
    this.blowdown = {
      pressure: this.boiler.blowdownPressure,
      temperature: this.boiler.blowdownTemperature,
      specificEnthalpy: this.boiler.blowdownSpecificEnthalpy,
      specificEntropy: this.boiler.blowdownSpecificEntropy,
      quality: this.boiler.blowdownQuality,
      specificVolume: this.boiler.blowdownVolume,
      massFlow: this.boiler.blowdownMassFlow,
      energyFlow: this.boiler.blowdownEnergyFlow
    }
  }

  //1c. Set Boiler Feedwater
  setBoilerFeedwater() {
    this.boilerFeedwater = {
      pressure: this.boiler.feedwaterPressure,
      temperature: this.boiler.feedwaterTemperature,
      specificEnthalpy: this.boiler.feedwaterSpecificEnthalpy,
      specificEntropy: this.boiler.feedwaterSpecificEntropy,
      quality: this.boiler.feedwaterQuality,
      specificVolume: this.boiler.feedwaterVolume,
      massFlow: this.boiler.feedwaterMassFlow,
      energyFlow: this.boiler.feedwaterEnergyFlow
    }
  }

  //2a. Calculate High Pressure Header
  calculateHighPressureHeader() {
    //notice .header at the end (need .header obj for highPressureHeader)
    this.highPressureHeader = this.steamService.header(
      {
        headerPressure: this.inputData.headerInput.highPressure.pressure,
        inlets: [
          {
            pressure: this.boiler.steamPressure,
            thermodynamicQuantity: 1, //specificEnthalpy
            quantityValue: this.boiler.steamSpecificEnthalpy,
            massFlow: this.boiler.steamMassFlow
          }
        ]
      },
      this.settings
    ).header;
  }

  //2b. Calculate Heat Loss for Remaining Steam in High Pressure Header
  calculateHeatLossForHighPressureHeader() {
    let highPressureHeaderHeatLoss: HeatLossOutput = this.steamService.heatLoss(
      {
        inletPressure: this.highPressureHeader.pressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.highPressureHeader.specificEnthalpy,
        inletMassFlow: this.highPressureHeader.massFlow,
        percentHeatLoss: this.inputData.headerInput.highPressure.heatLoss
      },
      this.settings
    );
    this.highPressureHeader.remainingSteam = {
      pressure: highPressureHeaderHeatLoss.outletPressure,
      temperature: highPressureHeaderHeatLoss.outletTemperature,
      specificEnthalpy: highPressureHeaderHeatLoss.outletSpecificEnthalpy,
      specificEntropy: highPressureHeaderHeatLoss.outletSpecificEntropy,
      quality: highPressureHeaderHeatLoss.outletQuality,
      massFlow: highPressureHeaderHeatLoss.outletMassFlow,
      energyFlow: highPressureHeaderHeatLoss.outletEnergyFlow
    }
  }

  //2c. Calculate High Pressure Condensate
  calculateHighPressureCondensate() {
    let calculatedMassFlow: number = this.inputData.headerInput.highPressure.processSteamUsage * (this.inputData.headerInput.highPressure.condensationRecoveryRate / 100);
    let calcualtedEnergyFlow: number = calculatedMassFlow * this.blowdown.specificEnthalpy / 1000;
    this.highPressureCondensate = {
      pressure: this.blowdown.pressure,
      temperature: this.blowdown.temperature,
      specificEnthalpy: this.blowdown.specificEnthalpy,
      specificEntropy: this.blowdown.specificEntropy,
      quality: this.blowdown.quality,
      energyFlow: calcualtedEnergyFlow,
      specificVolume: this.blowdown.specificVolume,
      massFlow: calculatedMassFlow
    }
  }

  //3a. Calculate High to Medium PRV
  calculateHighToMediumPRV() {
    if (this.inputData.headerInput.mediumPressure.desuperheatSteamIntoNextHighest == true) {
      this.highToMediumPressurePRV = this.steamService.prvWithDesuperheating(
        {
          inletPressure: this.highPressureHeader.remainingSteam.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: this.highPressureHeader.remainingSteam.specificEnthalpy,
          inletMassFlow: this.highPressureHeader.remainingSteam.massFlow,
          outletPressure: this.inputData.headerInput.mediumPressure.pressure,
          feedwaterPressure: this.boilerFeedwater.pressure,
          feedwaterThermodynamicQuantity: 1,//1 is enthalpy
          feedwaterQuantityValue: this.boilerFeedwater.specificEnthalpy,
          desuperheatingTemp: this.inputData.headerInput.mediumPressure.desuperheatSteamTemperature
        },
        this.settings
      );
    } else {
      this.highToMediumPressurePRV = this.steamService.prvWithoutDesuperheating(
        {
          inletPressure: this.highPressureHeader.remainingSteam.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: this.highPressureHeader.remainingSteam.specificEnthalpy,
          inletMassFlow: this.highPressureHeader.remainingSteam.massFlow,
          outletPressure: this.inputData.headerInput.mediumPressure.pressure,
          feedwaterPressure: undefined,
          feedwaterThermodynamicQuantity: undefined,
          feedwaterQuantityValue: undefined,
          desuperheatingTemp: undefined
        },
        this.settings
      );
    }
  }

  //3b. Calculate High to Medium Steam Turbine
  calculateHighToMediumPressureSteamTurbine() {
    this.highPressureToMediumPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.highPressureHeader.remainingSteam.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.highPressureHeader.remainingSteam.specificEnthalpy,
        turbineProperty: this.inputData.turbineInput.highToMediumTurbine.operationType,
        isentropicEfficiency: this.inputData.turbineInput.highToMediumTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.highToMediumTurbine.generationEfficiency,
        massFlowOrPowerOut: 0, //mass flow
        outletSteamPressure: this.inputData.headerInput.mediumPressure.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this.settings
    );
  }
  //3c. Calculate High Pressure Condensate Flash Tank
  calculateHighPressureFlashTank() {
    let header: HeaderNotHighestPressure;
    //if two headers, flashing into low pressure header
    if (this.inputData.headerInput.numberOfHeaders == 2) {
      header = this.inputData.headerInput.lowPressure;
    }
    //else if three headers, flashing into medium pressure header
    else if (this.inputData.headerInput.numberOfHeaders == 3) {
      header = this.inputData.headerInput.mediumPressure;
    }
    this.highPressureFlashTank = this.steamService.flashTank(
      {
        inletWaterPressure: this.highPressureCondensate.pressure,
        quantityValue: this.highPressureCondensate.specificEnthalpy,
        thermodynamicQuantity: 1,
        inletWaterMassFlow: this.highPressureCondensate.massFlow,
        tankPressure: header.pressure
      },
      this.settings
    )
  }

  //4a. Model Medium Pressure Header
  calculateMediumPressureHeader() {
    let inlets: Array<HeaderInputObj> = new Array<HeaderInputObj>();
    //PRV always exists
    this.calculateHighToMediumPRV();
    inlets.push(
      {
        pressure: this.highToMediumPressurePRV.outletPressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.highToMediumPressurePRV.outletSpecificEnthalpy,
        massFlow: this.highToMediumPressurePRV.outletMassFlow
      }
    );
    if (this.inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
      this.calculateHighToMediumPressureSteamTurbine();
      inlets.push(
        {
          pressure: this.highPressureToMediumPressureTurbine.outletPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.highPressureToMediumPressureTurbine.outletSpecificEnthalpy,
          massFlow: this.highPressureToMediumPressureTurbine.massFlow
        }
      );
    }
    if (this.inputData.headerInput.mediumPressure.flashCondensateIntoHeader == true) {
      this.calculateHighPressureFlashTank();
      inlets.push(
        {
          pressure: this.highPressureFlashTank.outletGasPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.highPressureFlashTank.outletGasSpecificEnthalpy,
          massFlow: this.highPressureFlashTank.outletGasMassFlow
        }
      );
    }
    this.mediumPressureHeader = this.steamService.header(
      {
        headerPressure: this.inputData.headerInput.mediumPressure.pressure,
        inlets: inlets
      },
      this.settings).header;
  }
  //4b. Calculate Heat Loss for Remaining Steam in Medium Pressure Header
  calculateHeatLossForMediumPressureHeader() {
    let mediumPressureHeatLoss: HeatLossOutput = this.steamService.heatLoss(
      {
        inletPressure: this.mediumPressureHeader.pressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.mediumPressureHeader.specificEnthalpy,
        inletMassFlow: this.mediumPressureHeader.massFlow,
        percentHeatLoss: this.inputData.headerInput.mediumPressure.heatLoss
      },
      this.settings
    );
    this.mediumPressureHeader.remainingSteam = {
      pressure: mediumPressureHeatLoss.outletPressure,
      temperature: mediumPressureHeatLoss.outletTemperature,
      specificEnthalpy: mediumPressureHeatLoss.outletSpecificEnthalpy,
      specificEntropy: mediumPressureHeatLoss.outletSpecificEntropy,
      quality: mediumPressureHeatLoss.outletQuality,
      massFlow: mediumPressureHeatLoss.outletMassFlow,
      energyFlow: mediumPressureHeatLoss.outletEnergyFlow
    }
  }
  //4c. Calculate Medium Pressure Condensate
  calculateMediumPressureCondensate() {
    let calculatedMassFlow: number = this.inputData.headerInput.mediumPressure.processSteamUsage * (this.inputData.headerInput.mediumPressure.condensationRecoveryRate / 100) + this.highPressureFlashTank.outletGasMassFlow
    let calcualtedEnergyFlow: number = calculatedMassFlow * this.highPressureFlashTank.outletLiquidSpecificEnthalpy / 1000;
    this.mediumPressureCondensate = {
      pressure: this.highPressureFlashTank.outletLiquidPressure,
      temperature: this.highPressureFlashTank.outletLiquidTemperature,
      specificEnthalpy: this.highPressureFlashTank.outletLiquidSpecificEnthalpy,
      specificEntropy: this.highPressureFlashTank.outletLiquidSpecificEntropy,
      quality: this.highPressureFlashTank.outletLiquidQuality,
      energyFlow: calcualtedEnergyFlow,
      specificVolume: this.highPressureFlashTank.outletLiquidVolume,
      massFlow: calculatedMassFlow
    }
  }

  //5a. Calculate High to Low Steam Turbine
  calculateHighToLowSteamTurbine() {
    this.highToLowPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.highPressureHeader.remainingSteam.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.highPressureHeader.remainingSteam.specificEnthalpy,
        turbineProperty: this.inputData.turbineInput.highToLowTurbine.operationType,
        isentropicEfficiency: this.inputData.turbineInput.highToLowTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.highToLowTurbine.generationEfficiency,
        massFlowOrPowerOut: 0, //mass flow
        outletSteamPressure: this.inputData.headerInput.lowPressure.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this.settings
    );
  }
  //5b. Calculate Low Pressure PRV
  //either medium to low or high to low
  calculateLowPressurePRV() {
    let headerObj: HeaderOutputObj;
    if (this.inputData.headerInput.numberOfHeaders == 2) {
      headerObj = this.highPressureHeader;
    } else if (this.inputData.headerInput.numberOfHeaders == 3) {
      headerObj = this.mediumPressureHeader;
    }
    if (this.inputData.headerInput.lowPressure.desuperheatSteamIntoNextHighest == true) {
      this.lowPressurePRV = this.steamService.prvWithDesuperheating(
        {
          inletPressure: headerObj.remainingSteam.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: headerObj.remainingSteam.specificEnthalpy,
          inletMassFlow: headerObj.remainingSteam.massFlow,
          outletPressure: this.inputData.headerInput.lowPressure.pressure,
          feedwaterPressure: this.boilerFeedwater.pressure,
          feedwaterThermodynamicQuantity: 1,//1 is enthalpy
          feedwaterQuantityValue: this.boilerFeedwater.specificEnthalpy,
          desuperheatingTemp: this.inputData.headerInput.lowPressure.desuperheatSteamTemperature
        },
        this.settings
      );
    } else {
      this.lowPressurePRV = this.steamService.prvWithoutDesuperheating(
        {
          inletPressure: headerObj.remainingSteam.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: headerObj.remainingSteam.specificEnthalpy,
          inletMassFlow: headerObj.remainingSteam.massFlow,
          outletPressure: this.inputData.headerInput.lowPressure.pressure,
          feedwaterPressure: undefined,
          feedwaterThermodynamicQuantity: undefined,
          feedwaterQuantityValue: undefined,
          desuperheatingTemp: undefined
        },
        this.settings
      );
    }
  }
  //5c. Calculate Medium to Low Steam Turbine
  calculateMediumToLowSteamTurbine() {
    this.mediumToLowPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.mediumPressureHeader.remainingSteam.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.mediumPressureHeader.remainingSteam.specificEnthalpy,
        turbineProperty: this.inputData.turbineInput.mediumToLowTurbine.operationType,
        isentropicEfficiency: this.inputData.turbineInput.mediumToLowTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.mediumToLowTurbine.generationEfficiency,
        massFlowOrPowerOut: 0, //mass flow
        outletSteamPressure: this.inputData.headerInput.lowPressure.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this.settings
    );
  }
  //5d. Calculate Medium Pressure Flash Tank
  calculateMediumPressureFlashTank() {
    this.mediumPressureFlashTank = this.steamService.flashTank(
      {
        inletWaterPressure: this.mediumPressureCondensate.pressure,
        quantityValue: this.mediumPressureCondensate.specificEnthalpy,
        thermodynamicQuantity: 1,
        inletWaterMassFlow: this.mediumPressureCondensate.massFlow,
        tankPressure: this.inputData.headerInput.lowPressure.pressure
      },
      this.settings
    )
  }
  //5e. Calculate Blowdown Flash Tank
  calculateBlowdownFlashTank() {
    this.blowdownFlashTank = this.steamService.flashTank(
      {
        inletWaterPressure: this.blowdown.pressure,
        quantityValue: this.blowdown.specificEnthalpy,
        thermodynamicQuantity: 1,
        inletWaterMassFlow: this.blowdown.massFlow,
        tankPressure: this.inputData.headerInput.lowPressure.pressure
      },
      this.settings
    )
  }

  //6a. Model Low Pressure Header
  calculateLowPressureHeader() {
    let inlets: Array<HeaderInputObj> = new Array<HeaderInputObj>();
    //low pressure PRV
    this.calculateLowPressurePRV();
    inlets.push(
      {
        pressure: this.lowPressurePRV.outletPressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.lowPressurePRV.outletSpecificEnthalpy,
        massFlow: this.lowPressurePRV.outletMassFlow
      }
    );
    if (this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
      this.calculateHighToLowSteamTurbine();
      inlets.push(
        {
          pressure: this.highToLowPressureTurbine.outletPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.highToLowPressureTurbine.outletSpecificEnthalpy,
          massFlow: this.highToLowPressureTurbine.massFlow
        }
      )
    }
    if (this.inputData.headerInput.lowPressure.flashCondensateIntoHeader == true) {
      if (this.inputData.headerInput.numberOfHeaders == 3) {
        this.calculateMediumPressureFlashTank();
        inlets.push(
          {
            pressure: this.mediumPressureFlashTank.outletGasPressure,
            thermodynamicQuantity: 1, //specificEnthalpy
            quantityValue: this.mediumPressureFlashTank.outletGasSpecificEnthalpy,
            massFlow: this.mediumPressureFlashTank.outletGasMassFlow
          }
        )
      } else {
        this.calculateHighPressureFlashTank();
        inlets.push(
          {
            pressure: this.highPressureFlashTank.outletGasPressure,
            thermodynamicQuantity: 1, //specificEnthalpy
            quantityValue: this.highPressureFlashTank.outletGasSpecificEnthalpy,
            massFlow: this.highPressureFlashTank.outletGasSpecificEnthalpy
          }
        )
      }
    }

    if (this.inputData.headerInput.numberOfHeaders == 3 && this.inputData.turbineInput.mediumToLowTurbine.useTurbine == true) {
      this.calculateMediumToLowSteamTurbine();
      inlets.push(
        {
          pressure: this.mediumToLowPressureTurbine.outletPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.mediumToLowPressureTurbine.outletSpecificEnthalpy,
          massFlow: this.mediumToLowPressureTurbine.massFlow
        }
      )
    }

    if (this.inputData.boilerInput.blowdownFlashed == true) {
      this.calculateBlowdownFlashTank();
      inlets.push(
        {
          pressure: this.blowdownFlashTank.outletGasPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.blowdownFlashTank.outletGasSpecificEnthalpy,
          massFlow: this.blowdownFlashTank.outletGasMassFlow
        }
      )
    }
    this.lowPressureHeader = this.steamService.header(
      {
        headerPressure: this.inputData.headerInput.lowPressure.pressure,
        inlets: inlets
      },
      this.settings).header;
  }
  //6b. Calculate Heat Loss for Remaining Steam in Low Pressure Header
  calculateHeatLossForLowPressureHeader() {
    let lowPressureHeatLoss: HeatLossOutput = this.steamService.heatLoss(
      {
        inletPressure: this.lowPressureHeader.pressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.lowPressureHeader.specificEnthalpy,
        inletMassFlow: this.lowPressureHeader.massFlow,
        percentHeatLoss: this.inputData.headerInput.lowPressure.heatLoss
      },
      this.settings
    );
    this.lowPressureHeader.remainingSteam = {
      pressure: lowPressureHeatLoss.outletPressure,
      temperature: lowPressureHeatLoss.outletTemperature,
      specificEnthalpy: lowPressureHeatLoss.outletSpecificEnthalpy,
      specificEntropy: lowPressureHeatLoss.outletSpecificEntropy,
      quality: lowPressureHeatLoss.outletQuality,
      massFlow: lowPressureHeatLoss.outletMassFlow,
      energyFlow: lowPressureHeatLoss.outletEnergyFlow
    }
  }
  //6c. Calculate Low Pressure Condensate
  calculateLowPressureCondensate() {
    let calculatedMassFlow: number = this.inputData.headerInput.lowPressure.processSteamUsage * (this.inputData.headerInput.lowPressure.condensationRecoveryRate / 100) + this.highPressureFlashTank.outletGasMassFlow
    let calcualtedEnergyFlow: number = calculatedMassFlow * this.mediumPressureFlashTank.outletLiquidSpecificEnthalpy / 1000;
    this.lowPressureCondensate = {
      pressure: this.mediumPressureFlashTank.outletLiquidPressure,
      temperature: this.mediumPressureFlashTank.outletLiquidTemperature,
      specificEnthalpy: this.mediumPressureFlashTank.outletLiquidSpecificEnthalpy,
      specificEntropy: this.mediumPressureFlashTank.outletLiquidSpecificEntropy,
      quality: this.mediumPressureFlashTank.outletLiquidQuality,
      energyFlow: calcualtedEnergyFlow,
      specificVolume: this.mediumPressureFlashTank.outletLiquidVolume,
      massFlow: calculatedMassFlow
    }
  }

  //7a. Flash Condensate Return
  flashCondensateReturn() {
    let condensateRemaining: SteamPropertiesOutput;
    if (this.inputData.headerInput.numberOfHeaders == 1) {
      condensateRemaining = this.highPressureCondensate;
    } else {
      condensateRemaining = this.lowPressureCondensate;
    }
    this.condensateFlashTank = this.steamService.flashTank(
      {
        inletWaterPressure: condensateRemaining.pressure,
        quantityValue: condensateRemaining.specificEnthalpy,
        thermodynamicQuantity: 1,
        inletWaterMassFlow: condensateRemaining.massFlow,
        tankPressure: this.inputData.boilerInput.deaeratorPressure
      },
      this.settings
    )
  }

  //7b. Calculate Return Condensate
  calculateReturnCondensate() {
    if (this.inputData.headerInput.highPressure.flashCondensateReturn == true) {
      this.flashCondensateReturn();
      this.returnCondensate = {
        pressure: this.condensateFlashTank.outletLiquidPressure,
        temperature: this.condensateFlashTank.outletLiquidTemperature,
        specificEnthalpy: this.condensateFlashTank.outletLiquidSpecificEnthalpy,
        specificEntropy: this.condensateFlashTank.outletLiquidSpecificEntropy,
        quality: this.condensateFlashTank.outletLiquidQuality,
        energyFlow: this.condensateFlashTank.outletLiquidEnergyFlow,
        specificVolume: this.condensateFlashTank.outletLiquidVolume,
        massFlow: this.condensateFlashTank.outletLiquidMassFlow
      }
    } else {
      if (this.inputData.headerInput.numberOfHeaders == 1) {
        this.returnCondensate = this.highPressureCondensate;
      } else {
        this.returnCondensate = this.lowPressureCondensate;
      }
    }
  }
  //7c. Calculate Makeup Water Properties
  calculateMakeupWater() {
    this.makeupWater = this.steamService.steamProperties(
      {
        thermodynamicQuantity: 0, //temperature
        quantityValue: this.inputData.operationsInput.makeUpWaterTemperature,
        pressure: .101325 //atmospheric pressure
      },
      this.settings
    );

    if (this.inputData.boilerInput.preheatMakeupWater == true) {
      this.runHeatExchanger();
    }
  }
  //7d. Run Heat Exchanger
  runHeatExchanger() {
    //TODO: need bindings to HeatExchanger() in the suite before doing this step..
  }

  //7e. Calculate Condensing Turbine
  calculateCondensingTurbine() {
    this.condensingTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.highPressureHeader.remainingSteam.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.highPressureHeader.remainingSteam.specificEnthalpy,
        turbineProperty: this.inputData.turbineInput.condensingTurbine.operationType,
        isentropicEfficiency: this.inputData.turbineInput.condensingTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.condensingTurbine.generationEfficiency,
        massFlowOrPowerOut: this.inputData.turbineInput.condensingTurbine.operationValue,
        outletSteamPressure: this.inputData.turbineInput.condensingTurbine.condenserPressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this.settings
    )
  }

  //7e. Calculate Makeup Water and Condensate Header
  calculateMakeupWaterAndCondensateHeader() {
    let inlets: Array<HeaderInputObj> = new Array<HeaderInputObj>();
    this.calculateMakeupWater();
    inlets.push(
      {
        pressure: this.makeupWater.pressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.makeupWater.specificEnthalpy,
        massFlow: this.makeupWater.massFlow
      }
    );
    if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
      this.calculateCondensingTurbine();
      inlets.push(
        {
          pressure: this.condensingTurbine.outletPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.condensingTurbine.outletPressure,
          massFlow: this.condensingTurbine.massFlow
        }
      )
    }
    this.calculateReturnCondensate();
    inlets.push(
      {
        pressure: this.returnCondensate.pressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.returnCondensate.specificEnthalpy,
        massFlow: this.returnCondensate.massFlow
      }
    )
    //notice .header at the end (need .header obj for makeupWaterAndCondensateHeader)
    this.makeupWaterAndCondensateHeader = this.steamService.header(
      {
        headerPressure: this.inputData.boilerInput.deaeratorPressure,
        inlets: inlets
      },
      this.settings
    ).header;
  }

  //8. Calculate Deaerator
  calculateDearator() {
    let feedwaterMassFlow: number = this.boilerFeedwater.massFlow
    let inletHeader: HeaderOutputObj = this.highPressureHeader;
    if (this.inputData.headerInput.numberOfHeaders > 1 && isNaN(this.lowPressurePRV.feedwaterMassFlow) == false) {
      feedwaterMassFlow = feedwaterMassFlow + this.lowPressurePRV.feedwaterMassFlow;
      inletHeader = this.lowPressureHeader;
    }
    if (this.inputData.headerInput.numberOfHeaders == 3 && isNaN(this.highToMediumPressurePRV.feedwaterMassFlow) == false) {
      feedwaterMassFlow = feedwaterMassFlow + this.highToMediumPressurePRV.feedwaterMassFlow;
    }
    this.deaerator = this.steamService.deaerator(
      {
        deaeratorPressure: this.inputData.boilerInput.deaeratorPressure,
        ventRate: this.inputData.boilerInput.deaeratorVentRate,
        feedwaterMassFlow: feedwaterMassFlow,
        waterPressure: this.makeupWaterAndCondensateHeader.massFlow,
        waterThermodynamicQuantity: 1, //specificEnthalpy
        waterQuantityValue: this.makeupWaterAndCondensateHeader.specificEnthalpy,
        steamPressure: inletHeader.remainingSteam.pressure,
        steamThermodynamicQuantity: 1, //specificEnthalpy
        steamQuantityValue: inletHeader.specificEnthalpy
      },
      this.settings
    )

    this.steamToDeaerator = inletHeader.massFlow;
    this.deaeratorFeedwater = {
      pressure: this.deaerator.feedwaterPressure,
      temperature: this.deaerator.feedwaterTemperature,
      specificEnthalpy: this.deaerator.feedwaterSpecificEnthalpy,
      specificEntropy: this.deaerator.feedwaterSpecificEntropy,
      quality: this.deaerator.feedwaterQuality,
      specificVolume: this.deaerator.feedwaterVolume,
      massFlow: this.deaerator.feedwaterMassFlow,
      energyFlow: this.deaerator.feedwaterEnergyFlow
    }
  }


}
