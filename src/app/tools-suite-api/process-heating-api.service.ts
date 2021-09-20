import { Injectable } from '@angular/core';
import { AirHeatingInput, AirHeatingOutput } from '../shared/models/phast/airHeating';
import { EfficiencyImprovementInputs, EfficiencyImprovementOutputs } from '../shared/models/phast/efficiencyImprovement';
import { EnergyEquivalencyElectric, EnergyEquivalencyElectricOutput, EnergyEquivalencyFuel, EnergyEquivalencyFuelOutput } from '../shared/models/phast/energyEquivalency';
import { FlowCalculations, FlowCalculationsOutput } from '../shared/models/phast/flowCalculations';
import { HeatCascadingInput, HeatCascadingOutput } from '../shared/models/phast/heatCascading';
import { AtmosphereLoss } from '../shared/models/phast/losses/atmosphereLoss';
import { AuxiliaryPowerLoss } from '../shared/models/phast/losses/auxiliaryPowerLoss';
import { GasChargeMaterial, LiquidChargeMaterial, SolidChargeMaterial } from '../shared/models/phast/losses/chargeMaterial';
import { GasCoolingLoss, LiquidCoolingLoss } from '../shared/models/phast/losses/coolingLoss';
import { EnergyInputEAF } from '../shared/models/phast/losses/energyInputEAF';
import { EnergyInputExhaustGasLoss } from '../shared/models/phast/losses/energyInputExhaustGasLosses';
import { ExhaustGasEAF } from '../shared/models/phast/losses/exhaustGasEAF';
import { FixtureLoss } from '../shared/models/phast/losses/fixtureLoss';
import { FlueGasByMass, FlueGasByVolume, MaterialInputProperties } from '../shared/models/phast/losses/flueGas';
import { LeakageLoss } from '../shared/models/phast/losses/leakageLoss';
import { CircularOpeningLoss, QuadOpeningLoss, ViewFactorInput } from '../shared/models/phast/losses/openingLoss';
import { Slag } from '../shared/models/phast/losses/slag';
import { WallLoss } from '../shared/models/phast/losses/wallLoss';
import { O2Enrichment, RawO2Output } from '../shared/models/phast/o2Enrichment';
import { WasteHeatInput, WasteHeatOutput } from '../shared/models/phast/wasteHeat';
import { WaterHeatingInput, WaterHeatingOutput } from '../shared/models/steam/waterHeating';
import { SuiteApiHelperService } from './suite-api-helper.service';

