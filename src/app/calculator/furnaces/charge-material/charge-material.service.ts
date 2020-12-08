import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PhastService } from '../../../phast/phast.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../shared/models/operations';
import { ChargeMaterial, ChargeMaterialOutput, ChargeMaterialResult, EnergyData, GasChargeMaterial, LiquidChargeMaterial, LoadChargeMaterial, SolidChargeMaterial } from '../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../shared/models/settings';
import { EnergyFormService } from './energy-form/energy-form.service';
import { GasMaterialFormService } from './gas-material-form/gas-material-form.service';
import { LiquidMaterialFormService } from './liquid-material-form/liquid-material-form.service';
import { SolidMaterialFormService } from './solid-material-form/solid-material-form.service';

@Injectable()
export class ChargeMaterialService {
  baselineData: BehaviorSubject<ChargeMaterial>;
  modificationData: BehaviorSubject<ChargeMaterial>;
  baselineEnergyData: BehaviorSubject<EnergyData>;
  modificationEnergyData: BehaviorSubject<EnergyData>;
  output: BehaviorSubject<ChargeMaterialOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  operatingHours: OperatingHours;
  energySourceType: BehaviorSubject<string>;

  modalOpen: BehaviorSubject<boolean>;
  constructor(private phastService: PhastService,
    private gasMaterialFormService: GasMaterialFormService,
    private liquidMaterialFormService: LiquidMaterialFormService,
    private energyFormService: EnergyFormService,
    private solidMaterialFormService: SolidMaterialFormService,
    private convertUnitsService: ConvertUnitsService
              ) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<ChargeMaterial>(undefined);
    this.modificationData = new BehaviorSubject<ChargeMaterial>(undefined);
    this.baselineEnergyData = new BehaviorSubject<EnergyData>(undefined);
    this.modificationEnergyData = new BehaviorSubject<EnergyData>(undefined);
    this.energySourceType = new BehaviorSubject<string>(undefined);
    this.output = new BehaviorSubject<ChargeMaterialOutput>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  getValidChargeMaterial(chargeMaterial: ChargeMaterial, energyData: EnergyData) {
    let valid: boolean = false;
    if (chargeMaterial.chargeMaterialType == "Liquid") {
      valid = this.liquidMaterialFormService.getLiquidChargeMaterialForm(chargeMaterial, false).valid;
    }
    if (chargeMaterial.chargeMaterialType == "Gas") {
      valid = this.gasMaterialFormService.getGasChargeMaterialForm(chargeMaterial, false).valid;
    }
    if (chargeMaterial.chargeMaterialType == "Solid") {
      valid = this.solidMaterialFormService.getSolidChargeMaterialForm(chargeMaterial, false).valid;
    }
    valid = valid && this.energyFormService.getEnergyForm(energyData).valid;
    return valid;
  }
  calculate(settings: Settings) {
    let baselineChargeMaterial: ChargeMaterial = this.baselineData.getValue();
    let modificationChargeMaterial: ChargeMaterial = this.modificationData.getValue();
    let baselineResults: ChargeMaterialResult;
    let modificationResults: ChargeMaterialResult;
    let baselineEnergyData: EnergyData = this.baselineEnergyData.getValue();
    let modificationEnergyData: EnergyData = this.modificationEnergyData.getValue();

    this.initDefaultEmptyOutput();
    let output: ChargeMaterialOutput = this.output.getValue();
    output.energyUnit = this.getAnnualEnergyUnit(baselineEnergyData.energySourceType, settings);

    let validData = this.getValidChargeMaterial(baselineChargeMaterial, baselineEnergyData);
    if (validData) {
      baselineResults = this.getChargeMaterialResult(baselineChargeMaterial, baselineEnergyData, settings);
        output.baseline = baselineResults;
    }

    if (modificationChargeMaterial) {
      let validModificationData = this.getValidChargeMaterial(modificationChargeMaterial, modificationEnergyData);
      if (validModificationData) {
        modificationResults = this.getChargeMaterialResult(modificationChargeMaterial, modificationEnergyData, settings);
        if (modificationResults) {
          output.modification = modificationResults;
        }
      }
    }

    if (baselineResults && modificationResults) {
      output.fuelSavings = baselineResults.fuelUse - modificationResults.fuelUse;
      output.costSavings = baselineResults.fuelCost - modificationResults.fuelCost;
    }
    this.output.next(output);
  }


