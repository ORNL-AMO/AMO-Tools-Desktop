import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-opening-summary',
    templateUrl: './opening-summary.component.html',
    styleUrls: ['./opening-summary.component.css'],
    standalone: false
})
export class OpeningSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  numLosses: number = 0;
  collapse: boolean = true;
  lossData: Array<any>;

  //bool arrays for formatting
  openingTypeDiff: Array<boolean>;
  numberOfOpeningsDiff: Array<boolean>;
  thicknessDiff: Array<boolean>;
  lengthOfOpeningDiff: Array<boolean>;
  heightOfOpeningDiff: Array<boolean>;
  openingTotalAreaDiff: Array<boolean>;
  viewFactorDiff: Array<boolean>;
  insideTemperatureDiff: Array<boolean>;
  ambientTemperatureDiff: Array<boolean>;
  emissivityDiff: Array<boolean>;
  percentTimeOpenDiff: Array<boolean>;
  numMods: number = 0;
  constructor(private cd: ChangeDetectorRef) { }

  //debug trying something
  ngOnInit() {
    //init bool arrays
    this.openingTypeDiff = new Array();
    this.numberOfOpeningsDiff = new Array();
    this.thicknessDiff = new Array();
    this.lengthOfOpeningDiff = new Array();
    this.heightOfOpeningDiff = new Array();
    this.openingTotalAreaDiff = new Array();
    this.viewFactorDiff = new Array();
    this.insideTemperatureDiff = new Array();
    this.ambientTemperatureDiff = new Array();
    this.emissivityDiff = new Array();
    this.percentTimeOpenDiff = new Array();

    this.lossData = new Array();

    if (this.phast.losses) {
      if (this.phast.modifications) {
        this.numMods = this.phast.modifications.length;
      }
      if (this.phast.losses.openingLosses) {
        this.numLosses = this.phast.losses.openingLosses.length;
        let index = 0;
        this.phast.losses.openingLosses.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.openingLosses[index];
              modificationData.push(modData);
            });
          }
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          });
          //initialize array values for every defined loss
          this.openingTypeDiff.push(false);
          this.numberOfOpeningsDiff.push(false);
          this.thicknessDiff.push(false);
          this.lengthOfOpeningDiff.push(false);
          this.heightOfOpeningDiff.push(false);
          this.openingTotalAreaDiff.push(false);
          this.viewFactorDiff.push(false);
          this.insideTemperatureDiff.push(false);
          this.ambientTemperatureDiff.push(false);
          this.emissivityDiff.push(false);
          this.percentTimeOpenDiff.push(false);
          //index +1 for the next loss
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

  //TODO: Calculate Area for Total Area
}
