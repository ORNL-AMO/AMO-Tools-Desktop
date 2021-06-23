import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { ChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FlueGasMaterial, GasLoadChargeMaterial, LiquidLoadChargeMaterial, SolidLiquidFlueGasMaterial, SolidLoadChargeMaterial } from '../../../../shared/models/materials';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';
@Component({
  selector: 'app-charge-material-summary',
  templateUrl: './charge-material-summary.component.html',
  styleUrls: ['./charge-material-summary.component.css']
})
export class ChargeMaterialSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  lossData: Array<any>;
  volumeOptions: Array<FlueGasMaterial>;
  massOptions: Array<SolidLiquidFlueGasMaterial>;
  numLosses: number = 0;
  collapse: boolean = true;
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
  constructor(private convertUnitsService: ConvertUnitsService, private cd: ChangeDetectorRef,
    private sqlDbApiService: SqlDbApiService) { }

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

    this.volumeOptions = this.sqlDbApiService.selectGasFlueGasMaterials();
    this.massOptions = this.sqlDbApiService.selectSolidLiquidFlueGasMaterials();
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.modifications) {
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
            });
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
        });
      }
    }
  }

  //function used to check if baseline and modification values are different
  //called from html
  //diffBool is name of corresponding input boolean to indicate different
  checkDiff(baselineVal: any, modificationVal: any, diffBool: string, modIndex: number) {
    if (baselineVal !== modificationVal) {
      //this[diffBool] gets corresponding variable
      //only set true once
      if (this[diffBool][modIndex] !== true) {
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
  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }
  checkSpecificHeatGas(loss: ChargeMaterialSummaryData) {
    if (loss.materialType === 'Gas') {
      let gasOptions: Array<GasLoadChargeMaterial> = this.sqlDbApiService.selectGasLoadChargeMaterials();
      let material = gasOptions.find(val => { return val.substance === loss.materialName; });
      if (material && this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.specificHeatVapor).from('btulbF').to('kJkgC');
        material.specificHeatVapor = this.roundVal(val, 4);
      }
      if (material && material.specificHeatVapor !== loss.specificHeatGas) {
        return true;
      }
    }
    return false;
  }

  checkSpecificHeatSolid(loss: ChargeMaterialSummaryData) {
    if (loss.materialType === 'Solid') {
      let solidOptions: Array<SolidLoadChargeMaterial> = this.sqlDbApiService.selectSolidLoadChargeMaterials();
      let material: SolidLoadChargeMaterial = solidOptions.find(val => { return val.substance === loss.materialName; });
      if (material) {
        if (this.settings.unitsOfMeasure === 'Metric') {
          material.specificHeatSolid = this.convertUnitsService.value(material.specificHeatSolid).from('btulbF').to('kJkgC');
        }
        material.specificHeatSolid = this.roundVal(material.specificHeatSolid, 4);
        if (material.specificHeatSolid !== loss.specificHeatSolid) {
          return true;
        }
      }
    }
    return false;
  }

  checkSpecificHeatLiquid(loss: ChargeMaterialSummaryData) {
    let material: SolidLoadChargeMaterial | LiquidLoadChargeMaterial;
    if (loss.materialType === 'Solid') {
      let solidOptions: Array<SolidLoadChargeMaterial> = this.sqlDbApiService.selectSolidLoadChargeMaterials();
      material = solidOptions.find(val => { return val.substance === loss.materialName; });
    }

    if (loss.materialType === 'Liquid') {
      let liquidOptions: Array<LiquidLoadChargeMaterial> = this.sqlDbApiService.selectLiquidLoadChargeMaterials();
      material = liquidOptions.find(val => { return val.substance === loss.materialName; });
    }
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        material.specificHeatLiquid = this.convertUnitsService.value(material.specificHeatLiquid).from('btulbF').to('kJkgC');
      }
      material.specificHeatLiquid = this.roundVal(material.specificHeatLiquid, 4);

      if (material.specificHeatLiquid !== loss.specificHeatLiquid) {
        return true;
      }
    }
    return false;
  }

  checkMeltingPoint(loss: ChargeMaterialSummaryData) {
    if (loss.materialType === 'Solid') {
      let solidOptions: Array<SolidLoadChargeMaterial> = this.sqlDbApiService.selectSolidLoadChargeMaterials();
      let material: SolidLoadChargeMaterial = solidOptions.find(val => { return val.substance === loss.materialName; });
      if (material) {
        if (this.settings.unitsOfMeasure === 'Metric') {
          material.meltingPoint = this.convertUnitsService.value(material.meltingPoint).from('F').to('C');
        }
        material.meltingPoint = this.roundVal(material.meltingPoint, 4);
        if (material.meltingPoint !== loss.meltingPoint) {
          return true;
        }
      }
    }
    return false;
  }

  checkLatentHeat(loss: ChargeMaterialSummaryData) {
    let material: SolidLoadChargeMaterial | LiquidLoadChargeMaterial;
    if (loss.materialType === 'Solid') {
      let solidOptions: Array<SolidLoadChargeMaterial> = this.sqlDbApiService.selectSolidLoadChargeMaterials();
      material = solidOptions.find(val => { return val.substance === loss.materialName; });
    }

    if (loss.materialType === 'Liquid') {
      let liquidOptions: Array<LiquidLoadChargeMaterial> = this.sqlDbApiService.selectLiquidLoadChargeMaterials();
      material = liquidOptions.find(val => { return val.substance === loss.materialName; });
    }
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        material.latentHeat = this.convertUnitsService.value(material.latentHeat).from('btuLb').to('kJkg');
      }
      material.latentHeat = this.roundVal(material.latentHeat, 4);
      if (material.latentHeat !== loss.latentHeat) {
        return true;
      }
    }
    return false;
  }

  checkVaporizingTemp(loss: ChargeMaterialSummaryData) {
    if (loss.materialType === 'Liquid') {
      let liquidOptions: Array<LiquidLoadChargeMaterial> = this.sqlDbApiService.selectLiquidLoadChargeMaterials();
      let material: LiquidLoadChargeMaterial = liquidOptions.find(val => { return val.substance === loss.materialName; });
      if (material) {
        if (this.settings.unitsOfMeasure === 'Metric') {
          material.vaporizationTemperature = this.convertUnitsService.value(material.vaporizationTemperature).from('F').to('C');
        }
        material.vaporizationTemperature = this.roundVal(material.vaporizationTemperature, 4);
        if (material.vaporizationTemperature !== loss.vaporizingTemperature) {
          return true;
        }
      }
    }
    return false;
  }

  checkSpecificHeatVapor(loss: ChargeMaterialSummaryData) {
    let material: LiquidLoadChargeMaterial;
    //  if (loss.materialType == 'Gas') {
    //    let gasOptions = this.suiteDbService.selectGasLoadChargeMaterials();
    //    material = gasOptions.find(val => { return val.substance == loss.materialName });
    //   }

    if (loss.materialType === 'Liquid') {
      let liquidOptions: Array<LiquidLoadChargeMaterial> = this.sqlDbApiService.selectLiquidLoadChargeMaterials();
      material = liquidOptions.find(val => { return val.substance === loss.materialName; });
    }
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        material.specificHeatVapor = this.convertUnitsService.value(material.specificHeatVapor).from('btulbF').to('kJkgC');
      }
      material.specificHeatVapor = this.roundVal(material.specificHeatVapor, 4);
      if (material.specificHeatVapor !== loss.specificHeatVapor) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getData(loss: ChargeMaterial): ChargeMaterialSummaryData {
    let tmpMaterialName, tmpReactionType, tmpSpecificHeatGas, tmpSpecificHeatVapor,
      tmpFeedRate, tmpPercentVapor, tmpInitialTemp, tmpDischargeTemp, tmpPercentReacted,
      tmpReactionHeat, tmpHeatRequired, tmpSpecificHeatSolid, tmpSpecificHeatLiquid, tmpAdditionalHeat,
      tmpMeltingPoint, tmpWaterContentDischarged, tmpWaterContentCharged, tmpVaporDischargedTemp, tmpLatentHeat, tmpVaporizingTemp, tmpChargeMelted;


    if (loss.chargeMaterialType === 'Gas') {
      let gasOptions: Array<GasLoadChargeMaterial> = this.sqlDbApiService.selectGasLoadChargeMaterials();
      let material: GasLoadChargeMaterial = gasOptions.find(val => { return val.id === loss.gasChargeMaterial.materialId; });
      if (material) { tmpMaterialName = material.substance; }
      tmpReactionType = 'Endothermic';
      if (loss.gasChargeMaterial.thermicReactionType !== 0) {
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
    else if (loss.chargeMaterialType === 'Solid') {
      let gasOptions: Array<SolidLoadChargeMaterial> = this.sqlDbApiService.selectSolidLoadChargeMaterials();
      let material: SolidLoadChargeMaterial = gasOptions.find(val => { return val.id === loss.solidChargeMaterial.materialId; });
      if (material) { tmpMaterialName = material.substance; }
      tmpReactionType = 'Endothermic';
      if (loss.solidChargeMaterial.thermicReactionType !== 0) {
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
    else if (loss.chargeMaterialType === 'Liquid') {
      let gasOptions: Array<LiquidLoadChargeMaterial> = this.sqlDbApiService.selectLiquidLoadChargeMaterials();
      let material: LiquidLoadChargeMaterial = gasOptions.find(val => { return val.id === loss.liquidChargeMaterial.materialId; });
      if (material) { tmpMaterialName = material.substance; }
      tmpReactionType = 'Endothermic';
      if (loss.liquidChargeMaterial.thermicReactionType !== 0) {
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
      tmpLatentHeat = loss.liquidChargeMaterial.latentHeat;
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
    };
    return tmpSummaryData;
  }
}


export interface ChargeMaterialSummaryData {
  name: string;
  materialType: string;
  materialName: string;
  reactionType: string;
  specificHeatGas: number;
  specificHeatVapor: number;
  feedRate: number;
  percentVapor: number;
  initialTemp: number;
  dischargeTemp: number;
  percentReacted: number;
  reactionHeat: number;
  heatRequired: number;
  specificHeatSolid: number;
  specificHeatLiquid: number;
  meltingPoint: number;
  waterContentCharged: number;
  waterContentDischarged: number;
  waterVaporDischargeTemp: number;
  latentHeat: number;
  additionalHeat: number;
  vaporizingTemperature: number;
  chargeMelted: number;
}
