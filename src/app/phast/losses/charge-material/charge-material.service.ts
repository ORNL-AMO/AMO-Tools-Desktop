import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ChargeMaterial, GasChargeMaterial, LiquidChargeMaterial, SolidChargeMaterial } from '../../../shared/models/losses/chargeMaterial';

@Injectable()
export class ChargeMaterialService {

  constructor(private formBuilder: FormBuilder) { }
  
  //empty gas charge material form
  initGasForm() {
    return this.formBuilder.group({
      'baselineMaterialName': ['', Validators.required],
      'baselineMaterialSpecificHeat': ['', Validators.required],
      'baselineFeedRate': ['', Validators.required],
      'baselineVaporInGas': ['', Validators.required],
      'baselineInitialTemperature': ['', Validators.required],
      'baselineDischargeTemperature': ['', Validators.required],
      'baselineSpecificHeatOfVapor': ['', Validators.required],
      'baselineGasReacted': ['', Validators.required],
      'baselineHeatOfReaction': ['', Validators.required],
      'baselineEndothermicOrExothermic': ['', Validators.required],
      'baselineAdditionalHeatRequired': ['', Validators.required],
      'modifiedMaterialName': ['', Validators.required],
      'modifiedMaterialSpecificHeat': ['', Validators.required],
      'modifiedFeedRate': ['', Validators.required],
      'modifiedVaporInGas': ['', Validators.required],
      'modifiedInitialTemperature': ['', Validators.required],
      'modifiedDischargeTemperature': ['', Validators.required],
      'modifiedSpecificHeatOfVapor': ['', Validators.required],
      'modifiedGasReacted': ['', Validators.required],
      'modifiedHeatOfReaction': ['', Validators.required],
      'modifiedEndothermicOrExothermic': ['', Validators.required],
      'modifiedAdditionalHeatRequired': ['', Validators.required]
    })
  }
  //gas charge material form from GasChargeMaterial
  getGasChargeMaterialForm(gasMaterial: GasChargeMaterial) {
    let baselineReactionType = 'Endothermic';
    let modifiedReactionType = 'Endothermic';
    if (gasMaterial.baseline.thermicReactionType != 0) {
      baselineReactionType = 'Exothermic';
    }
    if (gasMaterial.modified.thermicReactionType != 0) {
      modifiedReactionType = 'Exothermic';
    }
    return this.formBuilder.group({
      'baselineMaterialName': [gasMaterial.baseline.materialName, Validators.required],
      'baselineMaterialSpecificHeat': [gasMaterial.baseline.specificHeatGas, Validators.required],
      'baselineFeedRate': [gasMaterial.baseline.feedRate, Validators.required],
      'baselineVaporInGas': [gasMaterial.baseline.percentVapor, Validators.required],
      'baselineInitialTemperature': [gasMaterial.baseline.initialTemperature, Validators.required],
      'baselineDischargeTemperature': [gasMaterial.baseline.dischargeTemperature, Validators.required],
      'baselineSpecificHeatOfVapor': [gasMaterial.baseline.specificHeatVapor, Validators.required],
      'baselineGasReacted': [gasMaterial.baseline.percentReacted, Validators.required],
      'baselineHeatOfReaction': [gasMaterial.baseline.reactionHeat, Validators.required],
      'baselineEndothermicOrExothermic': [baselineReactionType, Validators.required],
      'baselineAdditionalHeatRequired': [gasMaterial.baseline.additionalHeat, Validators.required],
      'modifiedMaterialName': [gasMaterial.modified.materialName, Validators.required],
      'modifiedMaterialSpecificHeat': [gasMaterial.modified.specificHeatGas, Validators.required],
      'modifiedFeedRate': [gasMaterial.modified.feedRate, Validators.required],
      'modifiedVaporInGas': [gasMaterial.modified.percentVapor, Validators.required],
      'modifiedInitialTemperature': [gasMaterial.modified.initialTemperature, Validators.required],
      'modifiedDischargeTemperature': [gasMaterial.modified.dischargeTemperature, Validators.required],
      'modifiedSpecificHeatOfVapor': [gasMaterial.modified.specificHeatVapor, Validators.required],
      'modifiedGasReacted': [gasMaterial.modified.percentReacted, Validators.required],
      'modifiedHeatOfReaction': [gasMaterial.modified.reactionHeat, Validators.required],
      'modifiedEndothermicOrExothermic': [modifiedReactionType, Validators.required],
      'modifiedAdditionalHeatRequired': [gasMaterial.modified.additionalHeat, Validators.required]
    });
  }
  //GasChargeMaterial from gasForm
  buildGasChargeMaterial(gasForm: any): GasChargeMaterial {
    let baselineReactionType = 0;
    let modifiedReactionType = 0;
    if (gasForm.value.baselineExothermicOrEndothermic == 'Exothermic') {
      baselineReactionType = 1;
    }
    if (gasForm.value.modifiedExothermicOrEndothermic == 'Exothermic') {
      modifiedReactionType = 1;
    }
    let tmpGasMaterial: GasChargeMaterial = {
      baseline: {
        materialName: gasForm.value.baselineMaterialName,
        thermicReactionType: baselineReactionType,
        specificHeatGas: gasForm.value.baselineMaterialSpecificHeat,
        feedRate: gasForm.value.baselineFeedRate,
        percentVapor: gasForm.value.baselineVaporInGas,
        initialTemperature: gasForm.value.baselineInitialTemperature,
        dischargeTemperature: gasForm.value.baselineDischargeTemperature,
        specificHeatVapor: gasForm.value.baselineSpecificHeatOfVapor,
        percentReacted: gasForm.value.baselineGasReacted,
        reactionHeat: gasForm.value.baselineHeatOfReaction,
        additionalHeat: gasForm.value.baselineAdditionalHeatRequired
      },
      modified: {
        materialName: gasForm.value.modifiedMaterialName,
        thermicReactionType: modifiedReactionType,
        specificHeatGas: gasForm.value.modifiedMaterialSpecificHeat,
        feedRate: gasForm.value.modifiedFeedRate,
        percentVapor: gasForm.value.modifiedVaporInGas,
        initialTemperature: gasForm.value.modifiedInitialTemperature,
        dischargeTemperature: gasForm.value.modifiedDischargeTemperature,
        specificHeatVapor: gasForm.value.modifiedSpecificHeatOfVapor,
        percentReacted: gasForm.value.modifiedGasReacted,
        reactionHeat: gasForm.value.modifiedHeatOfReaction,
        additionalHeat: gasForm.value.modifiedAdditionalHeatRequired
      }
    }
    return tmpGasMaterial;
  }

