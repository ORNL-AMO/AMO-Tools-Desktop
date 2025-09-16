import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
@Component({
    selector: 'app-extended-surface-summary',
    templateUrl: './extended-surface-summary.component.html',
    styleUrls: ['./extended-surface-summary.component.css'],
    standalone: false
})
export class ExtendedSurfaceSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  lossData: Array<any>;
  numLosses: number = 0;
  collapse: boolean = true;

  surfaceAreaDiff: Array<boolean>;
  surfaceTemperatureDiff: Array<boolean>;
  ambientTemperatureDiff: Array<boolean>;
  surfaceEmissivityDiff: Array<boolean>;
  numMods: number = 0;
  
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.surfaceAreaDiff = new Array();
    this.surfaceTemperatureDiff = new Array();
    this.ambientTemperatureDiff = new Array();
    this.surfaceEmissivityDiff = new Array();

    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.modifications) {
        this.numMods = this.phast.modifications.length;
      }
      if (this.phast.losses.extendedSurfaces) {
        this.numLosses = this.phast.losses.extendedSurfaces.length;
        let index: number = 0;
        this.phast.losses.extendedSurfaces.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.extendedSurfaces[index];
              modificationData.push(modData);
            });
          }
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          });
          //initialize array values for every defined loss
          this.surfaceAreaDiff.push(false);
          this.surfaceTemperatureDiff.push(false);
          this.ambientTemperatureDiff.push(false);
          this.surfaceEmissivityDiff.push(false);
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
