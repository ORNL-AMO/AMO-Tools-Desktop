import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-other-summary',
  templateUrl: './other-summary.component.html',
  styleUrls: ['./other-summary.component.css']
})
export class OtherSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;

  numLosses: number = 0;
  collapse: boolean = true;
  lossData: Array<any>;

  openingTypeDiff: Array<boolean>;
  heatLossDiff: Array<boolean>;
  numMods: number = 0;
  constructor(private suiteDbService: SuiteDbService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.openingTypeDiff = new Array();
    this.heatLossDiff = new Array();

    this.lossData = new Array();
    if (this.phast.losses) {
      if(this.phast.modifications){
        this.numMods = this.phast.modifications.length;
      }
      if (this.phast.losses.otherLosses) {
        this.numLosses = this.phast.losses.otherLosses.length;
        let index = 0;
        this.phast.losses.otherLosses.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.otherLosses[index];
              modificationData.push(modData);
            })
          }
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          })
          //initialize array values for every defined loss
          this.openingTypeDiff.push(false);
          this.heatLossDiff.push(false);
          //index +1 for next loss
          index++;
        })
      }
    }
  }

  //function used to check if baseline and modification values are different
  //called from html
  //diffBool is name of corresponding input boolean to indicate different
  checkDiff(baselineVal: any, modificationVal: any, diffBool: string, modIndex: number) {
    if (baselineVal != modificationVal) {
      //this[diffBool] get's corresponding variable
      //only set true once
      if (this[diffBool][modIndex] != true) {
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
