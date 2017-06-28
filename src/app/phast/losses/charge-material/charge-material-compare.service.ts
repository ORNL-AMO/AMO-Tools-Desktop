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

  addObject(num: number) {
    this.differentArray.push({
      lossIndex: num,
      different: this.initDifferentObject()
    })
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
    if (this.baselineMaterials && this.modifiedMaterials) {
      if (this.baselineMaterials.length != 0 && this.modifiedMaterials.length != 0 && this.baselineMaterials.length == this.modifiedMaterials.length) {
        for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
          this.differentArray[lossIndex].different.chargeMaterialType.next(this.compare(this.baselineMaterials[lossIndex].chargeMaterialType, this.modifiedMaterials[lossIndex].chargeMaterialType));
          //solid
          if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Solid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Solid') {
            //materialId
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.materialId.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.materialId, this.modifiedMaterials[lossIndex].solidChargeMaterial.materialId));
            //thermicReactionType
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.thermicReactionType.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.thermicReactionType, this.modifiedMaterials[lossIndex].solidChargeMaterial.thermicReactionType));
            //specificHeatSolid
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.specificHeatSolid.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.specificHeatSolid, this.modifiedMaterials[lossIndex].solidChargeMaterial.specificHeatSolid));
            //latentHeat
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.latentHeat.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.latentHeat, this.modifiedMaterials[lossIndex].solidChargeMaterial.latentHeat));
            //specificHeatLiquid
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.specificHeatLiquid.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.specificHeatLiquid, this.modifiedMaterials[lossIndex].solidChargeMaterial.specificHeatLiquid));
            //meltingPoint
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.meltingPoint.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.meltingPoint, this.modifiedMaterials[lossIndex].solidChargeMaterial.meltingPoint));
            //chargeFeedRate
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.chargeFeedRate.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.chargeFeedRate, this.modifiedMaterials[lossIndex].solidChargeMaterial.chargeFeedRate));
            //waterContentCharged
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.waterContentCharged.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.waterContentCharged, this.modifiedMaterials[lossIndex].solidChargeMaterial.waterContentCharged));
            //waterContentDischarged
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.waterContentDischarged.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.waterContentDischarged, this.modifiedMaterials[lossIndex].solidChargeMaterial.waterContentDischarged));
            //initialTemperature
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.initialTemperature.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.initialTemperature, this.modifiedMaterials[lossIndex].solidChargeMaterial.initialTemperature));
            //dischargeTemperature
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.dischargeTemperature.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.dischargeTemperature, this.modifiedMaterials[lossIndex].solidChargeMaterial.dischargeTemperature));
            //waterVaporDischargeTemperature
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.waterVaporDischargeTemperature.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.waterVaporDischargeTemperature, this.modifiedMaterials[lossIndex].solidChargeMaterial.waterVaporDischargeTemperature));
            //chargeMelted
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.chargeMelted.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.chargeMelted, this.modifiedMaterials[lossIndex].solidChargeMaterial.chargeMelted));
            //chargeReacted
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.chargeReacted.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.chargeReacted, this.modifiedMaterials[lossIndex].solidChargeMaterial.chargeReacted));
            //reactionHeat
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.reactionHeat.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.reactionHeat, this.modifiedMaterials[lossIndex].solidChargeMaterial.reactionHeat));
            //additionalHeat
            this.differentArray[lossIndex].different.solidChargeMaterialDifferent.additionalHeat.next(this.compare(this.baselineMaterials[lossIndex].solidChargeMaterial.additionalHeat, this.modifiedMaterials[lossIndex].solidChargeMaterial.additionalHeat));
          }
          //liquid
          else if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Liquid' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Liquid') {
            // materialId
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.materialId.next(this.compare(this.baselineMaterials[lossIndex].liquidChargeMaterial.materialId, this.modifiedMaterials[lossIndex].liquidChargeMaterial.materialId));
            // thermicReactionType
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.thermicReactionType.next(this.compare(this.baselineMaterials[lossIndex].liquidChargeMaterial.thermicReactionType, this.modifiedMaterials[lossIndex].liquidChargeMaterial.thermicReactionType));
            // specificHeatLiquid
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.specificHeatLiquid.next(this.compare(this.baselineMaterials[lossIndex].liquidChargeMaterial.specificHeatLiquid, this.modifiedMaterials[lossIndex].liquidChargeMaterial.specificHeatLiquid));
            // vaporizingTemperature
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.vaporizingTemperature.next(this.compare(this.baselineMaterials[lossIndex].liquidChargeMaterial.vaporizingTemperature, this.modifiedMaterials[lossIndex].liquidChargeMaterial.vaporizingTemperature));
            // latentHeat
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.latentHeat.next(this.compare(this.baselineMaterials[lossIndex].liquidChargeMaterial.latentHeat, this.modifiedMaterials[lossIndex].liquidChargeMaterial.latentHeat));
            // specificHeatVapor
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.specificHeatVapor.next(this.compare(this.baselineMaterials[lossIndex].liquidChargeMaterial.specificHeatVapor, this.modifiedMaterials[lossIndex].liquidChargeMaterial.specificHeatVapor));
            // chargeFeedRate
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.chargeFeedRate.next(this.compare(this.baselineMaterials[lossIndex].liquidChargeMaterial.chargeFeedRate, this.modifiedMaterials[lossIndex].liquidChargeMaterial.chargeFeedRate));
            // initialTemperature
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.initialTemperature.next(this.compare(this.baselineMaterials[lossIndex].liquidChargeMaterial.initialTemperature, this.modifiedMaterials[lossIndex].liquidChargeMaterial.initialTemperature));
            // dischargeTemperature
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.dischargeTemperature.next(this.compare(this.baselineMaterials[lossIndex].liquidChargeMaterial.dischargeTemperature, this.modifiedMaterials[lossIndex].liquidChargeMaterial.dischargeTemperature));
            // percentVaporized
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.percentVaporized.next(this.compare(this.baselineMaterials[lossIndex].liquidChargeMaterial.percentVaporized, this.modifiedMaterials[lossIndex].liquidChargeMaterial.percentVaporized));
            // percentReacted
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.percentReacted.next(this.compare(this.baselineMaterials[lossIndex].liquidChargeMaterial.percentReacted, this.modifiedMaterials[lossIndex].liquidChargeMaterial.percentReacted));
            // reactionHeat
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.reactionHeat.next(this.compare(this.baselineMaterials[lossIndex].liquidChargeMaterial.reactionHeat, this.modifiedMaterials[lossIndex].liquidChargeMaterial.reactionHeat));
            // additionalHeat
            this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.additionalHeat.next(this.compare(this.baselineMaterials[lossIndex].liquidChargeMaterial.additionalHeat, this.modifiedMaterials[lossIndex].liquidChargeMaterial.additionalHeat));
          }
          //gas
          else if (this.baselineMaterials[lossIndex].chargeMaterialType == 'Gas' && this.modifiedMaterials[lossIndex].chargeMaterialType == 'Gas') {
            // materialId
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.materialId.next(this.compare(this.baselineMaterials[lossIndex].gasChargeMaterial.materialId, this.modifiedMaterials[lossIndex].gasChargeMaterial.materialId));
            // thermicReactionType
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.thermicReactionType.next(this.compare(this.baselineMaterials[lossIndex].gasChargeMaterial.thermicReactionType, this.modifiedMaterials[lossIndex].gasChargeMaterial.thermicReactionType));
            // specificHeatGas
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.specificHeatGas.next(this.compare(this.baselineMaterials[lossIndex].gasChargeMaterial.specificHeatGas, this.modifiedMaterials[lossIndex].gasChargeMaterial.specificHeatGas));
            // feedRate
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.feedRate.next(this.compare(this.baselineMaterials[lossIndex].gasChargeMaterial.feedRate, this.modifiedMaterials[lossIndex].gasChargeMaterial.feedRate));
            // percentVapor
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.percentVapor.next(this.compare(this.baselineMaterials[lossIndex].gasChargeMaterial.percentVapor, this.modifiedMaterials[lossIndex].gasChargeMaterial.percentVapor));
            // initialTemperature
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.initialTemperature.next(this.compare(this.baselineMaterials[lossIndex].gasChargeMaterial.initialTemperature, this.modifiedMaterials[lossIndex].gasChargeMaterial.initialTemperature));
            // dischargeTemperature
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.dischargeTemperature.next(this.compare(this.baselineMaterials[lossIndex].gasChargeMaterial.dischargeTemperature, this.modifiedMaterials[lossIndex].gasChargeMaterial.dischargeTemperature));
            // specificHeatVapor
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.specificHeatVapor.next(this.compare(this.baselineMaterials[lossIndex].gasChargeMaterial.specificHeatVapor, this.modifiedMaterials[lossIndex].gasChargeMaterial.specificHeatVapor));
            // percentReacted
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.percentReacted.next(this.compare(this.baselineMaterials[lossIndex].gasChargeMaterial.percentReacted, this.modifiedMaterials[lossIndex].gasChargeMaterial.percentReacted));
            // reactionHeat
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.reactionHeat.next(this.compare(this.baselineMaterials[lossIndex].gasChargeMaterial.reactionHeat, this.modifiedMaterials[lossIndex].gasChargeMaterial.reactionHeat));
            // additionalHeat
            this.differentArray[lossIndex].different.gasChargeMaterialDifferent.additionalHeat.next(this.compare(this.baselineMaterials[lossIndex].gasChargeMaterial.additionalHeat, this.modifiedMaterials[lossIndex].gasChargeMaterial.additionalHeat));
          }
          else {
            this.disableIndexed(lossIndex);
          }
        }
      } else {
        this.disableAll();
      }
    } else {
      this.disableAll();
    }
  }

  disableIndexed(lossIndex: number) {
    this.differentArray[lossIndex].different.chargeMaterialType.next(false);
    //solid
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.materialId.next(false);
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.thermicReactionType.next(false);
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.specificHeatSolid.next(false);
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.latentHeat.next(false);
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.specificHeatLiquid.next(false);
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.meltingPoint.next(false);
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.chargeFeedRate.next(false);
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.waterContentCharged.next(false);
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.waterContentDischarged.next(false);
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.initialTemperature.next(false);
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.dischargeTemperature.next(false);
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.waterVaporDischargeTemperature.next(false);
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.chargeMelted.next(false);
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.chargeReacted.next(false);
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.reactionHeat.next(false);
    this.differentArray[lossIndex].different.solidChargeMaterialDifferent.additionalHeat.next(false);
    //liquid
    this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.materialId.next(false);
    this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.thermicReactionType.next(false);
    this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.specificHeatLiquid.next(false);
    this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.vaporizingTemperature.next(false);
    this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.latentHeat.next(false);
    this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.specificHeatVapor.next(false);
    this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.chargeFeedRate.next(false);
    this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.initialTemperature.next(false);
    this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.dischargeTemperature.next(false);
    this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.percentVaporized.next(false);
    this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.percentReacted.next(false);
    this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.reactionHeat.next(false);
    this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.additionalHeat.next(false);
    //gas
    this.differentArray[lossIndex].different.gasChargeMaterialDifferent.materialId.next(false);
    this.differentArray[lossIndex].different.gasChargeMaterialDifferent.thermicReactionType.next(false);
    this.differentArray[lossIndex].different.gasChargeMaterialDifferent.specificHeatGas.next(false);
    this.differentArray[lossIndex].different.gasChargeMaterialDifferent.feedRate.next(false);
    this.differentArray[lossIndex].different.gasChargeMaterialDifferent.percentVapor.next(false);
    this.differentArray[lossIndex].different.gasChargeMaterialDifferent.initialTemperature.next(false);
    this.differentArray[lossIndex].different.gasChargeMaterialDifferent.dischargeTemperature.next(false);
    this.differentArray[lossIndex].different.gasChargeMaterialDifferent.specificHeatVapor.next(false);
    this.differentArray[lossIndex].different.gasChargeMaterialDifferent.percentReacted.next(false);
    this.differentArray[lossIndex].different.gasChargeMaterialDifferent.reactionHeat.next(false);
    this.differentArray[lossIndex].different.gasChargeMaterialDifferent.additionalHeat.next(false);
  }

  disableAll() {
    for (let lossIndex = 0; lossIndex < this.baselineMaterials.length; lossIndex++) {
      this.differentArray[lossIndex].different.chargeMaterialType.next(false);
      //solid
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.materialId.next(false);
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.thermicReactionType.next(false);
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.specificHeatSolid.next(false);
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.latentHeat.next(false);
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.specificHeatLiquid.next(false);
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.meltingPoint.next(false);
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.chargeFeedRate.next(false);
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.waterContentCharged.next(false);
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.waterContentDischarged.next(false);
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.initialTemperature.next(false);
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.dischargeTemperature.next(false);
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.waterVaporDischargeTemperature.next(false);
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.chargeMelted.next(false);
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.chargeReacted.next(false);
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.reactionHeat.next(false);
      this.differentArray[lossIndex].different.solidChargeMaterialDifferent.additionalHeat.next(false);
      //liquid
      this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.materialId.next(false);
      this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.thermicReactionType.next(false);
      this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.specificHeatLiquid.next(false);
      this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.vaporizingTemperature.next(false);
      this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.latentHeat.next(false);
      this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.specificHeatVapor.next(false);
      this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.chargeFeedRate.next(false);
      this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.initialTemperature.next(false);
      this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.dischargeTemperature.next(false);
      this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.percentVaporized.next(false);
      this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.percentReacted.next(false);
      this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.reactionHeat.next(false);
      this.differentArray[lossIndex].different.liquidChargeMaterialDifferent.additionalHeat.next(false);
      //gas
      this.differentArray[lossIndex].different.gasChargeMaterialDifferent.materialId.next(false);
      this.differentArray[lossIndex].different.gasChargeMaterialDifferent.thermicReactionType.next(false);
      this.differentArray[lossIndex].different.gasChargeMaterialDifferent.specificHeatGas.next(false);
      this.differentArray[lossIndex].different.gasChargeMaterialDifferent.feedRate.next(false);
      this.differentArray[lossIndex].different.gasChargeMaterialDifferent.percentVapor.next(false);
      this.differentArray[lossIndex].different.gasChargeMaterialDifferent.initialTemperature.next(false);
      this.differentArray[lossIndex].different.gasChargeMaterialDifferent.dischargeTemperature.next(false);
      this.differentArray[lossIndex].different.gasChargeMaterialDifferent.specificHeatVapor.next(false);
      this.differentArray[lossIndex].different.gasChargeMaterialDifferent.percentReacted.next(false);
      this.differentArray[lossIndex].different.gasChargeMaterialDifferent.reactionHeat.next(false);
      this.differentArray[lossIndex].different.gasChargeMaterialDifferent.additionalHeat.next(false);
    }
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


