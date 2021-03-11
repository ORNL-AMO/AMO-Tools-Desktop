import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
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
  baselineData: BehaviorSubject<Array<ChargeMaterial>>;
  modificationData: BehaviorSubject<Array<ChargeMaterial>>;
  baselineEnergyData: BehaviorSubject<EnergyData>;
  modificationEnergyData: BehaviorSubject<EnergyData>;
  output: BehaviorSubject<ChargeMaterialOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  operatingHours: OperatingHours;
  energySourceType: BehaviorSubject<string>;

  collapseMapping: BehaviorSubject<{[index: number]: boolean }>;

  modalOpen: BehaviorSubject<boolean>;
  constructor(private phastService: PhastService,
    private gasMaterialFormService: GasMaterialFormService,
    private liquidMaterialFormService: LiquidMaterialFormService,
    private energyFormService: EnergyFormService,
    private solidMaterialFormService: SolidMaterialFormService,
    private convertUnitsService: ConvertUnitsService
              ) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<Array<ChargeMaterial>>(undefined);
    this.modificationData = new BehaviorSubject<Array<ChargeMaterial>>(undefined);
    this.baselineEnergyData = new BehaviorSubject<EnergyData>(undefined);
    this.modificationEnergyData = new BehaviorSubject<EnergyData>(undefined);
    this.energySourceType = new BehaviorSubject<string>(undefined);
    this.output = new BehaviorSubject<ChargeMaterialOutput>(undefined);
    
    this.collapseMapping = new BehaviorSubject<{[index: number]: boolean }>({});
    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  getValidChargeMaterial(chargeMaterial: ChargeMaterial, energyData: EnergyData) {
    let valid: boolean = false;
    if (chargeMaterial.chargeMaterialType == "Liquid" && chargeMaterial.liquidChargeMaterial) {
      valid = this.liquidMaterialFormService.getLiquidChargeMaterialForm(chargeMaterial, false).valid;
    }
    if (chargeMaterial.chargeMaterialType == "Gas" && chargeMaterial.gasChargeMaterial) {
      valid = this.gasMaterialFormService.getGasChargeMaterialForm(chargeMaterial, false).valid;
    }
    if (chargeMaterial.chargeMaterialType == "Solid" && chargeMaterial.solidChargeMaterial) {
      valid = this.solidMaterialFormService.getSolidChargeMaterialForm(chargeMaterial, false).valid;
    }
    valid = valid && this.energyFormService.getEnergyForm(energyData).valid;
    return valid;
  }

  calculate(settings: Settings) {
    let baselineChargeMaterial: Array<ChargeMaterial> = this.baselineData.getValue();
    let modificationChargeMaterial: Array<ChargeMaterial> = this.modificationData.getValue();
    let baselineResults: ChargeMaterialResult;
    let modificationResults: ChargeMaterialResult;
    let baselineEnergyData: EnergyData = this.baselineEnergyData.getValue();
    let modificationEnergyData: EnergyData = this.modificationEnergyData.getValue();

    this.initDefaultEmptyOutput();
    let output: ChargeMaterialOutput = this.output.getValue();
    output.energyUnit = this.getAnnualEnergyUnit(baselineEnergyData.energySourceType, settings);

    baselineChargeMaterial.forEach((loss, index) => {
      let validBaseline = this.getValidChargeMaterial(loss, baselineEnergyData);
      baselineResults = this.getChargeMaterialResult(loss, baselineEnergyData, validBaseline, settings);
      output.baseline.losses.push(baselineResults);
      output.baseline.totalFuelUse += baselineResults.fuelUse;
      output.baseline.totalFuelCost += baselineResults.fuelCost;
      output.baseline.grossLoss += baselineResults.grossLoss;

        if (modificationChargeMaterial && modificationChargeMaterial[index]) {
          let validModification = this.getValidChargeMaterial(modificationChargeMaterial[index], modificationEnergyData);
          modificationResults = this.getChargeMaterialResult(modificationChargeMaterial[index], modificationEnergyData, validModification, settings);
          if (modificationResults) {
            output.modification.losses.push(modificationResults);
            output.modification.totalFuelUse += modificationResults.fuelUse;
            output.modification.totalFuelCost += modificationResults.fuelCost;
            output.modification.grossLoss += modificationResults.grossLoss;
          }
        }
    });

    if (baselineResults && modificationResults) {
      output.fuelSavings = output.baseline.totalFuelUse - output.modification.totalFuelUse;
      output.costSavings = output.baseline.totalFuelCost - output.modification.totalFuelCost;
    }

    this.output.next(output);
  }


  getChargeMaterialResult(chargeMaterialData: ChargeMaterial, energyData: EnergyData, isValid: boolean, settings: Settings): ChargeMaterialResult {
    let result: ChargeMaterialResult = {
      heatRequired: 0,
      netHeatLoss: 0,
      endoExoHeat: 0,
      grossLoss: 0,
      fuelUse: 0,
      fuelCost: 0
    }
    let calculatorEnergyUnit = this.getAnnualEnergyUnit(energyData.energySourceType, settings);

    if (isValid) {
      let loadChargeMaterial: LoadChargeMaterial;
      let availableHeat: number;
      if (chargeMaterialData.chargeMaterialType == 'Gas' && chargeMaterialData.gasChargeMaterial) {
        loadChargeMaterial = this.phastService.gasLoadChargeMaterial(chargeMaterialData.gasChargeMaterial, settings, calculatorEnergyUnit);
        availableHeat = energyData.availableHeat;
      } else if (chargeMaterialData.chargeMaterialType == 'Liquid' && chargeMaterialData.liquidChargeMaterial) {
        loadChargeMaterial = this.phastService.liquidLoadChargeMaterial(chargeMaterialData.liquidChargeMaterial, settings, calculatorEnergyUnit);
        availableHeat = energyData.availableHeat;
      } else if (chargeMaterialData.chargeMaterialType == 'Solid' && chargeMaterialData.solidChargeMaterial) {
        loadChargeMaterial = this.phastService.solidLoadChargeMaterial(chargeMaterialData.solidChargeMaterial, settings, calculatorEnergyUnit);
        availableHeat = energyData.availableHeat;
      }

      if (loadChargeMaterial) {
        result.heatRequired = loadChargeMaterial.grossHeatLoss;
        result.netHeatLoss = loadChargeMaterial.netHeatLoss;
        result.endoExoHeat = loadChargeMaterial.endoExoHeat;
        result.grossLoss = (loadChargeMaterial.grossHeatLoss / availableHeat) * 100;
        result.fuelUse = result.grossLoss * energyData.hoursPerYear;
        result.fuelCost = result.grossLoss * energyData.hoursPerYear * energyData.fuelCost;
        result.energyUnit = calculatorEnergyUnit;
      }
    }

    return result;
  }

  addLoss(hoursPerYear: number, modificationExists: boolean) {
    let currentBaselineData: Array<ChargeMaterial> = JSON.parse(JSON.stringify(this.baselineData.getValue()));
    let index = currentBaselineData.length;
    let baselineObj: ChargeMaterial = this.initDefaultLoss(index, currentBaselineData[0]);
    currentBaselineData.push(baselineObj)
    this.baselineData.next(currentBaselineData);
    
    if (modificationExists) {
      let currentModificationData: Array<ChargeMaterial> = this.modificationData.getValue();
      let modificationObj: ChargeMaterial = this.initDefaultLoss(index, currentBaselineData[0]);
      currentModificationData.push(modificationObj);
      this.modificationData.next(currentModificationData);
    }

    if (hoursPerYear) {
      let currentBaselineEnergy = this.baselineEnergyData.getValue();
      currentBaselineEnergy.hoursPerYear = hoursPerYear;
      this.baselineEnergyData.next(currentBaselineEnergy);

      let currentModificationEnergy = this.modificationEnergyData.getValue();
      currentModificationEnergy.hoursPerYear = hoursPerYear;
      this.modificationEnergyData.next(currentModificationEnergy);
    }
  }

  getMaterialNameForm(chargeMaterial: ChargeMaterial): FormGroup {
    let form: FormGroup;
    if(chargeMaterial.solidChargeMaterial) {
      form = this.solidMaterialFormService.getSolidChargeMaterialForm(chargeMaterial, false);
    } else if(chargeMaterial.liquidChargeMaterial) {
      form = this.liquidMaterialFormService.getLiquidChargeMaterialForm(chargeMaterial, false);
    } else if (chargeMaterial.gasChargeMaterial) {
      form = this.gasMaterialFormService.getGasChargeMaterialForm(chargeMaterial, false);
    } else {
      form = this.solidMaterialFormService.initSolidForm();
    }
    return form;
  }

  getMaterialObjectFromForm(materialNameForm: FormGroup, materialType: string) {
    let chargeMaterial: ChargeMaterial;
    if(materialType == 'Solid') {
      chargeMaterial = this.solidMaterialFormService.buildSolidChargeMaterial(materialNameForm);
    } else if(materialType == 'Liquid') {
      chargeMaterial = this.liquidMaterialFormService.buildLiquidChargeMaterial(materialNameForm);
    } else if (materialType == 'Gas') {
      chargeMaterial = this.gasMaterialFormService.buildGasChargeMaterial(materialNameForm);
    }
    return chargeMaterial;
  }
    
  removeLoss(i: number) {
    let currentBaselineData: Array<ChargeMaterial> = this.baselineData.getValue();
    currentBaselineData.splice(i, 1);
    this.baselineData.next(currentBaselineData);
    let currentModificationData: Array<ChargeMaterial> = this.modificationData.getValue();
    if (currentModificationData) {
      currentModificationData.splice(i, 1);
      this.modificationData.next(currentModificationData);
    }
  }

  updateDataArray(updatedData: ChargeMaterial, index: number, isBaseline: boolean) {
    let dataArray: Array<ChargeMaterial>;
    if (isBaseline) {
      dataArray = this.baselineData.getValue();
    } else {
      dataArray = this.modificationData.getValue();
    }
    // dataArray won't exist during reset cycle w/ multiple subjects emitting
    if (dataArray && dataArray[index]) {
      dataArray[index].name = updatedData.name;
      Object.assign(dataArray[index], updatedData);
    }

     if (isBaseline) {
      this.baselineData.next(dataArray);
    } else {
      this.modificationData.next(dataArray);
    }
  }

  initDefaultEmptyInputs() {
    let emptyBaselineData = this.initDefaultLoss(0, undefined);

    let energyData: EnergyData = {
      energySourceType: "Fuel",
      fuelCost: 0,
      hoursPerYear: 8760,
      availableHeat: 100
    }
    this.baselineData.next([emptyBaselineData]);
    this.modificationData.next(undefined);

    this.baselineEnergyData.next(energyData);
    this.modificationEnergyData.next(undefined);
    this.energySourceType.next('Fuel');
  }

  initDefaultLoss(index: number, chargeMaterial?: ChargeMaterial) {
    let materialType = chargeMaterial? chargeMaterial.chargeMaterialType : 'Solid';

    let defaultLoss: ChargeMaterial = {
      chargeMaterialType: materialType,
      liquidChargeMaterial: undefined,
      gasChargeMaterial: undefined,
      solidChargeMaterial: undefined,
      name: 'Material #' + (index + 1),
    };

    let material: SolidChargeMaterial | LiquidChargeMaterial | GasChargeMaterial;
    if (materialType == 'Solid') {
      material =  {
        materialId: 1,
        thermicReactionType: 0,
        specificHeatSolid: undefined,
        latentHeat: undefined,
        specificHeatLiquid: undefined,
        meltingPoint: undefined,
        chargeFeedRate: undefined,
        waterContentCharged: 0,
        waterContentDischarged: 0,
        initialTemperature: undefined,
        dischargeTemperature: undefined,
        waterVaporDischargeTemperature: 0,
        chargeMelted: 0,
        chargeReacted: 0,
        reactionHeat: 0,
        additionalHeat: 0,
      }
      defaultLoss.solidChargeMaterial = material;
    } else if (materialType == 'Liquid') {
      material = {
        materialId: 1,
        thermicReactionType: undefined,
        vaporizingTemperature: undefined,
        latentHeat: undefined,
        specificHeatVapor: undefined,
        chargeFeedRate: undefined,
        initialTemperature: undefined,
        dischargeTemperature: undefined,
        percentVaporized: 0,
        percentReacted: 0,
        reactionHeat: 0,
        additionalHeat: 0,
      }
      defaultLoss.liquidChargeMaterial = material;
    } else if (materialType == 'Gas') {
      material = {
        materialId: 1,
        thermicReactionType: 0,
        specificHeatGas: undefined,
        feedRate: undefined,
        percentVapor: 0,
        initialTemperature: undefined,
        dischargeTemperature: 0,
        specificHeatVapor: 0,
        percentReacted: 0,
        reactionHeat: 0,
        additionalHeat: 0,
      }
      defaultLoss.gasChargeMaterial = material;
    }

    return defaultLoss;
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
      baseline: {totalFuelCost: 0, totalFuelUse: 0, grossLoss: 0, losses: []},
      modification: {totalFuelCost: 0, totalFuelUse: 0, grossLoss: 0, losses: []},
      fuelSavings: 0,
      costSavings: 0,
    };

    this.output.next(output);
  }

  initModification() {
    let currentBaselineData: Array<ChargeMaterial> = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    let currentBaselineEnergy: EnergyData = this.baselineEnergyData.getValue();
    let baselineEnergyCopy: EnergyData = JSON.parse(JSON.stringify(currentBaselineEnergy));

    this.modificationEnergyData.next(baselineEnergyCopy);
    this.modificationData.next(currentBaselineCopy);
  }

  generateExampleData(settings: Settings) {
    let baselineChargeMaterial: ChargeMaterial = {
      name: 'Material #1',
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
      }
    };

    let modificationChargeMaterial: ChargeMaterial = {
      name: 'Material #1 (Lower Discharge Temp)',
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
      }
    }

    let energyExample: EnergyData = {
      energySourceType: 'Fuel',
      hoursPerYear: 8760,
      fuelCost: 3.99,
      availableHeat: 100
    };

    if (settings.unitsOfMeasure != 'Imperial') {
      this.convertSolidChargeMaterial(baselineChargeMaterial.solidChargeMaterial, 'Imperial', 'Metric');
      this.convertSolidChargeMaterial(modificationChargeMaterial.solidChargeMaterial, 'Imperial', 'Metric');
    }

    this.energySourceType.next('Fuel');
    this.baselineEnergyData.next(energyExample);
    this.modificationEnergyData.next(energyExample);
    
    this.baselineData.next([baselineChargeMaterial]);
    this.modificationData.next([modificationChargeMaterial]);
    this.collapseMapping.next({});

    this.generateExample.next(true);
  }

  checkInitialTemp(material: GasChargeMaterial | LiquidChargeMaterial | SolidChargeMaterial): string {
    if (material.initialTemperature > material.dischargeTemperature) {
      return "Charge Inlet Temperature  (" + material.initialTemperature + ") cannot be greater than Charge Outlet Temperature (" + material.dischargeTemperature + ")";
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