  //Empty liquid charge material form
  initLiquidForm() {
    return this.formBuilder.group({
      'baselineMaterialName': ['', Validators.required],
      'baselineMaterialSpecificHeatLiquid': ['', Validators.required],
      'baselineMaterialVaporizingTemperature': ['', Validators.required],
      'baselineMaterialLatentHeat': ['', Validators.required],
      'baselineMaterialSpecificHeatVapor': ['', Validators.required],
      'baselineFeedRate': ['', Validators.required],
      'baselineInitialTemperature': ['', Validators.required],
      'baselineDischargeTemperature': ['', Validators.required],
      'baselineLiquidVaporized': ['', Validators.required],
      'baselineLiquidReacted': ['', Validators.required],
      'baselineHeatOfReaction': ['', Validators.required],
      'baselineEndothermicOrExothermic': ['', Validators.required],
      'baselineAdditionalHeatRequired': ['', Validators.required],
      'modifiedMaterialName': ['', Validators.required],
      'modifiedMaterialSpecificHeatLiquid': ['', Validators.required],
      'modifiedMaterialVaporizingTemperature': ['', Validators.required],
      'modifiedMaterialLatentHeat': ['', Validators.required],
      'modifiedMaterialSpecificHeatVapor': ['', Validators.required],
      'modifiedFeedRate': ['', Validators.required],
      'modifiedInitialTemperature': ['', Validators.required],
      'modifiedDischargeTemperature': ['', Validators.required],
      'modifiedLiquidVaporized': ['', Validators.required],
      'modifiedLiquidReacted': ['', Validators.required],
      'modifiedHeatOfReaction': ['', Validators.required],
      'modifiedEndothermicOrExothermic': ['', Validators.required],
      'modifiedAdditionalHeatRequired': ['', Validators.required]
    })
  }

