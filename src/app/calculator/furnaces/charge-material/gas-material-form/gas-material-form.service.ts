import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';

@Injectable()
export class GasMaterialFormService {

  constructor(private formBuilder: FormBuilder) { }

  initGasForm(assesmentLossNum?: number): FormGroup {
    let lossNumber = assesmentLossNum? assesmentLossNum : 0;

    let formGroup = this.formBuilder.group({
      'materialId': [1, Validators.required],
      'materialSpecificHeat': ['', Validators.required],
      'feedRate': ['', Validators.required],
      'vaporInGas': [0, Validators.required],
      'initialTemperature': ['', Validators.required],
      'dischargeTemperature': ['', Validators.required],
      'specificHeatOfVapor': [0, Validators.required],
      'gasReacted': [0, Validators.required],
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

  getGasChargeMaterialForm(chargeMaterial: ChargeMaterial, inAssessment: boolean): FormGroup {
    let reactionType = 'Endothermic';
    if (chargeMaterial.gasChargeMaterial.thermicReactionType !== 0) {
      reactionType = 'Exothermic';
    }
    let formGroup = this.formBuilder.group({
      'materialId': [chargeMaterial.gasChargeMaterial.materialId, Validators.required],
      'materialSpecificHeat': [chargeMaterial.gasChargeMaterial.specificHeatGas, Validators.required],
      'feedRate': [chargeMaterial.gasChargeMaterial.feedRate, Validators.required],
      'vaporInGas': [chargeMaterial.gasChargeMaterial.percentVapor, Validators.required],
      'initialTemperature': [chargeMaterial.gasChargeMaterial.initialTemperature, Validators.required],
      'dischargeTemperature': [chargeMaterial.gasChargeMaterial.dischargeTemperature, Validators.required],
      'specificHeatOfVapor': [chargeMaterial.gasChargeMaterial.specificHeatVapor, Validators.required],
      'gasReacted': [chargeMaterial.gasChargeMaterial.percentReacted, Validators.required],
      'heatOfReaction': [chargeMaterial.gasChargeMaterial.reactionHeat, Validators.required],
      'endothermicOrExothermic': [reactionType, Validators.required],
      'additionalHeatRequired': [chargeMaterial.gasChargeMaterial.additionalHeat, Validators.required],
      'name': [chargeMaterial.name]
    });

    if (!inAssessment) {
      formGroup.addControl('availableHeat', new FormControl(100, [Validators.required, GreaterThanValidator.greaterThan(0)]));
    }

    // formGroup = this.setValidators(formGroup);
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
        availableHeat: gasForm.controls.availableHeat? gasForm.controls.availableHeat.value : '',
      }
    };
    return tmpGasMaterial;
  }
}
