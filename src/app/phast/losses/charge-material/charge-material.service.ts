import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
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
  initGasForm(lossNum: number): FormGroup {
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
      'name': ['Material #' + lossNum]
    });
  }
  //gas charge material form from GasChargeMaterial
  getGasChargeMaterialForm(chargeMaterial: ChargeMaterial): FormGroup {
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
  buildGasChargeMaterial(gasForm: FormGroup): ChargeMaterial {
    let reactionType = 0;
    if (gasForm.controls.endothermicOrExothermic.value == 'Exothermic') {
      reactionType = 1;
    }
    let tmpGasMaterial: ChargeMaterial = {
      name: gasForm.controls.name.value,
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
        additionalHeat: gasForm.controls.additionalHeatRequired.value
      }
    }
    return tmpGasMaterial;
  }

  //Empty liquid charge material form
  initLiquidForm(lossNum: number): FormGroup {
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
      'name': ['Material #' + lossNum]
    });
  }

  //liquid charge material form from LiquidChargeMaterial
  getLiquidChargeMaterialForm(chargeMaterial: ChargeMaterial): FormGroup {
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
  buildLiquidChargeMaterial(liquidForm: FormGroup): ChargeMaterial {
    let reactionType = 0;
    if (liquidForm.controls.endothermicOrExothermic.value == 'Exothermic') {
      reactionType = 1;
    }
    let tmpLiquidMaterial: ChargeMaterial = {
      name: liquidForm.controls.name.value,
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
        additionalHeat: liquidForm.controls.additionalHeatRequired.value
      }
    }
    return tmpLiquidMaterial;
  }

  //empty solid charge material form
  initSolidForm(lossNum: number): FormGroup {
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
      'name': ['Material #' + lossNum]
    });
  }

  //solid material form from SolidChargeMaterial
  getSolidChargeMaterialForm(chargeMaterial: ChargeMaterial): FormGroup {
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
  buildSolidChargeMaterial(solidForm: FormGroup): ChargeMaterial {
    let reactionType = 0;
    if (solidForm.controls.endothermicOrExothermic.value == 'Exothermic') {
      reactionType = 1;
    }
    let tmpSolidMaterial: ChargeMaterial = {
      name: solidForm.controls.name.value,
      solidChargeMaterial: {
        materialId: solidForm.controls.materialId.value,
        thermicReactionType: reactionType,
        specificHeatSolid: solidForm.controls.materialSpecificHeatOfSolidMaterial.value,
        latentHeat: solidForm.controls.materialLatentHeatOfFusion.value,
        specificHeatLiquid: solidForm.controls.materialHeatOfLiquid.value,
        meltingPoint: solidForm.controls.materialMeltingPoint.value,
        chargeFeedRate: solidForm.controls.feedRate.value,
        waterContentCharged: solidForm.controls.waterContentAsCharged.value,
        waterContentDischarged: solidForm.controls.waterContentAsDischarged.value,
        initialTemperature: solidForm.controls.initialTemperature.value,
        dischargeTemperature: solidForm.controls.chargeMaterialDischargeTemperature.value,
        waterVaporDischargeTemperature: solidForm.controls.waterVaporDischargeTemperature.value,
        chargeMelted: solidForm.controls.percentChargeMelted.value,
        chargeReacted: solidForm.controls.percentChargeReacted.value,
        reactionHeat: solidForm.controls.heatOfReaction.value,
        additionalHeat: solidForm.controls.additionalHeatRequired.value
      }
    }
    return tmpSolidMaterial;
  }
}