  //liquid charge material form from LiquidChargeMaterial
  getLiquidChargeMaterialForm(liquidChargeMaterial: LiquidChargeMaterial) {
    let baselineReactionType = 'Endothermic';
    let modifiedReactionType = 'Endothermic';
    if (liquidChargeMaterial.baseline.thermicReactionType != 0) {
      baselineReactionType = 'Exothermic';
    }
    if (liquidChargeMaterial.modified.thermicReactionType != 0) {
      modifiedReactionType = 'Exothermic';
    }
    return this.formBuilder.group({
      'baselineMaterialName': [liquidChargeMaterial.baseline.materialName, Validators.required],
      'baselineMaterialSpecificHeatLiquid': [liquidChargeMaterial.baseline.specificHeatLiquid, Validators.required],
      'baselineMaterialVaporizingTemperature': [liquidChargeMaterial.baseline.vaporizingTemperature, Validators.required],
      'baselineMaterialLatentHeat': [liquidChargeMaterial.baseline.latentHeat, Validators.required],
      'baselineMaterialSpecificHeatVapor': [liquidChargeMaterial.baseline.specificHeatVapor, Validators.required],
      'baselineFeedRate': [liquidChargeMaterial.baseline.chargeFeedRate, Validators.required],
      'baselineInitialTemperature': [liquidChargeMaterial.baseline.initialTemperature, Validators.required],
      'baselineDischargeTemperature': [liquidChargeMaterial.baseline.dischargeTemperature, Validators.required],
      'baselineLiquidVaporized': [liquidChargeMaterial.baseline.percentVaporized, Validators.required],
      'baselineLiquidReacted': [liquidChargeMaterial.baseline.percentReacted, Validators.required],
      'baselineHeatOfReaction': [liquidChargeMaterial.baseline.reactionHeat, Validators.required],
      'baselineEndothermicOrExothermic': [baselineReactionType, Validators.required],
      'baselineAdditionalHeatRequired': [liquidChargeMaterial.baseline.additionalHeat, Validators.required],
      'modifiedMaterialName': [liquidChargeMaterial.modified.materialName, Validators.required],
      'modifiedMaterialSpecificHeatLiquid': [liquidChargeMaterial.modified.specificHeatLiquid, Validators.required],
      'modifiedMaterialVaporizingTemperature': [liquidChargeMaterial.modified.vaporizingTemperature, Validators.required],
      'modifiedMaterialLatentHeat': [liquidChargeMaterial.modified.latentHeat, Validators.required],
      'modifiedMaterialSpecificHeatVapor': [liquidChargeMaterial.modified.specificHeatVapor, Validators.required],
      'modifiedFeedRate': [liquidChargeMaterial.modified.chargeFeedRate, Validators.required],
      'modifiedInitialTemperature': [liquidChargeMaterial.modified.initialTemperature, Validators.required],
      'modifiedDischargeTemperature': [liquidChargeMaterial.modified.dischargeTemperature, Validators.required],
      'modifiedLiquidVaporized': [liquidChargeMaterial.modified.percentVaporized, Validators.required],
      'modifiedLiquidReacted': [liquidChargeMaterial.modified.percentReacted, Validators.required],
      'modifiedHeatOfReaction': [liquidChargeMaterial.modified.reactionHeat, Validators.required],
      'modifiedEndothermicOrExothermic': [modifiedReactionType, Validators.required],
      'modifiedAdditionalHeatRequired': [liquidChargeMaterial.modified.additionalHeat, Validators.required]
    })
  }

