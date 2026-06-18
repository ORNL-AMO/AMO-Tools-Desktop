import { Injectable } from '@angular/core';
import { HeaderNotHighestPressure, HeaderWithHighestPressure, SSMTInputs } from '../shared/models/steam/ssmt';
import { BoilerInput, DeaeratorInput, FlashTankInput, HeaderInput, HeaderInputObj, HeatLossInput, PrvInput, SaturatedPropertiesInput, SteamPropertiesInput, TurbineInput } from '../shared/models/steam/steam-inputs';
import { SteamPropertiesOutput, SaturatedPropertiesOutput, BoilerOutput, DeaeratorOutput, FlashTankOutput, HeaderOutput, HeatLossOutput, PrvOutput, TurbineOutput, SSMTOutput, SSMTOperationsOutput, ProcessSteamUsage, HeatExchangerOutput as AppHeatExchangerOutput } from '../shared/models/steam/steam-outputs';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import {
  type Boiler as SuiteBoiler,
  type BoilerInput as SuiteBoilerInput,
  type CondensingTurbine as SuiteCondensingTurbine,
  type Deaerator as SuiteDeaerator,
  type EnergyAndCostCalculationsDomain,
  type FlashTank as SuiteFlashTank,
  type FluidProperties,
  type Header as SuiteHeader,
  type HeaderInput as SuiteHeaderInput,
  type HeaderNotHighestPressure as SuiteHeaderNotHighestPressure,
  type HeaderWithHighestPressure as SuiteHeaderWithHighestPressure,
  type HeatExchangerOutput as SuiteHeatExchangerOutput,
  type HeatLoss as SuiteHeatLoss,
  type HighPressureHeaderCalculationsDomain,
  type Inlet,
  type LowPressureFlashedSteamIntoHeaderCalculatorDomain,
  type LowPressureHeaderCalculationsDomain,
  type MakeupWaterAndCondensateHeaderCalculationsDomain,
  type MakeupWaterVolumeFlowCalculationsDomain,
  type MediumPressureHeaderCalculationsDomain,
  type OperationsInput as SuiteOperationsInput,
  type PowerBalanceCheckerCalculationsDomain,
  type PressureTurbine as SuitePressureTurbine,
  type PrvCastDesuperheating,
  type PrvWithDesuperheating,
  type PrvWithoutDesuperheating,
  type ProcessSteamUsage as SuiteProcessSteamUsage,
  type ProcessSteamUsageCalculationsDomain,
  type ReturnCondensateCalculationsDomain,
  type SaturatedPressure,
  type SaturatedProperties,
  type SaturatedPropertiesOutput as SuiteSaturatedPropertiesOutput,
  type SaturatedTemperature,
  type Solve,
  type SteamModeler,
  type SteamModelerInput,
  type SteamModelerOutput,
  type SteamProperties,
  type SteamPropertiesOutput as SuiteSteamPropertiesOutput,
  type ThermodynamicQuantity,
  type Turbine as SuiteTurbine,
  type TurbineInput as SuiteTurbineInput,
  type TurbineProperty,
} from 'measur-tools-suite';

type SuiteSteamPropertiesLike = (SuiteSteamPropertiesOutput | FluidProperties) & {
  massFlow?: number;
  energyFlow?: number;
};

