import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ChargeMaterial, GasChargeMaterial, LiquidChargeMaterial, SolidChargeMaterial } from '../../../shared/models/phast/losses/chargeMaterial';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class ChargeMaterialService {

  deleteLossIndex: BehaviorSubject<number>;
  // addLossBaselineMonitor: BehaviorSubject<any>;
  // addLossModificationMonitor: BehaviorSubject<any>;
  constructor(private formBuilder: FormBuilder) {
    this.deleteLossIndex = new BehaviorSubject<number>(null);
    //   this.addLossBaselineMonitor = new BehaviorSubject<any>(null);
    //   this.addLossModificationMonitor = new BehaviorSubject<any>(null);
  }

  setDelete(num: number) {
    this.deleteLossIndex.next(num);
  }
  // addLoss(bool: boolean) {
  //   if (bool) {
  //     this.addLossModificationMonitor.next(true);
  //   } else {
  //     this.addLossBaselineMonitor.next(true);
  //   }
  // }
  //empty gas charge material form
  initGasForm(lossNum: number) {
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
      'name': ['Loss #' + lossNum]

    })
  }
  //gas charge material form from GasChargeMaterial
  getGasChargeMaterialForm(chargeMaterial: ChargeMaterial) {
    let reactionType = 'Endothermic';
    if (chargeMaterial.gasChargeMaterial.thermicReactionType != 0) {
      reactionType = 'Exothermic';
    }
    return this.formBuilder.group({
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
  }
  //GasChargeMaterial from gasForm
  buildGasChargeMaterial(gasForm: any): ChargeMaterial {
    let reactionType = 0;
    if (gasForm.value.endothermicOrExothermic == 'Exothermic') {
      reactionType = 1;
    }
    let tmpGasMaterial: ChargeMaterial = {
      name: gasForm.value.name,
      gasChargeMaterial: {
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
    }
    return tmpGasMaterial;
  }

  //Empty liquid charge material form
  initLiquidForm(lossNum: number) {
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
      'name': ['Loss #' + lossNum]
    })
  }

  //liquid charge material form from LiquidChargeMaterial
  getLiquidChargeMaterialForm(chargeMaterial: ChargeMaterial) {
    let reactionType = 'Endothermic';
    if (chargeMaterial.liquidChargeMaterial.thermicReactionType != 0) {
      reactionType = 'Exothermic';
    }
    return this.formBuilder.group({
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
    })
  }

  //build LiquidChargeMaterial from liquidForm
  buildLiquidChargeMaterial(liquidForm: any): ChargeMaterial {
    let reactionType = 0;
    if (liquidForm.value.endothermicOrExothermic == 'Exothermic') {
      reactionType = 1;
    }
    let tmpLiquidMaterial: ChargeMaterial = {
      name: liquidForm.value.name,
      liquidChargeMaterial: {
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
    }
    return tmpLiquidMaterial;
  }

  //empty solid charge material form
  initSolidForm(lossNum: number) {
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
      'name': ['Loss #' + lossNum]
    })
  }

  //solid material form from SolidChargeMaterial
  getSolidChargeMaterialForm(chargeMaterial: ChargeMaterial) {
    let reactionType = 'Endothermic';
    if (chargeMaterial.solidChargeMaterial.thermicReactionType != 0) {
      reactionType = 'Exothermic';
    }
    //FUEL FIRED SOLID
    return this.formBuilder.group({
      'materialId': [chargeMaterial.solidChargeMaterial.materialId, Validators.required],
      'materialSpecificHeatOfSolidMaterial': [chargeMaterial.solidChargeMaterial.specificHeatSolid, Validators.required],
      'materialLatentHeatOfFusion': [chargeMaterial.solidChargeMaterial.latentHeat, Validators.required],
      'materialHeatOfLiquid': [chargeMaterial.solidChargeMaterial.specificHeatLiquid, Validators.required],
      'materialMeltingPoint': [chargeMaterial.solidChargeMaterial.meltingPoint, Validators.required],
      'feedRate': [chargeMaterial.solidChargeMaterial.chargeFeedRate, Validators.required],
      'waterContentAsCharged': [chargeMaterial.solidChargeMaterial.waterContentCharged, Validators.required],
      'waterContentAsDischarged': [chargeMaterial.solidChargeMaterial.waterContentDischarged, Validators.required],
      'initialTemperature': [chargeMaterial.solidChargeMaterial.initialTemperature, Validators.required],
      'chargeMaterialDischargeTemperature': [chargeMaterial.solidChargeMaterial.dischargeTemperature, Validators.required],
      'waterVaporDischargeTemperature': [chargeMaterial.solidChargeMaterial.waterVaporDischargeTemperature, Validators.required],
      'percentChargeMelted': [chargeMaterial.solidChargeMaterial.chargeMelted, Validators.required],
      'percentChargeReacted': [chargeMaterial.solidChargeMaterial.chargeReacted, Validators.required],
      'heatOfReaction': [chargeMaterial.solidChargeMaterial.reactionHeat, Validators.required],
      'endothermicOrExothermic': [reactionType, Validators.required],
      'additionalHeatRequired': [chargeMaterial.solidChargeMaterial.additionalHeat, Validators.required],
      'name': [chargeMaterial.name]
    })
  }


  //SolidChargeMaterial from form
  buildSolidChargeMaterial(solidForm: any): ChargeMaterial {
    let reactionType = 0;
    if (solidForm.value.endothermicOrExothermic == 'Exothermic') {
      reactionType = 1;
    }
    let tmpSolidMaterial: ChargeMaterial = {
      name: solidForm.value.name,
      solidChargeMaterial: {
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
    }
    return tmpSolidMaterial;
  }
}
