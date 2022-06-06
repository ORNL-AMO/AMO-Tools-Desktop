import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';

@Injectable()
export class GasMaterialFormService {

  constructor(private formBuilder: FormBuilder) { }

  initGasForm(assesmentLossNum?: number): FormGroup {
    let lossNumber = assesmentLossNum? assesmentLossNum : 0;

    let formGroup = this.formBuilder.group({
      'materialId': [1, Validators.required],
      'materialSpecificHeat': ['',  [Validators.required, Validators.min(0)]],
      'feedRate': ['', [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'vaporInGas': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      'initialTemperature': ['', Validators.required],
      'dischargeTemperature': ['', Validators.required],
      'specificHeatOfVapor': [0, [Validators.required, Validators.min(0)]],
      'gasReacted': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      'heatOfReaction': [0, [Validators.required, Validators.min(0)]],
      'endothermicOrExothermic': ['Endothermic', Validators.required],
      'additionalHeatRequired': [0, Validators.required],
      'name': ['Material #' + lossNumber]
    });

    return formGroup;
  }

  getGasChargeMaterialForm(chargeMaterial: ChargeMaterial, inAssessment: boolean = true): FormGroup {
    let reactionType = 'Endothermic';
    if (chargeMaterial.gasChargeMaterial.thermicReactionType !== 0) {
      reactionType = 'Exothermic';
    }
    let formGroup = this.formBuilder.group({
      'materialId': [chargeMaterial.gasChargeMaterial.materialId, Validators.required],
      'materialSpecificHeat': [chargeMaterial.gasChargeMaterial.specificHeatGas, [Validators.required, Validators.min(0)]],
      'feedRate': [chargeMaterial.gasChargeMaterial.feedRate, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'vaporInGas': [chargeMaterial.gasChargeMaterial.percentVapor, [Validators.required, Validators.min(0), Validators.max(100)]],
      'initialTemperature': [chargeMaterial.gasChargeMaterial.initialTemperature, Validators.required],
      'dischargeTemperature': [chargeMaterial.gasChargeMaterial.dischargeTemperature, Validators.required],
      'specificHeatOfVapor': [chargeMaterial.gasChargeMaterial.specificHeatVapor, [Validators.required, Validators.min(0)]],
      'gasReacted': [chargeMaterial.gasChargeMaterial.percentReacted, [Validators.required, Validators.min(0), Validators.max(100)]],
      'heatOfReaction': [chargeMaterial.gasChargeMaterial.reactionHeat, [Validators.required, Validators.min(0)]],
      'endothermicOrExothermic': [reactionType, Validators.required],
      'additionalHeatRequired': [chargeMaterial.gasChargeMaterial.additionalHeat, Validators.required],
      'name': [chargeMaterial.name]
    });

    //
    if (!chargeMaterial.gasChargeMaterial.materialId){
      formGroup = this.initGasForm();
    } else {
      formGroup = this.setInitialTempValidator(formGroup);
    }
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

  buildGasChargeMaterial(gasForm: FormGroup): ChargeMaterial {
    let reactionType = 0;
    if (gasForm.controls.endothermicOrExothermic.value === 'Exothermic') {
      reactionType = 1;
    }
    let tmpGasMaterial: ChargeMaterial = {
      name: gasForm.controls.name.value,
      chargeMaterialType: 'Gas',
      gasChargeMaterial: {
        materialId: gasForm.controls.materialId.value,
        thermicReactionType: reactionType,
        specificHeatGas: gasForm.controls.materialSpecificHeat.value,
        feedRate: gasForm.controls.feedRate.value,
        percentVapor: gasForm.controls.vaporInGas.value,
        initialTemperature: gasForm.controls.initialTemperature.value,
        dischargeTemperature: gasForm.controls.dischargeTemperature.value,
        specificHeatVapor: gasForm.controls.specificHeatOfVapor.value,
        percentReacted: gasForm.controls.gasReacted.value,
        reactionHeat: gasForm.controls.heatOfReaction.value,
        additionalHeat: gasForm.controls.additionalHeatRequired.value,
      }
    };
    return tmpGasMaterial;
  }
}
