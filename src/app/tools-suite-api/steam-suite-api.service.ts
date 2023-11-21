import { Injectable } from '@angular/core';
import { HeaderNotHighestPressure, HeaderWithHighestPressure, SSMTInputs } from '../shared/models/steam/ssmt';
import { BoilerInput, DeaeratorInput, FlashTankInput, HeaderInput, HeaderInputObj, HeatLossInput, PrvInput, SaturatedPropertiesInput, SteamPropertiesInput, TurbineInput } from '../shared/models/steam/steam-inputs';
import { SteamPropertiesOutput, SaturatedPropertiesOutput, BoilerOutput, DeaeratorOutput, FlashTankOutput, HeaderOutput, HeatLossOutput, PrvOutput, TurbineOutput, SSMTOutput, SSMTOperationsOutput, ProcessSteamUsage } from '../shared/models/steam/steam-outputs';
import { SuiteApiHelperService } from './suite-api-helper.service';

declare var Module: any;
@Injectable()
export class SteamSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService) { }

  steamProperties(input: SteamPropertiesInput): SteamPropertiesOutput {
    let thermodynamicQuantityType = this.suiteApiHelperService.getThermodynamicQuantityType(input.thermodynamicQuantity)
    let SteamProperties = new Module.SteamProperties(
      input.pressure,
      thermodynamicQuantityType,
      input.quantityValue
    );
    let output = SteamProperties.calculate();
    let results: SteamPropertiesOutput = {
      pressure: output.pressure,
      temperature: output.temperature,
      specificEnthalpy: output.specificEnthalpy,
      specificEntropy: output.specificEntropy,
      quality: output.quality,
      specificVolume: output.specificVolume,
      massFlow: output.massFlow,
      energyFlow: output.energyFlow,
    }
    SteamProperties.delete();
    output.delete();
    return results;
  }

  saturatedPropertiesGivenPressure(saturatedPropertiesInput: SaturatedPropertiesInput): SaturatedPropertiesOutput {

    let SaturatedTemperature = new Module.SaturatedTemperature(saturatedPropertiesInput.saturatedPressure);
    let temperature = SaturatedTemperature.calculate();
    let SaturatedProperties = new Module.SaturatedProperties(saturatedPropertiesInput.saturatedPressure, temperature);
    let saturatedPropertiesOutput = SaturatedProperties.calculate();
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

    let SaturatedPressure = new Module.SaturatedPressure(saturatedPropertiesInput.saturatedTemperature);
    let pressure = SaturatedPressure.calculate();
    let SaturatedProperties = new Module.SaturatedProperties(pressure, saturatedPropertiesInput.saturatedTemperature);
    let saturatedPropertiesOutput = SaturatedProperties.calculate();
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
    let thermodynamicQuantityType = this.suiteApiHelperService.getThermodynamicQuantityType(input.thermodynamicQuantity)

    let Boiler = new Module.Boiler(
      input.deaeratorPressure,
      input.combustionEfficiency,
      input.blowdownRate,
      input.steamPressure,
      thermodynamicQuantityType,
      input.quantityValue,
      input.steamMassFlow
    );

    let output = this.getBoilerOutput(Boiler);

    Boiler.delete();
    return output;
  }

  deaerator(input: DeaeratorInput): DeaeratorOutput {
    let waterThermodynamicQuantityType = this.suiteApiHelperService.getThermodynamicQuantityType(input.waterThermodynamicQuantity)
    let steamThermodynamicQuantityType = this.suiteApiHelperService.getThermodynamicQuantityType(input.steamThermodynamicQuantity)


    let Deaerator = new Module.Deaerator(
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
    let thermodynamicQuantityType = this.suiteApiHelperService.getThermodynamicQuantityType(input.thermodynamicQuantity)

    let FlashTank = new Module.FlashTank(
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
    let inletVector = this.getInletVector(input.inlets);

    let Header = new Module.Header(input.headerPressure, inletVector);
    let HeaderProps = Header.getHeaderProperties();
    HeaderProps.energyFlow = Header.getInletEnergyFlow();
    HeaderProps.massFlow = Header.getInletMassFlow();
    let Inlets = Header.getInlets();
    let allInletProperties: Array<SteamPropertiesOutput> = new Array();
    for (let i = 0; i < Inlets.size(); i++) {
      let inlet = Inlets.get(i);
      let inletProperties = inlet.getInletProperties();
      inletProperties.energyFlow = inlet.getInletEnergyFlow();
      inletProperties.massFlow = inlet.getMassFlow();

      allInletProperties.push(this.getSteamPropertiesOutput(inletProperties));
      inletProperties.delete();
      inlet.delete();
    }

    let output: HeaderOutput = {
      header: this.getSteamPropertiesOutput(HeaderProps),
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
    for (let i = 0; i < inletVector.size(); i++) {
      let inlet = inletVector.get(i);
      inlet.delete();
    }

    return output;
  }

  heatLoss(input: HeatLossInput): HeatLossOutput {
    let thermodynamicQuantityType = this.suiteApiHelperService.getThermodynamicQuantityType(input.thermodynamicQuantity)

    let HeatLoss = new Module.HeatLoss(
      input.inletPressure,
      thermodynamicQuantityType,
      input.quantityValue,
      input.inletMassFlow,
      input.percentHeatLoss
    );
    let inletProperties = HeatLoss.getInletProperties();
    let outletProperties = HeatLoss.getOutletProperties();
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
    let thermodynamicQuantityType = this.suiteApiHelperService.getThermodynamicQuantityType(input.thermodynamicQuantity)

    let prvWithoutDesuperheating = new Module.PrvWithoutDesuperheating(
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
    let thermodynamicQuantityType = this.suiteApiHelperService.getThermodynamicQuantityType(input.thermodynamicQuantity);
    let feedwaterThermodynamicQuantityType = this.suiteApiHelperService.getThermodynamicQuantityType(input.feedwaterThermodynamicQuantity);

    let prvWithDesuperheating = new Module.PrvWithDesuperheating(
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
    let solveForMethod = this.suiteApiHelperService.getSolveForMethod(input.solveFor)
    let inletThermodynamicQuantityType = this.suiteApiHelperService.getThermodynamicQuantityType(input.inletQuantity);
    let turbineProperty = this.suiteApiHelperService.getTurbineProperty(input.turbineProperty);

    let Turbine;
    if (input.solveFor == 0) {
      Turbine = new Module.Turbine(
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
      let outletThermodynamicQuantityType = this.suiteApiHelperService.getThermodynamicQuantityType(input.outletQuantity);
      Turbine = new Module.Turbine(
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
    let boilerInputObj = new Module.BoilerInput(
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


    let highPressureHeaderObj;
    if (inputData.headerInput.highPressureHeader) {
      this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.headerInput.highPressureHeader);
      highPressureHeaderObj = this.getHighPressureHeaderObject(inputData.headerInput.highPressureHeader);
    } else {
      this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.headerInput.highPressure);
      highPressureHeaderObj = this.getHighPressureHeaderObject(inputData.headerInput.highPressure);
    }

    let operationsInputObj = new Module.OperationsInput(
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


    let mediumPressureHeaderObj = null;
    if (inputData.headerInput.mediumPressureHeader !== null && inputData.headerInput.mediumPressureHeader !== undefined) {
      this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.headerInput.mediumPressureHeader);
      mediumPressureHeaderObj = this.getNotHighPressureHeaderObject(inputData.headerInput.mediumPressureHeader);
    } else if (inputData.headerInput.mediumPressure !== null && inputData.headerInput.mediumPressure !== undefined) {
      this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.headerInput.mediumPressure);
      mediumPressureHeaderObj = this.getNotHighPressureHeaderObject(inputData.headerInput.mediumPressure);
    }
    let lowPressureHeaderObj = null;
    if (inputData.headerInput.lowPressureHeader !== null && inputData.headerInput.lowPressureHeader !== undefined) {
      this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.headerInput.lowPressureHeader);
      lowPressureHeaderObj = this.getNotHighPressureHeaderObject(inputData.headerInput.lowPressureHeader);
    } else if (inputData.headerInput.lowPressure !== null && inputData.headerInput.lowPressure !== undefined) {
      this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.headerInput.lowPressure);
      lowPressureHeaderObj = this.getNotHighPressureHeaderObject(inputData.headerInput.lowPressure);
    }

    let headerInputObj = new Module.HeaderInput(highPressureHeaderObj, mediumPressureHeaderObj, lowPressureHeaderObj);
    if (mediumPressureHeaderObj) {
      mediumPressureHeaderObj.delete();
    }
    if (lowPressureHeaderObj) {
      lowPressureHeaderObj.delete();
    }

    this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.turbineInput.condensingTurbine);
    let condensingTurbineObj = new Module.CondensingTurbine(
      inputData.turbineInput.condensingTurbine.isentropicEfficiency,
      inputData.turbineInput.condensingTurbine.generationEfficiency,
      inputData.turbineInput.condensingTurbine.condenserPressure,
      inputData.turbineInput.condensingTurbine.operationType,
      inputData.turbineInput.condensingTurbine.operationValue,
      inputData.turbineInput.condensingTurbine.useTurbine
    );
    this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.turbineInput.highToLowTurbine);
    let highToLowTurbineObj = new Module.PressureTurbine(
      inputData.turbineInput.highToLowTurbine.isentropicEfficiency,
      inputData.turbineInput.highToLowTurbine.generationEfficiency,
      inputData.turbineInput.highToLowTurbine.operationType,
      inputData.turbineInput.highToLowTurbine.operationValue1,
      inputData.turbineInput.highToLowTurbine.operationValue2,
      inputData.turbineInput.highToLowTurbine.useTurbine
    );
    this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.turbineInput.highToMediumTurbine);
    let highToMediumTurbineObj = new Module.PressureTurbine(
      inputData.turbineInput.highToMediumTurbine.isentropicEfficiency,
      inputData.turbineInput.highToMediumTurbine.generationEfficiency,
      inputData.turbineInput.highToMediumTurbine.operationType,
      inputData.turbineInput.highToMediumTurbine.operationValue1,
      inputData.turbineInput.highToMediumTurbine.operationValue2,
      inputData.turbineInput.highToMediumTurbine.useTurbine
    );
    this.suiteApiHelperService.convertNullInputsForObjectConstructor(inputData.turbineInput.mediumToLowTurbine);
    let mediumToLowTurbineObj = new Module.PressureTurbine(
      inputData.turbineInput.mediumToLowTurbine.isentropicEfficiency,
      inputData.turbineInput.mediumToLowTurbine.generationEfficiency,
      inputData.turbineInput.mediumToLowTurbine.operationType,
      inputData.turbineInput.mediumToLowTurbine.operationValue1,
      inputData.turbineInput.mediumToLowTurbine.operationValue2,
      inputData.turbineInput.mediumToLowTurbine.useTurbine
    );

    let turbineInputObj = new Module.TurbineInput(
      condensingTurbineObj,
      highToLowTurbineObj,
      highToMediumTurbineObj,
      mediumToLowTurbineObj
    );

    let steamModelerInput = new Module.SteamModelerInput(
      inputData.isBaselineCalc,
      inputData.baselinePowerDemand,
      boilerInputObj,
      headerInputObj,
      operationsInputObj,
      turbineInputObj
    );

    let modeler = new Module.SteamModeler();
    let wasmOutput = modeler.model(steamModelerInput);
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

  getSSMTOutputFromWASMOutput(wasmOutput): SSMTOutput {
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

    let boiler = wasmOutput.boiler;
    ssmtOutput.boilerOutput = this.getBoilerOutput(boiler);
    boiler.delete();


    let highPressureHeaderCalculationsDomain = wasmOutput.highPressureHeaderCalculationsDomain;
    let highPressureHeaderOutput = highPressureHeaderCalculationsDomain.highPressureHeaderOutput;
    ssmtOutput.highPressureHeaderSteam = this.getSteamPropertiesOutput(highPressureHeaderOutput);
    highPressureHeaderOutput.delete();


    let blowdownFlashTank = wasmOutput.blowdownFlashTank;
    ssmtOutput.blowdownFlashTank = this.getFlashTankOutput(blowdownFlashTank);
    if (blowdownFlashTank) {
      blowdownFlashTank.delete();
    }

    let deaerator = wasmOutput.deaerator;
    ssmtOutput.deaeratorOutput = this.getDeaeratorOutput(deaerator);
    deaerator.delete();

    let powerBalanceCheckerCalculationsDomain = wasmOutput.powerBalanceCheckerCalculationsDomain;
    if (powerBalanceCheckerCalculationsDomain) {
      let lowPressureVentedSteam = powerBalanceCheckerCalculationsDomain.lowPressureVentedSteam;
      ssmtOutput.lowPressureVentedSteam = this.getSteamPropertiesOutput(lowPressureVentedSteam);
      if (lowPressureVentedSteam) {
        lowPressureVentedSteam.delete();
      }
      powerBalanceCheckerCalculationsDomain.delete();
    }

    if (highPressureHeaderCalculationsDomain) {
      let highPressureHeaderHeatLoss = highPressureHeaderCalculationsDomain.highPressureHeaderHeatLoss;
      ssmtOutput.highPressureSteamHeatLoss = this.getHeatLoss(highPressureHeaderHeatLoss);
      if (highPressureHeaderHeatLoss) {
        highPressureHeaderHeatLoss.delete();
      }

      let highToLowPressureTurbine = highPressureHeaderCalculationsDomain.highToLowPressureTurbine;
      ssmtOutput.highPressureToLowPressureTurbine = this.getTurbineOutput(highToLowPressureTurbine);
      if (highToLowPressureTurbine) {
        highToLowPressureTurbine.delete();
      }

      let highToLowPressureTurbineIdeal = highPressureHeaderCalculationsDomain.highToLowPressureTurbineIdeal;
      ssmtOutput.highPressureToLowPressureTurbineIdeal = this.getTurbineOutput(highToLowPressureTurbineIdeal);
      if (highToLowPressureTurbineIdeal) {
        highToLowPressureTurbineIdeal.delete();
      }

      let highToMediumPressureTurbine = highPressureHeaderCalculationsDomain.highToMediumPressureTurbine;
      ssmtOutput.highPressureToMediumPressureTurbine = this.getTurbineOutput(highToMediumPressureTurbine);
      if (highToMediumPressureTurbine) {
        highToMediumPressureTurbine.delete();
      }

      // Typo 'Idle' on backend
      let highToMediumPressureTurbineIdle = highPressureHeaderCalculationsDomain.highToMediumPressureTurbineIdle;
      ssmtOutput.highPressureToMediumPressureTurbineIdeal = this.getTurbineOutput(highToMediumPressureTurbineIdle);
      if (highToMediumPressureTurbineIdle) {
        highToMediumPressureTurbineIdle.delete();
      }

      let highPressureCondensateFlashTank = highPressureHeaderCalculationsDomain.highPressureCondensateFlashTank
      ssmtOutput.highPressureCondensateFlashTank = this.getFlashTankOutput(highPressureCondensateFlashTank);
      if (highPressureCondensateFlashTank) {
        highPressureCondensateFlashTank.delete();
      }

      let highPressureCondensate = highPressureHeaderCalculationsDomain.highPressureCondensate;
      ssmtOutput.highPressureCondensate = this.getSteamPropertiesOutput(highPressureCondensate);
      if (highPressureCondensate) {
        highPressureCondensate.delete();
      }

      let condensingTurbine = highPressureHeaderCalculationsDomain.condensingTurbine;
      ssmtOutput.condensingTurbine = this.getTurbineOutput(condensingTurbine);
      if (condensingTurbine) {
        condensingTurbine.delete();
      }

      let condensingTurbineIdeal = highPressureHeaderCalculationsDomain.condensingTurbineIdeal;
      ssmtOutput.condensingTurbineIdeal = this.getTurbineOutput(condensingTurbineIdeal);
      if (condensingTurbineIdeal) {
        condensingTurbineIdeal.delete();
      }

      highPressureHeaderCalculationsDomain.delete();
    }


    let lowPressureHeaderCalculationsDomain = wasmOutput.lowPressureHeaderCalculationsDomain;
    if (lowPressureHeaderCalculationsDomain) {
      let lowPressureHeaderOutput = lowPressureHeaderCalculationsDomain.lowPressureHeaderOutput;
      ssmtOutput.lowPressureHeaderSteam = this.getSteamPropertiesOutput(lowPressureHeaderOutput);
      if (lowPressureHeaderOutput) {
        lowPressureHeaderOutput.delete();
      }

      let lowPressureHeaderHeatLoss = lowPressureHeaderCalculationsDomain.lowPressureHeaderHeatLoss;
      ssmtOutput.lowPressureSteamHeatLoss = this.getHeatLoss(lowPressureHeaderHeatLoss);
      if (lowPressureHeaderHeatLoss) {
        lowPressureHeaderHeatLoss.delete();
      }

      let lowPressurePrv = lowPressureHeaderCalculationsDomain.lowPressurePrv;
      ssmtOutput.mediumPressureToLowPressurePrv = this.getPRVOutput(lowPressurePrv, false);
      if (lowPressurePrv) {
        lowPressurePrv.delete();
      }

      let lowPressureCondensate = lowPressureHeaderCalculationsDomain.lowPressureCondensate;
      ssmtOutput.lowPressureCondensate = this.getSteamPropertiesOutput(lowPressureCondensate);
      if (lowPressureCondensate) {
        lowPressureCondensate.delete();
      }

      lowPressureHeaderCalculationsDomain.delete();
    }

    let mediumPressureHeaderCalculationsDomain = wasmOutput.mediumPressureHeaderCalculationsDomain;
    if (mediumPressureHeaderCalculationsDomain) {
      let highToMediumPressurePrv = mediumPressureHeaderCalculationsDomain.highToMediumPressurePrv;
      ssmtOutput.highPressureToMediumPressurePrv = this.getPRVOutput(highToMediumPressurePrv, false);
      if (highToMediumPressurePrv) {
        highToMediumPressurePrv.delete();
      }

      let mediumToLowPressureTurbine = mediumPressureHeaderCalculationsDomain.mediumToLowPressureTurbine
      ssmtOutput.mediumPressureToLowPressureTurbine = this.getTurbineOutput(mediumToLowPressureTurbine);
      if (mediumToLowPressureTurbine) {
        mediumToLowPressureTurbine.delete();
      }

      let mediumToLowPressureTurbineIdeal = mediumPressureHeaderCalculationsDomain.mediumToLowPressureTurbineIdeal;
      ssmtOutput.mediumPressureToLowPressureTurbineIdeal = this.getTurbineOutput(mediumToLowPressureTurbineIdeal);
      if (mediumToLowPressureTurbineIdeal) {
        mediumToLowPressureTurbineIdeal.delete();
      }

      let mediumPressureHeaderOutput = mediumPressureHeaderCalculationsDomain.mediumPressureHeaderOutput
      ssmtOutput.mediumPressureHeaderSteam = this.getSteamPropertiesOutput(mediumPressureHeaderOutput);
      if (mediumPressureHeaderOutput) {
        mediumPressureHeaderOutput.delete();
      }

      let mediumPressureHeaderHeatLoss = mediumPressureHeaderCalculationsDomain.mediumPressureHeaderHeatLoss;
      ssmtOutput.mediumPressureSteamHeatLoss = this.getHeatLoss(mediumPressureHeaderHeatLoss);
      if (mediumPressureHeaderHeatLoss) {
        mediumPressureHeaderHeatLoss.delete();
      }

      let mediumPressureCondensate = mediumPressureHeaderCalculationsDomain.mediumPressureCondensate;
      ssmtOutput.mediumPressureCondensate = this.getSteamPropertiesOutput(mediumPressureCondensate);
      if (mediumPressureCondensate) {
        mediumPressureCondensate.delete();
      }

      mediumPressureHeaderCalculationsDomain.delete();
    }

    let LowPressureFlashedSteamIntoHeaderCalculatorDomain = wasmOutput.LowPressureFlashedSteamIntoHeaderCalculatorDomain;
    if (LowPressureFlashedSteamIntoHeaderCalculatorDomain) {
      let mediumPressureCondensateFlashTank = LowPressureFlashedSteamIntoHeaderCalculatorDomain.mediumPressureCondensateFlashTank;
      ssmtOutput.mediumPressureCondensateFlashTank = this.getFlashTankOutput(mediumPressureCondensateFlashTank);
      if (mediumPressureCondensateFlashTank) {
        mediumPressureCondensateFlashTank.delete();
      }

      LowPressureFlashedSteamIntoHeaderCalculatorDomain.delete();
    }

    let operationsOutput: SSMTOperationsOutput;

    let energyAndCostCalculationsDomain = wasmOutput.energyAndCostCalculationsDomain;
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

    let makeupWaterAndCondensateHeaderCalculationsDomain = wasmOutput.makeupWaterAndCondensateHeaderCalculationsDomain;
    if (makeupWaterAndCondensateHeaderCalculationsDomain) {
      let combinedCondensate = makeupWaterAndCondensateHeaderCalculationsDomain.combinedCondensate;
      ssmtOutput.combinedCondensate = this.getSteamPropertiesOutput(combinedCondensate);
      if (combinedCondensate) {
        combinedCondensate.delete();
      }

      let returnCondensate = makeupWaterAndCondensateHeaderCalculationsDomain.returnCondensate;
      ssmtOutput.returnCondensate = this.getSteamPropertiesOutput(returnCondensate);
      if (returnCondensate) {
        returnCondensate.delete();
      }

      let returnCondensateCalculationsDomain = makeupWaterAndCondensateHeaderCalculationsDomain.returnCondensateCalculationsDomain;

      if (returnCondensateCalculationsDomain) {
        let condensateFlashTank = returnCondensateCalculationsDomain.condensateFlashTank;
        ssmtOutput.condensateFlashTank = this.getFlashTankOutput(condensateFlashTank);
        if (condensateFlashTank) {
          condensateFlashTank.delete();
        }
        returnCondensateCalculationsDomain.delete();
      }

      let makeupWater = makeupWaterAndCondensateHeaderCalculationsDomain.makeupWater;
      ssmtOutput.makeupWater = this.getSteamPropertiesOutput(makeupWater);
      if (makeupWater) {
        makeupWater.delete();
      }

      let makeupWaterAndCondensateHeaderOutput = makeupWaterAndCondensateHeaderCalculationsDomain.makeupWaterAndCondensateHeaderOutput;
      ssmtOutput.makeupWaterAndCondensate = this.getSteamPropertiesOutput(makeupWaterAndCondensateHeaderOutput);
      if (makeupWaterAndCondensateHeaderOutput) {
        makeupWaterAndCondensateHeaderOutput.delete();
      }

      let heatExchangerOutput = makeupWaterAndCondensateHeaderCalculationsDomain.heatExchangerOutput;
      ssmtOutput.heatExchanger = this.getHeatExchangerOutput(heatExchangerOutput);
      if (heatExchangerOutput) {
        heatExchangerOutput.delete();
      }

      let makeupWaterVolumeFlowCalculationsDomain = makeupWaterAndCondensateHeaderCalculationsDomain.makeupWaterVolumeFlowCalculationsDomain
      if (makeupWaterVolumeFlowCalculationsDomain) {
        operationsOutput.makeupWaterVolumeFlow = makeupWaterVolumeFlowCalculationsDomain.makeupWaterVolumeFlow;
        operationsOutput.makeupWaterVolumeFlowAnnual = makeupWaterVolumeFlowCalculationsDomain.makeupWaterVolumeFlowAnnual;
        makeupWaterVolumeFlowCalculationsDomain.delete();
      }

      makeupWaterAndCondensateHeaderCalculationsDomain.delete();
    }

    ssmtOutput.operationsOutput = operationsOutput;
    let processSteamUsageCalculationsDomain = wasmOutput.processSteamUsageCalculationsDomain;
    if (processSteamUsageCalculationsDomain) {
      let highPressureProcessSteamUsage = processSteamUsageCalculationsDomain.highPressureProcessSteamUsage
      ssmtOutput.highPressureProcessSteamUsage = this.getProcessSteamUsage(highPressureProcessSteamUsage);
      if (highPressureProcessSteamUsage) {
        highPressureProcessSteamUsage.delete();
      }

      let mediumPressureProcessUsagePtr = processSteamUsageCalculationsDomain.mediumPressureProcessUsagePtr;
      ssmtOutput.mediumPressureProcessSteamUsage = this.getProcessSteamUsage(mediumPressureProcessUsagePtr);
      if (mediumPressureProcessUsagePtr) {
        mediumPressureProcessUsagePtr.delete();
      }

      let lowPressureProcessUsagePtr = processSteamUsageCalculationsDomain.lowPressureProcessUsagePtr;
      ssmtOutput.lowPressureProcessSteamUsage = this.getProcessSteamUsage(lowPressureProcessUsagePtr);
      if (lowPressureProcessUsagePtr) {
        lowPressureProcessUsagePtr.delete();
      }
      processSteamUsageCalculationsDomain.delete();
    }
    return ssmtOutput;
  }

  getSteamPropertiesOutput(properties): SteamPropertiesOutput {
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

  getProcessSteamUsage(processUsage): ProcessSteamUsage {
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

  getHeatExchangerOutput(heatExchanger) {
    if (heatExchanger) {
      return {
        hotOutletMassFlow: heatExchanger.hotOutlet.massFlow,
        hotOutletEnergyFlow: heatExchanger.hotOutlet.energyFlow,
        hotOutletTemperature: heatExchanger.hotOutlet.temperature,
        hotOutletPressure: heatExchanger.hotOutlet.pressure,
        hotOutletQuality: heatExchanger.hotOutlet.quality,
        hotOutletVolume: heatExchanger.hotOutlet.volume,
        hotOutletDensity: heatExchanger.hotOutlet.density,
        hotOutletSpecificEnthalpy: heatExchanger.hotOutlet.specificEnthalpy,
        hotOutletSpecificEntropy: heatExchanger.hotOutlet.specificEntropy,
        coldOutletMassFlow: heatExchanger.coldOutlet.massFlow,
        coldOutletEnergyFlow: heatExchanger.coldOutlet.energyFlow,
        coldOutletTemperature: heatExchanger.coldOutlet.temperature,
        coldOutletPressure: heatExchanger.coldOutlet.pressure,
        coldOutletQuality: heatExchanger.coldOutlet.quality,
        coldOutletVolume: heatExchanger.coldOutlet.volume,
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

  getTurbineOutput(Turbine): TurbineOutput {
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
      let inletProperties = Turbine.getInletProperties();
      let outletProperties = Turbine.getOutletProperties();
      let massFlow = Turbine.getMassFlow();
      let isentropicEfficiency = Turbine.getIsentropicEfficiency();
      let energyOut = Turbine.getEnergyOut();
      let powerOut = Turbine.getPowerOut();
      let generatorEfficiency = Turbine.getGeneratorEfficiency();

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


  getHighPressureHeaderObject(header: HeaderWithHighestPressure) {
    return new Module.HeaderWithHighestPressure(
      header.pressure,
      header.processSteamUsage,
      header.condensationRecoveryRate,
      header.heatLoss,
      header.condensateReturnTemperature,
      header.flashCondensateReturn
    );
  }

  getNotHighPressureHeaderObject(header: HeaderNotHighestPressure) {
    if (!header.processSteamUsage) {
      // Adding property for modification where user has not selected calculated from baseline
      header.processSteamUsage = 0;
    }
    return new Module.HeaderNotHighestPressure(
      header.pressure,
      header.processSteamUsage,
      header.condensationRecoveryRate,
      header.heatLoss,
      header.flashCondensateIntoHeader,
      header.desuperheatSteamIntoNextHighest,
      header.desuperheatSteamTemperature,
    );
  }


  getHeatLoss(headerHeatLoss) {
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
      let heatLoss = headerHeatLoss.getHeatLoss();
      let inletProperties = headerHeatLoss.getInletProperties();
      let outletProperties = headerHeatLoss.getOutletProperties();

      heatLossOutput = {
        heatLoss: heatLoss,
        inletEnergyFlow: inletProperties.inletEnergyFlow,
        inletMassFlow: inletProperties.inletMassFlow,
        inletPressure: inletProperties.inletPressure,
        inletQuality: inletProperties.inletQuality,
        inletSpecificEnthalpy: inletProperties.inletSpecificEnthalpy,
        inletSpecificEntropy: inletProperties.inletSpecificEntropy,
        inletTemperature: inletProperties.inletTemperature,
        outletEnergyFlow: outletProperties.outletEnergyFlow,
        outletMassFlow: outletProperties.outletMassFlow,
        outletPressure: outletProperties.outletPressure,
        outletQuality: outletProperties.outletQuality,
        outletSpecificEnthalpy: outletProperties.outletSpecificEnthalpy,
        outletSpecificEntropy: outletProperties.outletSpecificEntropy,
        outletTemperature: outletProperties.outletTemperature,
      }
      inletProperties.delete();
      outletProperties.delete();
    }
    return heatLossOutput;
  }

  getPRVOutput(prv, inCalculator: boolean): PrvOutput {
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
      let inletProperties = prv.getInletProperties();
      prvOutput.inletEnergyFlow = prv.getInletEnergyFlow();
      prvOutput.inletMassFlow = prv.getInletMassFlow();
      prvOutput.inletPressure = inletProperties.pressure;
      prvOutput.inletQuality = inletProperties.quality;
      prvOutput.inletVolume = inletProperties.specificVolume;
      prvOutput.inletSpecificEnthalpy = inletProperties.specificEnthalpy;
      prvOutput.inletSpecificEntropy = inletProperties.specificEntropy;
      prvOutput.inletTemperature = inletProperties.temperature;

      inletProperties.delete();

      let outletProperties = prv.getOutletProperties();

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
        let castDesuperheating = new Module.PrvCastDesuperheating();
        let prvWith = castDesuperheating.Cast(prv);
        if (prvWith != null) {
          let feedwaterProperties = prvWith.getFeedwaterProperties();
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
        let feedwaterProperties = prv.getFeedwaterProperties();
        prvOutput.feedwaterEnergyFlow = prv.getFeedwaterEnergyFlow();
        prvOutput.feedwaterMassFlow = prv.getFeedwaterMassFlow();
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

  getFlashTankOutput(blowdownFlashTank) {
    let flashTankOutput: FlashTankOutput;
    if (blowdownFlashTank) {

      let waterProperties = blowdownFlashTank.getInletWaterProperties();
      let outletGasProperties = blowdownFlashTank.getOutletGasSaturatedProperties();
      let outletLiquidProperties = blowdownFlashTank.getOutletLiquidSaturatedProperties();

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

  getBoilerOutput(boiler) {
    let output: BoilerOutput;
    if (boiler) {
      let boilerSteamProperties = boiler.getSteamProperties();
      let boilerBlowdownProperties = boiler.getBlowdownProperties();
      let boilerFeedwaterProperties = boiler.getFeedwaterProperties();

      let boilerEnergy = boiler.getBoilerEnergy();
      let fuelEnergy = boiler.getFuelEnergy();
      let blowdownRate = boiler.getBlowdownRate();
      let combustionEfficiency = boiler.getCombustionEfficiency();

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

  getDeaeratorOutput(deaerator) {
    let inletWaterProperties = deaerator.getInletWaterProperties();
    let inletSteamProperties = deaerator.getInletSteamProperties();
    let feedwaterProperties = deaerator.getFeedwaterProperties();
    let ventedSteamProperties = deaerator.getVentedSteamProperties();

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


  getInletVector(inletsArray: Array<HeaderInputObj>) {
    let inletVector = new Module.InletVector();
    inletsArray.forEach(inlet => {
      let thermodynamicQuantityType = this.suiteApiHelperService.getThermodynamicQuantityType(inlet.thermodynamicQuantity);
      let inletPointer = new Module.Inlet(
        inlet.pressure,
        thermodynamicQuantityType,
        inlet.quantityValue,
        inlet.massFlow
      );
      inletVector.push_back(inletPointer);
    });

    return inletVector;
  }
}
