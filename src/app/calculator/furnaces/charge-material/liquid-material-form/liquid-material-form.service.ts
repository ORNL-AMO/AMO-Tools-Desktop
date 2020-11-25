import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';

@Injectable()
export class LiquidMaterialFormService {

  constructor(private formBuilder: FormBuilder) { }

  initLiquidForm(assesmentLossNum?: number): FormGroup {
    let lossNumber = assesmentLossNum? assesmentLossNum : 0;

    let formGroup = this.formBuilder.group({
      'materialId': [1, Validators.required],
      'materialSpecificHeatLiquid': ['', Validators.required],
      'materialVaporizingTemperature': ['', Validators.required],
      'materialLatentHeat': ['', Validators.required],
      'materialSpecificHeatVapor': ['', Validators.required],
      'feedRate': ['', Validators.required],
      'initialTemperature': ['', Validators.required],
      'dischargeTemperature': ['', Validators.required],
      'liquidVaporized': [0, Validators.required],
      'liquidReacted': [0, Validators.required],
      'heatOfReaction': [0, Validators.required],
      'endothermicOrExothermic': ['Endothermic', Validators.required],
      'additionalHeatRequired': [0, Validators.required],
      'name': ['Material #' + lossNumber]
    });

    if (!assesmentLossNum) {
      formGroup.addControl('availableHeat', new FormControl(100, [Validators.required,  GreaterThanValidator.greaterThan(0)]));
    }

    return formGroup;
  }

  getLiquidChargeMaterialForm(chargeMaterial: ChargeMaterial, inAssessment: boolean): FormGroup {
    let reactionType = 'Endothermic';
    if (chargeMaterial.liquidChargeMaterial.thermicReactionType !== 0) {
      reactionType = 'Exothermic';
    }
    let formGroup = this.formBuilder.group({
      'materialId': [chargeMaterial.liquidChargeMaterial.materialId, Validators.required],
      'materialSpecificHeatLiquid': [chargeMaterial.liquidChargeMaterial.specificHeatLiquid, Validators.required],
      'materialVaporizingTemperature': [chargeMaterial.liquidChargeMaterial.vaporizingTemperature, Validators.required],
      'materialLatentHeat': [chargeMaterial.liquidChargeMaterial.latentHeat, Validators.required],
      'materialSpecificHeatVapor': [chargeMaterial.liquidChargeMaterial.specificHeatVapor, Validators.required],
      'feedRate': [chargeMaterial.liquidChargeMaterial.chargeFeedRate, Validators.required],
      'initialTemperature': [chargeMaterial.liquidChargeMaterial.initialTemperature, Validators.required],
      'dischargeTemperature': [chargeMaterial.liquidChargeMaterial.dischargeTemperature, Validators.required],
      'liquidVaporized': [chargeMaterial.liquidChargeMaterial.percentVaporized, Validators.required],
      'liquidReacted': [chargeMaterial.liquidChargeMaterial.percentReacted, Validators.required],
      'heatOfReaction': [chargeMaterial.liquidChargeMaterial.reactionHeat, Validators.required],
      'endothermicOrExothermic': [reactionType, Validators.required],
      'additionalHeatRequired': [chargeMaterial.liquidChargeMaterial.additionalHeat, Validators.required],
      'name': [chargeMaterial.name]
    });

    
    if (!inAssessment) {
      formGroup.addControl('availableHeat', new FormControl(100, [Validators.required, GreaterThanValidator.greaterThan(0)]));
    }

    // formGroup = this.setValidators(formGroup);
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
        availableHeat: liquidForm.controls.availableHeat? liquidForm.controls.availableHeat.value : '',
      }
    };
    return tmpLiquidMaterial;
  }
}
