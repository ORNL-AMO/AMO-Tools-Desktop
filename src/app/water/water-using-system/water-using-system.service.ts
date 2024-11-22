import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BoilerWater, CoolingTower, FlowMetric, KitchenRestroom, KnownLoss, Landscaping, ProcessUse, WaterProcessComponent, WaterSystemTypeData, WaterSystemTypeEnum, WaterUsingSystem } from '../../shared/models/water-assessment';
import { getNewProcessComponent, ProcessFlowPart } from '../../../process-flow-types/shared-process-flow-types';
import { BehaviorSubject } from 'rxjs';
import { OperatingHours } from '../../shared/models/operations';

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
  addWaterUsingSystem(processFlowPart?: WaterProcessComponent): WaterUsingSystem {
    let waterUsingSystem: WaterUsingSystem;
    let newComponent: WaterProcessComponent;
    if (!processFlowPart) {
      newComponent = getNewProcessComponent('water-using-system') as WaterUsingSystem;
    } else {
      newComponent = processFlowPart as WaterUsingSystem;
    }
    waterUsingSystem = {
      ...newComponent,
      createdByAssessment: true,
      systemType: 0,
      hoursPerYear: 8760,
      intakeSources: [
        {
          sourceType: 0,
          annualUse: 0
        }
      ],
      processUse: {
        waterRequiredMetric: 0,
        waterRequiredMetricValue: undefined,
        waterConsumedMetric: 0,
        waterConsumedMetricValue: undefined,
        waterLossMetric: 0,
        waterLossMetricValue: undefined,
        annualProduction: undefined,
        fractionGrossWaterRecirculated: undefined,
      },
      coolingTower: {
        tonnage: undefined,
        loadFactor: undefined,
        evaporationRateDegree: undefined,
        temperatureDrop: undefined,
        makeupConductivity: undefined,
        blowdownConductivity: undefined,
      },
      boilerWater: {
        power: undefined,
        loadFactor: undefined,
        steamPerPower: undefined,
        feedwaterConductivity: undefined,
        makeupConductivity: undefined,
        blowdownConductivity: undefined,
      },
      kitchenRestroom: {
        employeeCount: undefined,
        workdaysPerYear: undefined,
        dailyUsePerEmployee: undefined
      },
      landscaping: {
        areaIrrigated: undefined,
        yearlyInchesIrrigated: undefined,
      },
      heatEnergy: {
        incomingTemp: undefined,
        outgoingTemp: undefined,
        heaterEfficiency: undefined,
        heatingFuelType: 0,
        wasteWaterDischarge: undefined
      },
      addedMotorEquipment: []

    }

    return waterUsingSystem;
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
      lossValue: 0,
    };
    return knownLoss;
  }

  getWaterUsingSystemForm(waterUsingSystem: WaterUsingSystem): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [waterUsingSystem.name, Validators.required],
      systemType: [waterUsingSystem.systemType],
      hoursPerYear: [waterUsingSystem.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]],
      sourceWater: [waterUsingSystem.sourceWater, [Validators.required, Validators.min(0)]],
      recycledWater: [waterUsingSystem.recycledWater, [Validators.min(0)]],
      recirculatedWater: [waterUsingSystem.recirculatedWater, [Validators.min(0)]],
      dischargeWater: [waterUsingSystem.dischargeWater, [Validators.required, Validators.min(0)]],
      dischargeWaterRecycled: [waterUsingSystem.dischargeWaterRecycled, [Validators.required, Validators.min(0)]],
      knownLosses: [waterUsingSystem.knownLosses, [Validators.required, Validators.min(0)]],
      waterInProduct: [waterUsingSystem.waterInProduct, [Validators.required, Validators.min(0)]],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

  getWaterUsingSystemFromForm(form: FormGroup, waterUsingSystem: WaterUsingSystem) {
    waterUsingSystem.name = form.controls.name.value;
    waterUsingSystem.systemType = form.controls.systemType.value;
    waterUsingSystem.hoursPerYear = form.controls.hoursPerYear.value;
    waterUsingSystem.sourceWater = form.controls.sourceWater.value;
    waterUsingSystem.recycledWater = form.controls.recycledWater.value;
    waterUsingSystem.recirculatedWater = form.controls.recirculatedWater.value;
    waterUsingSystem.dischargeWater = form.controls.dischargeWater.value;
    waterUsingSystem.dischargeWaterRecycled = form.controls.dischargeWaterRecycled.value;
    waterUsingSystem.knownLosses = form.controls.knownLosses.value;
    waterUsingSystem.waterInProduct = form.controls.waterInProduct.value;
    waterUsingSystem.recycledWater = form.controls.recycledWater.value;
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
