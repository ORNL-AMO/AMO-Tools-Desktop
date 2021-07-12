import { Injectable } from '@angular/core';
import { ReceiverTankGeneral } from '../shared/models/standalone';
import { HeaderNotHighestPressure, HeaderWithHighestPressure, SSMTInputs } from '../shared/models/steam/ssmt';
import { BoilerInput, DeaeratorInput, FlashTankInput, HeaderInput, HeaderInputObj, HeatLossInput, PrvInput, SaturatedPropertiesInput, SteamPropertiesInput, TurbineInput } from '../shared/models/steam/steam-inputs';
import { SteamPropertiesOutput, SaturatedPropertiesOutput, BoilerOutput, DeaeratorOutput, FlashTankOutput, HeaderOutput, HeatLossOutput, PrvOutput, TurbineOutput, SSMTOutput, SSMTOperationsOutput } from '../shared/models/steam/steam-outputs';
import { SuiteApiEnumService } from './suite-api-enum.service';

declare var Module: any;
@Injectable()
export class SteamSuiteApiService {

  constructor(private suiteApiEnumService: SuiteApiEnumService ) { }

  steamProperties(input: SteamPropertiesInput): SteamPropertiesOutput {
    let thermodynamicQuantityType = this.suiteApiEnumService.getThermodynamicQuantityType(input.thermodynamicQuantity)
    let SteamProperties = new Module.SteamProperties(
      input.pressure, 
      thermodynamicQuantityType, 
      input.quantityValue
      );
    let output = SteamProperties.calculate();
    SteamProperties.delete();
    return output;
  }

  saturatedPropertiesGivenPressure(saturatedPropertiesInput: SaturatedPropertiesInput): SaturatedPropertiesOutput {
    
    let SaturatedTemperature = new Module.SaturatedTemperature(saturatedPropertiesInput.saturatedPressure);
    let temperature = SaturatedTemperature.calculate();
    let SaturatedProperties = new Module.SaturatedProperties(saturatedPropertiesInput.saturatedPressure, temperature);
    let saturatedPropertiesOutput = SaturatedProperties.calculate();
    SaturatedTemperature.delete();
    SaturatedProperties.delete();
    return saturatedPropertiesOutput;
  }
  
  saturatedPropertiesGivenTemperature(saturatedPropertiesInput: SaturatedPropertiesInput): SaturatedPropertiesOutput {
    
    let SaturatedPressure = new Module.SaturatedPressure(saturatedPropertiesInput.saturatedTemperature);
    let pressure = SaturatedPressure.calculate();
    let SaturatedProperties = new Module.SaturatedProperties(pressure, saturatedPropertiesInput.saturatedTemperature);
    let saturatedPropertiesOutput = SaturatedProperties.calculate();
    SaturatedPressure.delete();
    SaturatedProperties.delete();
    return saturatedPropertiesOutput;
  }


