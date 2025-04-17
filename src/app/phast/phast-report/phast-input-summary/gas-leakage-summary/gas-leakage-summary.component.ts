import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
@Component({
    selector: 'app-gas-leakage-summary',
    templateUrl: './gas-leakage-summary.component.html',
    styleUrls: ['./gas-leakage-summary.component.css'],
    standalone: false
})
export class GasLeakageSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  numLosses: number = 0;
  collapse: boolean = true;
  lossData: Array<any>;

  draftPressureDiff: Array<boolean>;
  openingAreaDiff: Array<boolean>;
  leakageGasTemperatureDiff: Array<boolean>;
  specificGravityDiff: Array<boolean>;
  ambientTemperatureDiff: Array<boolean>;
  numMods: number = 0;
  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.draftPressureDiff = new Array();
    this.openingAreaDiff = new Array();
    this.leakageGasTemperatureDiff = new Array();
    this.specificGravityDiff = new Array();
    this.ambientTemperatureDiff = new Array();

    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.modifications) {
        this.numMods = this.phast.modifications.length;
      }
      if (this.phast.losses.leakageLosses) {
        this.numLosses = this.phast.losses.leakageLosses.length;
        let index = 0;
        this.phast.losses.leakageLosses.forEach(loss => {
          const modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              const modData = mod.phast.losses.leakageLosses[index];
              modificationData.push(modData);
            });
          }
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          });

          //debug
          this.draftPressureDiff.push(false);
          this.openingAreaDiff.push(false);
          this.leakageGasTemperatureDiff.push(false);
          this.specificGravityDiff.push(false);
          this.ambientTemperatureDiff.push(false);

          //real version
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

}
