import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import {FanMotor, FSAT} from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';
import * as _ from 'lodash';

@Component({
    selector: 'app-fan-motor-summary',
    templateUrl: './fan-motor-summary.component.html',
    styleUrls: ['./fan-motor-summary.component.css'],
    standalone: false
})
export class FanMotorSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  printView: boolean;

  //this object will hold all FanMotor objects for the assessment
  //we define the baseline and the array of modifications separately for consistency
  fanMotor: { baseline: FanMotor, modifications: Array<FanMotor> };

  collapse: boolean = true;
  numMods: number = 0;

  lineFrequencyDiff: Array<boolean>;
  motorRatedPowerDiff: Array<boolean>;
  motorRpmDiff: Array<boolean>;
  efficiencyClassDiff: Array<boolean>;
  specifiedEfficiencyDiff: Array<boolean>;
  motorRatedVoltageDiff: Array<boolean>;
  fullLoadAmpsDiff: Array<boolean>;
  //optimizeDiff: Array<boolean>;
  //sizeMarginDiff: Array<boolean>;

  efficiencyClasses: Array<{ value: number, display: string }>;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.efficiencyClasses = motorEfficiencyConstants;

    this.lineFrequencyDiff = new Array<boolean>();
    this.motorRatedPowerDiff = new Array<boolean>();
    this.motorRpmDiff = new Array<boolean>();
    this.efficiencyClassDiff = new Array<boolean>();
    this.specifiedEfficiencyDiff = new Array<boolean>();
    this.motorRatedVoltageDiff = new Array<boolean>();
    this.fullLoadAmpsDiff = new Array<boolean>();
    //this.optimizeDiff = new Array<boolean>();
    //this.sizeMarginDiff = new Array<boolean>();
  
    if (this.fsat.fanMotor) {
      let mods = new Array<FanMotor>();
      if (this.fsat.modifications) {
        this.numMods = this.fsat.modifications.length;
        for (let i = 0; i < this.fsat.modifications.length; i++) {
          if (this.fsat.modifications[i].fsat.fanMotor) {
            mods.push(this.fsat.modifications[i].fsat.fanMotor);
          }
        }
        this.lineFrequencyDiff.push(false);
        this.motorRatedPowerDiff.push(false);
        this.motorRpmDiff.push(false);
        this.efficiencyClassDiff.push(false);
        this.specifiedEfficiencyDiff.push(false);
        this.motorRatedVoltageDiff.push(false);
        this.fullLoadAmpsDiff.push(false);
        //this.optimizeDiff.push(false);
        //this.sizeMarginDiff.push(false);
      }
      this.fanMotor = {
        baseline: this.fsat.fanMotor,
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

  getEfficiencyClass(classEnum: number): string {
    let efficiencyClass: { value: number, display: string } = _.find(this.efficiencyClasses, (val) => { return val.value === classEnum; });
    if (efficiencyClass) {
      return efficiencyClass.display;
    } else {
      return;
    }
  }
}
