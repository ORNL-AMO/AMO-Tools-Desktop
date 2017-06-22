import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChargeMaterial } from '../../../shared/models/losses/chargeMaterial';

@Injectable()
export class ChargeMaterialCompareService {

  baselineMaterials: ChargeMaterial[];
  modifiedMaterials: ChargeMaterial[];

  differentArray: Array<any>;
  constructor() { }

  initCompareObjects() {
    this.differentArray = new Array();
    if (this.baselineMaterials && this.modifiedMaterials) {
      if (this.baselineMaterials.length == this.modifiedMaterials.length) {
        let numLosses = this.baselineMaterials.length;
        for (let i = 0; i < numLosses; i++) {
          this.differentArray.push({
            lossIndex: i,
            different: this.initDifferentObject()
          })
        }
        this.checkChargeMaterials();
      } else {
        //NO IDEA WHAT TO DO IN THIS CASE
      }
    }
  }

  initDifferentObject(): ChargeMaterialDifferent {
    let tmpLiquidMaterialDiff: LiquidChargeMaterialDifferent = {
      materialId: new BehaviorSubject<boolean>(null),
      thermicReactionType: new BehaviorSubject<boolean>(null),
      specificHeatLiquid: new BehaviorSubject<boolean>(null),
      vaporizingTemperature: new BehaviorSubject<boolean>(null),
      latentHeat: new BehaviorSubject<boolean>(null),
      specificHeatVapor: new BehaviorSubject<boolean>(null),
      chargeFeedRate: new BehaviorSubject<boolean>(null),
      initialTemperature: new BehaviorSubject<boolean>(null),
      dischargeTemperature: new BehaviorSubject<boolean>(null),
      percentVaporized: new BehaviorSubject<boolean>(null),
      percentReacted: new BehaviorSubject<boolean>(null),
      reactionHeat: new BehaviorSubject<boolean>(null),
      additionalHeat: new BehaviorSubject<boolean>(null),
    }

    let tmpGasMaterialDiff: GasChargeMaterialDifferent = {
      materialId: new BehaviorSubject<boolean>(null),
      thermicReactionType: new BehaviorSubject<boolean>(null),
      specificHeatGas: new BehaviorSubject<boolean>(null),
      feedRate: new BehaviorSubject<boolean>(null),
      percentVapor: new BehaviorSubject<boolean>(null),
      initialTemperature: new BehaviorSubject<boolean>(null),
      dischargeTemperature: new BehaviorSubject<boolean>(null),
      specificHeatVapor: new BehaviorSubject<boolean>(null),
      percentReacted: new BehaviorSubject<boolean>(null),
      reactionHeat: new BehaviorSubject<boolean>(null),
      additionalHeat: new BehaviorSubject<boolean>(null),
    }
    let tmpSolidMaterialDiff: SolidChargeMaterialDifferent = {
      materialId: new BehaviorSubject<boolean>(null),
      thermicReactionType: new BehaviorSubject<boolean>(null),
      specificHeatSolid: new BehaviorSubject<boolean>(null),
      latentHeat: new BehaviorSubject<boolean>(null),
      specificHeatLiquid: new BehaviorSubject<boolean>(null),
      meltingPoint: new BehaviorSubject<boolean>(null),
      chargeFeedRate: new BehaviorSubject<boolean>(null),
      waterContentCharged: new BehaviorSubject<boolean>(null),
      waterContentDischarged: new BehaviorSubject<boolean>(null),
      initialTemperature: new BehaviorSubject<boolean>(null),
      dischargeTemperature: new BehaviorSubject<boolean>(null),
      waterVaporDischargeTemperature: new BehaviorSubject<boolean>(null),
      chargeMelted: new BehaviorSubject<boolean>(null),
      chargeReacted: new BehaviorSubject<boolean>(null),
      reactionHeat: new BehaviorSubject<boolean>(null),
      additionalHeat: new BehaviorSubject<boolean>(null),
    }
    let tmpMaterialDiff: ChargeMaterialDifferent = {
      chargeMaterialType: new BehaviorSubject<boolean>(null),
      liquidChargeMaterialDifferent: tmpLiquidMaterialDiff,
      solidChargeMaterialDifferent: tmpSolidMaterialDiff,
      gasChargeMaterialDifferent: tmpGasMaterialDiff
    }
    return tmpMaterialDiff;
  }

