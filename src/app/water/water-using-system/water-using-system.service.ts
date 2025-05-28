import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { OperatingHours } from '../../shared/models/operations';
import { BoilerWater, ConnectedFlowType, CoolingTower, DiagramWaterSystemFlows, FlowMetric, getNewProcessComponent, getWaterFlowsFromSource, KitchenRestroom, KnownLoss, Landscaping, ProcessUse, WaterProcessComponent, WaterSystemFlowsTotals, WaterSystemTypeData, WaterSystemTypeEnum, WaterUsingSystem } from 'process-flow-lib';

@Injectable()
export class WaterUsingSystemService {
  operatingHours: OperatingHours;
  saveSystemTypeData: BehaviorSubject<WaterSystemTypeData>;
  constructor(private formBuilder: FormBuilder) { 
    this.saveSystemTypeData = new BehaviorSubject<WaterSystemTypeData>(undefined)
  }
  
  setUpdatedSystemTypeData(waterUsingSystem: WaterUsingSystem, updatedData: WaterSystemTypeData, systemType: number) {
    let isSystemTypeValid: boolean = false;
    if (systemType === WaterSystemTypeEnum.PROCESS) {
      waterUsingSystem.processUse = updatedData as ProcessUse;
      isSystemTypeValid = this.getProcessUseForm(waterUsingSystem.processUse).valid;
    } else if (systemType === WaterSystemTypeEnum.COOLINGTOWER) {
      waterUsingSystem.coolingTower = updatedData as CoolingTower;
      isSystemTypeValid = this.getCoolingTowerForm(waterUsingSystem.coolingTower).valid;
    } else if (systemType === WaterSystemTypeEnum.BOILER) {
      waterUsingSystem.boilerWater = updatedData as BoilerWater;
      isSystemTypeValid = this.getBoilerWaterForm(waterUsingSystem.boilerWater).valid;
    } else if (systemType === WaterSystemTypeEnum.KITCHEN) {
      waterUsingSystem.kitchenRestroom = updatedData as KitchenRestroom;
      isSystemTypeValid = this.getKitchenRestroomForm(waterUsingSystem.kitchenRestroom).valid;
    } else if (systemType === WaterSystemTypeEnum.LANDSCAPING) {
      waterUsingSystem.landscaping = updatedData as Landscaping;
      isSystemTypeValid = this.getLandscapingForm(waterUsingSystem.landscaping).valid;
    }
    waterUsingSystem.isValid = isSystemTypeValid;
  }

  getSystemTypeName(systemType: number): string {
    if (systemType === WaterSystemTypeEnum.PROCESS) {
      return 'Process Use';
    } else if (systemType === WaterSystemTypeEnum.COOLINGTOWER) {
      return 'Cooling Tower';
    } else if (systemType === WaterSystemTypeEnum.BOILER) {
      return 'Boiler Water';
    } else if (systemType === WaterSystemTypeEnum.KITCHEN) {
      return 'Kitchen and Restroom';
    } else if (systemType === WaterSystemTypeEnum.LANDSCAPING) {
      return 'Landscaping and Irrigation';
    }
  }


  /**
* Add new component or return component based from a diagram component
* @param processFlowPart Build from diagram component
*/
  addKnownLoss(processFlowPart?: WaterProcessComponent): KnownLoss {
    let knownLoss: KnownLoss;
    let newComponent: WaterProcessComponent;
    if (!processFlowPart) {
      newComponent = getNewProcessComponent('known-loss') as KnownLoss;
    } else {
      newComponent = processFlowPart as KnownLoss;
    }

    knownLoss = {
      ...newComponent,
      flowValue: 0,
    };
    return knownLoss;
  }

