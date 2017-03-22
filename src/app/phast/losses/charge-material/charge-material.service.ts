import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ChargeMaterial, GasChargeMaterial, LiquidChargeMaterial, SolidChargeMaterial } from '../../../shared/models/losses/chargeMaterial';

@Injectable()
export class ChargeMaterialService {

  constructor(private formBuilder: FormBuilder) { }

  //empty gas charge material form
  initGasForm() {
    return this.formBuilder.group({
      'materialName': ['', Validators.required],
      'materialSpecificHeat': ['', Validators.required],
      'feedRate': ['', Validators.required],
      'vaporInGas': ['', Validators.required],
      'initialTemperature': ['', Validators.required],
      'dischargeTemperature': ['', Validators.required],
      'specificHeatOfVapor': ['', Validators.required],
      'gasReacted': ['', Validators.required],
      'heatOfReaction': ['', Validators.required],
      'endothermicOrExothermic': ['', Validators.required],
      'additionalHeatRequired': ['', Validators.required],

    })
  }
  //gas charge material form from GasChargeMaterial
  getGasChargeMaterialForm(gasMaterial: GasChargeMaterial) {
    let reactionType = 'Endothermic';
    if (gasMaterial.thermicReactionType != 0) {
      reactionType = 'Exothermic';
    }
    return this.formBuilder.group({
      'materialName': [gasMaterial.materialName, Validators.required],
      'materialSpecificHeat': [gasMaterial.specificHeatGas, Validators.required],
      'feedRate': [gasMaterial.feedRate, Validators.required],
      'vaporInGas': [gasMaterial.percentVapor, Validators.required],
      'initialTemperature': [gasMaterial.initialTemperature, Validators.required],
      'dischargeTemperature': [gasMaterial.dischargeTemperature, Validators.required],
      'specificHeatOfVapor': [gasMaterial.specificHeatVapor, Validators.required],
      'gasReacted': [gasMaterial.percentReacted, Validators.required],
      'heatOfReaction': [gasMaterial.reactionHeat, Validators.required],
      'endothermicOrExothermic': [reactionType, Validators.required],
      'additionalHeatRequired': [gasMaterial.additionalHeat, Validators.required],
    });
  }
  //GasChargeMaterial from gasForm
  buildGasChargeMaterial(gasForm: any): GasChargeMaterial {
    let reactionType = 0;
    if (gasForm.value.endothermicOrExothermic == 'Exothermic') {
      reactionType = 1;
    }
    let tmpGasMaterial: GasChargeMaterial = {
      materialName: gasForm.value.materialName,
      thermicReactionType: reactionType,
      specificHeatGas: gasForm.value.materialSpecificHeat,
      feedRate: gasForm.value.feedRate,
      percentVapor: gasForm.value.vaporInGas,
      initialTemperature: gasForm.value.initialTemperature,
      dischargeTemperature: gasForm.value.dischargeTemperature,
      specificHeatVapor: gasForm.value.specificHeatOfVapor,
      percentReacted: gasForm.value.gasReacted,
      reactionHeat: gasForm.value.heatOfReaction,
      additionalHeat: gasForm.value.additionalHeatRequired
    }
    return tmpGasMaterial;
  }

  //Empty liquid charge material form
  initLiquidForm() {
    return this.formBuilder.group({
      'materialName': ['', Validators.required],
      'materialSpecificHeatLiquid': ['', Validators.required],
      'materialVaporizingTemperature': ['', Validators.required],
      'materialLatentHeat': ['', Validators.required],
      'materialSpecificHeatVapor': ['', Validators.required],
      'feedRate': ['', Validators.required],
      'initialTemperature': ['', Validators.required],
      'dischargeTemperature': ['', Validators.required],
      'baselineLiquidVaporized': ['', Validators.required],
      'baselineLiquidReacted': ['', Validators.required],
      'heatOfReaction': ['', Validators.required],
      'endothermicOrExothermic': ['', Validators.required],
      'additionalHeatRequired': ['', Validators.required],
    })
  }

  //liquid charge material form from LiquidChargeMaterial
  getLiquidChargeMaterialForm(liquidChargeMaterial: LiquidChargeMaterial) {
    let reactionType = 'Endothermic';
    if (liquidChargeMaterial.thermicReactionType != 0) {
      reactionType = 'Exothermic';
    }
    return this.formBuilder.group({
      'materialName': [liquidChargeMaterial.materialName, Validators.required],
      'materialSpecificHeatLiquid': [liquidChargeMaterial.specificHeatLiquid, Validators.required],
      'materialVaporizingTemperature': [liquidChargeMaterial.vaporizingTemperature, Validators.required],
      'materialLatentHeat': [liquidChargeMaterial.latentHeat, Validators.required],
      'materialSpecificHeatVapor': [liquidChargeMaterial.specificHeatVapor, Validators.required],
      'feedRate': [liquidChargeMaterial.chargeFeedRate, Validators.required],
      'initialTemperature': [liquidChargeMaterial.initialTemperature, Validators.required],
      'dischargeTemperature': [liquidChargeMaterial.dischargeTemperature, Validators.required],
      'baselineLiquidVaporized': [liquidChargeMaterial.percentVaporized, Validators.required],
      'baselineLiquidReacted': [liquidChargeMaterial.percentReacted, Validators.required],
      'heatOfReaction': [liquidChargeMaterial.reactionHeat, Validators.required],
      'endothermicOrExothermic': [reactionType, Validators.required],
      'additionalHeatRequired': [liquidChargeMaterial.additionalHeat, Validators.required],
    })
  }

