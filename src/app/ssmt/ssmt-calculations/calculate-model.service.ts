import { Injectable } from '@angular/core';
import { SteamService } from '../../calculator/steam/steam.service';
import { BoilerOutput, SteamPropertiesOutput, HeaderOutputObj, HeatLossOutput, PrvOutput, TurbineOutput, FlashTankOutput, DeaeratorOutput, ProcessSteamUsage, HeaderOutput } from '../../shared/models/steam/steam-outputs';
import { Settings } from '../../shared/models/settings';
import { SSMTInputs, SSMT, HeaderNotHighestPressure, HeaderWithHighestPressure } from '../../shared/models/steam/ssmt';
import { HeaderInputObj, HeaderInput } from '../../shared/models/steam/steam-inputs';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Injectable()
export class CalculateModelService {
  settings: Settings;
  inputData: SSMTInputs;

  boilerOutput: BoilerOutput;

  highPressureHeader: HeaderOutputObj;
  highPressureSteamHeatLoss: HeatLossOutput;

  lowPressurePRV: PrvOutput;
  highToMediumPressurePRV: PrvOutput;

  highToLowPressureTurbine: TurbineOutput;
  highPressureToMediumPressureTurbine: TurbineOutput;
  highPressureCondensateFlashTank: FlashTankOutput;

  lowPressureHeader: HeaderOutputObj;
  lowPressureSteamHeatLoss: HeatLossOutput;

  mediumToLowPressureTurbine: TurbineOutput;
  mediumPressureCondensateFlashTank: FlashTankOutput;

  mediumPressureHeader: HeaderOutputObj;
  mediumPressureSteamHeatLoss: HeatLossOutput;

  blowdownFlashTank: FlashTankOutput;

  highPressureCondensate: SteamPropertiesOutput;
  lowPressureCondensate: SteamPropertiesOutput;
  mediumPressureCondensate: SteamPropertiesOutput;
  combinedCondensate: HeaderOutputObj;
  returnCondensate: SteamPropertiesOutput;
  condensateFlashTank: FlashTankOutput;

  makeupWater: SteamPropertiesOutput;
  makeupWaterAndCondensateHeader: HeaderOutputObj;

  condensingTurbine: TurbineOutput;
  deaeratorOutput: DeaeratorOutput;

  //heatExchanger: HeatExchanger
  constructor(private steamService: SteamService, private convertUnitsService: ConvertUnitsService) { }

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

  initData(_ssmt: SSMT, _settings: Settings): void {
    this.inputData = this.getInputDataFromSSMT(_ssmt);
    this.settings = _settings;
  }

  marksIterator() {
    let addtionalMassFlow: number = 0;
    let iterateValue: number = this.calculateSteamProducation(addtionalMassFlow);
    let count: number = 1;
    while (iterateValue > 1e-5) {
      addtionalMassFlow = addtionalMassFlow + iterateValue;
      iterateValue = this.calculateSteamProducation(addtionalMassFlow);
      console.log(iterateValue);
      console.log(count);
      count++;
    }
    return addtionalMassFlow;
  }

  calculateSteamProducation(additionalSteamFlow: number) {
    console.log('===============')
    console.log('additional steam flow : ' + additionalSteamFlow);
    let steamProduction: number = 0;
    if (this.inputData.headerInput.numberOfHeaders == 1) {
      steamProduction = this.inputData.headerInput.highPressure.processSteamUsage;
    } else if (this.inputData.headerInput.numberOfHeaders == 2) {
      steamProduction = (this.inputData.headerInput.highPressure.processSteamUsage + this.inputData.headerInput.lowPressure.processSteamUsage);
    } else if (this.inputData.headerInput.numberOfHeaders == 3) {
      steamProduction = (this.inputData.headerInput.highPressure.processSteamUsage + this.inputData.headerInput.lowPressure.processSteamUsage + this.inputData.headerInput.mediumPressure.processSteamUsage);
    }
    steamProduction = steamProduction + additionalSteamFlow;

    this.calculateModel(steamProduction);

    let processSteamUsage: number = this.getProcessSteamUsage();
    let inletAndUsageSteam: number = processSteamUsage + this.deaeratorOutput.inletSteamMassFlow;
    let blowdownMassFlow: number = this.boilerOutput.blowdownMassFlow;
    if (this.inputData.boilerInput.blowdownFlashed == true) {
      blowdownMassFlow = this.blowdownFlashTank.outletLiquidMassFlow;
    }
    let steamProductionAdjustment: number = inletAndUsageSteam - (steamProduction + blowdownMassFlow);
    console.log('steam production adjustment = ' + steamProductionAdjustment);
    console.log('===============')
    return steamProductionAdjustment;
  }

  getProcessSteamUsage(): number {
    let steamUsage: number = this.inputData.headerInput.highPressure.processSteamUsage;
    if (this.inputData.headerInput.numberOfHeaders > 1) {
      steamUsage = steamUsage + this.inputData.headerInput.lowPressure.processSteamUsage;
      if (this.inputData.headerInput.numberOfHeaders == 3) {
        steamUsage = steamUsage + this.inputData.headerInput.mediumPressure.processSteamUsage;
      }
    }
    if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
      steamUsage = steamUsage + this.condensingTurbine.massFlow;
    }