  //build LiquidChargeMaterial from liquidForm
  buildLiquidChargeMaterial(liquidForm: any): LiquidChargeMaterial {
    let baselineReactionType = 0;
    let modifiedReactionType = 0;
    if (liquidForm.value.baselineExothermicOrEndothermic == 'Exothermic') {
      baselineReactionType = 1;
    }
    if (liquidForm.value.modifiedExothermicOrEndothermic == 'Exothermic') {
      modifiedReactionType = 1;
    }
    let tmpLiquidMaterial: LiquidChargeMaterial = {
      baseline: {
        materialName: liquidForm.value.baselineMaterialName,
        thermicReactionType: baselineReactionType,
        specificHeatLiquid: liquidForm.value.baselineMaterialSpecificHeatLiquid,
        vaporizingTemperature: liquidForm.value.baselineMaterialVaporizingTemperature,
        latentHeat: liquidForm.value.baselineMaterialLatentHeat,
        specificHeatVapor: liquidForm.value.baselineMaterialSpecificHeatVapor,
        chargeFeedRate: liquidForm.value.baselineFeedRate,
        initialTemperature: liquidForm.value.baselineInitialTemperature,
        dischargeTemperature: liquidForm.value.baselineDischargeTemperature,
        percentVaporized: liquidForm.value.baselineLiquidVaporized,
        percentReacted: liquidForm.value.baselineLiquidReacted,
        reactionHeat: liquidForm.value.baselineHeatOfReaction,
        additionalHeat: liquidForm.value.baselineAdditionalHeatRequired
      },
      modified: {
        materialName: liquidForm.value.modifiedMaterialName,
        thermicReactionType: modifiedReactionType,
        specificHeatLiquid: liquidForm.value.modifiedMaterialSpecificHeatLiquid,
        vaporizingTemperature: liquidForm.value.modifiedMaterialVaporizingTemperature,
        latentHeat: liquidForm.value.modifiedMaterialLatentHeat,
        specificHeatVapor: liquidForm.value.modifiedMaterialSpecificHeatVapor,
        chargeFeedRate: liquidForm.value.modifiedFeedRate,
        initialTemperature: liquidForm.value.modifiedInitialTemperature,
        dischargeTemperature: liquidForm.value.modifiedDischargeTemperature,
        percentVaporized: liquidForm.value.modifiedLiquidVaporized,
        percentReacted: liquidForm.value.modifiedLiquidReacted,
        reactionHeat: liquidForm.value.modifiedHeatOfReaction,
        additionalHeat: liquidForm.value.modifiedAdditionalHeatRequired
      }
    }
    return tmpLiquidMaterial;
  }

  //empty solid charge material form
  initSolidForm() {
    //FUEL FIRED SOLID
    return this.formBuilder.group({
      'baselineMaterialName': ['', Validators.required],
      'baselineMaterialSpecificHeatOfSolidMaterial': ['', Validators.required],
      'baselineMaterialLatentHeatOfFusion': ['', Validators.required],
      'baselineMaterialHeatOfLiquid': ['', Validators.required],
      'baselineMaterialMeltingPoint': ['', Validators.required],
      'baselineFeedRate': ['', Validators.required],
      'baselineWaterContentAsCharged': ['', Validators.required],
      'baselineWaterContentAsDischarged': ['', Validators.required],
      'baselineInitialTemperature': ['', Validators.required],
      'baselineChargeMaterialDischargeTemperature': ['', Validators.required],
      'baselineWaterVaporDischargeTemperature': ['', Validators.required],
      'baselinePercentChargeMelted': ['', Validators.required],
      'baselinePercentChargeReacted': ['', Validators.required],
      'baselineHeatOfReaction': ['', Validators.required],
      'baselineEndothermicOrExothermic': ['', Validators.required],
      'baselineAdditionalHeatRequired': ['', Validators.required],
      'modifiedMaterialName': ['', Validators.required],
      'modifiedMaterialSpecificHeatOfSolidMaterial': ['', Validators.required],
      'modifiedMaterialLatentHeatOfFusion': ['', Validators.required],
      'modifiedMaterialHeatOfLiquid': ['', Validators.required],
      'modifiedMaterialMeltingPoint': ['', Validators.required],
      'modifiedFeedRate': ['', Validators.required],
      'modifiedWaterContentAsCharged': ['', Validators.required],
      'modifiedWaterContentAsDischarged': ['', Validators.required],
      'modifiedInitialTemperature': ['', Validators.required],
      'modifiedChargeMaterialDischargeTemperature': ['', Validators.required],
      'modifiedWaterVaporDischargeTemperature': ['', Validators.required],
      'modifiedPercentChargeMelted': ['', Validators.required],
      'modifiedPercentChargeReacted': ['', Validators.required],
      'modifiedHeatOfReaction': ['', Validators.required],
      'modifiedEndothermicOrExothermic': ['', Validators.required],
      'modifiedAdditionalHeatRequired': ['', Validators.required],
    })
  }

