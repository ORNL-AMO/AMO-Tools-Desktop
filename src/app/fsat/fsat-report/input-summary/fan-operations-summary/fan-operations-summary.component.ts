import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT, FsatOperations } from '../../../../shared/models/fans';


@Component({
    selector: 'app-fan-operations-summary',
    templateUrl: './fan-operations-summary.component.html',
    styleUrls: ['./fan-operations-summary.component.css'],
    standalone: false
})
export class FanOperationsSummaryComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  printView: boolean;

  fsatOperations: { baseline: FsatOperations, modifications: Array<FsatOperations> };

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any; 


  collapse: boolean = true;
  numMods: number = 0;

  operatingHoursDiff: Array<boolean>;
  costDiff: Array<boolean>;
  totalEmissionOutputRateDiff: Array<boolean>;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.operatingHoursDiff = new Array<boolean>();
    this.costDiff = new Array<boolean>();
    this.totalEmissionOutputRateDiff = new Array<boolean>();

    if (this.fsat.fsatOperations) {
      let mods = new Array<FsatOperations>();
      if (this.fsat.modifications) {
        this.numMods = this.fsat.modifications.length;
        for (let i = 0; i < this.fsat.modifications.length; i++) {
          if (this.fsat.modifications[i].fsat.fsatOperations) {
            mods.push(this.fsat.modifications[i].fsat.fsatOperations);
          }
          this.operatingHoursDiff.push(false);
          this.costDiff.push(false);
          this.totalEmissionOutputRateDiff.push(false);
        }
        this.fsatOperations = {
          baseline: this.fsat.fsatOperations,
          modifications: mods
        };
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
