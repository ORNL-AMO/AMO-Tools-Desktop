import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT, BaseGasDensity } from '../../../../shared/models/fans';

@Component({
  selector: 'app-base-gas-density-summary',
  templateUrl: './base-gas-density-summary.component.html',
  styleUrls: ['./base-gas-density-summary.component.css']
})
export class BaseGasDensitySummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  printView: boolean;

  //this object will hold all BaseGasDensity objects for the assessment
  //we define the baseline and the array of modifications separately for consistency
  baseGasDensity: { baseline: BaseGasDensity, modifications: Array<BaseGasDensity> };

  collapse: boolean = true;
  numMods: number = 0;


  dryBulbTempDiff: Array<boolean>;
  staticPressureDiff: Array<boolean>;
  barometricPressureDiff: Array<boolean>;
  gasDensityDiff: Array<boolean>;
  gasTypeDiff: Array<boolean>;
  conditionLocationDiff: Array<boolean>;
  // specificGravityDiff: Array<boolean>;
  inputTypeDiff: Array<boolean>;
  dewPointDiff: Array<boolean>;
  relativeHumidityDiff: Array<boolean>;
  wetBulbTempDiff: Array<boolean>;
  specificHeatGasDiff: Array<boolean>;
  specificHeatRatioDiff: Array<boolean>;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.dryBulbTempDiff = new Array<boolean>();
    this.staticPressureDiff = new Array<boolean>();
    this.barometricPressureDiff = new Array<boolean>();
    this.gasDensityDiff = new Array<boolean>();
    this.gasTypeDiff = new Array<boolean>();
    this.conditionLocationDiff = new Array<boolean>();
    // this.specificGravityDiff = new Array<boolean>();
    this.inputTypeDiff = new Array<boolean>();
    this.dewPointDiff = new Array<boolean>();
    this.relativeHumidityDiff = new Array<boolean>();
    this.wetBulbTempDiff = new Array<boolean>();
    this.specificHeatGasDiff = new Array<boolean>();
    this.specificHeatRatioDiff = new Array<boolean>();

    if (this.fsat.baseGasDensity) {

      let mods = new Array<BaseGasDensity>();

      if (this.fsat.modifications) {

        this.numMods = this.fsat.modifications.length;
        // this.baseGasDensity.modifications = new Array<BaseGasDensity>();

        for (let i = 0; i < this.fsat.modifications.length; i++) {
          if (this.fsat.modifications[i].fsat.baseGasDensity) {
            mods.push(this.fsat.modifications[i].fsat.baseGasDensity);
          }
        }



        this.dryBulbTempDiff.push(false);
        this.staticPressureDiff.push(false);
        this.barometricPressureDiff.push(false);
        this.gasDensityDiff.push(false);
        this.gasTypeDiff.push(false);
        this.conditionLocationDiff.push(false);
        // this.specificGravityDiff.push(false);
        this.inputTypeDiff.push(false);
        this.dewPointDiff.push(false);
        this.relativeHumidityDiff.push(false);
        this.wetBulbTempDiff.push(false);
        this.specificHeatGasDiff.push(false);
        this.specificHeatRatioDiff.push(false);
      }

      this.baseGasDensity = {
        baseline: this.fsat.baseGasDensity,
        modifications: mods
      };
    }
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
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

  formatInputType(type: string): string {
    if (type === 'relativeHumidity') {
      return "Relative Humidity";
    }
    else if (type === 'dewPoint') {
      return "Dew Point";
    }
    else if (type === 'wetBulb') {
      return "Wet Bulb";
    }
    else if (type === 'custom') {
      return "Custom Density";
    }
    else {
      return type;
    }
  }
}
