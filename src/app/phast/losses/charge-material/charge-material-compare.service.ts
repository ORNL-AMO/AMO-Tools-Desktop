import { Injectable } from '@angular/core';
import { ChargeMaterial } from '../../../shared/models/phast/losses/chargeMaterial';
import { PHAST } from '../../../shared/models/phast/phast';

@Injectable()
export class ChargeMaterialCompareService {

  baselineMaterials: ChargeMaterial[];
  modifiedMaterials: ChargeMaterial[];
  constructor() {
  }

  compareAllMaterials() {
    let index = 0;
    let numLoss = this.baselineMaterials.length;
    let isDiff: boolean = false;
    if (this.modifiedMaterials) {
      for (index; index < numLoss; index++) {
        let typeCheck = this.compareMaterialType(index);
        if (typeCheck === false) {
          if (this.baselineMaterials[index].chargeMaterialType === 'Liquid') {
            if (this.compareLiquidMaterial(index) === true) {
              isDiff = true;
            }
          } else if (this.baselineMaterials[index].chargeMaterialType === 'Solid') {
            if (this.compareSolidMaterial(index) === true) {
              isDiff = true;
            }
          } else if (this.baselineMaterials[index].chargeMaterialType === 'Gas') {
            if (this.compareGasMaterial(index) === true) {
              isDiff = true;
            }
          }
        } else {
          isDiff = true;
        }
      }
    }
    return isDiff;
  }

  compareMaterialType(index: number) {
    return this.compare(this.baselineMaterials[index].chargeMaterialType, this.modifiedMaterials[index].chargeMaterialType);
  }

  //liquid
  compareLiquidMaterial(index: number) {
    return (
      this.compareLiquidMaterialId(index) ||
      this.compareLiquidThermicReaction(index) ||
      this.compareSpecificHeatLiquid(index) ||
      this.compareVaporizingTemperature(index) ||
      this.vaporizingTemperature(index) ||
      this.compareLiquidLatentHeat(index) ||
      this.compareLiquidSpecificHeatVapor(index) ||
      this.compareLiquidChargeFeedRate(index) ||
      this.compareLiquidInitialTemperature(index) ||
      this.compareLiquidDischargeTemperature(index) ||
      this.compareLiquidPercentVaporized(index) ||
      this.compareLiquidPercentReacted(index) ||
      this.compareLiquidReactionHeat(index) ||
      this.compareLiquidAdditionalHeat(index)
    );
  }
  compareLiquidMaterialId(index: number) {
    return this.compare(this.baselineMaterials[index].liquidChargeMaterial.materialId, this.modifiedMaterials[index].liquidChargeMaterial.materialId);
  }
  compareLiquidThermicReaction(index: number) {
    return this.compare(this.baselineMaterials[index].liquidChargeMaterial.thermicReactionType, this.modifiedMaterials[index].liquidChargeMaterial.thermicReactionType);
  }
  compareSpecificHeatLiquid(index: number) {
    return this.compare(this.baselineMaterials[index].liquidChargeMaterial.specificHeatLiquid, this.modifiedMaterials[index].liquidChargeMaterial.specificHeatLiquid);
  }
  compareVaporizingTemperature(index: number) {
    return this.compare(this.baselineMaterials[index].liquidChargeMaterial.vaporizingTemperature, this.modifiedMaterials[index].liquidChargeMaterial.vaporizingTemperature);
  }
  vaporizingTemperature(index: number) {
    return this.compare(this.baselineMaterials[index].liquidChargeMaterial.latentHeat, this.modifiedMaterials[index].liquidChargeMaterial.latentHeat);
  }
  compareLiquidLatentHeat(index: number) {
    return this.compare(this.baselineMaterials[index].liquidChargeMaterial.specificHeatVapor, this.modifiedMaterials[index].liquidChargeMaterial.specificHeatVapor);
  }
  compareLiquidSpecificHeatVapor(index: number) {
    return this.compare(this.baselineMaterials[index].liquidChargeMaterial.feedRate, this.modifiedMaterials[index].liquidChargeMaterial.feedRate);
  }
  compareLiquidChargeFeedRate(index: number) {
    return this.compare(this.baselineMaterials[index].liquidChargeMaterial.chargeFeedRate, this.modifiedMaterials[index].liquidChargeMaterial.chargeFeedRate);
  }
  compareLiquidInitialTemperature(index: number) {
    return this.compare(this.baselineMaterials[index].liquidChargeMaterial.initialTemperature, this.modifiedMaterials[index].liquidChargeMaterial.initialTemperature);
  }
  compareLiquidDischargeTemperature(index: number) {
    return this.compare(this.baselineMaterials[index].liquidChargeMaterial.dischargeTemperature, this.modifiedMaterials[index].liquidChargeMaterial.dischargeTemperature);
  }
  compareLiquidPercentVaporized(index: number) {
    return this.compare(this.baselineMaterials[index].liquidChargeMaterial.percentVaporized, this.modifiedMaterials[index].liquidChargeMaterial.percentVaporized);
  }
  compareLiquidPercentReacted(index: number) {
    return this.compare(this.baselineMaterials[index].liquidChargeMaterial.percentReacted, this.modifiedMaterials[index].liquidChargeMaterial.percentReacted);
  }
  compareLiquidReactionHeat(index: number) {
    return this.compare(this.baselineMaterials[index].liquidChargeMaterial.reactionHeat, this.modifiedMaterials[index].liquidChargeMaterial.reactionHeat);
  }
  compareLiquidAdditionalHeat(index: number) {
    return this.compare(this.baselineMaterials[index].liquidChargeMaterial.additionalHeat, this.modifiedMaterials[index].liquidChargeMaterial.additionalHeat);
  }