  checkChargeMaterials() {
    this.checkChargeMaterialType();
    this.checkLiquidMaterials();
    this.checkGasMaterials();
    this.checkSolidChargeMaterials();
  }

  checkLiquidMaterials() {
    this.checkMaterialIdLiquid();
    this.checkThermicReactionTypeLiquid();
    this.checkSpecificHeatLiquid();
    this.checkVaporizingTemperatureLiquid();
    this.checkLatentHeatLiquid();
    this.checkSpecificHeatVaporLiquid();
    this.checkChargeFeedRateLiquid();
    this.checkInitialTemperatureLiquid();
    this.checkDischargeTemperatureLiquid();
    this.checkPercentReactedLiquid();
    this.checkPercentVaporizedLiquid();
    this.checkReactionHeatLiquid();
    this.checkAdditionalHeatLiquid();
  }

  checkGasMaterials() {
    this.checkMaterialIdGas();
    this.checkThermicReactionTypeGas();
    this.checkSpecificHeatGas();
    this.checkFeedRateGas();
    this.checkPercentVapor();
    this.checkInitialTemperatureGas();
    this.checkDischargeTemperatureGas();
    this.checkSpecificHeatVaporGas();
    this.checkPercentReactedGas();
    this.checkReactionHeatGas();
    this.checkAdditionalHeatGas();
  }

  checkSolidChargeMaterials() {
    this.checkMaterialIdSolid();
    this.checkThermicReactionTypeSolid();
    this.checkSpecificHeatSolid();
    this.checkLatentHeatSolid();
    this.checkSpecificHeatLiquidSolid();
    this.checkMeltingPointSolid();
    this.checkChargeFeedRateSolid();
    this.checkWaterContentChargeSolid();
    this.checkWaterContentDischargedSolid();
    this.checkInitialTemperatureSolid();
    this.checkDischargeTemperatureSolid();
    this.checkWaterVaporDischargeTemperatureSolid();
    this.checkChargeMeltedSolid();
    this.checkChargeReactedSolid();
    this.checkReactionHeatSolid();
    this.checkAdditionalHeatSolid();
  }