  //solid material form from SolidChargeMaterial
  getSolidChargeMaterialForm(solidChargeMaterial: SolidChargeMaterial) {
    let baselineReactionType = 'Endothermic';
    let modifiedReactionType = 'Endothermic';
    if (solidChargeMaterial.baseline.thermicReactionType != 0) {
      baselineReactionType = 'Exothermic';
    }
    if (solidChargeMaterial.modified.thermicReactionType != 0) {
      modifiedReactionType = 'Exothermic';
    }
    //FUEL FIRED SOLID
    return this.formBuilder.group({
      'baselineMaterialName': [solidChargeMaterial.baseline.materialName, Validators.required],
      'baselineMaterialSpecificHeatOfSolidMaterial': [solidChargeMaterial.baseline.specificHeatSolid, Validators.required],
      'baselineMaterialLatentHeatOfFusion': [solidChargeMaterial.baseline.latentHeat, Validators.required],
      'baselineMaterialHeatOfLiquid': [solidChargeMaterial.baseline.specificHeatLiquid, Validators.required],
      'baselineMaterialMeltingPoint': [solidChargeMaterial.baseline.meltingPoint, Validators.required],
      'baselineFeedRate': [solidChargeMaterial.baseline.chargeFeedRate, Validators.required],
      'baselineWaterContentAsCharged': [solidChargeMaterial.baseline.waterContentCharged, Validators.required],
      'baselineWaterContentAsDischarged': [solidChargeMaterial.baseline.waterContentDischarged, Validators.required],
      'baselineInitialTemperature': [solidChargeMaterial.baseline.initialTemperature, Validators.required],
      'baselineChargeMaterialDischargeTemperature': [solidChargeMaterial.baseline.dischargeTemperature, Validators.required],
      'baselineWaterVaporDischargeTemperature': [solidChargeMaterial.baseline.waterVaporDischargeTemperature, Validators.required],
      'baselinePercentChargeMelted': [solidChargeMaterial.baseline.chargeMelted, Validators.required],
      'baselinePercentChargeReacted': [solidChargeMaterial.baseline.chargeReacted, Validators.required],
      'baselineHeatOfReaction': [solidChargeMaterial.baseline.reactionHeat, Validators.required],
      'baselineEndothermicOrExothermic': [baselineReactionType, Validators.required],
      'baselineAdditionalHeatRequired': [solidChargeMaterial.baseline.additionalHeat, Validators.required],
      'modifiedMaterialName': [solidChargeMaterial.modified.materialName, Validators.required],
      'modifiedMaterialSpecificHeatOfSolidMaterial': [solidChargeMaterial.modified.specificHeatSolid, Validators.required],
      'modifiedMaterialLatentHeatOfFusion': [solidChargeMaterial.modified.latentHeat, Validators.required],
      'modifiedMaterialHeatOfLiquid': [solidChargeMaterial.modified.specificHeatLiquid, Validators.required],
      'modifiedMaterialMeltingPoint': [solidChargeMaterial.modified.meltingPoint, Validators.required],
      'modifiedFeedRate': [solidChargeMaterial.modified.chargeFeedRate, Validators.required],
      'modifiedWaterContentAsCharged': [solidChargeMaterial.modified.waterContentCharged, Validators.required],
      'modifiedWaterContentAsDischarged': [solidChargeMaterial.modified.waterContentDischarged, Validators.required],
      'modifiedInitialTemperature': [solidChargeMaterial.modified.initialTemperature, Validators.required],
      'modifiedChargeMaterialDischargeTemperature': [solidChargeMaterial.modified.dischargeTemperature, Validators.required],
      'modifiedWaterVaporDischargeTemperature': [solidChargeMaterial.modified.waterVaporDischargeTemperature, Validators.required],
      'modifiedPercentChargeMelted': [solidChargeMaterial.modified.chargeMelted, Validators.required],
      'modifiedPercentChargeReacted': [solidChargeMaterial.modified.chargeReacted, Validators.required],
      'modifiedHeatOfReaction': [solidChargeMaterial.modified.reactionHeat, Validators.required],
      'modifiedEndothermicOrExothermic': [modifiedReactionType, Validators.required],
      'modifiedAdditionalHeatRequired': [solidChargeMaterial.modified.additionalHeat, Validators.required],
    })
  }


