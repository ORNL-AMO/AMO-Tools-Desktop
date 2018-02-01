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

  //real version
  // materialTypeDiff: boolean = false;
  // materialNameDiff: boolean = false;
  // reactionTypeDiff: boolean = false;
  // specificHeatGasDiff: boolean = false;
  // feedRateDiff: boolean = false;
  // percentVaporDiff: boolean = false;
  // initialTempDiff: boolean = false;
  // dischargeTempDiff: boolean = false;
  // percentReactedDiff: boolean = false;
  // reactionHeatDiff: boolean = false;
  // heatRequiredDiff: boolean = false;
  // specificHeatSolidDiff: boolean = false;
  // specificHeatLiquidDiff: boolean = false;
  // meltingPointDiff: boolean = false;
  // waterContentChargedDiff: boolean = false;
  // waterContentDischargedDiff: boolean = false;
  // waterVaporDischargeTempDiff: boolean = false;
  // latentHeatDiff: boolean = false;
  // additionalHeatDiff: boolean = false;
  // vaporizingTemperatureDiff: boolean = false;
  // chargeMeltedDiff: boolean = false;

  //debug
  materialTypeDiff: Array<boolean>;
  materialNameDiff: Array<boolean>;
  reactionTypeDiff: Array<boolean>;
  specificHeatGasDiff: Array<boolean>;
  feedRateDiff: Array<boolean>;
  percentVaporDiff: Array<boolean>;
  initialTempDiff: Array<boolean>;
  dischargeTempDiff: Array<boolean>;
  percentReactedDiff: Array<boolean>;
  reactionHeatDiff: Array<boolean>;
  heatRequiredDiff: Array<boolean>;
  specificHeatSolidDiff: Array<boolean>;
  specificHeatLiquidDiff: Array<boolean>;
  meltingPointDiff: Array<boolean>;
  waterContentChargedDiff: Array<boolean>;
  waterContentDischargedDiff: Array<boolean>;
  waterVaporDischargeTempDiff: Array<boolean>;
  latentHeatDiff: Array<boolean>;
  additionalHeatDiff: Array<boolean>;
  vaporizingTemperatureDiff: Array<boolean>;
  chargeMeltedDiff: Array<boolean>;
  numMods: number = 0;
  constructor(private suiteDbService: SuiteDbService, private phastService: PhastService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.materialTypeDiff = new Array();
    this.materialNameDiff = new Array();
    this.reactionTypeDiff = new Array();
    this.specificHeatGasDiff = new Array();
    this.feedRateDiff = new Array();
    this.percentVaporDiff = new Array();
    this.initialTempDiff = new Array();
    this.dischargeTempDiff = new Array();
    this.percentReactedDiff = new Array();
    this.reactionHeatDiff = new Array();
    this.heatRequiredDiff = new Array();
    this.specificHeatSolidDiff = new Array();
    this.specificHeatLiquidDiff = new Array();
    this.meltingPointDiff = new Array();
    this.waterContentChargedDiff = new Array();
    this.waterContentDischargedDiff = new Array();
    this.waterVaporDischargeTempDiff = new Array();
    this.latentHeatDiff = new Array();
    this.additionalHeatDiff = new Array();
    this.vaporizingTemperatureDiff = new Array();
    this.chargeMeltedDiff = new Array();

    this.volumeOptions = this.suiteDbService.selectGasFlueGasMaterials();
    this.massOptions = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    this.lossData = new Array();
    if (this.phast.losses) {
      if(this.phast.modifications){
        this.numMods = this.phast.modifications.length;
      }
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
          //initialize array values for every defined loss
          this.materialTypeDiff.push(false);
          this.materialNameDiff.push(false);
          this.reactionTypeDiff.push(false);
          this.specificHeatGasDiff.push(false);
          this.feedRateDiff.push(false);
          this.percentVaporDiff.push(false);
          this.initialTempDiff.push(false);
          this.dischargeTempDiff.push(false);
          this.percentReactedDiff.push(false);
          this.reactionHeatDiff.push(false);
          this.heatRequiredDiff.push(false);
          this.specificHeatSolidDiff.push(false);
          this.specificHeatLiquidDiff.push(false);
          this.meltingPointDiff.push(false);
          this.waterContentChargedDiff.push(false);
          this.waterContentDischargedDiff.push(false);
          this.waterVaporDischargeTempDiff.push(false);
          this.latentHeatDiff.push(false);
          this.additionalHeatDiff.push(false);
          this.vaporizingTemperatureDiff.push(false);
          this.chargeMeltedDiff.push(false);
          //index +1 for next loss
          index++;
        })
      }
    }
  }

  //function used to check if baseline and modification values are different
  //called from html
  //diffBool is name of corresponding input boolean to indicate different
  checkDiff(baselineVal: any, modificationVal: any, diffBool: string, modIndex: number) {
    if (baselineVal != modificationVal) {
      //this[diffBool] get's corresponding variable
      //only set true once
      if (this[diffBool][modIndex] != true) {
        //set true/different
        this[diffBool][modIndex] = true;
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
      let material = gasOptions.find(val => { return val.id == loss.gasChargeMaterial.materialId });
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
      let material = gasOptions.find(val => { return val.id == loss.solidChargeMaterial.materialId });
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
      let material = gasOptions.find(val => { return val.id == loss.liquidChargeMaterial.materialId });
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