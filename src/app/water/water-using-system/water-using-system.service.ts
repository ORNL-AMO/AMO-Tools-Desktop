import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BoilerWater, ConnectedFlowType, CoolingTower, DiagramWaterSystemFlows, FlowMetric, KitchenRestroom, KnownLoss, Landscaping, ProcessUse, WaterAssessment, WaterProcessComponent, WaterSystemFlows, WaterSystemTypeData, WaterSystemTypeEnum, WaterUsingSystem } from '../../shared/models/water-assessment';
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
      userDiagramFlowOverrides: {
        sourceWater: undefined,
        recycledSourceWater: undefined,
        recirculatedWater: undefined,
        dischargeWater: undefined,
        dischargeWaterRecycled: undefined,
        knownLosses: undefined,
        waterInProduct: undefined,
      }, 
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
      addedMotorEnergy: [],
      waterFlows: {
        sourceWater: 0,
        recycledSourceWater: 0,
        recirculatedWater: 0,
        dischargeWater: 0,
        dischargeWaterRecycled: 0,
        knownLosses: 0,
        waterInProduct: 0,
      }

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

  getWaterUsingSystemForm(waterUsingSystem: WaterUsingSystem, diagramWaterSystemFlows: DiagramWaterSystemFlows): FormGroup {
    let waterFlows: WaterSystemFlows = waterUsingSystem.waterFlows;
    if (diagramWaterSystemFlows) {
      waterFlows = this.getWaterFlowsFromSource(waterUsingSystem, diagramWaterSystemFlows);
    }
    
    let form: FormGroup = this.formBuilder.group({
      name: [waterUsingSystem.name, Validators.required],
      systemType: [waterUsingSystem.systemType],
      hoursPerYear: [waterUsingSystem.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]],
      sourceWater: [waterFlows.sourceWater, [Validators.required, Validators.min(0)]],
      recycledSourceWater: [waterFlows.recycledSourceWater, [Validators.min(0)]],
      recirculatedWater: [waterFlows.recirculatedWater, [Validators.min(0)]],
      dischargeWater: [waterFlows.dischargeWater, [Validators.required, Validators.min(0)]],
      dischargeWaterRecycled: [waterFlows.dischargeWaterRecycled, [Validators.required, Validators.min(0)]],
      knownLosses: [waterFlows.knownLosses, [Validators.required, Validators.min(0)]],
      waterInProduct: [waterFlows.waterInProduct, [Validators.required, Validators.min(0)]],
    });
    this.markFormDirtyToDisplayValidation(form);
    return form;
  }

/**
 * Set flows from users values, or default to diagram values
 */
  getWaterFlowsFromSource(waterUsingSystem: WaterUsingSystem, diagramWaterSystemFlows: DiagramWaterSystemFlows): WaterSystemFlows {
    let waterFlows: WaterSystemFlows = {
      sourceWater: diagramWaterSystemFlows.sourceWater.total,
      recycledSourceWater: diagramWaterSystemFlows.recycledSourceWater.total,
      recirculatedWater: diagramWaterSystemFlows.recirculatedWater.total,
      dischargeWater: diagramWaterSystemFlows.dischargeWater.total,
      dischargeWaterRecycled: diagramWaterSystemFlows.dischargeWaterRecycled.total,
      knownLosses: diagramWaterSystemFlows.knownLosses.total,
      waterInProduct: diagramWaterSystemFlows.waterInProduct.total,
    };
    Object.keys(waterUsingSystem.userDiagramFlowOverrides).forEach((key: ConnectedFlowType) => {
      waterFlows[key] = waterUsingSystem.userDiagramFlowOverrides[key]? waterUsingSystem.userDiagramFlowOverrides[key] : diagramWaterSystemFlows[key].total;
    });
    return waterFlows;
  }

  getWaterUsingSystemFromForm(form: FormGroup, waterUsingSystem: WaterUsingSystem) {
    waterUsingSystem.name = form.controls.name.value;
    waterUsingSystem.systemType = form.controls.systemType.value;
    waterUsingSystem.hoursPerYear = form.controls.hoursPerYear.value;
    waterUsingSystem.waterFlows.sourceWater = form.controls.sourceWater.value;
    waterUsingSystem.waterFlows.recycledSourceWater = form.controls.recycledSourceWater.value;
    waterUsingSystem.waterFlows.recirculatedWater = form.controls.recirculatedWater.value;
    waterUsingSystem.waterFlows.dischargeWater = form.controls.dischargeWater.value;
    waterUsingSystem.waterFlows.dischargeWaterRecycled = form.controls.dischargeWaterRecycled.value;
    waterUsingSystem.waterFlows.knownLosses = form.controls.knownLosses.value;
    waterUsingSystem.waterFlows.waterInProduct = form.controls.waterInProduct.value;
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