  //SolidChargeMaterial from form
  buildSolidChargeMaterial(solidForm: any): SolidChargeMaterial {
    let baselineReactionType = 0;
    let modifiedReactionType = 0;
    if (solidForm.value.baselineExothermicOrEndothermic == 'Exothermic') {
      baselineReactionType = 1;
    }
    if (solidForm.value.modifiedExothermicOrEndothermic == 'Exothermic') {
      modifiedReactionType = 1;
    }

    let tmpSolidMaterial: SolidChargeMaterial = {
      baseline: {
        materialName: solidForm.value.baselineMaterialName,
        thermicReactionType: baselineReactionType,
        specificHeatSolid: solidForm.value.baselineMaterialSpecificHeatOfSolidMaterial,
        latentHeat: solidForm.value.baselineMaterialLatentHeatOfFusion,
        specificHeatLiquid: solidForm.value.baselineMaterialHeatOfLiquid,
        meltingPoint: solidForm.value.baselineMaterialMeltingPoint,
        chargeFeedRate: solidForm.value.baselineFeedRate,
        waterContentCharged: solidForm.value.baselineWaterContentAsCharged,
        waterContentDischarged: solidForm.value.baselineWaterContentAsDischarged,
        initialTemperature: solidForm.value.baselineInitialTemperature,
        dischargeTemperature: solidForm.value.baselineChargeMaterialDischargeTemperature,
        waterVaporDischargeTemperature: solidForm.value.baselineWaterVaporDischargeTemperature,
        chargeMelted: solidForm.value.baselinePercentChargeMelted,
        chargeReacted: solidForm.value.baselinePercentChargeReacted,
        reactionHeat: solidForm.value.baselineHeatOfReaction,
        additionalHeat: solidForm.value.baselineAdditionalHeatRequired
      },
      modified: {
        materialName: solidForm.value.modifiedMaterialName,
        thermicReactionType: modifiedReactionType,
        specificHeatSolid: solidForm.value.modifiedMaterialSpecificHeatOfSolidMaterial,
        latentHeat: solidForm.value.modifiedMaterialLatentHeatOfFusion,
        specificHeatLiquid: solidForm.value.modifiedMaterialHeatOfLiquid,
        meltingPoint: solidForm.value.modifiedMaterialMeltingPoint,
        chargeFeedRate: solidForm.value.modifiedFeedRate,
        waterContentCharged: solidForm.value.modifiedWaterContentAsCharged,
        waterContentDischarged: solidForm.value.modifiedWaterContentAsDischarged,
        initialTemperature: solidForm.value.modifiedInitialTemperature,
        dischargeTemperature: solidForm.value.modifiedChargeMaterialDischargeTemperature,
        waterVaporDischargeTemperature: solidForm.value.modifiedWaterVaporDischargeTemperature,
        chargeMelted: solidForm.value.modifiedPercentChargeMelted,
        chargeReacted: solidForm.value.modifiedPercentChargeReacted,
        reactionHeat: solidForm.value.modifiedHeatOfReaction,
        additionalHeat: solidForm.value.modifiedAdditionalHeatRequired
      }
    }
    return tmpSolidMaterial;

  }
}
