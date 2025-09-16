import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
@Component({
    selector: 'app-exhaust-gas-summary',
    templateUrl: './exhaust-gas-summary.component.html',
    styleUrls: ['./exhaust-gas-summary.component.css'],
    standalone: false
})
export class ExhaustGasSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  numLosses: number = 0;
  collapse: boolean = true;
  lossData: Array<any>;

  offGasTempDiff: Array<boolean>;
  CODiff: Array<boolean>;
  H2Diff: Array<boolean>;
  combustibleGasesDiff: Array<boolean>;
  vfrDiff: Array<boolean>;
  dustLoadingDiff: Array<boolean>;

  numMods: number = 0;
  
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.offGasTempDiff = new Array();
    this.CODiff = new Array();
    this.H2Diff = new Array();
    this.combustibleGasesDiff = new Array();
    this.vfrDiff = new Array();
    this.dustLoadingDiff = new Array();

    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.modifications) {
        this.numMods = this.phast.modifications.length;
      }
      if (this.phast.losses.exhaustGasEAF) {
        this.numLosses = this.phast.losses.exhaustGasEAF.length;
        let index = 0;
        this.phast.losses.exhaustGasEAF.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.exhaustGasEAF[index];
              modificationData.push(modData);
            });
          }
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          });
          //initialize array values for every defined loss
          this.offGasTempDiff.push(false);
          this.CODiff.push(false);
          this.H2Diff.push(false);
          this.combustibleGasesDiff.push(false);
          this.vfrDiff.push(false);
          this.dustLoadingDiff.push(false);
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

  
  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
  
}