  //solid
  compareSolidMaterial(index: number) {
    return (this.compareSolidMaterialId(index) ||
      this.compareSolidThermicReactionType(index) ||
      this.compareSolidSpecificHeatSolid(index) ||
      this.compareSolidLatentHeat(index) ||
      this.compareSolidSpecificHeatLiquid(index) ||
      this.compareSolidMeltingPoint(index) ||
      this.compareSolidChargeFeedRate(index) ||
      this.compareSolidWaterContentCharged(index) ||
      this.compareSolidWaterContentDischarged(index) ||
      this.compareSolidInitialTemperature(index) ||
      this.compareSolidDischargeTemperature(index) ||
      this.compareSolidWaterVaporDischargeTemperature(index) ||
      this.compareSolidChargeMelted(index) ||
      this.compareSolidChargeReacted(index) ||
      this.compareSolidReactionHeat(index) ||
      this.compareSolidAdditionalHeat(index)
    );
  }
  compareSolidMaterialId(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.materialId, this.modifiedMaterials[index].solidChargeMaterial.materialId);
  }
  compareSolidThermicReactionType(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.thermicReactionType, this.modifiedMaterials[index].solidChargeMaterial.thermicReactionType);
  }
  compareSolidSpecificHeatSolid(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.specificHeatSolid, this.modifiedMaterials[index].solidChargeMaterial.specificHeatSolid);
  }
  compareSolidLatentHeat(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.latentHeat, this.modifiedMaterials[index].solidChargeMaterial.latentHeat);
  }
  compareSolidSpecificHeatLiquid(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.specificHeatLiquid, this.modifiedMaterials[index].solidChargeMaterial.specificHeatLiquid);
  }
  compareSolidMeltingPoint(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.meltingPoint, this.modifiedMaterials[index].solidChargeMaterial.meltingPoint);
  }
  compareSolidChargeFeedRate(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.chargeFeedRate, this.modifiedMaterials[index].solidChargeMaterial.chargeFeedRate);
  }
  compareSolidWaterContentCharged(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.waterContentCharged, this.modifiedMaterials[index].solidChargeMaterial.waterContentCharged);
  }
  compareSolidWaterContentDischarged(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.waterContentDischarged, this.modifiedMaterials[index].solidChargeMaterial.waterContentDischarged);
  }
  compareSolidInitialTemperature(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.initialTemperature, this.modifiedMaterials[index].solidChargeMaterial.initialTemperature);
  }
  compareSolidDischargeTemperature(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.dischargeTemperature, this.modifiedMaterials[index].solidChargeMaterial.dischargeTemperature);
  }
  compareSolidWaterVaporDischargeTemperature(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.waterVaporDischargeTemperature, this.modifiedMaterials[index].solidChargeMaterial.waterVaporDischargeTemperature);
  }
  compareSolidChargeMelted(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.chargeMelted, this.modifiedMaterials[index].solidChargeMaterial.chargeMelted);
  }
  compareSolidChargeReacted(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.chargeReacted, this.modifiedMaterials[index].solidChargeMaterial.chargeReacted);
  }
  compareSolidReactionHeat(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.reactionHeat, this.modifiedMaterials[index].solidChargeMaterial.reactionHeat);
  }
  compareSolidAdditionalHeat(index: number) {
    return this.compare(this.baselineMaterials[index].solidChargeMaterial.additionalHeat, this.modifiedMaterials[index].solidChargeMaterial.additionalHeat);
  }
  //gas
  compareGasMaterial(index: number) {
    return (this.compareGasMaterialId(index) ||
      this.compareGasThermicReactionType(index) ||
      this.compareGasSpecificHeatGas(index) ||
      this.compareGasFeedRate(index) ||
      this.compareGasPercentVapor(index) ||
      this.compareGasInitialTemperature(index) ||
      this.compareGasDischargeTemperature(index) ||
      this.compareGasSpecificHeatVapor(index) ||
      this.compareGasPercentReacted(index) ||
      this.compareGasReactionHeat(index) ||
      this.compareGasAdditionalHeat(index));
  }
  compareGasMaterialId(index: number) {
    return this.compare(this.baselineMaterials[index].gasChargeMaterial.materialId, this.modifiedMaterials[index].gasChargeMaterial.materialId);
  }
  compareGasThermicReactionType(index: number) {
    return this.compare(this.baselineMaterials[index].gasChargeMaterial.thermicReactionType, this.modifiedMaterials[index].gasChargeMaterial.thermicReactionType);
  }
  compareGasSpecificHeatGas(index: number) {
    return this.compare(this.baselineMaterials[index].gasChargeMaterial.specificHeatGas, this.modifiedMaterials[index].gasChargeMaterial.specificHeatGas);
  }
  compareGasFeedRate(index: number) {
    return this.compare(this.baselineMaterials[index].gasChargeMaterial.feedRate, this.modifiedMaterials[index].gasChargeMaterial.feedRate);
  }
  compareGasPercentVapor(index: number) {
    return this.compare(this.baselineMaterials[index].gasChargeMaterial.percentVapor, this.modifiedMaterials[index].gasChargeMaterial.percentVapor);
  }
  compareGasInitialTemperature(index: number) {
    return this.compare(this.baselineMaterials[index].gasChargeMaterial.initialTemperature, this.modifiedMaterials[index].gasChargeMaterial.initialTemperature);
  }
  compareGasDischargeTemperature(index: number) {
    return this.compare(this.baselineMaterials[index].gasChargeMaterial.dischargeTemperature, this.modifiedMaterials[index].gasChargeMaterial.dischargeTemperature);
  }
  compareGasSpecificHeatVapor(index: number) {
    return this.compare(this.baselineMaterials[index].gasChargeMaterial.specificHeatVapor, this.modifiedMaterials[index].gasChargeMaterial.specificHeatVapor);
  }
  compareGasPercentReacted(index: number) {
    return this.compare(this.baselineMaterials[index].gasChargeMaterial.percentReacted, this.modifiedMaterials[index].gasChargeMaterial.percentReacted);
  }
  compareGasReactionHeat(index: number) {
    return this.compare(this.baselineMaterials[index].gasChargeMaterial.reactionHeat, this.modifiedMaterials[index].gasChargeMaterial.reactionHeat);
  }
  compareGasAdditionalHeat(index: number) {
    return this.compare(this.baselineMaterials[index].gasChargeMaterial.additionalHeat, this.modifiedMaterials[index].gasChargeMaterial.additionalHeat);
  }


  compareBaselineModification(baseline: PHAST, modification: PHAST) {
    let isDiff = false;
    if (baseline && modification) {
      if (baseline.losses.chargeMaterials) {
        let index = 0;
        baseline.losses.chargeMaterials.forEach(loss => {
          if (this.compareBaseModLoss(loss, modification.losses.chargeMaterials[index]) === true) {
            isDiff = true;
          }
          index++;
        });
      }
    }
    return isDiff;
  }


  compareBaseModLoss(baseline: ChargeMaterial, modification: ChargeMaterial) {
    let isDiff: boolean = false;
    if (this.compare(baseline.chargeMaterialType, modification.chargeMaterialType)) {
      isDiff = true;
    } else {
      if (baseline.chargeMaterialType === 'Gas') {
        if (
          this.compare(baseline.gasChargeMaterial.materialId, modification.gasChargeMaterial.materialId) ||
          this.compare(baseline.gasChargeMaterial.thermicReactionType, modification.gasChargeMaterial.thermicReactionType) ||
          this.compare(baseline.gasChargeMaterial.specificHeatGas, modification.gasChargeMaterial.specificHeatGas) ||
          this.compare(baseline.gasChargeMaterial.feedRate, modification.gasChargeMaterial.feedRate) ||
          this.compare(baseline.gasChargeMaterial.chargeFeedRate, modification.gasChargeMaterial.chargeFeedRate) ||
          this.compare(baseline.gasChargeMaterial.percentVapor, modification.gasChargeMaterial.percentVapor) ||
          this.compare(baseline.gasChargeMaterial.initialTemperature, modification.gasChargeMaterial.initialTemperature) ||
          this.compare(baseline.gasChargeMaterial.dischargeTemperature, modification.gasChargeMaterial.dischargeTemperature) ||
          this.compare(baseline.gasChargeMaterial.specificHeatVapor, modification.gasChargeMaterial.specificHeatVapor) ||
          this.compare(baseline.gasChargeMaterial.percentReacted, modification.gasChargeMaterial.percentReacted) ||
          this.compare(baseline.gasChargeMaterial.reactionHeat, modification.gasChargeMaterial.reactionHeat) ||
          this.compare(baseline.gasChargeMaterial.additionalHeat, modification.gasChargeMaterial.additionalHeat)
        ) {
          isDiff = true;
        }
      } else if (baseline.chargeMaterialType === 'Liquid') {
        if (
          this.compare(baseline.liquidChargeMaterial.materialId, modification.liquidChargeMaterial.materialId) ||
          this.compare(baseline.liquidChargeMaterial.thermicReactionType, modification.liquidChargeMaterial.thermicReactionType) ||
          this.compare(baseline.liquidChargeMaterial.vaporizingTemperature, modification.liquidChargeMaterial.vaporizingTemperature) ||
          this.compare(baseline.liquidChargeMaterial.latentHeat, modification.liquidChargeMaterial.latentHeat) ||
          this.compare(baseline.liquidChargeMaterial.specificHeatVapor, modification.liquidChargeMaterial.specificHeatVapor) ||
          this.compare(baseline.liquidChargeMaterial.feedRate, modification.liquidChargeMaterial.feedRate) ||
          this.compare(baseline.liquidChargeMaterial.chargeFeedRate, modification.liquidChargeMaterial.chargeFeedRate) ||
          this.compare(baseline.liquidChargeMaterial.initialTemperature, modification.liquidChargeMaterial.initialTemperature) ||
          this.compare(baseline.liquidChargeMaterial.dischargeTemperature, modification.liquidChargeMaterial.dischargeTemperature) ||
          this.compare(baseline.liquidChargeMaterial.percentVaporized, modification.liquidChargeMaterial.percentVaporized) ||
          this.compare(baseline.liquidChargeMaterial.percentReacted, modification.liquidChargeMaterial.percentReacted) ||
          this.compare(baseline.liquidChargeMaterial.reactionHeat, modification.liquidChargeMaterial.reactionHeat) ||
          this.compare(baseline.liquidChargeMaterial.additionalHeat, modification.liquidChargeMaterial.additionalHeat) ||
          this.compare(baseline.liquidChargeMaterial.specificHeatLiquid, modification.liquidChargeMaterial.specificHeatLiquid)
        ) {
          isDiff = true;
        }
      } else if (baseline.chargeMaterialType === 'Solid') {
        if (this.compare(baseline.solidChargeMaterial.materialId, modification.solidChargeMaterial.materialId) ||
          this.compare(baseline.solidChargeMaterial.thermicReactionType, modification.solidChargeMaterial.thermicReactionType) ||
          this.compare(baseline.solidChargeMaterial.specificHeatSolid, modification.solidChargeMaterial.specificHeatSolid) ||
          this.compare(baseline.solidChargeMaterial.specificHeatLiquid, modification.solidChargeMaterial.specificHeatLiquid) ||
          this.compare(baseline.solidChargeMaterial.feedRate, modification.solidChargeMaterial.feedRate) ||
          this.compare(baseline.solidChargeMaterial.chargeFeedRate, modification.solidChargeMaterial.chargeFeedRate) ||
          this.compare(baseline.solidChargeMaterial.waterContentCharged, modification.solidChargeMaterial.waterContentCharged) ||
          this.compare(baseline.solidChargeMaterial.waterContentDischarged, modification.solidChargeMaterial.waterContentDischarged) ||
          this.compare(baseline.solidChargeMaterial.initialTemperature, modification.solidChargeMaterial.initialTemperature) ||
          this.compare(baseline.solidChargeMaterial.dischargeTemperature, modification.solidChargeMaterial.dischargeTemperature) ||
          this.compare(baseline.solidChargeMaterial.waterVaporDischargeTemperature, modification.solidChargeMaterial.waterVaporDischargeTemperature) ||
          this.compare(baseline.solidChargeMaterial.chargeMelted, modification.solidChargeMaterial.chargeMelted) ||
          this.compare(baseline.solidChargeMaterial.chargeReacted, modification.solidChargeMaterial.chargeReacted) ||
          this.compare(baseline.solidChargeMaterial.reactionHeat, modification.solidChargeMaterial.reactionHeat) ||
          this.compare(baseline.solidChargeMaterial.additionalHeat, modification.solidChargeMaterial.additionalHeat) ||
          this.compare(baseline.solidChargeMaterial.latentHeat, modification.solidChargeMaterial.latentHeat) ||
          this.compare(baseline.solidChargeMaterial.meltingPoint, modification.solidChargeMaterial.meltingPoint)
        ) {
          isDiff = true;
        }
      }
    }
    return isDiff;
  }
  compare(a: any, b: any) {
    if (a && b) {
      if (a !== b) {
        return true;
      } else {
        return false;
      }
    }
    else if ((a && !b) || (!a && b)) {
      return true;
    } else {
      return false;
    }
  }
}