  getChargeMaterialResult(chargeMaterialData: ChargeMaterial, energyData: EnergyData, settings: Settings): ChargeMaterialResult {
    let result: ChargeMaterialResult = {
      heatRequired: 0,
      netHeatLoss: 0,
      endoExoHeat: 0,
      grossLoss: 0,
      fuelUse: 0,
      fuelCost: 0
    }
    let loadChargeMaterial: LoadChargeMaterial;
    let availableHeat: number;
    let calculatorEnergyUnit = this.getAnnualEnergyUnit(energyData.energySourceType, settings);
    if (chargeMaterialData.chargeMaterialType == 'Gas' && chargeMaterialData.gasChargeMaterial) {
      loadChargeMaterial = this.phastService.gasLoadChargeMaterial(chargeMaterialData.gasChargeMaterial, settings, calculatorEnergyUnit);
      availableHeat = chargeMaterialData.gasChargeMaterial.availableHeat;
    } else if (chargeMaterialData.chargeMaterialType == 'Liquid' && chargeMaterialData.liquidChargeMaterial) {
      loadChargeMaterial = this.phastService.liquidLoadChargeMaterial(chargeMaterialData.liquidChargeMaterial, settings, calculatorEnergyUnit);
      availableHeat = chargeMaterialData.liquidChargeMaterial.availableHeat;
    }  else if (chargeMaterialData.chargeMaterialType == 'Solid' && chargeMaterialData.solidChargeMaterial) {
      loadChargeMaterial = this.phastService.solidLoadChargeMaterial(chargeMaterialData.solidChargeMaterial, settings, calculatorEnergyUnit);
      availableHeat = chargeMaterialData.solidChargeMaterial.availableHeat;
    }

    result.heatRequired = loadChargeMaterial.grossHeatLoss;
    result.netHeatLoss = loadChargeMaterial.netHeatLoss;
    result.endoExoHeat = loadChargeMaterial.endoExoHeat;
    result.grossLoss =  (loadChargeMaterial.grossHeatLoss / availableHeat) * 100;
    result.fuelUse = result.grossLoss * energyData.hoursPerYear;
    result.fuelCost = result.grossLoss * energyData.hoursPerYear * energyData.fuelCost;

    return result;
  }

  initDefaultEmptyInputs() {
    let emptyBaselineData: ChargeMaterial = {
      chargeMaterialType: '',
      liquidChargeMaterial: undefined,
      gasChargeMaterial: undefined,
      solidChargeMaterial: undefined,
      name: undefined
    };

    let energyData: EnergyData = {
      energySourceType: "Fuel",
      fuelCost: 0,
      hoursPerYear: 8760
    }
    this.baselineData.next(emptyBaselineData);
    this.modificationData.next(undefined);

    this.baselineEnergyData.next(energyData);
    this.modificationEnergyData.next(undefined);
    this.energySourceType.next('Fuel');
  }

  getAnnualEnergyUnit(energySourceType: string, settings: Settings) {
    let energyUnit: string = settings.energyResultUnit;
    if (energySourceType === 'Electricity') {
      energyUnit = 'kWh';
    } else if (settings.unitsOfMeasure === 'Metric') {
      energyUnit = 'GJ';
    } else {
      energyUnit = 'MMBtu';
    }
    return energyUnit;
  }

  initDefaultEmptyOutput() {
     let output: ChargeMaterialOutput = {
      baseline: {
        heatRequired: 0,
        netHeatLoss: 0,
        endoExoHeat: 0,
        grossLoss: 0
      },
      modification: {
        heatRequired: 0,
        netHeatLoss: 0,
        endoExoHeat: 0,
        grossLoss: 0
      }
    };
    this.output.next(output);
  }

  initModification() {
    let currentBaselineData: ChargeMaterial = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    let modification: ChargeMaterial;

    if (currentBaselineCopy.chargeMaterialType == 'Gas') {
      modification = {
        chargeMaterialType: 'Gas',
        liquidChargeMaterial: undefined,
        gasChargeMaterial: currentBaselineCopy.gasChargeMaterial,
        solidChargeMaterial: undefined,
        name: undefined
      };
    } else if (currentBaselineCopy.chargeMaterialType == 'Liquid'){
      modification = {
        chargeMaterialType: 'Liquid',
        liquidChargeMaterial: currentBaselineCopy.liquidChargeMaterial,
        gasChargeMaterial: undefined,
        solidChargeMaterial: undefined,
        name: undefined
      };
    } else {
      modification = {
        chargeMaterialType: 'Solid',
        liquidChargeMaterial: undefined,
        gasChargeMaterial: undefined,
        solidChargeMaterial: currentBaselineCopy.solidChargeMaterial,
        name: undefined
      };
    }

    let currentBaselineEnergy: EnergyData = this.baselineEnergyData.getValue();
    let baselineEnergyCopy: EnergyData = JSON.parse(JSON.stringify(currentBaselineEnergy));
    let modificationEnergy: EnergyData = {
      energySourceType: baselineEnergyCopy.energySourceType,
      fuelCost: baselineEnergyCopy.fuelCost,
      hoursPerYear: baselineEnergyCopy.hoursPerYear
    }

    this.modificationEnergyData.next(modificationEnergy);
    this.modificationData.next(modification);
  }

