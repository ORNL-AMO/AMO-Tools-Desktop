import { Injectable } from '@angular/core';
import { SteamService } from '../../calculator/steam/steam.service';
import { BoilerOutput, SteamPropertiesOutput, HeaderOutputObj, HeatLossOutput, PrvOutput, TurbineOutput, FlashTankOutput, DeaeratorOutput, ProcessSteamUsage, HeaderOutput, SSMTOutput, HeatExchangerOutput } from '../../shared/models/steam/steam-outputs';
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

  //some values for SSMTOperationsOutput
  powerGenerated: number;
  boilerFuelCost: number;
  makeupWaterCost: number;
  totalOperatingCost: number;
  totalEnergyUse: number;
  powerGenerationCost: number;
  boilerFuelUsage: number;
  sitePowerImport: number;
  sitePowerDemand: number;

  makeupWaterVolumeFlow: number;
  annualMakeupWaterFlow: number;

  calcCount: number = 0;
  //heatExchanger: HeatExchanger
  heatExchangerOutput: HeatExchangerOutput;
  ventedLowPressureSteam: SteamPropertiesOutput;

  isBaselineCalculation: boolean;
  baselinePowerDemand: number;

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

  initData(_ssmt: SSMT, _settings: Settings, isBaseline: boolean, baselinePowerDemand?: number): void {
    this.isBaselineCalculation = isBaseline;
    this.baselinePowerDemand = baselinePowerDemand;
    this.calcCount = 0;
    this.inputData = this.getInputDataFromSSMT(_ssmt);
    this.settings = _settings;
  }

  calculateModelRunner(): { inputData: SSMTInputs, outputData: SSMTOutput } {
    //initial guess for system is a sum of the process usage by the headers.
    let initialGuess: number = 0;
    if (this.inputData.headerInput.numberOfHeaders == 1) {
      initialGuess = this.inputData.headerInput.highPressure.processSteamUsage;
    } else if (this.inputData.headerInput.numberOfHeaders == 2) {
      initialGuess = (this.inputData.headerInput.highPressure.processSteamUsage + this.inputData.headerInput.lowPressure.processSteamUsage);
    } else if (this.inputData.headerInput.numberOfHeaders == 3) {
      initialGuess = (this.inputData.headerInput.highPressure.processSteamUsage + this.inputData.headerInput.lowPressure.processSteamUsage + this.inputData.headerInput.mediumPressure.processSteamUsage);
    }
    let balancedResults: SSMTOutput = this.calculateModel(initialGuess);
    let marginalCosts: { marginalHPCost: number, marginalMPCost: number, marginalLPCost: number } = this.calculateMarginalCosts(initialGuess, balancedResults);

    balancedResults.marginalHPCost = marginalCosts.marginalHPCost;
    balancedResults.marginalMPCost = marginalCosts.marginalMPCost;
    balancedResults.marginalLPCost = marginalCosts.marginalLPCost;

    return { inputData: this.inputData, outputData: balancedResults };
  }

  calculateMarginalCosts(initialGuess: number, balancedResults: SSMTOutput): { marginalHPCost: number, marginalMPCost: number, marginalLPCost: number } {
    this.calcCount = 0;

    let marginalHPCost: number = 0;
    let marginalMPCost: number = 0;
    let marginalLPCost: number = 0;

    this.inputData.headerInput.highPressure.processSteamUsage = this.inputData.headerInput.highPressure.processSteamUsage + 100;
    let highPressureMarginalResults: SSMTOutput = this.calculateModel(initialGuess + 100)
    this.calcCount = 0;
    this.inputData.headerInput.highPressure.processSteamUsage = this.inputData.headerInput.highPressure.processSteamUsage - 100;
    marginalHPCost = this.getCostDifference(balancedResults, highPressureMarginalResults);

    if (this.inputData.headerInput.numberOfHeaders > 1) {
      this.inputData.headerInput.lowPressure.processSteamUsage = this.inputData.headerInput.lowPressure.processSteamUsage + 100;
      let lowPressureMarginalResults: SSMTOutput = this.calculateModel(initialGuess + 100)
      this.calcCount = 0;
      this.inputData.headerInput.lowPressure.processSteamUsage = this.inputData.headerInput.lowPressure.processSteamUsage - 100;
      marginalLPCost = this.getCostDifference(balancedResults, lowPressureMarginalResults);
      
      if (this.inputData.headerInput.numberOfHeaders == 3) {
        this.inputData.headerInput.mediumPressure.processSteamUsage = this.inputData.headerInput.mediumPressure.processSteamUsage + 100;
        let mediumPressureMarginalResults: SSMTOutput = this.calculateModel(initialGuess + 100)
        this.calcCount = 0;
        this.inputData.headerInput.mediumPressure.processSteamUsage = this.inputData.headerInput.mediumPressure.processSteamUsage - 100;
        marginalMPCost = this.getCostDifference(balancedResults, mediumPressureMarginalResults);
      }
    }
    return { marginalHPCost: marginalHPCost, marginalMPCost: marginalMPCost, marginalLPCost: marginalLPCost }
  }

  getCostDifference(balancedResults: SSMTOutput, adjustedResults: SSMTOutput): number{
    let powerGenOC: number = balancedResults.powerGenerated * this.inputData.operationsInput.electricityCosts;
    let adjustedPowerGenOC: number = adjustedResults.powerGenerated  * this.inputData.operationsInput.electricityCosts;
    let totalOC: number = balancedResults.totalOperatingCost / this.inputData.operationsInput.operatingHoursPerYear;
    let adjustedTotalOC: number = adjustedResults.totalOperatingCost / this.inputData.operationsInput.operatingHoursPerYear;

    return ((adjustedTotalOC - totalOC) + (powerGenOC - adjustedPowerGenOC)) / 100;
  }

  calculateModel(massFlow: number): SSMTOutput {
    //using counter to catch mistakes in testing, shouldn't ever be more than like 7
    this.calcCount++;
    if (this.calcCount < 25) {
      //1. Model Boiler
      //1A. Calculate Boiler with massFlow
      this.calculateBoiler(massFlow);
      //1B. Flash blowdown if selected
      if (this.inputData.boilerInput.blowdownFlashed == true) {
        this.calculateBlowdownFlashTank();
      }

      //2. Model High Pressure Header and Outlets
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
      //2F. Calculate high to low steam turbine if in use
      if (this.inputData.headerInput.numberOfHeaders > 1 && this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
        this.calculateHighToLowSteamTurbine();
      }
      //2G. Calculate high to medium steam turbine if in use
      if (this.inputData.headerInput.numberOfHeaders == 3 && this.inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
        this.calculateHighToMediumPressureSteamTurbine();
      }

      //3. Calculate Medium Pressure Header
      //if medium pressure header exists
      if (this.inputData.headerInput.numberOfHeaders == 3) {
        //3A. Calculate High to Medium PRV
        this.calculateHighToMediumPRV();
        //3B. Model Medium Pressure Header
        this.calculateMediumPressureHeader();
        //3C. Calculate Heat Loss for Remain Steam in Medium Pressure Header
        this.calculateHeatLossForMediumPressureHeader();
        //3D. Calculate Medium Pressure Condensate
        this.calculateMediumPressureCondensate();
        //3E. Calculate medium to low steam turbine if in use
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

      //7. Check system steam balance
      //if system is unbalanced, calculateModel will be recursively called
      //until system is balanced
      let steamBalance: number = this.checkPowerBalance();


      //These functions do not impact iteration of the model.
      //they calculate informational values
      //8. calculate process steam usage
      //8a. calculate high pressure process steam usage
      this.calculateHighPressureProcessUsage();
      if (this.inputData.headerInput.numberOfHeaders > 1) {
        //8b. calculate low pressure process steam usage
        this.calculateLowPressureProcessUsage();
      }
      if (this.inputData.headerInput.numberOfHeaders == 3) {
        //8c. calculate medium pressure process steam usage
        this.calculateMediumPressureProcessUsage();
      }
      //9. Calculate Energy and Cost Values
      //9a. Calculate Power Generated
      this.calculatePowerGenerated();
      //9b. Calculate Site Power Import
      this.calculatePowerImport();
      //9c. Calculate Demand
      this.calculatePowerDemand();
      //9b. Calculate cost of power generation
      this.calculatePowerGenerationCost();
      //9c. Calculate cost of fuel for boiler
      this.calculateBoilerFuelCost();
      //9d. Calculate cost of make-up water
      this.calculateMakeupWaterCost();
      //9e. Calculate total operating costs
      this.calculateTotalOperatingCost();
      //9f. Calculate boiler fuel usage
      this.calculateBoilerFuelUsage();
      return this.getResultsObject();
    } else {
      return this.getResultsObject();
    }
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

  //2D. or 4B. Calculate High Pressure Condensate Flash Tank
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

  //2E. Calculate Condensing Turbine
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


  //2F. Calculate High to Low Steam Turbine
  calculateHighToLowSteamTurbine() {
    //value for inletMassFlow into turbine calculation 
    //mass flow in header - processSteamUsage
    let availableMassFlow: number = this.highPressureHeader.massFlow - this.inputData.headerInput.highPressure.processSteamUsage;
    //remove steam that goes through condensing turbine
    if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
      availableMassFlow = availableMassFlow - this.condensingTurbine.massFlow;
    }

    //flow range
    if (this.inputData.turbineInput.highToLowTurbine.operationType == 4) {
      //if less steam available then minimum needed
      if (this.inputData.turbineInput.highToLowTurbine.operationValue1 > availableMassFlow) {
        //calculate turbine with amount needed
        this.calculateHighToLowPressureTurbineGivenMassFlow(this.inputData.turbineInput.highToLowTurbine.operationValue1);
        //find addtional steam needed = amount needed - current amount
        let additionalSteamNeed: number = this.highToLowPressureTurbine.massFlow - availableMassFlow;
        //if need more than .0001
        if (Math.abs(additionalSteamNeed) > 1e-3) {
          //re-run model with additional steam added
          this.calculateModel(this.boilerOutput.steamMassFlow + additionalSteamNeed);
        }
      }
      //if more steam is available than max allowed
      else if (this.inputData.turbineInput.highToLowTurbine.operationValue2 < availableMassFlow) {
        //send max
        this.calculateHighToLowPressureTurbineGivenMassFlow(this.inputData.turbineInput.highToLowTurbine.operationValue2);
      } else {
        //current steam available is in range
        this.calculateHighToLowPressureTurbineGivenMassFlow(availableMassFlow);
      }
    }
    //power range
    else if (this.inputData.turbineInput.highToLowTurbine.operationType == 3) {
      //calculate with given mass flow
      this.calculateHighToLowPressureTurbineGivenMassFlow(availableMassFlow);
      //check that power out is in range
      if (this.inputData.turbineInput.highToLowTurbine.operationValue1 > this.highToLowPressureTurbine.powerOut) {
        //if not enough power out of turbine find the difference between the current amount and minimum amount needed
        let currentSteamAvailable: number = this.highToLowPressureTurbine.massFlow;
        //calculate minimum mass flow need
        this.calculateHighToLowPressureTurbineGivenPowerOut(this.inputData.turbineInput.highToLowTurbine.operationValue1);
        //find additional steam needed
        let additionalSteamNeed: number = this.highToLowPressureTurbine.massFlow - currentSteamAvailable;
        //if need more than .0001
        if (Math.abs(additionalSteamNeed) > 1e-3) {
          //re-run model with addtional steam added
          this.calculateModel(this.boilerOutput.steamMassFlow + additionalSteamNeed);
        }
      }
      //if there is more power out with current mass flow available than max allowed, reduce to max power out.
      else if (this.inputData.turbineInput.highToLowTurbine.operationValue2 < this.highToLowPressureTurbine.powerOut) {
        //calculate turbine with max power out value
        this.calculateHighToLowPressureTurbineGivenPowerOut(this.inputData.turbineInput.highToLowTurbine.operationValue2);
      }
    }
    //if fixed power out
    else if (this.inputData.turbineInput.highToLowTurbine.operationType == 1) {
      //calculate turbine with fixed power out value
      this.calculateHighToLowPressureTurbineGivenPowerOut(this.inputData.turbineInput.highToLowTurbine.operationValue1);
      //check that enough mass flow is available for amount needed for that power out value
      if (this.highToLowPressureTurbine.massFlow > availableMassFlow) {
        //calculate additonal steam need
        let additionalSteamNeed: number = this.highToLowPressureTurbine.massFlow - availableMassFlow;
        if (Math.abs(additionalSteamNeed) > 1e-3) {
          //re-run model with additional steam added
          this.calculateModel(this.boilerOutput.steamMassFlow + additionalSteamNeed);
        }
      }
    }
    //if fixed mass flow
    else if (this.inputData.turbineInput.highToLowTurbine.operationType == 0) {
      //calculate turbine with defined mass flow
      this.calculateHighToLowPressureTurbineGivenMassFlow(this.inputData.turbineInput.highToLowTurbine.operationValue1);
      //check that enough mass flow is available for set amount
      if (this.highToLowPressureTurbine.massFlow > availableMassFlow) {
        //calculate additional steem need
        let additionalSteamNeed: number = this.highToLowPressureTurbine.massFlow - availableMassFlow;
        if (Math.abs(additionalSteamNeed) > 1e-3) {
          //re-run model with addtional steam added
          this.calculateModel(this.boilerOutput.steamMassFlow + additionalSteamNeed);
        }
      }
    }
    //balance header = send available mass flow through
    else if (this.inputData.turbineInput.highToLowTurbine.operationType == 2) {
      this.calculateHighToLowPressureTurbineGivenMassFlow(availableMassFlow);
    }
  }

  //Utility function used to calculate high to low turbine with a given mass flow
  calculateHighToLowPressureTurbineGivenMassFlow(massFlow: number) {
    this.highToLowPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.highPressureHeader.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.highPressureHeader.specificEnthalpy,
        turbineProperty: 0, // massFlow
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
  //Utility function use to calculate high to low turbine with a given power out
  calculateHighToLowPressureTurbineGivenPowerOut(powerOut: number) {
    this.highToLowPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.highPressureHeader.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.highPressureHeader.specificEnthalpy,
        turbineProperty: 1, // powerOut
        isentropicEfficiency: this.inputData.turbineInput.highToLowTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.highToLowTurbine.generationEfficiency,
        massFlowOrPowerOut: powerOut,
        outletSteamPressure: this.inputData.headerInput.lowPressure.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this.settings
    );
  }

  //Utility function to reducte steam from the high to low turbine
  //Used by high to medium turbine, medium to low turbine, medium pressure header
  //when additional steam is needed
  //return amount of steam still needed by the system after taking steam from turbine
  reduceSteamThroughHighToLowTurbine(neededSteam: number): number {
    //if the turbine is in use
    if (this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
      //fixed steam, cannot reduce steam through turbine
      if (this.inputData.turbineInput.highToLowTurbine.operationType == 0 || this.inputData.turbineInput.highToLowTurbine.operationType == 1) {
        //no steam taken
        return neededSteam;
      }
      //balance header, all steam is available to be taken
      else if (this.inputData.turbineInput.highToLowTurbine.operationType == 2) {
        let availableSteam: number = this.highToLowPressureTurbine.massFlow;
        //if all steam can be taken,
        if (availableSteam - neededSteam >= 0) {
          //calculate high to low turbine with reduced mass flow
          this.calculateHighToLowPressureTurbineGivenMassFlow(availableSteam - neededSteam);
          //all additional steam needed was taken from turbine, no addtional steam needed
          return 0;
        } else {
          //take all steam from turbine
          this.calculateHighToLowPressureTurbineGivenMassFlow(0);
          //steam still needed = needed steam - amount taken
          return neededSteam - availableSteam;
        }
      }
      //power range
      else if (this.inputData.turbineInput.highToLowTurbine.operationType == 3) {
        //if current power out is greater than the minimum amount needed there is steam available
        if (this.highToLowPressureTurbine.powerOut > this.inputData.turbineInput.highToLowTurbine.operationValue1) {
          //calculate amount of steam taken when reducing power out to minimum
          let previousMassFlow: number = this.highToLowPressureTurbine.massFlow;
          //calculate header using minimum power out needed
          this.calculateHighToLowPressureTurbineGivenPowerOut(this.inputData.turbineInput.highToLowTurbine.operationValue1);
          //amount reduced = previous mass flow - mass flow at min need
          let massFlowReduction: number = previousMassFlow - this.highToLowPressureTurbine.massFlow;
          //amount of steam take = needed steam - amount reduced
          let newSteamNeed: number = neededSteam - massFlowReduction;
          //if excess amount of steam was taken than needed when reducing
          if (newSteamNeed < 0) {
            //put excess steam taken back into turbine
            this.calculateHighToLowPressureTurbineGivenMassFlow(this.highToLowPressureTurbine.massFlow + Math.abs(newSteamNeed));
            return 0;
          } else {
            //return new steam need
            return newSteamNeed;
          }
        } else {
          //no steam available from turbine
          return neededSteam;
        }
      }
      //flow range
      else if (this.inputData.turbineInput.highToLowTurbine.operationType == 4) {
        //if current mass flow is greater than minimum needed
        if (this.highToLowPressureTurbine.massFlow > this.inputData.turbineInput.highToLowTurbine.operationValue1) {
          //calculate amount of steam that can be taken
          let currentMassFlow: number = this.highToLowPressureTurbine.massFlow;
          //calculate turbine at minimum value
          this.calculateHighToLowPressureTurbineGivenMassFlow(this.inputData.turbineInput.highToLowTurbine.operationValue1);
          //calculate amount of mass flow reduced
          let massFlowReduction: number = currentMassFlow - this.highToLowPressureTurbine.massFlow;
          //calculate new steam need
          let newSteamNeed: number = neededSteam - massFlowReduction;
          //if excess amount of steam reduced than needed
          if (newSteamNeed < 0) {
            //put excess steam taken back into turbine
            this.calculateHighToLowPressureTurbineGivenMassFlow(this.highToLowPressureTurbine.massFlow + Math.abs(newSteamNeed));
            return 0;
          } else {
            return newSteamNeed;
          }
        } else {
          return neededSteam;
        }
      }
    } else {
      return neededSteam;
    }
  }

  //2G. Calculate High to Medium Steam Turbine
  calculateHighToMediumPressureSteamTurbine() {
    //value for available mass flow into turbine 
    //mass flow in header - processSteamUsage
    let availableMassFlow: number = this.highPressureHeader.massFlow - this.inputData.headerInput.highPressure.processSteamUsage;
    //remove steam that goes through condensing turbine
    if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
      availableMassFlow = availableMassFlow - this.condensingTurbine.massFlow;
    }
    //remove steam that goes through high to low turbine
    if (this.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
      availableMassFlow = availableMassFlow - this.highToLowPressureTurbine.massFlow;
    }
    //flow range
    if (this.inputData.turbineInput.highToMediumTurbine.operationType == 4) {
      //if more steam needed for minimum than is available
      if (this.inputData.turbineInput.highToMediumTurbine.operationValue1 > availableMassFlow) {
        //calculate turbine with amount needed
        this.calculateHighToMediumPressureTurbineGivenMassFlow(this.inputData.turbineInput.highToMediumTurbine.operationValue1);
        //calculate the amount of additional steam needed
        let additionalSteamNeed: number = this.highPressureToMediumPressureTurbine.massFlow - availableMassFlow;
        if (Math.abs(additionalSteamNeed) > 1e-3) {
          //take as much steam as possible from high to low turbine
          let newSteamNeed: number = this.reduceSteamThroughHighToLowTurbine(additionalSteamNeed);
          if (Math.abs(newSteamNeed) > 1e-3) {
            //re-run model with addtional steam added
            this.calculateModel(this.boilerOutput.steamMassFlow + newSteamNeed);
          }
        }
      }
      //if excess steam is available
      else if (this.inputData.turbineInput.highToMediumTurbine.operationValue2 < availableMassFlow) {
        //send max flow
        this.calculateHighToMediumPressureTurbineGivenMassFlow(this.inputData.turbineInput.highToMediumTurbine.operationValue2);
      } else {
        //amount of available steam is in range.
        this.calculateHighToMediumPressureTurbineGivenMassFlow(availableMassFlow);
      }
    }
    //power range
    else if (this.inputData.turbineInput.highToMediumTurbine.operationType == 3) {
      //calculate turbine with available mass flow
      this.calculateHighToMediumPressureTurbineGivenMassFlow(availableMassFlow);
      //check to see if power out is in range
      if (this.inputData.turbineInput.highToMediumTurbine.operationValue1 > this.highPressureToMediumPressureTurbine.powerOut) {
        //if not enough power out of turbine
        let currentMassFlowAvailable: number = this.highPressureToMediumPressureTurbine.massFlow;
        //calculate minimum mass flow needed
        this.calculateHighToMediumPressureTurbineGivenPowerOut(this.inputData.turbineInput.highToLowTurbine.operationValue1);
        //calculate additional steam needed to meet minimum requirement
        let additionalSteamNeed: number = this.highPressureToMediumPressureTurbine.massFlow - currentMassFlowAvailable;
        if (Math.abs(additionalSteamNeed) > 1e-3) {
          //try taking addtional steam from high to low turbine
          let newSteamNeed: number = this.reduceSteamThroughHighToLowTurbine(additionalSteamNeed);
          if (Math.abs(newSteamNeed) > 1e-3) {
            //re-run model with addtional steam added
            this.calculateModel(this.boilerOutput.steamMassFlow + newSteamNeed);
          }
        }
      }
      //if power out with available mass flow is greater than max
      else if (this.inputData.turbineInput.highToMediumTurbine.operationValue2 < this.highPressureToMediumPressureTurbine.powerOut) {
        //calculate turbine with max power out
        this.calculateHighToMediumPressureTurbineGivenPowerOut(this.inputData.turbineInput.highToMediumTurbine.operationValue2);
      }
    }
    //if fixed power out
    else if (this.inputData.turbineInput.highToMediumTurbine.operationType == 1) {
      //calculate turbine with given power out
      this.calculateHighToMediumPressureTurbineGivenPowerOut(this.inputData.turbineInput.highToMediumTurbine.operationValue1);
      //check that there is enough mass flow available to meet need for given power out
      if (this.highPressureToMediumPressureTurbine.massFlow > availableMassFlow) {
        //calculate the addtional steam needed
        let additionalSteamNeed: number = this.highPressureToMediumPressureTurbine.massFlow - availableMassFlow;
        if (Math.abs(additionalSteamNeed) > 1e-3) {
          //try taking steam from high to low turbine
          let newSteamNeed: number = this.reduceSteamThroughHighToLowTurbine(additionalSteamNeed);
          if (Math.abs(newSteamNeed) > 1e-3) {
            //re-run model with addtional steam added
            this.calculateModel(this.boilerOutput.steamMassFlow + newSteamNeed);
          }
        }
      }
    }
    //if fixed mass flow
    else if (this.inputData.turbineInput.highToMediumTurbine.operationType == 0) {
      //calculate turbine with given mass flow
      this.calculateHighToMediumPressureTurbineGivenMassFlow(this.inputData.turbineInput.highToMediumTurbine.operationValue1);
      //check enough mass flow is available for set mass flow
      if (this.highPressureToMediumPressureTurbine.massFlow > availableMassFlow) {
        //calculate addtional mass flow needed
        let additionalSteamNeed: number = this.highPressureToMediumPressureTurbine.massFlow - availableMassFlow;
        if (Math.abs(additionalSteamNeed) > 1e-3) {
          //try taking steam from high to low turbine
          let newSteamNeed: number = this.reduceSteamThroughHighToLowTurbine(additionalSteamNeed);
          if (Math.abs(newSteamNeed) > 1e-3) {
            //re-run model with addtional steam added
            this.calculateModel(this.boilerOutput.steamMassFlow + newSteamNeed);
          }
        }
      }
    }
    //balance header
    else if (this.inputData.turbineInput.highToMediumTurbine.operationType == 2) {
      //send all available steam through turbine
      this.calculateHighToMediumPressureTurbineGivenMassFlow(availableMassFlow);
    }
  }

  //Utility function used to calculate turbine with given power out
  calculateHighToMediumPressureTurbineGivenPowerOut(powerOut: number) {
    this.highPressureToMediumPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.highPressureHeader.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.highPressureHeader.specificEnthalpy,
        turbineProperty: 1, //powerOut
        isentropicEfficiency: this.inputData.turbineInput.highToMediumTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.highToMediumTurbine.generationEfficiency,
        massFlowOrPowerOut: powerOut,
        outletSteamPressure: this.inputData.headerInput.mediumPressure.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this.settings
    );
  }

  //Utility function used to calculate turbine with given mass flow
  calculateHighToMediumPressureTurbineGivenMassFlow(massFlow: number) {
    this.highPressureToMediumPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.highPressureHeader.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.highPressureHeader.specificEnthalpy,
        turbineProperty: 0, //massFlow
        isentropicEfficiency: this.inputData.turbineInput.highToMediumTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.highToMediumTurbine.generationEfficiency,
        massFlowOrPowerOut: massFlow,
        outletSteamPressure: this.inputData.headerInput.mediumPressure.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this.settings
    );
  }

  /********** 3. Calculate Medium Pressure Header *********/
  //3A. Calculate High to Medium PRV
  calculateHighToMediumPRV() {
    //PRV mass flow is steam remaning in high pressure header
    //subtract off all steam usage from header
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
    //3C3. Check that medium pressure header has enough steam to be processed
    if (this.mediumPressureHeader.massFlow < this.inputData.headerInput.mediumPressure.processSteamUsage) {
      //needed addtional steam in the header
      let additionalSteamNeed: number = this.inputData.headerInput.mediumPressure.processSteamUsage - this.mediumPressureHeader.massFlow;
      if (Math.abs(additionalSteamNeed) > 1e-3) {
        //try getting addtional steam from high to low turbine
        let newNeededSteam: number = this.reduceSteamThroughHighToLowTurbine(additionalSteamNeed);
        //if high to low turbine was reduced and more steam is available
        if (newNeededSteam < additionalSteamNeed) {
          //restart calculation process from step: 2G
          if (this.inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
            this.calculateHighToMediumPressureSteamTurbine();
          }
          //3A. Calculate High to Medium PRV
          this.calculateHighToMediumPRV();
          //3C. Model Medium Pressure Header
          this.calculateMediumPressureHeader();
          //3D. Calculate Heat Loss for Remain Steam in Medium Pressure Header
          this.calculateHeatLossForMediumPressureHeader();
          //3E. Calculate Medium Pressure Condensate
          this.calculateMediumPressureCondensate();
          if (this.inputData.turbineInput.mediumToLowTurbine.useTurbine == true) {
            //3F. Calculate medium to low steam turbine if in use
            this.calculateMediumToLowSteamTurbine();
          }
          //3C. Redo this step.
          this.calculateMediumPressureHeader();
        } else {
          this.calculateModel(this.boilerOutput.steamMassFlow + additionalSteamNeed);
        }
      }
    }
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
    //value for availableMassFlow into turbine calculation 
    //mass flow in header - processSteamUsage
    let availableMassFlow: number = this.mediumPressureHeader.massFlow - this.inputData.headerInput.mediumPressure.processSteamUsage;
    //flow range
    if (this.inputData.turbineInput.mediumToLowTurbine.operationType == 4) {
      //if minimum amount needed is greater than available amount
      if (this.inputData.turbineInput.mediumToLowTurbine.operationValue1 > availableMassFlow) {
        //calculate turbine with minimum amount needed
        this.calculateMediumToLowPressureTurbineGivenMassFlow(this.inputData.turbineInput.mediumToLowTurbine.operationValue1);
        //calculate addtional steam need
        let additionalSteamNeed: number = this.mediumToLowPressureTurbine.massFlow - availableMassFlow;
        if (Math.abs(additionalSteamNeed) > 1e-3) {
          //get more steam for the medium to low turbine
          this.getMoreSteamForMediumToLow(this.boilerOutput.steamMassFlow + additionalSteamNeed);
        }
      } else if (this.inputData.turbineInput.mediumToLowTurbine.operationValue2 < availableMassFlow) {
        //there's more steam available than max allowed, send max
        this.calculateMediumToLowPressureTurbineGivenMassFlow(this.inputData.turbineInput.mediumToLowTurbine.operationValue2);
      } else {
        //available steam in range, send all available
        this.calculateMediumToLowPressureTurbineGivenMassFlow(availableMassFlow);
      }
    }
    //power range
    else if (this.inputData.turbineInput.mediumToLowTurbine.operationType == 3) {
      //calculate with given mass flow
      this.calculateMediumToLowPressureTurbineGivenMassFlow(availableMassFlow);
      //check that power out is in range
      if (this.inputData.turbineInput.mediumToLowTurbine.operationValue1 > this.mediumToLowPressureTurbine.powerOut) {
        //if not enough power out of turbine
        let currentMassFlowAvailable: number = this.mediumToLowPressureTurbine.massFlow;
        //calculate minimum mass flow needed
        this.calculateMediumToLowPressureTurbineGivenPowerOut(this.inputData.turbineInput.mediumToLowTurbine.operationValue1);
        //calculate addtional mass flow needed
        let additionalSteamNeed: number = this.mediumToLowPressureTurbine.massFlow - currentMassFlowAvailable;
        if (Math.abs(additionalSteamNeed) > 1e-3) {
          //get more steam for the medium to low turbine
          this.getMoreSteamForMediumToLow(additionalSteamNeed);
        }
      } else if (this.inputData.turbineInput.mediumToLowTurbine.operationValue2 < this.mediumToLowPressureTurbine.powerOut) {
        //current available steam creates more power out than allowed, calculate for max power out
        this.calculateMediumToLowPressureTurbineGivenPowerOut(this.inputData.turbineInput.highToLowTurbine.operationValue2);
      }
    }
    //if fixed power out
    else if (this.inputData.turbineInput.mediumToLowTurbine.operationType == 1) {
      //calculate turbine with set amount of power out
      this.calculateMediumToLowPressureTurbineGivenPowerOut(this.inputData.turbineInput.mediumToLowTurbine.operationValue1);
      //check theres enough available steam for set power out
      if (this.mediumToLowPressureTurbine.massFlow > availableMassFlow) {
        //calculate addtional mass flow needed
        let additionalSteamNeed: number = this.mediumToLowPressureTurbine.massFlow - availableMassFlow;
        if (Math.abs(additionalSteamNeed) > 1e-3) {
          //get more steam for the medium to low turbine
          this.getMoreSteamForMediumToLow(additionalSteamNeed);
        }
      }
    }
    //if fixed mass flow
    else if (this.inputData.turbineInput.mediumToLowTurbine.operationType == 0) {
      //calculate turbine with set mass flow
      this.calculateMediumToLowPressureTurbineGivenMassFlow(this.inputData.turbineInput.mediumToLowTurbine.operationValue1);
      //check theres enough available steam for set mass flow
      if (this.mediumToLowPressureTurbine.massFlow > availableMassFlow) {
        //calculate addtional mass flow needed
        let additionalSteamNeed: number = this.mediumToLowPressureTurbine.massFlow - availableMassFlow;
        if (Math.abs(additionalSteamNeed) > 1e-3) {
          //calculate addtional mass flow needed
          this.getMoreSteamForMediumToLow(additionalSteamNeed);
        }
      }
    }
    //balance header send through what is available
    else if (this.inputData.turbineInput.mediumToLowTurbine.operationType == 2) {
      this.calculateMediumToLowPressureTurbineGivenMassFlow(availableMassFlow);
    }
  }

  //Utility used for finding additional steam to the medium to low turbine
  //trys reducing high to low turbine and then re-calculating system after reduction
  getMoreSteamForMediumToLow(neededSteam: number) {
    //reduce high to low turbine if possible
    let newSteamNeed: number = this.reduceSteamThroughHighToLowTurbine(neededSteam);
    if (newSteamNeed < neededSteam) {
      //restart from 2G
      if (this.inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
        this.calculateHighToMediumPressureSteamTurbine();
      }
      //3A. Calculate High to Medium PRV
      this.calculateHighToMediumPRV();
      //3B. Model Medium Pressure Header
      this.calculateMediumPressureHeader();
      //3C. Calculate Heat Loss for Remain Steam in Medium Pressure Header
      this.calculateHeatLossForMediumPressureHeader();
      //3D. Calculate Medium Pressure Condensate
      this.calculateMediumPressureCondensate();
      //3E. Calculate medium to low steam turbine if in use
      this.calculateMediumToLowSteamTurbine();
    } else {
      //if cant reduce high to medium
      //re-calculate model with additional needed steam added
      this.calculateModel(this.boilerOutput.steamMassFlow + neededSteam);
    }
  }

  //utility for calculating medium to low turbine given a mass flow
  calculateMediumToLowPressureTurbineGivenMassFlow(massFlow: number) {
    this.mediumToLowPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.mediumPressureHeader.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.mediumPressureHeader.specificEnthalpy,
        turbineProperty: 0,//massFlow
        isentropicEfficiency: this.inputData.turbineInput.mediumToLowTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.mediumToLowTurbine.generationEfficiency,
        massFlowOrPowerOut: massFlow,
        outletSteamPressure: this.inputData.headerInput.lowPressure.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this.settings
    );
  }

  //utility for calculating medium to low turbine given power out
  calculateMediumToLowPressureTurbineGivenPowerOut(powerOut: number) {
    this.mediumToLowPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.mediumPressureHeader.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.mediumPressureHeader.specificEnthalpy,
        turbineProperty: 1,//powerOut
        isentropicEfficiency: this.inputData.turbineInput.mediumToLowTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.mediumToLowTurbine.generationEfficiency,
        massFlowOrPowerOut: powerOut,
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

  //4E. Calculate Low Pressure Condensate
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
      if (this.inputData.headerInput.numberOfHeaders == 3 && this.inputData.headerInput.mediumPressure.desuperheatSteamIntoNextHighest == true) {
        makeupWaterMassFlow = makeupWaterMassFlow + this.highToMediumPressurePRV.feedwaterMassFlow;
      }
      if (this.inputData.headerInput.lowPressure.desuperheatSteamIntoNextHighest == true) {
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
      if (this.inputData.headerInput.lowPressure.desuperheatSteamIntoNextHighest == true) {
        feedwaterMassFlow = feedwaterMassFlow + this.lowPressurePRV.feedwaterMassFlow;
      }
      inletHeader = this.lowPressureHeader;
    }
    if (this.inputData.headerInput.numberOfHeaders == 3 && this.inputData.headerInput.mediumPressure.desuperheatSteamIntoNextHighest == true) {
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

  //7. Calculate the balance of the system
  checkPowerBalance() {
    //added steam from flash tanks (outletGasMassFlow)
    let flashTankAdditionalSteam: number = 0;
    //added steam from PRVs (outletMassFlow - inletMassFlow)
    let prvAdditionalSteam: number = 0;
    //amount of steam used by the system
    let processSteamUsage: number = this.inputData.headerInput.highPressure.processSteamUsage;

    if (this.inputData.headerInput.numberOfHeaders > 1) {
      //steam used by low pressure header
      processSteamUsage = processSteamUsage + this.inputData.headerInput.lowPressure.processSteamUsage;

      //steam added by blowdown flash tank
      if (this.inputData.boilerInput.blowdownFlashed == true) {
        flashTankAdditionalSteam = flashTankAdditionalSteam + this.blowdownFlashTank.outletGasMassFlow;
      }

      //steam added by flash tank into low pressure header
      if (this.inputData.headerInput.lowPressure.flashCondensateIntoHeader == true) {
        if (this.inputData.headerInput.numberOfHeaders == 2) {
          flashTankAdditionalSteam = flashTankAdditionalSteam + this.highPressureCondensateFlashTank.outletGasMassFlow;
        } else if (this.inputData.headerInput.numberOfHeaders == 3) {
          flashTankAdditionalSteam = flashTankAdditionalSteam + this.mediumPressureCondensateFlashTank.outletGasMassFlow;
        }
      }

      //steam added by desuperheating feedwater
      if (this.inputData.headerInput.lowPressure.desuperheatSteamIntoNextHighest == true) {
        prvAdditionalSteam = prvAdditionalSteam + (this.lowPressurePRV.outletMassFlow - this.lowPressurePRV.inletMassFlow);
      }

      if (this.inputData.headerInput.numberOfHeaders == 3) {
        //steam used by medium pressure header
        processSteamUsage = processSteamUsage + this.inputData.headerInput.mediumPressure.processSteamUsage;

        //steam added by flash tank into medium pressure header
        if (this.inputData.headerInput.mediumPressure.flashCondensateIntoHeader == true) {
          flashTankAdditionalSteam = flashTankAdditionalSteam + this.highPressureCondensateFlashTank.outletGasMassFlow;
        }

        //steam added by desuperheating feedwater
        if (this.inputData.headerInput.mediumPressure.desuperheatSteamIntoNextHighest == true) {
          prvAdditionalSteam = prvAdditionalSteam + (this.highToMediumPressurePRV.outletMassFlow - this.highToMediumPressurePRV.inletMassFlow);
        }
      }
    }

    //steam used by condensing turbine
    let condensingTurbineMassFlow: number = 0;
    if (this.inputData.turbineInput.condensingTurbine.useTurbine == true) {
      condensingTurbineMassFlow = this.condensingTurbine.massFlow;
    }

    //steam production = steam produced by (boiler) + (flash tanks) + (PRV feedwater)
    let steamProduction: number = this.boilerOutput.steamMassFlow + flashTankAdditionalSteam + prvAdditionalSteam;
    //steam use = steam used by (header process usage) + (deaerator) + (condensing turbine)
    let steamUse: number = processSteamUsage + this.deaeratorOutput.inletSteamMassFlow + condensingTurbineMassFlow;
    //steam balance = difference between use and production (we want 0!)
    let steamBalance: number = steamUse - steamProduction;
    if (this.inputData.headerInput.numberOfHeaders > 1 && steamBalance < 0) {
      let ventedSteamAmount: number = this.calculateLowPressureVentedSteam(steamBalance);
      steamBalance = steamBalance + ventedSteamAmount;
      if (Math.abs(steamBalance) < 1e-2) {
        ventedSteamAmount = (this.lowPressureHeader.massFlow) - (this.inputData.headerInput.lowPressure.processSteamUsage + this.deaeratorOutput.inletSteamMassFlow)
        this.calculateMakeupWaterMassFlow();
        this.makeupWater.massFlow = this.makeupWater.massFlow + ventedSteamAmount;
        this.makeupWater.energyFlow = this.makeupWater.massFlow * this.makeupWater.specificEnthalpy / 1000;
        this.calculateMakeupWaterVolumeFlow();
        this.calculateMakeupWaterAndCondensateHeader();
        this.calculateDearator();

        this.ventedLowPressureSteam = {
          pressure: this.lowPressureHeader.pressure,
          temperature: this.lowPressureHeader.temperature,
          specificEnthalpy: this.lowPressureHeader.specificEnthalpy,
          specificEntropy: this.lowPressureHeader.specificEntropy,
          quality: this.lowPressureHeader.quality,
          energyFlow: this.lowPressureHeader.energyFlow,
          specificVolume: this.lowPressureHeader.specificVolume,
          massFlow: ventedSteamAmount
        }
      }
    }
    if (Math.abs(steamBalance) > 1e-3) {
      //if balance is off by more than .0001, add or remove steam to the system
      this.calculateModel(this.boilerOutput.steamMassFlow + steamBalance);
    } else {
      return steamBalance;
    }
  }

  //Process Usage
  //for process usage we will have to work with Kristina on how to do conversions here.
  calculateHighPressureProcessUsage() {
    let processSteamUsageEnergyFlow: number = this.inputData.headerInput.highPressure.processSteamUsage * this.highPressureHeader.specificEnthalpy / 1000;
    let processUsage: number = (this.inputData.headerInput.highPressure.processSteamUsage) * (this.highPressureHeader.specificEnthalpy - this.highPressureCondensate.specificEnthalpy);
    processUsage = this.convertUnitsService.value(processUsage).from(this.settings.steamMassFlowMeasurement).to('kg');
    processUsage = this.convertUnitsService.value(processUsage).from(this.settings.steamSpecificEnthalpyMeasurement).to('kJkg');
    processUsage = this.convertUnitsService.value(processUsage).from('kJ').to(this.settings.steamEnergyMeasurement);
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

  calculateLowPressureVentedSteam(excessSteam: number): number {
    let mustVent: boolean = false;
    if (this.inputData.headerInput.numberOfHeaders > 1) {
      if (this.inputData.turbineInput.highToLowTurbine.useTurbine == true && this.inputData.turbineInput.highToLowTurbine.operationType != 2) {
        mustVent = true;
      }
      if (this.inputData.headerInput.numberOfHeaders == 3) {
        if (this.inputData.turbineInput.highToMediumTurbine.useTurbine == true && this.inputData.turbineInput.highToMediumTurbine.operationType != 2) {
          mustVent = true;
        }
        if (this.inputData.turbineInput.mediumToLowTurbine.useTurbine == true && this.inputData.turbineInput.mediumToLowTurbine.operationType != 2) {
          mustVent = true;
        }
      }
    }
    if (mustVent) {
      let ventedSteamAmount: number = (this.lowPressureHeader.massFlow) - (this.inputData.headerInput.lowPressure.processSteamUsage + this.deaeratorOutput.inletSteamMassFlow)
      this.makeupWater.massFlow = this.makeupWater.massFlow + ventedSteamAmount;
      this.makeupWater.energyFlow = this.makeupWater.massFlow * this.makeupWater.specificEnthalpy / 1000;
      this.calculateMakeupWaterVolumeFlow();
      this.calculateMakeupWaterAndCondensateHeader();
      this.calculateDearator();
      return ventedSteamAmount
    } else {
      return 0;
    }
  }

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
    this.powerGenerationCost = this.sitePowerImport * this.inputData.operationsInput.electricityCosts * this.inputData.operationsInput.operatingHoursPerYear;
  }

  calculatePowerImport(){
    if(this.isBaselineCalculation){
      this.sitePowerImport = this.inputData.operationsInput.sitePowerImport;
    }else{
      this.sitePowerImport = this.baselinePowerDemand - this.powerGenerated;
    }
  }

  calculatePowerDemand(){
    this.sitePowerDemand = this.sitePowerImport + this.powerGenerated;
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
    this.highPressureSteamHeatLoss = undefined;
    this.lowPressureSteamHeatLoss = undefined;
    this.mediumPressureSteamHeatLoss = undefined;
    this.powerGenerated = undefined;
    this.makeupWaterVolumeFlow = undefined;
    this.annualMakeupWaterFlow = undefined;
    this.totalOperatingCost = undefined;
    this.powerGenerationCost = undefined;
    this.boilerFuelCost = undefined;
    this.makeupWaterCost = undefined;
    this.boilerFuelUsage = undefined;
    this.ventedLowPressureSteam = undefined;
    this.sitePowerImport = undefined;
    this.sitePowerDemand = undefined;
  }

  getResultsObject(): SSMTOutput {
    let output: SSMTOutput = {
      boilerOutput: this.boilerOutput,

      highPressureHeader: this.highPressureHeader,
      highPressureSteamHeatLoss: this.highPressureSteamHeatLoss,
      lowPressurePRV: this.lowPressurePRV,
      highToMediumPressurePRV: this.highToMediumPressurePRV,

      highToLowPressureTurbine: this.highToLowPressureTurbine,
      highPressureToMediumPressureTurbine: this.highPressureToMediumPressureTurbine,
      highPressureCondensateFlashTank: this.highPressureCondensateFlashTank,

      lowPressureHeader: this.lowPressureHeader,
      lowPressureSteamHeatLoss: this.lowPressureSteamHeatLoss,

      mediumToLowPressureTurbine: this.mediumToLowPressureTurbine,
      mediumPressureCondensateFlashTank: this.mediumPressureCondensateFlashTank,

      mediumPressureHeader: this.mediumPressureHeader,
      mediumPressureSteamHeatLoss: this.mediumPressureSteamHeatLoss,

      blowdownFlashTank: this.blowdownFlashTank,

      highPressureCondensate: this.highPressureCondensate,
      lowPressureCondensate: this.lowPressureCondensate,
      mediumPressureCondensate: this.mediumPressureCondensate,
      combinedCondensate: this.combinedCondensate,
      returnCondensate: this.returnCondensate,
      condensateFlashTank: this.condensateFlashTank,

      makeupWater: this.makeupWater,
      makeupWaterAndCondensateHeader: this.makeupWaterAndCondensateHeader,

      condensingTurbine: this.condensingTurbine,
      deaeratorOutput: this.deaeratorOutput,

      highPressureProcessUsage: this.highPressureProcessUsage,
      mediumPressureProcessUsage: this.mediumPressureProcessUsage,
      lowPressureProcessUsage: this.lowPressureProcessUsage,

      powerGenerated: this.powerGenerated,
      boilerFuelCost: this.boilerFuelCost,
      makeupWaterCost: this.makeupWaterCost,
      totalOperatingCost: this.totalOperatingCost,
      totalEnergyUse: this.totalEnergyUse,
      powerGenerationCost: this.powerGenerationCost,
      boilerFuelUsage: this.boilerFuelUsage,

      makeupWaterVolumeFlow: this.makeupWaterVolumeFlow,
      annualMakeupWaterFlow: this.annualMakeupWaterFlow,

      ventedLowPressureSteam: this.ventedLowPressureSteam,
      heatExchangerOutput: this.heatExchangerOutput,
      marginalHPCost: 0,
      marginalMPCost: 0,
      marginalLPCost: 0,
      sitePowerImport: this.sitePowerImport,
      sitePowerDemand: this.sitePowerDemand
    }
    return output;
  }
}
