import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChargeMaterial } from '../../../shared/models/phast/losses/chargeMaterial';

@Injectable()
export class ChargeMaterialCompareService {

  baselineMaterials: ChargeMaterial[];
  modifiedMaterials: ChargeMaterial[];
  inputError: BehaviorSubject<boolean>;
  constructor() {
    this.inputError = new BehaviorSubject<boolean>(false);
  }

  compareAllMaterials() {
    let index = 0;
    let numLoss = this.baselineMaterials.length;
    let isDiff: boolean = false;
    if (this.modifiedMaterials) {
      for (index; index < numLoss; index++) {
        let typeCheck = this.compareMaterialType(index);
        if (typeCheck == false) {
          if (this.baselineMaterials[index].chargeMaterialType == 'Liquid') {
            if (this.compareLiquidMaterial(index) == true) {
              isDiff = true;
            }
          } else if (this.baselineMaterials[index].chargeMaterialType == 'Solid') {
            if (this.compareSolidMaterial(index) == true) {
              isDiff = true;
            }
          } else if (this.baselineMaterials[index].chargeMaterialType == 'Gas') {
            if (this.compareGasMaterial(index) == true) {
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
    )
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
    )
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
      this.compareGasAdditionalHeat(index))
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

  compare(a: any, b: any) {
    if (a && b) {
      if (a != b) {
        return true;
      } else {
        return false;
      }
    }
    else if ((a && !b) || (!a && b)) {
      return true
    } else {
      return false;
    }
  }
}

