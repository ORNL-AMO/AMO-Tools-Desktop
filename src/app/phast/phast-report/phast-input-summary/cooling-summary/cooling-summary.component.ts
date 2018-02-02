import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { CoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-cooling-summary',
  templateUrl: './cooling-summary.component.html',
  styleUrls: ['./cooling-summary.component.css']
})
export class CoolingSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  numLosses: number = 0;
  collapse: boolean = true;
  lossData: Array<any>;

  coolingTypeDiff: Array<boolean>;
  nameDiff: Array<boolean>;
  specificHeatDiff: Array<boolean>;
  flowRateDiff: Array<boolean>;
  densityDiff: Array<boolean>;
  initialTemperatureDiff: Array<boolean>;
  outletTemperatureDiff: Array<boolean>;
  correctionFactorDiff: Array<boolean>;
  numMods: number = 0;
  constructor(private suiteDbService: SuiteDbService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.coolingTypeDiff = new Array();
    this.nameDiff = new Array();
    this.specificHeatDiff = new Array();
    this.flowRateDiff = new Array();
    this.densityDiff = new Array();
    this.initialTemperatureDiff = new Array();
    this.outletTemperatureDiff = new Array();
    this.correctionFactorDiff = new Array();

    this.lossData = new Array();
    if (this.phast.losses) {
      if(this.phast.modifications){
        this.numMods = this.phast.modifications.length;
      }
      if (this.phast.losses.coolingLosses) {
        this.numLosses = this.phast.losses.coolingLosses.length;
        let index = 0;
        this.phast.losses.coolingLosses.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = this.getLossData(mod.phast.losses.coolingLosses[index]);
              modificationData.push(modData);
            })
          }
          this.lossData.push({
            baseline: this.getLossData(loss),
            modifications: modificationData
          })
          //initialize array values for every defined loss
          this.coolingTypeDiff.push(false);
          this.nameDiff.push(false);
          this.specificHeatDiff.push(false);
          this.flowRateDiff.push(false);
          this.densityDiff.push(false);
          this.initialTemperatureDiff.push(false);
          this.outletTemperatureDiff.push(false);
          this.correctionFactorDiff.push(false);
          //index +1 for next loss
          index++;
        })
      }
    }
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
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

  getLossData(loss: CoolingLoss): CoolingLossData {
    let tmpFlowRate, tmpDensity, tmpInitialTemp, tmpOutletTemp, tmpSpecificHeat, tmpCorrectionFactor;
    if (loss.coolingLossType == 'Gas') {
      tmpFlowRate = loss.gasCoolingLoss.flowRate;
      tmpDensity = loss.gasCoolingLoss.gasDensity;
      tmpInitialTemp = loss.gasCoolingLoss.initialTemperature;
      tmpOutletTemp = loss.gasCoolingLoss.finalTemperature;
      tmpSpecificHeat = loss.gasCoolingLoss.specificHeat;
      tmpCorrectionFactor = loss.gasCoolingLoss.correctionFactor;
    } else if (loss.coolingLossType == 'Liquid') {
      tmpFlowRate = loss.liquidCoolingLoss.flowRate;
      tmpDensity = loss.liquidCoolingLoss.density;
      tmpInitialTemp = loss.liquidCoolingLoss.initialTemperature;
      tmpOutletTemp = loss.liquidCoolingLoss.outletTemperature;
      tmpSpecificHeat = loss.liquidCoolingLoss.specificHeat;
      tmpCorrectionFactor = loss.liquidCoolingLoss.correctionFactor;
    }
    let tmpCoolingLossData: CoolingLossData = {
      name: loss.name,
      coolingMedium: loss.coolingMedium,
      coolingType: loss.coolingLossType,
      flowRate: tmpFlowRate,
      density: tmpDensity,
      initialTemperature: tmpInitialTemp,
      outletTemperature: tmpOutletTemp,
      specificHeat: tmpSpecificHeat,
      correctionFactor: tmpCorrectionFactor
    };
    return tmpCoolingLossData;
  }
}


export interface CoolingLossData {
  name: string,
  coolingMedium: string,
  coolingType: string,
  flowRate: number,
  density: number,
  initialTemperature: number,
  outletTemperature: number,
  specificHeat: number,
  correctionFactor: number
}
