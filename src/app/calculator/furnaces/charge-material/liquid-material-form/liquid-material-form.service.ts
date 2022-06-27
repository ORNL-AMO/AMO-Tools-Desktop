import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChargeMaterial, LiquidChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';

@Injectable()
export class LiquidMaterialFormService {

  constructor(private formBuilder: FormBuilder) { }

  initLiquidForm(assesmentLossNum?: number): FormGroup {
    let lossNumber = assesmentLossNum? assesmentLossNum : 0;

    let formGroup = this.formBuilder.group({
      'materialId': [1, Validators.required],
      'materialSpecificHeatLiquid': ['', [Validators.required, Validators.min(0)]],
      'materialVaporizingTemperature': ['', Validators.required],
      'materialLatentHeat': ['', [Validators.required, Validators.min(0)]],
      'materialSpecificHeatVapor': ['', [Validators.required, Validators.min(0)]],
      'feedRate': ['', [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'initialTemperature': ['', Validators.required],
      'dischargeTemperature': ['', Validators.required],
      'liquidVaporized': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      'liquidReacted': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      'heatOfReaction': [0, [Validators.required, Validators.min(0)]],
      'endothermicOrExothermic': ['Endothermic', Validators.required],
      'additionalHeatRequired': [0, Validators.required],
      'name': ['Material #' + lossNumber]
    });

    return formGroup;
  }

  getLiquidChargeMaterialForm(chargeMaterial: ChargeMaterial, inAssessment: boolean = true): FormGroup {
    let reactionType = 'Endothermic';
    if (chargeMaterial.liquidChargeMaterial.thermicReactionType !== 0) {
      reactionType = 'Exothermic';
    }
    let formGroup = this.formBuilder.group({
      'materialId': [chargeMaterial.liquidChargeMaterial.materialId, Validators.required],
      'materialSpecificHeatLiquid': [chargeMaterial.liquidChargeMaterial.specificHeatLiquid, [Validators.required, Validators.min(0)]],
      'materialVaporizingTemperature': [chargeMaterial.liquidChargeMaterial.vaporizingTemperature, Validators.required],
      'materialLatentHeat': [chargeMaterial.liquidChargeMaterial.latentHeat, [Validators.required, Validators.min(0)]],
      'materialSpecificHeatVapor': [chargeMaterial.liquidChargeMaterial.specificHeatVapor, [Validators.required, Validators.min(0)]],
      'feedRate': [chargeMaterial.liquidChargeMaterial.chargeFeedRate, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'initialTemperature': [chargeMaterial.liquidChargeMaterial.initialTemperature, Validators.required],
      'dischargeTemperature': [chargeMaterial.liquidChargeMaterial.dischargeTemperature, Validators.required],
      'liquidVaporized': [chargeMaterial.liquidChargeMaterial.percentVaporized, [Validators.required, Validators.min(0), Validators.max(100)]],
      'liquidReacted': [chargeMaterial.liquidChargeMaterial.percentReacted, [Validators.required, Validators.min(0), Validators.max(100)]],
      'heatOfReaction': [chargeMaterial.liquidChargeMaterial.reactionHeat, [Validators.required, Validators.min(0)]],
      'endothermicOrExothermic': [reactionType, Validators.required],
      'additionalHeatRequired': [chargeMaterial.liquidChargeMaterial.additionalHeat, Validators.required],
      'name': [chargeMaterial.name]
    });
    
    formGroup = this.setInitialTempValidator(formGroup);
    return formGroup;
  }

  setInitialTempValidator(formGroup: FormGroup) {
      let dischargeTemperature = formGroup.controls.dischargeTemperature.value;
      if (dischargeTemperature) {
        formGroup.controls.initialTemperature.setValidators([Validators.required, Validators.max(dischargeTemperature)]);
        formGroup.controls.initialTemperature.markAsDirty();
        formGroup.controls.initialTemperature.updateValueAndValidity();
      }
      return formGroup;
  }

  buildLiquidChargeMaterial(liquidForm: FormGroup): ChargeMaterial {
    let reactionType = 0;
    if (liquidForm.controls.endothermicOrExothermic.value === 'Exothermic') {
      reactionType = 1;
    }
    let tmpLiquidMaterial: ChargeMaterial = {
      name: liquidForm.controls.name.value,
      chargeMaterialType: 'Liquid',
      liquidChargeMaterial: {
        materialId: liquidForm.controls.materialId.value,
        thermicReactionType: reactionType,
        specificHeatLiquid: liquidForm.controls.materialSpecificHeatLiquid.value,
        vaporizingTemperature: liquidForm.controls.materialVaporizingTemperature.value,
        latentHeat: liquidForm.controls.materialLatentHeat.value,
        specificHeatVapor: liquidForm.controls.materialSpecificHeatVapor.value,
        chargeFeedRate: liquidForm.controls.feedRate.value,
        initialTemperature: liquidForm.controls.initialTemperature.value,
        dischargeTemperature: liquidForm.controls.dischargeTemperature.value,
        percentVaporized: liquidForm.controls.liquidVaporized.value,
        percentReacted: liquidForm.controls.liquidReacted.value,
        reactionHeat: liquidForm.controls.heatOfReaction.value,
        additionalHeat: liquidForm.controls.additionalHeatRequired.value,
      }
    };
    return tmpLiquidMaterial;
  }

  checkLiquidWarnings(material: LiquidChargeMaterial): LiquidMaterialWarnings {
    return {
      dischargeTempWarning: this.checkDischargeTemp(material),
      inletOverVaporizingWarning: this.checkInletOverVaporizing(material),
      outletOverVaporizingWarning: this.checkOutletOverVaporizing(material),
    };
  }

  checkDischargeTemp(material: LiquidChargeMaterial): string {
    if ((material.dischargeTemperature > material.vaporizingTemperature) && material.percentVaporized === 0) {
      return 'The Charge Outlet Temperature is higher than the Vaporizing Temperature, please enter proper percentage for charge vaporized.';
    } else if ((material.dischargeTemperature < material.vaporizingTemperature) && material.percentVaporized > 0) {
      return 'The Charge Outlet Temperature is lower than the vaporizing temperature, the percentage for charge liquid vaporized should be 0%.';
    } else {
      return null;
    }
  }

  checkInletOverVaporizing(material: LiquidChargeMaterial): string {
    if (material.initialTemperature > material.vaporizingTemperature && material.percentVaporized <= 0) {
      return "The Charge Inlet Temperature is higher than the vaporization point, please enter proper percentage for charge vaporized.";
    } else {
      return null;
    }
  }
  checkOutletOverVaporizing(material: LiquidChargeMaterial): string {
    if (material.dischargeTemperature > material.vaporizingTemperature && material.percentVaporized <= 0) {
      return "The Charge Outlet Temperature is higher than the vaporization point, please enter proper percentage for charge vaporized.";
    }
    else {
      return null;
    }
  }

}


export interface LiquidMaterialWarnings {
  dischargeTempWarning: string;
  inletOverVaporizingWarning: string;
  outletOverVaporizingWarning: string;
}