  //chargeMaterialType
  checkChargeMaterialType() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType != this.modifiedMaterials[lossIndex].chargeMaterialType) {
          this.differentArray[lossIndex].different.chargeMaterialType.next(true);
        } else {
          this.differentArray[lossIndex].different.chargeMaterialType.next(false);
        }
      }
    }
  }

  //Solid
  //materialId
  checkMaterialIdSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.materialId != this.modifiedMaterials[lossIndex].solidChargeMaterial.materialId) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.materialId.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.materialId.next(false);
          }
        }
      }
    }
  }
  //thermicReactionType
  checkThermicReactionTypeSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.thermicReactionType != this.modifiedMaterials[lossIndex].solidChargeMaterial.thermicReactionType) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.thermicReactionType.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.thermicReactionType.next(false);
          }
        }
      }
    }
  }
  //specificHeatSolid
  checkSpecificHeatSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.specificHeatSolid != this.modifiedMaterials[lossIndex].solidChargeMaterial.specificHeatSolid) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.specificHeatSolid.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.specificHeatSolid.next(false);
          }
        }
      }
    }
  }
  //latentHeat
  checkLatentHeatSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.latentHeat != this.modifiedMaterials[lossIndex].solidChargeMaterial.latentHeat) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.latentHeat.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.latentHeat.next(false);
          }
        }
      }
    }
  }
  //specificHeatLiquid
  checkSpecificHeatLiquidSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.specificHeatLiquid != this.modifiedMaterials[lossIndex].solidChargeMaterial.specificHeatLiquid) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.specificHeatLiquid.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.specificHeatLiquid.next(false);
          }
        }
      }
    }
  }
  //meltingPoint
  checkMeltingPointSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.meltingPoint != this.modifiedMaterials[lossIndex].solidChargeMaterial.meltingPoint) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.meltingPoint.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.meltingPoint.next(false);
          }
        }
      }
    }
  }
  //chargeFeedRate
  checkChargeFeedRateSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.chargeFeedRate != this.modifiedMaterials[lossIndex].solidChargeMaterial.chargeFeedRate) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.chargeFeedRate.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.chargeFeedRate.next(false);
          }
        }
      }
    }
  }
  //waterContentCharged
  checkWaterContentChargeSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.waterContentCharged != this.modifiedMaterials[lossIndex].solidChargeMaterial.waterContentCharged) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.waterContentCharged.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.waterContentCharged.next(false);
          }
        }
      }
    }
  }
  //waterContentDischarged
  checkWaterContentDischargedSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.waterContentDischarged != this.modifiedMaterials[lossIndex].solidChargeMaterial.waterContentDischarged) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.waterContentDischarged.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.waterContentDischarged.next(false);
          }
        }
      }
    }
  }
  //initialTemperature
  checkInitialTemperatureSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.initialTemperature != this.modifiedMaterials[lossIndex].solidChargeMaterial.initialTemperature) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.initialTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.initialTemperature.next(false);
          }
        }
      }
    }
  }
  //dischargeTemperature
  checkDischargeTemperatureSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.dischargeTemperature != this.modifiedMaterials[lossIndex].solidChargeMaterial.dischargeTemperature) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.dischargeTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.dischargeTemperature.next(false);
          }
        }
      }
    }
  }
  //waterVaporDischargeTemperature
  checkWaterVaporDischargeTemperatureSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.waterVaporDischargeTemperature != this.modifiedMaterials[lossIndex].solidChargeMaterial.waterVaporDischargeTemperature) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.waterVaporDischargeTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.waterVaporDischargeTemperature.next(false);
          }
        }
      }
    }
  }
  //chargeMelted
  checkChargeMeltedSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.chargeMelted != this.modifiedMaterials[lossIndex].solidChargeMaterial.chargeMelted) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.chargeMelted.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.chargeMelted.next(false);
          }
        }
      }
    }
  }
  //chargeReacted
  checkChargeReactedSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.chargeReacted != this.modifiedMaterials[lossIndex].solidChargeMaterial.chargeReacted) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.chargeReacted.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.chargeReacted.next(false);
          }
        }
      }
    }
  }
  //reactionHeat
  checkReactionHeatSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.reactionHeat != this.modifiedMaterials[lossIndex].solidChargeMaterial.reactionHeat) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.reactionHeat.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.reactionHeat.next(false);
          }
        }
      }
    }
  }
  //additionalHeat
  checkAdditionalHeatSolid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
          if (this.baselineMaterials[lossIndex].solidChargeMaterial.additionalHeat != this.modifiedMaterials[lossIndex].solidChargeMaterial.additionalHeat) {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.additionalHeat.next(true);
          } else {
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.additionalHeat.next(false);
          }
        }
      }
    }
  }

  //Gas
  //materialId
  checkMaterialIdGas() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Gas' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Gas') {
          if (this.baselineMaterials[lossIndex].gasChargeMaterial.materialId != this.modifiedMaterials[lossIndex].gasChargeMaterial.materialId) {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.materialId.next(true);
          } else {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.materialId.next(false);
          }
        }
      }
    }
  }
  //thermicReactionType
  checkThermicReactionTypeGas() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Gas' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Gas') {
          if (this.baselineMaterials[lossIndex].gasChargeMaterial.thermicReactionType != this.modifiedMaterials[lossIndex].gasChargeMaterial.thermicReactionType) {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.thermicReactionType.next(true);
          } else {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.thermicReactionType.next(false);
          }
        }
      }
    }
  }
  //specificHeatGas
  checkSpecificHeatGas() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Gas' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Gas') {
          if (this.baselineMaterials[lossIndex].gasChargeMaterial.specificHeatGas != this.modifiedMaterials[lossIndex].gasChargeMaterial.specificHeatGas) {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.specificHeatGas.next(true);
          } else {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.specificHeatGas.next(false);
          }
        }
      }
    }
  }
  //feedRate
  checkFeedRateGas() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Gas' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Gas') {
          if (this.baselineMaterials[lossIndex].gasChargeMaterial.feedRate != this.modifiedMaterials[lossIndex].gasChargeMaterial.feedRate) {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.feedRate.next(true);
          } else {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.feedRate.next(false);
          }
        }
      }
    }
  }
  //percentVapor
  checkPercentVapor() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Gas' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Gas') {
          if (this.baselineMaterials[lossIndex].gasChargeMaterial.percentVapor != this.modifiedMaterials[lossIndex].gasChargeMaterial.percentVapor) {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.percentVapor.next(true);
          } else {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.percentVapor.next(false);
          }
        }
      }
    }
  }
  //initialTemperature
  checkInitialTemperatureGas() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Gas' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Gas') {
          if (this.baselineMaterials[lossIndex].gasChargeMaterial.initialTemperature != this.modifiedMaterials[lossIndex].gasChargeMaterial.initialTemperature) {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.initialTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.initialTemperature.next(false);
          }
        }
      }
    }
  }
  //dischargeTemperature
  checkDischargeTemperatureGas() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Gas' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Gas') {
          if (this.baselineMaterials[lossIndex].gasChargeMaterial.dischargeTemperature != this.modifiedMaterials[lossIndex].gasChargeMaterial.dischargeTemperature) {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.dischargeTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.dischargeTemperature.next(false);
          }
        }
      }
    }
  }
  //specificHeatVapor
  checkSpecificHeatVaporGas() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Gas' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Gas') {
          if (this.baselineMaterials[lossIndex].gasChargeMaterial.specificHeatVapor != this.modifiedMaterials[lossIndex].gasChargeMaterial.specificHeatVapor) {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.specificHeatVapor.next(true);
          } else {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.specificHeatVapor.next(false);
          }
        }
      }
    }
  }
  //percentReacted
  checkPercentReactedGas() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Gas' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Gas') {
          if (this.baselineMaterials[lossIndex].gasChargeMaterial.percentReacted != this.modifiedMaterials[lossIndex].gasChargeMaterial.percentReacted) {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.percentReacted.next(true);
          } else {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.percentReacted.next(false);
          }
        }
      }
    }
  }
  //reactionHeat
  checkReactionHeatGas() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Gas' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Gas') {
          if (this.baselineMaterials[lossIndex].gasChargeMaterial.reactionHeat != this.modifiedMaterials[lossIndex].gasChargeMaterial.reactionHeat) {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.reactionHeat.next(true);
          } else {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.reactionHeat.next(false);
          }
        }
      }
    }
  }
  //additionalHeat
  checkAdditionalHeatGas() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Gas' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Gas') {
          if (this.baselineMaterials[lossIndex].gasChargeMaterial.additionalHeat != this.modifiedMaterials[lossIndex].gasChargeMaterial.additionalHeat) {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.additionalHeat.next(true);
          } else {
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.additionalHeat.next(false);
          }
        }
      }
    }
  }


  //Liquid
  //materialId
  checkMaterialIdLiquid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {

        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Liquid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Liquid') {
          if (this.baselineMaterials[lossIndex].liquidChargeMaterial.materialId != this.modifiedMaterials[lossIndex].liquidChargeMaterial.materialId) {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.materialId.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.materialId.next(false);
          }
        }
      }
    }
  }
  //thermicReactionType
  checkThermicReactionTypeLiquid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Liquid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Liquid') {
          if (this.baselineMaterials[lossIndex].liquidChargeMaterial.thermicReactionType != this.modifiedMaterials[lossIndex].liquidChargeMaterial.thermicReactionType) {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.thermicReactionType.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.thermicReactionType.next(false);
          }
        }
      }
    }
  }
  //specificHeatLiquid
  checkSpecificHeatLiquid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Liquid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Liquid') {
          if (this.baselineMaterials[lossIndex].liquidChargeMaterial.specificHeatLiquid != this.modifiedMaterials[lossIndex].liquidChargeMaterial.specificHeatLiquid) {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.specificHeatLiquid.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.specificHeatLiquid.next(false);
          }
        }
      }
    }
  }
  //vaporizingTemperature
  checkVaporizingTemperatureLiquid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Liquid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Liquid') {
          if (this.baselineMaterials[lossIndex].liquidChargeMaterial.vaporizingTemperature != this.modifiedMaterials[lossIndex].liquidChargeMaterial.vaporizingTemperature) {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.vaporizingTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.vaporizingTemperature.next(false);
          }
        }
      }
    }
  }
  //latentHeat
  checkLatentHeatLiquid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Liquid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Liquid') {
          if (this.baselineMaterials[lossIndex].liquidChargeMaterial.latentHeat != this.modifiedMaterials[lossIndex].liquidChargeMaterial.latentHeat) {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.latentHeat.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.latentHeat.next(false);
          }
        }
      }
    }
  }
  //specificHeatVapor
  checkSpecificHeatVaporLiquid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Liquid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Liquid') {
          if (this.baselineMaterials[lossIndex].liquidChargeMaterial.specificHeatVapor != this.modifiedMaterials[lossIndex].liquidChargeMaterial.specificHeatVapor) {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.specificHeatVapor.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.specificHeatVapor.next(false);
          }
        }
      }
    }
  }
  //chargeFeedRate
  checkChargeFeedRateLiquid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Liquid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Liquid') {
          if (this.baselineMaterials[lossIndex].liquidChargeMaterial.chargeFeedRate != this.modifiedMaterials[lossIndex].liquidChargeMaterial.chargeFeedRate) {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.chargeFeedRate.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.chargeFeedRate.next(false);
          }
        }
      }
    }
  }
  //initialTemperature
  checkInitialTemperatureLiquid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Liquid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Liquid') {
          if (this.baselineMaterials[lossIndex].liquidChargeMaterial.initialTemperature != this.modifiedMaterials[lossIndex].liquidChargeMaterial.initialTemperature) {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.initialTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.initialTemperature.next(false);
          }
        }
      }
    }
  }
  //dischargeTemperature
  checkDischargeTemperatureLiquid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Liquid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Liquid') {
          if (this.baselineMaterials[lossIndex].liquidChargeMaterial.dischargeTemperature != this.modifiedMaterials[lossIndex].liquidChargeMaterial.dischargeTemperature) {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.dischargeTemperature.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.dischargeTemperature.next(false);
          }
        }
      }
    }
  }
  //percentVaporized
  checkPercentVaporizedLiquid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Liquid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Liquid') {
          if (this.baselineMaterials[lossIndex].liquidChargeMaterial.percentVaporized != this.modifiedMaterials[lossIndex].liquidChargeMaterial.percentVaporized) {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.percentVaporized.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.percentVaporized.next(false);
          }
        }
      }
    }
  }
  //percentReacted
  checkPercentReactedLiquid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Liquid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Liquid') {
          if (this.baselineMaterials[lossIndex].liquidChargeMaterial.percentReacted != this.modifiedMaterials[lossIndex].liquidChargeMaterial.percentReacted) {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.percentReacted.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.percentReacted.next(false);
          }
        }
      }
    }
  }
  //reactionHeat
  checkReactionHeatLiquid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Liquid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Liquid') {
          if (this.baselineMaterials[lossIndex].liquidChargeMaterial.reactionHeat != this.modifiedMaterials[lossIndex].liquidChargeMaterial.reactionHeat) {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.reactionHeat.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.reactionHeat.next(false);
          }
        }
      }
    }
  }
  //additionalHeat
  checkAdditionalHeatLiquid() {
    if (this.baselineMaterials && this.modifiedMaterials) {
      for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
        if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Liquid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Liquid') {
          if (this.baselineMaterials[lossIndex].liquidChargeMaterial.additionalHeat != this.modifiedMaterials[lossIndex].liquidChargeMaterial.additionalHeat) {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.additionalHeat.next(true);
          } else {
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.additionalHeat.next(false);
          }
        }
      }
    }
  }


}