    return steamUsage;
  }

  calculateModel(massFlow: number): void {
    //1. Model Boiler
    //1A. Calculate Boiler with massFlow
    this.calculateBoiler(massFlow);
    //1B. Flash blowdown if selected
    if (this.inputData.boilerInput.blowdownFlashed == true) {
      this.calculateBlowdownFlashTank();
    }
    //2. Model High Pressure Header
    //2A. Calculate High Pressure Header
    this.calculateHighPressureHeader();
    //2B. Calculate Heat Loss of steam in high pressure header
    this.calculateHeatLossForHighPressureHeader();
    //2C. Calculate High Pressure Condensate
    this.calculateHighPressureCondensate();
    //2D. Calculate high to low steam turbine if in use
    if (this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
      this.calculateHighToLowSteamTurbine();
    }
    //2E. Calculate high to medium steam turbine if in use
    if (this.inputData.headerInput.numberOfHeaders == 3 && this.inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
      this.calculateHighToMediumPressureSteamTurbine();
    }
    //2F. Calcuate condensing turbine
    if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
      this.calculateCondensingTurbine();
    }

    //3. Calculate Medium Pressure Header
    //if medium pressure header exists
    if (this.inputData.headerInput.numberOfHeaders == 3) {
      //3A. Calculate High to Medium PRV
      this.calculateHighToMediumPRV();
      //3B. Calculate high pressure flash tank
      if (this.inputData.headerInput.mediumPressure.flashCondensateIntoHeader == true) {
        this.calculateHighPressureFlashTank();
      }
      //3C. Model Medium Pressure Header
      this.calculateMediumPressureHeader();
      //3D. Calculate Heat Loss for Remain Steam in Medium Pressure Header
      this.calculateHeatLossForMediumPressureHeader();
      //3E. Calculate Medium Pressure Condensate
      this.calculateMediumPressureCondensate();
      //3F. Calculate medium to low steam turbine if in use
      if (this.inputData.turbineInput.mediumToLowTurbine.useTurbine == true) {
        this.calculateMediumToLowSteamTurbine();
      }
    }

    //4. Calculate Low Pressure Header
    //if low pressure header exists
    if (this.inputData.headerInput.numberOfHeaders > 1) {
      //4A. Calculate to low pressure PRV
      this.calculateLowPressurePRV();
      //4B. Calculate flashed steam into low pressure header if selected
      if (this.inputData.headerInput.lowPressure.flashCondensateIntoHeader == true) {
        if (this.inputData.headerInput.numberOfHeaders == 3) {
          this.calculateMediumPressureFlashTank();
        } else {
          this.calculateHighPressureFlashTank();
        }
      }
      //4C. Model Low Pressure Header
      this.calculateLowPressureHeader();
      //4D. Calculate Heat Loss for Remaining Steam in Low Pressure Header
      this.calculateHeatLossForLowPressureHeader();
      //4E. Calculate Low Pressure Condensate
      this.calculateLowPressureCondensate();
    }

    //5. Calculate Makeup Water and Condensate Header
    //5A. Calculate combined condensate
    this.calculateCombinedCondensate();
    //5B. Calculate return condensate
    this.calculateReturnCondensate();
    //5C. Flash return condensate if selected
    if (this.inputData.headerInput.highPressure.flashCondensateReturn == true) {
      this.flashCondensateReturn();
    }
    //5D. Calculate Makeup Water
    this.calculateMakeupWater();
    //5E. Calculate makeup water mass flow
    this.calculateMakeupWaterMassFlow();
    //5F. Run heat exchange if pre heating makeup water
    if (this.inputData.boilerInput.preheatMakeupWater == true) {
      this.runHeatExchanger();
    }
    //5G. Calculate makeup water and condensate combined
    this.calculateMakeupWaterAndCondensateHeader();

    //6. Calculate Deaerator
    this.calculateDearator();
  }


  /********** 1. Model Boiler *********/
  //1A. Calculate Boiler
  calculateBoiler(_massFlow: number) {
    this.boilerOutput = this.steamService.boiler(
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

  //1B. Calculate Blowdown Flash Tank
  calculateBlowdownFlashTank() {
    //use lowest pressure header
    let headerInputObj: HeaderWithHighestPressure | HeaderNotHighestPressure = this.inputData.headerInput.highPressure;
    if (this.inputData.headerInput.numberOfHeaders > 1) {
      headerInputObj = this.inputData.headerInput.lowPressure;
    }
    //flash the blowdown from the boiler
    this.blowdownFlashTank = this.steamService.flashTank(
      {
        inletWaterPressure: this.boilerOutput.blowdownPressure,
        quantityValue: this.boilerOutput.blowdownSpecificEnthalpy,
        thermodynamicQuantity: 1,
        inletWaterMassFlow: this.boilerOutput.blowdownMassFlow,
        tankPressure: headerInputObj.pressure
      },
      this.settings
    )
  }

  /********** 2. Calculate High Pressure Header *********/
  //2A. Calculate High Pressure Header
  calculateHighPressureHeader() {
    //notice .header at the end (need .header obj for highPressureHeader)
    this.highPressureHeader = this.steamService.header(
      {
        headerPressure: this.inputData.headerInput.highPressure.pressure,
        inlets: [
          {
            pressure: this.boilerOutput.steamPressure,
            thermodynamicQuantity: 1, //specificEnthalpy
            quantityValue: this.boilerOutput.steamSpecificEnthalpy,
            massFlow: this.boilerOutput.steamMassFlow
          }
        ]
      },
      this.settings
    ).header;
  }

  //2B. Calculate Heat Loss of steam in high pressure header
  calculateHeatLossForHighPressureHeader() {
    this.highPressureSteamHeatLoss = this.steamService.heatLoss(
      {
        inletPressure: this.highPressureHeader.pressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.highPressureHeader.specificEnthalpy,
        inletMassFlow: this.highPressureHeader.massFlow,
        percentHeatLoss: this.inputData.headerInput.highPressure.heatLoss
      },
      this.settings
    );
    this.highPressureHeader = {
      energyFlow: this.highPressureSteamHeatLoss.outletEnergyFlow,
      massFlow: this.highPressureSteamHeatLoss.outletMassFlow,
      pressure: this.highPressureSteamHeatLoss.outletPressure,
      quality: this.highPressureSteamHeatLoss.outletQuality,
      specificEnthalpy: this.highPressureSteamHeatLoss.outletSpecificEnthalpy,
      specificEntropy: this.highPressureSteamHeatLoss.outletSpecificEntropy,
      temperature: this.highPressureSteamHeatLoss.outletTemperature,
      specificVolume: this.highPressureHeader.specificVolume

    }
  }

  //2C. Calculate High Pressure Condensate
  //has same properties as blowdown with updated mass and energy flows
  calculateHighPressureCondensate() {
    //Calculate mass flow = steam usage * (recovery rate / 100);
    let calculatedMassFlow: number = this.inputData.headerInput.highPressure.processSteamUsage * (this.inputData.headerInput.highPressure.condensationRecoveryRate / 100);
    //calculate energy flow = mass flow * condensate enthalpy / 1000
    let calculatedEnergyFlow: number = calculatedMassFlow * this.boilerOutput.blowdownSpecificEnthalpy / 1000;
    this.highPressureCondensate = {
      pressure: this.boilerOutput.blowdownPressure,
      temperature: this.boilerOutput.blowdownTemperature,
      specificEnthalpy: this.boilerOutput.blowdownSpecificEnthalpy,
      specificEntropy: this.boilerOutput.blowdownSpecificEntropy,
      quality: this.boilerOutput.blowdownQuality,
      energyFlow: calculatedEnergyFlow,
      specificVolume: this.boilerOutput.blowdownVolume,
      massFlow: calculatedMassFlow
    }
  }

  //2D. Calculate High to Low Steam Turbine
  calculateHighToLowSteamTurbine() {
    let turbineProperty: number = 0; //0: massFlow, 1: powerOut
    let massFlowOrPowerOut: number = this.highPressureHeader.massFlow - this.inputData.headerInput.highPressure.processSteamUsage;
    if (this.inputData.headerInput.numberOfHeaders == 3) {
      massFlowOrPowerOut = massFlowOrPowerOut - this.inputData.headerInput.mediumPressure.processSteamUsage;
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
      }else if(this.inputData.turbineInput.highToLowTurbine.operationType == 3){
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


  //2E. Calculate High to Medium Steam Turbine
  calculateHighToMediumPressureSteamTurbine() {
    let turbineProperty: number = 0; //0: massFlow, 1: powerOut
    //massFlow = (flow from current header) - (process steam usage in connected header)
    let massFlowOrPowerOut: number = this.highPressureHeader.massFlow - this.inputData.headerInput.highPressure.processSteamUsage;
    if (this.inputData.headerInput.numberOfHeaders == 3) {
      massFlowOrPowerOut = massFlowOrPowerOut - this.highToLowPressureTurbine.massFlow;
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
      }else if(this.inputData.turbineInput.highToMediumTurbine.operationType == 3){
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

  //2F. Calculate Condensing Turbine
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

  /********** 3. Calculate Medium Pressure Header *********/
  //3A. Calculate High to Medium PRV
  calculateHighToMediumPRV() {
    //PRV mass flow is steam remaning in high pressure header
    //subtract off all usage
    let prvMassFlow: number = this.highPressureHeader.massFlow - this.inputData.headerInput.highPressure.processSteamUsage;
    if (this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
      prvMassFlow = prvMassFlow - this.highToLowPressureTurbine.massFlow;
    }
    if (this.inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
      prvMassFlow = prvMassFlow - this.highPressureToMediumPressureTurbine.massFlow;
    }
    if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
      prvMassFlow = prvMassFlow - this.condensingTurbine.massFlow;
    }
    if (prvMassFlow < 0) {
      prvMassFlow = 0;
    }
    if (this.inputData.headerInput.mediumPressure.desuperheatSteamIntoNextHighest == true) {
      this.highToMediumPressurePRV = this.steamService.prvWithDesuperheating(
        {
          inletPressure: this.highPressureHeader.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: this.highPressureHeader.specificEnthalpy,
          inletMassFlow: prvMassFlow,
          outletPressure: this.inputData.headerInput.mediumPressure.pressure,
          feedwaterPressure: this.boilerOutput.feedwaterPressure,
          feedwaterThermodynamicQuantity: 3,//3 is quality
          feedwaterQuantityValue: 0,
          desuperheatingTemp: this.inputData.headerInput.mediumPressure.desuperheatSteamTemperature
        },
        this.settings
      );
    } else {
      this.highToMediumPressurePRV = this.steamService.prvWithoutDesuperheating(
        {
          inletPressure: this.highPressureHeader.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: this.highPressureHeader.specificEnthalpy,
          inletMassFlow: prvMassFlow,
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

  //3B or 4B. Calculate High Pressure Condensate Flash Tank
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
    this.highPressureCondensateFlashTank = this.steamService.flashTank(
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


  //3C. Model Medium Pressure Header
  calculateMediumPressureHeader() {
    //3C1. Calculate inlets for medium pressure header
    let inlets: Array<HeaderInputObj> = this.getMediumPressureInlets();
    //3C2. Calculate medium pressure header
    //notice .header at the end (need .header obj for mediumPressureHeader)
    this.mediumPressureHeader = this.steamService.header(
      {
        headerPressure: this.inputData.headerInput.mediumPressure.pressure,
        inlets: inlets
      },
      this.settings).header;
  }

  //3C1. Get inlets for medium pressure header
  getMediumPressureInlets(): Array<HeaderInputObj> {
    let inlets: Array<HeaderInputObj> = new Array<HeaderInputObj>();
    //High to medium PRV
    inlets.push(
      {
        pressure: this.highToMediumPressurePRV.outletPressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.highToMediumPressurePRV.outletSpecificEnthalpy,
        massFlow: this.highToMediumPressurePRV.outletMassFlow
      }
    );
    //High to medium turbine
    if (this.inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
      inlets.push(
        {
          pressure: this.highPressureToMediumPressureTurbine.outletPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.highPressureToMediumPressureTurbine.outletSpecificEnthalpy,
          massFlow: this.highPressureToMediumPressureTurbine.massFlow
        }
      );
    }
    //High pressure flashed condensate
    if (this.inputData.headerInput.mediumPressure.flashCondensateIntoHeader == true) {
      inlets.push(
        {
          pressure: this.highPressureCondensateFlashTank.outletGasPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.highPressureCondensateFlashTank.outletGasSpecificEnthalpy,
          massFlow: this.highPressureCondensateFlashTank.outletGasMassFlow
        }
      );
    }
    return inlets;
  }

  //3D. Calculate Heat Loss for Remaining Steam in Medium Pressure Header
  calculateHeatLossForMediumPressureHeader() {
    this.mediumPressureSteamHeatLoss = this.steamService.heatLoss(
      {
        inletPressure: this.mediumPressureHeader.pressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.mediumPressureHeader.specificEnthalpy,
        inletMassFlow: this.mediumPressureHeader.massFlow,
        percentHeatLoss: this.inputData.headerInput.mediumPressure.heatLoss
      },
      this.settings
    );
    this.mediumPressureHeader = {
      energyFlow: this.mediumPressureSteamHeatLoss.outletEnergyFlow,
      massFlow: this.mediumPressureSteamHeatLoss.outletMassFlow,
      pressure: this.mediumPressureSteamHeatLoss.outletPressure,
      quality: this.mediumPressureSteamHeatLoss.outletQuality,
      specificEnthalpy: this.mediumPressureSteamHeatLoss.outletSpecificEnthalpy,
      specificEntropy: this.mediumPressureSteamHeatLoss.outletSpecificEntropy,
      temperature: this.mediumPressureSteamHeatLoss.outletTemperature,
      specificVolume: this.mediumPressureHeader.specificVolume
    }
  }

  //3E. Calculate Medium Pressure Condensate
  calculateMediumPressureCondensate() {
    let calculatedMassFlow: number = this.inputData.headerInput.mediumPressure.processSteamUsage * (this.inputData.headerInput.mediumPressure.condensationRecoveryRate / 100);
    this.mediumPressureCondensate = this.steamService.steamProperties(
      {
        pressure: this.inputData.headerInput.mediumPressure.pressure,
        quantityValue: 0,
        thermodynamicQuantity: 3
      },
      this.settings
    );
    this.mediumPressureCondensate.massFlow = calculatedMassFlow;
    this.mediumPressureCondensate.energyFlow = this.mediumPressureCondensate.massFlow * this.mediumPressureCondensate.specificEnthalpy / 1000;
  }

  //3F. Calculate Medium to Low Steam Turbine
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
      }else if(this.inputData.turbineInput.mediumToLowTurbine.operationType == 3){
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

  /********** 4. Calculate Low Pressure Header *********/
  //4A. Calculate Low Pressure PRV
  calculateLowPressurePRV() {
    let headerObj: HeaderOutputObj;
    let prvMassFlow: number = 0;
    //either medium to low or high to low
    if (this.inputData.headerInput.numberOfHeaders == 2) {
      //if 2 headers, next highest is high pressure
      headerObj = this.highPressureHeader;
      prvMassFlow = headerObj.massFlow - this.inputData.headerInput.highPressure.processSteamUsage;
      if (this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
        prvMassFlow = prvMassFlow - this.highToLowPressureTurbine.massFlow;
      }
      if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
        prvMassFlow = prvMassFlow - this.condensingTurbine.massFlow;
      }
    } else if (this.inputData.headerInput.numberOfHeaders == 3) {
      //if 3 headers, next highest is medium pressure
      headerObj = this.mediumPressureHeader;
      prvMassFlow = headerObj.massFlow - this.inputData.headerInput.mediumPressure.processSteamUsage;
      if (this.inputData.turbineInput.mediumToLowTurbine.useTurbine == true) {
        prvMassFlow = prvMassFlow - this.mediumToLowPressureTurbine.massFlow;
      }
    }
    if (prvMassFlow < 0) {
      prvMassFlow = 0;
    }
    if (this.inputData.headerInput.lowPressure.desuperheatSteamIntoNextHighest == true) {
      this.lowPressurePRV = this.steamService.prvWithDesuperheating(
        {
          inletPressure: headerObj.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: headerObj.specificEnthalpy,
          inletMassFlow: prvMassFlow,
          outletPressure: this.inputData.headerInput.lowPressure.pressure,
          feedwaterPressure: this.boilerOutput.feedwaterPressure,
          feedwaterThermodynamicQuantity: 3,//3 is quality
          feedwaterQuantityValue: 0,
          desuperheatingTemp: this.inputData.headerInput.lowPressure.desuperheatSteamTemperature
        },
        this.settings
      );
    } else {
      this.lowPressurePRV = this.steamService.prvWithoutDesuperheating(
        {
          inletPressure: headerObj.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: headerObj.specificEnthalpy,
          inletMassFlow: prvMassFlow,
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

  //4B. Calculate Medium Pressure Flash Tank
  calculateMediumPressureFlashTank() {
    //mix inlet condensate using header calculate
    let tmpHighMediumPressureMix: HeaderOutputObj;
    //if high pressure condensate has been flashed into medium pressure header
    if (this.inputData.headerInput.numberOfHeaders == 3 && this.inputData.headerInput.mediumPressure.flashCondensateIntoHeader == true) {
      //inlets will be leftover condensate from flash tank and medium pressure condensate
      tmpHighMediumPressureMix = this.steamService.header(
        {
          headerPressure: this.inputData.headerInput.lowPressure.pressure,
          inlets: [
            {
              pressure: this.highPressureCondensateFlashTank.outletLiquidPressure,
              thermodynamicQuantity: 1, //specificEnthalpy
              quantityValue: this.highPressureCondensateFlashTank.outletLiquidSpecificEnthalpy,
              massFlow: this.highPressureCondensateFlashTank.outletLiquidMassFlow
            },
            {
              pressure: this.mediumPressureCondensate.pressure,
              thermodynamicQuantity: 1, //specificEnthalpy
              quantityValue: this.mediumPressureCondensate.specificEnthalpy,
              massFlow: this.mediumPressureCondensate.massFlow
            }
          ]
        },
        this.settings
      ).header;
    } else {
      //inlets will be high pressure condensate and medium pressure condensate
      tmpHighMediumPressureMix = this.steamService.header(
        {
          headerPressure: this.inputData.headerInput.lowPressure.pressure,
          inlets: [
            {
              pressure: this.highPressureCondensate.pressure,
              thermodynamicQuantity: 1, //specificEnthalpy
              quantityValue: this.highPressureCondensate.specificEnthalpy,
              massFlow: this.highPressureCondensate.massFlow
            },
            {
              pressure: this.mediumPressureCondensate.pressure,
              thermodynamicQuantity: 1, //specificEnthalpy
              quantityValue: this.mediumPressureCondensate.specificEnthalpy,
              massFlow: this.mediumPressureCondensate.massFlow
            }
          ]
        },
        this.settings
      ).header;
    }
    //run the mixed condensate through the flash tank
    this.mediumPressureCondensateFlashTank = this.steamService.flashTank(
      {
        inletWaterPressure: tmpHighMediumPressureMix.pressure,
        quantityValue: tmpHighMediumPressureMix.specificEnthalpy,
        thermodynamicQuantity: 1,
        inletWaterMassFlow: tmpHighMediumPressureMix.massFlow,
        tankPressure: this.inputData.headerInput.lowPressure.pressure
      },
      this.settings
    )
  }

  //4C. Model Low Pressure Header
  calculateLowPressureHeader() {
    //4C1. Get inlets for low pressure header
    let inlets: Array<HeaderInputObj> = this.getLowPressureHeaderInlets();
    //4C2. Calculate low pressure header
    //notice .header at the end (need .header obj for lowPressureHeader)
    this.lowPressureHeader = this.steamService.header(
      {
        headerPressure: this.inputData.headerInput.lowPressure.pressure,
        inlets: inlets
      },
      this.settings).header;
  }

  //4C1. Get Inlets for low pressure header
  getLowPressureHeaderInlets(): Array<HeaderInputObj> {
    let inlets: Array<HeaderInputObj> = new Array<HeaderInputObj>();
    //Low pressure PRV
    //PRV always exists
    inlets.push(
      {
        pressure: this.lowPressurePRV.outletPressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.lowPressurePRV.outletSpecificEnthalpy,
        massFlow: this.lowPressurePRV.outletMassFlow
      }
    );
    //High to low pressure turbine
    if (this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
      inlets.push(
        {
          pressure: this.highToLowPressureTurbine.outletPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.highToLowPressureTurbine.outletSpecificEnthalpy,
          massFlow: this.highToLowPressureTurbine.massFlow
        }
      )
    }
    //Medium to low pressure turbine
    if (this.inputData.headerInput.numberOfHeaders == 3 && this.inputData.turbineInput.mediumToLowTurbine.useTurbine == true) {
      inlets.push(
        {
          pressure: this.mediumToLowPressureTurbine.outletPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.mediumToLowPressureTurbine.outletSpecificEnthalpy,
          massFlow: this.mediumToLowPressureTurbine.massFlow
        }
      )
    }

    //Flashed condesnate into header
    if (this.inputData.headerInput.lowPressure.flashCondensateIntoHeader == true) {
      //if medium pressure header exists, use medium pressure flash tank
      if (this.inputData.headerInput.numberOfHeaders == 3) {
        inlets.push(
          {
            pressure: this.mediumPressureCondensateFlashTank.outletGasPressure,
            thermodynamicQuantity: 1, //specificEnthalpy
            quantityValue: this.mediumPressureCondensateFlashTank.outletGasSpecificEnthalpy,
            massFlow: this.mediumPressureCondensateFlashTank.outletGasMassFlow
          }
        )
      } else {
        //if only high and low header, high pressure flash tank
        inlets.push(
          {
            pressure: this.highPressureCondensateFlashTank.outletGasPressure,
            thermodynamicQuantity: 1, //specificEnthalpy
            quantityValue: this.highPressureCondensateFlashTank.outletGasSpecificEnthalpy,
            massFlow: this.highPressureCondensateFlashTank.outletGasSpecificEnthalpy
          }
        )
      }
    }
    //Blowdown flash tank outlet gas
    if (this.inputData.boilerInput.blowdownFlashed == true) {
      inlets.push(
        {
          pressure: this.blowdownFlashTank.outletGasPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.blowdownFlashTank.outletGasSpecificEnthalpy,
          massFlow: this.blowdownFlashTank.outletGasMassFlow
        }
      )
    }
    return inlets;
  }

  //4D. Calculate Heat Loss for Remaining Steam in Low Pressure Header
  calculateHeatLossForLowPressureHeader() {
    this.lowPressureSteamHeatLoss = this.steamService.heatLoss(
      {
        inletPressure: this.lowPressureHeader.pressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.lowPressureHeader.specificEnthalpy,
        inletMassFlow: this.lowPressureHeader.massFlow,
        percentHeatLoss: this.inputData.headerInput.lowPressure.heatLoss
      },
      this.settings
    );
    this.lowPressureHeader = {
      energyFlow: this.lowPressureSteamHeatLoss.outletEnergyFlow,
      massFlow: this.lowPressureSteamHeatLoss.outletMassFlow,
      pressure: this.lowPressureSteamHeatLoss.outletPressure,
      quality: this.lowPressureSteamHeatLoss.outletQuality,
      specificEnthalpy: this.lowPressureSteamHeatLoss.outletSpecificEnthalpy,
      specificEntropy: this.lowPressureSteamHeatLoss.outletSpecificEntropy,
      temperature: this.lowPressureSteamHeatLoss.outletTemperature,
      specificVolume: this.lowPressureHeader.specificVolume
    }
  }

  //4F. Calculate Low Pressure Condensate
  calculateLowPressureCondensate() {
    let calculatedMassFlow: number = this.inputData.headerInput.lowPressure.processSteamUsage * (this.inputData.headerInput.lowPressure.condensationRecoveryRate / 100);
    this.lowPressureCondensate = this.steamService.steamProperties(
      {
        pressure: this.inputData.headerInput.lowPressure.pressure,
        quantityValue: 0,
        thermodynamicQuantity: 3
      },
      this.settings
    );
    this.lowPressureCondensate.massFlow = calculatedMassFlow;
    this.lowPressureCondensate.energyFlow = this.lowPressureCondensate.massFlow * this.lowPressureCondensate.specificEnthalpy / 1000;
  }

  /********** 5. Calculate makeup water and condensate *********/
  //5A. Calculate Return Condensate
  calculateCombinedCondensate() {
    //pressure from lowest pressure condensate
    let lowPressure: number = this.highPressureCondensate.pressure;
    if (this.inputData.headerInput.numberOfHeaders > 1) {
      lowPressure = this.lowPressureCondensate.pressure;
    }
    //5A1. get return condensate inlets
    let inlets: Array<HeaderInputObj> = this.getCombinedCondensateInlets();
    //5A2. calculate header
    this.combinedCondensate = this.steamService.header(
      {
        headerPressure: lowPressure,
        inlets: inlets
      },
      this.settings
    ).header;
  }
  //5A1. Get inlets to combined condensate header
  getCombinedCondensateInlets(): Array<HeaderInputObj> {
    let inlets: Array<HeaderInputObj> = new Array<HeaderInputObj>();
    if (!this.highPressureCondensateFlashTank && !this.mediumPressureCondensateFlashTank) {
      inlets.push(
        {
          pressure: this.highPressureCondensate.pressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.highPressureCondensate.specificEnthalpy,
          massFlow: this.highPressureCondensate.massFlow
        }
      );
    } else if (!this.mediumPressureCondensateFlashTank) {
      inlets.push(
        {
          pressure: this.highPressureCondensateFlashTank.outletLiquidPressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.highPressureCondensateFlashTank.outletLiquidSpecificEnthalpy,
          massFlow: this.highPressureCondensateFlashTank.outletLiquidMassFlow
        }
      );
    }

    if (this.inputData.headerInput.numberOfHeaders > 1) {
      inlets.push(
        {
          pressure: this.lowPressureCondensate.pressure,
          thermodynamicQuantity: 1, //specificEnthalpy
          quantityValue: this.lowPressureCondensate.specificEnthalpy,
          massFlow: this.lowPressureCondensate.massFlow
        }
      );
    }
    if (this.inputData.headerInput.numberOfHeaders == 3) {
      if (!this.mediumPressureCondensateFlashTank) {
        inlets.push(
          {
            pressure: this.mediumPressureCondensate.pressure,
            thermodynamicQuantity: 1, //specificEnthalpy
            quantityValue: this.mediumPressureCondensate.specificEnthalpy,
            massFlow: this.mediumPressureCondensate.massFlow
          }
        );
      } else {
        inlets.push(
          {
            pressure: this.mediumPressureCondensateFlashTank.outletLiquidPressure,
            thermodynamicQuantity: 1, //specificEnthalpy
            quantityValue: this.mediumPressureCondensateFlashTank.outletLiquidSpecificEnthalpy,
            massFlow: this.mediumPressureCondensateFlashTank.outletLiquidMassFlow
          }
        );
      }
    }
    return inlets;
  }

  //5B. Calculate Return Condensate
  calculateReturnCondensate() {
    this.returnCondensate = this.steamService.steamProperties(
      {
        pressure: this.combinedCondensate.pressure,
        thermodynamicQuantity: 0, //temperature
        quantityValue: this.inputData.headerInput.highPressure.condensateReturnTemperature
      },
      this.settings
    );
    this.returnCondensate.massFlow = this.combinedCondensate.massFlow;
    this.returnCondensate.energyFlow = this.returnCondensate.massFlow * this.returnCondensate.specificEnthalpy / 1000;
  }

  //5C. Flash Condensate Return
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
    );
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

  //5D. Calculate Makeup Water Properties
  calculateMakeupWater() {
    this.makeupWater = this.steamService.steamProperties(
      {
        thermodynamicQuantity: 0, //temperature
        quantityValue: this.inputData.operationsInput.makeUpWaterTemperature,
        pressure: .101325 //atmospheric pressure
      },
      this.settings
    );
  }

  //5E. Calculate makeup water mass flow
  calculateMakeupWaterMassFlow() {
    let makeupWaterMassFlow: number = this.boilerOutput.feedwaterMassFlow * (1 + this.inputData.boilerInput.deaeratorVentRate / 100);
    let inletHeaderFlow: number = this.highPressureHeader.massFlow - this.inputData.headerInput.highPressure.processSteamUsage;
    if (this.inputData.headerInput.numberOfHeaders > 1) {
      inletHeaderFlow = this.lowPressureHeader.massFlow - this.inputData.headerInput.lowPressure.processSteamUsage;
      if (this.inputData.headerInput.numberOfHeaders == 3 && isNaN(this.highToMediumPressurePRV.feedwaterMassFlow) == false) {
        makeupWaterMassFlow = makeupWaterMassFlow + this.highToMediumPressurePRV.feedwaterMassFlow;
      }
      if (isNaN(this.lowPressurePRV.feedwaterMassFlow) == false) {
        makeupWaterMassFlow = makeupWaterMassFlow + this.lowPressurePRV.feedwaterMassFlow;
      }
    }

    if(this.inputData.turbineInput.condensingTurbine.useTurbine == true){
      makeupWaterMassFlow = makeupWaterMassFlow - this.condensingTurbine.massFlow;
    }

    makeupWaterMassFlow = makeupWaterMassFlow - this.returnCondensate.massFlow - inletHeaderFlow;
    this.makeupWater.massFlow = makeupWaterMassFlow;
    this.makeupWater.energyFlow = this.makeupWater.massFlow * this.makeupWater.specificEnthalpy / 1000;
  }

  //5F. Run Heat Exchanger
  runHeatExchanger() {
    //TODO: need bindings to HeatExchanger() in the suite before doing this step..
  }

  //5G. Calculate make up water and condensate combined header
  calculateMakeupWaterAndCondensateHeader() {
    //5G1. Get inlets for makeup water and condensate header
    let inlets: Array<HeaderInputObj> = this.getMakeupWaterAndCondensateInlets();
    //5G2. Run header calculation
    //notice .header at the end (need .header obj for makeupWaterAndCondensateHeader)
    this.makeupWaterAndCondensateHeader = this.steamService.header(
      {
        headerPressure: this.inputData.boilerInput.deaeratorPressure,
        inlets: inlets
      },
      this.settings
    ).header;
  }

  //5G1. Get inlets for makeup water and condensate header
  getMakeupWaterAndCondensateInlets(): Array<HeaderInputObj> {
    let inlets: Array<HeaderInputObj> = new Array<HeaderInputObj>();
    //return condensate
    inlets.push(
      {
        pressure: this.returnCondensate.pressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.returnCondensate.specificEnthalpy,
        massFlow: this.returnCondensate.massFlow
      }
    )
    //makeup water
    inlets.push(
      {
        pressure: this.makeupWater.pressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.makeupWater.specificEnthalpy,
        massFlow: this.makeupWater.massFlow
      }
    );
    //condensing turbine
    if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
      //use set condensing pressure (will convert input before suite c++)
      let condenserPressure: number = this.convertUnitsService.value(this.inputData.turbineInput.condensingTurbine.condenserPressure).from(this.settings.steamVacuumPressure).to(this.settings.steamPressureMeasurement);
      inlets.push(
        {
          pressure: condenserPressure,
          thermodynamicQuantity: 3, //quality
          quantityValue: 0,
          massFlow: this.condensingTurbine.massFlow
        }
      )
    }
    return inlets;
  }

  /********** 6. Model Deaerator *********/
  //6. Calculate Deaerator
  calculateDearator() {
    //6A. Get Feedwater Details and Inlet header
    let feedwaterMassFlow: number = this.boilerOutput.feedwaterMassFlow
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
    this.deaeratorOutput = this.steamService.deaerator(
      {
        deaeratorPressure: this.inputData.boilerInput.deaeratorPressure,
        ventRate: this.inputData.boilerInput.deaeratorVentRate,
        feedwaterMassFlow: feedwaterMassFlow,
        waterPressure: this.makeupWaterAndCondensateHeader.pressure,
        waterThermodynamicQuantity: 1, //specificEnthalpy
        waterQuantityValue: this.makeupWaterAndCondensateHeader.specificEnthalpy,
        steamPressure: inletHeader.pressure,
        steamThermodynamicQuantity: 1, //specificEnthalpy
        steamQuantityValue: inletHeader.specificEnthalpy
      },
      this.settings
    )
  }

  initResults() {
    this.inputData = undefined;
    this.boilerOutput = undefined;
    this.highPressureHeader = undefined;
    this.highToMediumPressurePRV = undefined;
    this.highPressureToMediumPressureTurbine = undefined;
    this.highPressureCondensateFlashTank = undefined;
    this.highPressureCondensate = undefined;
    this.mediumPressureHeader = undefined;
    this.lowPressurePRV = undefined;
    this.mediumPressureCondensate = undefined;
    this.highToLowPressureTurbine = undefined;
    this.mediumToLowPressureTurbine = undefined;
    this.mediumPressureCondensateFlashTank = undefined;
    this.blowdownFlashTank = undefined;
    this.lowPressureHeader = undefined;
    this.lowPressureCondensate = undefined;
    this.condensateFlashTank = undefined;
    this.combinedCondensate = undefined;
    this.makeupWater = undefined;
    this.makeupWaterAndCondensateHeader = undefined;
    this.condensingTurbine = undefined;
    this.deaeratorOutput = undefined;
    //this.highPressureProcessSteamUsage = undefined;
    this.highPressureSteamHeatLoss = undefined;
    this.lowPressureSteamHeatLoss = undefined;
    //this.lowPressureProcessSteamUsage = undefined;
    this.mediumPressureSteamHeatLoss = undefined;
    //this.mediumPressureProcessSteamUsage = undefined;
  }

}