declare var Module: any;
@Injectable()
export class ProcessHeatingApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService) { }

  atmosphere(input: AtmosphereLoss): number {
    input.inletTemperature = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.inletTemperature); 
    input.outletTemperature = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.outletTemperature); 
    input.flowRate = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.flowRate); 
    input.correctionFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.correctionFactor); 
    input.specificHeat = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.specificHeat);    

    let AtmosphereInstance = new Module.Atmosphere(input.inletTemperature, input.outletTemperature, input.flowRate, input.correctionFactor, input.specificHeat);
    let output = AtmosphereInstance.getTotalHeat();
    AtmosphereInstance.delete();
    return output;
  }

  fixtureLosses(input: FixtureLoss): number {
    // TODO don't need to convert all
    input.specificHeat = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.specificHeat);
    input.feedRate = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.feedRate); 
    input.initialTemperature = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.initialTemperature); 
    input.finalTemperature = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.finalTemperature); 
    input.correctionFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.correctionFactor);    
    
    let FixtureInstance = new Module.FixtureLosses(input.specificHeat, input.feedRate, input.initialTemperature, input.finalTemperature, input.correctionFactor);
    let output = FixtureInstance.getHeatLoss();
    FixtureInstance.delete();
    return output;
  }

  gasCoolingLosses(input: GasCoolingLoss): number {
    let CoolingInstance = new Module.GasCoolingLosses(
      input.flowRate, input.initialTemperature,
      input.finalTemperature, input.specificHeat,
      input.correctionFactor, input.gasDensity
    );
    let output = CoolingInstance.getHeatLoss();
    CoolingInstance.delete();
    return output;
  }

  liquidCoolingLosses(input: LiquidCoolingLoss): number {
    let LiquidCoolingInstance = new Module.GasCoolingLosses(
      input.flowRate, input.density,
      input.initialTemperature, input.outletTemperature,
      input.specificHeat, input.correctionFactor,
    );
    let output: number = LiquidCoolingInstance.getHeatLoss();
    LiquidCoolingInstance.delete();
    return output;
  }

  gasLoadChargeMaterial(input: GasChargeMaterial): number {
    let thermicReactionType = this.suiteApiHelperService.getMaterialThermicReactionType(input.thermicReactionType);
    let GasChargeMaterialInstance = new Module.GasLoadChargeMaterial(
      thermicReactionType,
      input.specificHeatGas,
      input.feedRate,
      input.percentVapor,
      input.initialTemperature,
      input.dischargeTemperature,
      input.specificHeatVapor,
      input.percentReacted,
      input.reactionHeat,
      input.additionalHeat
    );
    let output: number = GasChargeMaterialInstance.getTotalHeat();
    GasChargeMaterialInstance.delete();
    return output;
  }

  liquidLoadChargeMaterial(input: LiquidChargeMaterial): number {
    let thermicReactionType = this.suiteApiHelperService.getMaterialThermicReactionType(input.thermicReactionType);
    let LiquidChargeMaterialInstance = new Module.LiquidLoadChargeMaterial(
      thermicReactionType,
      input.specificHeatLiquid, 
      input.vaporizingTemperature, 
      input.latentHeat,       
      input.specificHeatVapor, 
      input.chargeFeedRate, 
      input.initialTemperature, 
      input.dischargeTemperature,                            
      input.percentVaporized, 
      input.percentReacted, 
      input.reactionHeat, 
      input.additionalHeat
    );
    let output: number = LiquidChargeMaterialInstance.getTotalHeat();
    LiquidChargeMaterialInstance.delete();
    return output;
  }

  solidLoadChargeMaterial(input: SolidChargeMaterial): number {
    let thermicReactionType = this.suiteApiHelperService.getMaterialThermicReactionType(input.thermicReactionType);
    let SolidChargeMaterialInstance = new Module.SolidLoadChargeMaterial(
      thermicReactionType,
      input.specificHeatSolid, 
      input.latentHeat, 
      input.specificHeatLiquid, 
      input.meltingPoint, 
      input.chargeFeedRate, 
      input.waterContentCharged, 
      input.waterContentDischarged,
      input.initialTemperature, 
      input.dischargeTemperature, 
      input.waterVaporDischargeTemperature, 
      input.chargeMelted, 
      input.chargeReacted, 
      input.reactionHeat, 
      input.additionalHeat
    );
    let output: number = SolidChargeMaterialInstance.getTotalHeat();
    SolidChargeMaterialInstance.delete();
    return output;
  }

  viewFactorCalculation(input: ViewFactorInput): number {
    let OpeningLossesInstance = new Module.OpeningLosses();
    let output;

    if (input.openingShape == 0) {
      // TODO find and change defaults for input where this is init
      if (input.thickness != 0 && input.diameter != 0) {
        
        output = OpeningLossesInstance.calculateViewFactorCircular(input.thickness, input.diameter);
      }
    } else {
      if (input.thickness != 0 && input.length != 0 && input.width != 0) {
        output = OpeningLossesInstance.calculateViewFactorQuad(input.thickness, input.length, input.width);
      }
    }

    OpeningLossesInstance.delete();
    return output;
  }

  openingLossesQuad(input: QuadOpeningLoss): number {  
    let OpeningLossesQuadInstance = new Module.OpeningLosses(
      input.emissivity, input.length,
      input.width, input.thickness, input.ratio, input.ambientTemperature,
      input.insideTemperature, input.percentTimeOpen, input.viewFactor);

    let output: number = OpeningLossesQuadInstance.getHeatLoss();
    OpeningLossesQuadInstance.delete();
    return output;
  }

  openingLossesCircular(input: CircularOpeningLoss): number {
    let OpeningLossesCircularInstance = new Module.OpeningLosses(
      input.emissivity, input.diameter,
      input.thickness, input.ratio, input.ambientTemperature,
      input.insideTemperature, input.percentTimeOpen, input.viewFactor);

    let output: number = OpeningLossesCircularInstance.getHeatLoss();
    OpeningLossesCircularInstance.delete();
    return output;
  }


  wallLosses(input: WallLoss): number {
    input.surfaceArea = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.surfaceArea); 
    input.ambientTemperature = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.ambientTemperature); 
    input.surfaceTemperature = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.surfaceTemperature);
    input.windVelocity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.windVelocity); 
    input.surfaceEmissivity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.surfaceEmissivity); 
    input.conditionFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.conditionFactor);
    input.correctionFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.correctionFactor); 

    let WallLossesInstance = new Module.WallLosses(
      input.surfaceArea, input.ambientTemperature, input.surfaceTemperature,
      input.windVelocity, input.surfaceEmissivity, input.conditionFactor,
      input.correctionFactor
    );
    let output: number = WallLossesInstance.getHeatLoss();
    WallLossesInstance.delete();
    return output;
  }

  leakageLosses(input: LeakageLoss): number {
    // TODO don't need all
    input.draftPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.draftPressure);
    input.openingArea = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.openingArea);
    input.leakageGasTemperature = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.leakageGasTemperature);
    input.ambientTemperature = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.ambientTemperature);
    input.coefficient = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.coefficient);
    input.specificGravity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.specificGravity);
    input.correctionFactor = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.correctionFactor);
    
    let LeakageLossesInstance = new Module.LeakageLosses(
      input.draftPressure, input.openingArea, input.leakageGasTemperature,
      input.ambientTemperature, input.coefficient,
      input.specificGravity, input.correctionFactor
    );
    let output: number = LeakageLossesInstance.getExfiltratedGasesHeatContent();
    LeakageLossesInstance.delete();
    return output;
  }

  flueGasLossesByVolume(input: FlueGasByVolume): number {
    let GasCompositions = new Module.GasCompositions(
      "", 
      input.CH4, 
      input.C2H6, 
      input.N2, 
      input.H2, 
      input.C3H8,
      input.C4H10_CnH2n, 
      input.H2O, 
      input.CO, 
      input.CO2, 
      input.SO2, 
      input.O2
    );

    let FlueGasLossByVolumeInstance = new Module.GasFlueGasMaterial(
      input.flueGasTemperature, 
      input.excessAirPercentage, 
      input.combustionAirTemperature,
      GasCompositions, 
      input.fuelTemperature
    );
    let output: number = FlueGasLossByVolumeInstance.getHeatLoss();
    FlueGasLossByVolumeInstance.delete();
    return output;
  }

  flueGasLossesByMass(input: FlueGasByMass): number {
    let SolidLiquidFlueGasMaterial = new Module.SolidLiquidFlueGasMaterial(
      input.flueGasTemperature, 
      input.excessAirPercentage, 
      input.combustionAirTemperature,
      input.fuelTemperature, 
      input.moistureInAirComposition, 
      input.ashDischargeTemperature,                            
      input.unburnedCarbonInAsh, 
      input.carbon, 
      input.hydrogen, 
      input.sulphur, 
      input.inertAsh, 
      input.o2, 
      input.moisture,
      input.nitrogen
    );

    let output: number = SolidLiquidFlueGasMaterial.getHeatLoss();
    SolidLiquidFlueGasMaterial.delete();
    return output;
  }

  flueGasCalculateExcessAir(input: MaterialInputProperties): number {
    let GasCompositions = new Module.GasCompositions(
      "", 
      input.CH4, 
      input.C2H6, 
      input.N2, 
      input.H2, 
      input.C3H8,
      input.C4H10_CnH2n, 
      input.H2O, 
      input.CO, 
      input.CO2, 
      input.SO2, 
      input.O2
    );

    input.o2InFlueGas = input.o2InFlueGas / 100;
    let output: number = GasCompositions.calculateExcessAir(input.o2InFlueGas);
    output = output * 100;

    GasCompositions.delete();
    return output;
  }

  flueGasCalculateO2(input: MaterialInputProperties): number {
    let GasCompositions = new Module.GasCompositions(
      "", 
      input.CH4, 
      input.C2H6, 
      input.N2, 
      input.H2, 
      input.C3H8,
      input.C4H10_CnH2n, 
      input.H2O, 
      input.CO, 
      input.CO2, 
      input.SO2, 
      input.O2
    );

    input.excessAir = input.excessAir / 100;
    let output: number = GasCompositions.calculateO2(input.excessAir);
    output = output * 100;
    
    GasCompositions.delete();
    return output;
  }

  flueGasByMassCalculateExcessAir(input: MaterialInputProperties): number {
    input.o2InFlueGas = input.o2InFlueGas / 100;
    input.carbon = input.carbon / 100;
    input.hydrogen = input.hydrogen / 100;
    input.sulphur = input.sulphur / 100;
    input.inertAsh = input.inertAsh / 100;
    input.o2 = input.o2 / 100;
    input.moisture = input.moisture / 100;
    input.nitrogen = input.nitrogen / 100;

    
    // todo fix phast 4855
    input.moistureInAirCombustion = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.moistureInAirCombustion)
    let SolidLiquidFlueGasMaterial = new Module.SolidLiquidFlueGasMaterial(
      input.o2InFlueGas, 
      input.carbon,
      input.hydrogen, 
      input.sulphur, 
      input.inertAsh,
      input.o2, 
      input.moisture, 
      input.nitrogen,
      input.moistureInAirCombustion
      );

    let output: number = SolidLiquidFlueGasMaterial.calculateExcessAirFromFlueGasO2();
    output = output * 100;
    
    SolidLiquidFlueGasMaterial.delete();
    return output;
  }

  flueGasByMassCalculateO2(input: MaterialInputProperties): number {
    input.excessAir = input.excessAir / 100;
    input.carbon = input.carbon / 100;
    input.hydrogen = input.hydrogen / 100;
    input.sulphur = input.sulphur / 100;
    input.inertAsh = input.inertAsh / 100;
    input.o2 = input.o2 / 100;
    input.moisture = input.moisture / 100;
    input.nitrogen = input.nitrogen / 100;

    let SolidLiquidFlueGasMaterial = new Module.SolidLiquidFlueGasMaterial();

    
    // todo fix phast 4855
    input.moistureInAirCombustion = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.moistureInAirCombustion)
    let output: number = SolidLiquidFlueGasMaterial.calculateFlueGasO2(
      input.excessAir, 
      input.carbon,
      input.hydrogen, 
      input.sulphur,
      input.inertAsh, 
      input.o2, 
      input.moisture,
      input.nitrogen, 
      input.moistureInAirCombustion);
    output = output * 100;
    
    SolidLiquidFlueGasMaterial.delete();
    return output;
  }

  flueGasByVolumeCalculateHeatingValue(input: MaterialInputProperties): HeatingValueByVolumeOutput {
    let GasCompositions = new Module.GasCompositions(
      "", 
      input.CH4, 
      input.C2H6, 
      input.N2, 
      input.H2, 
      input.C3H8,
      input.C4H10_CnH2n, 
      input.H2O, 
      input.CO, 
      input.CO2, 
      input.SO2, 
      input.O2
    );

    let output: HeatingValueByVolumeOutput = {
      heatingValue: GasCompositions.getHeatingValue(),
      heatingValueVolume: GasCompositions.getHeatingValueVolume(),
      specificGravity: GasCompositions.getSpecificGravity(),
    }
    
    GasCompositions.delete();
    return output;
  }

  flueGasByMassCalculateHeatingValue(input: MaterialInputProperties): number {
    let SolidLiquidFlueGasMaterial = new Module.SolidLiquidFlueGasMaterial();

    let output: number = SolidLiquidFlueGasMaterial.calculateHeatingValueFuel(
      input.carbon, 
      input.hydrogen,
      input.sulphur, 
      input.inertAsh, 
      input.o2,
      input.moisture, 
      input.nitrogen);
    output = output * 100;
    
    SolidLiquidFlueGasMaterial.delete();
    return output;
  }

  slagOtherMaterialLosses(input: Slag): number {
    let SlagInstance = new Module.SlagOtherMaterialLosses(
      input.weight, input.inletTemperature,
      input.outletTemperature, input.specificHeat,
      input.correctionFactor,
    );
    let output: number = SlagInstance.getHeatLoss();
    SlagInstance.delete();
    return output;
  }

  auxiliaryPowerLoss(input: AuxiliaryPowerLoss): number {
    let AuxPowerInstance = new Module.AuxiliaryPower(
      input.motorPhase, input.supplyVoltage,
      input.avgCurrent, input.powerFactor,
    );
    let output: number = AuxPowerInstance.getPowerUsed();
    AuxPowerInstance.delete();
    return output;
  }

  energyInputEAF(input: EnergyInputEAF): EnergyEAFOutput {
    input.naturalGasHeatInput = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.naturalGasHeatInput);
    input.coalCarbonInjection = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.coalCarbonInjection);
    input.coalHeatingValue = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.coalHeatingValue);
    input.electrodeUse = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.electrodeUse);
    input.electrodeHeatingValue = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.electrodeHeatingValue);
    input.otherFuels = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.otherFuels);
    input.electricityInput = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.electricityInput);
    
    let EnergyInputEAFInstance = new Module.EnergyInputEAF(
      input.naturalGasHeatInput, input.coalCarbonInjection,
      input.coalHeatingValue, input.electrodeUse,
      input.electrodeHeatingValue, input.otherFuels,
      input.electricityInput
    );
    let output: EnergyEAFOutput = {
      heatDelivered: EnergyInputEAFInstance.getHeatDelivered(),
      totalChemicalEnergyInput: EnergyInputEAFInstance.getTotalChemicalEnergyInput()
    }

    EnergyInputEAFInstance.delete();
    return output;
  }

  exhaustGasEAF(input: ExhaustGasEAF): number {
    let ExhaustGasEAFInstance = new Module.ExhaustGasEAF(
      input.offGasTemp, input.CO,
      input.H2, input.combustibleGases, input.vfr,
      input.dustLoading,
    );
    let output: number = ExhaustGasEAFInstance.getTotalHeatExhaust();

    ExhaustGasEAFInstance.delete();
    return output;
  }

  energyInputExhaustGasLosses(input: EnergyInputExhaustGasLoss): EnergyExhaustGasOutput {
    
    // todo fix phast 4855
    input.excessAir = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.excessAir);
    input.combustionAirTemp = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.combustionAirTemp);
    input.exhaustGasTemp = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.exhaustGasTemp);
    input.totalHeatInput = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.totalHeatInput);
    
    let EnergyInputExhaustGasInstance = new Module.EnergyInputExhaustGasLosses(
      input.excessAir, input.combustionAirTemp,
      input.exhaustGasTemp, input.totalHeatInput,
    );

    let output: EnergyExhaustGasOutput = {
      heatDelivered: EnergyInputExhaustGasInstance.getHeatDelivered(),
      exhaustGasLosses: EnergyInputExhaustGasInstance.getExhaustGasLosses(),
      availableHeat: EnergyInputExhaustGasInstance.getAvailableHeat(),
    }

    EnergyInputExhaustGasInstance.delete();
    return output;
  }

  efficiencyImprovement(input: EfficiencyImprovementInputs): EfficiencyImprovementOutputs {
    input.currentFlueGasOxygen = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.currentFlueGasOxygen)
    input.newFlueGasOxygen = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.newFlueGasOxygen)
    input.currentFlueGasTemp = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.currentFlueGasTemp)
    input.newFlueGasTemp = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.newFlueGasTemp)
    input.currentCombustionAirTemp = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.currentCombustionAirTemp)
    input.newCombustionAirTemp = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.newCombustionAirTemp)
    input.currentEnergyInput = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.currentEnergyInput)

    let EfficiencyImprovementInstance = new Module.EfficiencyImprovement(
      input.currentFlueGasOxygen,
      input.newFlueGasOxygen,
      input.currentFlueGasTemp,
      input.newFlueGasTemp,
      input.currentCombustionAirTemp,
      input.newCombustionAirTemp,
      input.currentEnergyInput
    );

    let output: EfficiencyImprovementOutputs = {
      currentExcessAir: EfficiencyImprovementInstance.getCurrentExcessAir(),
      newExcessAir: EfficiencyImprovementInstance.getNewExcessAir(),
      currentAvailableHeat: EfficiencyImprovementInstance.getCurrentAvailableHeat(),
      newAvailableHeat: EfficiencyImprovementInstance.getNewAvailableHeat(),
      newFuelSavings: EfficiencyImprovementInstance.getNewFuelSavings(),
      newEnergyInput: EfficiencyImprovementInstance.getNewEnergyInput(),
    }

    EfficiencyImprovementInstance.delete();
    return output;
  }

  energyEquivalencyElectric(input: EnergyEquivalencyElectric): EnergyEquivalencyElectricOutput {
    input.fuelFiredEfficiency = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.fuelFiredEfficiency);
    input.electricallyHeatedEfficiency = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.electricallyHeatedEfficiency);
    input.fuelFiredHeatInput = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.fuelFiredHeatInput);

    let EnergyEquivalencyElectricInstance = new Module.ElectricalEnergyEquivalency(
      input.fuelFiredEfficiency,
      input.electricallyHeatedEfficiency,
      input.fuelFiredHeatInput
    );

    let output: EnergyEquivalencyElectricOutput = {
      electricalHeatInput: EnergyEquivalencyElectricInstance.getElectricalHeatInput()
    };

    EnergyEquivalencyElectricInstance.delete();
    return output;
  }

  energyEquivalencyFuel(input: EnergyEquivalencyFuel): EnergyEquivalencyFuelOutput {
    input.electricallyHeatedEfficiency = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.electricallyHeatedEfficiency);
    input.fuelFiredEfficiency = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.fuelFiredEfficiency);
    input.electricalHeatInput = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.electricalHeatInput);

    let EnergyEquivalencyFuelInstance = new Module.FuelFiredEnergyEquivalency(
      input.electricallyHeatedEfficiency,
      input.fuelFiredEfficiency,
      input.electricalHeatInput
    );

    let output: EnergyEquivalencyFuelOutput = {
      fuelFiredHeatInput: EnergyEquivalencyFuelInstance.getFuelFiredHeatInput()
    };

    EnergyEquivalencyFuelInstance.delete();
    return output;
  }

  flowCalculations(input: FlowCalculations): FlowCalculationsOutput {
    let gasType = this.suiteApiHelperService.getFlowCalculationGasTypeEnum(input.gasType);
    let section = this.suiteApiHelperService.getFlowCalculationSectionEnum(input.sectionType);

    input.operatingTime = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.operatingTime)
    input.specificGravity = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.specificGravity)
    input.orificeDiameter = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificeDiameter)
    input.insidePipeDiameter = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.insidePipeDiameter)
    input.dischargeCoefficient = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.dischargeCoefficient)
    input.gasHeatingValue = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.gasHeatingValue)
    input.gasTemperature = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.gasTemperature)
    input.gasPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.gasPressure)
    input.orificePressureDrop = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.orificePressureDrop)

    let FlowCalculationsInstance = new Module.FlowCalculationsEnergyUse(
      gasType,
      input.specificGravity,
      input.orificeDiameter,
      input.insidePipeDiameter,
      section,
      input.dischargeCoefficient,
      input.gasHeatingValue,
      input.gasTemperature,
      input.gasPressure,
      input.orificePressureDrop,
      input.operatingTime
    );

    let output: FlowCalculationsOutput = {
      flow: FlowCalculationsInstance.getFlow(),
      heatInput: FlowCalculationsInstance.getHeatInput(),
      totalFlow: FlowCalculationsInstance.getTotalFlow(),
    }

    FlowCalculationsInstance.delete();
    return output;
  }

  o2Enrichment(input: O2Enrichment):RawO2Output {
    input.o2CombAir = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.o2CombAir);
    input.o2CombAirEnriched = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.o2CombAirEnriched);
    input.flueGasTemp = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.flueGasTemp); 
    input.flueGasTempEnriched = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.flueGasTempEnriched);
    input.o2FlueGas = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.o2FlueGas); 
    input.o2FlueGasEnriched = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.o2FlueGasEnriched);
    input.combAirTemp = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.combAirTemp); 
    input.combAirTempEnriched = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.combAirTempEnriched);
    input.fuelConsumption = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(input.fuelConsumption);

    let O2EnrichmentInstance = new Module.O2Enrichment(
      input.o2CombAir, input.o2CombAirEnriched,
      input.flueGasTemp, input.flueGasTempEnriched,
      input.o2FlueGas, input.o2FlueGasEnriched,
      input.combAirTemp, input.combAirTempEnriched,
      input.fuelConsumption
    );
    let output: RawO2Output = this.getO2EnrichmentOutput(O2EnrichmentInstance);
    O2EnrichmentInstance.delete();
    return output;
  }

  getO2EnrichmentOutput(instance): RawO2Output {
    return {
      availableHeatInput: instance.getAvailableHeat(),
      availableHeatEnriched: instance.getAvailableHeatEnriched(),
      fuelSavingsEnriched: instance.getFuelSavingsEnriched(),
      fuelConsumptionEnriched: instance.getFuelConsumptionEnriched(),
    }
  }

  //Process heat addon
  waterHeatingUsingSteam(input: WaterHeatingInput): WaterHeatingOutput {
    let WaterHeatingInstance = new Module.WaterHeatingUsingSteam();
    let output: WaterHeatingOutput = WaterHeatingInstance.calculate(
      input.pressureSteamIn, input.flowSteamRate,
      input.temperatureWaterIn, input.pressureWaterOut,
      input.flowWaterRate, input.tempMakeupWater,
      input.presMakeupWater, input.effWaterHeater,
      input.effBoiler, input.operatingHours
    );
    WaterHeatingInstance.delete();
    return output;
  }

  airHeatingUsingExhaust(input: AirHeatingInput): AirHeatingOutput {
    let airHeatingInstance;
    let output: AirHeatingOutput;
    if (input.gasFuelType) {
      let GasCompositions = new Module.GasCompositions(
        input.substance, 
        input.CH4, 
        input.C2H6, 
        input.N2, 
        input.H2, 
        input.C3H8, 
        input.C4H10_CnH2n, 
        input.H2O, 
        input.CO, 
        input.CO2, 
        input.SO2, 
        input.O2
      );
      airHeatingInstance = new Module.AirHeatingUsingExhaust(GasCompositions);
    } else {
      let SolidLiquidFlueGasMaterial = new Module.SolidLiquidFlueGasMaterial(
        input.substance, 
        input.carbon, 
        input.hydrogen, 
        input.sulphur, 
        input.inertAsh, 
        input.o2, 
        input.moisture, 
        input.nitrogen
      );
      airHeatingInstance = new Module.AirHeatingUsingExhaust(SolidLiquidFlueGasMaterial);
    }
    
    output = airHeatingInstance.calculate(
      input.flueTemperature,
      input.excessAir, 
      input.fireRate,
      input.airflow, 
      input.inletTemperature,
      input.heaterEfficiency, 
      input.hxEfficiency, 
      input.operatingHours
    );

    airHeatingInstance.delete();
    return output;
  }

  cascadeHeatHighToLow(input: HeatCascadingInput): HeatCascadingOutput {
    let GasCompositions =  new Module.GasCompositions(
      'Gas', 
      input.CH4, 
      input.C2H6, 
      input.N2, 
      input.H2, 
      input.C3H8, 
      input.C4H10_CnH2n, 
      input.H2O, 
      input.CO, 
      input.CO2, 
      input.SO2, 
      input.O2
    );

    let cascadeHeatHighToLowInstance = new Module.CascadeHeatHighToLow(
      GasCompositions,
      input.priFiringRate, 
      input.priExhaustTemperature, 
      input.priExhaustO2, 
      input.priCombAirTemperature, 
      input.priOpHours, 
      input.priFuelHV,
      input.secFiringRate,
      input.secExhaustTemperature, 
      input.secCombAirTemperature, 
      input.secOpHours, 
      input.secFuelCost
    );

    let output: HeatCascadingOutput = cascadeHeatHighToLowInstance.calculate();
    cascadeHeatHighToLowInstance.delete();
    return output;
  }

  waterHeatingUsingExhaust(input: WasteHeatInput): WasteHeatOutput {
    let WaterHeatingInstance = new Module.WaterHeatingUsingExhaust();
    let output: WasteHeatOutput = WaterHeatingInstance.calculate(input.availableHeat, input.heatInput,
      input.hxEfficiency, input.chillerInTemperature,
      input.chillerOutTemperature, input.copChiller,
      input.chillerEfficiency, input.copCompressor);
    WaterHeatingInstance.delete();
    return output;
  }

}


export interface EnergyEAFOutput {
  heatDelivered: number,
  totalChemicalEnergyInput: number
}

export interface EnergyExhaustGasOutput {
  heatDelivered: number,
  exhaustGasLosses: number,
  availableHeat: number
}

export interface HeatingValueByVolumeOutput {
  heatingValue: number,
  heatingValueVolume: number,
  specificGravity: number,
}