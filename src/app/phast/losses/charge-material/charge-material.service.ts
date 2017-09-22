import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ChargeMaterial, GasChargeMaterial, LiquidChargeMaterial, SolidChargeMaterial } from '../../../shared/models/phast/losses/chargeMaterial';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class ChargeMaterialService {
  
  deleteLossIndex: BehaviorSubject<number>;
  addLossBaselineMonitor: BehaviorSubject<any>;
  addLossModificationMonitor: BehaviorSubject<any>;
  constructor(private formBuilder: FormBuilder) {
    this.deleteLossIndex = new BehaviorSubject<number>(null);
    this.addLossBaselineMonitor = new BehaviorSubject<any>(null);
    this.addLossModificationMonitor = new BehaviorSubject<any>(null);
  }

  setDelete(num: number) {
    this.deleteLossIndex.next(num);
  }
  addLoss(bool: boolean) {
    if (bool) {
      this.addLossModificationMonitor.next(true);
    } else {
      this.addLossBaselineMonitor.next(true);
    }
  }
  //empty gas charge material form
  initGasForm() {
    return this.formBuilder.group({
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

    })
  }
  //gas charge material form from GasChargeMaterial
  getGasChargeMaterialForm(gasMaterial: GasChargeMaterial) {
    let reactionType = 'Endothermic';
    if (gasMaterial.thermicReactionType != 0) {
      reactionType = 'Exothermic';
    }
    return this.formBuilder.group({
      'materialId': [gasMaterial.materialId, Validators.required],
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
      materialId: gasForm.value.materialId,
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
    })
  }

  //liquid charge material form from LiquidChargeMaterial
  getLiquidChargeMaterialForm(liquidChargeMaterial: LiquidChargeMaterial) {
    let reactionType = 'Endothermic';
    if (liquidChargeMaterial.thermicReactionType != 0) {
      reactionType = 'Exothermic';
    }
    return this.formBuilder.group({
      'materialId': [liquidChargeMaterial.materialId, Validators.required],
      'materialSpecificHeatLiquid': [liquidChargeMaterial.specificHeatLiquid, Validators.required],
      'materialVaporizingTemperature': [liquidChargeMaterial.vaporizingTemperature, Validators.required],
      'materialLatentHeat': [liquidChargeMaterial.latentHeat, Validators.required],
      'materialSpecificHeatVapor': [liquidChargeMaterial.specificHeatVapor, Validators.required],
      'feedRate': [liquidChargeMaterial.chargeFeedRate, Validators.required],
      'initialTemperature': [liquidChargeMaterial.initialTemperature, Validators.required],
      'dischargeTemperature': [liquidChargeMaterial.dischargeTemperature, Validators.required],
      'liquidVaporized': [liquidChargeMaterial.percentVaporized, Validators.required],
      'liquidReacted': [liquidChargeMaterial.percentReacted, Validators.required],
      'heatOfReaction': [liquidChargeMaterial.reactionHeat, Validators.required],
      'endothermicOrExothermic': [reactionType, Validators.required],
      'additionalHeatRequired': [liquidChargeMaterial.additionalHeat, Validators.required],
    })
  }

  //build LiquidChargeMaterial from liquidForm
  buildLiquidChargeMaterial(liquidForm: any): LiquidChargeMaterial {
    let reactionType = 0;
    if (liquidForm.value.endothermicOrExothermic == 'Exothermic') {
      reactionType = 1;
    }
    let tmpLiquidMaterial: LiquidChargeMaterial = {
      materialId: liquidForm.value.materialId,
      thermicReactionType: reactionType,
      specificHeatLiquid: liquidForm.value.materialSpecificHeatLiquid,
      vaporizingTemperature: liquidForm.value.materialVaporizingTemperature,
      latentHeat: liquidForm.value.materialLatentHeat,
      specificHeatVapor: liquidForm.value.materialSpecificHeatVapor,
      chargeFeedRate: liquidForm.value.feedRate,
      initialTemperature: liquidForm.value.initialTemperature,
      dischargeTemperature: liquidForm.value.dischargeTemperature,
      percentVaporized: liquidForm.value.liquidVaporized,
      percentReacted: liquidForm.value.liquidReacted,
      reactionHeat: liquidForm.value.heatOfReaction,
      additionalHeat: liquidForm.value.additionalHeatRequired
    }
    return tmpLiquidMaterial;
  }

  //empty solid charge material form
  initSolidForm() {
    //FUEL FIRED SOLID
    return this.formBuilder.group({
      'materialId': [1, Validators.required],
      'materialSpecificHeatOfSolidMaterial': ['', Validators.required],
      'materialLatentHeatOfFusion': ['', Validators.required],
      'materialHeatOfLiquid': ['', Validators.required],
      'materialMeltingPoint': ['', Validators.required],
      'feedRate': ['', Validators.required],
      'waterContentAsCharged': [0, Validators.required],
      'waterContentAsDischarged': [0, Validators.required],
      'initialTemperature': ['', Validators.required],
      'chargeMaterialDischargeTemperature': ['', Validators.required],
      'waterVaporDischargeTemperature': [0, Validators.required],
      'percentChargeMelted': [0, Validators.required],
      'percentChargeReacted': [0, Validators.required],
      'heatOfReaction': [0, Validators.required],
      'endothermicOrExothermic': ['Endothermic', Validators.required],
      'additionalHeatRequired': [0, Validators.required],
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
      'materialId': [solidChargeMaterial.materialId, Validators.required],
      'materialSpecificHeatOfSolidMaterial': [solidChargeMaterial.specificHeatSolid, Validators.required],
      'materialLatentHeatOfFusion': [solidChargeMaterial.latentHeat, Validators.required],
      'materialHeatOfLiquid': [solidChargeMaterial.specificHeatLiquid, Validators.required],
      'materialMeltingPoint': [solidChargeMaterial.meltingPoint, Validators.required],
      'feedRate': [solidChargeMaterial.chargeFeedRate, Validators.required],
      'waterContentAsCharged': [solidChargeMaterial.waterContentCharged, Validators.required],
      'waterContentAsDischarged': [solidChargeMaterial.waterContentDischarged, Validators.required],
      'initialTemperature': [solidChargeMaterial.initialTemperature, Validators.required],
      'chargeMaterialDischargeTemperature': [solidChargeMaterial.dischargeTemperature, Validators.required],
      'waterVaporDischargeTemperature': [solidChargeMaterial.waterVaporDischargeTemperature, Validators.required],
      'percentChargeMelted': [solidChargeMaterial.chargeMelted, Validators.required],
      'percentChargeReacted': [solidChargeMaterial.chargeReacted, Validators.required],
      'heatOfReaction': [solidChargeMaterial.reactionHeat, Validators.required],
      'endothermicOrExothermic': [reactionType, Validators.required],
      'additionalHeatRequired': [solidChargeMaterial.additionalHeat, Validators.required],
    })
  }


  //SolidChargeMaterial from form
  buildSolidChargeMaterial(solidForm: any): SolidChargeMaterial {
    let reactionType = 0;
    if (solidForm.value.endothermicOrExothermic == 'Exothermic') {
      reactionType = 1;
    }

    let tmpSolidMaterial: SolidChargeMaterial = {
      materialId: solidForm.value.materialId,
      thermicReactionType: reactionType,
      specificHeatSolid: solidForm.value.materialSpecificHeatOfSolidMaterial,
      latentHeat: solidForm.value.materialLatentHeatOfFusion,
      specificHeatLiquid: solidForm.value.materialHeatOfLiquid,
      meltingPoint: solidForm.value.materialMeltingPoint,
      chargeFeedRate: solidForm.value.feedRate,
      waterContentCharged: solidForm.value.waterContentAsCharged,
      waterContentDischarged: solidForm.value.waterContentAsDischarged,
      initialTemperature: solidForm.value.initialTemperature,
      dischargeTemperature: solidForm.value.chargeMaterialDischargeTemperature,
      waterVaporDischargeTemperature: solidForm.value.waterVaporDischargeTemperature,
      chargeMelted: solidForm.value.percentChargeMelted,
      chargeReacted: solidForm.value.percentChargeReacted,
      reactionHeat: solidForm.value.heatOfReaction,
      additionalHeat: solidForm.value.additionalHeatRequired
    }
    return tmpSolidMaterial;
  }
}