export interface ChargeMaterialDifferent {
  chargeMaterialType: BehaviorSubject<boolean>;
  liquidChargeMaterialDifferent: LiquidChargeMaterialDifferent
  solidChargeMaterialDifferent: SolidChargeMaterialDifferent
  gasChargeMaterialDifferent: GasChargeMaterialDifferent
}

export interface LiquidChargeMaterialDifferent {
  materialId: BehaviorSubject<boolean>,
  thermicReactionType: BehaviorSubject<boolean>,
  specificHeatLiquid: BehaviorSubject<boolean>,
  vaporizingTemperature: BehaviorSubject<boolean>,
  latentHeat: BehaviorSubject<boolean>,
  specificHeatVapor: BehaviorSubject<boolean>,
  chargeFeedRate: BehaviorSubject<boolean>,
  initialTemperature: BehaviorSubject<boolean>,
  dischargeTemperature: BehaviorSubject<boolean>,
  percentVaporized: BehaviorSubject<boolean>,
  percentReacted: BehaviorSubject<boolean>,
  reactionHeat: BehaviorSubject<boolean>,
  additionalHeat: BehaviorSubject<boolean>,
}

export interface SolidChargeMaterialDifferent {
  materialId: BehaviorSubject<boolean>,
  thermicReactionType: BehaviorSubject<boolean>,
  specificHeatSolid: BehaviorSubject<boolean>,
  latentHeat: BehaviorSubject<boolean>,
  specificHeatLiquid: BehaviorSubject<boolean>,
  meltingPoint: BehaviorSubject<boolean>,
  chargeFeedRate: BehaviorSubject<boolean>,
  waterContentCharged: BehaviorSubject<boolean>,
  waterContentDischarged: BehaviorSubject<boolean>,
  initialTemperature: BehaviorSubject<boolean>,
  dischargeTemperature: BehaviorSubject<boolean>,
  waterVaporDischargeTemperature: BehaviorSubject<boolean>,
  chargeMelted: BehaviorSubject<boolean>,
  chargeReacted: BehaviorSubject<boolean>,
  reactionHeat: BehaviorSubject<boolean>,
  additionalHeat: BehaviorSubject<boolean>,
}

export interface GasChargeMaterialDifferent {
  materialId: BehaviorSubject<boolean>,
  thermicReactionType: BehaviorSubject<boolean>,
  specificHeatGas: BehaviorSubject<boolean>,
  feedRate: BehaviorSubject<boolean>,
  percentVapor: BehaviorSubject<boolean>,
  initialTemperature: BehaviorSubject<boolean>,
  dischargeTemperature: BehaviorSubject<boolean>,
  specificHeatVapor: BehaviorSubject<boolean>,
  percentReacted: BehaviorSubject<boolean>,
  reactionHeat: BehaviorSubject<boolean>,
  additionalHeat: BehaviorSubject<boolean>,
}


