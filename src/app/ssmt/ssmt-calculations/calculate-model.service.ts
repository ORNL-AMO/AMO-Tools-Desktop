import { Injectable } from '@angular/core';
import { SteamService } from '../../calculator/steam/steam.service';
import { BoilerOutput, SteamPropertiesOutput, HeaderOutputObj, HeatLossOutput, PrvOutput, TurbineOutput, FlashTankOutput, DeaeratorOutput } from '../../shared/models/steam/steam-outputs';
import { Settings } from '../../shared/models/settings';
import { SSMTInputs, SSMT, HeaderNotHighestPressure } from '../../shared/models/steam/ssmt';
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

  highPressureProcessSteamUsage: SteamPropertiesOutput;
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
    this.calculateModel(58.7);
    return 0;
    // let additionalSteamFlow: number = this.steamToDeaerator;
    // if (additionalSteamFlow == 0 || !additionalSteamFlow) {
    //   additionalSteamFlow = 1;
    // }
    // if (this.additionalSteamFlow) {
    //   additionalSteamFlow = this.additionalSteamFlow;
    // }
    // let adjustment: number = this.convergeAdjustment(additionalSteamFlow, .01);
    // let cc: number = 0;
    // while (Math.abs(adjustment) > 1e-5 && cc++ < 50) {
    //   adjustment = this.convergeAdjustment(additionalSteamFlow);
    //   let y1, y2, yNew, x1, x2, xNew: number;
    //   let lastSlope: number;
    //   switch (cc) {
    //     case 1: {
    //       y1 = additionalSteamFlow;
    //       x1 = adjustment;
    //       break;
    //     }
    //     case 2: {
    //       y2 = additionalSteamFlow;
    //       x2 = adjustment;
    //       break;
    //     }
    //     default: {
    //       //set new test point
    //       yNew = additionalSteamFlow;
    //       xNew = adjustment;
    //       //select closest old test point
    //       let y1Diff: number = Math.abs(y1 - yNew);
    //       let y2Diff: number = Math.abs(y2 - yNew);
    //       if (y1Diff < y2Diff) {
    //         y2 = yNew;
    //         x2 = xNew;
    //       } else {
    //         y2 = y1;
    //         x2 = x1;
    //         y1 = yNew;
    //         x1 = xNew;
    //       }
    //       break;
    //     }
    //   }

    //   //use linear interpolation to determin new adjustment
    //   if (y1 && y2) {
    //     if (x2 == x1) {
    //       additionalSteamFlow = additionalSteamFlow + adjustment;
    //       adjustment == this.convergeAdjustment(additionalSteamFlow);
    //       break;
    //     }
    //     let slope: number = (y2 - y1) / (x2 - x1);
    //     let yIntercept: number = y2 - (x2 * slope);

    //     if (
    //       (cc > 10 && (cc % 5) == 0) ||
    //       (lastSlope && (slope == 0 || lastSlope / slope < 0))
    //     ) {
    //       additionalSteamFlow = additionalSteamFlow + adjustment;
    //     } else {
    //       additionalSteamFlow = yIntercept;
    //     }
    //     lastSlope = slope;
    //   } else {
    //     additionalSteamFlow = additionalSteamFlow + adjustment;
    //   }
    //   if (isNaN(adjustment)) {
    //     break;
    //   }
    // }
    // return additionalSteamFlow;
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
    let steamProduction: number = massFlow + this.inputData.headerInput.highPressure.processSteamUsage;
    if (this.inputData.headerInput.numberOfHeaders > 1) {
      steamProduction = steamProduction + this.inputData.headerInput.lowPressure.processSteamUsage;
      if (this.inputData.headerInput.numberOfHeaders == 3) {
        steamProduction = steamProduction + this.inputData.headerInput.mediumPressure.processSteamUsage;
      }
    }
    console.log('mass flow: ' + massFlow);
    console.log('process steam usage: ' + this.inputData.headerInput.highPressure.processSteamUsage);
    console.log('steam production ' + steamProduction);

    //1. Calculate Boiler
    //1A. Model Boiler with massFlow
    this.calculateBoiler(massFlow);
    //1B. Set Blowdown Properties
    this.setBoilerBlowdown();
    //1C. Set Feedwater Properties
    //this.setBoilerFeedwater();

    //2. Calculate High Pressure Header
    //2A. Model High Pressure Header
    this.calculateHighPressureHeader();
    //2B. Calculate Heat Loss for Remaining Steam in High Pressure Header
    this.calculateHeatLossForHighPressureHeader();
    //2C. Calculate High Pressure Condensate
    this.calculateHighPressureCondensate();

    //if medium pressure header exists
    if (this.inputData.headerInput.numberOfHeaders == 3) {
      //3. Calculate Medium Pressure Header
      //3A. Model Medium Pressure Header
      this.calculateMediumPressureHeader();
      //3B. Calculate Heat Loss for Remain Steam in Medium Pressure Header
      this.calculateHeatLossForMediumPressureHeader();
      //3C. Calculate Medium Pressure Condensate
      this.calculateMediumPressureCondensate();
    }

    //if low pressure header exists
    if (this.inputData.headerInput.numberOfHeaders > 1) {
      //4. Calculate Low Pressure Header
      //4A. Model Low Pressure Header
      this.calculateLowPressureHeader();
      //4B. Calculate Heat Loss for Remaining Steam in Low Pressure Header
      this.calculateHeatLossForLowPressureHeader();
      //4C. Calculate Low Pressure Condensate
      this.calculateLowPressureCondensate();
    }

    //5. Calculate Makeup Water and Condensate Header
    this.calculateMakeupWaterAndCondensateHeader();

    //6. Calculate Deaerator
    this.calculateDearator();

    //7. Calculate difference
    //steamToDearator = massFlow in lowest pressure header
    console.log('inlet steam mass flow: ' + this.deaerator.inletSteamMassFlow);
    console.log('steam to deaerator: ' + this.steamToDeaerator);
    console.log('======');
    let daSteamDifference: number = this.deaerator.inletSteamMassFlow - this.steamToDeaerator;
    //console.log('difference: ' + daSteamDifference);
    return daSteamDifference;
  }

  //1A. Calculate Boiler
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

  //1B. Set Boiler Blowdown
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

  //1C. Set Boiler Feedwater
  // setBoilerFeedwater() {
  //   this.boilerFeedwater = {
  //     pressure: this.boiler.feedwaterPressure,
  //     temperature: this.boiler.feedwaterTemperature,
  //     specificEnthalpy: this.boiler.feedwaterSpecificEnthalpy,
  //     specificEntropy: this.boiler.feedwaterSpecificEntropy,
  //     quality: this.boiler.feedwaterQuality,
  //     specificVolume: this.boiler.feedwaterVolume,
  //     massFlow: this.boiler.feedwaterMassFlow,
  //     energyFlow: this.boiler.feedwaterEnergyFlow
  //   }
  // }

  //2A. Calculate High Pressure Header
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

  //2B. Calculate Heat Loss for Remaining Steam in High Pressure Header
  calculateHeatLossForHighPressureHeader() {
    // this.highPressureProcessSteamUsage = this.steamService.heatLoss(
    //   {
    //     inletPressure: this.highPressureHeader.pressure,
    //     thermodynamicQuantity: 1, //specificEnthalpy
    //     quantityValue: this.highPressureHeader.specificEnthalpy,
    //     inletMassFlow: this.inputData.headerInput.highPressure.processSteamUsage * (this.inputData.headerInput.highPressure.condensationRecoveryRate / 100),
    //     percentHeatLoss: this.inputData.headerInput.highPressure.heatLoss
    //   },
    //   this.settings
    // );
    this.highPressureProcessSteamUsage = JSON.parse(JSON.stringify(this.blowdown));
    this.highPressureProcessSteamUsage. massFlow = this.inputData.headerInput.highPressure.processSteamUsage * (this.inputData.headerInput.highPressure.condensationRecoveryRate / 100);
    this.highPressureHeader.remainingSteam = JSON.parse(JSON.stringify(this.highPressureProcessSteamUsage));
    //console.log(this.highPressureHeader.remainingSteam.massFlow);
  }

  //2C. Calculate High Pressure Condensate
  calculateHighPressureCondensate() {
    //Calculate mass flow = steam usage * (recovery rate / 100);
    let calculatedMassFlow: number = this.inputData.headerInput.highPressure.processSteamUsage * (this.inputData.headerInput.highPressure.condensationRecoveryRate / 100);
    //calculate energy flow = mass flow * condensate enthalpy / 1000
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

  //3A. Model Medium Pressure Header
  calculateMediumPressureHeader() {
    //3A1. Calculate inlets for medium pressure header
    let inlets: Array<HeaderInputObj> = this.getMediumPressureInlets();
    //3A2. Calculate medium pressure header
    //notice .header at the end (need .header obj for mediumPressureHeader)
    this.mediumPressureHeader = this.steamService.header(
      {
        headerPressure: this.inputData.headerInput.mediumPressure.pressure,
        inlets: inlets
      },
      this.settings).header;
  }

  //3A1. Get inlets for medium pressure header
  getMediumPressureInlets(): Array<HeaderInputObj> {
    let inlets: Array<HeaderInputObj> = new Array<HeaderInputObj>();
    //3A1a. Calculate Medium pressure PRV 
    //PRV always exists
    this.calculateHighToMediumPRV();
    //add PRV to inlets
    inlets.push(
      {
        pressure: this.highToMediumPressurePRV.outletPressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.highToMediumPressurePRV.outletSpecificEnthalpy,
        massFlow: this.highToMediumPressurePRV.outletMassFlow
      }
    );
    //3A1b. Calculate high to medium turbine if in use
    if (this.inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
      this.calculateHighToMediumPressureSteamTurbine();
      //add turbine to inlets
      inlets.push(
        {
          pressure: this.highPressureToMediumPressureTurbine.outletPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.highPressureToMediumPressureTurbine.outletSpecificEnthalpy,
          massFlow: this.highPressureToMediumPressureTurbine.massFlow
        }
      );
    }
    //3A1c. Calculate high pressure flash tank if flashing condensate into header
    if (this.inputData.headerInput.mediumPressure.flashCondensateIntoHeader == true) {
      this.calculateHighPressureFlashTank();
      //add flash tank gas to inlets
      inlets.push(
        {
          pressure: this.highPressureFlashTank.outletGasPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.highPressureFlashTank.outletGasSpecificEnthalpy,
          massFlow: this.highPressureFlashTank.outletGasMassFlow
        }
      );
    }
    return inlets;
  }


  //3A1a. Calculate High to Medium PRV
  calculateHighToMediumPRV() {
    if (this.inputData.headerInput.mediumPressure.desuperheatSteamIntoNextHighest == true) {
      this.highToMediumPressurePRV = this.steamService.prvWithDesuperheating(
        {
          inletPressure: this.highPressureHeader.remainingSteam.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: this.highPressureHeader.remainingSteam.specificEnthalpy,
          inletMassFlow: this.highPressureHeader.remainingSteam.massFlow,
          outletPressure: this.inputData.headerInput.mediumPressure.pressure,
          feedwaterPressure: this.boiler.feedwaterPressure,
          feedwaterThermodynamicQuantity: 1,//1 is enthalpy
          feedwaterQuantityValue: this.boiler.feedwaterSpecificEnthalpy,
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

  //3A1b. Calculate High to Medium Steam Turbine
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

  //3A1c (2 headers) or 4A1c (3 headers). Calculate High Pressure Condensate Flash Tank
  calculateHighPressureFlashTank() {
    let header: HeaderNotHighestPressure;
    //if two headers, flashinging into low pressure header
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

  //3B. Calculate Heat Loss for Remaining Steam in Medium Pressure Header
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

  //3C. Calculate Medium Pressure Condensate
  calculateMediumPressureCondensate() {
    let calculatedMassFlow: number = this.inputData.headerInput.mediumPressure.processSteamUsage * (this.inputData.headerInput.mediumPressure.condensationRecoveryRate / 100);
    if (this.inputData.headerInput.mediumPressure.flashCondensateIntoHeader == true) {
      calculatedMassFlow = calculatedMassFlow + this.highPressureFlashTank.outletLiquidMassFlow;
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
    else {
      calculatedMassFlow = calculatedMassFlow + this.highPressureCondensate.massFlow;
      let calcualtedEnergyFlow: number = calculatedMassFlow * this.highPressureCondensate.specificEnthalpy;
      this.mediumPressureCondensate = {
        pressure: this.highPressureCondensate.pressure,
        temperature: this.highPressureCondensate.temperature,
        specificEnthalpy: this.highPressureCondensate.specificEnthalpy,
        specificEntropy: this.highPressureCondensate.specificEntropy,
        quality: this.highPressureCondensate.quality,
        energyFlow: calcualtedEnergyFlow,
        specificVolume: this.highPressureCondensate.specificVolume,
        massFlow: calculatedMassFlow
      }
    }
  }

  //4A. Model Low Pressure Header
  calculateLowPressureHeader() {
    //4A1. Calculate inlets for low pressure header
    let inlets: Array<HeaderInputObj> = this.getLowPressureHeaderInlets();
    //4A2. Calculate low pressure header
    //notice .header at the end (need .header obj for lowPressureHeader)
    this.lowPressureHeader = this.steamService.header(
      {
        headerPressure: this.inputData.headerInput.lowPressure.pressure,
        inlets: inlets
      },
      this.settings).header;
  }
  //4A1. Get Inlets for low pressure header
  getLowPressureHeaderInlets(): Array<HeaderInputObj> {
    let inlets: Array<HeaderInputObj> = new Array<HeaderInputObj>();
    //4A1a. Calculate low pressure PRV
    //PRV always exists
    this.calculateLowPressurePRV();
    inlets.push(
      {
        pressure: this.lowPressurePRV.outletPressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.lowPressurePRV.outletSpecificEnthalpy,
        massFlow: this.lowPressurePRV.outletMassFlow
      }
    );
    //4A1b. Calcualte high to low pressure turbine if in use
    if (this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
      this.calculateHighToLowSteamTurbine();
      //add outlet steam to inlets
      inlets.push(
        {
          pressure: this.highToLowPressureTurbine.outletPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.highToLowPressureTurbine.outletSpecificEnthalpy,
          massFlow: this.highToLowPressureTurbine.massFlow
        }
      )
    }
    //4A1c. Calculate flashed steam if flashing condensate into header
    if (this.inputData.headerInput.lowPressure.flashCondensateIntoHeader == true) {
      //if medium pressure header exists, flash medium pressure condensate
      if (this.inputData.headerInput.numberOfHeaders == 3) {
        this.calculateMediumPressureFlashTank();
        //add flashed steam to inlets
        inlets.push(
          {
            pressure: this.mediumPressureFlashTank.outletGasPressure,
            thermodynamicQuantity: 1, //specificEnthalpy
            quantityValue: this.mediumPressureFlashTank.outletGasSpecificEnthalpy,
            massFlow: this.mediumPressureFlashTank.outletGasMassFlow
          }
        )
      } else {
        //if only high and low header, flash high pressure condensate
        this.calculateHighPressureFlashTank();
        //add flashed steam to inlets
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
    //4A1d. Calculate flashed blowdown, if selected
    if (this.inputData.boilerInput.blowdownFlashed == true) {
      this.calculateBlowdownFlashTank();
      //add flashed steam from blowdown flash tank to inlets
      inlets.push(
        {
          pressure: this.blowdownFlashTank.outletGasPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.blowdownFlashTank.outletGasSpecificEnthalpy,
          massFlow: this.blowdownFlashTank.outletGasMassFlow
        }
      )
    }
    //4A1e. Calculate Medium to Low Pressure Turbine: if medium pressure header, and turbine from medium to low pressure exists.
    if (this.inputData.headerInput.numberOfHeaders == 3 && this.inputData.turbineInput.mediumToLowTurbine.useTurbine == true) {
      this.calculateMediumToLowSteamTurbine();
      //add outlet steam to inlets
      inlets.push(
        {
          pressure: this.mediumToLowPressureTurbine.outletPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.mediumToLowPressureTurbine.outletSpecificEnthalpy,
          massFlow: this.mediumToLowPressureTurbine.massFlow
        }
      )
    }
    return inlets;
  }

  //4A1a. Calculate Low Pressure PRV
  calculateLowPressurePRV() {
    let headerObj: HeaderOutputObj;
    //either medium to low or high to low
    if (this.inputData.headerInput.numberOfHeaders == 2) {
      //if 2 headers, next highest is high pressure
      headerObj = this.highPressureHeader;
    } else if (this.inputData.headerInput.numberOfHeaders == 3) {
      //if 3 headers, next highest is medium pressure
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
          feedwaterPressure: this.boiler.feedwaterPressure,
          feedwaterThermodynamicQuantity: 1,//1 is enthalpy
          feedwaterQuantityValue: this.boiler.feedwaterSpecificEnthalpy,
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

  //4A1b. Calculate High to Low Steam Turbine
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
  //4A1c. Calculate Medium Pressure Flash Tank
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

  //4A1d. Calculate Blowdown Flash Tank
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

  //4A1e. Calculate Medium to Low Steam Turbine
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
  //4B. Calculate Heat Loss for Remaining Steam in Low Pressure Header
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
  //4C. Calculate Low Pressure Condensate
  calculateLowPressureCondensate() {
    let calculatedMassFlow: number = this.inputData.headerInput.lowPressure.processSteamUsage * (this.inputData.headerInput.lowPressure.condensationRecoveryRate / 100);
    //if flashing condnesate into header (will have already been flashed by this step)
    //use outlet liquid from flash tank
    if (this.inputData.headerInput.lowPressure.flashCondensateIntoHeader == true) {
      let flashTank: FlashTankOutput;
      if (this.inputData.headerInput.numberOfHeaders == 3) {
        //if 3 headers, next highest is medium
        flashTank = this.mediumPressureFlashTank;
      } else {
        //if 2 headers, next highest is high pressure
        flashTank = this.highPressureFlashTank;
      }
      //combine flow from current header and liquid from higher pressure flash tank
      calculatedMassFlow = calculatedMassFlow + flashTank.outletLiquidMassFlow;
      let calcualtedEnergyFlow: number = calculatedMassFlow * this.mediumPressureFlashTank.outletLiquidSpecificEnthalpy / 1000;
      this.lowPressureCondensate = {
        pressure: flashTank.outletLiquidPressure,
        temperature: flashTank.outletLiquidTemperature,
        specificEnthalpy: flashTank.outletLiquidSpecificEnthalpy,
        specificEntropy: flashTank.outletLiquidSpecificEntropy,
        quality: flashTank.outletLiquidQuality,
        energyFlow: calcualtedEnergyFlow,
        specificVolume: flashTank.outletLiquidVolume,
        massFlow: calculatedMassFlow
      }
    } else {
      //Use condensate from next highest header
      let inletCondensate: SteamPropertiesOutput;
      if (this.inputData.headerInput.numberOfHeaders == 3) {
        //if 3 headers, next highest is medium
        inletCondensate = this.mediumPressureCondensate;
      } else {
        //if 2 headers, next highest is high pressure
        inletCondensate = this.highPressureCondensate;
      }
      let calcualtedEnergyFlow: number = calculatedMassFlow * inletCondensate.specificEnthalpy;
      this.lowPressureCondensate = {
        pressure: inletCondensate.pressure,
        temperature: inletCondensate.temperature,
        specificEnthalpy: inletCondensate.specificEnthalpy,
        specificEntropy: inletCondensate.specificEntropy,
        quality: inletCondensate.quality,
        energyFlow: calcualtedEnergyFlow,
        specificVolume: inletCondensate.specificVolume,
        massFlow: calculatedMassFlow
      }
    }

  }

  //5. Calculate Makeup Water and Condensate Header
  calculateMakeupWaterAndCondensateHeader() {
    //5A. Get inlets for makeup water and condensate header
    let inlets: Array<HeaderInputObj> = this.getMakeupWaterAndCondensateInlets();
    console.log(inlets);
    //console.log(inlets);
    //notice .header at the end (need .header obj for makeupWaterAndCondensateHeader)
    this.makeupWaterAndCondensateHeader = this.steamService.header(
      {
        headerPressure: this.inputData.boilerInput.deaeratorPressure,
        inlets: inlets
      },
      this.settings
    ).header;
  }

  //5A. Get inlets for makeup water and condensate header
  getMakeupWaterAndCondensateInlets(): Array<HeaderInputObj> {
    let inlets: Array<HeaderInputObj> = new Array<HeaderInputObj>();

    //5A2. Calculate condendsing turbine if exists
    if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
      this.calculateCondensingTurbine();
      //add outlet condensate from condensing turbine to inlets
      inlets.push(
        {
          pressure: this.condensingTurbine.outletPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.condensingTurbine.outletSpecificEnthalpy,
          massFlow: this.condensingTurbine.massFlow
        }
      )
      //console.log(inlets);
    }
    //5A3. Calculate return condensate from headers
    this.calculateReturnCondensate();
    //add return condensate to inlets
    inlets.push(
      {
        pressure: this.returnCondensate.pressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.returnCondensate.specificEnthalpy,
        massFlow: this.returnCondensate.massFlow
      }
    )
    //5A1. Calculate makeup water properties
    this.calculateMakeupWater();
    let makeupWaterMassFlow: number = this.calculateMakeupWaterMassFlow();
    this.makeupWater.massFlow = makeupWaterMassFlow;
    this.makeupWater.energyFlow = this.makeupWater.massFlow * this.makeupWater.specificEnthalpy / 1000;
    //add makeup water to inlets
    inlets.push(
      {
        pressure: this.makeupWater.pressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.makeupWater.specificEnthalpy,
        massFlow: this.makeupWater.massFlow
      }
    );
    return inlets;
  }

  //5A1. Calculate Makeup Water Properties
  calculateMakeupWater() {
    //5A1a. Calculate makeup water properties
    this.makeupWater = this.steamService.steamProperties(
      {
        thermodynamicQuantity: 0, //temperature
        quantityValue: this.inputData.operationsInput.makeUpWaterTemperature,
        pressure: .101325 //atmospheric pressure
      },
      this.settings
    );

    //5A1b. Run heat exchange if pre heating makeup water
    if (this.inputData.boilerInput.preheatMakeupWater == true) {
      this.runHeatExchanger();
    }
  }

  calculateMakeupWaterMassFlow(): number {
    //debugger
    let makeupWaterMassFlow: number = this.boiler.feedwaterMassFlow;
    if (this.inputData.headerInput.numberOfHeaders > 1) {
      if (this.inputData.headerInput.numberOfHeaders == 3 && isNaN(this.highToMediumPressurePRV.feedwaterMassFlow) == false) {
        makeupWaterMassFlow = makeupWaterMassFlow + this.highToMediumPressurePRV.feedwaterMassFlow;
      }
      if (isNaN(this.lowPressurePRV.feedwaterMassFlow) == false) {
        makeupWaterMassFlow = makeupWaterMassFlow + this.lowPressurePRV.feedwaterMassFlow;
      }
    }
    makeupWaterMassFlow = makeupWaterMassFlow * (1 + this.inputData.boilerInput.deaeratorVentRate / 100);

    makeupWaterMassFlow = makeupWaterMassFlow - this.returnCondensate.massFlow;
    if (this.inputData.headerInput.numberOfHeaders > 1) {
      makeupWaterMassFlow = makeupWaterMassFlow - this.lowPressureHeader.remainingSteam.massFlow;
    } else {
      //makeupWaterMassFlow = makeupWaterMassFlow - this.highPressureHeader.remainingSteam.massFlow;
      console.log(this.highPressureHeader.massFlow - this.inputData.headerInput.highPressure.processSteamUsage)
      makeupWaterMassFlow = makeupWaterMassFlow - (this.highPressureHeader.massFlow - this.inputData.headerInput.highPressure.processSteamUsage);
    }
    if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
      makeupWaterMassFlow = makeupWaterMassFlow - this.condensingTurbine.massFlow;
    }
    return makeupWaterMassFlow;
  }

  //5A1b. Run Heat Exchanger
  runHeatExchanger() {
    //TODO: need bindings to HeatExchanger() in the suite before doing this step..
  }

  //5A2. Calculate Condensing Turbine
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

  //5A3. Calculate Return Condensate
  calculateReturnCondensate() {
    //get



    //5A3a. Set return condensate to condensate from lowest pressure header
    //set return condnesate to high pressure condensate if only high pressure header
    if (this.inputData.headerInput.numberOfHeaders == 1) {
      this.returnCondensate = this.highPressureCondensate;
    }
    //set return condensate to low pressure header if exists
    else {
      this.returnCondensate = this.lowPressureCondensate;
    }
    //5A3b. Flash Return Condensate if set and update return condensate
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
    }
  }

  //5A3b. Flash Condensate Return
  flashCondensateReturn() {
    this.condensateFlashTank = this.steamService.flashTank(
      {
        inletWaterPressure: this.returnCondensate.pressure,
        quantityValue: this.returnCondensate.specificEnthalpy,
        thermodynamicQuantity: 1,
        inletWaterMassFlow: this.returnCondensate.massFlow,
        tankPressure: this.inputData.boilerInput.deaeratorPressure
      },
      this.settings
    )
  }

  //6. Calculate Deaerator
  calculateDearator() {
    //6A. Get Feedwater Details and Inlet header
    let feedwaterMassFlow: number = this.boiler.feedwaterMassFlow
    let inletHeader: HeaderOutputObj = this.highPressureHeader;
    if (this.inputData.headerInput.numberOfHeaders > 1) {
      if (isNaN(this.lowPressurePRV.feedwaterMassFlow) == false) {
        feedwaterMassFlow = feedwaterMassFlow + this.lowPressurePRV.feedwaterMassFlow;
      }
      inletHeader = this.lowPressureHeader;
    }
    if (this.inputData.headerInput.numberOfHeaders == 3 && isNaN(this.highToMediumPressurePRV.feedwaterMassFlow) == false) {
      feedwaterMassFlow = feedwaterMassFlow + this.highToMediumPressurePRV.feedwaterMassFlow;
    }
    //6B. Calculate Deaerator
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
    // this.deaeratorFeedwater = {
    //   pressure: this.deaerator.feedwaterPressure,
    //   temperature: this.deaerator.feedwaterTemperature,
    //   specificEnthalpy: this.deaerator.feedwaterSpecificEnthalpy,
    //   specificEntropy: this.deaerator.feedwaterSpecificEntropy,
    //   quality: this.deaerator.feedwaterQuality,
    //   specificVolume: this.deaerator.feedwaterVolume,
    //   massFlow: this.deaerator.feedwaterMassFlow,
    //   energyFlow: this.deaerator.feedwaterEnergyFlow
    // }
  }


  initResults() {
    this.inputData = undefined;

    this.boiler = undefined;
    this.blowdown = undefined;
    this.boilerFeedwater = undefined;
    this.deaeratorFeedwater = undefined;

    this.highPressureHeader = undefined;
    this.highToMediumPressurePRV = undefined;
    this.highPressureToMediumPressureTurbine = undefined;
    this.highPressureFlashTank = undefined;
    this.highPressureCondensate = undefined;

    this.mediumPressureHeader = undefined;
    this.lowPressurePRV = undefined;
    this.mediumPressureCondensate = undefined;

    this.highToLowPressureTurbine = undefined;
    this.mediumToLowPressureTurbine = undefined;
    this.mediumPressureFlashTank = undefined;
    this.blowdownFlashTank = undefined;

    this.lowPressureHeader = undefined;
    this.lowPressureCondensate = undefined;

    this.condensateFlashTank = undefined;
    this.returnCondensate = undefined;
    this.makeupWater = undefined;
    this.makeupWaterAndCondensateHeader = undefined;
    this.condensingTurbine = undefined;
    this.deaerator = undefined;

    this.steamToDeaerator = undefined;
    this.additionalSteamFlow = undefined;
  }

}