  generateExampleData(settings: Settings) {
    let baselineChargeMaterial: ChargeMaterial = {
      name: undefined,
      chargeMaterialType: 'Solid',
      solidChargeMaterial: {
        materialId: 1,
        thermicReactionType: 0,
        specificHeatSolid: .16,
        latentHeat: 60,
        specificHeatLiquid: .175,
        meltingPoint: 2800,
        chargeFeedRate: 400000,
        waterContentCharged: 0,
        waterContentDischarged: 0,
        initialTemperature: 60,
        dischargeTemperature: 2300,
        waterVaporDischargeTemperature: 0,
        chargeMelted: 0,
        chargeReacted: 1,
        reactionHeat: 50,
        additionalHeat: 0,
        availableHeat: 100
      }
    };

    let modificationChargeMaterial: ChargeMaterial = {
      name: undefined,
      chargeMaterialType: 'Solid',
      solidChargeMaterial: {
        materialId: 1,
        thermicReactionType: 0,
        specificHeatSolid: .16,
        latentHeat: 60,
        specificHeatLiquid: .175,
        meltingPoint: 2800,
        chargeFeedRate: 400000,
        waterContentCharged: 0,
        waterContentDischarged: 0,
        initialTemperature: 60,
        dischargeTemperature: 1800,
        waterVaporDischargeTemperature: 0,
        chargeMelted: 0,
        chargeReacted: 1,
        reactionHeat: 50,
        additionalHeat: 0,
        availableHeat: 100
      }
    }

    if (settings.unitsOfMeasure != 'Imperial') {
      this.convertSolidChargeMaterial(baselineChargeMaterial.solidChargeMaterial, 'Imperial', 'Metric');
    }

    let energyExample: EnergyData = {
      energySourceType: 'Fuel',
      hoursPerYear: 8760,
      fuelCost: 3.99
    };

    this.energySourceType.next('Fuel');
    this.baselineEnergyData.next(energyExample);
    this.modificationEnergyData.next(energyExample);
    
    this.baselineData.next(baselineChargeMaterial);
    this.modificationData.next(modificationChargeMaterial);

    this.generateExample.next(true);
  }

  checkInitialTemp(material: GasChargeMaterial | LiquidChargeMaterial | SolidChargeMaterial): string {
    if (material.initialTemperature > material.dischargeTemperature) {
      return "Initial Temperature  (" + material.initialTemperature + ") cannot be greater than Outlet Temperature (" + material.dischargeTemperature + ")";
    }
    else {
      return null;
    }
  }

  convertSolidChargeMaterial(solidMaterial: SolidChargeMaterial, currentUnits: string, convertedUnits: string): SolidChargeMaterial {
    if (currentUnits === 'Metric' && convertedUnits === 'Imperial') {
      solidMaterial.meltingPoint = this.convertVal(solidMaterial.meltingPoint, 'C', 'F');
      solidMaterial.initialTemperature = this.convertVal(solidMaterial.initialTemperature, 'C', 'F');
      solidMaterial.dischargeTemperature = this.convertVal(solidMaterial.dischargeTemperature, 'C', 'F');
      solidMaterial.waterVaporDischargeTemperature = this.convertVal(solidMaterial.waterVaporDischargeTemperature, 'C', 'F');
      solidMaterial.chargeFeedRate = this.convertVal(solidMaterial.chargeFeedRate, 'kg', 'lb');
      solidMaterial.reactionHeat = this.convertVal(solidMaterial.reactionHeat, 'kJkg', 'btuLb');
      solidMaterial.additionalHeat = this.convertVal(solidMaterial.additionalHeat, 'kJ', 'Btu');
      solidMaterial.specificHeatLiquid = this.convertVal(solidMaterial.specificHeatLiquid, 'kJkgC', 'btulbF');
      solidMaterial.specificHeatSolid = this.convertVal(solidMaterial.specificHeatSolid, 'kJkgC', 'btulbF');
      solidMaterial.latentHeat = this.convertVal(solidMaterial.latentHeat, 'kJkg', 'btuLb');
    } else if (currentUnits === 'Imperial' && convertedUnits === 'Metric') {
      solidMaterial.meltingPoint = this.convertVal(solidMaterial.meltingPoint, 'F', 'C');
      solidMaterial.initialTemperature = this.convertVal(solidMaterial.initialTemperature, 'F', 'C');
      solidMaterial.dischargeTemperature = this.convertVal(solidMaterial.dischargeTemperature, 'F', 'C');
      solidMaterial.waterVaporDischargeTemperature = this.convertVal(solidMaterial.waterVaporDischargeTemperature, 'F', 'C');
      solidMaterial.chargeFeedRate = this.convertVal(solidMaterial.chargeFeedRate, 'lb', 'kg');
      solidMaterial.reactionHeat = this.convertVal(solidMaterial.reactionHeat, 'btuLb', 'kJkg');
      solidMaterial.additionalHeat = this.convertVal(solidMaterial.additionalHeat, 'Btu', 'kJ');
      solidMaterial.specificHeatLiquid = this.convertVal(solidMaterial.specificHeatLiquid, 'btulbF', 'kJkgC');
      solidMaterial.specificHeatSolid = this.convertVal(solidMaterial.specificHeatSolid, 'btulbF', 'kJkgC');
      solidMaterial.latentHeat = this.convertVal(solidMaterial.latentHeat, 'btuLb', 'kJkg');
    }
    return solidMaterial;
  }

  convertVal(val: number, from: string, to: string) {
    if (val !== undefined) {
      val = this.convertUnitsService.value(val).from(from).to(to);
      val = this.roundVal(val, 4);
    }
    return val;
  }

  roundVal(val: number, digits: number) {
    return Number(val.toFixed(digits));

  }

}