  boiler(input: BoilerInput): BoilerOutput {
    let thermodynamicQuantityType = this.suiteApiEnumService.getThermodynamicQuantityType(input.thermodynamicQuantity)
    
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
    let waterThermodynamicQuantityType = this.suiteApiEnumService.getThermodynamicQuantityType(input.waterThermodynamicQuantity)
    let steamThermodynamicQuantityType = this.suiteApiEnumService.getThermodynamicQuantityType(input.steamThermodynamicQuantity)
   
    
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
    let thermodynamicQuantityType = this.suiteApiEnumService.getThermodynamicQuantityType(input.thermodynamicQuantity)
    
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
    let allInletProperties = new Array();
    for (let i = 0; i < Inlets.size(); i++) {
        let inlet = Inlets.get(i);
        let inletProperties: SteamPropertiesOutput = inlet.getInletProperties();
        inletProperties.energyFlow = inlet.getInletEnergyFlow();
        inletProperties.massFlow = inlet.getMassFlow();

        allInletProperties.push(inletProperties);
    }

    let output: HeaderOutput = {
      header: HeaderProps,
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
    Header.delete();
    for (let i = 0; i < inletVector.size(); i++) {
        let inlet = inletVector.get(i);
        inlet.delete();
    }

    return output;
  }

  heatLoss(input: HeatLossInput): HeatLossOutput {
    let thermodynamicQuantityType = this.suiteApiEnumService.getThermodynamicQuantityType(input.thermodynamicQuantity)

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

    HeatLoss.delete();
    return heatLossOutput;
  }

  // inletMassFlow - should be set from inputs?
  prvWithoutDesuperheating(input: PrvInput): PrvOutput {
    let thermodynamicQuantityType = this.suiteApiEnumService.getThermodynamicQuantityType(input.thermodynamicQuantity)
   
    let prvWithoutDesuperheating = new Module.PrvWithoutDesuperheating(
      input.inletPressure, 
      thermodynamicQuantityType, 
      input.quantityValue, 
      input.inletMassFlow, 
      input.outletPressure
    );
    let inletProperties = prvWithoutDesuperheating.getInletProperties();
    let outletProperties = prvWithoutDesuperheating.getOutletProperties();
    // let inletMassFlow = prvWithoutDesuperheating.getInletMassFlow();
    let inletEnergyFlow = prvWithoutDesuperheating.getInletEnergyFlow();
    let outletMassFlow = prvWithoutDesuperheating.getOutletMassFlow();
    let outletEnergyFlow = prvWithoutDesuperheating.getOutletEnergyFlow();

    let prvOutput: PrvOutput = {
      inletEnergyFlow: inletEnergyFlow,
      // inletMassFlow: inletMassFlow,
      inletMassFlow: input.inletMassFlow,
      inletPressure: inletProperties.pressure,
      inletQuality: inletProperties.quality,
      inletSpecificEnthalpy: inletProperties.specificEnthalpy,
      inletSpecificEntropy: inletProperties.specificEntropy,
      inletTemperature: inletProperties.temperature,
      outletEnergyFlow: outletEnergyFlow,
      outletMassFlow: outletMassFlow,
      outletPressure: outletProperties.pressure,
      outletQuality: outletProperties.quality,
      outletSpecificEnthalpy: outletProperties.specificEnthalpy,
      outletSpecificEntropy: outletProperties.specificEntropy,
      outletTemperature: outletProperties.temperature,
    }
    inletProperties.delete();
    outletProperties.delete();
    prvWithoutDesuperheating.delete();

    return prvOutput;
  }

  // inletMassFlow - should be set from inputs?
  prvWithDesuperheating(input: PrvInput): PrvOutput {
    let thermodynamicQuantityType = this.suiteApiEnumService.getThermodynamicQuantityType(input.thermodynamicQuantity);
    let feedwaterThermodynamicQuantityType = this.suiteApiEnumService.getThermodynamicQuantityType(input.feedwaterThermodynamicQuantity);
   
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
    
    let inletProperties = prvWithDesuperheating.getInletProperties();
    let outletProperties = prvWithDesuperheating.getOutletProperties();
    let feedwaterProperties = prvWithDesuperheating.getFeedwaterProperties();
    let inletEnergyFlow = prvWithDesuperheating.getInletEnergyFlow();
    // let inletMassFlow = prvWithDesuperheating.getInletMassFlow();
    let outletMassFlow = prvWithDesuperheating.getOutletMassFlow();
    let outletEnergyFlow = prvWithDesuperheating.getOutletEnergyFlow();
    let feedwaterMassFlow = prvWithDesuperheating.getFeedwaterMassFlow();
    let feedwaterEnergyFlow = prvWithDesuperheating.getFeedwaterEnergyFlow();

    let prvOutput: PrvOutput = {
      feedwaterEnergyFlow: feedwaterEnergyFlow,
      feedwaterMassFlow: feedwaterMassFlow,
      feedwaterPressure: feedwaterProperties.pressure,
      feedwaterQuality: feedwaterProperties.quality,
      feedwaterSpecificEnthalpy: feedwaterProperties.specificEnthalpy,
      feedwaterSpecificEntropy: feedwaterProperties.specificEntropy,
      feedwaterTemperature: feedwaterProperties.temperature,
      inletEnergyFlow: inletEnergyFlow,
      // inletMassFlow: inletMassFlow,
      inletMassFlow: inletProperties.inletMassFlow,
      inletPressure: inletProperties.pressure,
      inletQuality: inletProperties.quality,
      inletSpecificEnthalpy: inletProperties.specificEnthalpy,
      inletSpecificEntropy: inletProperties.specificEntropy,
      inletTemperature: inletProperties.temperature,
      outletEnergyFlow: outletEnergyFlow,
      outletMassFlow: outletMassFlow,
      outletPressure: outletProperties.pressure,
      outletQuality: outletProperties.quality,
      outletSpecificEnthalpy: outletProperties.specificEnthalpy,
      outletSpecificEntropy: outletProperties.specificEntropy,
      outletTemperature: outletProperties.temperature,
    }
    prvWithDesuperheating.delete();

    return prvOutput;
  }

  turbine(input: TurbineInput): TurbineOutput {
    let solveForMethod = this.suiteApiEnumService.getSolveForMethod(input.solveFor)
    let inletThermodynamicQuantityType = this.suiteApiEnumService.getThermodynamicQuantityType(input.inletQuantity);
    let turbineProperty = this.suiteApiEnumService.getTurbineProperty(input.inletQuantity);

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
      let outletThermodynamicQuantityType = this.suiteApiEnumService.getThermodynamicQuantityType(input.inletQuantity);
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
    let inletProperties = Turbine.getInletProperties();
    inletProperties.energyFlow = Turbine.getInletEnergyFlow();
    let outletProperties = Turbine.getOutletProperties();
    outletProperties.energyFlow = Turbine.getOutletEnergyFlow();
    let massFlow = Turbine.getMassFlow();
    let isentropicEfficiency = Turbine.getIsentropicEfficiency();
    let energyOut = Turbine.getEnergyOut();
    let powerOut = Turbine.getPowerOut();
    let generatorEfficiency = Turbine.getGeneratorEfficiency();

    let turbineOutput: TurbineOutput = {
      energyOut: energyOut,
      generatorEfficiency: generatorEfficiency,
      inletEnergyFlow: inletProperties.energyFlow,
      inletPressure: inletProperties.pressure,
      inletQuality: inletProperties.quality,
      inletSpecificEnthalpy: inletProperties.specificEnthalpy,
      inletSpecificEntropy: inletProperties.specificEntropy,
      inletTemperature: inletProperties.temperature,
      isentropicEfficiency: isentropicEfficiency,
      massFlow: massFlow,
      outletEnergyFlow: outletProperties.energyFlow,
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

    Turbine.delete();
    return turbineOutput;
  }

  steamModeler(inputData: SSMTInputs): SSMTOutput {
    let ssmtOutput: SSMTOutput;

    this.convertNullInputsForObjectConstructor(inputData.boilerInput);
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
    // let highPressureHeaderInputForModeler;
    if (inputData.headerInput.highPressureHeader) {
      highPressureHeaderObj = this.getHighPressureHeaderObject(inputData.headerInput.highPressureHeader);
      // highPressureHeaderInputForModeler = this.getHighPressuerHeaderForModeler(inputData.headerInput.highPressureHeader);
     
    } else {
      highPressureHeaderObj = this.getHighPressureHeaderObject(inputData.headerInput.highPressure);
      // highPressureHeaderInputForModeler = this.getHighPressuerHeaderForModeler(inputData.headerInput.highPressure);
    }


    // let headerInput = {
    //   highPressureHeader: highPressureHeaderInputForModeler,
    //   mediumPressureHeader: null,
    //   lowPressureHeader: null,
    // };

    let operationsInputObj = new Module.OperationsInput(
      inputData.operationsInput.sitePowerImport, 
      inputData.operationsInput.makeUpWaterTemperature, 
      inputData.operationsInput.operatingHoursPerYear, 
      inputData.operationsInput.fuelCosts, 
      inputData.operationsInput.electricityCosts, 
      inputData.operationsInput.makeUpWaterCosts
    );

    inputData.turbineInput.condensingTurbine.operationType = this.suiteApiEnumService.getCondensingTurbineOperation(inputData.turbineInput.condensingTurbine.operationType);
    inputData.turbineInput.highToLowTurbine.operationType = this.suiteApiEnumService.getPressureTurbineOperation(inputData.turbineInput.highToLowTurbine.operationType);
    inputData.turbineInput.highToMediumTurbine.operationType = this.suiteApiEnumService.getPressureTurbineOperation(inputData.turbineInput.highToMediumTurbine.operationType);
    inputData.turbineInput.mediumToLowTurbine.operationType = this.suiteApiEnumService.getPressureTurbineOperation(inputData.turbineInput.mediumToLowTurbine.operationType);

    // let turbineInput = {
    //     condensingTurbine: inputData.turbineInput.condensingTurbine,
    //     highToLowTurbine: inputData.turbineInput.highToLowTurbine,
    //     highToMediumTurbine: inputData.turbineInput.highToMediumTurbine,
    //     mediumToLowTurbine: inputData.turbineInput.mediumToLowTurbine,
    // };

    // let modelerInput = {
    //     isBaselineCalc: inputData.isBaselineCalc,
    //     baselinePowerDemand: inputData.baselinePowerDemand,
    //     boilerInput: inputData.boilerInput,
    //     headerInput: headerInput,
    //     operationsInput: inputData.operationsInput,
    //     turbineInput: turbineInput,
    // };



  // Not used/optional in original nan bindings
  // let mediumPressureHeaderObj;
  // if (inputData.headerInput.mediumPressureHeader) {
  //   mediumPressureHeaderObj = this.getNotHighPressureHeaderObject(inputData.headerInput.mediumPressureHeader);
  // } else {
  //   mediumPressureHeaderObj = this.getNotHighPressureHeaderObject(inputData.headerInput.mediumPressure); 
  // }

  // let lowPressureHeaderObj;
  // if (inputData.headerInput.lowPressureHeader) {
  //   lowPressureHeaderObj = this.getNotHighPressureHeaderObject(inputData.headerInput.lowPressureHeader);
  // } else {
  //   lowPressureHeaderObj = this.getNotHighPressureHeaderObject(inputData.headerInput.lowPressure); 
  // }

  let headerInputObj = new Module.HeaderInput(highPressureHeaderObj, null, null);

  this.convertNullInputsForObjectConstructor(inputData.turbineInput.condensingTurbine);
  let condensingTurbineObj = new Module.CondensingTurbine(
    inputData.turbineInput.condensingTurbine.isentropicEfficiency, 
    inputData.turbineInput.condensingTurbine.generationEfficiency, 
    inputData.turbineInput.condensingTurbine.condenserPressure, 
    inputData.turbineInput.condensingTurbine.operationType, 
    inputData.turbineInput.condensingTurbine.operationValue, 
    inputData.turbineInput.condensingTurbine.useTurbine
  );
  this.convertNullInputsForObjectConstructor(inputData.turbineInput.highToLowTurbine);
  let highToLowTurbineObj = new Module.PressureTurbine(
    inputData.turbineInput.highToLowTurbine.isentropicEfficiency, 
    inputData.turbineInput.highToLowTurbine.generationEfficiency, 
    inputData.turbineInput.highToLowTurbine.operationType, 
    inputData.turbineInput.highToLowTurbine.operationValue1, 
    inputData.turbineInput.highToLowTurbine.operationValue2, 
    inputData.turbineInput.highToLowTurbine.useTurbine
  );
  this.convertNullInputsForObjectConstructor(inputData.turbineInput.highToMediumTurbine);
  let highToMediumTurbineObj = new Module.PressureTurbine(
    inputData.turbineInput.highToMediumTurbine.isentropicEfficiency, 
    inputData.turbineInput.highToMediumTurbine.generationEfficiency, 
    inputData.turbineInput.highToMediumTurbine.operationType, 
    inputData.turbineInput.highToMediumTurbine.operationValue1, 
    inputData.turbineInput.highToMediumTurbine.operationValue2, 
    inputData.turbineInput.highToMediumTurbine.useTurbine
  );
  this.convertNullInputsForObjectConstructor(inputData.turbineInput.mediumToLowTurbine);
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
    // modelerInput.isBaselineCalc, 
    // modelerInput.baselinePowerDemand, 
    inputData.isBaselineCalc,
    inputData.baselinePowerDemand,
    boilerInputObj, 
    headerInputObj, 
    operationsInputObj, 
    turbineInputObj
  );

  let modeler = new Module.SteamModeler();
  let wasmOutput = modeler.model(steamModelerInput);
  console.log(wasmOutput);
  ssmtOutput = this.getSSMTOutputFromWASMOutput(wasmOutput);
  console.log(ssmtOutput);

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

  getSSMTOutputFromWASMOutput(wasmOutput) {
    let ssmtOutput: SSMTOutput =  {
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
    
      // powerGenerated: number;
      // boilerFuelCost: number;
      // makeupWaterCost: number;
      // totalOperatingCost: number;
      // powerGenerationCost: number;
      //boilerFuelUsage: number;
      marginalHPCost: undefined,
      marginalMPCost: undefined,
      marginalLPCost: undefined,
    
    
      // makeupWaterVolumeFlow: number;
      // annualMakeupWaterFlow: number;
    
      lowPressureVentedSteam: undefined,
      heatExchanger: undefined,
    
      // sitePowerImport: number;
      // sitePowerDemand: number;
      operationsOutput: undefined,
    }
    
      ssmtOutput.boilerOutput = this.getBoilerOutput(wasmOutput.boiler);
      ssmtOutput.highPressureHeaderSteam = wasmOutput.highPressureHeaderSteam;
      ssmtOutput.blowdownFlashTank = this.getFlashTankOutput(wasmOutput.blowdownFlashTank);
      ssmtOutput.deaeratorOutput = this.getDeaeratorOutput(wasmOutput.deaerator);
      ssmtOutput.lowPressureVentedSteam = undefined;
      ssmtOutput.operationsOutput = wasmOutput.energyAndCostCalculationsDomain;
      
      if (wasmOutput.highPressureHeaderCalculationsDomain) {
        ssmtOutput.highPressureSteamHeatLoss = wasmOutput.highPressureHeaderCalculationsDomain.highPressureHeaderHeatLoss
        ssmtOutput.highPressureToLowPressureTurbine =  wasmOutput.highPressureHeaderCalculationsDomain.highToLowPressureTurbine
        ssmtOutput.highPressureToLowPressureTurbineIdeal = wasmOutput.highPressureHeaderCalculationsDomain.highToLowPressureTurbineIdeal
        ssmtOutput.highPressureToMediumPressureTurbine = wasmOutput.highPressureHeaderCalculationsDomain.highToMediumPressureTurbine
        // Typo 'Idle' on backend
        ssmtOutput.highPressureToMediumPressureTurbineIdeal = wasmOutput.highPressureHeaderCalculationsDomain.highToMediumPressureTurbineIdle
        ssmtOutput.highPressureCondensateFlashTank = this.getFlashTankOutput(wasmOutput.highPressureHeaderCalculationsDomain.highPressureCondensateFlashTank)
        ssmtOutput.highPressureCondensate = wasmOutput.highPressureHeaderCalculationsDomain.highPressureCondensateFlashTank;
        ssmtOutput.condensingTurbine = wasmOutput.highPressureHeaderCalculationsDomain.condensingTurbine;
        ssmtOutput.condensingTurbineIdeal = wasmOutput.highPressureHeaderCalculationsDomain.condensingTurbineIdeal;
      }

      if (wasmOutput.lowPressureHeaderCalculationsDomain) {
        ssmtOutput.lowPressureHeaderSteam = wasmOutput.lowPressureHeaderCalculationsDomain.lowPressureHeaderCondensate;
        ssmtOutput.lowPressureSteamHeatLoss = wasmOutput.lowPressureHeaderCalculationsDomain.lowPressureHeaderHeatLoss;
        ssmtOutput.mediumPressureToLowPressurePrv = wasmOutput.lowPressureHeaderCalculationsDomain.lowPressurePrv;
        ssmtOutput.lowPressureCondensate = wasmOutput.lowPressureHeaderCalculationsDomain.lowPressureCondensate;
      }
      
      if (wasmOutput.mediumPressureHeaderCalculationsDomain) {
        ssmtOutput.highPressureToMediumPressurePrv = wasmOutput.mediumPressureHeaderCalculationsDomain.highToMediumPressurePrv;
        ssmtOutput.mediumPressureToLowPressureTurbine = wasmOutput.mediumPressureHeaderCalculationsDomain.mediumToLowPressureTurbine;
        ssmtOutput.mediumPressureToLowPressureTurbineIdeal = wasmOutput.mediumPressureHeaderCalculationsDomain.mediumToLowPressureTurbineIdeal;
        // Is this validated correctly in suite?
        ssmtOutput.mediumPressureHeaderSteam = wasmOutput.mediumPressureHeaderCalculationsDomain.mediumPressureCondensate;
        ssmtOutput.mediumPressureSteamHeatLoss = wasmOutput.mediumPressureHeaderCalculationsDomain.mediumPressureHeaderOutput;
        ssmtOutput.mediumPressureCondensate = wasmOutput.mediumPressureHeaderCalculationsDomain.mediumPressureCondensate;
      }
    
      if (wasmOutput.LowPressureFlashedSteamIntoHeaderCalculatorDomain) {
        ssmtOutput.mediumPressureCondensateFlashTank = this.getFlashTankOutput(wasmOutput.LowPressureFlashedSteamIntoHeaderCalculatorDomain.mediumPressureCondensateFlashTank);
      }

      let operationsOutput: SSMTOperationsOutput = {
        powerGenerated: wasmOutput.energyAndCostCalculationsDomain.powerGenerated,
        boilerFuelCost: wasmOutput.energyAndCostCalculationsDomain.boilerFuelCost,
        makeupWaterCost: wasmOutput.energyAndCostCalculationsDomain.makeupWaterCost,
        totalOperatingCost: wasmOutput.energyAndCostCalculationsDomain.totalOperatingCost,
        powerGenerationCost: wasmOutput.energyAndCostCalculationsDomain.powerGenerationCost,
        boilerFuelUsage: wasmOutput.energyAndCostCalculationsDomain.boilerFuelUsage,
        sitePowerImport: wasmOutput.energyAndCostCalculationsDomain.sitePowerImport,
        sitePowerDemand: wasmOutput.energyAndCostCalculationsDomain.powerDemand,
        makeupWaterVolumeFlow: undefined,
        makeupWaterVolumeFlowAnnual: undefined
      }
      
      if (wasmOutput.makeupWaterVolumeFlowCalculationsDomain) {
        operationsOutput.makeupWaterVolumeFlow = wasmOutput.makeupWaterVolumeFlowCalculationsDomain.makeupWaterVolumeFlow;
        operationsOutput.makeupWaterVolumeFlowAnnual = wasmOutput.makeupWaterVolumeFlowCalculationsDomain.makeupWaterVolumeFlow;
      }
      ssmtOutput.operationsOutput = operationsOutput;

      
      if (wasmOutput.makeupWaterAndCondensateHeaderCalculationsDomain) {
        ssmtOutput.combinedCondensate = wasmOutput.makeupWaterAndCondensateHeaderCalculationsDomain.combinedCondensate;
        ssmtOutput.returnCondensate = wasmOutput.makeupWaterAndCondensateHeaderCalculationsDomain.returnCondensate;
        ssmtOutput.condensateFlashTank = wasmOutput.makeupWaterAndCondensateHeaderCalculationsDomain.makeupWater;
        ssmtOutput.makeupWater = wasmOutput.makeupWaterAndCondensateHeaderCalculationsDomain.makeupWater;
        ssmtOutput.makeupWaterAndCondensate = wasmOutput.makeupWaterAndCondensateHeaderCalculationsDomain.makeupWaterAndCondensateHeaderOutput;
        ssmtOutput.heatExchanger = wasmOutput.makeupWaterAndCondensateHeaderCalculationsDomain.heatExchangerOutput;
      }
      
      if (wasmOutput.processSteamUsageCalculationsDomain) {
        wasmOutput.highPressureProcessSteamUsage = wasmOutput.processSteamUsageCalculationsDomain.highPressureProcessSteamUsage;
        wasmOutput.mediumPressureProcessSteamUsage = wasmOutput.processSteamUsageCalculationsDomain.mediumPressureProcessUsagePtr;
        wasmOutput.lowPressureProcessSteamUsage = wasmOutput.processSteamUsageCalculationsDomain.lowPressureProcessUsagePtr;    
      }

      return ssmtOutput;
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

    return output;

  }

  // getHighPressuerHeaderForModeler(header: HeaderWithHighestPressure) {
  //   return {
  //     pressure: header.pressure,
  //     processSteamUsage: header.processSteamUsage,
  //     condensationRecoveryRate: header.condensationRecoveryRate,
  //     heatLoss: header.heatLoss,
  //     // Not on object
  //     flashCondensateIntoHeader: true,
  //     desuperheatSteamIntoNextHighest: true,
  //     desuperheatSteamTemperature: 1,
      
  //     condensateReturnTemperature: header.condensateReturnTemperature,
  //     flashCondensateReturn: header.flashCondensateReturn,
  //   }
  // }
  // getNotHighPressureHeaderObject(header: HeaderNotHighestPressure) {
  //   return new Module.HeaderNotHighestPressure(
  //     header.pressure,
  //     header.processSteamUsage,
  //     header.condensationRecoveryRate,
  //     header.heatLoss,
  //     header.flashCondensateIntoHeader,
  //     header.desuperheatSteamIntoNextHighest,
  //     header.desuperheatSteamTemperature,
  //   );
  // }

  receiverTankGeneral(input: ReceiverTankGeneral): number {
    let ReceiverTank = new Module.ReceiverTank(Module.ReceiverTankMethod.General, input.airDemand, input.allowablePressureDrop, input.atmosphericPressure);
    let output: number = ReceiverTank.calculateSize();
    ReceiverTank.delete();
    return output;
  }

  returnDoubleVector(doublesArray: Array<number>) {
    let doubleVector = new Module.DoubleVector();
    doublesArray.forEach(x => {
      doubleVector.push_back(x);
    });
    return doubleVector;
  }

  convertNullInputsForObjectConstructor(inputObj: Object) {
    for (var prop in inputObj) {
      if (inputObj.hasOwnProperty(prop) && inputObj[prop] === null || inputObj[prop] === undefined) {
        inputObj[prop] = 0;
      }
    }
    return inputObj;
  }

  getInletVector(inletsArray: Array<HeaderInputObj>) {
    let inletVector = new Module.InletVector();
    inletsArray.forEach(inlet => {
      let thermodynamicQuantityType = this.suiteApiEnumService.getThermodynamicQuantityType(inlet.thermodynamicQuantity);
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
