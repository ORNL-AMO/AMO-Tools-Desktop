import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { SSMTInputs, SsmtValid } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-operations-summary',
    templateUrl: './operations-summary.component.html',
    styleUrls: ['./operations-summary.component.css'],
    standalone: false
})
export class OperationsSummaryComponent implements OnInit {
  @Input()
  baselineInputData: SSMTInputs;
  @Input()
  modificationInputData: Array<{ name: string, inputData: SSMTInputs, valid: SsmtValid }>;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  collapse: boolean = true;
  numMods: number = 0;

  operatingHoursDiff: Array<boolean>;
  fuelCostDiff: Array<boolean>;
  electricityCostDiff: Array<boolean>;
  makeUpWaterCostDiff: Array<boolean>;
  makeUpWaterTempDiff: Array<boolean>;
  totalEmissionOutputRateDiff: Array<boolean>;
  totalFuelEmissionOutputRateDiff: Array<boolean>;
  sitePowerImportDiff: Array<boolean>;
  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.operatingHoursDiff = new Array<boolean>();
    this.fuelCostDiff = new Array<boolean>();
    this.electricityCostDiff = new Array<boolean>();
    this.makeUpWaterCostDiff = new Array<boolean>();
    this.makeUpWaterTempDiff = new Array<boolean>();
    this.totalFuelEmissionOutputRateDiff = new Array<boolean>();
    this.totalEmissionOutputRateDiff = new Array<boolean>();
    this.sitePowerImportDiff = new Array<boolean>();
    if (this.modificationInputData) {
      this.numMods = this.modificationInputData.length;
      this.modificationInputData.forEach(mod => {
        this.operatingHoursDiff.push(false);
        this.fuelCostDiff.push(false);
        this.electricityCostDiff.push(false);
        this.makeUpWaterCostDiff.push(false);
        this.totalEmissionOutputRateDiff.push(false);
        this.totalFuelEmissionOutputRateDiff.push(false);
        this.makeUpWaterTempDiff.push(false);
        this.sitePowerImportDiff.push(false);
      });
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
