import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PHAST, Losses } from '../../../../shared/models/phast/phast';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { ChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { PhastService } from '../../../phast.service';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-charge-material-summary',
  templateUrl: './charge-material-summary.component.html',
  styleUrls: ['./charge-material-summary.component.css']
})
export class ChargeMaterialSummaryComponent implements OnInit {
  @Input()
  phast: PHAST
  @Input()
  settings: Settings;

  lossData: Array<any>;
  volumeOptions: Array<any>;
  massOptions: Array<any>;
  numLosses: number = 0;
  collapse: boolean = true;

  materialTypeDiff: boolean = false;
  materialNameDiff: boolean = false;
  reactionTypeDiff: boolean = false;
  specificHeatGasDiff: boolean = false;
  feedRateDiff: boolean = false;
  percentVaporDiff: boolean = false;
  initialTempDiff: boolean = false;
  dischargeTempDiff: boolean = false;
  percentReactedDiff: boolean = false;
  reactionHeatDiff: boolean = false;
  heatRequiredDiff: boolean = false;
  specificHeatSolidDiff: boolean = false;
  specificHeatLiquidDiff: boolean = false;
  meltingPointDiff: boolean = false;
  waterContentChargedDiff: boolean = false;
  waterContentDischargedDiff: boolean = false;
  waterVaporDischargeTempDiff: boolean = false;
  latentHeatDiff: boolean = false;
  additionalHeatDiff: boolean = false;
  vaporizingTemperatureDiff: boolean = false;
  chargeMeltedDiff: boolean = false;
  
