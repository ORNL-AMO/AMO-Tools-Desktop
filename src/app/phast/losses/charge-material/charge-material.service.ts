import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ChargeMaterial, GasChargeMaterial, LiquidChargeMaterial, SolidChargeMaterial } from '../../../shared/models/phast/losses/chargeMaterial';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class ChargeMaterialService {

  constructor(private formBuilder: FormBuilder) {
  }
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

  //reusable
  checkWarningsExist(warnings: GasMaterialWarnings | LiquidMaterialWarnings | SolidMaterialWarnings): boolean {
    let hasWarning: boolean = false;
    for (var key in warnings) {
      if (warnings[key] !== null) {
        hasWarning = true;
      }
    }
    return hasWarning;
  }
  //all
  checkFeedRate(material: GasChargeMaterial | LiquidChargeMaterial | SolidChargeMaterial): string {
    if (material.feedRate < 0) {
      return 'Feed Rate must be greater than 0';
    } else {
      return null;
    }
  }

  checkHeatOfReaction(material: GasChargeMaterial | LiquidChargeMaterial | SolidChargeMaterial): string {
    if (material.reactionHeat < 0) {
      return 'Heat of Reaction cannot be less than zero. For exothermic reactions, change "Endothermic/Exothermic"';
    } else {
      return null;
    }
  }

  checkInitialTemp(material: GasChargeMaterial | LiquidChargeMaterial | SolidChargeMaterial): string {
    if (material.initialTemperature > material.dischargeTemperature) {
      return "Initial Temperature  (" + material.initialTemperature + ") cannot be greater than Outlet Temperature (" + material.dischargeTemperature + ")";
    }
    else {
      return null;
    }
  }
  //gas & liquid
  checkSpecificHeatOfVapor(material: GasChargeMaterial | LiquidChargeMaterial): string {
    if (material.specificHeatVapor < 0) {
      return 'Specific Heat of Vapor must positive';
    } else {
      return null;
    }
  }

  checkPercentReacted(material: GasChargeMaterial | LiquidChargeMaterial): string {
    if (material.percentReacted < 0) {
      return 'Feed Gas Reacted must be positive';
    } else if (material.percentReacted > 100) {
      return 'Feed Gas Reacted must be less than or equal to 100%'
    } else {
      return null;
    }
  }

  //gas
  checkGasWarnings(material: GasChargeMaterial): GasMaterialWarnings {
    return {
      initialTempWarning: this.checkInitialTemp(material),
      specificHeatGasWarning: this.checkSpecificHeatGas(material),
      feedGasRateWarning: this.checkFeedRate(material),
      gasMixVaporWarning: this.checkVaporInGas(material),
      specificHeatGasVaporWarning: this.checkSpecificHeatOfVapor(material),
      feedGasReactedWarning: this.checkPercentReacted(material),
      heatOfReactionWarning: this.checkHeatOfReaction(material)
    }
  }

  checkSpecificHeatGas(material: GasChargeMaterial): string {
    if (material.specificHeatGas < 0) {
      return 'Specific Heat of Gas must be equal or greater than 0';
    } else {
      return null;
    }
  }

  checkVaporInGas(material: GasChargeMaterial): string {
    if (material.percentVapor < 0) {
      return 'Vapor in Gas Mixture must be positive';
    } else if (material.percentVapor > 100) {
      return 'Vapor in Gas Mixture must be equal to or less than 100%';
    }
    else {
      return null;
    }
  }

  //liquid
  checkLiquidWarnings(material: LiquidChargeMaterial): LiquidMaterialWarnings {
    return {
      initialTempWarning: this.checkInitialTemp(material),
      dischargeTempWarning: this.checkDischargeTemp(material),
      specificHeatLiquidWarning: this.checkSpecificHeatLiquid(material),
      specificHeatVaporWarning: this.checkSpecificHeatOfVapor(material),
      feedLiquidRateWarning: this.checkFeedRate(material),
      chargeVaporWarning: this.checkLiquidVaporized(material),
      chargeReactedWarning: this.checkPercentReacted(material),
      heatOfReactionWarning: this.checkHeatOfReaction(material),
      inletOverVaporizingWarning: this.checkInletOverVaporizing(material),
      outletOverVaporizingWarning: this.checkOutletOverVaporizing(material),
      materialLatentHeatWarning: this.checkLiquidLatentHeat(material)
    }
  }

  checkLiquidLatentHeat(material: LiquidChargeMaterial): string {
    if (material.latentHeat < 0) {
      return 'Latent Heat of Vaporization must be equal or greater than 0';
    } else {
      return null;
    }
  }

  checkLiquidVaporized(material: LiquidChargeMaterial): string {
    if (material.percentVaporized < 0) {
      return 'Charge Liquid Vaporized must be positive';
    } else if (material.percentVaporized > 100) {
      return 'Charge Liquid Vaporized must be less than or equal to 100%';
    } else {
      return null;
    }
  }

  checkDischargeTemp(material: LiquidChargeMaterial): string {
    if ((material.dischargeTemperature > material.vaporizingTemperature) && material.percentVaporized == 0) {
      return 'The discharge temperature is higher than the Vaporizing Temperature, please enter proper percentage for charge vaporized.';
    } else if ((material.dischargeTemperature < material.vaporizingTemperature) && material.percentVaporized > 0) {
      return 'The discharge temperature is lower than the vaporizing temperature, the percentage for charge liquid vaporized should be 0%.';
    } else {
      return null;
    }
  }

  checkInletOverVaporizing(material: LiquidChargeMaterial): string {
    if (material.initialTemperature > material.vaporizingTemperature && material.percentVaporized <= 0) {
      return "The initial temperature is higher than the vaporization point, please enter proper percentage for charge vaporized.";
    } else {
      return null;
    }
  }
  checkOutletOverVaporizing(material: LiquidChargeMaterial): string {
    if (material.dischargeTemperature > material.vaporizingTemperature && material.percentVaporized <= 0) {
      return "The discharge temperature is higher than the vaporization point, please enter proper percentage for charge vaporized.";
    }
    else {
      return null;
    }
  }

  checkSpecificHeatLiquid(material: LiquidChargeMaterial): string {
    if (material.specificHeatLiquid < 0) {
      return 'Specific Heat of Liquid must be equal or greater than 0';
    } else {
      return null;
    }
  }

  //solid
  checkSolidWarnings(material: SolidChargeMaterial): SolidMaterialWarnings {
    return {
      initialTempWarning: this.checkInitialTemp(material),
      specificHeatWarning: this.checkSpecificHeatOfSolid(material),
      latentHeatWarning: this.checkLatentHeatOfFusion(material),
      heatOfLiquidWarning: this.checkHeatOfLiquid(material),
      feedRateWarning: this.checkFeedRate(material),
      waterChargedWarning: this.checkWaterContentCharged(material),
      waterDischargedWarning: this.checkWaterContentDischarged(material),
      chargeMeltedWarning: this.checkPercentMelted(material),
      chargeSolidReactedWarning: this.checkSolidPercentReacted(material),
      heatOfReactionWarning: this.checkHeatOfReaction(material),
      dischargeTempWarning: this.checkDischargeTemperature(material),
      initialOverMeltWarning: this.checkInitialOverMelting(material)
    }
  }

  checkSpecificHeatOfSolid(material: SolidChargeMaterial): string {
    if (material.specificHeatSolid < 0) {
      return 'Average Specific Heat must be equal or greater than 0';
    } else {
      return null;
    }
  }

  checkLatentHeatOfFusion(material: SolidChargeMaterial): string {
    if (material.latentHeat < 0) {
      return 'Latent Heat of Fusion must be equal or greater than 0';
    } else {
      return null;
    }
  }

  checkHeatOfLiquid(material: SolidChargeMaterial): string {
    if (material.specificHeatLiquid < 0) {
      return 'Specific heat of liquid from molten material must be equal or greater than 0';
    } else {
      return null;
    }
  }


  checkWaterContentCharged(material: SolidChargeMaterial): string {
    if (material.waterContentCharged < 0) {
      return 'Water Content as Charged must be equal or greater than 0%';
    } else if (material.waterContentCharged > 100) {
      return 'Water Content as Charged must be less than or equal to 100%';
    } else {
      return null;
    }
  }

  checkWaterContentDischarged(material: SolidChargeMaterial): string {
    if (material.waterContentDischarged < 0) {
      return 'Water Content as Discharged must be equal or greater than 0%';
    } else if (material.waterContentDischarged > 100) {
      return 'Water Content as Discharged must be less than or equal to 100%';
    } else {
      return null;
    }
  }

  checkPercentMelted(material: SolidChargeMaterial): string {
    if (material.chargeMelted < 0) {
      return 'Charge Melted must be equal or greater than 0%'
    } else if (material.chargeMelted > 100) {
      return 'Charge Melted must be less than or equal to 100%';
    } else {
      return null;
    }
  }

  checkSolidPercentReacted(material: SolidChargeMaterial): string {
    if (material.chargeReacted < 0) {
      return 'Charge Reacted must be equal or greater than 0%';
    } else if (material.chargeReacted > 100) {
      return 'Charge Reacted must be less than or equal to 100%';
    } else {
      return null;
    }
  }

  checkDischargeTemperature(material: SolidChargeMaterial): string {
    if ((material.dischargeTemperature > material.meltingPoint) && material.chargeMelted == 0) {
      return 'The discharge temperature is higher than the melting point, please enter proper percentage for charge melted.';
    } else if ((material.dischargeTemperature < material.meltingPoint) && material.chargeMelted > 0) {
      return 'The discharge temperature is lower than the melting point, the percentage for charge melted should be 0%.';
    } else {
      return null;
    }
  }

  checkInitialOverMelting(material: SolidChargeMaterial): string {
    if (material.initialTemperature > material.meltingPoint && material.chargeMelted <= 0) {
      return "The initial temperature is higher than the melting point, please enter proper percentage for charge melted.";
    }else {
      return null;
    }
  }
}


export interface GasMaterialWarnings {
  initialTempWarning: string;
  specificHeatGasWarning: string;
  feedGasRateWarning: string;
  gasMixVaporWarning: string;
  specificHeatGasVaporWarning: string;
  feedGasReactedWarning: string;
  heatOfReactionWarning: string;
}

export interface LiquidMaterialWarnings {
  initialTempWarning: string;
  dischargeTempWarning: string;
  specificHeatLiquidWarning: string;
  specificHeatVaporWarning: string;
  feedLiquidRateWarning: string;
  chargeVaporWarning: string;
  chargeReactedWarning: string;
  heatOfReactionWarning: string;
  inletOverVaporizingWarning: string;
  outletOverVaporizingWarning: string;
  materialLatentHeatWarning: string;
}

export interface SolidMaterialWarnings {
  initialTempWarning: string;
  specificHeatWarning: string;
  latentHeatWarning: string;
  heatOfLiquidWarning: string;
  feedRateWarning: string;
  waterChargedWarning: string;
  waterDischargedWarning: string;
  chargeMeltedWarning: string;
  chargeSolidReactedWarning: string;
  heatOfReactionWarning: string;
  dischargeTempWarning: string;
  initialOverMeltWarning: string;
}