  //build LiquidChargeMaterial from liquidForm
  buildLiquidChargeMaterial(liquidForm: any): LiquidChargeMaterial {
    let reactionType = 0;
    if (liquidForm.value.baselineExothermicOrEndothermic == 'Exothermic') {
      reactionType = 1;
    }
    let tmpLiquidMaterial: LiquidChargeMaterial = {
      materialName: liquidForm.value.materialName,
      thermicReactionType: reactionType,
      specificHeatLiquid: liquidForm.value.materialSpecificHeatLiquid,
      vaporizingTemperature: liquidForm.value.materialVaporizingTemperature,
      latentHeat: liquidForm.value.materialLatentHeat,
      specificHeatVapor: liquidForm.value.materialSpecificHeatVapor,
      chargeFeedRate: liquidForm.value.feedRate,
      initialTemperature: liquidForm.value.initialTemperature,
      dischargeTemperature: liquidForm.value.dischargeTemperature,
      percentVaporized: liquidForm.value.baselineLiquidVaporized,
      percentReacted: liquidForm.value.baselineLiquidReacted,
      reactionHeat: liquidForm.value.heatOfReaction,
      additionalHeat: liquidForm.value.additionalHeatRequired
    }
    return tmpLiquidMaterial;
  }

  //empty solid charge material form
  initSolidForm() {
    //FUEL FIRED SOLID
    return this.formBuilder.group({
      'materialName': ['', Validators.required],
      'materialSpecificHeatOfSolidMaterial': ['', Validators.required],
      'materialLatentHeatOfFusion': ['', Validators.required],
      'materialHeatOfLiquid': ['', Validators.required],
      'materialMeltingPoint': ['', Validators.required],
      'feedRate': ['', Validators.required],
      'baselineWaterContentAsCharged': ['', Validators.required],
      'baselineWaterContentAsDischarged': ['', Validators.required],
      'initialTemperature': ['', Validators.required],
      'baselineChargeMaterialDischargeTemperature': ['', Validators.required],
      'baselineWaterVaporDischargeTemperature': ['', Validators.required],
      'baselinePercentChargeMelted': ['', Validators.required],
      'baselinePercentChargeReacted': ['', Validators.required],
      'heatOfReaction': ['', Validators.required],
      'endothermicOrExothermic': ['', Validators.required],
      'additionalHeatRequired': ['', Validators.required],
    })
  }

  //solid material form from SolidChargeMaterial
  getSolidChargeMaterialForm(solidChargeMaterial: SolidChargeMaterial) {
    let reactionType = 'Endothermic';
    if (solidChargeMaterial.thermicReactionType != 0) {
      reactionType = 'Exothermic';
    }
    //FUEL FIRED SOLID
    return this.formBuilder.group({
      'materialName': [solidChargeMaterial.materialName, Validators.required],
      'materialSpecificHeatOfSolidMaterial': [solidChargeMaterial.specificHeatSolid, Validators.required],
      'materialLatentHeatOfFusion': [solidChargeMaterial.latentHeat, Validators.required],
      'materialHeatOfLiquid': [solidChargeMaterial.specificHeatLiquid, Validators.required],
      'materialMeltingPoint': [solidChargeMaterial.meltingPoint, Validators.required],
      'feedRate': [solidChargeMaterial.chargeFeedRate, Validators.required],
      'baselineWaterContentAsCharged': [solidChargeMaterial.waterContentCharged, Validators.required],
      'baselineWaterContentAsDischarged': [solidChargeMaterial.waterContentDischarged, Validators.required],
      'initialTemperature': [solidChargeMaterial.initialTemperature, Validators.required],
      'baselineChargeMaterialDischargeTemperature': [solidChargeMaterial.dischargeTemperature, Validators.required],
      'baselineWaterVaporDischargeTemperature': [solidChargeMaterial.waterVaporDischargeTemperature, Validators.required],
      'baselinePercentChargeMelted': [solidChargeMaterial.chargeMelted, Validators.required],
      'baselinePercentChargeReacted': [solidChargeMaterial.chargeReacted, Validators.required],
      'heatOfReaction': [solidChargeMaterial.reactionHeat, Validators.required],
      'endothermicOrExothermic': [reactionType, Validators.required],
      'additionalHeatRequired': [solidChargeMaterial.additionalHeat, Validators.required],
    })
  }


  //SolidChargeMaterial from form
  buildSolidChargeMaterial(solidForm: any): SolidChargeMaterial {
    let reactionType = 0;
    if (solidForm.value.baselineExothermicOrEndothermic == 'Exothermic') {
      reactionType = 1;
    }

    let tmpSolidMaterial: SolidChargeMaterial = {
      materialName: solidForm.value.materialName,
      thermicReactionType: reactionType,
      specificHeatSolid: solidForm.value.materialSpecificHeatOfSolidMaterial,
      latentHeat: solidForm.value.materialLatentHeatOfFusion,
      specificHeatLiquid: solidForm.value.materialHeatOfLiquid,
      meltingPoint: solidForm.value.materialMeltingPoint,
      chargeFeedRate: solidForm.value.feedRate,
      waterContentCharged: solidForm.value.baselineWaterContentAsCharged,
      waterContentDischarged: solidForm.value.baselineWaterContentAsDischarged,
      initialTemperature: solidForm.value.initialTemperature,
      dischargeTemperature: solidForm.value.baselineChargeMaterialDischargeTemperature,
      waterVaporDischargeTemperature: solidForm.value.baselineWaterVaporDischargeTemperature,
      chargeMelted: solidForm.value.baselinePercentChargeMelted,
      chargeReacted: solidForm.value.baselinePercentChargeReacted,
      reactionHeat: solidForm.value.heatOfReaction,
      additionalHeat: solidForm.value.additionalHeatRequired
    }
    return tmpSolidMaterial;
  }
}
