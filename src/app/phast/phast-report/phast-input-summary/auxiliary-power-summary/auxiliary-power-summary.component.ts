import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-auxiliary-power-summary',
    templateUrl: './auxiliary-power-summary.component.html',
    styleUrls: ['./auxiliary-power-summary.component.css'],
    standalone: false
})
export class AuxiliaryPowerSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  numLosses: number = 0;
  collapse: boolean = true;
  lossData: Array<any>;

  motorPhaseDiff: boolean = false;
  supplyVoltageDiff: boolean = false;
  avgCurrentDiff: boolean = false;
  powerFactorDiff: boolean = false;
  operatingTimeDiff: boolean = false;
  numMods: number = 0;
  
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.modifications) {
        this.numMods = this.phast.modifications.length;
      }
      if (this.phast.losses.auxiliaryPowerLosses) {
        this.numLosses = this.phast.losses.auxiliaryPowerLosses.length;
        let index = 0;
        this.phast.losses.auxiliaryPowerLosses.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.auxiliaryPowerLosses[index];
              modificationData.push(modData);
            });
          }
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          });
          index++;
        });
      }
    }
  }


  //function used to check if baseline and modification values are different
  //called from html
  //diffBool is name of corresponding input boolean to indicate different
  checkDiff(baselineVal: any, modificationVal: any, diffBool: string) {
    if (baselineVal !== modificationVal) {
      //this[diffBool] gets corresponding variable
      //only set true once
      if (this[diffBool] !== true) {
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

  toggleCollapse() {
    this.collapse = !this.collapse;
  }
  
  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
  
}