  constructor(private suiteDbService: SuiteDbService, private phastService: PhastService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.volumeOptions = this.suiteDbService.selectGasFlueGasMaterials();
    this.massOptions = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.losses.chargeMaterials) {
        this.numLosses = this.phast.losses.chargeMaterials.length;
        let index: number = 0;
        this.phast.losses.chargeMaterials.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = this.getData(mod.phast.losses.chargeMaterials[index]);
              modificationData.push(modData);
            })
          }
          this.lossData.push({
            baseline: this.getData(loss),
            modifications: modificationData
          });
          index++;
        })
      }
    }
  }

  //function used to check if baseline and modification values are different
  //called from html
  //diffBool is name of corresponding input boolean to indicate different
  checkDiff(baselineVal: any, modificationVal: any, diffBool: string) {
    if (baselineVal != modificationVal) {
      //this[diffBool] get's corresponding variable
      //only set true once
      if (this[diffBool] != true) {
        //set true/different
        this[diffBool] = true;
        //tell html to detect change
        this.cd.detectChanges();
      }
      return true;
    } else {
      return false;
    }
  }


  toggleCollapse() {
    this.collapse = !this.collapse;
  }


  getData(loss: ChargeMaterial): ChargeMaterialSummaryData {
    let tmpMaterialName, tmpReactionType, tmpSpecificHeatGas, tmpSpecificHeatVapor,
      tmpFeedRate, tmpPercentVapor, tmpInitialTemp, tmpDischargeTemp, tmpPercentReacted,
      tmpReactionHeat, tmpHeatRequired, tmpSpecificHeatSolid, tmpSpecificHeatLiquid, tmpAdditionalHeat,
      tmpMeltingPoint, tmpWaterContentDischarged, tmpWaterContentCharged, tmpVaporDischargedTemp, tmpLatentHeat, tmpVaporizingTemp, tmpChargeMelted;


    if (loss.chargeMaterialType == 'Gas') {
      let gasOptions = this.suiteDbService.selectGasLoadChargeMaterials();
      let material = gasOptions.find(val => {return val.id == loss.gasChargeMaterial.materialId });
      if (material) { tmpMaterialName = material.substance; }
      tmpReactionType = 'Endothermic';
      if (loss.gasChargeMaterial.thermicReactionType != 0) {
        tmpReactionType = 'Exothermic';
      }
      tmpSpecificHeatGas = loss.gasChargeMaterial.specificHeatGas;
      tmpSpecificHeatVapor = loss.gasChargeMaterial.specificHeatVapor;
      tmpFeedRate = loss.gasChargeMaterial.feedRate;
      tmpPercentVapor = loss.gasChargeMaterial.percentVapor;
      tmpInitialTemp = loss.gasChargeMaterial.initialTemperature;
      tmpDischargeTemp = loss.gasChargeMaterial.dischargeTemperature;
      tmpPercentReacted = loss.gasChargeMaterial.percentReacted;
      tmpReactionHeat = loss.gasChargeMaterial.reactionHeat;
      tmpHeatRequired = loss.gasChargeMaterial.heatRequired;
      tmpAdditionalHeat = loss.gasChargeMaterial.additionalHeat;
    }
    else if (loss.chargeMaterialType == 'Solid') {
      let gasOptions = this.suiteDbService.selectSolidLoadChargeMaterials();
      let material = gasOptions.find(val => {return val.id == loss.solidChargeMaterial.materialId });
      if (material) { tmpMaterialName = material.substance; }
      tmpReactionType = 'Endothermic';
      if (loss.solidChargeMaterial.thermicReactionType != 0) {
        tmpReactionType = 'Exothermic';
      }
      tmpSpecificHeatLiquid = loss.solidChargeMaterial.specificHeatLiquid;
      tmpSpecificHeatSolid = loss.solidChargeMaterial.specificHeatSolid;
      tmpFeedRate = loss.solidChargeMaterial.chargeFeedRate;
      tmpInitialTemp = loss.solidChargeMaterial.initialTemperature;
      tmpDischargeTemp = loss.solidChargeMaterial.dischargeTemperature;
      tmpPercentReacted = loss.solidChargeMaterial.chargeReacted;
      tmpChargeMelted = loss.solidChargeMaterial.chargeMelted;
      tmpReactionHeat = loss.solidChargeMaterial.reactionHeat;
      tmpHeatRequired = loss.solidChargeMaterial.heatRequired;
      tmpAdditionalHeat = loss.solidChargeMaterial.additionalHeat;
      tmpLatentHeat = loss.solidChargeMaterial.latentHeat;
      tmpMeltingPoint = loss.solidChargeMaterial.meltingPoint;
      tmpWaterContentCharged = loss.solidChargeMaterial.waterContentCharged;
      tmpWaterContentDischarged = loss.solidChargeMaterial.waterContentDischarged;
      tmpVaporDischargedTemp = loss.solidChargeMaterial.waterVaporDischargeTemperature;
    }
    else if (loss.chargeMaterialType == 'Liquid') {
      let gasOptions = this.suiteDbService.selectLiquidLoadChargeMaterials();
      let material = gasOptions.find(val => {return val.id == loss.liquidChargeMaterial.materialId });
      if (material) { tmpMaterialName = material.substance; }
      tmpReactionType = 'Endothermic';
      if (loss.liquidChargeMaterial.thermicReactionType != 0) {
        tmpReactionType = 'Exothermic';
      }
      tmpSpecificHeatLiquid = loss.liquidChargeMaterial.specificHeatLiquid;
      tmpSpecificHeatVapor = loss.liquidChargeMaterial.specificHeatVapor;
      tmpVaporizingTemp = loss.liquidChargeMaterial.vaporizingTemperature;
      tmpFeedRate = loss.liquidChargeMaterial.chargeFeedRate;
      tmpPercentVapor = loss.liquidChargeMaterial.percentVaporized;
      tmpInitialTemp = loss.liquidChargeMaterial.initialTemperature;
      tmpDischargeTemp = loss.liquidChargeMaterial.dischargeTemperature;
      tmpPercentReacted = loss.liquidChargeMaterial.percentReacted;
      tmpReactionHeat = loss.liquidChargeMaterial.reactionHeat;
      tmpHeatRequired = loss.liquidChargeMaterial.heatRequired;
      tmpAdditionalHeat = loss.liquidChargeMaterial.additionalHeat;
    }


    let tmpSummaryData: ChargeMaterialSummaryData = {
      name: loss.name,
      materialType: loss.chargeMaterialType,
      materialName: tmpMaterialName,
      reactionType: tmpReactionType,
      specificHeatGas: tmpSpecificHeatGas,
      specificHeatVapor: tmpSpecificHeatVapor,
      feedRate: tmpFeedRate,
      percentVapor: tmpPercentVapor,
      initialTemp: tmpInitialTemp,
      dischargeTemp: tmpDischargeTemp,
      percentReacted: tmpPercentReacted,
      reactionHeat: tmpReactionHeat,
      heatRequired: tmpHeatRequired,
      specificHeatSolid: tmpSpecificHeatSolid,
      specificHeatLiquid: tmpSpecificHeatLiquid,
      meltingPoint: tmpMeltingPoint,
      waterContentCharged: tmpWaterContentCharged,
      waterContentDischarged: tmpWaterContentDischarged,
      waterVaporDischargeTemp: tmpVaporDischargedTemp,
      latentHeat: tmpLatentHeat,
      additionalHeat: tmpAdditionalHeat,
      vaporizingTemperature: tmpVaporizingTemp,
      chargeMelted: tmpChargeMelted
    }
    return tmpSummaryData;
  }
}


export interface ChargeMaterialSummaryData {
  name: string,
  materialType: string,
  materialName: string,
  reactionType: string,
  specificHeatGas: number,
  specificHeatVapor: number,
  feedRate: number,
  percentVapor: number,
  initialTemp: number,
  dischargeTemp: number,
  percentReacted: number,
  reactionHeat: number,
  heatRequired: number,
  specificHeatSolid: number,
  specificHeatLiquid: number,
  meltingPoint: number,
  waterContentCharged: number,
  waterContentDischarged: number,
  waterVaporDischargeTemp: number,
  latentHeat: number,
  additionalHeat: number,
  vaporizingTemperature: number,
  chargeMelted: number
}