  getWaterUsingSystemForm(waterUsingSystem: WaterUsingSystem, diagramWaterSystemFlows: DiagramWaterSystemFlows): FormGroup {
    let systemFlowTotals: WaterSystemFlowsTotals = waterUsingSystem.systemFlowTotals;
    if (diagramWaterSystemFlows) {
      systemFlowTotals = getWaterFlowsFromSource(waterUsingSystem, diagramWaterSystemFlows);
    }
    
    let form: FormGroup = this.formBuilder.group({
      name: [waterUsingSystem.name, Validators.required],
      cost: [waterUsingSystem.cost, Validators.required],
      systemType: [waterUsingSystem.systemType],
      hoursPerYear: [waterUsingSystem.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]],
      sourceWater: [systemFlowTotals.sourceWater, [Validators.required, Validators.min(0)]],
      recirculatedWater: [systemFlowTotals.recirculatedWater, [Validators.min(0)]],
      dischargeWater: [systemFlowTotals.dischargeWater, [Validators.required, Validators.min(0)]],
      knownLosses: [systemFlowTotals.knownLosses, [Validators.required, Validators.min(0)]],
      waterInProduct: [systemFlowTotals.waterInProduct, [Validators.required, Validators.min(0)]],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }


  getWaterUsingSystemFromForm(form: FormGroup, waterUsingSystem: WaterUsingSystem) {
    waterUsingSystem.name = form.controls.name.value;
    waterUsingSystem.cost = form.controls.cost.value;
    waterUsingSystem.systemType = form.controls.systemType.value;
    waterUsingSystem.hoursPerYear = form.controls.hoursPerYear.value;
    waterUsingSystem.systemFlowTotals.sourceWater = form.controls.sourceWater.value;
    waterUsingSystem.systemFlowTotals.recirculatedWater = form.controls.recirculatedWater.value;
    waterUsingSystem.systemFlowTotals.dischargeWater = form.controls.dischargeWater.value;
    waterUsingSystem.systemFlowTotals.knownLosses = form.controls.knownLosses.value;
    waterUsingSystem.systemFlowTotals.waterInProduct = form.controls.waterInProduct.value;
    return waterUsingSystem;
  }

  getProcessUseForm(processUse: ProcessUse): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      waterRequiredMetric: [processUse.waterRequiredMetric],
      waterConsumedMetric: [processUse.waterConsumedMetric],
      waterLossMetric: [processUse.waterLossMetric],
      waterRequiredMetricValue: [processUse.waterRequiredMetricValue],
      waterConsumedMetricValue: [processUse.waterConsumedMetricValue],
      waterLossMetricValue: [processUse.waterLossMetricValue],
      annualProduction: [processUse.annualProduction],
      fractionGrossWaterRecirculated: [processUse.fractionGrossWaterRecirculated, [Validators.required]],
    });
    if (processUse.waterConsumedMetric == FlowMetric.INTENSITY || processUse.waterLossMetric == FlowMetric.INTENSITY) {
      this.setAnnualProductionValidators(form);
    }
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  setAnnualProductionValidators(form: FormGroup) {
    let annualProductionValidators: Array<ValidatorFn> = [Validators.required];
    form.controls.annualProduction.setValidators(annualProductionValidators);
    form.controls.annualProduction.updateValueAndValidity();
  }

  getProcessUseFromForm(form: FormGroup): ProcessUse {
    return {
      waterRequiredMetric: form.controls.waterRequiredMetric.value,
      waterConsumedMetric: form.controls.waterConsumedMetric.value,
      waterLossMetric: form.controls.waterLossMetric.value,
      waterRequiredMetricValue: form.controls.waterRequiredMetricValue.value,
      waterConsumedMetricValue: form.controls.waterConsumedMetricValue.value,
      waterLossMetricValue: form.controls.waterLossMetricValue.value,
      annualProduction: form.controls.annualProduction.value,
      fractionGrossWaterRecirculated: form.controls.fractionGrossWaterRecirculated.value,
    }
  }

  getCoolingTowerForm(coolingTower: CoolingTower): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      tonnage: [coolingTower.tonnage, [Validators.required]],
      loadFactor: [coolingTower.loadFactor, [Validators.required]],
      evaporationRateDegree: [coolingTower.evaporationRateDegree, [Validators.required]],
      temperatureDrop: [coolingTower.temperatureDrop, [Validators.required]],
      makeupConductivity: [coolingTower.makeupConductivity, [Validators.required]],
      blowdownConductivity: [coolingTower.blowdownConductivity, [Validators.required]],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getCoolingTowerFromForm(form: FormGroup): CoolingTower {
    return {
      tonnage: form.controls.tonnage.value,
      loadFactor: form.controls.loadFactor.value,
      evaporationRateDegree: form.controls.evaporationRateDegree.value,
      temperatureDrop: form.controls.temperatureDrop.value,
      makeupConductivity: form.controls.makeupConductivity.value,
      blowdownConductivity: form.controls.blowdownConductivity.value,
    }
  }

  getBoilerWaterForm(boilerWater: BoilerWater): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      power: [boilerWater.power, [Validators.required]],
      loadFactor: [boilerWater.loadFactor, [Validators.required]],
      steamPerPower: [boilerWater.steamPerPower, [Validators.required]],
      feedwaterConductivity: [boilerWater.feedwaterConductivity, [Validators.required]],
      makeupConductivity: [boilerWater.makeupConductivity, [Validators.required]],
      blowdownConductivity: [boilerWater.blowdownConductivity, [Validators.required]],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getBoilerWaterFromForm(form: FormGroup): BoilerWater {
    return {
      power: form.controls.power.value,
      loadFactor: form.controls.loadFactor.value,
      steamPerPower: form.controls.steamPerPower.value,
      feedwaterConductivity: form.controls.feedwaterConductivity.value,
      makeupConductivity: form.controls.makeupConductivity.value,
      blowdownConductivity: form.controls.blowdownConductivity.value,
    }
  }

  getKitchenRestroomForm(kitchenRestroom: KitchenRestroom): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      employeeCount: [kitchenRestroom.employeeCount, [Validators.required]],
      workdaysPerYear: [kitchenRestroom.workdaysPerYear, [Validators.required]],
      dailyUsePerEmployee: [kitchenRestroom.dailyUsePerEmployee, [Validators.required]],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getKitchenRestroomFromForm(form: FormGroup): KitchenRestroom {
    return {
      employeeCount: form.controls.employeeCount.value,
      workdaysPerYear: form.controls.workdaysPerYear.value,
      dailyUsePerEmployee: form.controls.dailyUsePerEmployee.value,
    }
  }
    
  getLandscapingForm(landscaping: Landscaping): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      areaIrrigated: [landscaping.areaIrrigated, [Validators.required]],
      yearlyInchesIrrigated: [landscaping.yearlyInchesIrrigated, [Validators.required]],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getLandscapingFromForm(form: FormGroup): Landscaping {
    return {
      areaIrrigated: form.controls.areaIrrigated.value,
      yearlyInchesIrrigated: form.controls.yearlyInchesIrrigated.value,
    }
  }


  markFormDirtyToDisplayValidation(form: UntypedFormGroup) {
    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
  }
}
