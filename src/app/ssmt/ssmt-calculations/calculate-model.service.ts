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

  // 1/10/2019 additions for cost
  highPressureProcessUsage: ProcessSteamUsage;
  mediumPressureProcessUsage: ProcessSteamUsage;
  lowPressureProcessUsage: ProcessSteamUsage;

  powerGenerated: number;
  boilerFuelCost: number;
  makeupWaterCost: number;
  totalOperatingCost: number;
  totalEnergyUse: number;
  powerGenerationCost: number;
  boilerFuelUsage: number;

  makeupWaterVolumeFlow: number;
  annualMakeupWaterFlow: number;
  //heatExchanger: HeatExchanger

  //ventedLowPressureSteam: number;
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

  testIterator() {
    let steamProduction: number = 0;
    if (this.inputData.headerInput.numberOfHeaders == 1) {
      steamProduction = this.inputData.headerInput.highPressure.processSteamUsage;
    } else if (this.inputData.headerInput.numberOfHeaders == 2) {
      steamProduction = (this.inputData.headerInput.highPressure.processSteamUsage + this.inputData.headerInput.lowPressure.processSteamUsage);
    } else if (this.inputData.headerInput.numberOfHeaders == 3) {
      steamProduction = (this.inputData.headerInput.highPressure.processSteamUsage + this.inputData.headerInput.lowPressure.processSteamUsage + this.inputData.headerInput.mediumPressure.processSteamUsage);
    }
    this.calculateSteamProducation(steamProduction);
    let highPressureSteamUse = this.calcHighPressureSteamUse();
    this.calculateModel(highPressureSteamUse);
  }

  calcHighPressureSteamUse(): number {
    let highPressureSteamUse: number = this.inputData.headerInput.highPressure.processSteamUsage;
    if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
      highPressureSteamUse = highPressureSteamUse + this.condensingTurbine.massFlow;
    }
    if (this.inputData.headerInput.numberOfHeaders == 1) {
      highPressureSteamUse = highPressureSteamUse + this.deaeratorOutput.inletSteamMassFlow;
    } else if (this.inputData.headerInput.numberOfHeaders == 2) {
      if (this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
        highPressureSteamUse = highPressureSteamUse + this.highToLowPressureTurbine.massFlow;
      }
      highPressureSteamUse = highPressureSteamUse + this.lowPressurePRV.inletMassFlow;
    } else if (this.inputData.headerInput.numberOfHeaders == 3) {
      if (this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
        highPressureSteamUse = highPressureSteamUse + this.highToLowPressureTurbine.massFlow;
      }
      if (this.inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
        highPressureSteamUse = highPressureSteamUse + this.highPressureToMediumPressureTurbine.massFlow;
      }
      highPressureSteamUse = highPressureSteamUse + this.highToMediumPressurePRV.inletMassFlow;
    }
    return highPressureSteamUse;
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

    //2D. Calculate High Pressure Flash Tank if 3 header and on
    if (this.inputData.headerInput.numberOfHeaders == 3 && this.inputData.headerInput.mediumPressure.flashCondensateIntoHeader == true) {
      this.calculateHighPressureFlashTank();
    }

    //2E. Calcuate condensing turbine
    if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
      this.calculateCondensingTurbine();
    }

    //2D. Calculate high to low steam turbine if in use
    if (this.inputData.headerInput.numberOfHeaders > 1 && this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
      this.calculateHighToLowSteamTurbine();
    }
    //2E. Calculate high to medium steam turbine if in use
    if (this.inputData.headerInput.numberOfHeaders == 3) {
      if (this.inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
        this.calculateHighToMediumPressureSteamTurbine();
      }
    }

    //3. Calculate Medium Pressure Header
    //if medium pressure header exists
    if (this.inputData.headerInput.numberOfHeaders == 3) {
      //3A. Calculate High to Medium PRV
      this.calculateHighToMediumPRV();
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
    this.calculateMakeupWaterVolumeFlow()
    //5F. Run heat exchange if pre heating makeup water
    if (this.inputData.boilerInput.preheatMakeupWater == true) {
      this.runHeatExchanger();
    }
    //5G. Calculate makeup water and condensate combined
    this.calculateMakeupWaterAndCondensateHeader();

    //6. Calculate Deaerator
    this.calculateDearator();
    //check low pressure mass flow
    if (this.inputData.headerInput.numberOfHeaders > 1) {
      this.checkLowPressureBalance();
    }


    //calculate process steam usage
    this.calculateHighPressureProcessUsage();
    if (this.inputData.headerInput.numberOfHeaders > 1) {
      this.calculateLowPressureProcessUsage();
      //this.calculateLowPressureVentedSteam();
    }
    if (this.inputData.headerInput.numberOfHeaders == 3) {
      this.calculateMediumPressureProcessUsage();
    }
    //7. Calculate Energy and Cost Values
    //Power Generated
    this.calculatePowerGenerated();
    this.calculatePowerGenerationCost();
    //Boiler Fuel Cost
    this.calculateBoilerFuelCost();
    //Makeup Water Cost
    this.calculateMakeupWaterCost();
    //Total Cost
    this.calculateTotalOperatingCost();
    // totalEnergyUse
    //Boiler fuel Usage
    this.calculateBoilerFuelUsage();
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


  //2E. Calculate High to Medium Steam Turbine
  calculateHighToMediumPressureSteamTurbine(_givenMassFlow?: number) {
    let turbineProperty: number = 0; //0: massFlow, 1: powerOut
    //massFlow = (flow from current header) - (process steam usage in connected header)
    let massFlowOrPowerOut: number = this.highPressureHeader.massFlow - this.inputData.headerInput.highPressure.processSteamUsage;
    if (this.inputData.headerInput.numberOfHeaders == 3 && this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
      massFlowOrPowerOut = massFlowOrPowerOut - this.highToLowPressureTurbine.massFlow;
    }
    if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
      massFlowOrPowerOut = massFlowOrPowerOut - this.condensingTurbine.massFlow;
    }
    // if (this.inputData.headerInput.mediumPressure.flashCondensateIntoHeader == true && this.inputData.turbineInput.highToLowTurbine.useTurbine != true) {
    //   massFlowOrPowerOut = massFlowOrPowerOut + this.highPressureCondensateFlashTank.outletGasMassFlow;
    // }
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
    //2 = Balance header, use available steam
    if (this.inputData.turbineInput.mediumToLowTurbine.operationType != 2) {
      //power generation or power range, calculate for power out
      if (this.inputData.turbineInput.mediumToLowTurbine.operationType == 1 || this.inputData.turbineInput.mediumToLowTurbine.operationType == 3) {
        turbineProperty = 1; //powerOut
      }
      if (this.inputData.turbineInput.mediumToLowTurbine.operationType == 1 || this.inputData.turbineInput.mediumToLowTurbine.operationType == 0) {
        //1 or 0 = set flow or power generation, use operationValue1
        massFlowOrPowerOut = this.inputData.turbineInput.mediumToLowTurbine.operationValue1;
      } else if (this.inputData.turbineInput.mediumToLowTurbine.operationType == 3) {
        //3 = power out range, start with highest: use operationValue2
        massFlowOrPowerOut = this.inputData.turbineInput.mediumToLowTurbine.operationValue2;
      }
      else if (this.inputData.turbineInput.mediumToLowTurbine.operationType == 4) {
        //4 = flow range, check current mass flow is in range
        if (massFlowOrPowerOut < this.inputData.turbineInput.mediumToLowTurbine.operationValue1) {
          //if less than minimum, set to minimum
          massFlowOrPowerOut = this.inputData.turbineInput.mediumToLowTurbine.operationValue1;
        } else if (massFlowOrPowerOut > this.inputData.turbineInput.mediumToLowTurbine.operationValue2) {
          //if greater than max, set to max
          massFlowOrPowerOut = this.inputData.turbineInput.mediumToLowTurbine.operationValue2;
        }
      }
    }
    console.log('Mass flow power out  = ' + massFlowOrPowerOut);
    //calculate turbine
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
    //check that there is enough available steam in the medium pressure header 
    let flowCheck: boolean = this.checkMediumToLowTurbineMassFlow();
    //if there is not enough available steam, make adjustments
    if (flowCheck) {
      //if using power range, calculate using minimum power out value
      if (this.inputData.turbineInput.mediumToLowTurbine.operationType == 3) {
        console.log('MEDIUM LOW 3');
        massFlowOrPowerOut = this.inputData.turbineInput.mediumToLowTurbine.operationValue1;
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
        console.log('turbine flow = ' + this.mediumToLowPressureTurbine.massFlow);
        //check to see if this fixes the problem
        flowCheck = this.checkMediumToLowTurbineMassFlow();
      }
      //double checking flow check with no change when operationType != 3, can probably do this better logically.
      if (flowCheck) {
        //calculate needed steam for medium pressure header
        let steamNeed: number = (this.mediumToLowPressureTurbine.massFlow + this.inputData.headerInput.mediumPressure.processSteamUsage);
        //calculate available steam for medium pressure header, always PRV
        let steamAvailable: number = this.highToMediumPressurePRV.outletMassFlow;
        //add highToMediumTurbine massFlow if in use 
        if (this.inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
          steamAvailable = steamAvailable + this.highPressureToMediumPressureTurbine.massFlow;
        }
        //add highPressureFlashTank steam if in use
        if (this.inputData.headerInput.mediumPressure.flashCondensateIntoHeader == true) {
          steamAvailable = steamAvailable + this.highPressureCondensateFlashTank.outletGasMassFlow;
        }
        //calculate difference between needed steam and steam available
        let steamDiff: number = steamNeed - steamAvailable;
        //if the difference is greater than .00001
        if (Math.abs(steamDiff) > 1e-5) {
          //adjust the high pressure equipment to make up the steam difference
          this.makeupSteamDifference(steamDiff);
          //After adjusting high pressure equipment, Recalculate medium pressure equipment
          //3C. Model Medium Pressure Header
          this.calculateMediumPressureHeader();
          //3D. Calculate Heat Loss for Remain Steam in Medium Pressure Header
          this.calculateHeatLossForMediumPressureHeader();
          //3E. Calculate Medium Pressure Condensate
          this.calculateMediumPressureCondensate();
          //Recursively calculate turbine until steamDiff is less than .00001
          this.calculateMediumToLowSteamTurbine();
        }
      }
    }
  }

  //check if enough steam in header for turbine
  checkMediumToLowTurbineMassFlow(): boolean {
    return (this.mediumToLowPressureTurbine.massFlow + this.inputData.headerInput.mediumPressure.processSteamUsage) != this.mediumPressureHeader.massFlow;
  }

  //adjust model so enough steam gets to medium pressure header
  makeupSteamDifference(steamDiff: number) {
    let remainingSteamDiff: number = steamDiff;
    //try getting addtional steam from highToMediumTurbine
    if (this.inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
      //adjust high to medium turbine to send additional steam through
      //returns amount of steam that cannot go through
      remainingSteamDiff = this.adjustHighToMediumTurbine(remainingSteamDiff);
    }
    //if theres still remaining steam needed, get it through PRV
    //add additional steam to inlet mass flow
    if (remainingSteamDiff != 0) {
      if (this.inputData.headerInput.mediumPressure.desuperheatSteamIntoNextHighest == true) {
        this.highToMediumPressurePRV = this.steamService.prvWithDesuperheating(
          {
            inletPressure: this.highPressureHeader.pressure,
            thermodynamicQuantity: 1,//1 is enthalpy
            quantityValue: this.highPressureHeader.specificEnthalpy,
            inletMassFlow: this.highToMediumPressurePRV.inletMassFlow + remainingSteamDiff,
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
            inletMassFlow: this.highToMediumPressurePRV.inletMassFlow + remainingSteamDiff,
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

    //adjust high to low pressure turbine if steam needs to be removed
    if (this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
      //4 = flow range, if room for more steam in range, add additional steam to turbine
      if (this.inputData.turbineInput.highToLowTurbine.operationType == 4 && this.highToLowPressureTurbine.massFlow > steamDiff && (this.inputData.turbineInput.highToLowTurbine.operationValue1 > (this.highToLowPressureTurbine.massFlow - steamDiff))) {
        this.highToLowPressureTurbine = this.steamService.turbine(
          {
            solveFor: 0,
            inletPressure: this.highPressureHeader.pressure,
            inletQuantity: 1,
            inletQuantityValue: this.highPressureHeader.specificEnthalpy,
            turbineProperty: 0, //massFlow
            isentropicEfficiency: this.inputData.turbineInput.highToLowTurbine.isentropicEfficiency,
            generatorEfficiency: this.inputData.turbineInput.highToLowTurbine.generationEfficiency,
            massFlowOrPowerOut: this.highToLowPressureTurbine.massFlow - steamDiff,
            outletSteamPressure: this.inputData.headerInput.lowPressure.pressure,
            outletQuantity: 0,
            outletQuantityValue: 0
          },
          this.settings
        );
      }
      //2 = balancing header, remove excess steam from high pressure turbine
      //instead of only removing steam if you can remove it all, maybe remove as much as possible. Need to find corresponding scenario
      //use this for now
      else if (this.inputData.turbineInput.highToLowTurbine.operationType == 2 && this.highToLowPressureTurbine.massFlow > steamDiff) {
        this.highToLowPressureTurbine = this.steamService.turbine(
          {
            solveFor: 0,
            inletPressure: this.highPressureHeader.pressure,
            inletQuantity: 1,
            inletQuantityValue: this.highPressureHeader.specificEnthalpy,
            turbineProperty: 0, //massFlow
            isentropicEfficiency: this.inputData.turbineInput.highToLowTurbine.isentropicEfficiency,
            generatorEfficiency: this.inputData.turbineInput.highToLowTurbine.generationEfficiency,
            massFlowOrPowerOut: this.highToLowPressureTurbine.massFlow - steamDiff,
            outletSteamPressure: this.inputData.headerInput.lowPressure.pressure,
            outletQuantity: 0,
            outletQuantityValue: 0
          },
          this.settings
        );
      }
      //if power range, reduce steam through by using min power needed
      else if (this.inputData.turbineInput.highToLowTurbine.operationType == 3) {
        this.highToLowPressureTurbine = this.steamService.turbine(
          {
            solveFor: 0,
            inletPressure: this.highPressureHeader.pressure,
            inletQuantity: 1,
            inletQuantityValue: this.highPressureHeader.specificEnthalpy,
            turbineProperty: 1, //powerOut
            isentropicEfficiency: this.inputData.turbineInput.highToLowTurbine.isentropicEfficiency,
            generatorEfficiency: this.inputData.turbineInput.highToLowTurbine.generationEfficiency,
            massFlowOrPowerOut: this.inputData.turbineInput.highToLowTurbine.operationValue1,
            outletSteamPressure: this.inputData.headerInput.lowPressure.pressure,
            outletQuantity: 0,
            outletQuantityValue: 0
          },
          this.settings
        );
      }
    }
  }

  adjustHighToMediumTurbine(steamDiff: number): number {
    //if balance header addtional steam can go through here
    if (this.inputData.turbineInput.highToMediumTurbine.operationType == 2) {
      this.calculateHighToMediumTurbineGivenMassFlow(steamDiff);
      return 0;
    }
    //fixed power or flow, cannot send addtional steam through turbine
    else if (this.inputData.turbineInput.highToMediumTurbine.operationType == 0 || this.inputData.turbineInput.highToMediumTurbine.operationType == 1) {
      return steamDiff
    } else if (this.inputData.turbineInput.highToMediumTurbine.operationType == 3) {
      //if max power out less than current power out
      if (this.inputData.turbineInput.highToMediumTurbine.operationValue2 < this.highPressureToMediumPressureTurbine.powerOut) {
        //try adding the addtional steam to turbine
        this.calculateHighToMediumTurbineGivenMassFlow(steamDiff);
        if (this.inputData.turbineInput.highToMediumTurbine.operationValue2 < this.highPressureToMediumPressureTurbine.powerOut) {
          //if still under the range then all good
          return 0;
        } else {
          //calculate for max power out
          this.highPressureToMediumPressureTurbine = this.steamService.turbine(
            {
              solveFor: 0,
              inletPressure: this.highPressureHeader.pressure,
              inletQuantity: 1,
              inletQuantityValue: this.highPressureHeader.specificEnthalpy,
              turbineProperty: 1,//powerOut
              isentropicEfficiency: this.inputData.turbineInput.highToMediumTurbine.isentropicEfficiency,
              generatorEfficiency: this.inputData.turbineInput.highToMediumTurbine.generationEfficiency,
              massFlowOrPowerOut: this.inputData.turbineInput.highToMediumTurbine.operationValue2,
              outletSteamPressure: this.inputData.headerInput.mediumPressure.pressure,
              outletQuantity: 0,
              outletQuantityValue: 0
            },
            this.settings
          );
          return steamDiff;
        }
      }
      return steamDiff;
    }
    //send additional steam through turbine up to capacity
    else if (this.inputData.turbineInput.highToMediumTurbine.operationType == 4) {
      //calculate available capacity for high to medium turbine
      let availableCapacity: number = this.inputData.turbineInput.highToMediumTurbine.operationValue2 - this.highPressureToMediumPressureTurbine.massFlow;
      let remainingSteamDiff: number = steamDiff - availableCapacity;
      if (remainingSteamDiff > 0) {
        //if not all addtional steam can go through, send available capacity through
        this.calculateHighToMediumTurbineGivenMassFlow(availableCapacity);
        return remainingSteamDiff;
      } else {
        //theres enough room for all additional steam, send all steam through
        this.calculateHighToMediumTurbineGivenMassFlow(steamDiff);
        return 0;
      }
    }
  }

  calculateHighToMediumTurbineGivenMassFlow(addtionalMassFlow: number) {
    this.highPressureToMediumPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.highPressureHeader.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.highPressureHeader.specificEnthalpy,
        turbineProperty: 0,//mass flow
        isentropicEfficiency: this.inputData.turbineInput.highToMediumTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.highToMediumTurbine.generationEfficiency,
        massFlowOrPowerOut: this.highPressureToMediumPressureTurbine.massFlow + addtionalMassFlow,
        outletSteamPressure: this.inputData.headerInput.mediumPressure.pressure,
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
            massFlow: this.highPressureCondensateFlashTank.outletGasMassFlow
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
      if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
        makeupWaterMassFlow = makeupWaterMassFlow - this.condensingTurbine.massFlow;
      }
    }

    makeupWaterMassFlow = makeupWaterMassFlow - this.returnCondensate.massFlow - inletHeaderFlow;
    this.makeupWater.massFlow = makeupWaterMassFlow;
    this.makeupWater.energyFlow = this.makeupWater.massFlow * this.makeupWater.specificEnthalpy / 1000;
  }

  calculateMakeupWaterVolumeFlow() {
    //calculate volume flow in gpm
    this.makeupWaterVolumeFlow = this.makeupWater.massFlow * 1000 * (1 / 8.33) * (1 / 60);
    this.annualMakeupWaterFlow = this.makeupWaterVolumeFlow * 60 * this.inputData.operationsInput.operatingHoursPerYear;
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


  checkLowPressureBalance() {
    let steamBalance: number = this.getLowPressureSteamBalance();
    if (Math.abs(steamBalance) > 1e-5) {
      this.adjustLowPressureSteamFlow(steamBalance);
    }
  }

  getLowPressureSteamBalance(): number {
    let lowPressureSteamNeed: number = this.deaeratorOutput.inletSteamMassFlow + this.inputData.headerInput.lowPressure.processSteamUsage;
    let lowPressureSteamAvailable: number = this.lowPressureHeader.massFlow;
    let steamBalance: number = lowPressureSteamNeed - lowPressureSteamAvailable;
    return steamBalance;
  }

  getRemainingSteam(): number {
    let inletSteam: number = this.lowPressurePRV.outletMassFlow + this.highToLowPressureTurbine.massFlow + this.mediumPressureCondensateFlashTank.outletGasMassFlow;
    let lowPressureSteamNeed: number = this.deaeratorOutput.inletSteamMassFlow + this.inputData.headerInput.lowPressure.processSteamUsage;
    let steamBalance: number = lowPressureSteamNeed - inletSteam;
    return steamBalance;
  }

  adjustLowPressureSteamFlow(steamBalance: number) {
    let remainingSteamNeed: number = steamBalance;
    //try adding addtional steam to high to low turbine
    if (this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
      if (this.inputData.turbineInput.highToLowTurbine.operationType == 2) {
        //balance header send additional steam through
        this.calculateHighToLowTurbineGivenMassFlow(remainingSteamNeed);
        remainingSteamNeed = 0;
      } else if (this.inputData.turbineInput.highToLowTurbine.operationType == 4) {
        //flow range
        let availableCapacity: number = this.inputData.turbineInput.highToLowTurbine.operationValue2 - this.highToLowPressureTurbine.massFlow;
        let addedSteam: number = availableCapacity - remainingSteamNeed;
        if (addedSteam >= 0) {
          this.calculateHighToLowTurbineGivenMassFlow(this.highToLowPressureTurbine.massFlow + addedSteam);
          remainingSteamNeed = remainingSteamNeed - addedSteam;
        }
      } else if (this.inputData.turbineInput.highToLowTurbine.operationType == 3) {
        //power range
        if (this.inputData.turbineInput.highToLowTurbine.operationValue2 < this.highToLowPressureTurbine.powerOut) {
          this.calculateHighToLowTurbineGivenMassFlow(this.highToLowPressureTurbine.massFlow + remainingSteamNeed)
        }
        if (this.inputData.turbineInput.highToLowTurbine.operationValue2 < this.highToLowPressureTurbine.powerOut) {
          //if still under the range then all good
          remainingSteamNeed = 0;
        } else {
          //calculate for max power out
          this.highToLowPressureTurbine = this.steamService.turbine(
            {
              solveFor: 0,
              inletPressure: this.highPressureHeader.pressure,
              inletQuantity: 1,
              inletQuantityValue: this.highPressureHeader.specificEnthalpy,
              turbineProperty: 1,//powerOut
              isentropicEfficiency: this.inputData.turbineInput.highToLowTurbine.isentropicEfficiency,
              generatorEfficiency: this.inputData.turbineInput.highToLowTurbine.generationEfficiency,
              massFlowOrPowerOut: this.inputData.turbineInput.highToLowTurbine.operationValue2,
              outletSteamPressure: this.inputData.headerInput.lowPressure.pressure,
              outletQuantity: 0,
              outletQuantityValue: 0
            },
            this.settings
          );
        }
      }
      // this.calculateLowPressureHeader();
      // this.calculateDearator();
      remainingSteamNeed = this.getRemainingSteam();
    }

    //try adding additional steam to high to medium turbine
    if (this.inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
      if (this.inputData.turbineInput.highToMediumTurbine.operationType == 2) {
        //balance header send additional steam through
      } else if (this.inputData.turbineInput.highToMediumTurbine.operationType == 3) {
        //flow range
      } else if (this.inputData.turbineInput.highToMediumTurbine.operationType == 4) {
        //power range
      }
    }
    //get remaining steam from prv
    if (remainingSteamNeed != 0) {
      console.log('REMAINING STEAM BALANCE ' + this.getLowPressureSteamBalance())
      console.log('PRV BALANCE ' + this.highToMediumPressurePRV.inletMassFlow);
      console.log(this.highToMediumPressurePRV.inletMassFlow + remainingSteamNeed)
      if (this.inputData.headerInput.mediumPressure.desuperheatSteamIntoNextHighest == true) {
        this.highToMediumPressurePRV = this.steamService.prvWithDesuperheating(
          {
            inletPressure: this.highPressureHeader.pressure,
            thermodynamicQuantity: 1,//1 is enthalpy
            quantityValue: this.highPressureHeader.specificEnthalpy,
            inletMassFlow: this.highToMediumPressurePRV.inletMassFlow + remainingSteamNeed,
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
            inletMassFlow: this.highToMediumPressurePRV.inletMassFlow + remainingSteamNeed,
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
    this.calculateMediumPressureHeader();
    this.calculateLowPressurePRV();
    this.calculateLowPressureHeader();
    this.calculateDearator();
    // remainingSteamNeed = this.getRemainingSteam();
    // if(Math.abs(remainingSteamNeed) > 1e-5){
    //   this.checkLowPressureBalance();
    // }
  }

  calculateHighToLowTurbineGivenMassFlow(massFlow: number) {
    this.highToLowPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.highPressureHeader.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.highPressureHeader.specificEnthalpy,
        turbineProperty: 0,//massflow
        isentropicEfficiency: this.inputData.turbineInput.highToLowTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.highToLowTurbine.generationEfficiency,
        massFlowOrPowerOut: massFlow,
        outletSteamPressure: this.inputData.headerInput.lowPressure.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this.settings
    );
  }


  //Process Usage
  calculateHighPressureProcessUsage() {
    let processSteamUsageEnergyFlow: number = this.inputData.headerInput.highPressure.processSteamUsage * this.highPressureHeader.specificEnthalpy / 1000;
    let processUsage: number = (this.inputData.headerInput.highPressure.processSteamUsage) * (this.highPressureHeader.specificEnthalpy - this.highPressureCondensate.specificEnthalpy);
    processUsage = this.convertUnitsService.value(processUsage).from(this.settings.steamMassFlowMeasurement).to('kg');
    processUsage = this.convertUnitsService.value(processUsage).from(this.settings.steamSpecificEnthalpyMeasurement).to('kJkg');
    processUsage = this.convertUnitsService.value(processUsage).from('kJ').to(this.settings.steamEnergyMeasurement);
    //TODO: Calculate processUsage
    this.highPressureProcessUsage = {
      pressure: this.highPressureHeader.pressure,
      temperature: this.highPressureHeader.temperature,
      energyFlow: processSteamUsageEnergyFlow,
      massFlow: this.inputData.headerInput.highPressure.processSteamUsage,
      processUsage: processUsage
    };
  }

  calculateMediumPressureProcessUsage() {
    let processSteamUsageEnergyFlow: number = this.inputData.headerInput.mediumPressure.processSteamUsage * this.mediumPressureHeader.specificEnthalpy / 1000;
    let processUsage: number = (this.inputData.headerInput.mediumPressure.processSteamUsage) * (this.mediumPressureHeader.specificEnthalpy - this.mediumPressureCondensate.specificEnthalpy);
    processUsage = this.convertUnitsService.value(processUsage).from(this.settings.steamMassFlowMeasurement).to('kg');
    processUsage = this.convertUnitsService.value(processUsage).from(this.settings.steamSpecificEnthalpyMeasurement).to('kJkg');
    processUsage = this.convertUnitsService.value(processUsage).from('kJ').to(this.settings.steamEnergyMeasurement);
    //TODO: Calculate processUsage
    this.mediumPressureProcessUsage = {
      pressure: this.mediumPressureHeader.pressure,
      temperature: this.mediumPressureHeader.temperature,
      energyFlow: processSteamUsageEnergyFlow,
      massFlow: this.inputData.headerInput.mediumPressure.processSteamUsage,
      processUsage: processUsage
    };
  }


  calculateLowPressureProcessUsage() {
    let processSteamUsageEnergyFlow: number = this.inputData.headerInput.lowPressure.processSteamUsage * this.lowPressureHeader.specificEnthalpy / 1000;
    let processUsage: number = (this.inputData.headerInput.lowPressure.processSteamUsage) * (this.lowPressureHeader.specificEnthalpy - this.lowPressureCondensate.specificEnthalpy);
    processUsage = this.convertUnitsService.value(processUsage).from(this.settings.steamMassFlowMeasurement).to('kg');
    processUsage = this.convertUnitsService.value(processUsage).from(this.settings.steamSpecificEnthalpyMeasurement).to('kJkg');
    processUsage = this.convertUnitsService.value(processUsage).from('kJ').to(this.settings.steamEnergyMeasurement);
    //TODO: Calculate processUsage
    this.lowPressureProcessUsage = {
      pressure: this.lowPressureHeader.pressure,
      temperature: this.lowPressureHeader.temperature,
      energyFlow: processSteamUsageEnergyFlow,
      massFlow: this.inputData.headerInput.lowPressure.processSteamUsage,
      processUsage: processUsage
    };
  }


  // calculateLowPressureVentedSteam(){
  //   this.ventedLowPressureSteam = this.lowPressureHeader.massFlow - this.inputData.headerInput.lowPressure.processSteamUsage;
  //   if(this.deaeratorOutput){
  //     this.ventedLowPressureSteam = this.ventedLowPressureSteam - this.deaeratorOutput.inletSteamMassFlow;
  //   }
  // }



  //Cost and Energy Calculations
  calculatePowerGenerated() {
    //sum power generated by turbine
    let powerGenerated: number = 0;
    if (this.condensingTurbine) {
      powerGenerated = powerGenerated + this.condensingTurbine.powerOut;
    }
    if (this.highToLowPressureTurbine) {
      powerGenerated = powerGenerated + this.highToLowPressureTurbine.powerOut;
    }
    if (this.highPressureToMediumPressureTurbine) {
      powerGenerated = powerGenerated + this.highPressureToMediumPressureTurbine.powerOut;
    }
    if (this.mediumToLowPressureTurbine) {
      powerGenerated = powerGenerated + this.mediumToLowPressureTurbine.powerOut;
    }
    this.powerGenerated = powerGenerated;
  }

  calculatePowerGenerationCost() {
    this.powerGenerationCost = this.inputData.operationsInput.sitePowerImport * this.inputData.operationsInput.electricityCosts * this.inputData.operationsInput.operatingHoursPerYear;
  }

  calculateBoilerFuelCost() {
    this.boilerFuelCost = this.boilerOutput.fuelEnergy * this.inputData.operationsInput.operatingHoursPerYear * this.inputData.operationsInput.fuelCosts;
  }

  calculateMakeupWaterCost() {
    this.makeupWaterCost = this.inputData.operationsInput.makeUpWaterCosts * this.annualMakeupWaterFlow;
  }

  calculateTotalOperatingCost() {
    this.totalOperatingCost = this.powerGenerationCost + this.boilerFuelCost + this.makeupWaterCost;
  }

  calculateBoilerFuelUsage() {
    this.boilerFuelUsage = this.boilerOutput.fuelEnergy * this.inputData.operationsInput.operatingHoursPerYear;
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
    this.powerGenerated = undefined;
    this.makeupWaterVolumeFlow = undefined;
    this.annualMakeupWaterFlow = undefined;
    this.totalOperatingCost = undefined;
    this.powerGenerationCost = undefined;
    this.boilerFuelCost = undefined;
    this.makeupWaterCost = undefined;
    this.boilerFuelUsage = undefined;
    //this.mediumPressureProcessSteamUsage = undefined;
  }

}
