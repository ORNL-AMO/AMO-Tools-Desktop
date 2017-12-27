import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-opening-summary',
  templateUrl: './opening-summary.component.html',
  styleUrls: ['./opening-summary.component.css']
})
export class OpeningSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  
  numLosses: number = 0;
  collapse: boolean = true;
  lossData: Array<any>;

  openingTypeDiff: boolean = false;
  numberOfOpeningsDiff: boolean = false;
  thicknessDiff: boolean = false;
  lengthOfOpeningDiff: boolean = false;
  heightOfOpeningDiff: boolean = false;
  openingTotalAreaDiff: boolean = false;
  viewFactorDiff: boolean = false;
  insideTemperatureDiff: boolean = false;
  ambientTemperatureDiff: boolean = false;
  emissivityDiff: boolean = false;
  percentTimeOpenDiff: boolean = false;

  constructor(private suiteDbService: SuiteDbService, private cd: ChangeDetectorRef) { }

  ngOnInit() {    
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.losses.openingLosses) {
        this.numLosses = this.phast.losses.openingLosses.length;
        let index = 0;
        this.phast.losses.openingLosses.forEach(loss => {
          let modificationData = new Array();
          if(this.phast.modifications){
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.openingLosses[index];
              modificationData.push(modData);
            })
          }
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          })
          index++;
        })
      }
    }
  }

  //function used to check if baseline and modification values are different
  //called from html
  //diffBool is name of corresponding input boolean to indicate different
  checkDiff(baselineVal: any, modificationVal: any, diffBool: string) {
    if (baselineVal != modificationVal) {
      //this[diffBool] get's corresponding variable
      //only set true once
      if (this[diffBool] != true) {
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

  //TODO: Calculate Area for Total Area
}
