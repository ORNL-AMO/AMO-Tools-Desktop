import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT, FanSetup } from '../../../../shared/models/fans';
import { FanTypes, Drives } from '../../../fanOptions';
import * as _ from 'lodash';

@Component({
    selector: 'app-fan-setup-summary',
    templateUrl: './fan-setup-summary.component.html',
    styleUrls: ['./fan-setup-summary.component.css'],
    standalone: false
})
export class FanSetupSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  printView: boolean;

  //this object will hold all FanSetup objects for the assessment
  //we define the baseline and the array of modifications separately for consistency
  fanSetup: { baseline: FanSetup, modifications: Array<FanSetup> };

  collapse: boolean = true;
  numMods: number = 0;

  fanTypeDiff = new Array<boolean>();
  fanSpeedDiff = new Array<boolean>();
  driveDiff = new Array<boolean>();
  // specifiedDriveEfficiencyDiff = new Array<boolean>();
  fanEfficiencyDiff = new Array<boolean>();
  fanTypes: Array<{ display: string, value: number }>;
  drives: Array<{ display: string, value: number }>;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.fanTypes = FanTypes;
    this.drives = Drives;
    this.fanTypeDiff = new Array<boolean>();
    this.fanSpeedDiff = new Array<boolean>();
    this.driveDiff = new Array<boolean>();
    //this.specifiedDriveEfficiencyDiff = new Array<boolean>();
    this.fanEfficiencyDiff = new Array<boolean>();

    if (this.fsat.fanSetup) {
      let mods = new Array<FanSetup>();
      if (this.fsat.modifications) {
        this.numMods = this.fsat.modifications.length;
        for (let i = 0; i < this.fsat.modifications.length; i++) {
          if (this.fsat.modifications[i].fsat.fanSetup) {
            // fanSetup changes
            mods.push(this.fsat.modifications[i].fsat.fanSetup);
          }
        }
        this.fanTypeDiff.push(false);
        this.fanSpeedDiff.push(false);
        this.driveDiff.push(false);
        // this.specifiedDriveEfficiencyDiff.push(false)
        this.fanEfficiencyDiff.push(false);
      }
      this.fanSetup = {
        baseline: this.fsat.fanSetup,
        modifications: mods
      };
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


  getFanType(fanTypeEnum: number): string {
    let fanType: { value: number, display: string } = _.find(this.fanTypes, (val) => { return val.value === fanTypeEnum; });
    if (fanType) {
      return fanType.display;
    } else {
      return;
    }
  }

  getDriveType(driveTypeEnum: number): string {
    let driveType: { value: number, display: string } = _.find(this.drives, (val) => { return val.value === driveTypeEnum; });
    if (driveType) {
      return driveType.display;
    } else {
      return;
    }
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
}
