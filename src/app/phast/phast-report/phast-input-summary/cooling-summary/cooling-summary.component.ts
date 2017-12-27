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

  coolingTypeDiff: boolean = false;
  specificHeatDiff: boolean = false;
  flowRateDiff: boolean = false;
  densityDiff: boolean = false;
  initialTemperatureDiff: boolean = false;
  outletTemperatureDiff: boolean = false;
  correctionFactorDiff: boolean = false;

  constructor(private suiteDbService: SuiteDbService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.lossData = new Array();
    if (this.phast.losses) {
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

  getLossData(loss: CoolingLoss): CoolingLossData{
    let tmpFlowRate, tmpDensity, tmpInitialTemp, tmpOutletTemp, tmpSpecificHeat, tmpCorrectionFactor;
    if(loss.coolingLossType == 'Gas'){
      tmpFlowRate = loss.gasCoolingLoss.flowRate;
      tmpDensity = loss.gasCoolingLoss.gasDensity;
      tmpInitialTemp = loss.gasCoolingLoss.initialTemperature;
      tmpOutletTemp = loss.gasCoolingLoss.finalTemperature;
      tmpSpecificHeat = loss.gasCoolingLoss.specificHeat;
      tmpCorrectionFactor = loss.gasCoolingLoss.correctionFactor;
    } else if(loss.coolingLossType == 'Liquid'){
      tmpFlowRate = loss.liquidCoolingLoss.flowRate;
      tmpDensity = loss.liquidCoolingLoss.density;
      tmpInitialTemp = loss.liquidCoolingLoss.initialTemperature;
      tmpOutletTemp = loss.liquidCoolingLoss.outletTemperature;
      tmpSpecificHeat = loss.liquidCoolingLoss.specificHeat;
      tmpCorrectionFactor = loss.liquidCoolingLoss.correctionFactor;
    }      
    let tmpCoolingLossData: CoolingLossData = {
      name: loss.name,
      coolingType: loss.coolingLossType,
      flowRate: tmpFlowRate,
      density: tmpDensity,
      initialTemperature: tmpInitialTemp,
      outletTemperature: tmpOutletTemp,
      specificHeat: tmpSpecificHeat,
      correctionFactor: tmpCorrectionFactor
    }
    return tmpCoolingLossData;
  }
}


export interface CoolingLossData{
  name: string,
  coolingType: string,
  flowRate: number,
  density: number,
  initialTemperature: number,
  outletTemperature: number,
  specificHeat: number,
  correctionFactor: number
}