@Injectable()
export class SteamSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService,
    private toolsSuiteApiService: ToolsSuiteApiService
  ) { }

  steamProperties(input: SteamPropertiesInput): SteamPropertiesOutput {
    let thermodynamicQuantityType: ThermodynamicQuantity = this.suiteApiHelperService.getThermodynamicQuantityType(input.thermodynamicQuantity)
    let SteamProperties: SteamProperties = new this.toolsSuiteApiService.ToolsSuiteModule.SteamProperties(
      input.pressure,
      thermodynamicQuantityType,
      input.quantityValue
    );
    let output: SuiteSteamPropertiesOutput = SteamProperties.calculate();
    let results: SteamPropertiesOutput = {
      pressure: output.pressure,
      temperature: output.temperature,
      specificEnthalpy: output.specificEnthalpy,
      specificEntropy: output.specificEntropy,
      quality: output.quality,
      specificVolume: output.specificVolume,
      massFlow: undefined,
      energyFlow: undefined,
    }
    SteamProperties.delete();
    output.delete();
    return results;
  }

  saturatedPropertiesGivenPressure(saturatedPropertiesInput: SaturatedPropertiesInput): SaturatedPropertiesOutput {

    let SaturatedTemperature: SaturatedTemperature = new this.toolsSuiteApiService.ToolsSuiteModule.SaturatedTemperature(saturatedPropertiesInput.saturatedPressure);
    let temperature: number = SaturatedTemperature.calculate();
    let SaturatedProperties: SaturatedProperties = new this.toolsSuiteApiService.ToolsSuiteModule.SaturatedProperties(saturatedPropertiesInput.saturatedPressure, temperature);
    let saturatedPropertiesOutput: SuiteSaturatedPropertiesOutput = SaturatedProperties.calculate();
    let results: SaturatedPropertiesOutput = {
      saturatedPressure: saturatedPropertiesOutput.saturatedPressure,
      saturatedTemperature: saturatedPropertiesOutput.saturatedTemperature,
      liquidEnthalpy: saturatedPropertiesOutput.liquidEnthalpy,
      gasEnthalpy: saturatedPropertiesOutput.gasEnthalpy,
      evaporationEnthalpy: saturatedPropertiesOutput.evaporationEnthalpy,
      liquidEntropy: saturatedPropertiesOutput.liquidEntropy,
      gasEntropy: saturatedPropertiesOutput.gasEntropy,
      evaporationEntropy: saturatedPropertiesOutput.evaporationEntropy,
      liquidVolume: saturatedPropertiesOutput.liquidVolume,
      gasVolume: saturatedPropertiesOutput.gasVolume,
      evaporationVolume: saturatedPropertiesOutput.evaporationVolume,
    }
    saturatedPropertiesOutput.delete();
    SaturatedTemperature.delete();
    SaturatedProperties.delete();
    return results;
  }

  saturatedPropertiesGivenTemperature(saturatedPropertiesInput: SaturatedPropertiesInput): SaturatedPropertiesOutput {

    let SaturatedPressure: SaturatedPressure = new this.toolsSuiteApiService.ToolsSuiteModule.SaturatedPressure(saturatedPropertiesInput.saturatedTemperature);
    let pressure: number = SaturatedPressure.calculate();
    let SaturatedProperties: SaturatedProperties = new this.toolsSuiteApiService.ToolsSuiteModule.SaturatedProperties(pressure, saturatedPropertiesInput.saturatedTemperature);
    let saturatedPropertiesOutput: SuiteSaturatedPropertiesOutput = SaturatedProperties.calculate();
    let results: SaturatedPropertiesOutput = {
      saturatedPressure: saturatedPropertiesOutput.saturatedPressure,
      saturatedTemperature: saturatedPropertiesOutput.saturatedTemperature,
      liquidEnthalpy: saturatedPropertiesOutput.liquidEnthalpy,
      gasEnthalpy: saturatedPropertiesOutput.gasEnthalpy,
      evaporationEnthalpy: saturatedPropertiesOutput.evaporationEnthalpy,
      liquidEntropy: saturatedPropertiesOutput.liquidEntropy,
      gasEntropy: saturatedPropertiesOutput.gasEntropy,
      evaporationEntropy: saturatedPropertiesOutput.evaporationEntropy,
      liquidVolume: saturatedPropertiesOutput.liquidVolume,
      gasVolume: saturatedPropertiesOutput.gasVolume,
      evaporationVolume: saturatedPropertiesOutput.evaporationVolume,
    }
    saturatedPropertiesOutput.delete();
    SaturatedPressure.delete();
    SaturatedProperties.delete();
    return results;
  }


  boiler(input: BoilerInput): BoilerOutput {
    let thermodynamicQuantityType: ThermodynamicQuantity = this.suiteApiHelperService.getThermodynamicQuantityType(input.thermodynamicQuantity)

    let Boiler: SuiteBoiler = new this.toolsSuiteApiService.ToolsSuiteModule.Boiler(
      input.deaeratorPressure,
      input.combustionEfficiency,
      input.blowdownRate,
      input.steamPressure,
      thermodynamicQuantityType,
      input.quantityValue,
      input.steamMassFlow
    );

    let output: BoilerOutput = this.getBoilerOutput(Boiler);

    Boiler.delete();
    return output;
  }

  deaerator(input: DeaeratorInput): DeaeratorOutput {
    let waterThermodynamicQuantityType: ThermodynamicQuantity = this.suiteApiHelperService.getThermodynamicQuantityType(input.waterThermodynamicQuantity)
    let steamThermodynamicQuantityType: ThermodynamicQuantity = this.suiteApiHelperService.getThermodynamicQuantityType(input.steamThermodynamicQuantity)


    let Deaerator: SuiteDeaerator = new this.toolsSuiteApiService.ToolsSuiteModule.Deaerator(
      input.deaeratorPressure,
      input.ventRate,
      input.feedwaterMassFlow,
      input.waterPressure,
      waterThermodynamicQuantityType,
      input.waterQuantityValue,
      input.steamPressure,
      steamThermodynamicQuantityType,
      input.steamQuantityValue
    );

    let output: DeaeratorOutput = this.getDeaeratorOutput(Deaerator);
    Deaerator.delete();
    return output;
  }

  flashTank(input: FlashTankInput): FlashTankOutput {
    let thermodynamicQuantityType: ThermodynamicQuantity = this.suiteApiHelperService.getThermodynamicQuantityType(input.thermodynamicQuantity)

    let FlashTank: SuiteFlashTank = new this.toolsSuiteApiService.ToolsSuiteModule.FlashTank(
      input.inletWaterPressure,
      thermodynamicQuantityType,
      input.quantityValue,
      input.inletWaterMassFlow,
      input.tankPressure
    );
    let output: FlashTankOutput = this.getFlashTankOutput(FlashTank);

    FlashTank.delete();
    return output;
  }

  header(input: HeaderInput): HeaderOutput {
    let inletArray: Array<Inlet> = this.getInletArray(input.inlets);

    let Header: SuiteHeader = new this.toolsSuiteApiService.ToolsSuiteModule.Header(input.headerPressure, inletArray);
    let HeaderProps: SuiteSteamPropertiesOutput = Header.getHeaderProperties();
    let headerProperties: SteamPropertiesOutput = this.getSteamPropertiesOutput(HeaderProps);
    headerProperties.energyFlow = Header.getInletEnergyFlow();
    headerProperties.massFlow = Header.getInletMassFlow();
    let Inlets: Array<Inlet> = Header.getInlets();
    let allInletProperties: Array<SteamPropertiesOutput> = new Array();
    for (let i: number = 0; i < Inlets.length; i++) {
      let inlet: Inlet = Inlets[i];
      let inletProperties: SuiteSteamPropertiesOutput = inlet.getInletProperties();
      let inletOutput: SteamPropertiesOutput = this.getSteamPropertiesOutput(inletProperties);
      inletOutput.energyFlow = inlet.getInletEnergyFlow();
      inletOutput.massFlow = inlet.getMassFlow();

      allInletProperties.push(inletOutput);
      inletProperties.delete();
      if (!inletArray.includes(inlet)) {
        inlet.delete();
      }
    }

    let output: HeaderOutput = {
      header: headerProperties,
      inlet1: allInletProperties[0],
      inlet2: allInletProperties[1],
      inlet3: allInletProperties[2],
      inlet4: allInletProperties[3],
      inlet5: allInletProperties[4],
      inlet6: allInletProperties[5],
      inlet7: allInletProperties[6],
      inlet8: allInletProperties[7],
      inlet9: allInletProperties[8],
    }
    HeaderProps.delete();
    Header.delete();
    inletArray.forEach(inlet => inlet.delete());

    return output;
  }

  heatLoss(input: HeatLossInput): HeatLossOutput {
    let thermodynamicQuantityType: ThermodynamicQuantity = this.suiteApiHelperService.getThermodynamicQuantityType(input.thermodynamicQuantity)

    let HeatLoss: SuiteHeatLoss = new this.toolsSuiteApiService.ToolsSuiteModule.HeatLoss(
      input.inletPressure,
      thermodynamicQuantityType,
      input.quantityValue,
      input.inletMassFlow,
      input.percentHeatLoss
    );
    let inletProperties: FluidProperties = HeatLoss.getInletProperties();
    let outletProperties: FluidProperties = HeatLoss.getOutletProperties();
    let heatLossOutput: HeatLossOutput = {
      heatLoss: HeatLoss.getHeatLoss(),
      inletEnergyFlow: inletProperties.energyFlow,
      inletMassFlow: inletProperties.massFlow,
      inletPressure: inletProperties.pressure,
      inletQuality: inletProperties.quality,
      inletSpecificEnthalpy: inletProperties.specificEnthalpy,
      inletSpecificEntropy: inletProperties.specificEntropy,
      inletTemperature: inletProperties.temperature,
      outletEnergyFlow: outletProperties.energyFlow,
      outletMassFlow: outletProperties.massFlow,
      outletPressure: outletProperties.pressure,
      outletQuality: outletProperties.quality,
      outletSpecificEnthalpy: outletProperties.specificEnthalpy,
      outletSpecificEntropy: outletProperties.specificEntropy,
      outletTemperature: outletProperties.temperature,
    }
    inletProperties.delete();
    outletProperties.delete();

    HeatLoss.delete();
    return heatLossOutput;
  }

  // inletMassFlow - should be set from inputs?
  prvWithoutDesuperheating(input: PrvInput): PrvOutput {
    let thermodynamicQuantityType: ThermodynamicQuantity = this.suiteApiHelperService.getThermodynamicQuantityType(input.thermodynamicQuantity)

    let prvWithoutDesuperheating: PrvWithoutDesuperheating = new this.toolsSuiteApiService.ToolsSuiteModule.PrvWithoutDesuperheating(
      input.inletPressure,
      thermodynamicQuantityType,
      input.quantityValue,
      input.inletMassFlow,
      input.outletPressure
    );

    let prvOutput: PrvOutput = this.getPRVOutput(prvWithoutDesuperheating, true);
    prvWithoutDesuperheating.delete();

    return prvOutput;
  }

  // inletMassFlow - should be set from inputs?
  prvWithDesuperheating(input: PrvInput): PrvOutput {
    let thermodynamicQuantityType: ThermodynamicQuantity = this.suiteApiHelperService.getThermodynamicQuantityType(input.thermodynamicQuantity);
    let feedwaterThermodynamicQuantityType: ThermodynamicQuantity = this.suiteApiHelperService.getThermodynamicQuantityType(input.feedwaterThermodynamicQuantity);

    let prvWithDesuperheating: PrvWithDesuperheating = new this.toolsSuiteApiService.ToolsSuiteModule.PrvWithDesuperheating(
      input.inletPressure,
      thermodynamicQuantityType,
      input.quantityValue,
      input.inletMassFlow,
      input.outletPressure,
      input.feedwaterPressure,
      feedwaterThermodynamicQuantityType,
      input.feedwaterQuantityValue,
      input.desuperheatingTemp
    );

    let prvOutput: PrvOutput = this.getPRVOutput(prvWithDesuperheating, true);
    prvWithDesuperheating.delete();

    return prvOutput;
  }

  turbine(input: TurbineInput): TurbineOutput {
    let solveForMethod: Solve = this.suiteApiHelperService.getSolveForMethod(input.solveFor)
    let inletThermodynamicQuantityType: ThermodynamicQuantity = this.suiteApiHelperService.getThermodynamicQuantityType(input.inletQuantity);
    let turbineProperty: TurbineProperty = this.suiteApiHelperService.getTurbineProperty(input.turbineProperty);

    let Turbine: SuiteTurbine;
    if (input.solveFor == 0) {
      Turbine = new this.toolsSuiteApiService.ToolsSuiteModule.Turbine(
        solveForMethod,
        input.inletPressure,
        inletThermodynamicQuantityType,
        input.inletQuantityValue,
        turbineProperty,
        input.isentropicEfficiency,
        input.generatorEfficiency,
        input.massFlowOrPowerOut,
        input.outletSteamPressure
      );
    } else {
      let outletThermodynamicQuantityType: ThermodynamicQuantity = this.suiteApiHelperService.getThermodynamicQuantityType(input.outletQuantity);
      Turbine = new this.toolsSuiteApiService.ToolsSuiteModule.Turbine(
        solveForMethod,
        input.inletPressure,
        inletThermodynamicQuantityType,
        input.inletQuantityValue,
        turbineProperty,
        input.generatorEfficiency,
        input.massFlowOrPowerOut,
        input.outletSteamPressure,
        outletThermodynamicQuantityType,
        input.outletQuantityValue
      );

    }
    let turbineOutput: TurbineOutput = this.getTurbineOutput(Turbine);

    Turbine.delete();
    return turbineOutput;
  }

  steamModeler(inputData: SSMTInputs): SSMTOutput {
    let ssmtOutput: SSMTOutput;


    this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.boilerInput);
    let boilerInputObj: SuiteBoilerInput = new this.toolsSuiteApiService.ToolsSuiteModule.BoilerInput(
      inputData.boilerInput.fuelType,
      inputData.boilerInput.fuel,
      inputData.boilerInput.combustionEfficiency,
      inputData.boilerInput.blowdownRate,
      inputData.boilerInput.blowdownFlashed,
      inputData.boilerInput.preheatMakeupWater,
      inputData.boilerInput.steamTemperature,
      inputData.boilerInput.deaeratorVentRate,
      inputData.boilerInput.deaeratorPressure,
      inputData.boilerInput.approachTemperature
    );


    let highPressureHeaderObj: SuiteHeaderWithHighestPressure;
    if (inputData.headerInput.highPressureHeader) {
      this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.headerInput.highPressureHeader);
      highPressureHeaderObj = this.getHighPressureHeaderObject(inputData.headerInput.highPressureHeader);
    } else {
      this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.headerInput.highPressure);
      highPressureHeaderObj = this.getHighPressureHeaderObject(inputData.headerInput.highPressure);
    }

    let operationsInputObj: SuiteOperationsInput = new this.toolsSuiteApiService.ToolsSuiteModule.OperationsInput(
      inputData.operationsInput.sitePowerImport,
      inputData.operationsInput.makeUpWaterTemperature,
      inputData.operationsInput.operatingHoursPerYear,
      inputData.operationsInput.fuelCosts,
      inputData.operationsInput.electricityCosts,
      inputData.operationsInput.makeUpWaterCosts
    );

    inputData.turbineInput.condensingTurbine.operationType = this.suiteApiHelperService.getCondensingTurbineOperation(inputData.turbineInput.condensingTurbine.operationType);
    inputData.turbineInput.highToLowTurbine.operationType = this.suiteApiHelperService.getPressureTurbineOperation(inputData.turbineInput.highToLowTurbine.operationType);
    inputData.turbineInput.highToMediumTurbine.operationType = this.suiteApiHelperService.getPressureTurbineOperation(inputData.turbineInput.highToMediumTurbine.operationType);
    inputData.turbineInput.mediumToLowTurbine.operationType = this.suiteApiHelperService.getPressureTurbineOperation(inputData.turbineInput.mediumToLowTurbine.operationType);


    let mediumPressureHeaderObj: SuiteHeaderNotHighestPressure = null;
    if (inputData.headerInput.mediumPressureHeader !== null && inputData.headerInput.mediumPressureHeader !== undefined) {
      this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.headerInput.mediumPressureHeader);
      mediumPressureHeaderObj = this.getNotHighPressureHeaderObject(inputData.headerInput.mediumPressureHeader);
    } else if (inputData.headerInput.mediumPressure !== null && inputData.headerInput.mediumPressure !== undefined) {
      this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.headerInput.mediumPressure);
      mediumPressureHeaderObj = this.getNotHighPressureHeaderObject(inputData.headerInput.mediumPressure);
    }
    let lowPressureHeaderObj: SuiteHeaderNotHighestPressure = null;
    if (inputData.headerInput.lowPressureHeader !== null && inputData.headerInput.lowPressureHeader !== undefined) {
      this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.headerInput.lowPressureHeader);
      lowPressureHeaderObj = this.getNotHighPressureHeaderObject(inputData.headerInput.lowPressureHeader);
    } else if (inputData.headerInput.lowPressure !== null && inputData.headerInput.lowPressure !== undefined) {
      this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.headerInput.lowPressure);
      lowPressureHeaderObj = this.getNotHighPressureHeaderObject(inputData.headerInput.lowPressure);
    }

    let headerInputObj: SuiteHeaderInput = new this.toolsSuiteApiService.ToolsSuiteModule.HeaderInput(highPressureHeaderObj, mediumPressureHeaderObj, lowPressureHeaderObj);
    if (mediumPressureHeaderObj) {
      mediumPressureHeaderObj.delete();
    }
    if (lowPressureHeaderObj) {
      lowPressureHeaderObj.delete();
    }

    this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.turbineInput.condensingTurbine);
    let condensingTurbineObj: SuiteCondensingTurbine = new this.toolsSuiteApiService.ToolsSuiteModule.CondensingTurbine(
      inputData.turbineInput.condensingTurbine.isentropicEfficiency,
      inputData.turbineInput.condensingTurbine.generationEfficiency,
      inputData.turbineInput.condensingTurbine.condenserPressure,
      inputData.turbineInput.condensingTurbine.operationType,
      inputData.turbineInput.condensingTurbine.operationValue,
      inputData.turbineInput.condensingTurbine.useTurbine
    );
    this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.turbineInput.highToLowTurbine);
    let highToLowTurbineObj: SuitePressureTurbine = new this.toolsSuiteApiService.ToolsSuiteModule.PressureTurbine(
      inputData.turbineInput.highToLowTurbine.isentropicEfficiency,
      inputData.turbineInput.highToLowTurbine.generationEfficiency,
      inputData.turbineInput.highToLowTurbine.operationType,
      inputData.turbineInput.highToLowTurbine.operationValue1,
      inputData.turbineInput.highToLowTurbine.operationValue2,
      inputData.turbineInput.highToLowTurbine.useTurbine
    );
    this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.turbineInput.highToMediumTurbine);
    let highToMediumTurbineObj: SuitePressureTurbine = new this.toolsSuiteApiService.ToolsSuiteModule.PressureTurbine(
      inputData.turbineInput.highToMediumTurbine.isentropicEfficiency,
      inputData.turbineInput.highToMediumTurbine.generationEfficiency,
      inputData.turbineInput.highToMediumTurbine.operationType,
      inputData.turbineInput.highToMediumTurbine.operationValue1,
      inputData.turbineInput.highToMediumTurbine.operationValue2,
      inputData.turbineInput.highToMediumTurbine.useTurbine
    );
    this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.turbineInput.mediumToLowTurbine);
    let mediumToLowTurbineObj: SuitePressureTurbine = new this.toolsSuiteApiService.ToolsSuiteModule.PressureTurbine(
      inputData.turbineInput.mediumToLowTurbine.isentropicEfficiency,
      inputData.turbineInput.mediumToLowTurbine.generationEfficiency,
      inputData.turbineInput.mediumToLowTurbine.operationType,
      inputData.turbineInput.mediumToLowTurbine.operationValue1,
      inputData.turbineInput.mediumToLowTurbine.operationValue2,
      inputData.turbineInput.mediumToLowTurbine.useTurbine
    );

    let turbineInputObj: SuiteTurbineInput = new this.toolsSuiteApiService.ToolsSuiteModule.TurbineInput(
      condensingTurbineObj,
      highToLowTurbineObj,
      highToMediumTurbineObj,
      mediumToLowTurbineObj
    );

    let steamModelerInput: SteamModelerInput = new this.toolsSuiteApiService.ToolsSuiteModule.SteamModelerInput(
      inputData.isBaselineCalc,
      inputData.baselinePowerDemand,
      boilerInputObj,
      headerInputObj,
      operationsInputObj,
      turbineInputObj
    );

    let modeler: SteamModeler = new this.toolsSuiteApiService.ToolsSuiteModule.SteamModeler();
    let wasmOutput: SteamModelerOutput = modeler.model(steamModelerInput);
    ssmtOutput = this.getSSMTOutputFromWASMOutput(wasmOutput);

    wasmOutput.delete();
    modeler.delete();
    boilerInputObj.delete();
    highPressureHeaderObj.delete();
    headerInputObj.delete();
    operationsInputObj.delete();
    condensingTurbineObj.delete();
    highToLowTurbineObj.delete();
    highToMediumTurbineObj.delete();
    mediumToLowTurbineObj.delete();
    turbineInputObj.delete();
    steamModelerInput.delete();

    return ssmtOutput;
  }

  getSSMTOutputFromWASMOutput(wasmOutput: SteamModelerOutput): SSMTOutput {
    let ssmtOutput: SSMTOutput = {
      boilerOutput: undefined,
      highPressureHeaderSteam: undefined,
      highPressureSteamHeatLoss: undefined,
      mediumPressureToLowPressurePrv: undefined,
      highPressureToMediumPressurePrv: undefined,
      highPressureToLowPressureTurbine: undefined,
      highPressureToLowPressureTurbineIdeal: undefined,
      highPressureToMediumPressureTurbine: undefined,
      highPressureToMediumPressureTurbineIdeal: undefined,
      highPressureCondensateFlashTank: undefined,
      lowPressureHeaderSteam: undefined,
      lowPressureSteamHeatLoss: undefined,
      mediumPressureToLowPressureTurbine: undefined,
      mediumPressureToLowPressureTurbineIdeal: undefined,
      mediumPressureCondensateFlashTank: undefined,
      mediumPressureHeaderSteam: undefined,
      mediumPressureSteamHeatLoss: undefined,
      blowdownFlashTank: undefined,
      highPressureCondensate: undefined,
      lowPressureCondensate: undefined,
      mediumPressureCondensate: undefined,
      combinedCondensate: undefined,
      returnCondensate: undefined,
      condensateFlashTank: undefined,
      makeupWater: undefined,
      makeupWaterAndCondensate: undefined,
      condensingTurbine: undefined,
      condensingTurbineIdeal: undefined,
      deaeratorOutput: undefined,
      highPressureProcessSteamUsage: undefined,
      mediumPressureProcessSteamUsage: undefined,
      lowPressureProcessSteamUsage: undefined,

      // Set after API call?
      // powerGenerated: number;
      // boilerFuelCost: number;
      // makeupWaterCost: number;
      // totalOperatingCost: number;
      // powerGenerationCost: number;
      //boilerFuelUsage: number;
      // annualMakeupWaterFlow: number; 
      marginalHPCost: undefined,
      marginalMPCost: undefined,
      marginalLPCost: undefined,
      lowPressureVentedSteam: undefined,
      heatExchanger: undefined,
      operationsOutput: undefined,
    }

    let boiler: SuiteBoiler = wasmOutput.boiler;
    ssmtOutput.boilerOutput = this.getBoilerOutput(boiler);
    boiler.delete();


    let highPressureHeaderCalculationsDomain: HighPressureHeaderCalculationsDomain = wasmOutput.highPressureHeaderCalculationsDomain;
    let highPressureHeaderOutput: FluidProperties = highPressureHeaderCalculationsDomain.highPressureHeaderOutput;
    ssmtOutput.highPressureHeaderSteam = this.getSteamPropertiesOutput(highPressureHeaderOutput);
    highPressureHeaderOutput.delete();


    let blowdownFlashTank: SuiteFlashTank = wasmOutput.blowdownFlashTank;
    ssmtOutput.blowdownFlashTank = this.getFlashTankOutput(blowdownFlashTank);
    if (blowdownFlashTank) {
      blowdownFlashTank.delete();
    }

    let deaerator: SuiteDeaerator = wasmOutput.deaerator;
    ssmtOutput.deaeratorOutput = this.getDeaeratorOutput(deaerator);
    deaerator.delete();

    let powerBalanceCheckerCalculationsDomain: PowerBalanceCheckerCalculationsDomain = wasmOutput.powerBalanceCheckerCalculationsDomain;
    if (powerBalanceCheckerCalculationsDomain) {
      let lowPressureVentedSteam: FluidProperties = powerBalanceCheckerCalculationsDomain.lowPressureVentedSteam;
      ssmtOutput.lowPressureVentedSteam = this.getSteamPropertiesOutput(lowPressureVentedSteam);
      if (lowPressureVentedSteam) {
        lowPressureVentedSteam.delete();
      }
      powerBalanceCheckerCalculationsDomain.delete();
    }

    if (highPressureHeaderCalculationsDomain) {
      let highPressureHeaderHeatLoss: SuiteHeatLoss = highPressureHeaderCalculationsDomain.highPressureHeaderHeatLoss;
      ssmtOutput.highPressureSteamHeatLoss = this.getHeatLoss(highPressureHeaderHeatLoss);
      if (highPressureHeaderHeatLoss) {
        highPressureHeaderHeatLoss.delete();
      }

      let highToLowPressureTurbine: SuiteTurbine = highPressureHeaderCalculationsDomain.highToLowPressureTurbine;
      ssmtOutput.highPressureToLowPressureTurbine = this.getTurbineOutput(highToLowPressureTurbine);
      if (highToLowPressureTurbine) {
        highToLowPressureTurbine.delete();
      }

      let highToLowPressureTurbineIdeal: SuiteTurbine = highPressureHeaderCalculationsDomain.highToLowPressureTurbineIdeal;
      ssmtOutput.highPressureToLowPressureTurbineIdeal = this.getTurbineOutput(highToLowPressureTurbineIdeal);
      if (highToLowPressureTurbineIdeal) {
        highToLowPressureTurbineIdeal.delete();
      }

      let highToMediumPressureTurbine: SuiteTurbine = highPressureHeaderCalculationsDomain.highToMediumPressureTurbine;
      ssmtOutput.highPressureToMediumPressureTurbine = this.getTurbineOutput(highToMediumPressureTurbine);
      if (highToMediumPressureTurbine) {
        highToMediumPressureTurbine.delete();
      }

      let highToMediumPressureTurbineIdeal: SuiteTurbine = highPressureHeaderCalculationsDomain.highToMediumPressureTurbineIdeal;
      ssmtOutput.highPressureToMediumPressureTurbineIdeal = this.getTurbineOutput(highToMediumPressureTurbineIdeal);
      if (highToMediumPressureTurbineIdeal) {
        highToMediumPressureTurbineIdeal.delete();
      }

      let highPressureCondensateFlashTank: SuiteFlashTank = highPressureHeaderCalculationsDomain.highPressureCondensateFlashTank
      ssmtOutput.highPressureCondensateFlashTank = this.getFlashTankOutput(highPressureCondensateFlashTank);
      if (highPressureCondensateFlashTank) {
        highPressureCondensateFlashTank.delete();
      }

      let highPressureCondensate: FluidProperties = highPressureHeaderCalculationsDomain.highPressureCondensate;
      ssmtOutput.highPressureCondensate = this.getSteamPropertiesOutput(highPressureCondensate);
      if (highPressureCondensate) {
        highPressureCondensate.delete();
      }

      let condensingTurbine: SuiteTurbine = highPressureHeaderCalculationsDomain.condensingTurbine;
      ssmtOutput.condensingTurbine = this.getTurbineOutput(condensingTurbine);
      if (condensingTurbine) {
        condensingTurbine.delete();
      }

      let condensingTurbineIdeal: SuiteTurbine = highPressureHeaderCalculationsDomain.condensingTurbineIdeal;
      ssmtOutput.condensingTurbineIdeal = this.getTurbineOutput(condensingTurbineIdeal);
      if (condensingTurbineIdeal) {
        condensingTurbineIdeal.delete();
      }

      highPressureHeaderCalculationsDomain.delete();
    }


    let lowPressureHeaderCalculationsDomain: LowPressureHeaderCalculationsDomain = wasmOutput.lowPressureHeaderCalculationsDomain;
    if (lowPressureHeaderCalculationsDomain) {
      let lowPressureHeaderOutput: FluidProperties = lowPressureHeaderCalculationsDomain.lowPressureHeaderOutput;
      ssmtOutput.lowPressureHeaderSteam = this.getSteamPropertiesOutput(lowPressureHeaderOutput);
      if (lowPressureHeaderOutput) {
        lowPressureHeaderOutput.delete();
      }

      let lowPressureHeaderHeatLoss: SuiteHeatLoss = lowPressureHeaderCalculationsDomain.lowPressureHeaderHeatLoss;
      ssmtOutput.lowPressureSteamHeatLoss = this.getHeatLoss(lowPressureHeaderHeatLoss);
      if (lowPressureHeaderHeatLoss) {
        lowPressureHeaderHeatLoss.delete();
      }

      let lowPressurePrv: PrvWithoutDesuperheating = lowPressureHeaderCalculationsDomain.lowPressurePrv;
      ssmtOutput.mediumPressureToLowPressurePrv = this.getPRVOutput(lowPressurePrv, false);
      if (lowPressurePrv) {
        lowPressurePrv.delete();
      }

      let lowPressureCondensate: FluidProperties = lowPressureHeaderCalculationsDomain.lowPressureCondensate;
      ssmtOutput.lowPressureCondensate = this.getSteamPropertiesOutput(lowPressureCondensate);
      if (lowPressureCondensate) {
        lowPressureCondensate.delete();
      }

      let lowPressureFlashedSteamIntoHeaderCalculatorDomain: LowPressureFlashedSteamIntoHeaderCalculatorDomain = lowPressureHeaderCalculationsDomain.lowPressureFlashedSteamIntoHeaderCalculatorDomain;
      if (lowPressureFlashedSteamIntoHeaderCalculatorDomain) {
        let mediumPressureCondensateFlashTank: SuiteFlashTank = lowPressureFlashedSteamIntoHeaderCalculatorDomain.mediumPressureCondensateFlashTank;
        ssmtOutput.mediumPressureCondensateFlashTank = this.getFlashTankOutput(mediumPressureCondensateFlashTank);
        if (mediumPressureCondensateFlashTank) {
          mediumPressureCondensateFlashTank.delete();
        }
  
        lowPressureFlashedSteamIntoHeaderCalculatorDomain.delete();
      }

      lowPressureHeaderCalculationsDomain.delete();
    }

    let mediumPressureHeaderCalculationsDomain: MediumPressureHeaderCalculationsDomain = wasmOutput.mediumPressureHeaderCalculationsDomain;
    if (mediumPressureHeaderCalculationsDomain) {
      let highToMediumPressurePrv: PrvWithoutDesuperheating = mediumPressureHeaderCalculationsDomain.highToMediumPressurePrv;
      ssmtOutput.highPressureToMediumPressurePrv = this.getPRVOutput(highToMediumPressurePrv, false);
      if (highToMediumPressurePrv) {
        highToMediumPressurePrv.delete();
      }

      let mediumToLowPressureTurbine: SuiteTurbine = mediumPressureHeaderCalculationsDomain.mediumToLowPressureTurbine
      ssmtOutput.mediumPressureToLowPressureTurbine = this.getTurbineOutput(mediumToLowPressureTurbine);
      if (mediumToLowPressureTurbine) {
        mediumToLowPressureTurbine.delete();
      }

      let mediumToLowPressureTurbineIdeal: SuiteTurbine = mediumPressureHeaderCalculationsDomain.mediumToLowPressureTurbineIdeal;
      ssmtOutput.mediumPressureToLowPressureTurbineIdeal = this.getTurbineOutput(mediumToLowPressureTurbineIdeal);
      if (mediumToLowPressureTurbineIdeal) {
        mediumToLowPressureTurbineIdeal.delete();
      }

      let mediumPressureHeaderOutput: FluidProperties = mediumPressureHeaderCalculationsDomain.mediumPressureHeaderOutput
      ssmtOutput.mediumPressureHeaderSteam = this.getSteamPropertiesOutput(mediumPressureHeaderOutput);
      if (mediumPressureHeaderOutput) {
        mediumPressureHeaderOutput.delete();
      }

      let mediumPressureHeaderHeatLoss: SuiteHeatLoss = mediumPressureHeaderCalculationsDomain.mediumPressureHeaderHeatLoss;
      ssmtOutput.mediumPressureSteamHeatLoss = this.getHeatLoss(mediumPressureHeaderHeatLoss);
      if (mediumPressureHeaderHeatLoss) {
        mediumPressureHeaderHeatLoss.delete();
      }

      let mediumPressureCondensate: FluidProperties = mediumPressureHeaderCalculationsDomain.mediumPressureCondensate;
      ssmtOutput.mediumPressureCondensate = this.getSteamPropertiesOutput(mediumPressureCondensate);
      if (mediumPressureCondensate) {
        mediumPressureCondensate.delete();
      }

      mediumPressureHeaderCalculationsDomain.delete();
    }



    let operationsOutput: SSMTOperationsOutput;

    let energyAndCostCalculationsDomain: EnergyAndCostCalculationsDomain = wasmOutput.energyAndCostCalculationsDomain;
    if (!energyAndCostCalculationsDomain) {
      operationsOutput = {
        powerGenerated: undefined,
        boilerFuelCost: undefined,
        makeupWaterCost: undefined,
        totalOperatingCost: undefined,
        powerGenerationCost: undefined,
        boilerFuelUsage: undefined,
        sitePowerImport: undefined,
        sitePowerDemand: undefined,
        makeupWaterVolumeFlow: undefined,
        makeupWaterVolumeFlowAnnual: undefined
      }
    } else {
      operationsOutput = {
        powerGenerated: energyAndCostCalculationsDomain.powerGenerated,
        boilerFuelCost: energyAndCostCalculationsDomain.boilerFuelCost,
        makeupWaterCost: energyAndCostCalculationsDomain.makeupWaterCost,
        totalOperatingCost: energyAndCostCalculationsDomain.totalOperatingCost,
        powerGenerationCost: energyAndCostCalculationsDomain.powerGenerationCost,
        boilerFuelUsage: energyAndCostCalculationsDomain.boilerFuelUsage,
        sitePowerImport: energyAndCostCalculationsDomain.sitePowerImport,
        sitePowerDemand: energyAndCostCalculationsDomain.powerDemand,
        makeupWaterVolumeFlow: undefined,
        makeupWaterVolumeFlowAnnual: undefined
      }
      energyAndCostCalculationsDomain.delete();
    }

    let makeupWaterAndCondensateHeaderCalculationsDomain: MakeupWaterAndCondensateHeaderCalculationsDomain = wasmOutput.makeupWaterAndCondensateHeaderCalculationsDomain;
    if (makeupWaterAndCondensateHeaderCalculationsDomain) {
      let combinedCondensate: FluidProperties = makeupWaterAndCondensateHeaderCalculationsDomain.combinedCondensate;
      ssmtOutput.combinedCondensate = this.getSteamPropertiesOutput(combinedCondensate);
      if (combinedCondensate) {
        combinedCondensate.delete();
      }

      let returnCondensate: FluidProperties = makeupWaterAndCondensateHeaderCalculationsDomain.returnCondensate;
      ssmtOutput.returnCondensate = this.getSteamPropertiesOutput(returnCondensate);
      if (returnCondensate) {
        returnCondensate.delete();
      }

      let returnCondensateCalculationsDomain: ReturnCondensateCalculationsDomain = makeupWaterAndCondensateHeaderCalculationsDomain.returnCondensateCalculationsDomain;

      if (returnCondensateCalculationsDomain) {
        let condensateFlashTank: SuiteFlashTank = returnCondensateCalculationsDomain.condensateFlashTank;
        ssmtOutput.condensateFlashTank = this.getFlashTankOutput(condensateFlashTank);
        if (condensateFlashTank) {
          condensateFlashTank.delete();
        }
        returnCondensateCalculationsDomain.delete();
      }

      let makeupWater: FluidProperties = makeupWaterAndCondensateHeaderCalculationsDomain.makeupWater;
      ssmtOutput.makeupWater = this.getSteamPropertiesOutput(makeupWater);
      if (makeupWater) {
        makeupWater.delete();
      }

      let makeupWaterAndCondensateHeaderOutput: FluidProperties = makeupWaterAndCondensateHeaderCalculationsDomain.makeupWaterAndCondensateHeaderOutput;
      ssmtOutput.makeupWaterAndCondensate = this.getSteamPropertiesOutput(makeupWaterAndCondensateHeaderOutput);
      if (makeupWaterAndCondensateHeaderOutput) {
        makeupWaterAndCondensateHeaderOutput.delete();
      }

      let heatExchangerOutput: SuiteHeatExchangerOutput = makeupWaterAndCondensateHeaderCalculationsDomain.heatExchangerOutput;
      ssmtOutput.heatExchanger = this.getHeatExchangerOutput(heatExchangerOutput);
      if (heatExchangerOutput) {
        heatExchangerOutput.delete();
      }

      let makeupWaterVolumeFlowCalculationsDomain: MakeupWaterVolumeFlowCalculationsDomain = makeupWaterAndCondensateHeaderCalculationsDomain.makeupWaterVolumeFlowCalculationsDomain
      if (makeupWaterVolumeFlowCalculationsDomain) {
        operationsOutput.makeupWaterVolumeFlow = makeupWaterVolumeFlowCalculationsDomain.makeupWaterVolumeFlow;
        operationsOutput.makeupWaterVolumeFlowAnnual = makeupWaterVolumeFlowCalculationsDomain.makeupWaterVolumeFlowAnnual;
        makeupWaterVolumeFlowCalculationsDomain.delete();
      }

      makeupWaterAndCondensateHeaderCalculationsDomain.delete();
    }

    ssmtOutput.operationsOutput = operationsOutput;
    let processSteamUsageCalculationsDomain: ProcessSteamUsageCalculationsDomain = wasmOutput.processSteamUsageCalculationsDomain;
    if (processSteamUsageCalculationsDomain) {
      let highPressureProcessSteamUsage: SuiteProcessSteamUsage = processSteamUsageCalculationsDomain.highPressureProcessSteamUsage
      ssmtOutput.highPressureProcessSteamUsage = this.getProcessSteamUsage(highPressureProcessSteamUsage);
      if (highPressureProcessSteamUsage) {
        highPressureProcessSteamUsage.delete();
      }

      let mediumPressureProcessUsagePtr: SuiteProcessSteamUsage = processSteamUsageCalculationsDomain.mediumPressureProcessUsagePtr;
      ssmtOutput.mediumPressureProcessSteamUsage = this.getProcessSteamUsage(mediumPressureProcessUsagePtr);
      if (mediumPressureProcessUsagePtr) {
        mediumPressureProcessUsagePtr.delete();
      }

      let lowPressureProcessUsagePtr: SuiteProcessSteamUsage = processSteamUsageCalculationsDomain.lowPressureProcessUsagePtr;
      ssmtOutput.lowPressureProcessSteamUsage = this.getProcessSteamUsage(lowPressureProcessUsagePtr);
      if (lowPressureProcessUsagePtr) {
        lowPressureProcessUsagePtr.delete();
      }
      processSteamUsageCalculationsDomain.delete();
    }
    return ssmtOutput;
  }

  getSteamPropertiesOutput(properties: SuiteSteamPropertiesLike): SteamPropertiesOutput {
    if (properties) {
      return {
        pressure: properties.pressure,
        temperature: properties.temperature,
        specificEnthalpy: properties.specificEnthalpy,
        specificEntropy: properties.specificEntropy,
        quality: properties.quality,
        specificVolume: properties.specificVolume,
        massFlow: properties.massFlow,
        energyFlow: properties.energyFlow,
      }
    } else {
      return {
        pressure: undefined,
        temperature: undefined,
        specificEnthalpy: undefined,
        specificEntropy: undefined,
        quality: undefined,
        specificVolume: undefined,
        massFlow: undefined,
        energyFlow: undefined,
      }
    }
  }

  getProcessSteamUsage(processUsage: SuiteProcessSteamUsage): ProcessSteamUsage {
    if (processUsage) {
      return {
        pressure: processUsage.pressure,
        temperature: processUsage.temperature,
        massFlow: processUsage.massFlow,
        energyFlow: processUsage.energyFlow,
        processUsage: processUsage.processUsage,
      }
    } else {
      return {
        pressure: undefined,
        temperature: undefined,
        massFlow: undefined,
        energyFlow: undefined,
        processUsage: undefined,
      }
    }
  }

  getHeatExchangerOutput(heatExchanger: SuiteHeatExchangerOutput): AppHeatExchangerOutput {
    if (heatExchanger) {
      return {
        hotOutletMassFlow: heatExchanger.hotOutlet.massFlow,
        hotOutletEnergyFlow: heatExchanger.hotOutlet.energyFlow,
        hotOutletTemperature: heatExchanger.hotOutlet.temperature,
        hotOutletPressure: heatExchanger.hotOutlet.pressure,
        hotOutletQuality: heatExchanger.hotOutlet.quality,
        hotOutletVolume: heatExchanger.hotOutlet.specificVolume,
        hotOutletDensity: heatExchanger.hotOutlet.density,
        hotOutletSpecificEnthalpy: heatExchanger.hotOutlet.specificEnthalpy,
        hotOutletSpecificEntropy: heatExchanger.hotOutlet.specificEntropy,
        coldOutletMassFlow: heatExchanger.coldOutlet.massFlow,
        coldOutletEnergyFlow: heatExchanger.coldOutlet.energyFlow,
        coldOutletTemperature: heatExchanger.coldOutlet.temperature,
        coldOutletPressure: heatExchanger.coldOutlet.pressure,
        coldOutletQuality: heatExchanger.coldOutlet.quality,
        coldOutletVolume: heatExchanger.coldOutlet.specificVolume,
        coldOutletDensity: heatExchanger.coldOutlet.density,
        coldOutletSpecificEnthalpy: heatExchanger.coldOutlet.specificEnthalpy,
        coldOutletSpecificEntropy: heatExchanger.coldOutlet.specificEntropy,
      }
    } else {
      return {
        hotOutletMassFlow: undefined,
        hotOutletEnergyFlow: undefined,
        hotOutletTemperature: undefined,
        hotOutletPressure: undefined,
        hotOutletQuality: undefined,
        hotOutletVolume: undefined,
        hotOutletDensity: undefined,
        hotOutletSpecificEnthalpy: undefined,
        hotOutletSpecificEntropy: undefined,
        coldOutletMassFlow: undefined,
        coldOutletEnergyFlow: undefined,
        coldOutletTemperature: undefined,
        coldOutletPressure: undefined,
        coldOutletQuality: undefined,
        coldOutletVolume: undefined,
        coldOutletDensity: undefined,
        coldOutletSpecificEnthalpy: undefined,
        coldOutletSpecificEntropy: undefined,
      }
    }
  }

  getTurbineOutput(Turbine: SuiteTurbine): TurbineOutput {
    let turbineOutput: TurbineOutput = {
      energyOut: undefined,
      generatorEfficiency: undefined,
      inletEnergyFlow: undefined,
      inletPressure: undefined,
      inletQuality: undefined,
      inletSpecificEnthalpy: undefined,
      inletSpecificEntropy: undefined,
      inletTemperature: undefined,
      isentropicEfficiency: undefined,
      inletVolume: undefined,
      massFlow: undefined,
      outletEnergyFlow: undefined,
      outletPressure: undefined,
      outletQuality: undefined,
      outletVolume: undefined,
      outletSpecificEnthalpy: undefined,
      outletSpecificEntropy: undefined,
      outletTemperature: undefined,
      outletIdealPressure: undefined,
      outletIdealTemperature: undefined,
      outletIdealSpecificEnthalpy: undefined,
      outletIdealSpecificEntropy: undefined,
      outletIdealQuality: undefined,
      outletIdealVolume: undefined,
      powerOut: undefined,
    };
    if (Turbine) {
      let inletProperties: SuiteSteamPropertiesOutput = Turbine.getInletProperties();
      let outletProperties: SuiteSteamPropertiesOutput = Turbine.getOutletProperties();
      let massFlow: number = Turbine.getMassFlow();
      let isentropicEfficiency: number = Turbine.getIsentropicEfficiency();
      let energyOut: number = Turbine.getEnergyOut();
      let powerOut: number = Turbine.getPowerOut();
      let generatorEfficiency: number = Turbine.getGeneratorEfficiency();

      turbineOutput = {
        energyOut: energyOut,
        generatorEfficiency: generatorEfficiency,
        inletEnergyFlow: Turbine.getInletEnergyFlow(),
        inletPressure: inletProperties.pressure,
        inletQuality: inletProperties.quality,
        inletSpecificEnthalpy: inletProperties.specificEnthalpy,
        inletSpecificEntropy: inletProperties.specificEntropy,
        inletTemperature: inletProperties.temperature,
        isentropicEfficiency: isentropicEfficiency,
        massFlow: massFlow,
        outletEnergyFlow: Turbine.getOutletEnergyFlow(),
        outletPressure: outletProperties.pressure,
        outletQuality: outletProperties.quality,
        outletVolume: undefined,
        outletSpecificEnthalpy: outletProperties.specificEnthalpy,
        outletSpecificEntropy: outletProperties.specificEntropy,
        outletTemperature: outletProperties.temperature,
        outletIdealPressure: undefined,
        outletIdealTemperature: undefined,
        outletIdealSpecificEnthalpy: undefined,
        outletIdealSpecificEntropy: undefined,
        outletIdealQuality: undefined,
        outletIdealVolume: undefined,
        powerOut: powerOut
      }
      inletProperties.delete();
      outletProperties.delete();
    }
    return turbineOutput;
  }


  getHighPressureHeaderObject(header: HeaderWithHighestPressure): SuiteHeaderWithHighestPressure {
    return new this.toolsSuiteApiService.ToolsSuiteModule.HeaderWithHighestPressure(
      header.pressure,
      header.processSteamUsage,
      header.condensationRecoveryRate,
      header.heatLoss,
      header.condensateReturnTemperature,
      header.flashCondensateReturn
    );
  }

  getNotHighPressureHeaderObject(header: HeaderNotHighestPressure): SuiteHeaderNotHighestPressure {
    if (!header.processSteamUsage) {
      // Adding property for modification where user has not selected calculated from baseline
      header.processSteamUsage = 0;
    }
    return new this.toolsSuiteApiService.ToolsSuiteModule.HeaderNotHighestPressure(
      header.pressure,
      header.processSteamUsage,
      header.condensationRecoveryRate,
      header.heatLoss,
      header.flashCondensateIntoHeader,
      header.desuperheatSteamIntoNextHighest,
      header.desuperheatSteamTemperature,
    );
  }


  getHeatLoss(headerHeatLoss: SuiteHeatLoss): HeatLossOutput {
    let heatLossOutput: HeatLossOutput = {
      heatLoss: undefined,
      inletEnergyFlow: undefined,
      inletMassFlow: undefined,
      inletPressure: undefined,
      inletQuality: undefined,
      inletSpecificEnthalpy: undefined,
      inletSpecificEntropy: undefined,
      inletTemperature: undefined,
      outletEnergyFlow: undefined,
      outletMassFlow: undefined,
      outletPressure: undefined,
      outletQuality: undefined,
      outletSpecificEnthalpy: undefined,
      outletSpecificEntropy: undefined,
      outletTemperature: undefined,
    };
    if (headerHeatLoss) {
      let heatLoss: number = headerHeatLoss.getHeatLoss();
      let inletProperties: FluidProperties = headerHeatLoss.getInletProperties();
      let outletProperties: FluidProperties = headerHeatLoss.getOutletProperties();

      heatLossOutput = {
        heatLoss: heatLoss,
        inletEnergyFlow: inletProperties.energyFlow,
        inletMassFlow: inletProperties.massFlow,
        inletPressure: inletProperties.pressure,
        inletQuality: inletProperties.quality,
        inletSpecificEnthalpy: inletProperties.specificEnthalpy,
        inletSpecificEntropy: inletProperties.specificEntropy,
        inletTemperature: inletProperties.temperature,
        outletEnergyFlow: outletProperties.energyFlow,
        outletMassFlow: outletProperties.massFlow,
        outletPressure: outletProperties.pressure,
        outletQuality: outletProperties.quality,
        outletSpecificEnthalpy: outletProperties.specificEnthalpy,
        outletSpecificEntropy: outletProperties.specificEntropy,
        outletTemperature: outletProperties.temperature,
      }
      inletProperties.delete();
      outletProperties.delete();
    }
    return heatLossOutput;
  }

  getPRVOutput(prv: PrvWithoutDesuperheating | PrvWithDesuperheating, inCalculator: boolean): PrvOutput {
    let prvOutput: PrvOutput = {
      feedwaterEnergyFlow: undefined,
      feedwaterMassFlow: undefined,
      feedwaterPressure: undefined,
      feedwaterQuality: undefined,
      feedwaterSpecificEnthalpy: undefined,
      feedwaterSpecificEntropy: undefined,
      feedwaterTemperature: undefined,
      feedwaterVolume: undefined,
      inletEnergyFlow: undefined,
      inletMassFlow: undefined,
      inletPressure: undefined,
      inletQuality: undefined,
      inletVolume: undefined,
      inletSpecificEnthalpy: undefined,
      inletSpecificEntropy: undefined,
      inletTemperature: undefined,
      outletEnergyFlow: undefined,
      outletMassFlow: undefined,
      outletPressure: undefined,
      outletVolume: undefined,
      outletQuality: undefined,
      outletSpecificEnthalpy: undefined,
      outletSpecificEntropy: undefined,
      outletTemperature: undefined,
    };
    if (prv) {
      let inletProperties: SuiteSteamPropertiesOutput = prv.getInletProperties();
      prvOutput.inletEnergyFlow = prv.getInletEnergyFlow();
      prvOutput.inletMassFlow = prv.getInletMassFlow();
      prvOutput.inletPressure = inletProperties.pressure;
      prvOutput.inletQuality = inletProperties.quality;
      prvOutput.inletVolume = inletProperties.specificVolume;
      prvOutput.inletSpecificEnthalpy = inletProperties.specificEnthalpy;
      prvOutput.inletSpecificEntropy = inletProperties.specificEntropy;
      prvOutput.inletTemperature = inletProperties.temperature;

      inletProperties.delete();

      let outletProperties: SuiteSteamPropertiesOutput = prv.getOutletProperties();

      prvOutput.outletEnergyFlow = prv.getOutletEnergyFlow();
      prvOutput.outletMassFlow = prv.getOutletMassFlow();
      prvOutput.outletPressure = outletProperties.pressure;
      prvOutput.outletQuality = outletProperties.quality;
      prvOutput.outletVolume = outletProperties.specificVolume;
      prvOutput.outletSpecificEnthalpy = outletProperties.specificEnthalpy;
      prvOutput.outletSpecificEntropy = outletProperties.specificEntropy;
      prvOutput.outletTemperature = outletProperties.temperature;

      outletProperties.delete();

      if (prv.isWithDesuperheating() && !inCalculator) {
        let castDesuperheating: PrvCastDesuperheating = new this.toolsSuiteApiService.ToolsSuiteModule.PrvCastDesuperheating();
        let prvWith: PrvWithDesuperheating = castDesuperheating.Cast(prv);
        if (prvWith != null) {
          let feedwaterProperties: SuiteSteamPropertiesOutput = prvWith.getFeedwaterProperties();
          prvOutput.feedwaterEnergyFlow = prvWith.getFeedwaterEnergyFlow();
          prvOutput.feedwaterMassFlow = prvWith.getFeedwaterMassFlow();
          prvOutput.feedwaterPressure = feedwaterProperties.pressure;
          prvOutput.feedwaterQuality = feedwaterProperties.quality;
          prvOutput.feedwaterVolume = feedwaterProperties.specificVolume;
          prvOutput.feedwaterSpecificEnthalpy = feedwaterProperties.specificEnthalpy;
          prvOutput.feedwaterSpecificEntropy = feedwaterProperties.specificEntropy;
          prvOutput.feedwaterTemperature = feedwaterProperties.temperature;

          feedwaterProperties.delete();
          prvWith.delete();
        }
        castDesuperheating.delete();
      }else if(prv.isWithDesuperheating() && inCalculator){
        const prvWithDesuperheating: PrvWithDesuperheating = prv as PrvWithDesuperheating;
        let feedwaterProperties: SuiteSteamPropertiesOutput = prvWithDesuperheating.getFeedwaterProperties();
        prvOutput.feedwaterEnergyFlow = prvWithDesuperheating.getFeedwaterEnergyFlow();
        prvOutput.feedwaterMassFlow = prvWithDesuperheating.getFeedwaterMassFlow();
        prvOutput.feedwaterPressure = feedwaterProperties.pressure;
        prvOutput.feedwaterQuality = feedwaterProperties.quality;
        prvOutput.feedwaterVolume = feedwaterProperties.specificVolume;
        prvOutput.feedwaterSpecificEnthalpy = feedwaterProperties.specificEnthalpy;
        prvOutput.feedwaterSpecificEntropy = feedwaterProperties.specificEntropy;
        prvOutput.feedwaterTemperature = feedwaterProperties.temperature;

        feedwaterProperties.delete();
      }
    }


    return prvOutput;
  }

  getFlashTankOutput(blowdownFlashTank: SuiteFlashTank): FlashTankOutput {
    let flashTankOutput: FlashTankOutput;
    if (blowdownFlashTank) {

      let waterProperties: FluidProperties = blowdownFlashTank.getInletWaterProperties();
      let outletGasProperties: FluidProperties = blowdownFlashTank.getOutletGasSaturatedProperties();
      let outletLiquidProperties: FluidProperties = blowdownFlashTank.getOutletLiquidSaturatedProperties();

      flashTankOutput = {
        inletWaterEnergyFlow: waterProperties.energyFlow,
        inletWaterMassFlow: waterProperties.massFlow,
        inletWaterPressure: waterProperties.pressure,
        inletWaterQuality: waterProperties.quality,
        inletWaterSpecificEnthalpy: waterProperties.specificEnthalpy,
        inletWaterSpecificEntropy: waterProperties.specificEntropy,
        inletWaterTemperature: waterProperties.temperature,
        inletWaterVolume: waterProperties.specificVolume,

        outletGasEnergyFlow: outletGasProperties.energyFlow,
        outletGasMassFlow: outletGasProperties.massFlow,
        outletGasPressure: outletGasProperties.pressure,
        outletGasQuality: outletGasProperties.quality,
        outletGasSpecificEnthalpy: outletGasProperties.specificEnthalpy,
        outletGasSpecificEntropy: outletGasProperties.specificEntropy,
        outletGasTemperature: outletGasProperties.temperature,
        outletGasVolume: outletGasProperties.specificVolume,

        outletLiquidEnergyFlow: outletLiquidProperties.energyFlow,
        outletLiquidMassFlow: outletLiquidProperties.massFlow,
        outletLiquidPressure: outletLiquidProperties.pressure,
        outletLiquidQuality: outletLiquidProperties.quality,
        outletLiquidSpecificEnthalpy: outletLiquidProperties.specificEnthalpy,
        outletLiquidSpecificEntropy: outletLiquidProperties.specificEntropy,
        outletLiquidTemperature: outletLiquidProperties.temperature,
        outletLiquidVolume: outletLiquidProperties.specificVolume,
      }
      waterProperties.delete();
      outletGasProperties.delete();
      outletLiquidProperties.delete();
    }
    return flashTankOutput;
  }

  getBoilerOutput(boiler: SuiteBoiler): BoilerOutput {
    let output: BoilerOutput;
    if (boiler) {
      let boilerSteamProperties: FluidProperties = boiler.getSteamProperties();
      let boilerBlowdownProperties: FluidProperties = boiler.getBlowdownProperties();
      let boilerFeedwaterProperties: FluidProperties = boiler.getFeedwaterProperties();

      let boilerEnergy: number = boiler.getBoilerEnergy();
      let fuelEnergy: number = boiler.getFuelEnergy();
      let blowdownRate: number = boiler.getBlowdownRate();
      let combustionEfficiency: number = boiler.getCombustionEfficiency();

      output = {
        steamPressure: boilerSteamProperties.pressure,
        steamTemperature: boilerSteamProperties.temperature,
        steamSpecificEnthalpy: boilerSteamProperties.specificEnthalpy,
        steamSpecificEntropy: boilerSteamProperties.specificEntropy,
        steamQuality: boilerSteamProperties.quality,
        steamMassFlow: boilerSteamProperties.massFlow,
        steamEnergyFlow: boilerSteamProperties.energyFlow,
        steamVolume: boilerSteamProperties.specificVolume,

        blowdownPressure: boilerBlowdownProperties.pressure,
        blowdownTemperature: boilerBlowdownProperties.temperature,
        blowdownSpecificEnthalpy: boilerBlowdownProperties.specificEnthalpy,
        blowdownSpecificEntropy: boilerBlowdownProperties.specificEntropy,
        blowdownQuality: boilerBlowdownProperties.quality,
        blowdownMassFlow: boilerBlowdownProperties.massFlow,
        blowdownEnergyFlow: boilerBlowdownProperties.energyFlow,
        blowdownVolume: boilerBlowdownProperties.specificVolume,

        feedwaterPressure: boilerFeedwaterProperties.pressure,
        feedwaterTemperature: boilerFeedwaterProperties.temperature,
        feedwaterSpecificEnthalpy: boilerFeedwaterProperties.specificEnthalpy,
        feedwaterSpecificEntropy: boilerFeedwaterProperties.specificEntropy,
        feedwaterQuality: boilerFeedwaterProperties.quality,
        feedwaterMassFlow: boilerFeedwaterProperties.massFlow,
        feedwaterEnergyFlow: boilerFeedwaterProperties.energyFlow,
        feedwaterVolume: boilerFeedwaterProperties.specificVolume,
        boilerEnergy: boilerEnergy,
        fuelEnergy: fuelEnergy,
        blowdownRate: blowdownRate,
        combustionEff: combustionEfficiency
      }
      boilerSteamProperties.delete();
      boilerBlowdownProperties.delete();
      boilerFeedwaterProperties.delete();
    }

    return output
  }

  getDeaeratorOutput(deaerator: SuiteDeaerator): DeaeratorOutput {
    let inletWaterProperties: FluidProperties = deaerator.getInletWaterProperties();
    let inletSteamProperties: FluidProperties = deaerator.getInletSteamProperties();
    let feedwaterProperties: FluidProperties = deaerator.getFeedwaterProperties();
    let ventedSteamProperties: FluidProperties = deaerator.getVentedSteamProperties();

    let output: DeaeratorOutput = {
      feedwaterEnergyFlow: feedwaterProperties.energyFlow,
      feedwaterMassFlow: feedwaterProperties.massFlow,
      feedwaterPressure: feedwaterProperties.pressure,
      feedwaterQuality: feedwaterProperties.quality,
      feedwaterSpecificEnthalpy: feedwaterProperties.specificEnthalpy,
      feedwaterSpecificEntropy: feedwaterProperties.specificEntropy,
      feedwaterTemperature: feedwaterProperties.temperature,
      feedwaterVolume: feedwaterProperties.specificVolume,

      inletSteamEnergyFlow: inletSteamProperties.energyFlow,
      inletSteamMassFlow: inletSteamProperties.massFlow,
      inletSteamPressure: inletSteamProperties.pressure,
      inletSteamQuality: inletSteamProperties.quality,
      inletSteamSpecificEnthalpy: inletSteamProperties.specificEnthalpy,
      inletSteamSpecificEntropy: inletSteamProperties.specificEntropy,
      inletSteamTemperature: inletSteamProperties.temperature,
      inletSteamVolume: inletSteamProperties.specificVolume,

      inletWaterEnergyFlow: inletWaterProperties.energyFlow,
      inletWaterMassFlow: inletWaterProperties.massFlow,
      inletWaterPressure: inletWaterProperties.pressure,
      inletWaterQuality: inletWaterProperties.quality,
      inletWaterSpecificEnthalpy: inletWaterProperties.specificEnthalpy,
      inletWaterSpecificEntropy: inletWaterProperties.specificEntropy,
      inletWaterTemperature: inletWaterProperties.temperature,
      inletWaterVolume: inletWaterProperties.specificVolume,

      ventedSteamEnergyFlow: ventedSteamProperties.energyFlow,
      ventedSteamMassFlow: ventedSteamProperties.massFlow,
      ventedSteamPressure: ventedSteamProperties.pressure,
      ventedSteamQuality: ventedSteamProperties.quality,
      ventedSteamSpecificEnthalpy: ventedSteamProperties.specificEnthalpy,
      ventedSteamSpecificEntropy: ventedSteamProperties.specificEntropy,
      ventedSteamTemperature: ventedSteamProperties.temperature,
      ventedSteamVolume: ventedSteamProperties.specificVolume,
    }

    inletWaterProperties.delete();
    inletSteamProperties.delete();
    feedwaterProperties.delete();
    ventedSteamProperties.delete();
    return output;

  }


  getInletArray(inletsArray: Array<HeaderInputObj>): Array<Inlet> {
    let inletArray: Array<Inlet> = [];
    inletsArray.forEach(inlet => {
      let thermodynamicQuantityType: ThermodynamicQuantity = this.suiteApiHelperService.getThermodynamicQuantityType(inlet.thermodynamicQuantity);
      let inletPointer: Inlet = new this.toolsSuiteApiService.ToolsSuiteModule.Inlet(
        inlet.pressure,
        thermodynamicQuantityType,
        inlet.quantityValue,
        inlet.massFlow
      );
      inletArray.push(inletPointer);
    });

    return inletArray;
  }
}
